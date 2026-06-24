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
import { SaveButton } from '@/components/SaveButton';

export const dynamic = 'force-dynamic';

export default async function ActivityPage({ params }: { params: { id: string } }) {
  const a = await prisma.activity.findUnique({ where: { id: params.id } });
  if (!a || !a.isActive || !a.isApproved) notFound();

  const tags = JSON.parse(a.tags) as string[];
  const related = await prisma.activity.findMany({
    where: {
      isActive: true,
      isApproved: true,
      id: { not: a.id },
      OR: [{ category: a.category }, { locationType: a.locationType }],
    },
    take: 3,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/results" className="text-sm text-stone-500 hover:underline">
        ← Back to results
      </Link>

      <article className="card p-6 sm:p-8 mt-4 animate-fade-in">
        <p className="text-xs uppercase tracking-wider text-stone-500">
          {CATEGORY_LABELS[a.category] ?? a.category}
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold mt-1">{a.title}</h1>

        {tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <li
                key={t}
                className="text-xs px-2 py-1 rounded-full bg-stone-100 dark:bg-stone-800"
              >
                {INTEREST_LABELS[t]?.emoji ?? '•'} {INTEREST_LABELS[t]?.label ?? t}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-5 text-stone-700 dark:text-stone-300 text-lg leading-relaxed whitespace-pre-line">
          {a.description}
        </p>

        <dl className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <Stat k="Time" v={DURATION_LABELS[a.duration]} />
          <Stat k="Cost" v={COST_LABELS[a.cost]} />
          <Stat k="Ages" v={`${a.ageMin}–${a.ageMax}`} />
          <Stat k="Difficulty" v={SKILL_LABELS[a.skillLevel]} />
          <Stat k="Where" v={a.city ?? INDOOR_OUTDOOR_LABELS[a.indoorOutdoor]} />
          <Stat k="Vibe" v={INDOOR_OUTDOOR_LABELS[a.indoorOutdoor]} />
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <SaveButton activityId={a.id} />
          {a.sourceUrl && (
            <a
              href={a.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center justify-center h-12 px-5 rounded-2xl bg-brand-500 text-white font-semibold hover:bg-brand-600"
            >
              Visit source ↗
            </a>
          )}
          {a.providerName && (
            <span className="text-sm text-stone-500">Provided by {a.providerName}</span>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-3">You might also like</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/activity/${r.id}`}
                className="card p-4 hover:shadow-md transition"
              >
                <p className="text-xs text-stone-500 uppercase tracking-wider">
                  {CATEGORY_LABELS[r.category] ?? r.category}
                </p>
                <p className="font-semibold mt-1">{r.title}</p>
                <p className="text-xs text-stone-500 mt-1">
                  {DURATION_LABELS[r.duration]} · {COST_LABELS[r.cost]}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="card p-3">
      <dt className="text-xs uppercase tracking-wider text-stone-500">{k}</dt>
      <dd className="font-semibold mt-1">{v}</dd>
    </div>
  );
}