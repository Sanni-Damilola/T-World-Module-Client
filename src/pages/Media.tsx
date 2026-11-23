import { FormEvent, useEffect, useRef, useState } from 'react';
import { api, errMsg } from '../api';
import { Box, Err, btn, when } from '../ui';
import { Storage, STORAGE_LABEL } from '../constants';
import type { Media } from '../types';

export default function MediaPage() {
  const [files, setFiles] = useState<Media[]>([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const picker = useRef<HTMLInputElement>(null);

  const load = () => api<Media[]>('/media').then(setFiles).catch((e) => setErr(errMsg(e)));
  useEffect(() => {
    load();
  }, []);

  async function upload(e: FormEvent) {
    e.preventDefault();
    const file = picker.current?.files?.[0];
    if (!file) return setErr('Pick a file first');

    setBusy(true);
    setErr('');
    try {
      const body = new FormData();
      body.append('file', file); 
      await api('/media/upload', { method: 'POST', body });
      if (picker.current) picker.current.value = '';
      await load();
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  async function promote(id: string) {
    setErr('');
    try {
      await api(`/media/${id}/promote`, { method: 'POST', body: {} });
      await load();
    } catch (e) {
      setErr(errMsg(e));
    }
  }

  return (
    <>
      <Err msg={err} />

      <Box title="Upload">
        <form onSubmit={upload} className="flex items-center gap-2">
          <input ref={picker} type="file" className="text-sm" />
          <button className={btn} disabled={busy}>
            {busy ? 'Uploading...' : 'Upload'}
          </button>
        </form>
        <p className="mt-2 text-sm text-stone-500">New files land in short-term storage (Cloudinary). Promote moves them to S3.</p>
      </Box>

      <Box title="Files">
        {files.length === 0 && <p className="text-sm text-stone-500">No files yet.</p>}
        {files.map((f) => (
          <div key={f._id} className="flex items-center justify-between gap-4 border-t border-stone-100 py-2 text-sm first:border-0">
            <div className="min-w-0">
              {f.mimeType?.startsWith('image/') && (
                <img src={f.url} alt="" className="mb-1 h-12 rounded" onError={(e) => (e.currentTarget.style.display = 'none')} />
              )}
              <p className="truncate font-medium">{f.filename}</p>
              <p className="truncate text-stone-500">
                {STORAGE_LABEL[f.storage]} · {Math.round(f.size / 1024)} KB · {when(f.createdAt)}
              </p>
              <p className="truncate text-xs text-stone-400">{f.url}</p>
            </div>
            {f.storage === Storage.CLOUDINARY && (
              <button className={btn} onClick={() => promote(f._id)}>
                Promote to S3
              </button>
            )}
          </div>
        ))}
      </Box>
    </>
  );
}