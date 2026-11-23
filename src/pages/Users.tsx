import { useEffect, useState } from 'react';
import { api, errMsg } from '../api';
import { Box, Err, btn, input } from '../ui';
import { Role } from '../constants';
import type { User } from '../types';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [err, setErr] = useState('');
  const [grant, setGrant] = useState<Record<string, string>>({});

  const load = () => api<User[]>('/users').then(setUsers).catch((e) => setErr(errMsg(e)));
  useEffect(() => {
    load();
  }, []);

  async function give(id: string) {
    try {
      await api('/tokens/grant', { method: 'POST', body: { userId: id, amount: Number(grant[id]) } });
      setGrant({ ...grant, [id]: '' });
      load();
    } catch (e) {
      setErr(errMsg(e));
    }
  }

  return (
    <Box title="Users and balances">
      <Err msg={err} />
      <table className="w-full text-left text-sm">
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-t border-stone-100">
              <td className="py-2">{u.email}</td>
              <td>{u.role === Role.ADMIN ? 'admin' : 'user'}</td>
              <td className="font-medium">{u.tokenBalance}</td>
              <td className="flex gap-2 py-1.5">
                <input className={`${input} w-24`} type="number" min="1" placeholder="grant" value={grant[u._id] || ''} onChange={(e) => setGrant({ ...grant, [u._id]: e.target.value })} />
                <button className={btn} disabled={!grant[u._id]} onClick={() => give(u._id)}>
                  Add
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}
