'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { QUIZ_QUESTIONS, type QuizAnswers } from '@/lib/quiz-config';

const STORAGE_KEY = 'sf-quiz';

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setAnswers(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {}
  }, [answers]);

  const total = QUIZ_QUESTIONS.length;
  const progress = useMemo(() => ((step + 1) / total) * 100, [step, total]);
  const current = QUIZ_QUESTIONS[step];

  function setAnswer(value: string | string[]) {
    setAnswers((a) => ({ ...a, [current.id]: value as any }));
  }

  const currentValue = (answers as any)[current.id];

  function canAdvance(): boolean {
    if (current.multi) return Array.isArray(currentValue) && currentValue.length > 0;
    return Boolean(currentValue);
  }

  async function submit() {
    setSubmitting(true);
    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      const json = await res.json();
      if (json.ok) {
        sessionStorage.setItem('sf-last-results', JSON.stringify(json.data));
        router.push('/results');
      } else {
        alert(json.error || 'Something went wrong');
      }
    } catch (e) {
      alert('Could not submit. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    if (step < total - 1) {
      setStep((s) => s + 1);
    } else {
      submit();
    }
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  function toggleMulti(id: string) {
    const cur: string[] = Array.isArray(currentValue) ? currentValue : [];
    setAnswer(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-3">
        <Link href="/" className="text-sm text-stone-500 hover:underline">
          ← Home
        </Link>
        <span className="text-xs text-stone-500">
          Question {step + 1} of {total}
        </span>
      </div>
      <ProgressBar value={progress} />

      <div key={current.id} className="mt-6 animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold">{current.title}</h1>
        {current.subtitle && (
          <p className="mt-1 text-stone-600 dark:text-stone-400">{current.subtitle}</p>
        )}

        <div
          className={`mt-5 grid gap-3 ${
            current.options.length > 6 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'
          }`}
        >
          {current.options.map((opt) => {
            const selected = current.multi
              ? Array.isArray(currentValue) && currentValue.includes(opt.id)
              : currentValue === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => (current.multi ? toggleMulti(opt.id) : setAnswer(opt.id))}
                className={`group relative card p-4 sm:p-5 text-left transition active:scale-[0.98] min-h-[88px] ${
                  selected
                    ? 'ring-2 ring-brand-500 bg-brand-50 dark:bg-brand-900/20'
                    : 'hover:bg-stone-50 dark:hover:bg-stone-800/60'
                }`}
                aria-pressed={selected}
              >
                <div className="text-3xl" aria-hidden>
                  {opt.emoji}
                </div>
                <div className="mt-1 font-semibold">{opt.label}</div>
                {opt.description && (
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    {opt.description}
                  </div>
                )}
                {selected && (
                  <span className="absolute top-2 right-2 text-brand-600 dark:text-brand-400 text-lg">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={back} disabled={step === 0}>
          ← Back
        </Button>
        <Button onClick={next} disabled={!canAdvance() || submitting}>
          {submitting ? 'Finding picks…' : step === total - 1 ? 'See my picks 🎯' : 'Next →'}
        </Button>
      </div>
    </div>
  );
}