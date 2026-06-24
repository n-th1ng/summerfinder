'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { INTEREST_LABELS } from '@/lib/scoring';

const CATEGORIES = [
  { id: 'course', label: 'Course' },
  { id: 'sport', label: 'Sport / fitness' },
  { id: 'academic', label: 'Academic program' },
  { id: 'hobby', label: 'Hobby / creative' },
  { id: 'outdoor', label: 'Outdoor' },
  { id: 'volunteer', label: 'Volunteering' },
  { id: 'event', label: 'Local event' },
  { id: 'self_study', label: 'Self-study' },
  { id: 'club', label: 'Club / competition' },
  { id: 'boredom_buster', label: 'Boredom buster' },
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
          title,
          description,
          category,
          ageMin,
          ageMax,
          locationType,
          city: locationType === 'city' ? city : undefined,
          cost,
          duration,
          indoorOutdoor,
          skillLevel,
          tags,
          sourceUrl: sourceUrl || undefined,
          providerName: providerName || undefined,
          submitterName,
          submitterLocation,
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
      <div className="text-center py-6">
        <div className="text-5xl" aria-hidden>✅</div>
        <p className="mt-3 font-semibold">Thanks — your submission is in!</p>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
          We review submissions regularly. If approved, your activity will appear in
          the catalog with credit to you.
        </p>
        <button
          onClick={() => {
            setDone(null);
            setTitle('');
            setDescription('');
            setTags([]);
            setSourceUrl('');
            setProviderName('');
          }}
          className="mt-4 text-sm text-brand-600 hover:underline"
        >
          Submit another →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Your name" required>
        <input
          required
          value={submitterName}
          onChange={(e) => setSubmitterName(e.target.value)}
          placeholder="e.g. Avery"
          className="w-full h-11 rounded-xl bg-stone-100 dark:bg-stone-800 px-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </Field>
      <Field label="Your location" required hint="City or country — used only to credit you.">
        <input
          required
          value={submitterLocation}
          onChange={(e) => setSubmitterLocation(e.target.value)}
          placeholder="e.g. Brooklyn, USA"
          className="w-full h-11 rounded-xl bg-stone-100 dark:bg-stone-800 px-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </Field>

      <hr className="border-stone-200 dark:border-stone-800" />

      <Field label="Activity title" required>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Beginner bird-watching walks"
          className="w-full h-11 rounded-xl bg-stone-100 dark:bg-stone-800 px-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </Field>
      <Field label="Description" required>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is it? Who is it for? Any setup needed?"
          className="w-full rounded-xl bg-stone-100 dark:bg-stone-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-11 rounded-xl bg-stone-100 dark:bg-stone-800 px-3"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Duration">
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full h-11 rounded-xl bg-stone-100 dark:bg-stone-800 px-3"
          >
            {DURATIONS.map((d) => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Age range">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={8}
              max={20}
              value={ageMin}
              onChange={(e) => setAgeMin(Number(e.target.value))}
              className="w-full h-11 rounded-xl bg-stone-100 dark:bg-stone-800 px-3"
            />
            <span className="text-stone-500">to</span>
            <input
              type="number"
              min={8}
              max={20}
              value={ageMax}
              onChange={(e) => setAgeMax(Number(e.target.value))}
              className="w-full h-11 rounded-xl bg-stone-100 dark:bg-stone-800 px-3"
            />
          </div>
        </Field>
        <Field label="Cost">
          <select
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="w-full h-11 rounded-xl bg-stone-100 dark:bg-stone-800 px-3"
          >
            <option value="free">Free</option>
            <option value="low">Low cost</option>
            <option value="paid">Paid</option>
          </select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Where">
          <select
            value={locationType}
            onChange={(e) => setLocationType(e.target.value)}
            className="w-full h-11 rounded-xl bg-stone-100 dark:bg-stone-800 px-3"
          >
            <option value="global">Online / global</option>
            <option value="national">National</option>
            <option value="city">Specific city</option>
          </select>
        </Field>
        <Field label="Indoor / outdoor">
          <select
            value={indoorOutdoor}
            onChange={(e) => setIndoorOutdoor(e.target.value)}
            className="w-full h-11 rounded-xl bg-stone-100 dark:bg-stone-800 px-3"
          >
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
            <option value="both">Both</option>
          </select>
        </Field>
      </div>

      {locationType === 'city' && (
        <Field label="City" required>
          <input
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Seattle"
            className="w-full h-11 rounded-xl bg-stone-100 dark:bg-stone-800 px-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </Field>
      )}

      <Field label="Skill level">
        <select
          value={skillLevel}
          onChange={(e) => setSkillLevel(e.target.value)}
          className="w-full h-11 rounded-xl bg-stone-100 dark:bg-stone-800 px-3"
        >
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
              className={`text-xs px-3 py-1.5 rounded-full transition ${
                tags.includes(k)
                  ? 'bg-brand-500 text-white'
                  : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {v.emoji} {v.label}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Source URL (optional)">
          <input
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://…"
            className="w-full h-11 rounded-xl bg-stone-100 dark:bg-stone-800 px-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </Field>
        <Field label="Provider (optional)">
          <input
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            placeholder="e.g. Public Library"
            className="w-full h-11 rounded-xl bg-stone-100 dark:bg-stone-800 px-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </Field>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" size="lg" disabled={submitting} className="w-full">
        {submitting ? 'Submitting…' : 'Submit for review'}
      </Button>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {hint && <span className="block text-xs text-stone-500 mt-0.5">{hint}</span>}
      <span className="block mt-1.5">{children}</span>
    </label>
  );
}