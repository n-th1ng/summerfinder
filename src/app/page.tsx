import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ActivityCard } from '@/components/ActivityCard';
import { prisma } from '@/lib/prisma';
import { rankActivities } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const featured = await prisma.activity.findMany({
    where: { isActive: true, isApproved: true },
    take: 8,
  });

  const decoded = featured.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    category: a.category,
    ageMin: a.ageMin,
    ageMax: a.ageMax,
    locationType: a.locationType,
    city: a.city,
    cost: a.cost,
    duration: a.duration,
    indoorOutdoor: a.indoorOutdoor,
    skillLevel: a.skillLevel,
    tags: JSON.parse(a.tags) as string[],
    sourceUrl: a.sourceUrl,
    providerName: a.providerName,
  }));

  const ranked = rankActivities(decoded, {
    interests: ['coding', 'sports', 'art', 'science'],
    mood: 'creative',
    preference: 'both',
    budget: 'free',
    timeCommitment: 'multi-day',
    skillLevel: 'beginner',
    ageGroup: '14-16',
    location: 'anywhere',
  }).slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="hero-bg">
        <div className="max-w-5xl mx-auto px-4 pt-12 pb-16 sm:pt-20 sm:pb-24 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white/70 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-700 text-xs font-medium">
            Built for ages 10–18 · Privacy-first
          </span>
          <h1 className="mt-5 text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]">
            Bored this summer?
            <br />
            <span className="brand-gradient">Find something better to do.</span>
          </h1>
          <p className="mt-5 text-lg text-stone-700 dark:text-stone-300 max-w-xl mx-auto">
            Answer a few quick taps and we’ll suggest activities, courses, sports, and
            projects you’ll actually want to try.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/quiz">
              <Button size="lg" className="animate-pop">
                Start the 60-second quiz 🚀
              </Button>
            </Link>
            <Link href="/bored">
              <Button size="lg" variant="secondary">
                I’m bored — surprise me ✨
              </Button>
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-stone-600 dark:text-stone-400">
            <li>✅ No account needed</li>
            <li>✅ We never sell your data</li>
            <li>✅ Made for students, with students</li>
          </ul>
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold">Popular this week</h2>
          <Link href="/quiz" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
            Get personalized picks →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ranked.map((a, i) => (
            <ActivityCard key={a.id} activity={a} index={i} compact />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">How it works</h2>
        <ol className="grid sm:grid-cols-3 gap-4">
          {[
            { e: '👆', t: 'Tap a few quick answers', d: 'Age, interests, time, and budget — all big buttons.' },
            { e: '🧠', t: 'We rank the best fits', d: 'Every activity is scored on age, location, time, interests and more.' },
            { e: '🎉', t: 'Save and try something', d: 'Bookmark the ones you like. Come back any time.' },
          ].map((s) => (
            <li key={s.t} className="card p-5">
              <div className="text-3xl" aria-hidden>{s.e}</div>
              <p className="mt-2 font-semibold">{s.t}</p>
              <p className="text-sm text-stone-600 dark:text-stone-400">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Parent CTA */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Parents & guardians</h3>
            <p className="text-stone-600 dark:text-stone-400 mt-1 max-w-xl">
              SummerFinder is designed with youth privacy in mind. We collect the
              minimum data needed to recommend activities and we never sell or share
              your information.
            </p>
          </div>
          <Link href="/privacy" className="shrink-0">
            <Button variant="secondary">Read our privacy policy</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}