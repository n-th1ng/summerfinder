'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ScoredActivity } from '@/lib/scoring';

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

  async function remove() {
    await fetch(`/api/save?activityId=${activity.id}`, { method: 'DELETE' });
    setHidden(true);
  }

  if (hidden) return null;

  return (
    <li className="card p-4 flex items-center gap-3">
      <Link href={`/activity/${activity.id}`} className="flex-1 min-w-0">
        <p className="font-semibold truncate">{activity.title}</p>
        <p className="text-xs text-stone-500 mt-0.5">{meta}</p>
      </Link>
      <button
        onClick={remove}
        className="text-xs text-stone-500 hover:text-red-500"
        aria-label={`Remove ${activity.title}`}
      >
        Remove
      </button>
    </li>
  );
}