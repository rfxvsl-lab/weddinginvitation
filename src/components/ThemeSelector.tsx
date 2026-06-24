/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PiCheckDuotone as Check, PiFireDuotone as Flame, PiFlowerDuotone as Flower, PiShieldWarningDuotone as ShieldAlert, PiSparkleDuotone as Sparkles, PiMagicWandDuotone as Wand2 } from 'react-icons/pi';
import { ThemeConfig } from '../types';
import { DEFAULT_THEMES } from '../data/defaultData';

interface ThemeSelectorProps {
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
}

export default function ThemeSelector({ currentThemeId, onSelectTheme }: ThemeSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-indigo-500" />
          Pilih Tema Warna Soft & Clean
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Pilih dari palet warna lembut kami yang dirancang khusus untuk memberikan kesan elegan, tenang, dan premium.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DEFAULT_THEMES.map((theme) => {
          const isSelected = theme.id === currentThemeId;
          return (
            <button
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              className={`text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-40 ${
                isSelected
                  ? 'border-indigo-600 bg-white shadow-lg shadow-indigo-100/40 ring-2 ring-indigo-500/20'
                  : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {/* Soft pattern-like styling inside the preview card */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none group-hover:scale-105 transition-transform duration-500"
                style={{
                  backgroundColor: theme.bgHex,
                  backgroundImage: `radial-gradient(${theme.primaryHex} 1px, transparent 0), radial-gradient(${theme.primaryHex} 1px, transparent 0)`,
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 8px 8px',
                }}
              />

              <div className="relative z-10 w-full flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-slate-800 text-sm flex items-center gap-1.5">
                    {theme.name}
                  </h4>
                  <span className="text-[11px] text-slate-400 capitalize bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 font-mono">
                    {theme.pattern} pattern
                  </span>
                </div>

                {isSelected ? (
                  <span className="bg-indigo-600 text-white rounded-full p-1 shadow-sm">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full border border-slate-200 bg-white group-hover:border-slate-300 transition-colors" />
                )}
              </div>

              {/* Color swatches rendering on the card */}
              <div className="relative z-10 flex items-center justify-between w-full mt-auto pt-4 border-t border-slate-100/60">
                <div className="flex gap-1.5">
                  <div
                    className="w-5 h-5 rounded-full shadow-sm border border-black/5"
                    style={{ backgroundColor: theme.primaryHex }}
                    title="Warna Utama"
                  />
                  <div
                    className="w-5 h-5 rounded-full shadow-sm border border-black/5"
                    style={{ backgroundColor: theme.secondaryHex }}
                    title="Warna Sekunder"
                  />
                  <div
                    className="w-5 h-5 rounded-full shadow-sm border border-black/5"
                    style={{ backgroundColor: theme.bgHex }}
                    title="Latar Belakang"
                  />
                  <div
                    className="w-5 h-5 rounded-full shadow-sm border border-black/5"
                    style={{ backgroundColor: theme.textHex }}
                    title="Warna Teks"
                  />
                </div>

                <div 
                  className="px-2 py-1 rounded text-[10px] font-semibold transition-colors duration-300"
                  style={{ 
                    backgroundColor: theme.bgHex, 
                    color: theme.accentHex,
                    fontFamily: theme.fontSerif === 'font-serif' ? 'Georgia, serif' : 'system-ui, sans-serif'
                  }}
                >
                  Abadi & Indah
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
