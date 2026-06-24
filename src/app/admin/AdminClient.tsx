'use client';

import { useEffect, useState } from 'react';

type Stats = {
  stats: { total: number; approved: number; pending: number; saves: number; quizzes: number };
  topTags: [string, number][];
  topSaved: { id: string; title: string | null; count: number }[];
  recentEvents: { id: string; kind: string; createdAt: string; payload: string | null }[];
};

type Submission = {
  id: string;
  submitterName: string;
  submitterLocation: string;
  status: string;
  createdAt: string;
  payload: string;
  activity: { id: string; title: string } | null;
};

export default function AdminClient() {
  const [passcode, setPasscode] = useState('');
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadAll(p: string) {
    const headers = { 'x-admin-passcode': p };
    const [s, u] = await Promise.all([
      fetch('/api/admin/activity', { headers }),
      fetch('/api/admin/submissions', { headers }),
    ]);
    const sj = await s.json();
    const uj = await u.json();
    if (!sj.ok) {
      setError(sj.error || 'Could not load stats');
      return false;
    }
    if (!uj.ok) {
      setError(uj.error || 'Could not load submissions');
      return false;
    }
    setStats(sj.data);
    setSubs(uj.data.submissions);
    return true;
  }

  async function tryLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const ok = await loadAll(passcode);
    if (ok) {
      setAuthed(true);
      try {
        sessionStorage.setItem('sf-admin-pass', passcode);
      } catch {}
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem('sf-admin-pass');
    if (saved) {
      setPasscode(saved);
      loadAll(saved).then((ok) => {
        if (ok) setAuthed(true);
      });
    }
  }, []);

  async function decide(id: string, status: 'approved' | 'rejected' | 'pending') {
    const headers = { 'Content-Type': 'application/json', 'x-admin-passcode': passcode };
    const res = await fetch('/api/admin/submissions', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      const ok = await loadAll(passcode);
      if (!ok) setAuthed(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    const headers = { 'Content-Type': 'application/json', 'x-admin-passcode': passcode };
    await fetch(`/api/admin/activity/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ isActive }),
    });
    loadAll(passcode);
  }

  if (!authed) {
    return (
      <form onSubmit={tryLogin} className="card p-6 max-w-md mx-auto mt-10 space-y-3">
        <h1 className="text-2xl font-bold">Admin sign-in</h1>
        <p className="text-sm text-stone-500">
          Set <code>ADMIN_PASSCODE</code> in <code>.env</code>. Default is{' '}
          <code>letmein</code> for local development.
        </p>
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Passcode"
          className="w-full h-12 rounded-xl bg-stone-100 dark:bg-stone-800 px-3"
        />
        <button
          type="submit"
          className="w-full h-12 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600"
        >
          Sign in
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    );
  }

  return (
    <div className="space-y-8">
      {stats && (
        <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Stat label="Activities" value={stats.stats.total} />
          <Stat label="Approved" value={stats.stats.approved} />
          <Stat label="Pending submissions" value={stats.stats.pending} />
          <Stat label="Saves" value={stats.stats.saves} />
          <Stat label="Quizzes" value={stats.stats.quizzes} />
        </section>
      )}

      {stats && (
        <section className="grid sm:grid-cols-2 gap-4">
          <div className="card p-4">
            <h2 className="font-bold mb-2">Top interests picked</h2>
            <ul className="space-y-1.5">
              {stats.topTags.length === 0 && (
                <li className="text-sm text-stone-500">No data yet.</li>
              )}
              {stats.topTags.map(([tag, count]) => (
                <li key={tag} className="flex items-center gap-2 text-sm">
                  <span className="font-medium w-32">{tag}</span>
                  <div className="flex-1 h-2 rounded-full bg-stone-100 dark:bg-stone-800">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${Math.min(100, count * 8)}%` }}
                    />
                  </div>
                  <span className="tabular-nums text-stone-500 w-8 text-right">{count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-4">
            <h2 className="font-bold mb-2">Most saved</h2>
            <ul className="space-y-1.5 text-sm">
              {stats.topSaved.length === 0 && (
                <li className="text-stone-500">No data yet.</li>
              )}
              {stats.topSaved.map((s) => (
                <li key={s.id} className="flex justify-between gap-3">
                  <span className="truncate">{s.title ?? '(deleted)'}</span>
                  <span className="tabular-nums text-stone-500">{s.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section>
        <h2 className="font-bold mb-2">Submissions</h2>
        <div className="space-y-3">
          {subs.length === 0 && <p className="text-sm text-stone-500">No submissions yet.</p>}
          {subs.map((s) => {
            let payload: any = {};
            try {
              payload = JSON.parse(s.payload);
            } catch {}
            return (
              <article key={s.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold">{payload.title || '(untitled)'}</p>
                    <p className="text-xs text-stone-500">
                      from {s.submitterName} in {s.submitterLocation} ·{' '}
                      {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      s.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : s.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                {payload.description && (
                  <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 line-clamp-3">
                    {payload.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.status !== 'approved' && (
                    <button
                      onClick={() => decide(s.id, 'approved')}
                      className="h-10 px-4 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600"
                    >
                      Approve
                    </button>
                  )}
                  {s.status !== 'rejected' && (
                    <button
                      onClick={() => decide(s.id, 'rejected')}
                      className="h-10 px-4 rounded-xl bg-stone-200 dark:bg-stone-800 text-sm font-semibold hover:bg-stone-300 dark:hover:bg-stone-700"
                    >
                      Reject
                    </button>
                  )}
                  {s.status !== 'pending' && (
                    <button
                      onClick={() => decide(s.id, 'pending')}
                      className="h-10 px-4 rounded-xl bg-stone-200 dark:bg-stone-800 text-sm font-semibold hover:bg-stone-300 dark:hover:bg-stone-700"
                    >
                      Mark pending
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {stats && (
        <section>
          <h2 className="font-bold mb-2">Recent activity</h2>
          <div className="card divide-y divide-stone-200 dark:divide-stone-800">
            {stats.recentEvents.length === 0 && (
              <p className="p-4 text-sm text-stone-500">No events yet.</p>
            )}
            {stats.recentEvents.slice(0, 12).map((e) => (
              <div key={e.id} className="p-3 text-sm flex justify-between gap-2">
                <span className="font-mono text-xs">{e.kind}</span>
                <span className="text-stone-500">
                  {new Date(e.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="text-xs text-stone-500">
        Tip: use the API endpoints directly with <code>x-admin-passcode</code> for
        full CRUD on activities.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wider text-stone-500">{label}</p>
      <p className="text-3xl font-extrabold mt-1 tabular-nums">{value}</p>
    </div>
  );
}