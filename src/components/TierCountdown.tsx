'use client';

/**
 * TierCountdown — Widget countdown masa aktif undangan di sidebar dashboard.
 * Warna berubah: hijau → kuning → merah → abu-abu (expired).
 * Jika migration 003 belum dijalankan (activatedAt & expiresAt keduanya null),
 * widget tidak ditampilkan sama sekali.
 */

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, XCircle, ArrowUpRight } from 'lucide-react';

interface TierCountdownProps {
  activatedAt: string | null | undefined;
  expiresAt: string | null | undefined;
  packageId: string;
  onUpgrade?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

function calcTimeLeft(expiresAt: string): TimeLeft {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    totalMs: diff,
  };
}

type CountdownStatus = 'active' | 'warning' | 'danger' | 'expired' | 'inactive';

function getStatus(expiresAt: string | null | undefined, activatedAt: string | null | undefined): CountdownStatus {
  if (!activatedAt || !expiresAt) return 'inactive';
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'expired';
  const daysLeft = diff / (1000 * 60 * 60 * 24);
  if (daysLeft <= 3) return 'danger';
  if (daysLeft <= 7) return 'warning';
  return 'active';
}

const STATUS_CONFIG = {
  active: {
    bgGradient: 'from-emerald-50 to-emerald-50/50',
    border: 'border-emerald-200',
    textColor: 'text-emerald-600',
    numberColor: 'text-zinc-800',
    dotColor: 'bg-emerald-500',
    label: 'Aktif',
    icon: Clock,
  },
  warning: {
    bgGradient: 'from-amber-50 to-amber-50/50',
    border: 'border-amber-200',
    textColor: 'text-amber-600',
    numberColor: 'text-zinc-800',
    dotColor: 'bg-amber-500',
    label: 'Segera Habis',
    icon: AlertTriangle,
  },
  danger: {
    bgGradient: 'from-red-50 to-red-50/50',
    border: 'border-red-200',
    textColor: 'text-red-600',
    numberColor: 'text-red-700',
    dotColor: 'bg-red-500',
    label: 'Hampir Habis!',
    icon: AlertTriangle,
  },
  expired: {
    bgGradient: 'from-zinc-50 to-zinc-50/50',
    border: 'border-zinc-200',
    textColor: 'text-zinc-500',
    numberColor: 'text-zinc-600',
    dotColor: 'bg-zinc-400',
    label: 'Masa Aktif Habis',
    icon: XCircle,
  },
  inactive: {
    bgGradient: 'from-zinc-50 to-zinc-50/50',
    border: 'border-zinc-200',
    textColor: 'text-zinc-500',
    numberColor: 'text-zinc-600',
    dotColor: 'bg-zinc-400',
    label: 'Belum Aktif',
    icon: Clock,
  },
};

export default function TierCountdown({ activatedAt, expiresAt, packageId, onUpgrade }: TierCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
  const status = getStatus(expiresAt, activatedAt);
  const config = STATUS_CONFIG[status];

  // Tick timer every second (only when active countdown)
  useEffect(() => {
    if (!expiresAt || status === 'inactive' || status === 'expired') return;

    const tick = () => setTimeLeft(calcTimeLeft(expiresAt));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, status]);

  // Don't render anything if expiration data is not available
  // (migration 003 belum dijalankan — kolom belum ada di DB)
  if (!activatedAt && !expiresAt) {
    return null;
  }

  // Progress bar: percentage of time used
  const totalDuration = activatedAt && expiresAt
    ? new Date(expiresAt).getTime() - new Date(activatedAt).getTime()
    : 1;
  const elapsed = activatedAt
    ? Date.now() - new Date(activatedAt).getTime()
    : 0;
  const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  // Tier label
  const tierLabel = packageId === 'demo' ? 'Demo' : packageId === 'reguler' ? 'Reguler' : packageId === 'premium' ? 'Premium' : 'Luxury';

  return (
    <div className={`mx-3 mb-3 rounded-xl border ${config.border} bg-gradient-to-br ${config.bgGradient} p-3.5 transition-all duration-500`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${config.dotColor} ${status === 'danger' || status === 'warning' ? 'animate-pulse' : ''}`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${config.textColor}`}>
            {config.label}
          </span>
        </div>
        <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded-full">{tierLabel}</span>
      </div>

      {/* Timer display */}
      {status !== 'inactive' && status !== 'expired' && (
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {[
            { val: timeLeft.days, label: 'Hari' },
            { val: timeLeft.hours, label: 'Jam' },
            { val: timeLeft.minutes, label: 'Min' },
            { val: timeLeft.seconds, label: 'Dtk' },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <div className={`text-lg font-mono font-black leading-none ${config.numberColor} tabular-nums`}>
                {String(val).padStart(2, '0')}
              </div>
              <div className="text-[8px] text-zinc-400 uppercase tracking-wider mt-0.5 font-semibold">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Expired message */}
      {status === 'expired' && (
        <div className="flex items-center gap-2 mb-2.5 bg-red-50 border border-red-100 rounded-lg p-2.5">
          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-[11px] text-red-600 leading-tight font-medium">
            Masa aktif habis. Perpanjang untuk mengaktifkan kembali.
          </p>
        </div>
      )}

      {/* Progress bar */}
      {status !== 'inactive' && (
        <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden mb-2.5">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              status === 'active' ? 'bg-emerald-500' :
              status === 'warning' ? 'bg-amber-500' :
              status === 'danger' ? 'bg-red-500' :
              'bg-zinc-400'
            }`}
            style={{ width: `${status === 'expired' ? 100 : progressPercent}%` }}
          />
        </div>
      )}

      {/* Upgrade/extend button */}
      {(status === 'expired' || status === 'danger' || status === 'warning') && onUpgrade && (
        <button
          onClick={onUpgrade}
          className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
            status === 'expired'
              ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm'
              : 'bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:shadow-md'
          }`}
        >
          <ArrowUpRight className="w-3 h-3" />
          {status === 'expired' ? 'Perpanjang Sekarang' : 'Perpanjang'}
        </button>
      )}
    </div>
  );
}
