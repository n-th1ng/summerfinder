'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ScoredActivity } from '@/lib/scoring';
import {
  CATEGORY_LABELS,
  COST_LABELS,
  DURATION_LABELS,
  INDOOR_OUTDOOR_LABELS,
  SKILL_LABELS,
  INTEREST_LABELS,
} from '@/lib/scoring';

export function ActivityCard({
  activity,
  compact,
  index,
}: {
  activity: ScoredActivity;
  compact?: boolean;
  index?: number;
}) {
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setPending(true);
    try {
      if (saved) {
        await fetch(`/api/save?activityId=${activity.id}`, { method: 'DELETE' });
        setSaved(false);
      } else {
        const res = await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activityId: activity.id }),
        });
        if (res.ok) setSaved(true);
      }
    } finally {
      setPending(false);
    }
  }

  const tagList = activity.tags.slice(0, 3);

  return (
    <article
      className="card p-5 hover:shadow-md transition animate-slide-up"
      style={{ animationDelay: index ? `${Math.min(index, 8) * 40}ms` : undefined }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
            {CATEGORY_LABELS[activity.category] ?? activity.category}
          </p>
          <h3 className="mt-1 text-lg font-semibold leading-tight">
            <Link href={`/activity/${activity.id}`} className="hover:underline">
              {activity.title}
            </Link>
          </h3>
        </div>
        <ScoreBadge score={activity.score} />
      </div>

      {!compact && (
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 line-clamp-3">
          {activity.description}
        </p>
      )}

      {activity.reasons.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {activity.reasons.map((r) => (
            <li
              key={r}
              className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
            >
              ✓ {r}
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-3 grid grid-cols-2 gap-y-1.5 gap-x-3 text-xs text-stone-600 dark:text-stone-400">
        <Pair k="Time" v={DURATION_LABELS[activity.duration]} />
        <Pair k="Cost" v={COST_LABELS[activity.cost]} />
        <Pair k="Ages" v={`${activity.ageMin}–${activity.ageMax}`} />
        <Pair k="Level" v={SKILL_LABELS[activity.skillLevel]} />
        <Pair k="Where" v={activity.city ?? INDOOR_OUTDOOR_LABELS[activity.indoorOutdoor]} />
        <Pair k="Vibe" v={INDOOR_OUTDOOR_LABELS[activity.indoorOutdoor]} />
      </dl>

      {tagList.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {tagList.map((t) => (
            <li
              key={t}
              className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800"
            >
              {INTEREST_LABELS[t]?.emoji ?? '•'} {INTEREST_LABELS[t]?.label ?? t}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center gap-2">
        <Link
          href={`/activity/${activity.id}`}
          className="inline-flex items-center justify-center h-11 px-4 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600"
        >
          Open
        </Link>
        <button
          type="button"
          onClick={toggleSave}
          disabled={pending}
          aria-pressed={saved}
          className="inline-flex items-center justify-center h-11 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 font-semibold"
        >
          {saved ? '★ Saved' : '☆ Save'}
        </button>
        {activity.sourceUrl && (
          <a
            href={activity.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="ml-auto text-sm text-stone-500 hover:underline"
          >
            Source ↗
          </a>
        )}
      </div>
    </article>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 75
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
      : score >= 50
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
      : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300';
  return (
    <span
      className={`shrink-0 text-xs font-bold px-2 py-1 rounded-full ${color}`}
      title="Match score"
    >
      {score}
    </span>
  );
}

function Pair({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-stone-500">{k}</dt>
      <dd className="font-medium text-stone-800 dark:text-stone-200">{v}</dd>
    </>
  );
}