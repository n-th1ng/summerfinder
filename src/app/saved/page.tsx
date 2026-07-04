import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getOrCreateSessionId } from '@/lib/session';
import {
  CATEGORY_LABELS,
  COST_LABELS,
  DURATION_LABELS,
  type ScoredActivity,
} from '@/lib/scoring';
import { SavedRow } from '@/components/SavedRow';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/Icon';

export const dynamic = 'force-dynamic';

function getItems(sessionId: string) {
  return prisma.savedItem.findMany({
    where: { sessionId },
    include: { activity: true },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function SavedPage() {
  const sessionId = getOrCreateSessionId();
  type SavedWithActivity = Awaited<
    ReturnType<typeof getItems>
  >[number];
  let items: SavedWithActivity[] = [];
  try {
    items = await getItems(sessionId);
  } catch {
    items = [];
  }

  const valid = items
    .filter((i) => i.activity && i.activity.isActive)
    .map((i) => ({
      id: i.id,
      savedAt: i.createdAt,
      activity: {
        ...i.activity,
        tags: JSON.parse(i.activity.tags) as string[],
      } as unknown as ScoredActivity,
    }));

  return (
    <div className="container py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
        <div>
          <p className="text-xs uppercase tracking-wider text-coral-600 dark:text-coral-400 font-semibold">Your bookmarks</p>
          <h1 className="mt-1 text-display-lg">Saved activities</h1>
          <p className="mt-2 text-ink-600 dark:text-ink-400">
            <span className="font-semibold text-ink-900 dark:text-ink-100">{valid.length}</span> saved · stored on this device.
          </p>
        </div>
        <Link href="/quiz"><Button iconLeft="rocket">Take the quiz</Button></Link>
      </div>

      {valid.length === 0 ? (
        <div className="card p-12 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coral-50 dark:bg-coral-500/15 text-coral-500 mb-4">
            <Icon name="bookmark" size={28} />
          </div>
          <p className="font-bold text-xl">Nothing saved yet</p>
          <p className="mt-2 text-ink-600 dark:text-ink-400 max-w-sm mx-auto">
            Take the quiz and tap the bookmark on any activity you like.
          </p>
          <Link href="/quiz" className="mt-5 inline-block">
            <Button size="lg" iconRight="arrowRight">Start the quiz</Button>
          </Link>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3 stagger">
          {valid.map((i) => (
            <SavedRow
              key={i.id}
              id={i.id}
              activity={i.activity}
              meta={`${CATEGORY_LABELS[i.activity.category] ?? i.activity.category} · ${DURATION_LABELS[i.activity.duration]} · ${COST_LABELS[i.activity.cost]}`}
            />
          ))}
        </ul>
      )}
    </div>
  );
}