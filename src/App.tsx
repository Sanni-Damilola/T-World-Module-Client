import { FormEvent, useEffect, useState } from 'react';
import { api, auth, errMsg } from './api';
import { btn, input, Err } from './ui';
import { Role } from './constants';
import type { User } from './types';
import Content from './pages/Content';
import Runs from './pages/Runs';
import Tokens from './pages/Tokens';
import Users from './pages/Users';
import MediaPage from './pages/Media';

function Login({ onDone }: { onDone: (u: User) => void }) {
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      const { token, user } = await api<{ token: string; user: User }>('/auth/login', { method: 'POST', body: { email } });
      auth.set(token);
      onDone(user);
    } catch (e) {
      setErr(errMsg(e));
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-24 max-w-sm rounded border border-stone-200 bg-white p-6">
      <h1 className="mb-1 text-xl font-semibold">T-World admin</h1>
      <p className="mb-4 text-sm text-stone-500">Enter an email. Emails listed in ADMIN_EMAILS get the admin role.</p>
      <Err msg={err} />
      <input className={`${input} mb-3 w-full`} type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button className={`${btn} w-full`}>Sign in</button>
    </form>
  );
}

type Tab = 'content' | 'runs' | 'tokens' | 'media' | 'users';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('content');

  const refreshUser = async () => {
    const b = await api<{ tokenBalance: number }>('/tokens/balance');
    setUser((u) => (u ? { ...u, tokenBalance: b.tokenBalance } : u));
  };

  // restore session on reload
  useEffect(() => {
    if (!auth.token) return setReady(true);
    api<User>('/auth/me')
      .then(setUser)
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  if (!ready) return null;
  if (!user) return <Login onDone={setUser} />;

  const tabs: [Tab, string][] = [
    ['content', 'Content'],
    ['runs', 'AI runs'],
    ['tokens', 'Tokens'],
    ['media', 'Media'],
    ...(user.role === Role.ADMIN ? ([['users', 'Users']] as [Tab, string][]) : []),
  ];

  return (
    <div className="mx-auto max-w-4xl p-4">
      <header className="mb-6 flex items-center justify-between border-b border-stone-200 pb-3">
        <nav className="flex gap-1">
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`rounded px-3 py-1.5 text-sm ${tab === id ? 'bg-stone-900 text-white' : 'hover:bg-stone-200'}`}>
              {label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span>
            {user.email} ({user.role === Role.ADMIN ? 'admin' : 'user'}) · <b>{user.tokenBalance}</b> tokens
          </span>
          <button
            className="text-stone-500 underline"
            onClick={() => {
              auth.clear();
              setUser(null);
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {tab === 'content' && <Content user={user} refreshUser={refreshUser} />}
      {tab === 'runs' && <Runs />}
      {tab === 'tokens' && <Tokens refreshUser={refreshUser} />}
      {tab === 'users' && <Users />}
      {tab === 'media' && <MediaPage />}
    </div>
  );
}
