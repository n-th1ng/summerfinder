import AdminClient from './AdminClient';

export const metadata = { title: 'Admin — SummerFinder' };

export default function AdminPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold">Admin dashboard</h1>
      <p className="text-stone-600 dark:text-stone-400 mt-1">
        Manage activities, review submissions, and see usage stats.
      </p>
      <div className="mt-6">
        <AdminClient />
      </div>
    </div>
  );
}