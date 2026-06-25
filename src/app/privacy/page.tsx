import Link from 'next/link';

export const metadata = { title: 'Privacy — SummerFinder' };

export default function PrivacyPage() {
  return (
    <article className="container py-12 sm:py-16 max-w-3xl prose prose-stone dark:prose-invert">
      <Link href="/" className="text-sm text-ink-500 hover:text-ink-900 dark:hover:text-ink-100 no-underline">← Home</Link>
      <h1 className="text-display-xl mt-3">Privacy policy</h1>
      <p className="text-lg text-ink-700 dark:text-ink-300">
        We built SummerFinder for students ages 10–18. Privacy is the default, not a setting. Here&apos;s exactly what we collect and why.
      </p>

      <h2 className="text-display-sm">What we collect</h2>
      <ul>
        <li><strong>Quiz answers</strong> (age group, time, budget, interests, etc.) — used only to rank activities for you. Stored against an anonymous session cookie, not a profile.</li>
        <li><strong>An anonymous session id</strong> (a random string in a cookie) — used so your saved items and streak survive between visits. Never linked to your identity.</li>
        <li><strong>A city you type in</strong>, if you choose to share one — used only to rank local activities. We don&apos;t ask for your address and we don&apos;t use precise geolocation.</li>
        <li><strong>If you submit an activity</strong>, we collect your name and location so we can credit you. Nothing else.</li>
      </ul>

      <h2 className="text-display-sm">What we don&apos;t do</h2>
      <ul>
        <li>We don&apos;t ask for your name, email, school, phone, or address.</li>
        <li>We don&apos;t use third-party trackers, ads, or analytics that follow you around the web.</li>
        <li>We don&apos;t sell or share your data. Period.</li>
      </ul>

      <h2 className="text-display-sm">Your controls</h2>
      <ul>
        <li>Clear your browser cookies to wipe your session and saved items.</li>
        <li>Use the &ldquo;Remove&rdquo; button on any saved activity.</li>
        <li>Email <a href="mailto:hello@summerfinder.app">hello@summerfinder.app</a> to ask what we have on you.</li>
      </ul>

      <h2 className="text-display-sm">Why we ask for age and location</h2>
      <p>
        Age is used to filter out activities that aren&apos;t appropriate (a coding bootcamp for adults isn&apos;t right for a 12-year-old). Location is used so that if you say &ldquo;near me&rdquo; we can prefer activities in your city. Without these, our recommendations would be much worse.
      </p>

      <p className="text-sm text-ink-500">Last updated: today.</p>
    </article>
  );
}