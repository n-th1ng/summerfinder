import { SubmitForm } from '@/components/SubmitForm';

export const metadata = {
  title: 'Submit an activity — SummerFinder',
};

export default function SubmitPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold">Submit an activity</h1>
      <p className="mt-2 text-stone-600 dark:text-stone-400">
        Know a great summer activity, course, or program? Tell us about it. We
        review submissions and add the best ones to the catalog. We just need your
        name and location so we can credit you.
      </p>

      <div className="card p-5 mt-6">
        <SubmitForm />
      </div>

      <p className="mt-4 text-xs text-stone-500 dark:text-stone-400">
        We don’t collect anything beyond what you enter here. No tracking, no email
        list, no follow-ups unless you ask.
      </p>
    </div>
  );
}