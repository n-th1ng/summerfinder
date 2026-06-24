import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl" aria-hidden>🧭</div>
      <h1 className="text-3xl font-bold mt-3">We couldn’t find that.</h1>
      <p className="text-stone-600 dark:text-stone-400 mt-2">
        The activity or page may have been removed.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-brand-500 text-white font-semibold hover:bg-brand-600"
      >
        Take me home
      </Link>
    </div>
  );
}