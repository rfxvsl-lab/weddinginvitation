/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  PiChartBarDuotone as BarChart2, 
  PiUsersDuotone as Users, 
  PiChatCircleDuotone as MessageSquare, 
  PiCheckCircleDuotone as CheckCircle2, 
  PiQuestionDuotone as HelpCircle, 
  PiXCircleDuotone as XCircle, 
  PiEyeDuotone as Eye, 
  PiClockDuotone as Clock, 
  PiPulseDuotone as Activity, 
  PiLaptopDuotone as Laptop, 
  PiDeviceMobileCameraDuotone as Smartphone,
  PiTrashDuotone as Trash2,
  PiArrowsClockwiseDuotone as ListRestart
} from 'react-icons/pi';
import { RSVP, WeddingAnalytics } from '../types';

interface AnalyticsDashboardProps {
  analytics: WeddingAnalytics;
  rsvps: RSVP[];
  onDeleteRSVP: (id: string) => void;
  onSimulateGuestRSVP: () => void;
  onSimulatePageView: () => void;
}

export default function AnalyticsDashboard({ 
  analytics, 
  rsvps, 
  onDeleteRSVP, 
  onSimulateGuestRSVP,
  onSimulatePageView
}: AnalyticsDashboardProps) {

  // Calculate real aggregates from RSVPs
  const totalRSVPDariState = rsvps.length;
  const countHadir = rsvps.filter(r => r.status === 'Hadir').length;
  const countAbsen = rsvps.filter(r => r.status === 'Tidak Hadir').length;
  const countRagu = rsvps.filter(r => r.status === 'Ragu-ragu').length;
  
  const totalPaxAttending = rsvps
    .filter(r => r.status === 'Hadir')
    .reduce((sum, r) => sum + r.paxCount, 0);

  // SVG Chart Dimensions & Computations
  const chartHeight = 120;
  const chartWidth = 500;
  const maxTrafficViews = Math.max(...analytics.dailyTraffic.map(v => v.views), 10);
  
  return (
    <div className="space-y-6">
      {/* HEADER WITH REALTIME SIMULATORS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary animate-pulse" />
            Sistem Analitik Undangan
          </h3>
          <p className="text-xs text-zinc-500">
            Monitor kunjungan tamu, status RSVP, dan kiriman ucapan doa restu secara langsung.
          </p>
        </div>

        {/* DEMO SIMULATION BUTTONS */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSimulatePageView}
            className="flex items-center gap-1.5 px-3 py-2 border border-zinc-200 text-zinc-600 font-bold bg-zinc-50 hover:bg-zinc-100 rounded-xl text-xs transition-all cursor-pointer"
            title="Simulasikan tamu asing membuka halaman undangan Anda"
          >
            <Eye className="w-3.5 h-3.5" />
            + Simulasi Kunjungan
          </button>
          
          <button
            type="button"
            onClick={onSimulateGuestRSVP}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold scale-100 hover:scale-102 active:scale-98 transition-all cursor-pointer"
            title="Simulasikan ada tamu yang melakukan konfirmasi kehadiran secara instan"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            + Simulasi Tamu RSVP
          </button>
        </div>
      </div>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* VIEW COUNT */}
        <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border border-zinc-200 hover:border-zinc-300 flex items-center gap-4 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-200">
          <div className="p-3 rounded-xl bg-sky-100 text-sky-600">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-sky-600/70">Total Dibuka</span>
            <span className="text-lg font-bold text-zinc-800 font-mono">{analytics.viewsCount}x</span>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-[0.04] pointer-events-none group-hover:scale-110 transition-transform">
            <Eye className="w-20 h-20 text-sky-500" />
          </div>
        </div>

        {/* HADIR STAT */}
        <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-zinc-200 hover:border-zinc-300 flex items-center gap-4 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-200">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-emerald-600/70">Konfirmasi Hadir</span>
            <span className="text-lg font-bold text-zinc-800 font-mono">{countHadir} Tamu</span>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-[0.04] pointer-events-none group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-20 h-20 text-emerald-500" />
          </div>
        </div>

        {/* TOTAL PAX */}
        <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-zinc-200 hover:border-zinc-300 flex items-center gap-4 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-200">
          <div className="p-3 rounded-xl bg-violet-100 text-violet-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-violet-600/70">Estimasi Porsi Pax</span>
            <span className="text-lg font-bold text-zinc-800 font-mono">{totalPaxAttending} Orang</span>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-[0.04] pointer-events-none group-hover:scale-110 transition-transform">
            <Users className="w-20 h-20 text-violet-500" />
          </div>
        </div>

        {/* RAGU & ABSEN */}
        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-zinc-200 hover:border-zinc-300 flex items-center gap-4 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-200">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-amber-600/70">Absen / Ragu-ragu</span>
            <span className="text-lg font-bold text-zinc-800 font-mono">{countAbsen} / {countRagu}</span>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-[0.04] pointer-events-none group-hover:scale-110 transition-transform">
            <HelpCircle className="w-20 h-20 text-amber-500" />
          </div>
        </div>
      </div>

      {/* TRAFFIC GRAPH & DEVICE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* CUSTOM SVG LINE CHART (100% RESPONSIVE) */}
        <div className="p-5 bg-white border border-zinc-200 rounded-xl hover:shadow-xl hover:border-zinc-300 transition-all duration-200 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-zinc-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-zinc-500" />
              Trafik Pembaca harian (7 Hari Terakhir)
            </h4>
            <span className="text-[10px] bg-zinc-50 text-zinc-500 font-bold px-2 py-0.5 rounded-full">
              Live Real-Time
            </span>
          </div>

          {/* SVG RENDERING */}
          <div className="w-full h-36">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Grid Lines */}
              <line x1="0" y1="0" x2={chartWidth} y2="0" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#E2E8F0" strokeWidth="1" />

              {/* Draw Line Path and Shading */}
              {(() => {
                if (!analytics.dailyTraffic || analytics.dailyTraffic.length === 0) return null;
                const trafficLength = Math.max(analytics.dailyTraffic.length - 1, 1);
                const stepX = chartWidth / trafficLength;
                
                const points = analytics.dailyTraffic.map((d, index) => {
                  const x = index * stepX;
                  // Map max value to layout bounds
                  const y = chartHeight - (d.views / maxTrafficViews) * (chartHeight - 15);
                  return { x, y };
                });

                const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

                return (
                  <>
                    {/* Area fill */}
                    <path d={areaPath} fill="url(#primary-gradient)" opacity="0.15" />
                    {/* Linestroke */}
                    <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
                    
                    {/* Point Nodes */}
                    {points.map((p, i) => (
                      <g key={i} className="group/node">
                        <circle 
                          cx={p.x} 
                          cy={p.y} 
                          r="4" 
                          fill="#4F46E5" 
                          stroke="#FFFFFF" 
                          strokeWidth="2.5" 
                          className="hover:r-5 transition-all cursor-pointer"
                        />
                        <rect 
                          x={p.x - 20} 
                          y={p.y - 18} 
                          width="40" 
                          height="14" 
                          rx="4" 
                          fill="#1E293B" 
                          className="opacity-0 group-hover/node:opacity-100 transition-opacity"
                        />
                        <text 
                          x={p.x} 
                          y={p.y - 8} 
                          fill="#FFFFFF" 
                          fontSize="8" 
                          fontWeight="bold"
                          textAnchor="middle"
                          className="opacity-0 pointer-events-none group-hover/node:opacity-100 shadow-sm"
                        >
                          {analytics.dailyTraffic[i].views}x
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}

              <defs>
                <linearGradient id="primary-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between px-1 text-[9px] font-mono font-bold text-zinc-500">
            {analytics.dailyTraffic.map((d, index) => (
              <span key={index}>{d.date}</span>
            ))}
          </div>
        </div>

        {/* LIVE VISITOR DEVICE LOG */}
        <div className="p-5 bg-white border border-zinc-200 rounded-xl hover:shadow-xl hover:border-zinc-300 transition-all duration-200 space-y-4">
          <h4 className="font-bold text-zinc-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200 pb-2.5">
            <Clock className="w-4 h-4 text-zinc-500" />
            Aktivitas Pengunjung Terbaru
          </h4>

          <div className="space-y-3 max-h-[145px] overflow-y-auto pr-1">
            {analytics.visitorLogs.map((log) => {
              const isMobile = log.device.toLowerCase() === 'mobile';
              return (
                <div key={log.id} className="flex items-start justify-between text-[11px] hover:bg-zinc-50 p-1.5 rounded-lg transition">
                  <div className="flex items-start gap-2">
                    <span className="p-1 rounded bg-zinc-50 text-zinc-500 mt-0.5">
                      {isMobile ? <Smartphone className="w-3.5 h-3.5" /> : <Laptop className="w-3.5 h-3.5" />}
                    </span>
                    <div>
                      <span className="font-bold text-zinc-800 block">
                        {log.guestName || 'Anonym / Penasaran'}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {log.browser} â€¢ {log.device}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500 mt-0.5">{log.timestamp}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FEEDBACK WISHES / DIALOGUE BOX AUTOMATION */}
      <div className="p-6 bg-white border border-zinc-200 rounded-xl hover:shadow-xl hover:border-zinc-300 transition-all duration-200 space-y-4">
        <h4 className="font-bold text-zinc-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200 pb-2.5">
          <MessageSquare className="w-4 h-4 text-zinc-500" />
          Manajemen RSVP & Buku Ucapan Tamu ({rsvps.length})
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans border-collapse">
            <thead>
              <tr className="bg-zinc-50 text-[10px] uppercase font-bold text-zinc-500 border-b border-zinc-200">
                <th className="px-4 py-2">Nama Pengirim</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-center">Porsi</th>
                <th className="px-4 py-2">Ucapan & Doa Hangat</th>
                <th className="px-4 py-2 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rsvps.length > 0 ? (
                rsvps.map((entry) => (
                  <tr key={entry.id} className="text-xs hover:bg-zinc-50 transition">
                    <td className="px-4 py-3 font-bold text-zinc-800 whitespace-nowrap">
                      {entry.guestName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        entry.status === 'Hadir'
                          ? 'bg-emerald-100 text-emerald-800'
                          : entry.status === 'Ragu-ragu'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {entry.status === 'Hadir' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Hadir
                          </>
                        ) : entry.status === 'Ragu-ragu' ? (
                          <>
                            <HelpCircle className="w-3 h-3" /> Ragu-ragu
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Absen
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-zinc-800">
                      {entry.paxCount} Pax
                    </td>
                    <td className="px-4 py-3 text-zinc-500 max-w-sm whitespace-pre-wrap leading-relaxed truncate hover:text-clip hover:whitespace-normal">
                      "{entry.wishes}"
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onDeleteRSVP(entry.id)}
                        className="p-1 px-2 rounded-lg border border-slate-150 hover:border-rose-250 text-zinc-500 hover:text-primary bg-white hover:bg-rose-50/50 transition duration-300"
                        title="Hapus RSVP"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-zinc-500 text-xs">
                    Belum ada konfirmasi RSVP masuk. Bagikan tautan undangan kustom atau gunakan simulator di atas untuk mengetes.
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
