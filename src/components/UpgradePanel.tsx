'use client';

/**
 * UpgradePanel — Halaman upgrade tier & perpanjang masa aktif.
 * Hanya tampilkan tier yang LEBIH TINGGI dari current tier.
 * Demo tidak bisa perpanjang (harus upgrade dulu).
 * Pembayaran via Pakasir (QRIS / VA).
 */

import React, { useState, useEffect } from 'react';
import {
  PiCrownDuotone as CrownIcon,
  PiRocketDuotone as RocketIcon,
  PiCheckCircleDuotone as CheckIcon,
  PiTimerDuotone as TimerIcon,
  PiQrCodeDuotone as QrCodeIcon,
  PiBankDuotone as BankIcon,
  PiArrowsClockwiseDuotone as RefreshIcon,
  PiShieldCheckDuotone as ShieldIcon,
  PiStarDuotone as StarIcon,
  PiSparkle as SparkleIcon,
  PiWarningCircleDuotone as WarningIcon,
  PiXCircleDuotone as XCircleIcon,
} from 'react-icons/pi';
import { SaaSUser } from '../types';
import {
  PACKAGE_PRICES,
  PACKAGE_NAMES,
  PACKAGE_LIMITS,
  getLimits,
  getUpgradeTier,
  formatLimit,
  formatActiveDays,
  type PackageId,
} from '../lib/packageLimits';

interface UpgradePanelProps {
  user: SaaSUser | null;
  activatedAt?: string | null;
  expiresAt?: string | null;
  invitationId?: string | null;
  onSuccess?: (updatedUser: SaaSUser) => void;
}

const TIER_ORDER: PackageId[] = ['demo', 'reguler', 'premium', 'luxury'];

const TIER_COLORS: Record<PackageId, { bg: string; border: string; text: string; badge: string; accent: string }> = {
  demo: { bg: 'bg-zinc-50', border: 'border-zinc-200', text: 'text-zinc-600', badge: 'bg-zinc-100 text-zinc-600', accent: 'bg-zinc-500' },
  reguler: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', badge: 'bg-sky-100 text-sky-700', accent: 'bg-sky-500' },
  premium: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700', accent: 'bg-violet-500' },
  luxury: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', accent: 'bg-amber-500' },
};

const TIER_FEATURES: Record<PackageId, string[]> = {
  demo: ['1 proyek', '3 foto galeri', 'Watermark besar', '2 tema'],
  reguler: ['1 proyek', '6 foto galeri', '2 love stories', '100 tamu', 'Publish aktif', 'Export CSV'],
  premium: ['2 proyek', '20 foto galeri', '5 love stories', '500 tamu', 'Semua tema', 'QR Code', 'Upload musik', 'Custom background'],
  luxury: ['3 proyek', '∞ foto galeri', '∞ love stories', '∞ tamu', 'Semua tema', 'QR Code', 'Upload musik', 'Custom background', 'Export PDF', 'Visitor logs'],
};

