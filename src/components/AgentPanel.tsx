'use client';

import { useEffect, useRef, useState } from 'react';
import { ActivityCard } from './ActivityCard';
import type { ScoredActivity } from '@/lib/scoring';
import type { QuizAnswers } from '@/lib/quiz-config';
import { Button } from './ui/Button';

type Message = {
  id: string;
  role: 'user' | 'agent';
  text: string;
  results?: ScoredActivity[];
};

const SUGGESTIONS = [
  'Find me something free outdoors',
  'What can I do in 30 minutes?',
  'I want a creative project',
  'Something to learn this summer',
  'A chill indoor thing',
];

export function AgentPanel({ baseAnswers, userCity }: { baseAnswers?: QuizAnswers; userCity?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'hello',
      role: 'agent',
      text:
        "Hi, I'm your SummerFinder agent 👋 Tell me what kind of thing you want to do — free, outdoors, quick, creative — and I'll find a few good picks.",
    },
  ]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, pending]);

  async function send(query: string) {
    const text = query.trim();
    if (!text || pending) return;
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'user', text }]);
    setInput('');
    setPending(true);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, baseAnswers, userCity }),
      });
      const json = await res.json();
      if (json.ok) {
        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            role: 'agent',
            text: json.data.reply,
            results: json.data.results,
          },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          { id: crypto.randomUUID(), role: 'agent', text: 'Hmm, something went wrong. Try again?' },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: 'agent', text: "Can't reach the agent right now. Check your connection?" },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="card flex flex-col h-[600px] max-h-[80vh]">
      <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800 flex items-center gap-2">
        <span aria-hidden className="text-2xl">🤖</span>
        <div className="min-w-0">
          <p className="font-semibold leading-tight">SummerFinder Agent</p>
          <p className="text-xs text-stone-500 leading-tight">Asks follow-ups, finds matches, never stores personal info.</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-brand-500 text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
              }`}
            >
              {m.text}
              {m.results && m.results.length > 0 && (
                <div className="mt-3 grid sm:grid-cols-2 gap-3">
                  {m.results.map((a, i) => (
                    <ActivityCard key={a.id} activity={a} index={i} compact />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {pending && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-3.5 py-2.5 text-sm bg-stone-100 dark:bg-stone-800">
              <span className="inline-block animate-pulse">●●●</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-stone-200 dark:border-stone-800 p-3">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={pending}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mt-2 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me what you’re looking for…"
            aria-label="Message the agent"
            className="flex-1 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 px-4 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <Button type="submit" disabled={pending || !input.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}