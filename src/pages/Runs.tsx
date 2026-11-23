import { useEffect, useState } from 'react';
import { api, errMsg } from '../api';
import { Box, Err, when } from '../ui';
import { AiStatus, AI_STATUS_LABEL } from '../constants';
import type { AiRun } from '../types';

const color: Record<AiStatus, string> = { 0: 'text-green-700', 1: 'text-red-700', 2: 'text-amber-700' };

export default function Runs() {
  const [runs, setRuns] = useState<AiRun[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api<AiRun[]>('/ai-runs').then(setRuns).catch((e) => setErr(errMsg(e)));
  }, []);

  return (
    <Box title="AI runs">
      <Err msg={err} />
      {runs.length === 0 && <p className="text-sm text-stone-500">No runs yet. Summarize something from the Content tab.</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <tbody>
            {runs.map((r) => (
              <tr key={r._id} className="border-t border-stone-100 align-top">
                <td className="py-2 pr-3">
                  <p className="font-medium">{r.contentId?.title || 'deleted content'}</p>
                  <p className="text-stone-500">
                    {r.userId?.email} · {when(r.createdAt)}
                  </p>
                  <p className="mt-1 max-w-md">{r.output}</p>
                </td>
                <td className={`py-2 pr-3 ${color[r.status]}`}>{AI_STATUS_LABEL[r.status]}</td>
                <td className="py-2 pr-3">{r.latencyMs}ms</td>
                <td className="py-2">+{r.tokensAwarded}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Box>
  );
}