function formatRupiah(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function getDaysLeft(expiresAt: string | null | undefined): number {
  if (!expiresAt) return 0;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function UpgradePanel({ user, activatedAt, expiresAt, invitationId, onSuccess }: UpgradePanelProps) {
  const [paymentMode, setPaymentMode] = useState<'idle' | 'selecting' | 'processing' | 'paid'>('idle');
  const [paymentTarget, setPaymentTarget] = useState<{ type: 'upgrade' | 'extend'; targetPackageId: PackageId } | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('qris');
  const [pakasirData, setPakasirData] = useState<{
    orderId: string; qrCode: string; paymentUrl: string;
    vaNumber?: string; expiredAt?: string;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPkg = (user?.packageId || 'demo') as PackageId;
  const currentIdx = TIER_ORDER.indexOf(currentPkg);
  const higherTiers = TIER_ORDER.slice(currentIdx + 1);
  const isMaxTier = higherTiers.length === 0;
  const canExtend = currentPkg !== 'demo'; // Demo can't extend
  const daysLeft = getDaysLeft(expiresAt);
  const currentLimits = getLimits(currentPkg);
  const isRfx = user?.isCustomByRfx || false;

  // Poll payment status
  useEffect(() => {
    if (paymentMode !== 'processing' || !pakasirData || !user) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-payment-status?userId=${user.id}`);
        const data = await res.json();
        if (data.status === 'success') {
          clearInterval(interval);

          // Apply upgrade/extend on server side
          if (paymentTarget) {
            try {
              await fetch('/api/apply-upgrade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: user.id,
                  type: paymentTarget.type,
                  targetPackageId: paymentTarget.targetPackageId,
                  invitationId: invitationId || '',
                }),
              });
            } catch {}
          }

          setPaymentMode('paid');
          if (onSuccess && user) {
            const updatedUser = {
              ...user,
              packageId: paymentTarget?.type === 'upgrade' ? paymentTarget.targetPackageId : user.packageId,
              paymentStatus: 'success' as const,
            };
            onSuccess(updatedUser);
          }
        }
      } catch {}
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentMode, pakasirData, user]);

  // Start payment flow
  const handleStartPayment = (type: 'upgrade' | 'extend', targetPkg: PackageId) => {
    setPaymentTarget({ type, targetPackageId: targetPkg });
    setPaymentMode('selecting');
    setError(null);
    setPakasirData(null);
  };

  // Create payment via Pakasir
  const handleCreatePayment = async () => {
    if (!user || !paymentTarget) return;
    setIsCreating(true);
    setError(null);

    const price = PACKAGE_PRICES[paymentTarget.targetPackageId][isRfx ? 'rfx' : 'mandiri'];

    try {
      const res = await fetch('/api/create-upgrade-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.fullName,
          userEmail: user.email,
          type: paymentTarget.type,
          currentPackageId: currentPkg,
          targetPackageId: paymentTarget.targetPackageId,
          invitationId: invitationId || '',
          amount: price,
          method: selectedMethod,
          isCustomByRfx: isRfx,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal membuat transaksi.');
      }

      const result = await res.json();
      setPakasirData({
        orderId: result.orderId,
        qrCode: result.qrCode,
        paymentUrl: result.paymentUrl,
        vaNumber: result.vaNumber,
        expiredAt: result.expiredAt,
      });
      setPaymentMode('processing');
    } catch (err: any) {
      setError(err.message || 'Gagal membuat pembayaran.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!user) return null;

  // ============================================================
  // PAYMENT MODAL (inline overlay)
  // ============================================================
  if (paymentMode !== 'idle') {
    return (
      <div className="p-6 md:p-8 max-w-lg mx-auto">
        {/* Back button */}
        {paymentMode === 'selecting' && (
          <button onClick={() => setPaymentMode('idle')} className="text-sm text-zinc-500 hover:text-zinc-800 mb-6 flex items-center gap-1 transition">
            ← Kembali
          </button>
        )}

        {/* Payment method selection */}
        {paymentMode === 'selecting' && paymentTarget && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 flex items-center justify-center mb-3">
                {paymentTarget.type === 'upgrade' ? <RocketIcon className="w-7 h-7 text-rose-600" /> : <TimerIcon className="w-7 h-7 text-rose-600" />}
              </div>
              <h3 className="text-lg font-bold text-zinc-800">
                {paymentTarget.type === 'upgrade' ? `Upgrade ke ${PACKAGE_NAMES[paymentTarget.targetPackageId]}` : 'Perpanjang Masa Aktif'}
              </h3>
              <p className="text-sm text-zinc-500 mt-1">
                {paymentTarget.type === 'upgrade'
                  ? `Tingkatkan dari ${PACKAGE_NAMES[currentPkg]} ke ${PACKAGE_NAMES[paymentTarget.targetPackageId]}`
                  : `Tambah ${formatActiveDays(currentLimits.activeDays)} masa aktif`}
              </p>
            </div>

            {/* Price display */}
            <div className="rounded-xl border border-zinc-200 p-4 text-center bg-zinc-50">
              <p className="text-xs text-zinc-500 mb-1">Total Pembayaran</p>
              <p className="text-3xl font-bold text-zinc-800">
                {formatRupiah(PACKAGE_PRICES[paymentTarget.targetPackageId][isRfx ? 'rfx' : 'mandiri'])}
              </p>
            </div>

            {/* Payment methods */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Metode Pembayaran</p>
              {[
                { id: 'qris', label: 'QRIS', desc: 'Scan QR — semua e-wallet & m-banking', icon: QrCodeIcon },
                { id: 'bri_va', label: 'BRI Virtual Account', desc: 'Transfer via BRI', icon: BankIcon },
                { id: 'bni_va', label: 'BNI Virtual Account', desc: 'Transfer via BNI', icon: BankIcon },
                { id: 'permata_va', label: 'Permata VA', desc: 'Transfer via Permata Bank', icon: BankIcon },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={`group/bento w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left ${
                    selectedMethod === m.id
                      ? 'border-rose-300 bg-rose-50 shadow-md'
                      : 'border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedMethod === m.id ? 'bg-rose-100' : 'bg-zinc-100'}`}>
                    <m.icon className={`w-5 h-5 ${selectedMethod === m.id ? 'text-rose-600' : 'text-zinc-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-800">{m.label}</p>
                    <p className="text-[10px] text-zinc-400">{m.desc}</p>
                  </div>
                  {selectedMethod === m.id && <CheckIcon className="w-5 h-5 text-rose-500 ml-auto" />}
                </button>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100">
                <WarningIcon className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleCreatePayment}
              disabled={isCreating}
              className="w-full py-3.5 rounded-xl bg-rose-500 text-white font-bold text-sm uppercase tracking-wider hover:bg-rose-600 disabled:opacity-50 transition-all shadow-sm"
            >
              {isCreating ? 'Memproses...' : 'Bayar Sekarang'}
            </button>
          </div>
        )}

        {/* Payment processing — show QR / VA */}
        {paymentMode === 'processing' && pakasirData && (
          <div className="space-y-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center">
              <RefreshIcon className="w-7 h-7 text-amber-600 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-800">Menunggu Pembayaran</h3>
              <p className="text-sm text-zinc-500 mt-1">
                Order ID: <span className="font-mono text-xs">{pakasirData.orderId}</span>
              </p>
            </div>

            {/* QR Code */}
            {pakasirData.qrCode && (
              <div className="rounded-xl border border-zinc-200 p-6 bg-white">
                <img src={pakasirData.qrCode} alt="QRIS" className="w-48 h-48 mx-auto" />
                <p className="text-xs text-zinc-400 mt-3">Scan QR di atas dengan aplikasi e-wallet / m-banking</p>
              </div>
            )}

            {/* VA Number */}
            {pakasirData.vaNumber && (
              <div className="rounded-xl border border-zinc-200 p-4 bg-white">
                <p className="text-xs text-zinc-500 mb-1">Nomor Virtual Account</p>
                <p className="text-2xl font-mono font-bold text-zinc-800 tracking-wider">{pakasirData.vaNumber}</p>
              </div>
            )}

            {/* Payment URL fallback */}
            {pakasirData.paymentUrl && (
              <a
                href={pakasirData.paymentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-600 hover:border-zinc-300 hover:shadow-sm transition"
              >
                Buka Halaman Pembayaran →
              </a>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
              <RefreshIcon className="w-3 h-3 animate-spin" />
              <span>Otomatis mendeteksi pembayaran...</span>
            </div>
          </div>
        )}

        {/* Payment success */}
        {paymentMode === 'paid' && (
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckIcon className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-zinc-800">Pembayaran Berhasil!</h3>
            <p className="text-sm text-zinc-500">
              {paymentTarget?.type === 'upgrade'
                ? `Akun Anda telah di-upgrade ke ${PACKAGE_NAMES[paymentTarget.targetPackageId]}.`
                : `Masa aktif undangan telah diperpanjang.`}
            </p>
            <button
              onClick={() => { setPaymentMode('idle'); setPaymentTarget(null); setPakasirData(null); }}
              className="px-6 py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 transition"
            >
              Kembali ke Dashboard
            </button>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // MAIN UPGRADE PAGE
  // ============================================================
  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-8">

      {/* ---- CURRENT PLAN CARD ---- */}
      <div className={`rounded-2xl border-2 ${TIER_COLORS[currentPkg].border} ${TIER_COLORS[currentPkg].bg} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${TIER_COLORS[currentPkg].accent} flex items-center justify-center`}>
              <CrownIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium">Paket Saat Ini</p>
              <h3 className={`text-lg font-bold ${TIER_COLORS[currentPkg].text}`}>{PACKAGE_NAMES[currentPkg]}</h3>
            </div>
          </div>
          <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${TIER_COLORS[currentPkg].badge}`}>
            Aktif
          </span>
        </div>

        {/* Days left */}
        {expiresAt && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-white/60 border border-white">
            <TimerIcon className={`w-5 h-5 ${daysLeft <= 3 ? 'text-red-500' : daysLeft <= 7 ? 'text-amber-500' : 'text-emerald-500'}`} />
            <div>
              <p className="text-sm font-bold text-zinc-800">{daysLeft} hari tersisa</p>
              <p className="text-[10px] text-zinc-400">Berakhir: {new Date(expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        )}
      </div>

      {/* ---- UPGRADE TIER CARDS ---- */}
      {!isMaxTier && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <RocketIcon className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-bold text-zinc-800">Upgrade Paket</h3>
          </div>

          <div className="space-y-4">
            {higherTiers.map((tierId) => {
              const limits = PACKAGE_LIMITS[tierId];
              const price = PACKAGE_PRICES[tierId][isRfx ? 'rfx' : 'mandiri'];
              const colors = TIER_COLORS[tierId];
              const features = TIER_FEATURES[tierId];

              return (
                <div
                  key={tierId}
                  className={`group/bento rounded-2xl border ${colors.border} ${colors.bg} p-5 transition-all duration-200 hover:shadow-lg hover:border-opacity-100`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-lg ${colors.accent} flex items-center justify-center`}>
                        <StarIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-base font-bold ${colors.text}`}>{PACKAGE_NAMES[tierId]}</h4>
                        <p className="text-[10px] text-zinc-400">{formatActiveDays(limits.activeDays)} masa aktif</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${colors.text}`}>{formatRupiah(price)}</p>
                      <p className="text-[9px] text-zinc-400">{isRfx ? 'Custom by RFX' : 'Mandiri'}</p>
                    </div>
                  </div>

                  {/* Feature list */}
                  <div className="grid grid-cols-2 gap-1.5 mb-4">
                    {features.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckIcon className={`w-3.5 h-3.5 ${colors.text} shrink-0`} />
                        <span className="text-[11px] text-zinc-600">{f}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleStartPayment('upgrade', tierId)}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold text-white uppercase tracking-wider ${colors.accent} hover:opacity-90 transition shadow-sm`}
                  >
                    Upgrade ke {PACKAGE_NAMES[tierId]}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Max tier message */}
      {isMaxTier && (
        <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-6 text-center">
          <CrownIcon className="w-12 h-12 mx-auto mb-3 text-amber-500" />
          <h3 className="text-lg font-bold text-amber-800">Anda di Tier Tertinggi!</h3>
          <p className="text-sm text-amber-600/80 mt-1">Nikmati semua fitur premium tanpa batas.</p>
        </div>
      )}

      {/* ---- EXTEND SUBSCRIPTION ---- */}
      {canExtend && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TimerIcon className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-zinc-800">Perpanjang Masa Aktif</h3>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 hover:shadow-lg hover:border-zinc-300 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-zinc-800">
                  Tambah {formatActiveDays(currentLimits.activeDays)}
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Perpanjang masa aktif tanpa ganti paket
                </p>
              </div>
              <p className="text-lg font-bold text-zinc-800">
                {formatRupiah(PACKAGE_PRICES[currentPkg][isRfx ? 'rfx' : 'mandiri'])}
              </p>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 mb-4">
              <ShieldIcon className="w-4 h-4 text-emerald-500 shrink-0" />
              <p className="text-[11px] text-emerald-700">
                Sisa hari Anda saat ini ({daysLeft} hari) akan ditambah, bukan direset.
              </p>
            </div>

            <button
              onClick={() => handleStartPayment('extend', currentPkg)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold uppercase tracking-wider hover:bg-emerald-600 transition shadow-sm"
            >
              Perpanjang Sekarang
            </button>
          </div>
        </div>
      )}

      {/* Demo can't extend notice */}
      {!canExtend && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 flex items-center gap-3">
          <WarningIcon className="w-5 h-5 text-zinc-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-zinc-600">Perpanjang tidak tersedia</p>
            <p className="text-xs text-zinc-400">Upgrade ke paket Reguler atau lebih tinggi untuk bisa perpanjang masa aktif.</p>
          </div>
        </div>
      )}
    </div>
  );
}
