import { useEffect, useState } from 'react';
import { api, errMsg } from '../api';
import { Box, Err, btn, input, when } from '../ui';
import { ConversionStatus, ASSET_LABEL, CONVERSION_STATUS_LABEL, TX_TYPE_LABEL, TX_SOURCE_LABEL } from '../constants';
import type { Tx, Conversion, Paged } from '../types';

export default function Tokens({ refreshUser }: { refreshUser: () => void }) {
  const [history, setHistory] = useState<Tx[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [asset, setAsset] = useState('MOCK_USDT'); // the API takes the asset by name
  const [amount, setAmount] = useState('100');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function load() {
    try {
      const [h, c] = await Promise.all([api<Paged<Tx>>('/tokens/history'), api<Conversion[]>('/tokens/conversions')]);
      setHistory(h.items);
      setConversions(c);
    } catch (e) {
      setErr(errMsg(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function run(fn: () => Promise<string>) {
    setErr('');
    setMsg('');
    try {
      setMsg(await fn());
      await load();
      refreshUser();
    } catch (e) {
      setErr(errMsg(e));
    }
  }

  const convert = () =>
    run(async () => {
      const r = await api<{ convertedAmount: string; txHashMock: string }>('/tokens/convert', {
        method: 'POST',
        body: { toAsset: asset, amount: Number(amount) },
      });
      return `Converted to ${r.convertedAmount}. tx ${r.txHashMock.slice(0, 18)}...`;
    });

  const withdraw = (id: string) =>
    run(async () => {
      const r = await api<{ status: string; network: string; txHashMock: string }>('/tokens/withdraw', {
        method: 'POST',
        body: { conversionId: id },
      });
      return `Withdrawal ${r.status} on ${r.network}. tx ${r.txHashMock.slice(0, 18)}...`;
    });

  return (
    <>
      <Err msg={err} />
      {msg && <p className="mb-3 rounded bg-green-50 p-2 text-sm text-green-800">{msg}</p>}

      <Box title="Convert tokens">
        <p className="mb-2 text-sm text-stone-500">Rates: 100 tokens = 1 MOCK_USDT, 200 tokens = 0.01 MOCK_ETH.</p>
        <div className="flex gap-2">
          <select className={input} value={asset} onChange={(e) => setAsset(e.target.value)}>
            <option>MOCK_USDT</option>
            <option>MOCK_ETH</option>
          </select>
          <input className={`${input} w-28`} type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button className={btn} onClick={convert}>
            Convert
          </button>
        </div>
      </Box>

      <Box title="Conversions">
        {conversions.length === 0 && <p className="text-sm text-stone-500">No conversions yet.</p>}
        {conversions.map((c) => (
          <div key={c._id} className="flex items-center justify-between border-t border-stone-100 py-2 text-sm first:border-0">
            <span>
              {c.amount} tokens → {c.convertedAmount} {ASSET_LABEL[c.toAsset]} <span className="text-stone-500">({CONVERSION_STATUS_LABEL[c.status]})</span>
            </span>
            {c.status === ConversionStatus.CONFIRMED && (
              <button className={btn} onClick={() => withdraw(c._id)}>
                Withdraw
              </button>
            )}
          </div>
        ))}
      </Box>

      <Box title="Transaction history">
        {history.length === 0 && <p className="text-sm text-stone-500">No transactions yet.</p>}
        <table className="w-full text-left text-sm">
          <tbody>
            {history.map((t) => (
              <tr key={t._id} className="border-t border-stone-100">
                <td className="py-1.5">{TX_TYPE_LABEL[t.type]}</td>
                <td>{TX_SOURCE_LABEL[t.source]}</td>
                <td className={t.amount < 0 ? 'text-red-700' : 'text-green-700'}>{t.amount > 0 ? `+${t.amount}` : t.amount}</td>
                <td>bal {t.balanceAfter}</td>
                <td className="text-stone-500">{when(t.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </>
  );
}
