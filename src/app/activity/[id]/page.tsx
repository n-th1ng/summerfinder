import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  CATEGORY_LABELS,
  COST_LABELS,
  DURATION_LABELS,
  INDOOR_OUTDOOR_LABELS,
  SKILL_LABELS,
  INTEREST_LABELS,
} from '@/lib/scoring';
import { SEED_ACTIVITIES } from '@/lib/seed-data';
import { seedActivityById, toResolvedSeed } from '@/lib/seed-helpers';
import { getActivityLink } from '@/lib/activity-link';
import { SaveButton } from '@/components/SaveButton';
import { Icon, type IconName } from '@/components/Icon';
import { Badge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

const CATEGORY_ICON: Record<string, { icon: IconName; tone: 'coral'|'sky'|'lime'|'magenta'|'ink' }> = {
  course: { icon: 'graduation', tone: 'sky' },
  sport: { icon: 'dumbbell', tone: 'coral' },
  academic: { icon: 'bookOpen', tone: 'sky' },
  hobby: { icon: 'palette', tone: 'magenta' },
  outdoor: { icon: 'mountain', tone: 'lime' },
  volunteer: { icon: 'handshake', tone: 'lime' },
  event: { icon: 'partyPopper', tone: 'coral' },
  self_study: { icon: 'lightbulb', tone: 'ink' },
  club: { icon: 'puzzle', tone: 'lime' },
  boredom_buster: { icon: 'sparkles', tone: 'magenta' },
};

type Resolved = ReturnType<typeof toResolvedSeed>;

// Look up an activity by ID, with a fallback to the static seed catalog.
async function findActivity(id: string): Promise<Resolved | null> {
  // 1. Try the database first
  try {
    const a = await prisma.activity.findUnique({ where: { id } });
    if (a && a.isActive && a.isApproved) {
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        ageMin: a.ageMin,
        ageMax: a.ageMax,
        locationType: a.locationType as any,
        city: a.city,
        cost: a.cost as any,
        duration: a.duration as any,
        indoorOutdoor: a.indoorOutdoor as any,
        skillLevel: a.skillLevel as any,
        tags: JSON.parse(a.tags) as string[],
        sourceUrl: a.sourceUrl,
        providerName: a.providerName,
      };
    }
  } catch {
    // fall through to seed
  }
  // 2. Try the static seed by id
  const seed = seedActivityById(id);
  if (seed) return toResolvedSeed(seed);
  return null;
}

// Get a fake match reason based on the activity's properties. The
// real "reasons" array lives on the ScoredActivity from the quiz, but
// the detail page works on a plain Resolved so we infer.
function inferReasons(a: Resolved): string[] {
  const reasons: string[] = [];
  if (a.ageMin <= 12) reasons.push('Open to younger ages');
  else if (a.ageMin <= 14) reasons.push('Great fit for ages 10\u201318');
  else if (a.ageMin <= 16) reasons.push('Matches your age range');
  else reasons.push('Right age bracket');
  if (a.cost === 'free') reasons.push('Free to join');
  if (a.indoorOutdoor === 'outdoor') reasons.push('Get outside');
  if (a.indoorOutdoor === 'indoor') reasons.push('Indoor activity');
  if (a.indoorOutdoor === 'both') reasons.push('Indoor or outdoor');
  if (a.duration === '30min' || a.duration === '1-2hr') reasons.push('Quick to start');
  if (a.duration === 'multi-day' || a.duration === 'ongoing') reasons.push('Ongoing activity');
  if (a.skillLevel === 'beginner') reasons.push('Beginner-friendly');
  if (a.skillLevel === 'advanced') reasons.push('Stretch your skills');
  return reasons.slice(0, 4);
}

// Get activity-specific "What you'll do" tips. Pulled from the
// category + title keywords so the section feels personal.
function inferTips(a: Resolved): string[] {
  const title = a.title.toLowerCase();
  if (a.category === 'course') {
    return [
      'Set aside 30 minutes a day for the next few days.',
      'Work through one module at a time. Skip around if you get bored.',
      'Build something small at the end to prove it stuck.',
    ];
  }
  if (a.category === 'sport' || a.category === 'outdoor') {
    return [
      'Bring water, sunscreen, and a buddy if you can.',
      'Start slow \u2014 the first session is just to get out there.',
      'Track your sessions so you can see progress over the summer.',
    ];
  }
  if (a.category === 'volunteer') {
    return [
      'Email or call ahead to confirm the time and what to wear.',
      'Bring a water bottle and a friend if the role allows it.',
      'Ask the organizer what they need most so you can be useful.',
    ];
  }
  if (a.category === 'event') {
    return [
      'Check the time and place the day before so you don\u2019t miss it.',
      'Bring a phone for photos and a notebook if you want to remember details.',
      'Show up 10 minutes early \u2014 events often have a sign-in line.',
    ];
  }
  if (a.category === 'hobby' || a.category === 'boredom_buster') {
    return [
      'Gather the basic materials first \u2014 most activities need very little.',
      'Don\u2019t aim for perfect on day one. Just start.',
      'Share what you make with a friend or on social \u2014 it makes it stick.',
    ];
  }
  if (a.category === 'self_study') {
    return [
      'Block a 30\u201360 minute window on your calendar.',
      'Write down one question before you start \u2014 then answer it as you go.',
      'Teach what you learn to a friend or sibling. That\u2019s the fastest way to know it.',
    ];
  }
  if (a.category === 'academic') {
    return [
      'Skim the syllabus or overview first to know what you\u2019re building toward.',
      'Do one problem or chapter a day rather than cramming.',
      'Find a study buddy or online forum to keep momentum.',
    ];
  }
  if (a.category === 'club') {
    return [
      'Show up to the first session even if you feel unsure.',
      'Bring something you\u2019re already curious about \u2014 it gives you a reason to talk.',
      'Commit to 3 sessions before deciding if it\u2019s for you.',
    ];
  }
  // generic
  return [
    'Block out time on your calendar \u2014 specific times beat vague plans.',
    'Tell a friend what you\u2019re doing so someone holds you accountable.',
    'Reflect after a week: what worked, what didn\u2019t?',
  ];
}

