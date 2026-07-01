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
import { Icon, type IconName } from '@/components/Icon';

const CATEGORY_ACCENT: Record<string, { bg: string; ring: string; icon: IconName; tone: 'coral'|'sky'|'lime'|'magenta'|'ink' }> = {
  course: { bg: 'bg-sky-50 dark:bg-sky-500/10', ring: 'ring-sky-200 dark:ring-sky-400/30', icon: 'graduation', tone: 'sky' },
  sport: { bg: 'bg-coral-50 dark:bg-coral-500/10', ring: 'ring-coral-200 dark:ring-coral-400/30', icon: 'dumbbell', tone: 'coral' },
  academic: { bg: 'bg-sky-50 dark:bg-sky-500/10', ring: 'ring-sky-200 dark:ring-sky-400/30', icon: 'bookOpen', tone: 'sky' },
  hobby: { bg: 'bg-magenta-50 dark:bg-magenta-500/10', ring: 'ring-magenta-200 dark:ring-magenta-400/30', icon: 'palette', tone: 'magenta' },
  outdoor: { bg: 'bg-lime-50 dark:bg-lime-400/10', ring: 'ring-lime-200 dark:ring-lime-400/30', icon: 'mountain', tone: 'lime' },
  volunteer: { bg: 'bg-lime-50 dark:bg-lime-400/10', ring: 'ring-lime-200 dark:ring-lime-400/30', icon: 'handshake', tone: 'lime' },
  event: { bg: 'bg-coral-50 dark:bg-coral-500/10', ring: 'ring-coral-200 dark:ring-coral-400/30', icon: 'partyPopper', tone: 'coral' },
  self_study: { bg: 'bg-ink-100 dark:bg-ink-800', ring: 'ring-ink-200 dark:ring-ink-700', icon: 'lightbulb', tone: 'ink' },
  club: { bg: 'bg-lime-50 dark:bg-lime-400/10', ring: 'ring-lime-200 dark:ring-lime-400/30', icon: 'puzzle', tone: 'lime' },
  boredom_buster: { bg: 'bg-magenta-50 dark:bg-magenta-500/10', ring: 'ring-magenta-200 dark:ring-magenta-400/30', icon: 'sparkles', tone: 'magenta' },
};

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
  const accent = CATEGORY_ACCENT[activity.category] ?? CATEGORY_ACCENT.hobby;

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

  return (
    <article
      className="card card-hover group relative overflow-hidden animate-fade-up"
      style={{ animationDelay: index ? `${Math.min(index, 11) * 50}ms` : undefined }}
    >
      {/* Top accent strip */}
      <div className={`absolute inset-x-0 top-0 h-1 ${accent.bg}`} aria-hidden />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${accent.bg} ${accent.ring}`}>
            <Icon name={accent.icon} size={12} />
            <span className="uppercase tracking-wider">{CATEGORY_LABELS[activity.category] ?? activity.category}</span>
          </div>
          <ScoreBadge score={activity.score} />
        </div>

        <h3 className="mt-3 text-[19px] font-bold leading-snug tracking-tight">
          <Link href={`/activity/${activity.id}`} className="after:absolute after:inset-0 after:content-['']">
            {activity.title}
          </Link>
        </h3>

        {!compact && (
          <p className="mt-2 text-sm text-ink-600 dark:text-ink-300 line-clamp-3">
            {activity.description}
          </p>
        )}

        {activity.reasons.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {activity.reasons.slice(0, 2).map((r) => (
              <li key={r} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-400/30">
                <Icon name="check" size={10} /> {r}
              </li>
            ))}
          </ul>
        )}

        <dl className="mt-4 grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
          <Stat icon="clock" k="Time" v={DURATION_LABELS[activity.duration]} />
          <Stat icon="sparkles" k="Cost" v={COST_LABELS[activity.cost]} />
          <Stat icon="users" k="Ages" v={`${activity.ageMin}–${activity.ageMax}`} />
          <Stat icon="target" k="Level" v={SKILL_LABELS[activity.skillLevel]} />
        </dl>
      </div>

      <div className="flex items-center justify-between border-t border-ink-100 dark:border-ink-800 px-5 py-3 relative">
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">
          <Icon name={activity.indoorOutdoor === 'outdoor' ? 'mountain' : activity.indoorOutdoor === 'indoor' ? 'house' : 'shapes'} size={13} />
          {INDOOR_OUTDOOR_LABELS[activity.indoorOutdoor]}
          {activity.city && (
            <>
              <span aria-hidden>·</span>
              <span className="truncate max-w-[8rem]">{activity.city}</span>
            </>
          )}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleSave}
            disabled={pending}
            aria-label={saved ? 'Unsave' : 'Save'}
            aria-pressed={saved}
            className={`inline-flex items-center justify-center h-9 w-9 rounded-full ring-1 ring-inset transition active:scale-90 ${
              saved
                ? 'bg-coral-500 text-white ring-coral-500'
                : 'bg-white text-ink-700 ring-ink-200 hover:bg-ink-50 dark:bg-ink-800 dark:text-ink-100 dark:ring-ink-700 dark:hover:bg-ink-700'
            }`}
          >
            <Icon name={saved ? 'bookmarkFilled' : 'bookmark'} size={15} />
          </button>
          <Link
            href={`/activity/${activity.id}`}
            aria-label="Open activity"
            className="inline-flex items-center justify-center h-9 px-3 rounded-full bg-ink-900 text-white text-xs font-semibold hover:bg-ink-800 dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100"
          >
            Open <Icon name="arrowRight" size={13} className="ml-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 75 ? 'bg-emerald-500 text-white' :
    score >= 50 ? 'bg-amber-400 text-amber-950' :
    'bg-ink-200 text-ink-800 dark:bg-ink-700 dark:text-ink-100';
  return (
    <span
      className={`shrink-0 text-[11px] font-bold tabular-nums px-2 py-1 rounded-full ${tone}`}
      title="Match score"
    >
      {score}
    </span>
  );
}

function Stat({ icon, k, v }: { icon: IconName; k: string; v: string }) {
  return (
    <>
      <dt className="flex items-center gap-1.5 text-ink-500 dark:text-ink-400">
        <Icon name={icon} size={12} /> {k}
      </dt>
      <dd className="font-semibold text-ink-900 dark:text-ink-100">{v}</dd>
    </>
  );
}