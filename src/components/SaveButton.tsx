'use client';

import { useEffect, useState } from 'react';

export function SaveButton({ activityId }: { activityId: string }) {
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

  const label = saved === null ? '…' : saved ? '★ Saved' : '☆ Save';

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending || saved === null}
      className="inline-flex items-center justify-center h-12 px-5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 font-semibold"
    >
      {label}
    </button>
  );
}