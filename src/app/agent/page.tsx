'use client';

import Link from 'next/link';
import { AgentPanel } from '@/components/AgentPanel';
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/" className="text-sm text-stone-500 hover:underline">← Home</Link>
      <h1 className="text-3xl font-extrabold mt-2">Ask the SummerFinder agent</h1>
      <p className="text-stone-600 dark:text-stone-400 mt-1 max-w-xl">
        Tell the agent what you’re in the mood for. It remembers your quiz answers
        (locally, on your device) and uses the same ranking engine — never shares
        your info.
      </p>

      <div className="mt-6">
        <AgentPanel baseAnswers={baseAnswers} userCity={city} />
      </div>

      <p className="mt-4 text-xs text-stone-500 dark:text-stone-400 text-center">
        The agent is rule-based for now. An AI ranking layer can be swapped in later
        without changing the UI.
      </p>
    </div>
  );
}