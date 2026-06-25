import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { ActivityCard } from '@/components/ActivityCard';
import {
  type ScoredActivity,
} from '@/lib/scoring';
import { Icon } from '@/components/Icon';

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

  const day = new Date().toISOString().slice(0, 10);
  const seed = Array.from(day).reduce((a, c) => a + c.charCodeAt(0), 0);
  const shuffled = decoded
    .map((v, i) => ({ v, k: ((i + 1) * seed) % 997 }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.v);

  const surprise = shuffled.slice(0, 3).map((a) => ({ ...a, score: 90, reasons: ['Surprise pick for today'] })) as ScoredActivity[];
  const boring = decoded.filter((a) => a.category === 'boredom_buster' || a.duration === '30min');
  const boredomPicks = boring.slice(0, 4).map((a) => ({ ...a, score: 85, reasons: ['Quick boredom buster'] })) as ScoredActivity[];

  return (
    <div className="container py-10 sm:py-14">
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-coral-500 to-magenta-500 text-white shadow-glow animate-float">
          <Icon name="sparkles" size={28} />
        </div>
        <h1 className="mt-5 text-display-xl">Let&apos;s fix this fast.</h1>
        <p className="mt-3 text-ink-600 dark:text-ink-400">
          Three hand-picked ideas for today, plus a few boredom-busters. No quiz, no setup.
        </p>
        <div className="mt-6 flex justify-center gap-2 flex-wrap">
          <Link href="/quiz"><Button variant="secondary" iconRight="arrowRight">Take the full quiz</Button></Link>
          <Link href="/agent"><Button variant="ghost" iconLeft="wand">Ask the agent</Button></Link>
        </div>
      </div>

      {surprise.length > 0 && (
        <section className="mt-14">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-display-md">Surprise picks for today</h2>
            <span className="text-xs text-ink-500">Refreshes daily</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
            {surprise.map((a, i) => <ActivityCard key={a.id} activity={a} index={i} />)}
          </div>
        </section>
      )}

      {boredomPicks.length > 0 && (
        <section className="mt-14">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-display-md">30-minute boredom busters</h2>
            <span className="text-xs text-ink-500">{boredomPicks.length} quick wins</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
            {boredomPicks.map((a, i) => <ActivityCard key={a.id} activity={a} index={i} />)}
          </div>
        </section>
      )}

      <p className="mt-12 text-center text-sm text-ink-500 inline-flex items-center gap-1.5 w-full justify-center">
        <Icon name="bookmark" size={13} /> Bookmark favorites from any activity page.
      </p>
    </div>
  );
}