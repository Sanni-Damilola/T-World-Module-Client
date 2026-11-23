import { FormEvent, useEffect, useState } from 'react';
import { api, errMsg } from '../api';
import { Box, Err, btn, input, when } from '../ui';
import { Role, AiStatus, AI_STATUS_LABEL, TONES, LENGTHS } from '../constants';
import type { User, ContentItem, Paged, SummaryResult } from '../types';

export default function Content({ user, refreshUser }: { user: User; refreshUser: () => void }) {
  const [data, setData] = useState<Paged<ContentItem>>({ items: [], page: 1, pages: 1, total: 0 });
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');
  const [page, setPage] = useState(1);
  const [err, setErr] = useState('');

  const [picked, setPicked] = useState<ContentItem | null>(null);
  const [opts, setOpts] = useState({ tone: 0, length: 0 });
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({ title: '', body: '', tags: '' });

  async function load() {
    try {
      const p = new URLSearchParams({ page: String(page) });
      if (q) p.set('q', q);
      if (tag) p.set('tag', tag);
      setData(await api<Paged<ContentItem>>(`/content?${p}`));
      setErr('');
    } catch (e) {
      setErr(errMsg(e));
    }
  }

  useEffect(() => {
    load();
  }, [page]);

  function search(e: FormEvent) {
    e.preventDefault();
    if (page === 1) load();
    else setPage(1);
  }

  async function summarize() {
    if (!picked) return;
    setBusy(true);
    setResult(null);
    setErr('');
    try {
      setResult(await api<SummaryResult>(`/content/${picked._id}/ai/summarize`, { method: 'POST', body: opts }));
      refreshUser();
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  async function create(e: FormEvent) {
    e.preventDefault();
    try {
      const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
      await api('/content', { method: 'POST', body: { title: form.title, body: form.body, tags } });
      setForm({ title: '', body: '', tags: '' });
      load();
    } catch (e) {
      setErr(errMsg(e));
    }
  }

  return (
    <>
      <Err msg={err} />

      <Box title="Content">
        <form onSubmit={search} className="mb-4 flex gap-2">
          <input className={`${input} flex-1`} placeholder="Search text" value={q} onChange={(e) => setQ(e.target.value)} />
          <input className={`${input} w-40`} placeholder="Tag" value={tag} onChange={(e) => setTag(e.target.value)} />
          <button className={btn}>Search</button>
        </form>

        {data.items.length === 0 && (
          <p className="text-sm text-stone-500">Nothing here yet. {user.role === Role.ADMIN ? 'Add an item below or run npm run seed.' : 'Ask an admin to add content.'}</p>
        )}

        <ul className="divide-y divide-stone-100">
          {data.items.map((c) => (
            <li key={c._id} className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-sm text-stone-500">
                  {c.tags.join(', ') || 'no tags'} · {when(c.createdAt)}
                </p>
              </div>
              <button
                className={btn}
                onClick={() => {
                  setPicked(c);
                  setResult(null);
                }}
              >
                Summarize
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center gap-3 text-sm">
          <button className="underline disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>
          <span>
            Page {data.page} of {data.pages}
          </span>
          <button className="underline disabled:opacity-40" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
      </Box>

      {picked && (
        <Box title={`Summarize: ${picked.title}`}>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <select className={input} value={opts.tone} onChange={(e) => setOpts({ ...opts, tone: Number(e.target.value) })}>
              {TONES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <select className={input} value={opts.length} onChange={(e) => setOpts({ ...opts, length: Number(e.target.value) })}>
              {LENGTHS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            <button className={btn} onClick={summarize} disabled={busy}>
              {busy ? 'Running...' : 'Run summary'}
            </button>
          </div>

          {result && (
            <div className="rounded bg-stone-100 p-3 text-sm">
              {result.fallback && (
                <p className="mb-2 text-amber-700">
                  AI call {AI_STATUS_LABEL[result.status].toLowerCase()} ({result.error}). Showing a basic fallback, no tokens awarded.
                </p>
              )}
              <p className="mb-2">{result.output}</p>
              <p className="text-stone-500">
                {result.latencyMs}ms · +{result.tokensAwarded} tokens · balance {result.totalTokenBalance}
                {result.status === AiStatus.SUCCESS ? '' : ' · not rewarded'}
              </p>
            </div>
          )}
        </Box>
      )}

      {user.role === Role.ADMIN && (
        <Box title="Add content">
          <form onSubmit={create} className="grid gap-2">
            <input className={input} required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea className={input} required rows={4} placeholder="Body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            <input className={input} placeholder="Tags, comma separated" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            <button className={`${btn} w-fit`}>Save</button>
          </form>
        </Box>
      )}
    </>
  );
}
