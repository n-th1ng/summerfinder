import Link from 'next/link';

export const metadata = { title: 'Terms — SummerFinder' };

export default function TermsPage() {
  return (
    <article className="container py-12 sm:py-16 max-w-3xl prose prose-stone dark:prose-invert">
      <Link href="/" className="text-sm text-ink-500 hover:text-ink-900 dark:hover:text-ink-100 no-underline">← Home</Link>
      <h1 className="text-display-xl mt-3">Terms of use</h1>
      <p className="text-lg text-ink-700 dark:text-ink-300">
        By using SummerFinder you agree to these terms. They&apos;re short on purpose.
      </p>

      <h2 className="text-display-sm">1. The service</h2>
      <p>SummerFinder is a free recommendation tool for students. We try hard to surface real, useful activities, but we don&apos;t guarantee any particular result. Use your judgment before signing up for anything.</p>

      <h2 className="text-display-sm">2. Your content</h2>
      <p>If you submit an activity, you confirm you have the right to share the information. We may edit submissions for clarity and may decline to publish anything.</p>

      <h2 className="text-display-sm">3. No professional advice</h2>
      <p>SummerFinder is not a substitute for advice from parents, guardians, teachers, or other trusted adults. Talk to a grown-up before committing to anything that costs money or involves meeting new people.</p>

      <h2 className="text-display-sm">4. Safety</h2>
      <p>We don&apos;t allow activities that target minors in unsafe ways. If you spot something off, tell us at <a href="mailto:safety@summerfinder.app">safety@summerfinder.app</a>.</p>

      <h2 className="text-display-sm">5. Changes</h2>
      <p>We may update these terms. Continued use means you accept the new terms.</p>

      <p className="text-sm text-ink-500">Last updated: today.</p>
    </article>
  );
}