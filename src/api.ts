const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const auth = {
  get token() {
    return localStorage.getItem('tw_token');
  },
  set(token: string) {
    localStorage.setItem('tw_token', token);
  },
  clear() {
    localStorage.removeItem('tw_token');
  },
};

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  
  const isForm = opts.body instanceof FormData;
  const res = await fetch(BASE + path, {
    method: opts.method ?? 'GET',
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
    },
    body: opts.body ? (isForm ? (opts.body as FormData) : JSON.stringify(opts.body)) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) auth.clear();
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong');
