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

  return (
    <main className="min-h-screen bg-[#F7F5F0] px-4 py-8 text-[#1F2A2A] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <a href="/dashboard" className="text-[13px] font-semibold text-[#0F6B5C] underline-offset-4 hover:underline">
          Kembali ke dashboard
        </a>
        <h1 className="mt-3 text-[28px] font-bold tracking-tight">Pendaftar Akses Awal</h1>
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

        <div className="mt-5 overflow-x-auto rounded-xl border border-[#E2DDD2] bg-white">
          <table className="w-full min-w-[760px] text-left text-[14px]">
            <thead className="border-b border-[#E2DDD2] bg-[#FBFAF7] text-[12px] font-semibold uppercase tracking-wide text-[#6B7676]">
              <tr>
                <th className="px-4 py-3">Pendaftar</th>
                <th className="px-4 py-3">Acara</th>
                <th className="px-4 py-3">Daftar</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#6B7676]">
                    Memuat…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#6B7676]">
                    Tidak ada pendaftar di daftar ini.
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((u) => {
                  const st = u.accountStatus || 'approved';
                  const link = links[u.id];
                  return (
                    <tr key={u.id} className="border-b border-[#EFEBE3] align-top last:border-0">
                      <td className="px-4 py-4">
                        <p className="font-semibold">{u.fullName}</p>
                        <p className="text-[13px] text-[#5C6767]">{u.email}</p>
                        <p className="text-[13px] text-[#5C6767]">{u.noWa}</p>
                        {u.sosmed && <p className="text-[13px] text-[#5C6767]">{u.sosmed}</p>}
                      </td>
                      <td className="px-4 py-4">
                        <p>
                          {u.coupleGroom} &amp; {u.coupleBride}
                        </p>
                        <p className="text-[13px] text-[#5C6767]">
                          {u.application?.eventDate ? fmt(u.application.eventDate) : 'Tanggal belum diisi'}
                          {u.application?.city ? ` · ${u.application.city}` : ''}
                        </p>
                        {u.application?.referralSource && <p className="text-[13px] text-[#5C6767]">Tahu dari: {u.application.referralSource}</p>}
                        {u.application?.note && <p className="mt-1 text-[13px] text-[#3B4747]">“{u.application.note}”</p>}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#5C6767]">{u.registeredAt}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-[12px] font-semibold ${st === 'pending' ? 'bg-[#FFF4D6] text-[#7A5A00]' : st === 'approved' ? 'bg-[#E3F3EE] text-[#0F6B5C]' : 'bg-[#FCEDEB] text-[#8A2D22]'}`}
                        >
                          {STATUS_LABEL[st]}
                        </span>
                        {u.reviewNote && <p className="mt-1 max-w-[180px] text-[12px] text-[#5C6767]">{u.reviewNote}</p>}
                      </td>
                      <td className="px-4 py-4">
                        <label className="sr-only" htmlFor={`note-${u.id}`}>
                          Catatan untuk {u.fullName}
                        </label>
                        <input
                          id={`note-${u.id}`}
                          value={notes[u.id] || ''}
                          onChange={(e) => setNotes((n) => ({ ...n, [u.id]: e.target.value }))}
                          placeholder="Catatan (opsional)"
                          className="mb-2 w-full min-w-[180px] rounded-lg border border-[#D8D3C8] px-3 py-2 text-[14px] focus:border-[#0F6B5C] focus:outline-none"
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
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
