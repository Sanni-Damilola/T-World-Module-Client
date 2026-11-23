import type { ReactNode } from 'react';


export const btn = 'rounded bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-700 disabled:opacity-50';
export const input = 'rounded border border-stone-300 bg-white px-2 py-1.5 text-sm';

export function Box({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="mb-6 rounded border border-stone-200 bg-white p-4">
      {title && <h2 className="mb-3 font-semibold">{title}</h2>}
      {children}
    </section>
  );
}

export const Err = ({ msg }: { msg: string }) => (msg ? <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{msg}</p> : null);

export const when = (d: string) => new Date(d).toLocaleString();
