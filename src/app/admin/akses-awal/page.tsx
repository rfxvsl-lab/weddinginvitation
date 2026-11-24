'use client';

/**
 * Panel admin Akses Awal: tinjau pendaftar, setujui/tolak, lalu kabari lewat WhatsApp/email.
 * Dilindungi proxy (/admin hanya untuk ADMIN_EMAILS) dan requireAdmin di API.
 */

import React, { useCallback, useEffect, useState } from 'react';
import type { SaaSUser } from '@/types';

type Status = 'pending' | 'approved' | 'rejected' | 'all';
const TABS: [Status, string][] = [
  ['pending', 'Menunggu'],
  ['approved', 'Disetujui'],
  ['rejected', 'Ditolak'],
  ['all', 'Semua'],
];
const STATUS_LABEL: Record<string, string> = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' };

function fmt(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AccessApplicationsPage() {
  const [tab, setTab] = useState<Status>('pending');
  const [rows, setRows] = useState<SaaSUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [links, setLinks] = useState<Record<string, { wa: string | null; mail: string | null; status: string }>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/applications?status=${tab}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Gagal memuat pendaftar.');
      setRows(json.applications || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (u: SaaSUser, action: 'approve' | 'reject' | 'reopen') => {
    setBusy(u.id);
    setError('');
    try {
      const res = await fetch(`/api/admin/applications/${u.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note: notes[u.id] || '' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Aksi gagal.');
      setLinks((l) => ({ ...l, [u.id]: { wa: json.whatsappUrl, mail: json.mailtoUrl, status: json.accountStatus } }));
      setRows((r) => r.map((x) => (x.id === u.id ? { ...x, accountStatus: json.accountStatus } : x)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const renderActions = (u: SaaSUser) => {
    const st = u.accountStatus || 'approved';
    const link = links[u.id];
    return (
      <>
        <label className="sr-only" htmlFor={`note-${u.id}`}>
          Catatan untuk {u.fullName}
        </label>
        <input
          id={`note-${u.id}`}
          value={notes[u.id] || ''}
          onChange={(e) => setNotes((n) => ({ ...n, [u.id]: e.target.value }))}
          placeholder="Catatan (opsional)"
          className="mb-2 w-full min-w-0 rounded-lg border border-[#D8D3C8] px-3 py-2 text-[14px] focus:border-[#0F6B5C] focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          {st !== 'approved' && (
            <button type="button" disabled={busy === u.id} onClick={() => act(u, 'approve')} className="min-h-[40px] rounded-lg bg-[#0F6B5C] px-4 text-[13px] font-semibold text-white disabled:opacity-60">
              Setujui
            </button>
          )}
          {st !== 'rejected' && (
            <button type="button" disabled={busy === u.id} onClick={() => act(u, 'reject')} className="min-h-[40px] rounded-lg border border-[#D8D3C8] bg-white px-4 text-[13px] font-semibold text-[#8A2D22] disabled:opacity-60">
              Tolak
            </button>
          )}
          {st !== 'pending' && (
            <button type="button" disabled={busy === u.id} onClick={() => act(u, 'reopen')} className="min-h-[40px] rounded-lg border border-[#D8D3C8] bg-white px-4 text-[13px] font-semibold text-[#3B4747] disabled:opacity-60">
              Kembalikan ke menunggu
            </button>
          )}
        </div>
        {link && (link.wa || link.mail) && (
          <div className="mt-2 flex flex-wrap gap-2 text-[13px] font-semibold">
            {link.wa && (
              <a href={link.wa} target="_blank" rel="noreferrer" className="text-[#0F6B5C] underline underline-offset-4">
                Kabari via WhatsApp
              </a>
            )}
            {link.mail && (
              <a href={link.mail} className="text-[#0F6B5C] underline underline-offset-4">
                Kabari via email
              </a>
            )}
          </div>
        )}
      </>
    );
  };

  const renderStatus = (u: SaaSUser) => {
    const st = u.accountStatus || 'approved';
    return (
      <>
        <span
          className={`inline-block rounded-full px-3 py-1 text-[12px] font-semibold ${st === 'pending' ? 'bg-[#FFF4D6] text-[#7A5A00]' : st === 'approved' ? 'bg-[#E3F3EE] text-[#0F6B5C]' : 'bg-[#FCEDEB] text-[#8A2D22]'}`}
        >
          {STATUS_LABEL[st]}
        </span>
        {u.reviewNote && <p className="mt-1 max-w-[220px] text-[12px] text-[#5C6767]">{u.reviewNote}</p>}
      </>
    );
  };

  const renderEvent = (u: SaaSUser) => (
    <>
      <p>
        {u.coupleGroom} &amp; {u.coupleBride}
      </p>
      <p className="text-[13px] text-[#5C6767]">
        {u.application?.eventDate ? fmt(u.application.eventDate) : 'Tanggal belum diisi'}
        {u.application?.city ? ` · ${u.application.city}` : ''}
      </p>
      {u.application?.referralSource && <p className="text-[13px] text-[#5C6767]">Tahu dari: {u.application.referralSource}</p>}
      {u.application?.note && <p className="mt-1 text-[13px] text-[#3B4747]">“{u.application.note}”</p>}
    </>
  );

  const renderPerson = (u: SaaSUser) => (
    <>
      <p className="font-semibold">{u.fullName}</p>
      <p className="[overflow-wrap:anywhere] text-[13px] text-[#5C6767]">{u.email}</p>
      <p className="text-[13px] text-[#5C6767]">{u.noWa}</p>
      {u.sosmed && <p className="text-[13px] text-[#5C6767]">{u.sosmed}</p>}
    </>
  );

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F7F5F0] px-4 py-8 text-[#1F2A2A] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <a href="/dashboard" className="text-[13px] font-semibold text-[#0F6B5C] underline-offset-4 hover:underline">
          Kembali ke dashboard
        </a>
        <h1 className="mt-3 font-sans text-[28px] font-bold tracking-tight">Pendaftar Akses Awal</h1>
        <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-[#5C6767]">
          Setujui pendaftar agar bisa masuk dashboard. Setelah menyetujui atau menolak, kirim kabar lewat tombol WhatsApp atau email yang muncul.
        </p>

        <div role="tablist" aria-label="Status pendaftar" className="mt-6 flex flex-wrap gap-2">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition ${tab === id ? 'border-[#0F6B5C] bg-[#0F6B5C] text-white' : 'border-[#D8D3C8] bg-white text-[#3B4747] hover:border-[#0F6B5C]'}`}
            >
              {label}
            </button>
          ))}
          <button type="button" onClick={load} className="ml-auto rounded-full border border-[#D8D3C8] bg-white px-4 py-2 text-[13px] font-semibold text-[#3B4747] hover:border-[#0F6B5C]">
            Muat ulang
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg border border-[#E7B4AE] bg-[#FCEDEB] px-4 py-3 text-[14px] text-[#8A2D22]">
            {error}
          </p>
        )}

        {loading && <p className="mt-6 text-[14px] text-[#6B7676]">Memuat…</p>}
        {!loading && rows.length === 0 && <p className="mt-6 text-[14px] text-[#6B7676]">Tidak ada pendaftar di daftar ini.</p>}

        {/* Ponsel & tablet: kartu per pendaftar (admin sering meninjau dari HP) */}
        {!loading && rows.length > 0 && (
          <ul className="mt-5 space-y-3 lg:hidden">
            {rows.map((u) => (
              <li key={u.id} className="rounded-xl border border-[#E2DDD2] bg-white p-4 text-[14px]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">{renderPerson(u)}</div>
                  <div className="shrink-0 text-right">{renderStatus(u)}</div>
                </div>
                <div className="mt-3 border-t border-[#EFEBE3] pt-3">{renderEvent(u)}</div>
                <p className="mt-2 text-[12px] text-[#6B7676]">Daftar {u.registeredAt}</p>
                <div className="mt-3">{renderActions(u)}</div>
              </li>
            ))}
          </ul>
        )}

        {/* Desktop (≥1024px): tabel */}
        {!loading && rows.length > 0 && (
          <div className="mt-5 hidden overflow-x-auto rounded-xl border border-[#E2DDD2] bg-white lg:block">
            <table className="w-full text-left text-[14px]">
              <thead className="border-b border-[#E2DDD2] bg-[#FBFAF7] text-[12px] font-semibold text-[#6B7676]">
                <tr>
                  <th className="px-4 py-3">Pendaftar</th>
                  <th className="px-4 py-3">Acara</th>
                  <th className="px-4 py-3">Daftar</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-b border-[#EFEBE3] align-top last:border-0">
                    <td className="max-w-[220px] px-4 py-4">{renderPerson(u)}</td>
                    <td className="px-4 py-4">{renderEvent(u)}</td>
                    <td className="px-4 py-4 text-[13px] text-[#5C6767]">{u.registeredAt}</td>
                    <td className="px-4 py-4">{renderStatus(u)}</td>
                    <td className="px-4 py-4">{renderActions(u)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
