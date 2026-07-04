import { getTursoClient } from '@/lib/turso';
import { ok, fail } from '@/lib/api';
import { getOrCreateSessionId, createSessionCookie } from '@/lib/session';
import type { QuizAnswers } from '@/lib/quiz-config';
import { rankActivities, type ScoredActivity } from '@/lib/scoring';
import { SEED_ACTIVITIES } from '@/lib/seed-data';
import { seedActivityId, toResolvedSeed } from '@/lib/seed-helpers';

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

  type RawActivity = Omit<ScoredActivity, 'score' | 'reasons'>;
  let activities: RawActivity[] = [];
  let quizId: string | null = null;
  let source: 'database' | 'seed' = 'seed';

  const turso = getTursoClient();
  if (turso) {
    try {
      const quizIdResult = await turso.execute({
        sql: `INSERT INTO QuizResponse (id, sessionId, ageGroup, city, timeCommitment, budget, preference, mood, interests, skillLevel, latitude, longitude, createdAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
              RETURNING id`,
        args: [
          crypto.randomUUID(),
          sessionId,
          body.ageGroup!,
          city ?? '',
          body.timeCommitment!,
          body.budget!,
          body.preference!,
          body.mood!,
          JSON.stringify(body.interests),
          body.skillLevel!,
          body.userLat ?? null,
          body.userLng ?? null,
        ],
      });
      quizId = quizIdResult.rows[0]?.id as string | null;

      await turso.execute({
        sql: `INSERT INTO UsageEvent (id, kind, payload, sessionId, createdAt)
              VALUES (?, 'quiz_submit', ?, ?, datetime('now'))`,
        args: [crypto.randomUUID(), JSON.stringify({ quizId }), sessionId],
      });

      const dbResult = await turso.execute({
        sql: `SELECT * FROM Activity WHERE isActive = 1 AND isApproved = 1`,
        args: [],
      });

      activities = dbResult.rows.map((a) => ({
        id: a.id as string,
        title: a.title as string,
        description: a.description as string,
        category: a.category as string,
        ageMin: a.ageMin as number,
        ageMax: a.ageMax as number,
        locationType: a.locationType as any,
        city: (a.city as string) ?? null,
        cost: a.cost as any,
        duration: a.duration as any,
        indoorOutdoor: a.indoorOutdoor as any,
        skillLevel: a.skillLevel as any,
        tags: JSON.parse(a.tags as string) as string[],
        sourceUrl: (a.sourceUrl as string) ?? null,
        providerName: (a.providerName as string) ?? null,
      }));
      source = 'database';
    } catch (err: any) {
      console.log('Turso query failed:', err?.message ?? err);
    }
  }

  if (activities.length === 0) {
    activities = SEED_ACTIVITIES.map((a) => toResolvedSeed(a));
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
