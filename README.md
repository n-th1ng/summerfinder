# ☀️ SummerFinder

> Bored this summer? Find something better to do.

SummerFinder is a mobile-first, privacy-first web app that helps students ages
10–18 find summer activities, courses, programs, sports, hobbies, and events in
under 60 seconds. Tap a quick quiz (or chat with the in-app agent) and get
personalized, ranked recommendations.

---

## What's inside

- **8 pages**: Home, Quiz, Results, Activity Detail, Saved, Submit, Admin, Privacy & Terms
- **A conversational agent** that interprets follow-up questions like
  *"find me something free I can do today"* using the same ranking engine.
- **Rule-based recommendation scoring** (with hooks for a future AI ranking layer).
- **Surprise-me mode** + **"I'm bored"** instant picks.
- **Supabase (Postgres) database** via Prisma.
- **Mobile-first UI** with dark mode, large tap targets, animated transitions,
  and a quiz progress bar.
- **30+ seeded activities** across all 10 categories.
- **Privacy-first by design** — see `src/lib/session.ts` and the Privacy page.

---

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/) + custom design tokens
- [Prisma](https://www.prisma.io/) ORM
- [Supabase](https://supabase.com/) (Postgres) — recommended
- [`@supabase/supabase-js`](https://supabase.com/docs/reference/javascript) installed
  for future auth / storage needs
- ESLint (`next lint`) + TypeScript strict mode

> Don't want to use Supabase? Any Postgres provider works — Neon, Railway, etc.
> Just point `DATABASE_URL` at it.

---

## Quick start

### 1. Set up Supabase

1. Create a free project at <https://supabase.com>.
2. In **Project Settings → Database**, copy the **Connection string (URI)**.
3. Paste it into `.env` (see below).

### 2. Configure environment

```bash
cp .env.example .env
# then edit .env and fill in DATABASE_URL and ADMIN_PASSCODE
```

`.env` example:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_REF.supabase.co:5432/postgres?sslmode=require"
ADMIN_PASSCODE="letmein"
```

### 3. Install + initialize

```bash
npm install
npm run setup
```

`npm run setup` runs:
- `prisma generate` — generates the typed Prisma client
- `prisma db push` — pushes the schema to your Supabase database
- `npm run db:seed` — seeds the 12 tags + 35 activities

### 4. Run

```bash
npm run dev
```

Open <http://localhost:3000>.

---

## Scripts

| Command              | What it does                                                    |
| -------------------- | --------------------------------------------------------------- |
| `npm run dev`        | Start the dev server                                            |
| `npm run build`      | Build for production                                            |
| `npm run start`      | Run the production server                                       |
| `npm run lint`       | Lint with Next.js + ESLint                                      |
| `npm run typecheck`  | TypeScript type-check                                           |
| `npm run db:push`    | Push schema to your database                                    |
| `npm run db:seed`    | Seed tags + activities                                          |
| `npm run db:reset`   | Drop + recreate tables and reseed                               |
| `npm run setup`      | One-shot setup (generate, push, seed)                           |

---

## Project layout

```
src/
  app/
    page.tsx              Home
    layout.tsx            Root layout + theme bootstrap
    globals.css
    quiz/page.tsx         60-second clickable quiz
    results/page.tsx      Personalized, ranked, filterable results
    activity/[id]/page.tsx Activity detail
    saved/page.tsx        Bookmarks (per-device session)
    submit/page.tsx       Submit an activity
    admin/page.tsx        Admin dashboard
    admin/AdminClient.tsx
    agent/page.tsx        Conversational agent (full page)
    bored/page.tsx        "I'm bored" / surprise me
    privacy/page.tsx
    terms/page.tsx
    api/
      quiz/submit/route.ts
      recommendations/route.ts
      activity/[id]/route.ts
      save/route.ts
      saved/route.ts
      submissions/route.ts
      agent/route.ts
      admin/activity/route.ts
      admin/activity/[id]/route.ts
      admin/submissions/route.ts
  components/
    ActivityCard.tsx
    AgentPanel.tsx
    SaveButton.tsx
    SavedRow.tsx
    StreakBadge.tsx
    SubmitForm.tsx
    ThemeToggle.tsx
    ui/
      Button.tsx
      ProgressBar.tsx
  lib/
    api.ts
    prisma.ts             Singleton Prisma client
    quiz-config.ts        Quiz questions (JSON-like)
    scoring.ts            Recommendation scoring engine
    agent.ts              Rule-based conversational agent
    session.ts            Anonymous session cookie helpers
prisma/
  schema.prisma           Tables: User, QuizResponse, Activity, ActivityTag,
                          SavedItem, Source, AdminSubmission, UsageEvent
  seed.ts                 30+ activities across all categories
```

---

## How recommendations work

Every activity is scored on eight dimensions and ranked 0–100. See
`src/lib/scoring.ts`.

| Dimension        | Weight | What it measures                                          |
| ---------------- | -----: | --------------------------------------------------------- |
| Age              |     20 | Overlap between user's age bucket and activity range      |
| Location         |     15 | "Near me" / country / online vs activity's reach          |
| Time             |     15 | Closeness of user's available time to activity duration   |
| Budget           |     10 | Exact match on free / low / paid                          |
| Preference       |     10 | Indoor / outdoor / both match                             |
| Mood             |     10 | Tags aligned with active / creative / academic / etc.     |
| Interest         |     15 | Overlap with user's picked interests                      |
| Skill            |      5 | Beginner / intermediate / advanced proximity              |

The agent (`src/lib/agent.ts`) parses follow-up queries (e.g. *"outdoor and
free"*) and overlays them on top of the user's existing quiz answers before
re-ranking. Replacing this with an LLM is a single swap — the output shape
(`{ reply, intent, answers, results }`) is model-agnostic.

---

## API endpoints

| Method | Path                            | Purpose                                        |
| ------ | ------------------------------- | ---------------------------------------------- |
| POST   | `/api/quiz/submit`              | Submit quiz answers, returns ranked results    |
| GET    | `/api/recommendations`          | Get recommendations from query params          |
| GET    | `/api/activity/:id`             | Get a single activity                          |
| POST   | `/api/save`                     | Save an activity to the current session        |
| DELETE | `/api/save?activityId=…`        | Unsave                                         |
| GET    | `/api/saved`                    | List saved activities for this session         |
| POST   | `/api/submissions`              | Submit a new activity for review               |
| POST   | `/api/agent`                    | Talk to the conversational agent               |
| GET    | `/api/admin/activity`           | Stats (requires `x-admin-passcode`)            |
| POST   | `/api/admin/activity`           | Create an activity (admin)                     |
| PATCH  | `/api/admin/activity/:id`       | Update an activity (admin)                     |
| DELETE | `/api/admin/activity/:id`       | Delete an activity (admin)                     |
| GET    | `/api/admin/submissions`        | List submissions (admin)                       |
| PATCH  | `/api/admin/submissions`        | Approve / reject (admin)                       |

---

## Privacy

- **Anonymous sessions only.** No accounts. A random id in an httpOnly cookie
  powers saved items and streaks.
- **Minimum data.** We store quiz answers (to compute recommendations) and,
  optionally, a city (only if you type one). For activity submissions, we store
  your name + location so we can credit you — nothing else.
- **No third-party trackers.** No ads. No data sales.
- **No precise location.** We never request GPS coordinates.

Read the full privacy policy at `/privacy`.

---

## Deployment

Any Node host works:

- **Vercel** — set `DATABASE_URL` and `ADMIN_PASSCODE` in project env, then push.
- **Netlify / Railway / Fly.io** — same.
- **Self-host** — `npm run build && npm run start` behind a reverse proxy.

For Supabase, make sure your connection string includes `?sslmode=require`.

---

## License

MIT — do whatever helps students.