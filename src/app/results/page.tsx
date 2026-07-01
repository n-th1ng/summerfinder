'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ActivityCard } from '@/components/ActivityCard';
import { AgentPanel } from '@/components/AgentPanel';
import { StreakBadge } from '@/components/StreakBadge';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/Icon';
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
    const text = 'My SummerFinder picks';
    if (navigator.share) {
      navigator.share({ title: text, url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => alert('Link copied!'));
    }
  }

  if (!loaded) {
    return (
      <div className="container py-16 text-center">
        <div className="inline-block w-6 h-6 rounded-full border-2 border-coral-500 border-t-transparent animate-spin" />
        <p className="mt-3 text-ink-500">Loading your picks…</p>
      </div>
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <div className="container py-20 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coral-50 dark:bg-coral-500/15 text-coral-500 mb-4">
          <Icon name="sparkles" size={28} />
        </div>
        <h1 className="text-display-md">No picks yet</h1>
        <p className="mt-2 text-ink-600 dark:text-ink-400">
          Take the quiz to get personalized summer activity recommendations.
        </p>
        <Link href="/quiz" className="mt-6 inline-block">
          <Button size="lg" iconRight="arrowRight">Start the quiz</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-10 sm:py-14">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2">
            <h1 className="text-display-lg">Your picks</h1>
            <StreakBadge />
          </div>
          <p className="mt-2 text-ink-600 dark:text-ink-400">
            <span className="font-semibold text-ink-900 dark:text-ink-100">{data.results.length}</span> activities ranked by fit for you
            {data.userCity ? <> · tuned for <span className="font-semibold">{data.userCity}</span></> : null}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" iconLeft="share" onClick={share}>Share</Button>
          <Link href="/quiz"><Button variant="ghost">Retake quiz</Button></Link>
        </div>
      </div>

      {/* Filters bar */}
      <div className="card p-3 mb-6 flex flex-wrap items-center gap-3 sticky top-16 z-10 backdrop-blur-xl bg-white/80 dark:bg-ink-900/80">
        <div className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0">
          <span className="hidden sm:inline-flex items-center gap-1 text-xs uppercase tracking-wider text-ink-500 shrink-0">
            <Icon name="filter" size={12} /> Filter
          </span>
          {categories.map((c) => (
            <Chip key={c} active={filter === c} onClick={() => setFilter(c)}>
              {c === 'all' ? 'All' : CATEGORY_LABELS[c] ?? c}
            </Chip>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs uppercase tracking-wider text-ink-500 hidden sm:inline">Sort</span>
          <div className="inline-flex rounded-full bg-ink-100 dark:bg-ink-800 p-1">
            {[
              { id: 'fit', label: 'Best fit' },
              { id: 'time', label: 'Shortest' },
              { id: 'cost', label: 'Lowest cost' },
            ].map((o) => (
              <button
                key={o.id}
                onClick={() => setSort(o.id as any)}
                className={`px-3 h-8 rounded-full text-xs font-semibold transition ${
                  sort === o.id
                    ? 'bg-white dark:bg-ink-700 text-ink-900 dark:text-ink-50 shadow-soft'
                    : 'text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-ink-100'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
        {filtered.map((a, i) => (
          <ActivityCard key={a.id} activity={a} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-10 text-center">
          <Icon name="search" size={28} className="text-ink-400 mx-auto" />
          <p className="mt-3 font-semibold">No matches in this category</p>
          <p className="text-sm text-ink-500 mt-1">Try a different filter.</p>
        </div>
      )}

      {/* Agent */}
      <section className="mt-14">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-coral-600 dark:text-coral-400 font-semibold">Want more?</p>
            <h2 className="mt-1 text-display-md">Ask the agent</h2>
          </div>
          <Link href="/agent" className="text-sm text-coral-600 dark:text-coral-400 hover:underline">
            Open full agent →
          </Link>
        </div>
        <AgentPanel userCity={data.userCity ?? undefined} />
      </section>

      {/* Legend */}
      <p className="mt-10 text-xs text-ink-500 text-center">
        {Object.entries(INTEREST_LABELS).slice(0, 6).map(([k, v]) => v.label).join(' · ')}
        {' · '}and more
      </p>
    </div>
  );
}