'use client';

import React from 'react';
import {
  BarChart3,
  MessageSquare,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Clock,
  Laptop,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { RSVP, WeddingAnalytics } from '../types';

interface AnalyticsDashboardProps {
  analytics: WeddingAnalytics;
  rsvps: RSVP[];
  onDeleteRSVP: (id: string) => void;
  onSimulateGuestRSVP?: () => void;
  onSimulatePageView?: () => void;
}

export default function AnalyticsDashboard({
  analytics,
  rsvps,
  onDeleteRSVP,
}: AnalyticsDashboardProps) {
  const countHadir = rsvps.filter((r) => r.status === 'Hadir').length;
  const countAbsen = rsvps.filter((r) => r.status === 'Tidak Hadir').length;
  const countRagu = rsvps.filter((r) => r.status === 'Ragu-ragu').length;

  const totalPaxAttending = rsvps
    .filter((r) => r.status === 'Hadir')
    .reduce((sum, r) => sum + (r.paxCount || 1), 0);

  const traffic = analytics?.dailyTraffic || [];
  const chartHeight = 130;
  const chartWidth = 520;
  const maxTrafficViews = Math.max(
    ...(analytics?.dailyTraffic?.map((v) => v.views) || [0]),
    10
  );

  return (
    <div className="space-y-6">
      {/* ── 4 Editorial KPI Cards ── */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {[
          {
            label: 'Total Kunjungan',
            value: `${analytics?.viewsCount || 0}`,
            sub: 'Halaman undangan dibuka',
          },
          {
            label: 'RSVP hadir',
            value: `${countHadir}`,
            sub: 'Jumlah balasan menyatakan hadir',
          },
          {
            label: 'Estimasi orang',
            value: `${totalPaxAttending}`,
            sub: 'Jumlah orang dari RSVP hadir',
          },
          {
            label: 'Absen / Ragu',
            value: `${countAbsen} / ${countRagu}`,
            sub: 'Tidak hadir / belum pasti',
          },
        ].map((stat) => {
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-[var(--rh-line)] bg-[var(--rh-paper)] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[var(--rh-ink-2)]">
                  {stat.label}
                </span>
              </div>
              <p className="mt-2.5 text-[26px] font-bold tracking-tight text-[var(--rh-ink)] tabular-nums">
                {stat.value}
              </p>
              <p className="mt-0.5 text-[11.5px] text-[var(--rh-muted)]">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Traffic Chart & Visitor Log ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="rounded-2xl border border-[var(--rh-line)] bg-[var(--rh-paper)] p-5 lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[13px] font-bold text-[var(--rh-ink)]">
              <BarChart3 className="h-4 w-4 text-[var(--rh-primary)]" />
              Kunjungan per tanggal tercatat
            </h3>

          </div>

          <p className="text-xs text-[var(--rh-muted)]">Data mengikuti pemuatan halaman terakhir. Konfirmasi RSVP bukan check-in di lokasi.</p>
          {traffic.length === 0 ? (
            <p className="py-8 text-sm text-[var(--rh-muted)]">Belum ada data kunjungan per tanggal.</p>
          ) : <div className="h-36 w-full">
            <svg
              role="img"
              aria-label="Grafik jumlah kunjungan per tanggal; data lengkap tersedia pada tabel di bawah."
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="h-full w-full overflow-visible"
              preserveAspectRatio="none"
            >
              <line x1="0" y1="0" x2={chartWidth} y2="0" stroke="var(--rh-line)" strokeWidth="1" />
              <line
                x1="0"
                y1={chartHeight / 2}
                x2={chartWidth}
                y2={chartHeight / 2}
                stroke="var(--rh-line)"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1={chartHeight}
                x2={chartWidth}
                y2={chartHeight}
                stroke="var(--rh-line)"
                strokeWidth="1"
              />

              {(() => {
                if (!analytics?.dailyTraffic || analytics.dailyTraffic.length === 0) return null;
                const trafficLength = Math.max(analytics.dailyTraffic.length - 1, 1);
                const stepX = chartWidth / trafficLength;

                const points = analytics.dailyTraffic.map((d, index) => {
                  const x = index * stepX;
                  const y = chartHeight - (d.views / maxTrafficViews) * (chartHeight - 16);
                  return { x, y };
                });

                const linePath = points
                  .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                  .join(' ');

                return (
                  <>
                    <path
                      d={linePath}
                      fill="none"
                      stroke="var(--rh-primary)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {points.map((p, i) => (
                      <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="3.5"
                        fill="var(--rh-primary)"
                        stroke="var(--rh-paper)"
                        strokeWidth="2"
                      />
                    ))}
                  </>
                );
              })()}

            </svg>
          </div>}

          {traffic.length > 0 && (
            <>
              <div className="flex justify-between gap-3 text-xs text-[var(--rh-muted)]">
                <span>{traffic[0].date}</span>
                {traffic.length > 1 && <span>{traffic[traffic.length - 1].date}</span>}
              </div>
              <details>
                <summary className="min-h-11 flex items-center cursor-pointer text-sm text-[var(--rh-primary)] focus-visible:outline-2 focus-visible:outline-[var(--rh-primary)] focus-visible:outline-offset-2">Lihat data kunjungan per tanggal</summary>
                <table aria-label="Data kunjungan per tanggal" className="w-full text-sm text-left">
                  <thead><tr className="border-b border-[var(--rh-line)]"><th scope="col" className="py-2">Tanggal</th><th scope="col" className="py-2 text-right">Kunjungan</th></tr></thead>
                  <tbody>{traffic.map((day, index) => <tr key={`${day.date}-${index}`} className="border-b border-[var(--rh-line)]"><th scope="row" className="py-2 font-normal">{day.date}</th><td className="py-2 text-right tabular-nums">{day.views}</td></tr>)}</tbody>
                </table>
              </details>
            </>
          )}
        </div>

        {/* Visitor Logs */}
        <div className="rounded-2xl border border-[var(--rh-line)] bg-[var(--rh-paper)] p-5 lg:col-span-4 space-y-4">
          <h3 className="flex items-center gap-2 border-b border-[var(--rh-line)] pb-3 text-[13px] font-bold text-[var(--rh-ink)]">
            <Clock className="h-4 w-4 text-[var(--rh-primary)]" />
            Aktivitas Pengunjung
          </h3>

          {!analytics?.visitorLogs || analytics.visitorLogs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--rh-line-strong)] bg-[var(--rh-ivory)] p-5 text-center text-[12px] text-[var(--rh-ink-2)]">
              Belum ada aktivitas kunjungan tercatat.
            </div>
          ) : (
            <div className="max-h-[168px] space-y-2.5 overflow-y-auto pr-1">
              {analytics.visitorLogs.map((log) => {
                const isMobile = log.device.toLowerCase() === 'mobile';
                return (
                  <div
                    key={log.id}
                    className="flex items-start justify-between gap-2 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-ivory)] p-2.5 text-[12px]"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="mt-0.5 text-[var(--rh-muted)]">
                        {isMobile ? (
                          <Smartphone className="h-3.5 w-3.5" />
                        ) : (
                          <Laptop className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <span className="block truncate font-semibold text-[var(--rh-ink)]">
                          {log.guestName || 'Tamu Umum'}
                        </span>
                        <span className="text-[10.5px] text-[var(--rh-muted)]">
                          {log.browser} · {log.device}
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] text-[var(--rh-muted)]">
                      {log.timestamp}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── RSVP & Wishes Table ── */}
      <div className="rounded-2xl border border-[var(--rh-line)] bg-[var(--rh-paper)] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--rh-line)] pb-3">
          <h3 className="flex items-center gap-2 text-[13.5px] font-bold text-[var(--rh-ink)]">
            <MessageSquare className="h-4 w-4 text-[var(--rh-primary)]" />
            Konfirmasi RSVP &amp; Buku Ucapan ({rsvps.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--rh-line)] bg-[var(--rh-ivory)] text-[12px] font-medium text-[var(--rh-ink-2)]">
                <th className="px-4 py-2.5">Nama Tamu</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-center">Pax</th>
                <th className="px-4 py-2.5">Ucapan &amp; Doa</th>
                <th className="px-4 py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rh-line)] text-[13px]">
              {rsvps.length > 0 ? (
                rsvps.map((entry) => (
                  <tr key={entry.id} className="transition hover:bg-[var(--rh-ivory)]/70">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-[var(--rh-ink)]">
                      {entry.guestName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          entry.status === 'Hadir'
                            ? 'bg-[var(--rh-primary-soft)] text-[var(--rh-primary)]'
                            : entry.status === 'Ragu-ragu'
                            ? 'bg-[var(--rh-gold-soft)] text-[var(--rh-gold-deep)]'
                            : 'bg-[var(--rh-ivory)] text-[var(--rh-danger)]'
                        }`}
                      >
                        {entry.status === 'Hadir' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : entry.status === 'Ragu-ragu' ? (
                          <HelpCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-[var(--rh-ink)] tabular-nums">
                      {entry.paxCount}
                    </td>
                    <td className="max-w-md px-4 py-3 text-[var(--rh-ink-2)] leading-relaxed">
                      {entry.wishes || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onDeleteRSVP(entry.id)}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--rh-line)] p-1.5 text-[var(--rh-muted)] transition hover:border-[var(--rh-danger)]/30 hover:bg-[var(--rh-ivory)] hover:text-[var(--rh-danger)] cursor-pointer"
                        title="Hapus RSVP dan ucapan"
                        aria-label={`Hapus RSVP dan ucapan dari ${entry.guestName}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[13px] text-[var(--rh-muted)]">
                    Belum ada konfirmasi RSVP masuk. Bagikan tautan undangan Anda untuk mulai menerima ucapan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
