'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { Icon, type IconName } from '@/components/Icon';
import { INTEREST_LABELS } from '@/lib/scoring';

const CATEGORIES = [
  { id: 'course', label: 'Course', icon: 'graduation' as IconName },
  { id: 'sport', label: 'Sport / fitness', icon: 'dumbbell' as IconName },
  { id: 'academic', label: 'Academic program', icon: 'bookOpen' as IconName },
  { id: 'hobby', label: 'Hobby / creative', icon: 'palette' as IconName },
  { id: 'outdoor', label: 'Outdoor', icon: 'mountain' as IconName },
  { id: 'volunteer', label: 'Volunteering', icon: 'handshake' as IconName },
  { id: 'event', label: 'Local event', icon: 'partyPopper' as IconName },
  { id: 'self_study', label: 'Self-study', icon: 'lightbulb' as IconName },
  { id: 'club', label: 'Club / competition', icon: 'puzzle' as IconName },
  { id: 'boredom_buster', label: 'Boredom buster', icon: 'sparkles' as IconName },
];

const DURATIONS = [
  { id: '30min', label: '~30 min' },
  { id: '1-2hr', label: '1–2 hrs' },
  { id: 'half-day', label: 'Half day' },
  { id: 'multi-day', label: 'Multi-day' },
  { id: 'ongoing', label: 'Ongoing' },
];

