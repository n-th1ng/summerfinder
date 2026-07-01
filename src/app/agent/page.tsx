'use client';

import Link from 'next/link';
import { AgentPanel } from '@/components/AgentPanel';
import { Icon } from '@/components/Icon';
import { useEffect, useState } from 'react';

export default function AgentPage() {
  const [baseAnswers, setBaseAnswers] = useState<any>(undefined);
  const [city, setCity] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('sf-last-results');
      if (raw) {
        const data = JSON.parse(raw);
        setCity(data.userCity ?? undefined);
      }
      const quiz = sessionStorage.getItem('sf-quiz');
      if (quiz) setBaseAnswers(JSON.parse(quiz));
    } catch {}
  }, []);

  return (
    <div className="container py-10 sm:py-14 max-w-3xl">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 dark:hover:text-ink-100">
        <Icon name="arrowLeft" size={14} /> Home
      </Link>
      <div className="inline-flex items-center gap-2 mt-3">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-coral-500 to-magenta-500 text-white shadow-soft">
          <Icon name="wand" size={18} />
        </span>
        <h1 className="text-display-lg">Ask the agent</h1>
      </div>
      <p className="mt-3 text-ink-600 dark:text-ink-400 max-w-xl">
        Tell the agent what you&apos;re in the mood for. It remembers your quiz answers
        (locally, on your device) and uses the same ranking engine — never shares your info.
      </p>

      <div className="mt-8">
        <AgentPanel baseAnswers={baseAnswers} userCity={city} />
      </div>

      <p className="mt-4 text-xs text-ink-500 text-center">
        The agent is rule-based for now. An AI ranking layer can be swapped in later without changing the UI.
      </p>
    </div>
  );
}