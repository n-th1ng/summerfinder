'use client';

import { useEffect, useRef, useState } from 'react';
import { ActivityCard } from './ActivityCard';
import type { ScoredActivity } from '@/lib/scoring';
import type { QuizAnswers } from '@/lib/quiz-config';
import { Button } from './ui/Button';
import { Icon } from '@/components/Icon';

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
        "Hi, I'm your SummerFinder agent. Tell me what kind of thing you want to do — free, outdoors, quick, creative — and I'll find a few good picks.",
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
        setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'agent', text: 'Hmm, something went wrong. Try again?' }]);
      }
    } catch {
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'agent', text: "Can't reach the agent right now. Check your connection?" }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="card shadow-lift overflow-hidden flex flex-col h-[600px] max-h-[80vh]">
      <div className="px-5 py-3 border-b border-ink-100 dark:border-ink-800 flex items-center gap-3 bg-ink-50/50 dark:bg-ink-800/40">
        <div className="relative">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-coral-500 to-magenta-500 text-white shadow-soft">
            <Icon name="wand" size={16} />
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-ink-900" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm leading-tight">SummerFinder Agent</p>
          <p className="text-xs text-ink-500 leading-tight">Rule-based · privacy-first</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-dots">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}>
            <div className={`max-w-[88%] ${m.role === 'user' ? 'order-1' : ''}`}>
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-coral-500 text-white shadow-soft rounded-br-md'
                    : 'bg-white dark:bg-ink-800 text-ink-900 dark:text-ink-100 ring-1 ring-ink-200/60 dark:ring-ink-700 rounded-bl-md shadow-soft'
                }`}
              >
                {m.text}
              </div>
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
          <div className="flex justify-start animate-fade-up">
            <div className="rounded-2xl px-4 py-3 text-sm bg-white dark:bg-ink-800 ring-1 ring-ink-200/60 dark:ring-ink-700 rounded-bl-md shadow-soft">
              <span className="inline-flex gap-1">
                <span className="w-2 h-2 rounded-full bg-coral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-coral-400 animate-bounce" style={{ animationDelay: '120ms' }} />
                <span className="w-2 h-2 rounded-full bg-coral-400 animate-bounce" style={{ animationDelay: '240ms' }} />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-ink-100 dark:border-ink-800 p-3 bg-white/80 dark:bg-ink-900/80 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={pending}
              className="shrink-0 text-xs px-3 h-8 rounded-full bg-ink-100 hover:bg-ink-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-ink-700 dark:text-ink-200 font-semibold transition active:scale-95 disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="mt-2 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me what you're looking for…"
            aria-label="Message the agent"
            className="flex-1 h-12 rounded-full bg-ink-100 dark:bg-ink-800 px-4 focus:outline-none focus:ring-2 focus:ring-coral-400"
          />
          <Button type="submit" iconRight="send" disabled={pending || !input.trim()} size="md" className="!rounded-full !h-12 !w-12 !p-0 !px-0" aria-label="Send">
            <Icon name="send" size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
}