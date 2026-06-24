import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { ActivityCard } from '@/components/ActivityCard';
import {
  CATEGORY_LABELS,
  DURATION_LABELS,
  type ScoredActivity,
} from '@/lib/scoring';

export const dynamic = 'force-dynamic';

export default async function BoredPage() {
  let activities: Awaited<ReturnType<typeof prisma.activity.findMany>> = [];
  try {
    activities = await prisma.activity.findMany({
      where: { isActive: true, isApproved: true },
    });
  } catch {
    activities = [];
  }

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

  const boring = decoded.filter((a) => a.category === 'boredom_buster' || a.duration === '30min');

  // Surprise me picks (a tiny spread of categories, deterministic shuffle by date)
  const day = new Date().toISOString().slice(0, 10);
  const seed = Array.from(day).reduce((a, c) => a + c.charCodeAt(0), 0);
  const shuffled = decoded
    .map((v, i) => ({ v, k: ((i + 1) * seed) % 997 }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.v);

  const surprise = shuffled.slice(0, 3).map((a) => ({
    ...a,
    score: 90,
    reasons: ['Surprise pick for today'],
  })) as ScoredActivity[];

  const boredomPicks = boring.slice(0, 4).map((a) => ({
    ...a,
    score: 85,
    reasons: ['Quick boredom buster'],
  })) as ScoredActivity[];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center">
        <div className="text-5xl" aria-hidden>✨</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mt-2">
          Surprise me — let’s fix this fast.
        </h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400 max-w-xl mx-auto">
          Three hand-picked ideas for today, plus a few boredom-busters. No quiz,
          no setup.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/quiz"><Button variant="secondary">Take the full quiz →</Button></Link>
          <Link href="/agent"><Button variant="ghost">Ask the agent 🤖</Button></Link>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-3">🎁 Surprise picks for today</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {surprise.map((a, i) => (
            <ActivityCard key={a.id} activity={a} index={i} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-3">⚡ 30-minute boredom busters</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boredomPicks.map((a, i) => (
            <ActivityCard key={a.id} activity={a} index={i} compact />
          ))}
        </div>
      </section>

      <p className="mt-8 text-center text-sm text-stone-500 dark:text-stone-400">
        Picks change every day. Bookmark your favorites from any activity page.
      </p>
    </div>
  );
}