'use client';

import React, { useCallback, useEffect, useState } from 'react';
import s from './dani-tia.module.css';
import { PAGE_KEY } from './data';

type Status = 'Hadir' | 'Tidak Hadir' | 'Masih Ragu';
interface Item {
  id: string;
  name: string;
  status: Status;
  pax: number;
  message: string;
  createdAt: string;
}
const API = `/api/custom-pages/${PAGE_KEY}/rsvp`;
const STATUSES: Status[] = ['Hadir', 'Tidak Hadir', 'Masih Ragu'];

function when(iso: string) {
  const t = new Date(iso).getTime();
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return 'baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' }).format(t);
}

export default function Wishes({ guest }: { guest: string }) {
  const [name, setName] = useState(guest);
  const [status, setStatus] = useState<Status | ''>('');
  const [pax, setPax] = useState(1);
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [phase, setPhase] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [err, setErr] = useState('');
  const [fieldErr, setFieldErr] = useState<{ name?: string; status?: string }>({});

  const [items, setItems] = useState<Item[]>([]);
  const [tally, setTally] = useState<Record<string, number>>({});
  const [hasMore, setHasMore] = useState(false);
  const [list, setList] = useState<'loading' | 'ready' | 'error'>('loading');
  const [more, setMore] = useState(false);

  const load = useCallback(async (before?: string) => {
    const res = await fetch(before ? `${API}?before=${encodeURIComponent(before)}` : API, { cache: 'no-store' });
    if (!res.ok) throw new Error('load');
    return (await res.json()) as { items: Item[]; hasMore: boolean; tally: Record<string, number> };
  }, []);

  useEffect(() => {
    let alive = true;
    load()
      .then((d) => {
        if (!alive) return;
        setItems(d.items);
        setHasMore(d.hasMore);
        setTally(d.tally || {});
        setList('ready');
      })
      .catch(() => alive && setList('error'));
    return () => {
      alive = false;
    };
  }, [load]);

  const loadMore = async () => {
    const last = items[items.length - 1];
    if (!last) return;
    setMore(true);
    try {
      const d = await load(last.createdAt);
      setItems((x) => [...x, ...d.items.filter((n) => !x.some((o) => o.id === n.id))]);
      setHasMore(d.hasMore);
    } catch {
      /* tombol tetap tampil untuk dicoba lagi */
    } finally {
      setMore(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fe: typeof fieldErr = {};
    if (name.trim().length < 2) fe.name = 'Tulis nama Anda.';
    if (!status) fe.status = 'Pilih salah satu.';
    setFieldErr(fe);
    if (fe.name || fe.status) return;
    setPhase('sending');
    setErr('');
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), status, pax, message: message.trim(), website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Konfirmasi belum terkirim. Coba lagi.');
      if (data.rsvp) {
        setItems((x) => [data.rsvp as Item, ...x]);
        setTally((t) => ({ ...t, [data.rsvp.status]: (t[data.rsvp.status] || 0) + 1 }));
      }
      setPhase('done');
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Konfirmasi belum terkirim. Coba lagi.');
      setPhase('error');
    }
  };

  const total = STATUSES.reduce((a, k) => a + (tally[k] || 0), 0);

  return (
    <div className={s.rsvp}>
      {phase === 'done' ? (
        <div className={s.thanks} role="status" data-rv="zoom" data-in="">
          <p className={s.thanksTitle}>Terima kasih, {name.trim()}.</p>
          <p>Konfirmasi dan ucapan Anda sudah tersimpan.</p>
        </div>
      ) : (
        <form className={s.form} onSubmit={submit} noValidate data-rv="up">
          <label className={s.field}>
            <span>Nama</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" aria-invalid={!!fieldErr.name} placeholder="Nama Anda" />
            {fieldErr.name && <em className={s.fieldErr}>{fieldErr.name}</em>}
          </label>
          <fieldset className={s.field}>
            <legend>Kehadiran</legend>
            <div className={s.choices}>
              {STATUSES.map((k) => (
                <label key={k} className={`${s.choice} ${status === k ? s.choiceOn : ''}`}>
                  <input type="radio" name="status" value={k} checked={status === k} onChange={() => setStatus(k)} />
                  {k}
                </label>
              ))}
            </div>
            {fieldErr.status && <em className={s.fieldErr}>{fieldErr.status}</em>}
          </fieldset>
          {status === 'Hadir' && (
            <label className={s.field}>
              <span>Jumlah orang</span>
              <select value={pax} onChange={(e) => setPax(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} orang
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className={s.field}>
            <span>Ucapan &amp; doa</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} rows={4} placeholder="Tulis doa untuk Tia & Dhany" />
            <small className={s.count}>{message.length}/500</small>
          </label>
          <label className={s.hp} aria-hidden>
            Website
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
          {phase === 'error' && (
            <p className={s.formErr} role="alert">
              {err}
            </p>
          )}
          <button type="submit" className={s.btn} disabled={phase === 'sending'}>
            {phase === 'sending' ? 'Mengirim…' : 'Kirim Konfirmasi'}
          </button>
        </form>
      )}

      <div className={s.wishes} aria-live="polite">
        {list === 'ready' && total > 0 && (
          <p className={s.tally}>
            {STATUSES.filter((k) => tally[k]).map((k, i) => (
              <span key={k}>
                {i > 0 && ', '}
                {tally[k]} {k.toLowerCase()}
              </span>
            ))}
          </p>
        )}
        {list === 'loading' && <p className={s.muted}>Memuat ucapan…</p>}
        {list === 'error' && <p className={s.muted}>Ucapan belum bisa dimuat saat ini.</p>}
        {list === 'ready' && items.length === 0 && <p className={s.muted}>Belum ada ucapan. Jadilah yang pertama mendoakan Tia &amp; Dhany.</p>}
        <ul className={s.wishList}>
          {items.map((w) => (
            <li key={w.id} className={s.wish} data-rv="up">
              <div className={s.wishHead}>
                <strong>{w.name}</strong>
                <span className={s.badge} data-s={w.status}>
                  {w.status}
                </span>
              </div>
              {w.message && <p className={s.wishMsg}>{w.message}</p>}
              <time className={s.wishTime} dateTime={w.createdAt}>
                {when(w.createdAt)}
              </time>
            </li>
          ))}
        </ul>
        {hasMore && (
          <button type="button" className={s.linkBtn} onClick={loadMore} disabled={more}>
            {more ? 'Memuat…' : 'Lihat ucapan lainnya'}
          </button>
        )}
      </div>
    </div>
  );
}
