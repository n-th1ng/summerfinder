import AdminClient from './AdminClient';

export const metadata = { title: 'Admin — SummerFinder' };

export default function AdminPage() {
  return (
    <div className="container py-10 sm:py-14">
      <p className="text-xs uppercase tracking-wider text-coral-600 dark:text-coral-400 font-semibold">Dashboard</p>
      <h1 className="mt-1 text-display-lg">Admin</h1>
      <p className="mt-2 text-ink-600 dark:text-ink-400">
        Manage activities, review submissions, and see usage stats.
      </p>
      <div className="mt-8">
        <AdminClient />
      </div>
    </div>
  );
}