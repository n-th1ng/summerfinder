'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ActivityCard } from '@/components/ActivityCard';
import { AgentPanel } from '@/components/AgentPanel';
import { StreakBadge } from '@/components/StreakBadge';
import { Button } from '@/components/ui/Button';
import type { ScoredActivity } from '@/lib/scoring';
import { CATEGORY_LABELS, INTEREST_LABELS } from '@/lib/scoring';

type Saved = {
  results: ScoredActivity[];
  userCity?: string | null;
  quizId?: string;
};

export default function ResultsPage() {
  const [data, setData] = useState<Saved | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sort, setSort] = useState<'fit' | 'time' | 'cost'>('fit');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('sf-last-results');
      if (raw) setData(JSON.parse(raw));
    } finally {
      setLoaded(true);
    }
  }, []);

  const categories = useMemo(() => {
    if (!data) return [];
    const set = new Set<string>();
    for (const a of data.results) set.add(a.category);
    return ['all', ...Array.from(set)];
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = data.results.slice();
    if (filter !== 'all') list = list.filter((a) => a.category === filter);
    if (sort === 'time') {
      const order = ['30min', '1-2hr', 'half-day', 'multi-day', 'ongoing'];
      list.sort((a, b) => order.indexOf(a.duration) - order.indexOf(b.duration));
    } else if (sort === 'cost') {
      const order = ['free', 'low', 'paid'];
      list.sort((a, b) => order.indexOf(a.cost) - order.indexOf(b.cost));
    }
    return list;
  }, [data, filter, sort]);

  function share() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = 'My SummerFinder picks 🎯';
    if (navigator.share) {
      navigator.share({ title: text, url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => alert('Link copied!'));
    }
  }

  if (!loaded) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <p className="text-stone-500">Loading your picks…</p>
      </div>
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">No picks yet</h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Take the quiz to get personalized summer activity recommendations.
        </p>
        <Link href="/quiz" className="mt-6 inline-block">
          <Button size="lg">Start the quiz →</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Your picks</h1>
            <StreakBadge />
          </div>
          <p className="text-stone-600 dark:text-stone-400">
            {data.results.length} activities ranked by fit for you.
            {data.userCity ? ` Tuned for ${data.userCity}.` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={share}>Share 🔗</Button>
          <Link href="/quiz">
            <Button variant="ghost">Retake quiz</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5 card p-3 sm:p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs uppercase tracking-wider text-stone-500 shrink-0">Category</span>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                filter === c
                  ? 'bg-brand-500 text-white'
                  : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {c === 'all' ? 'All' : CATEGORY_LABELS[c] ?? c}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs uppercase tracking-wider text-stone-500">Sort</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="bg-stone-100 dark:bg-stone-800 rounded-full text-sm px-3 py-1.5"
          >
            <option value="fit">Best fit</option>
            <option value="time">Shortest time</option>
            <option value="cost">Lowest cost</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((a, i) => (
          <ActivityCard key={a.id} activity={a} index={i} />
        ))}
      </div>

      {/* Interest legend */}
      <p className="mt-8 text-xs text-stone-500 dark:text-stone-400 text-center">
        Tags: {Object.entries(INTEREST_LABELS).map(([k, v]) => `${v.emoji} ${v.label}`).join(' · ')}
      </p>

      {/* Conversational agent */}
      <section className="mt-10">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-xl font-bold">Want to narrow it down?</h2>
          <Link href="/agent" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
            Open full agent →
          </Link>
        </div>
        <AgentPanel userCity={data.userCity ?? undefined} />
      </section>
    </div>
  );
}