export function SubmitForm() {
  const [submitterName, setSubmitterName] = useState('');
  const [submitterLocation, setSubmitterLocation] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('course');
  const [ageMin, setAgeMin] = useState(12);
  const [ageMax, setAgeMax] = useState(18);
  const [locationType, setLocationType] = useState('global');
  const [city, setCity] = useState('');
  const [cost, setCost] = useState('free');
  const [duration, setDuration] = useState('multi-day');
  const [indoorOutdoor, setIndoorOutdoor] = useState('both');
  const [skillLevel, setSkillLevel] = useState('any');
  const [tags, setTags] = useState<string[]>([]);
  const [sourceUrl, setSourceUrl] = useState('');
  const [providerName, setProviderName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleTag(t: string) {
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, category, ageMin, ageMax,
          locationType, city: locationType === 'city' ? city : undefined,
          cost, duration, indoorOutdoor, skillLevel, tags,
          sourceUrl: sourceUrl || undefined,
          providerName: providerName || undefined,
          submitterName, submitterLocation,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error || 'Could not submit');
        return;
      }
      setDone(json.data.id);
    } catch {
      setError('Network error. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300 mb-4">
          <Icon name="check" size={28} />
        </div>
        <p className="font-bold text-xl">Thanks — your submission is in!</p>
        <p className="mt-2 text-ink-600 dark:text-ink-400 max-w-sm mx-auto">
          We review submissions regularly. If approved, your activity will appear in the catalog with credit to you.
        </p>
        <button
          onClick={() => {
            setDone(null);
            setTitle(''); setDescription(''); setTags([]);
            setSourceUrl(''); setProviderName('');
          }}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-coral-600 dark:text-coral-400 hover:underline"
        >
          Submit another <Icon name="arrowRight" size={14} />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Your name" required>
          <input
            required
            value={submitterName}
            onChange={(e) => setSubmitterName(e.target.value)}
            placeholder="e.g. Avery"
            className="w-full h-11 rounded-full bg-ink-100 dark:bg-ink-800 px-4 focus:outline-none focus:ring-2 focus:ring-coral-400"
          />
        </Field>
        <Field label="Your location" required hint="City or country — used only to credit you.">
          <input
            required
            value={submitterLocation}
            onChange={(e) => setSubmitterLocation(e.target.value)}
            placeholder="e.g. Brooklyn, USA"
            className="w-full h-11 rounded-full bg-ink-100 dark:bg-ink-800 px-4 focus:outline-none focus:ring-2 focus:ring-coral-400"
          />
        </Field>
      </div>

      <hr className="border-ink-100 dark:border-ink-800" />

      <Field label="Activity title" required>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Beginner bird-watching walks"
          className="w-full h-11 rounded-full bg-ink-100 dark:bg-ink-800 px-4 focus:outline-none focus:ring-2 focus:ring-coral-400"
        />
      </Field>
      <Field label="Description" required>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is it? Who is it for? Any setup needed?"
          className="w-full rounded-2xl bg-ink-100 dark:bg-ink-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coral-400"
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Category">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-11 rounded-full bg-ink-100 dark:bg-ink-800 px-4">
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>
        <Field label="Duration">
          <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full h-11 rounded-full bg-ink-100 dark:bg-ink-800 px-4">
            {DURATIONS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Age range">
          <div className="flex items-center gap-2">
            <input type="number" min={8} max={20} value={ageMin} onChange={(e) => setAgeMin(Number(e.target.value))} className="w-full h-11 rounded-full bg-ink-100 dark:bg-ink-800 px-4" />
            <span className="text-ink-500">to</span>
            <input type="number" min={8} max={20} value={ageMax} onChange={(e) => setAgeMax(Number(e.target.value))} className="w-full h-11 rounded-full bg-ink-100 dark:bg-ink-800 px-4" />
          </div>
        </Field>
        <Field label="Cost">
          <select value={cost} onChange={(e) => setCost(e.target.value)} className="w-full h-11 rounded-full bg-ink-100 dark:bg-ink-800 px-4">
            <option value="free">Free</option>
            <option value="low">Low cost</option>
            <option value="paid">Paid</option>
          </select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Where">
          <select value={locationType} onChange={(e) => setLocationType(e.target.value)} className="w-full h-11 rounded-full bg-ink-100 dark:bg-ink-800 px-4">
            <option value="global">Online / global</option>
            <option value="national">National</option>
            <option value="city">Specific city</option>
          </select>
        </Field>
        <Field label="Indoor / outdoor">
          <select value={indoorOutdoor} onChange={(e) => setIndoorOutdoor(e.target.value)} className="w-full h-11 rounded-full bg-ink-100 dark:bg-ink-800 px-4">
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
            <option value="both">Both</option>
          </select>
        </Field>
      </div>

      {locationType === 'city' && (
        <Field label="City" required>
          <input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Seattle"
            className="w-full h-11 rounded-full bg-ink-100 dark:bg-ink-800 px-4 focus:outline-none focus:ring-2 focus:ring-coral-400" />
        </Field>
      )}

      <Field label="Skill level">
        <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} className="w-full h-11 rounded-full bg-ink-100 dark:bg-ink-800 px-4">
          <option value="any">Any</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </Field>

      <Field label="Tags">
        <div className="flex flex-wrap gap-2">
          {Object.entries(INTEREST_LABELS).map(([k, v]) => (
            <button
              type="button"
              key={k}
              onClick={() => toggleTag(k)}
              className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-semibold transition active:scale-95 ${
                tags.includes(k)
                  ? 'bg-coral-500 text-white shadow-soft'
                  : 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-200 hover:bg-ink-200 dark:hover:bg-ink-700'
              }`}
            >
              <Icon name={v.icon as IconName} size={14} />
              {v.label}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Source URL (optional)">
          <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://…"
            className="w-full h-11 rounded-full bg-ink-100 dark:bg-ink-800 px-4 focus:outline-none focus:ring-2 focus:ring-coral-400" />
        </Field>
        <Field label="Provider (optional)">
          <input value={providerName} onChange={(e) => setProviderName(e.target.value)} placeholder="e.g. Public Library"
            className="w-full h-11 rounded-full bg-ink-100 dark:bg-ink-800 px-4 focus:outline-none focus:ring-2 focus:ring-coral-400" />
        </Field>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 inline-flex items-center gap-1.5">
          <Icon name="close" size={14} /> {error}
        </p>
      )}

      <Button type="submit" size="lg" iconRight="send" loading={submitting} fullWidth>
        Submit for review
      </Button>
    </form>
  );
}

function Field({
  label, hint, required, children,
}: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink-900 dark:text-ink-100">
        {label} {required && <span className="text-coral-500">*</span>}
      </span>
      {hint && <span className="block text-xs text-ink-500 mt-0.5">{hint}</span>}
      <span className="block mt-1.5">{children}</span>
    </label>
  );
}