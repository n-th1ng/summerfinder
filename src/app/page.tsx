import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { rankActivities, type ScoredActivity } from '@/lib/scoring';
import { Button } from '@/components/ui/Button';
import { ActivityCard } from '@/components/ActivityCard';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/Icon';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let ranked: ScoredActivity[] = [];
  let totalCount = 0;
  try {
    const featured = await prisma.activity.findMany({
      where: { isActive: true, isApproved: true },
      take: 12,
    });
    totalCount = await prisma.activity.count({ where: { isActive: true, isApproved: true } });
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
    ranked = rankActivities(decoded, {
      interests: ['coding', 'sports', 'art', 'science'],
      mood: 'creative',
      preference: 'both',
      budget: 'free',
      timeCommitment: 'multi-day',
      skillLevel: 'beginner',
      ageGroup: '14-16',
      location: 'anywhere',
    }).slice(0, 6);
  } catch {
    ranked = [];
  }

  const tagPills = [
    { icon: 'sparkles' as const, label: 'Personalized', tone: 'magenta' as const },
    { icon: 'zap' as const, label: '60 seconds', tone: 'coral' as const },
    { icon: 'shield' as const, label: 'Privacy-first', tone: 'sky' as const },
    { icon: 'trophy' as const, label: 'Made for students', tone: 'lime' as const },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-mesh">
        <div className="bg-dots absolute inset-0 opacity-60" aria-hidden />
        <div className="container relative pt-12 pb-16 sm:pt-20 sm:pb-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-ink-900/80 backdrop-blur px-3 py-1.5 text-xs font-semibold ring-1 ring-ink-200/60 dark:ring-ink-700">
              <span className="inline-block w-2 h-2 rounded-full bg-coral-500 animate-pulse" />
              <span>New · Built for ages 10–18</span>
            </div>

            <h1 className="mt-6 text-display-2xl">
              Bored this summer?{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-coral-500 via-magenta-500 to-sky-500 bg-clip-text text-transparent">
                  Find something
                </span>
                <span aria-hidden className="absolute -bottom-1 left-0 right-0 h-3 bg-lime-300/60 dark:bg-lime-400/30 -rotate-1 rounded-full -z-0" />
              </span>{' '}
              better to do.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-ink-700 dark:text-ink-300 max-w-xl leading-relaxed">
              A 60-second quiz that recommends summer activities, courses, programs,
              and hobbies — ranked by how well they fit you.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/quiz">
                <Button size="xl" iconLeft="rocket" iconRight="arrowRight">
                  Start the quiz
                </Button>
              </Link>
              <Link href="/bored">
                <Button size="xl" variant="outline" iconLeft="sparkles">
                  I&apos;m bored — surprise me
                </Button>
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-2">
              {tagPills.map((t) => (
                <li key={t.label}>
                  <Badge tone={t.tone} icon={t.icon}>{t.label}</Badge>
                </li>
              ))}
            </ul>
          </div>

          {/* Floating preview card */}
          <div className="hidden lg:block absolute right-8 top-32 w-[320px] animate-float">
            <div className="card p-4 shadow-float rotate-2">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-coral-700">
                <Icon name="sparkles" size={14} /> Top match for you
              </div>
              <p className="mt-2 font-bold text-[17px] leading-snug">Build Your First Website</p>
              <p className="mt-1 text-xs text-ink-600 dark:text-ink-400">
                A self-paced coding track — HTML, CSS, JavaScript.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  <Icon name="check" size={10} /> 96% match
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200">
                  <Icon name="clock" size={10} /> Multi-day
                </span>
              </div>
            </div>
            <div className="card p-3 mt-3 ml-8 shadow-soft -rotate-2 w-[260px]">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-sky-700">
                <Icon name="trophy" size={12} /> Streak
              </div>
              <p className="mt-1 font-bold">3-day streak 🔥</p>
              <p className="text-[11px] text-ink-500">Try something new every day</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="container -mt-8 relative z-10">
        <div className="card shadow-lift p-1.5 grid grid-cols-3 overflow-hidden">
          {[
            { v: totalCount || '30+', l: 'Activities' },
            { v: '10', l: 'Categories' },
            { v: '<60s', l: 'To your picks' },
          ].map((s) => (
            <div key={s.l} className="px-4 py-3 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight">{s.v}</p>
              <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular picks */}
      <section className="container pt-16">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-coral-600 dark:text-coral-400 font-semibold">For you</p>
            <h2 className="mt-1 text-display-lg">Popular this week</h2>
          </div>
          <Link href="/quiz">
            <Button variant="ghost" iconRight="arrowRight">Get personalized picks</Button>
          </Link>
        </div>

        {ranked.length === 0 ? (
          <div className="card p-10 text-center">
            <Icon name="sparkles" size={32} className="text-coral-500 mx-auto" />
            <p className="mt-3 font-semibold">No activities loaded yet.</p>
            <p className="mt-1 text-sm text-ink-600 dark:text-ink-400 max-w-md mx-auto">
              Set <code className="px-1 py-0.5 rounded bg-ink-100 dark:bg-ink-800">DATABASE_URL</code> on Vercel
              and run <code className="px-1 py-0.5 rounded bg-ink-100 dark:bg-ink-800">npm run setup</code> to seed.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
            {ranked.map((a, i) => (
              <ActivityCard key={a.id} activity={a} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="container pt-20">
        <div className="text-center max-w-xl mx-auto">
          <p className="text-xs uppercase tracking-wider text-sky-600 dark:text-sky-400 font-semibold">How it works</p>
          <h2 className="mt-1 text-display-lg">Three taps. Real picks.</h2>
        </div>
        <ol className="mt-10 grid sm:grid-cols-3 gap-5">
          {[
            { n: '01', icon: 'tap', e: '👆', t: 'Tap a few quick answers', d: 'Age, interests, time, budget — all big buttons, no typing required.' },
            { n: '02', icon: 'wand', e: '🧠', t: 'We rank the best fits', d: 'Every activity is scored on age, location, time, interests and more.' },
            { n: '03', icon: 'rocket', e: '🎉', t: 'Save and try something', d: 'Bookmark the ones you like. Come back any time.' },
          ].map((s) => (
            <li key={s.t} className="card p-6 relative overflow-hidden card-hover">
              <span aria-hidden className="absolute -top-4 -right-2 text-[120px] font-black text-ink-100 dark:text-ink-800/50 select-none leading-none">{s.n}</span>
              <div className="relative">
                <div className="inline-flex items-center justify-center h-11 w-11 rounded-full bg-coral-500 text-white shadow-soft">
                  <Icon name="zap" size={20} />
                </div>
                <p className="mt-4 font-bold text-lg">{s.t}</p>
                <p className="text-sm text-ink-600 dark:text-ink-400 mt-1">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Marquee of categories */}
      <section className="container pt-20">
        <div className="text-center max-w-xl mx-auto mb-8">
          <p className="text-xs uppercase tracking-wider text-magenta-600 dark:text-magenta-400 font-semibold">Browse by interest</p>
          <h2 className="mt-1 text-display-lg">Pick a vibe</h2>
        </div>
        <div className="marquee">
          <div className="marquee-track">
            {['Sports', 'Coding', 'Art', 'Reading', 'Business', 'Volunteering', 'Gaming', 'Fitness', 'Music', 'Science', 'Clubs', 'Courses'].map((t) => (
              <span key={t} className="inline-flex items-center gap-2 px-5 h-12 rounded-full bg-white dark:bg-ink-800 ring-1 ring-ink-200 dark:ring-ink-700 text-base font-semibold whitespace-nowrap">
                <span className="text-coral-500">✦</span> {t}
              </span>
            ))}
            {['Sports', 'Coding', 'Art', 'Reading', 'Business', 'Volunteering', 'Gaming', 'Fitness', 'Music', 'Science', 'Clubs', 'Courses'].map((t) => (
              <span key={`d-${t}`} className="inline-flex items-center gap-2 px-5 h-12 rounded-full bg-white dark:bg-ink-800 ring-1 ring-ink-200 dark:ring-ink-700 text-base font-semibold whitespace-nowrap">
                <span className="text-coral-500">✦</span> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Parent CTA */}
      <section className="container pt-20">
        <div className="relative overflow-hidden rounded-4xl bg-ink-900 text-white p-8 sm:p-12">
          <div className="absolute inset-0 bg-mesh opacity-30" aria-hidden />
          <div className="relative grid sm:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <Badge tone="lime" icon="shield">For parents & guardians</Badge>
              <h3 className="mt-4 text-display-md">Privacy is the default.</h3>
              <p className="mt-3 text-ink-300 max-w-xl">
                We collect the minimum data needed to recommend activities and we
                never sell or share your information. Read the full policy.
              </p>
            </div>
            <Link href="/privacy">
              <Button variant="lime" size="lg" iconRight="arrowRight">Read privacy policy</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}