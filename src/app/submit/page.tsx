import { SubmitForm } from '@/components/SubmitForm';
import { Icon } from '@/components/Icon';

export const metadata = {
  title: 'Submit an activity — SummerFinder',
};

export default function SubmitPage() {
  return (
    <div className="container py-10 sm:py-14 max-w-2xl">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-coral-50 dark:bg-coral-500/15 text-coral-500 mb-4">
        <Icon name="plusCircle" size={24} />
      </div>
      <h1 className="text-display-lg">Submit an activity</h1>
      <p className="mt-3 text-ink-600 dark:text-ink-400 max-w-xl">
        Know a great summer activity, course, or program? Tell us about it. We
        review submissions and add the best ones to the catalog. We just need your
        name and location so we can credit you.
      </p>

      <div className="card p-5 sm:p-7 mt-8 shadow-soft">
        <SubmitForm />
      </div>

      <p className="mt-4 text-xs text-ink-500 text-center inline-flex items-center gap-1.5">
        <Icon name="shield" size={12} /> We don&apos;t collect anything beyond what you enter here.
      </p>
    </div>
  );
}