'use client';

/**
 * GuestPassSection — validasi kode, konfirmasi kehadiran, QR pass, dan denah meja.
 * Versi template-agnostic: ditempel setelah layout mana pun supaya alur RE
 * (kode -> konfirmasi -> tiket) konsisten di semua tema.
 */

import React, { useEffect, useState } from 'react';
import {
  PiQrCodeDuotone as QrCode,
  PiCheckDuotone as Check,
  PiDownloadSimpleDuotone as Download,
  PiMapPinDuotone as MapPin,
  PiArrowSquareOutDuotone as ExternalLink,
} from 'react-icons/pi';
import type { Guest, WeddingData } from '../types';
import { confirmGuestAttendance, validateGuestCode } from '../lib/api';

interface GuestPassSectionProps {
  invitationId?: string;
  guest?: Guest;
  data: WeddingData;
  accentColor: string;
  dark?: boolean;
}

export default function GuestPassSection({
  invitationId,
  guest,
  data,
  accentColor,
  dark = true,
}: GuestPassSectionProps) {
  const [activeGuest, setActiveGuest] = useState<Guest | undefined>(guest);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [qr, setQr] = useState('');
  const [attendance, setAttendance] = useState<'Hadir' | 'Tidak Hadir'>('Hadir');
  const [pax, setPax] = useState(1);

  useEffect(() => {
    setActiveGuest(guest);
    if (guest?.rsvpStatus === 'CONFIRMED' || guest?.checkedInAt) setConfirmed(true);
  }, [guest]);

  const unlocked = Boolean(activeGuest && (confirmed || activeGuest.rsvpStatus === 'CONFIRMED' || activeGuest.checkedInAt));

  useEffect(() => {
    let dead = false;
    if (!unlocked || !activeGuest?.invitationCode) {
      setQr('');
      return;
    }
    import('qrcode')
      .then((QR) => QR.toDataURL(activeGuest.invitationCode, { width: 360, margin: 1 }))
      .then((url) => !dead && setQr(url))
      .catch(() => !dead && setQr(''));
    return () => {
      dead = true;
    };
  }, [unlocked, activeGuest?.invitationCode]);

  const validate = async () => {
    if (!invitationId || !code.trim()) return;
    setBusy(true);
    setError('');
    try {
      const found = await validateGuestCode(invitationId, code);
      if (!found) {
        setError('Kode tidak valid. Cek lagi link/QR dari mempelai.');
        return;
      }
      setActiveGuest(found);
      setPax(Math.min(found.paxLimit || 1, 2));
      if (found.rsvpStatus === 'CONFIRMED') setConfirmed(true);
    } catch {
      setError('Gagal memvalidasi. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  const confirmAttendance = async () => {
    if (!activeGuest) return;
    setBusy(true);
    setError('');
    try {
      await confirmGuestAttendance(activeGuest.id, attendance, pax);
      setActiveGuest({ ...activeGuest, rsvpStatus: 'CONFIRMED', attendance });
      setConfirmed(true);
    } catch {
      setError('Gagal menyimpan konfirmasi.');
    } finally {
      setBusy(false);
    }
  };

  const box = dark ? 'bg-zinc-950/90 border-zinc-800 text-zinc-100' : 'bg-white border-amber-100 text-slate-800';
  const muted = dark ? 'text-zinc-400' : 'text-stone-500';

  return (
    <>
      {data.liveStreamUrl && (
        <section className={`px-4 py-10 text-center space-y-3 border-t ${dark ? 'bg-black/60 border-zinc-900' : 'bg-white border-amber-100'}`}>
          <span className="text-[10px] uppercase font-bold tracking-[0.25em]" style={{ color: accentColor }}>LIVE STREAMING</span>
          <h3 className={`text-2xl font-serif ${dark ? 'text-amber-500' : 'text-amber-800'}`}>Saksikan Kami Secara Virtual</h3>
          <p className={`text-[11px] max-w-xs mx-auto ${muted}`}>Acara kami disiarkan langsung untuk kerabat yang berhalangan hadir.</p>
          {/youtu\.?be/.test(data.liveStreamUrl) ? (
            <div className="max-w-md mx-auto aspect-video overflow-hidden rounded-2xl border border-amber-500/20">
              <iframe
                src={data.liveStreamUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                title="Live streaming"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : (
            <a href={data.liveStreamUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: accentColor }}>
              <ExternalLink className="w-3.5 h-3.5" /> {data.liveStreamLabel || 'Join Live Streaming'}
            </a>
          )}
        </section>
      )}

      {data.enableDigitalPass !== false && (
        <section className={`px-4 py-10 text-center space-y-4 border-t ${dark ? 'bg-black/40 border-zinc-900' : 'bg-amber-50/40 border-amber-100'}`}>
          <span className="text-[10px] uppercase font-bold tracking-[0.25em]" style={{ color: accentColor }}>DIGITAL ENTRY PASS</span>
          <h3 className={`text-2xl font-serif ${dark ? 'text-amber-500' : 'text-amber-800'}`}>Tiket Akses & Denah Meja</h3>

          <div className={`max-w-sm mx-auto rounded-3xl border p-5 space-y-3 text-left ${box}`}>
            {!activeGuest && (
              <>
                <p className={`text-[11px] ${muted}`}>Masukkan kode undangan Anda untuk membuka tiket check-in.</p>
                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="W-XXXXX"
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-mono tracking-wider outline-none ${dark ? 'bg-black border-zinc-700' : 'bg-white border-amber-200'}`}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), validate())}
                  />
                  <button onClick={validate} disabled={busy || !invitationId} className="px-4 rounded-xl text-[11px] font-bold text-white disabled:opacity-50" style={{ backgroundColor: accentColor }}>
                    {busy ? '...' : 'Validasi'}
                  </button>
                </div>
              </>
            )}

            {activeGuest && !unlocked && (
              <>
                <p className="text-[11px] font-bold flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> {activeGuest.name}</p>
                <p className={`text-[10px] ${muted}`}>Konfirmasi kehadiran untuk membuka QR pass.</p>
                <div className="flex gap-2">
                  {(['Hadir', 'Tidak Hadir'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setAttendance(s)}
                      className="flex-1 py-2 rounded-xl border text-[10.5px] font-bold"
                      style={{ backgroundColor: attendance === s ? accentColor : 'transparent', color: attendance === s ? '#fff' : undefined, borderColor: accentColor }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {attendance === 'Hadir' && (
                  <label className={`text-[10px] flex items-center gap-2 ${muted}`}>
                    Jumlah pax
                    <input
                      type="number"
                      min={1}
                      max={activeGuest.paxLimit || 1}
                      value={pax}
                      onChange={(e) => setPax(Math.min(activeGuest.paxLimit || 1, Math.max(1, Number(e.target.value))))}
                      className={`w-16 rounded-lg border px-2 py-1 ${dark ? 'bg-black border-zinc-700' : 'bg-white border-amber-200'}`}
                    />
                  </label>
                )}
                <button onClick={confirmAttendance} disabled={busy} className="w-full py-2.5 rounded-xl text-[11px] font-bold text-white disabled:opacity-50" style={{ backgroundColor: accentColor }}>
                  Konfirmasi Kehadiran
                </button>
              </>
            )}

            {unlocked && activeGuest && (
              <>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[8.5px] uppercase tracking-widest" style={{ color: accentColor }}>PASSENGER</p>
                    <p className="text-sm font-bold">{activeGuest.name}</p>
                    <p className={`text-[9.5px] font-mono ${muted}`}>{activeGuest.group || 'TAMU'} · {activeGuest.paxLimit} PAX</p>
                  </div>
                  <QrCode className="w-5 h-5" style={{ color: accentColor }} />
                </div>
                <div className="bg-white rounded-2xl p-3 w-fit mx-auto">
                  {qr ? <img src={qr} alt="QR check-in" className="w-32 h-32" /> : <div className="w-32 h-32" />}
                </div>
                <p className="text-center font-mono text-sm font-black tracking-widest" style={{ color: accentColor }}>{activeGuest.invitationCode}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {qr && (
                    <a href={qr} download={`tiket-${activeGuest.invitationCode}.png`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[9.5px] font-bold text-white" style={{ backgroundColor: accentColor }}>
                      <Download className="w-3 h-3" /> Unduh tiket
                    </a>
                  )}
                  {activeGuest.seatImageUrl && (
                    <a href={activeGuest.seatImageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[9.5px] font-bold border" style={{ borderColor: accentColor, color: accentColor }}>
                      <MapPin className="w-3 h-3" /> Denah meja{activeGuest.tableNo ? ` ${activeGuest.tableNo}` : ''}
                    </a>
                  )}
                </div>
              </>
            )}

            {error && <p className="text-[10px] text-rose-500">{error}</p>}
          </div>
        </section>
      )}
    </>
  );
}