export default async function ActivityPage({ params }: { params: { id: string } }) {
  const a = await findActivity(params.id);
  if (!a) notFound();

  const tags = a.tags;
  const accent = CATEGORY_ICON[a.category] ?? CATEGORY_ICON.hobby;
  const reasons = inferReasons(a);
  const tips = inferTips(a);
  const link = getActivityLink(a);

  let related: Resolved[] = [];
  try {
    const dbRelated = await prisma.activity.findMany({
      where: {
        isActive: true,
        isApproved: true,
        id: { not: a.id },
        OR: [{ category: a.category }, { locationType: a.locationType }],
      },
      take: 3,
    });
    related = dbRelated.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      ageMin: r.ageMin,
      ageMax: r.ageMax,
      locationType: r.locationType,
      city: r.city,
      cost: r.cost,
      duration: r.duration,
      indoorOutdoor: r.indoorOutdoor,
      skillLevel: r.skillLevel,
      tags: JSON.parse(r.tags) as string[],
      sourceUrl: r.sourceUrl,
      providerName: r.providerName,
    }));
  } catch {}
  if (related.length < 3) {
    const seedRelated = SEED_ACTIVITIES.filter(
      (s) => s.title !== a.title && (s.category === a.category || s.indoorOutdoor === a.indoorOutdoor),
    )
      .slice(0, 3 - related.length)
      .map((s) => toResolvedSeed(s));
    related = [...related, ...seedRelated];
  }

  return (
    <div className="container py-8 sm:py-12">
      <Link href="/results" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 dark:hover:text-ink-100">
        <Icon name="arrowLeft" size={14} /> Back to results
      </Link>

      {/* HEADER STRIP — title + CTA, stacks on mobile, inline on desktop */}
      <header className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge tone={accent.tone} icon={accent.icon}>{CATEGORY_LABELS[a.category] ?? a.category}</Badge>
            {tags.slice(0, 4).map((t) => (
              <Badge key={t} tone="ink">{INTEREST_LABELS[t]?.label ?? t}</Badge>
            ))}
          </div>
          <h1 className="text-display-2xl tracking-tight break-words">{a.title}</h1>
        </div>
        <a
          href={link.url}
          target="_blank"
          rel="noreferrer noopener"
          className="shrink-0 inline-flex items-center justify-center gap-2 h-12 lg:h-14 px-5 lg:px-6 rounded-full bg-coral-500 text-white text-sm lg:text-base font-bold hover:bg-coral-600 shadow-soft active:scale-[0.98] transition self-start"
        >
          <Icon name={link.isSearch ? 'search' : 'arrowUpRight'} size={18} />
          <span>{link.label}</span>
        </a>
      </header>

      {/* MAIN GRID — equal columns, content fills both sides */}
      <article className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 lg:gap-8 items-start">
        {/* Main column — content-dense, fills the column */}
        <div className="space-y-6 min-w-0">
          {/* Description */}
          <section>
            <h2 className="text-display-sm mb-2">What it is</h2>
            <p className="text-base sm:text-lg text-ink-700 dark:text-ink-300 leading-relaxed">
              {a.description}
            </p>
          </section>

          {/* Why we picked this — reasons */}
          {reasons.length > 0 && (
            <section>
              <h2 className="text-display-sm mb-2">Why we picked this for you</h2>
              <ul className="flex flex-wrap gap-2">
                {reasons.map((r) => (
                  <li
                    key={r}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-400/10 ring-1 ring-inset ring-emerald-200/70 dark:ring-emerald-400/20 px-3 py-1.5 text-sm font-medium text-emerald-900 dark:text-emerald-200"
                  >
                    <Icon name="check" size={13} className="shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* What you'll do — tips */}
          <section>
            <h2 className="text-display-sm mb-2">What you&apos;ll do</h2>
            <ol className="space-y-2.5">
              {tips.map((t, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-2xl bg-ink-100/50 dark:bg-ink-800/40 ring-1 ring-inset ring-ink-200/60 dark:ring-ink-700/60 px-4 py-3"
                >
                  <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-coral-500 text-white text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-ink-800 dark:text-ink-100 leading-relaxed">{t}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* At a glance — mobile/tablet view, desktop sees sidebar */}
          <section className="lg:hidden">
            <h2 className="text-display-sm mb-2">At a glance</h2>
            <div className="card p-5">
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <Stat icon="clock" label="Time" value={DURATION_LABELS[a.duration]} />
                <Stat icon="sparkles" label="Cost" value={COST_LABELS[a.cost]} />
                <Stat icon="users" label="Ages" value={`${a.ageMin}–${a.ageMax}`} />
                <Stat icon="target" label="Level" value={SKILL_LABELS[a.skillLevel]} />
                <Stat icon={a.indoorOutdoor === 'outdoor' ? 'mountain' : a.indoorOutdoor === 'indoor' ? 'house' : 'shapes'} label="Vibe" value={INDOOR_OUTDOOR_LABELS[a.indoorOutdoor]} />
                {a.city && <Stat icon="mapPin" label="Where" value={a.city} />}
              </dl>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <SaveButton activityId={a.id} fullWidth />
            </div>
          </section>

          {/* Tags (long list — fills more space) */}
          {tags.length > 0 && (
            <section>
              <h2 className="text-display-sm mb-2">Tags</h2>
              <ul className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <li
                    key={t}
                    className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 dark:bg-ink-800 px-3 py-1.5 text-sm font-medium text-ink-700 dark:text-ink-200"
                  >
                    <Icon name="tag" size={12} />
                    {INTEREST_LABELS[t]?.label ?? t}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Sidebar — only visible on lg+, sticky */}
        <aside className="hidden lg:block lg:sticky lg:top-24">
          <div className="card p-5 shadow-lift space-y-4">
            <div>
              <h2 className="text-xs uppercase tracking-wider text-ink-500 font-semibold">At a glance</h2>
              <dl className="mt-3 space-y-3 text-sm">
                <Row icon="clock" label="Time" value={DURATION_LABELS[a.duration]} />
                <Row icon="sparkles" label="Cost" value={COST_LABELS[a.cost]} />
                <Row icon="users" label="Ages" value={`${a.ageMin}–${a.ageMax}`} />
                <Row icon="target" label="Difficulty" value={SKILL_LABELS[a.skillLevel]} />
                <Row icon={a.indoorOutdoor === 'outdoor' ? 'mountain' : a.indoorOutdoor === 'indoor' ? 'house' : 'shapes'} label="Vibe" value={INDOOR_OUTDOOR_LABELS[a.indoorOutdoor]} />
                {a.city && <Row icon="mapPin" label="Where" value={a.city} />}
              </dl>
            </div>

            <div className="pt-4 border-t border-ink-100 dark:border-ink-800 flex flex-col gap-2">
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center justify-center h-12 px-5 rounded-full bg-coral-500 text-white font-semibold hover:bg-coral-600 shadow-soft"
              >
                {link.label} <Icon name="externalLink" size={15} className="ml-2" />
              </a>
              <SaveButton activityId={a.id} fullWidth />
              {a.providerName && (
                <p className="text-center text-xs text-ink-500 mt-1">Provided by {a.providerName}</p>
              )}
            </div>
          </div>
        </aside>
      </article>

      {related.length > 0 && (
        <section className="mt-16">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-display-md">You might also like</h2>
            <Link href="/results" className="text-sm text-coral-600 dark:text-coral-400 hover:underline">
              See all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/activity/${r.id}`}
                className="card card-hover p-5 group"
              >
                <Badge tone={(CATEGORY_ICON[r.category] ?? CATEGORY_ICON.hobby).tone} icon={(CATEGORY_ICON[r.category] ?? CATEGORY_ICON.hobby).icon}>
                  {CATEGORY_LABELS[r.category] ?? r.category}
                </Badge>
                <p className="mt-3 font-bold text-lg leading-snug group-hover:underline">{r.title}</p>
                <p className="text-xs text-ink-500 mt-2 inline-flex items-center gap-1.5">
                  <Icon name="clock" size={12} /> {DURATION_LABELS[r.duration]}
                  <span aria-hidden>·</span>
                  <Icon name="sparkles" size={12} /> {COST_LABELS[r.cost]}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Row({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="inline-flex items-center gap-2 text-ink-500">
        <Icon name={icon} size={14} /> {label}
      </dt>
      <dd className="font-semibold text-right text-ink-900 dark:text-ink-100">{value}</dd>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div>
      <dt className="inline-flex items-center gap-1.5 text-xs text-ink-500 mb-1">
        <Icon name={icon} size={12} /> {label}
      </dt>
      <dd className="font-semibold text-ink-900 dark:text-ink-100">{value}</dd>
    </div>
  );
}