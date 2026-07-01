import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { runAgent } from '@/lib/agent';
import type { QuizAnswers } from '@/lib/quiz-config';
import type { ScoredActivity } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: { query?: string; baseAnswers?: QuizAnswers; userCity?: string };
  try {
    body = await req.json();
  } catch {
    return fail('Invalid JSON');
  }

  const activities = await prisma.activity.findMany({
    where: { isActive: true, isApproved: true },
  });
  const decoded: ScoredActivity[] = activities.map((a) => ({
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
    score: 0,
    reasons: [],
  }));

  const response = await runAgent(
    { query: body.query ?? '', baseAnswers: body.baseAnswers, userCity: body.userCity },
    decoded,
  );

  return ok(response);
}