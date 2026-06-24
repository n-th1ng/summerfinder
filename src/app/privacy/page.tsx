export const metadata = { title: 'Privacy — SummerFinder' };

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-10 prose dark:prose-invert">
      <h1>Privacy policy</h1>
      <p className="text-stone-600 dark:text-stone-400">
        We built SummerFinder for students ages 10–18. Privacy is the default, not a
        setting. Here’s exactly what we collect and why.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Quiz answers</strong> (age group, time, budget, interests, etc.) —
          used only to rank activities for you. Stored against an anonymous session
          cookie, not a profile.
        </li>
        <li>
          <strong>An anonymous session id</strong> (a random string in a cookie) —
          used so your saved items and streak survive between visits. Never linked
          to your identity.
        </li>
        <li>
          <strong>A city you type in</strong>, if you choose to share one — used
          only to rank local activities. We don’t ask for your address and we
          don’t use precise geolocation.
        </li>
        <li>
          <strong>If you submit an activity</strong>, we collect your name and
          location so we can credit you. Nothing else.
        </li>
      </ul>

      <h2>What we don’t do</h2>
      <ul>
        <li>We don’t ask for your name, email, school, phone, or address.</li>
        <li>We don’t use third-party trackers, ads, or analytics that follow you around the web.</li>
        <li>We don’t sell or share your data. Period.</li>
      </ul>

      <h2>Your controls</h2>
      <ul>
        <li>Clear your browser cookies to wipe your session and saved items.</li>
        <li>Use the “Remove” button on any saved activity.</li>
        <li>Email us at <a href="mailto:hello@summerfinder.app">hello@summerfinder.app</a> to ask what we have on you.</li>
      </ul>

      <h2>Why we ask for age and location</h2>
      <p>
        Age is used to filter out activities that aren’t appropriate (a coding
        bootcamp for adults isn’t right for a 12-year-old). Location is used so
        that if you say “near me” we can prefer activities in your city. Without
        these, our recommendations would be much worse.
      </p>

      <p className="text-sm text-stone-500">Last updated: today.</p>
    </article>
  );
}