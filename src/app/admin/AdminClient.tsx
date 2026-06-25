'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Icon, type IconName } from '@/components/Icon';

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

const STATUS_TONE: Record<string, 'success' | 'danger' | 'ink'> = {
  approved: 'success',
  rejected: 'danger',
  pending: 'ink',
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
      try { sessionStorage.setItem('sf-admin-pass', passcode); } catch {}
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem('sf-admin-pass');
    if (saved) {
      setPasscode(saved);
      loadAll(saved).then((ok) => { if (ok) setAuthed(true); });
    }
  }, []);

  async function decide(id: string, status: 'approved' | 'rejected' | 'pending') {
    const headers = { 'Content-Type': 'application/json', 'x-admin-passcode': passcode };
    const res = await fetch('/api/admin/submissions', {
      method: 'PATCH', headers,
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      const ok = await loadAll(passcode);
      if (!ok) setAuthed(false);
    }
  }

  if (!authed) {
    return (
      <form onSubmit={tryLogin} className="card p-7 max-w-md mx-auto mt-10 shadow-lift space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-coral-50 dark:bg-coral-500/15 text-coral-500">
          <Icon name="lock" size={22} />
        </div>
        <h2 className="text-xl font-bold">Admin sign-in</h2>
        <p className="text-sm text-ink-600 dark:text-ink-400">
          Set <code className="px-1 rounded bg-ink-100 dark:bg-ink-800">ADMIN_PASSCODE</code> in <code className="px-1 rounded bg-ink-100 dark:bg-ink-800">.env</code>. Default is <code className="px-1 rounded bg-ink-100 dark:bg-ink-800">letmein</code> for local dev.
        </p>
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Passcode"
          className="w-full h-12 rounded-full bg-ink-100 dark:bg-ink-800 px-4 focus:outline-none focus:ring-2 focus:ring-coral-400"
        />
        <Button type="submit" fullWidth size="lg" iconRight="arrowRight">Sign in</Button>
        {error && (
          <p className="text-sm text-red-600 inline-flex items-center gap-1.5">
            <Icon name="close" size={14} /> {error}
          </p>
        )}
      </form>
    );
  }

  return (
    <div className="space-y-8">
      {stats && (
        <section className="grid grid-cols-2 sm:grid-cols-5 gap-3 stagger">
          <Stat icon="zap" label="Activities" value={stats.stats.total} />
          <Stat icon="check" label="Approved" value={stats.stats.approved} />
          <Stat icon="send" label="Pending" value={stats.stats.pending} />
          <Stat icon="bookmark" label="Saves" value={stats.stats.saves} />
          <Stat icon="target" label="Quizzes" value={stats.stats.quizzes} />
        </section>
      )}

      {stats && (
        <section className="grid sm:grid-cols-2 gap-4">
          <div className="card p-5 shadow-soft">
            <h2 className="font-bold mb-3 inline-flex items-center gap-2"><Icon name="flame" size={16} /> Top interests</h2>
            <ul className="space-y-2">
              {stats.topTags.length === 0 && <li className="text-sm text-ink-500">No data yet.</li>}
              {stats.topTags.map(([tag, count]) => (
                <li key={tag} className="flex items-center gap-2 text-sm">
                  <span className="font-semibold w-32 capitalize">{tag}</span>
                  <div className="flex-1 h-2 rounded-full bg-ink-100 dark:bg-ink-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-coral-500 to-magenta-500" style={{ width: `${Math.min(100, count * 8)}%` }} />
                  </div>
                  <span className="tabular-nums text-ink-500 w-8 text-right">{count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-5 shadow-soft">
            <h2 className="font-bold mb-3 inline-flex items-center gap-2"><Icon name="trophy" size={16} /> Most saved</h2>
            <ul className="space-y-2 text-sm">
              {stats.topSaved.length === 0 && <li className="text-ink-500">No data yet.</li>}
              {stats.topSaved.map((s) => (
                <li key={s.id} className="flex justify-between gap-3 py-1.5 border-b border-ink-100 dark:border-ink-800 last:border-0">
                  <span className="truncate">{s.title ?? '(deleted)'}</span>
                  <span className="tabular-nums font-semibold">{s.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section>
        <h2 className="font-bold mb-3 inline-flex items-center gap-2"><Icon name="send" size={16} /> Submissions</h2>
        <div className="space-y-3">
          {subs.length === 0 && <p className="text-sm text-ink-500">No submissions yet.</p>}
          {subs.map((s) => {
            let payload: any = {};
            try { payload = JSON.parse(s.payload); } catch {}
            return (
              <article key={s.id} className="card p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold">{payload.title || '(untitled)'}</p>
                    <p className="text-xs text-ink-500 inline-flex items-center gap-1.5">
                      <Icon name="user" size={12} /> {s.submitterName}
                      <span aria-hidden>·</span>
                      <Icon name="mapPin" size={12} /> {s.submitterLocation}
                      <span aria-hidden>·</span>
                      {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[s.status] ?? 'ink'}>{s.status}</Badge>
                </div>
                {payload.description && (
                  <p className="text-sm text-ink-600 dark:text-ink-400 mt-3 line-clamp-3">{payload.description}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.status !== 'approved' && (
                    <Button size="sm" variant="lime" iconLeft="check" onClick={() => decide(s.id, 'approved')}>Approve</Button>
                  )}
                  {s.status !== 'rejected' && (
                    <Button size="sm" variant="secondary" onClick={() => decide(s.id, 'rejected')}>Reject</Button>
                  )}
                  {s.status !== 'pending' && (
                    <Button size="sm" variant="ghost" onClick={() => decide(s.id, 'pending')}>Mark pending</Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {stats && (
        <section>
          <h2 className="font-bold mb-3 inline-flex items-center gap-2"><Icon name="zap" size={16} /> Recent events</h2>
          <div className="card divide-y divide-ink-100 dark:divide-ink-800 shadow-soft overflow-hidden">
            {stats.recentEvents.length === 0 && <p className="p-4 text-sm text-ink-500">No events yet.</p>}
            {stats.recentEvents.slice(0, 12).map((e) => (
              <div key={e.id} className="p-3 text-sm flex justify-between gap-2">
                <span className="font-mono text-xs">{e.kind}</span>
                <span className="text-ink-500">{new Date(e.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="text-xs text-ink-500">
        Tip: hit the API endpoints directly with <code className="px-1 rounded bg-ink-100 dark:bg-ink-800">x-admin-passcode</code> for full activity CRUD.
      </p>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: IconName; label: string; value: number }) {
  return (
    <div className="card p-4 shadow-soft">
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-coral-50 dark:bg-coral-500/15 text-coral-500 mb-2">
        <Icon name={icon} size={16} />
      </div>
      <p className="text-xs uppercase tracking-wider text-ink-500">{label}</p>
      <p className="text-3xl font-extrabold tabular-nums mt-1">{value}</p>
    </div>
  );
}