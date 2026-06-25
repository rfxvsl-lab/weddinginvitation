'use client';

import React from 'react';
import type { WatermarkType } from '../lib/packageLimits';

interface WatermarkOverlayProps {
  type: WatermarkType;
  className?: string;
}

/**
 * Watermark overlay for tiered plans.
 * - 'large': Big centered watermark (Demo tier)
 * - 'small': Small footer watermark (Reguler tier)
 * - 'none': No watermark (Premium/Luxury)
 */
export default function WatermarkOverlay({ type, className = '' }: WatermarkOverlayProps) {
  if (type === 'none') return null;

  if (type === 'large') {
    return (
      <>
        {/* Center watermark — large diagonal */}
        <div className={`fixed inset-0 flex items-center justify-center pointer-events-none z-[9998] ${className}`}>
          <div className="rotate-[-25deg] select-none">
            <div className="text-center space-y-1 opacity-[0.12]">
              <p className="text-[40px] sm:text-[56px] font-black tracking-tighter leading-none text-black">
                RUANGHADIR
              </p>
              <p className="text-[14px] sm:text-[18px] font-bold tracking-[0.3em] uppercase text-black">
                .NET — Demo Version
              </p>
            </div>
          </div>
        </div>
        {/* Bottom badge — always visible */}
        <div className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-none">
          <div className="bg-gradient-to-r from-zinc-900/90 via-zinc-800/95 to-zinc-900/90 backdrop-blur-sm px-4 py-2 flex items-center justify-center gap-2 pointer-events-auto">
            <span className="text-[10px] text-zinc-300 font-semibold tracking-wide">
              🔒 Demo RUANGHADIR.net — <a href="https://ruanghadir.net" className="text-amber-400 underline underline-offset-2 hover:text-amber-300">Upgrade untuk menghapus watermark</a>
            </span>
          </div>
        </div>
      </>
    );
  }

  // type === 'small'
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[9999] pointer-events-none ${className}`}>
      <div className="bg-zinc-900/70 backdrop-blur-sm px-4 py-1.5 flex items-center justify-center pointer-events-auto">
        <span className="text-[9px] text-zinc-400 font-medium tracking-wide">
          Powered by <span className="text-zinc-200 font-bold">RUANGHADIR.net</span>
        </span>
      </div>
    </div>
  );
}
