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

export default async function ActivityPage({ params }: { params: { id: string } }) {
  const a = await findActivity(params.id);
  if (!a) notFound();

  const tags = a.tags;
  const accent = CATEGORY_ICON[a.category] ?? CATEGORY_ICON.hobby;

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

      <article className="mt-4 grid lg:grid-cols-[1fr_340px] gap-6 lg:gap-10">
        {/* Main column */}
        <div className="animate-fade-up">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={accent.tone} icon={accent.icon}>{CATEGORY_LABELS[a.category] ?? a.category}</Badge>
            {tags.slice(0, 4).map((t) => (
              <Badge key={t} tone="ink">{INTEREST_LABELS[t]?.label ?? t}</Badge>
            ))}
          </div>

          <h1 className="mt-4 text-display-2xl tracking-tight">{a.title}</h1>

          {/* Primary CTA — goes to source if available, else "search" */}
          {a.sourceUrl && (
            <a
              href={a.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-6 inline-flex items-center gap-2 h-14 px-6 rounded-full bg-coral-500 text-white text-base font-bold hover:bg-coral-600 shadow-soft active:scale-[0.98] transition"
            >
              <Icon name="arrowUpRight" size={18} />
              Open {a.providerName ?? 'source site'}
            </a>
          )}

          <p className="mt-5 text-lg text-ink-700 dark:text-ink-300 leading-relaxed whitespace-pre-line">
            {a.description}
          </p>

          {/* Mobile actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3 lg:hidden">
            <SaveButton activityId={a.id} />
            {a.sourceUrl && (
              <a
                href={a.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center justify-center h-12 px-5 rounded-full bg-ink-900 text-white font-semibold hover:bg-ink-800 dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100"
              >
                Visit source <Icon name="externalLink" size={15} className="ml-2" />
              </a>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5 shadow-lift animate-fade-up">
            <h2 className="text-xs uppercase tracking-wider text-ink-500 font-semibold">At a glance</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <Row icon="clock" label="Time" value={DURATION_LABELS[a.duration]} />
              <Row icon="sparkles" label="Cost" value={COST_LABELS[a.cost]} />
              <Row icon="users" label="Ages" value={`${a.ageMin}–${a.ageMax}`} />
              <Row icon="target" label="Difficulty" value={SKILL_LABELS[a.skillLevel]} />
              <Row icon={a.indoorOutdoor === 'outdoor' ? 'mountain' : a.indoorOutdoor === 'indoor' ? 'house' : 'shapes'} label="Vibe" value={INDOOR_OUTDOOR_LABELS[a.indoorOutdoor]} />
              {a.city && <Row icon="mapPin" label="Where" value={a.city} />}
            </dl>

            <div className="mt-5 pt-5 border-t border-ink-100 dark:border-ink-800 hidden lg:flex flex-col gap-2">
              {a.sourceUrl && (
                <a
                  href={a.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center justify-center h-12 px-5 rounded-full bg-coral-500 text-white font-semibold hover:bg-coral-600 shadow-soft"
                >
                  Open source site <Icon name="externalLink" size={15} className="ml-2" />
                </a>
              )}
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
          <div className="grid sm:grid-cols-3 gap-4 stagger">
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