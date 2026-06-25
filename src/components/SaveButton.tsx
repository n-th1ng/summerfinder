'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';

export function SaveButton({ activityId, fullWidth }: { activityId: string; fullWidth?: boolean }) {
  const [saved, setSaved] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch('/api/saved')
      .then((r) => r.json())
      .then((j) => {
        if (!mounted || !j.ok) return;
        const ids = new Set<string>((j.data.items as any[]).map((i) => i.activity.id));
        setSaved(ids.has(activityId));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [activityId]);

  async function toggle() {
    if (saved === null) return;
    setPending(true);
    try {
      if (saved) {
        await fetch(`/api/save?activityId=${activityId}`, { method: 'DELETE' });
        setSaved(false);
      } else {
        await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activityId }),
        });
        setSaved(true);
      }
    } finally {
      setPending(false);
    }
  }

  const label = saved === null ? 'Loading…' : saved ? 'Saved' : 'Save';
  const icon = saved === null ? 'clock' : saved ? 'bookmarkFilled' : 'bookmark';

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending || saved === null}
      aria-pressed={saved ?? undefined}
      className={`inline-flex items-center justify-center gap-2 h-12 px-5 rounded-full font-semibold transition active:scale-95 ${
        saved
          ? 'bg-coral-500 text-white hover:bg-coral-600 shadow-soft'
          : 'bg-white text-ink-900 ring-1 ring-inset ring-ink-200 hover:bg-ink-50 hover:ring-ink-300 dark:bg-ink-800 dark:text-ink-100 dark:ring-ink-700 dark:hover:bg-ink-700'
      } ${fullWidth ? 'w-full' : ''}`}
    >
      <Icon name={icon as any} size={16} />
      {label}
    </button>
  );
}