export const metadata = { title: 'Terms — SummerFinder' };

export default function TermsPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-10 prose dark:prose-invert">
      <h1>Terms of use</h1>
      <p>
        By using SummerFinder you agree to these terms. They’re short on purpose.
      </p>

      <h2>1. The service</h2>
      <p>
        SummerFinder is a free recommendation tool for students. We try hard to
        surface real, useful activities, but we don’t guarantee any particular
        result. Use your judgment before signing up for anything.
      </p>

      <h2>2. Your content</h2>
      <p>
        If you submit an activity, you confirm you have the right to share the
        information. We may edit submissions for clarity and may decline to
        publish anything.
      </p>

      <h2>3. No professional advice</h2>
      <p>
        SummerFinder is not a substitute for advice from parents, guardians,
        teachers, or other trusted adults. Talk to a grown-up before committing
        to anything that costs money or involves meeting new people.
      </p>

      <h2>4. Safety</h2>
      <p>
        We don’t allow activities that target minors in unsafe ways. If you spot
        something off, tell us at{' '}
        <a href="mailto:safety@summerfinder.app">safety@summerfinder.app</a>.
      </p>

      <h2>5. Changes</h2>
      <p>
        We may update these terms. Continued use means you accept the new
        terms.
      </p>

      <p className="text-sm text-stone-500">Last updated: today.</p>
    </article>
  );
}