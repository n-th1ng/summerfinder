'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Icon, type IconName } from '@/components/Icon';
import { LocationButton, type ResolvedLocation } from '@/components/LocationButton';
import { QUIZ_QUESTIONS, type QuizAnswers, type QuizOption } from '@/lib/quiz-config';

const STORAGE_KEY = 'sf-quiz';
const CITY_KEY = 'sf-quiz-city';

const OPTION_ICONS: Record<string, IconName> = {
  '10-12': 'sparkles', '12-14': 'star', '14-16': 'zap', '16-18': 'rocket',
  'near_me': 'mapPin', 'anywhere': 'globe', us: 'compass', uk: 'globe', ca: 'globe', in: 'globe', au: 'globe',
  '30min': 'clock', '1-2hr': 'clock', 'half-day': 'sunBright', 'multi-day': 'calendar', ongoing: 'calendar',
  free: 'sparkles', low: 'thumbsUp', paid: 'zap',
  indoor: 'house', outdoor: 'mountain', both: 'shapes',
  active: 'flame', creative: 'palette', academic: 'bookOpen', social: 'users', relaxing: 'leaf',
  sports: 'target', coding: 'code', art: 'palette', reading: 'bookOpen', business: 'briefcase',
  volunteering: 'handshake', gaming: 'gamepad', fitness: 'dumbbell', music: 'music',
  science: 'flask', clubs: 'puzzle', courses: 'graduation',
  beginner: 'leaf', intermediate: 'mountain', advanced: 'rocket',
};

