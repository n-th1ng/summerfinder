import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { rankActivities, type ScoredActivity } from '@/lib/scoring';
import type { QuizAnswers } from '@/lib/quiz-config';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userCity = url.searchParams.get('city') ?? undefined;

  const params: QuizAnswers = {
    ageGroup: url.searchParams.get('ageGroup') ?? undefined,
    location: url.searchParams.get('location') ?? undefined,
    timeCommitment: url.searchParams.get('timeCommitment') ?? undefined,
    budget: url.searchParams.get('budget') ?? undefined,
    preference: url.searchParams.get('preference') ?? undefined,
    mood: url.searchParams.get('mood') ?? undefined,
    skillLevel: url.searchParams.get('skillLevel') ?? undefined,
    interests: url.searchParams.get('interests')?.split(',').filter(Boolean),
  };

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

  const ranked: ScoredActivity[] = rankActivities(decoded, params, userCity).slice(0, 60);
  if (ranked.length === 0) return fail('No activities found', 404);
  return ok({ results: ranked, count: ranked.length });
}