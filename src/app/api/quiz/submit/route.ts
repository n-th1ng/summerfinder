import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { getOrCreateSessionId, createSessionCookie } from '@/lib/session';
import type { QuizAnswers } from '@/lib/quiz-config';
import { rankActivities, type ScoredActivity } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: QuizAnswers & { userCity?: string; userName?: string; userLocation?: string };
  try {
    body = await req.json();
  } catch {
    return fail('Invalid JSON');
  }

  const required: (keyof QuizAnswers)[] = [
    'ageGroup',
    'location',
    'timeCommitment',
    'budget',
    'preference',
    'mood',
    'skillLevel',
  ];
  for (const k of required) {
    if (!body[k]) return fail(`Missing answer: ${k}`);
  }
  if (!body.interests || body.interests.length === 0) {
    return fail('Pick at least one interest');
  }

  const sessionId = getOrCreateSessionId();
  createSessionCookie(sessionId);

  // Privacy: store ONLY quiz answers, linked to anonymous session.
  // We also store the userCity supplied at submit time (used only for ranking),
  // but we never persist precise geolocation or anything beyond what the user typed.
  const city = (body.userCity ?? '').trim() || null;
  const quiz = await prisma.quizResponse.create({
    data: {
      sessionId,
      ageGroup: body.ageGroup!,
      city: city ?? '',
      timeCommitment: body.timeCommitment!,
      budget: body.budget!,
      preference: body.preference!,
      mood: body.mood!,
      interests: JSON.stringify(body.interests),
      skillLevel: body.skillLevel!,
    },
  });

  await prisma.usageEvent.create({
    data: { kind: 'quiz_submit', sessionId, payload: JSON.stringify({ quizId: quiz.id }) },
  });

  const activities = await prisma.activity.findMany({
    where: { isActive: true, isApproved: true },
  });

  const decoded = activities.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    category: a.category,
    ageMin: a.ageMin,
    ageMax: a.ageMax,
    locationType: a.locationType,
    city: a.city,
    cost: a.cost,
    duration: a.duration,
    indoorOutdoor: a.indoorOutdoor,
    skillLevel: a.skillLevel,
    tags: JSON.parse(a.tags) as string[],
    sourceUrl: a.sourceUrl,
    providerName: a.providerName,
  }));

  const ranked: ScoredActivity[] = rankActivities(decoded, body, city ?? undefined).slice(0, 60);

  return ok({
    quizId: quiz.id,
    userCity: city,
    results: ranked,
  });
}