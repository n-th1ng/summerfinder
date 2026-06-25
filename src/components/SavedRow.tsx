'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ScoredActivity } from '@/lib/scoring';
import { Icon } from '@/components/Icon';

export function SavedRow({
  id,
  activity,
  meta,
}: {
  id: string;
  activity: ScoredActivity;
  meta: string;
}) {
  const [hidden, setHidden] = useState(false);

  async function remove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await fetch(`/api/save?activityId=${activity.id}`, { method: 'DELETE' });
    setHidden(true);
  }

  if (hidden) return null;

  return (
    <li>
      <Link
        href={`/activity/${activity.id}`}
        className="card card-hover p-4 flex items-center gap-3 group"
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate group-hover:text-coral-600 dark:group-hover:text-coral-400 transition">
            {activity.title}
          </p>
          <p className="text-xs text-ink-500 mt-0.5 truncate">{meta}</p>
        </div>
        <button
          onClick={remove}
          className="shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-full text-ink-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
          aria-label={`Remove ${activity.title}`}
          title="Remove"
        >
          <Icon name="close" size={16} />
        </button>
      </Link>
    </li>
  );
}