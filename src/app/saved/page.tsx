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

export const dynamic = 'force-dynamic';

export default async function SavedPage() {
  const sessionId = getOrCreateSessionId();
  let items: Awaited<ReturnType<typeof prisma.savedItem.findMany>> = [];
  try {
    items = await prisma.savedItem.findMany({
      where: { sessionId },
      include: { activity: true },
      orderBy: { createdAt: 'desc' },
    });
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Saved activities</h1>
      <p className="text-stone-600 dark:text-stone-400 mt-1">
        Your bookmarks live on this device. {valid.length} saved.
      </p>

      {valid.length === 0 ? (
        <div className="card p-8 mt-6 text-center">
          <div className="text-5xl" aria-hidden>🔖</div>
          <p className="mt-3 font-semibold">Nothing saved yet</p>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Take the quiz and tap “Save” on any activity you like.
          </p>
          <Link
            href="/quiz"
            className="mt-4 inline-flex items-center justify-center h-11 px-5 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600"
          >
            Start the quiz →
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
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