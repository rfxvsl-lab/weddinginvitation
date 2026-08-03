'use client';

import React from 'react';
import { PiLockKeyDuotone as Lock, PiArrowUpDuotone as ArrowUp, PiCrownDuotone as Crown } from 'react-icons/pi';
import { getUpgradeTier, PACKAGE_NAMES, PACKAGE_PRICES, formatLimit, type PackageId } from '../lib/packageLimits';

interface UpgradePromptProps {
  /** Current user's package ID */
  packageId: string;
  /** Feature name that is locked */
  featureName: string;
  /** Optional: current count vs max for limit-based locks */
  currentCount?: number;
  maxCount?: number;
  /** Display variant */
  variant?: 'inline' | 'banner' | 'overlay';
  /** Optional className */
  className?: string;
}

export default function UpgradePrompt({
  packageId,
  featureName,
  currentCount,
  maxCount,
  variant = 'inline',
  className = '',
}: UpgradePromptProps) {
  const upgradeTo = getUpgradeTier(packageId);
  const upgradeName = upgradeTo ? PACKAGE_NAMES[upgradeTo] : null;
  const upgradePrice = upgradeTo ? PACKAGE_PRICES[upgradeTo] : null;

  const isLimitType = currentCount !== undefined && maxCount !== undefined;

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-700 ${className}`}>
        <Lock className="w-3.5 h-3.5 shrink-0 text-amber-500" />
        <span>
          {isLimitType ? (
            <>Batas {featureName}: <strong>{formatLimit(maxCount)}</strong> (paket {PACKAGE_NAMES[packageId as PackageId] || packageId})</>
          ) : (
            <>{featureName} tidak tersedia di paket <strong>{PACKAGE_NAMES[packageId as PackageId] || packageId}</strong></>
          )}
          {upgradeName && (
            <> — <button className="font-bold text-amber-800 underline underline-offset-2 hover:text-amber-900 transition-colors cursor-pointer">Upgrade ke {upgradeName}</button></>
          )}
        </span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`relative overflow-hidden p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border border-amber-200/60 rounded-2xl ${className}`}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-sm">
            <Crown className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-900">
              {isLimitType
                ? `Batas ${featureName} Tercapai (${currentCount}/${formatLimit(maxCount)})`
                : `${featureName} — Fitur Premium`
              }
            </p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              {upgradeName
                ? `Upgrade ke paket ${upgradeName} (mulai Rp ${upgradePrice?.mandiri.toLocaleString('id-ID')}) untuk membuka fitur ini.`
                : 'Hubungi admin untuk informasi upgrade.'
              }
            </p>
            {upgradeName && (
              <button className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[10px] font-bold rounded-lg shadow-sm transition-all cursor-pointer">
                <ArrowUp className="w-3 h-3" />
                Upgrade ke {upgradeName}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // variant === 'overlay'
  return (
    <div className={`absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl ${className}`}>
      <div className="text-center p-6 max-w-xs">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Lock className="w-5 h-5 text-white" />
        </div>
        <p className="text-sm font-bold text-zinc-800 mb-1">{featureName}</p>
        <p className="text-[11px] text-zinc-500 mb-3">
          Fitur ini tidak tersedia di paket {PACKAGE_NAMES[packageId as PackageId] || packageId}.
          {upgradeName && ` Upgrade ke ${upgradeName} untuk mengaksesnya.`}
        </p>
        {upgradeName && (
          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer">
            <ArrowUp className="w-3.5 h-3.5" />
            Upgrade ke {upgradeName} — Rp {upgradePrice?.mandiri.toLocaleString('id-ID')}
          </button>
        )}
      </div>
    </div>
  );
}

/** Small lock badge for theme cards and similar items */
export function LockBadge({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 ${className}`}>
      <Lock className="w-3.5 h-3.5 text-white" />
    </div>
  );
}