type City = ResolvedLocation | null;

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [city, setCity] = useState<City>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setAnswers(JSON.parse(raw));
      const c = sessionStorage.getItem(CITY_KEY);
      if (c) setCity(JSON.parse(c));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
      if (city) sessionStorage.setItem(CITY_KEY, JSON.stringify(city));
    } catch {}
  }, [answers, city]);

  const total = QUIZ_QUESTIONS.length;
  const progress = useMemo(() => ((step + 1) / total) * 100, [step, total]);
  const current = QUIZ_QUESTIONS[step];
  const currentValue = (answers as any)[current.id];

  function setAnswer(value: string | string[]) {
    setAnswers((a) => ({ ...a, [current.id]: value as any }));
  }

  const canAdvance = current.multi
    ? Array.isArray(currentValue) && currentValue.length > 0
    : Boolean(currentValue);

  function handleLocationResolved(loc: ResolvedLocation) {
    setCity(loc);
    // If the user is on the location step, auto-advance after a beat.
    if (current.id === 'location') {
      setAnswer('near_me');
      setTimeout(() => next(), 600);
    }
  }

  async function submit() {
    setSubmitting(true);
    try {
      const payload: any = { ...answers };
      if (city) {
        payload.userCity = city.city;
        payload.userLocation = [city.city, city.region, city.country].filter(Boolean).join(', ');
        payload.userLat = city.latitude;
        payload.userLng = city.longitude;
        if (!answers.location || answers.location === 'near_me') {
          payload.location = 'near_me';
        }
      }
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.ok) {
        sessionStorage.setItem('sf-last-results', JSON.stringify(json.data));
        router.push('/results');
      } else {
        alert(json.error || 'Something went wrong');
      }
    } catch {
      alert('Could not submit. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    if (step < total - 1) setStep((s) => s + 1);
    else submit();
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  function toggleMulti(id: string) {
    const cur: string[] = Array.isArray(currentValue) ? currentValue : [];
    setAnswer(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  }

  // The location step gets a custom layout with the LocationButton.
  const isLocationStep = current.id === 'location';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Top bar */}
      <div className="border-b border-ink-100 dark:border-ink-800 bg-white/70 dark:bg-ink-950/70 backdrop-blur-xl sticky top-16 z-20">
        <div className="container py-4">
          <div className="flex items-center justify-between text-sm text-ink-600 dark:text-ink-400">
            <Link href="/" className="inline-flex items-center gap-1.5 hover:text-ink-900 dark:hover:text-ink-100">
              <Icon name="arrowLeft" size={14} /> Home
            </Link>
            <span className="font-semibold tabular-nums">{step + 1} <span className="text-ink-400">/ {total}</span></span>
          </div>
          <div className="mt-3">
            <ProgressBar value={progress} />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 container py-8 sm:py-12">
        <div key={current.id} className="animate-fade-up max-w-3xl mx-auto">
          <h1 className="text-display-lg text-center">{current.title}</h1>
          {current.subtitle && (
            <p className="mt-3 text-center text-ink-600 dark:text-ink-300 max-w-xl mx-auto">{current.subtitle}</p>
          )}

          {isLocationStep && (
            <div className="mt-8">
              <LocationButton
                onResolved={handleLocationResolved}
                initialCity={city?.city}
              />
              {city && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-400/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-400/30 px-3 py-1.5 text-sm font-semibold">
                  <Icon name="check" size={14} />
                  {city.city}
                  {city.region ? `, ${city.region}` : ''}
                  {city.country ? `, ${city.country}` : ''}
                </div>
              )}
              <div className="mt-8 flex items-center gap-3">
                <div className="flex-1 h-px bg-ink-200 dark:bg-ink-700" />
                <span className="text-xs uppercase tracking-wider text-ink-500 dark:text-ink-400 font-semibold">
                  or pick a region
                </span>
                <div className="flex-1 h-px bg-ink-200 dark:bg-ink-700" />
              </div>
            </div>
          )}

          <div className={`grid gap-3 sm:gap-4 ${
            isLocationStep ? 'mt-4' : 'mt-10'
          } ${
            current.multi || current.options.length > 6
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              : 'grid-cols-2 sm:grid-cols-3'
          }`}>
            {current.options.map((opt, i) => (
              <OptionCard
                key={opt.id}
                opt={opt}
                index={i}
                selected={current.multi
                  ? Array.isArray(currentValue) && currentValue.includes(opt.id)
                  : currentValue === opt.id}
                onClick={() => (current.multi ? toggleMulti(opt.id) : setAnswer(opt.id))}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div className="sticky bottom-0 z-20 border-t border-ink-100 dark:border-ink-800 bg-white/85 dark:bg-ink-950/85 backdrop-blur-xl">
        <div className="container py-3 flex items-center gap-3">
          <Button variant="ghost" iconLeft="arrowLeft" onClick={back} disabled={step === 0} className="!rounded-full">
            Back
          </Button>
          <div className="flex-1 text-center text-xs text-ink-500 dark:text-ink-400 hidden sm:block">
            {current.multi ? 'Tap as many as you like' : isLocationStep ? 'Or skip and pick a region' : 'Tap to choose'}
          </div>
          <Button
            iconRight={step === total - 1 ? 'sparkles' : 'arrowRight'}
            onClick={next}
            disabled={!canAdvance || submitting}
            size="lg"
            loading={submitting}
            className="!rounded-full flex-1 sm:flex-none"
          >
            {step === total - 1 ? 'See my picks' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function OptionCard({
  opt,
  selected,
  onClick,
  index,
}: {
  opt: QuizOption;
  selected: boolean;
  onClick: () => void;
  index: number;
}) {
  const icon = OPTION_ICONS[opt.id] ?? 'sparkles';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{ animationDelay: `${index * 30}ms` }}
      className={`group relative overflow-hidden rounded-2xl p-4 sm:p-5 text-left min-h-[110px] flex flex-col items-start justify-between transition-all duration-200 ease-snap animate-fade-up ring-1 ring-inset active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-400 ${
        selected
          ? 'bg-coral-500 text-white ring-coral-500 shadow-glow'
          : 'bg-white dark:bg-ink-800 text-ink-900 dark:text-ink-50 ring-ink-200 dark:ring-ink-700 hover:ring-ink-300 dark:hover:ring-ink-600 hover:shadow-soft'
      }`}
    >
      <span aria-hidden className={`absolute -top-6 -right-6 w-20 h-20 rounded-full transition-opacity duration-300 ${selected ? 'bg-white/15' : 'bg-coral-50 dark:bg-coral-500/10 opacity-0 group-hover:opacity-100'}`} />
      <Icon
        name={icon}
        size={28}
        className={`relative transition-transform duration-300 ${selected ? 'scale-110' : 'group-hover:scale-110'} ${selected ? 'text-white' : 'text-coral-500'}`}
      />
      <div className="relative mt-2">
        <div className="font-bold text-base sm:text-lg leading-tight">{opt.label}</div>
        {opt.description && (
          <div className={`mt-1 text-xs ${selected ? 'text-white/85' : 'text-ink-500 dark:text-ink-400'}`}>
            {opt.description}
          </div>
        )}
      </div>
      {selected && (
        <span aria-hidden className="absolute top-3 right-3 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white text-coral-600">
          <Icon name="check" size={14} />
        </span>
      )}
    </button>
  );
}