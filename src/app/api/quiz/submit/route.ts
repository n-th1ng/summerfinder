import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { getOrCreateSessionId, createSessionCookie } from '@/lib/session';
import type { QuizAnswers } from '@/lib/quiz-config';
import { rankActivities, type ScoredActivity } from '@/lib/scoring';
import { SEED_ACTIVITIES } from '@/lib/seed-data';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: QuizAnswers & {
    userCity?: string;
    userLocation?: string;
    userLat?: number;
    userLng?: number;
  };
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

  const city = (body.userCity ?? '').trim() || null;

  // Try to persist quiz + fetch DB activities. If DB is unavailable,
  // fall back to the static seed so the app still works (and log the
  // quiz to the server console for analytics).
  type RawActivity = Omit<ScoredActivity, 'score' | 'reasons'>;
  let activities: RawActivity[] = [];
  let quizId: string | null = null;
  let source: 'database' | 'seed' = 'seed';

  try {
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
    quizId = quiz.id;
    await prisma.usageEvent.create({
      data: { kind: 'quiz_submit', sessionId, payload: JSON.stringify({ quizId: quiz.id }) },
    });

    const dbActivities = await prisma.activity.findMany({
      where: { isActive: true, isApproved: true },
    });
    activities = dbActivities.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      category: a.category,
      ageMin: a.ageMin,
      ageMax: a.ageMax,
      locationType: a.locationType as any,
      city: a.city,
      cost: a.cost as any,
      duration: a.duration as any,
      indoorOutdoor: a.indoorOutdoor as any,
      skillLevel: a.skillLevel as any,
      tags: JSON.parse(a.tags) as string[],
      sourceUrl: a.sourceUrl,
      providerName: a.providerName,
    }));
    source = 'database';
  } catch (err: any) {
    console.log('DB unavailable \u2014 using static seed for quiz:', sessionId);
  }

  if (activities.length === 0) {
    activities = SEED_ACTIVITIES.map((a) => ({
      id: `seed-${a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`,
      title: a.title,
      description: a.description,
      category: a.category,
      ageMin: a.ageMin,
      ageMax: a.ageMax,
      locationType: a.locationType as any,
      city: a.city ?? null,
      cost: a.cost as any,
      duration: a.duration as any,
      indoorOutdoor: a.indoorOutdoor as any,
      skillLevel: a.skillLevel as any,
      tags: a.tags,
      sourceUrl: a.sourceUrl ?? null,
      providerName: a.providerName ?? null,
    }));
  }

  const ranked: ScoredActivity[] = rankActivities(activities as ScoredActivity[], body, city ?? undefined).slice(0, 60);

  return ok({
    quizId,
    userCity: city,
    source,
    count: ranked.length,
    results: ranked,
  });
}