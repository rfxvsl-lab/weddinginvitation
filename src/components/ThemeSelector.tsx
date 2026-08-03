import React from 'react';
import { PiCheckCircleFill as Check, PiPaletteDuotone as Palette, PiCrownDuotone as Crown } from 'react-icons/pi';
import { DEFAULT_THEMES } from '../data/defaultData';
import { isThemeAvailable, PACKAGE_NAMES, getUpgradeTier, type PackageId } from '../lib/packageLimits';
import { LockBadge } from './UpgradePrompt';
import { useAlertModal } from '../hooks/useAlertModal';

interface ThemeSelectorProps {
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
  packageId?: string;
}

export default function ThemeSelector({ currentThemeId, onSelectTheme, packageId = 'luxury' }: ThemeSelectorProps) {
  const alertModal = useAlertModal();
  const handleThemeClick = (themeId: string) => {
    if (!isThemeAvailable(packageId, themeId)) {
      const upgradeTo = getUpgradeTier(packageId);
      const upgradeName = upgradeTo ? PACKAGE_NAMES[upgradeTo] : 'Premium';
      alertModal.upgrade('Tema Terkunci', `Tema ini hanya tersedia di paket ${upgradeName} ke atas. Silakan upgrade untuk mengaksesnya.`);
      return;
    }
    onSelectTheme(themeId);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2.5 tracking-tight">
          <div className="p-2 bg-zinc-100 text-zinc-700 rounded-[1rem] border border-zinc-200/50 shadow-sm">
            <Palette className="w-5 h-5" />
          </div>
          Pilihan Tema Undangan
        </h3>
        <p className="text-xs text-zinc-500 font-medium max-w-xl leading-relaxed">
          Eksplorasi koleksi palet warna eksklusif kami. Setiap tema dirancang dengan harmoni warna yang menciptakan kesan elegan, estetik, dan premium untuk hari bahagia Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEFAULT_THEMES.map((theme) => {
          const isSelected = theme.id === currentThemeId;
          const isAvailable = isThemeAvailable(packageId, theme.id);
          return (
            <button
              key={theme.id}
              onClick={() => handleThemeClick(theme.id)}
              className={`group text-left relative overflow-hidden rounded-[2rem] transition-all duration-500 ease-out flex flex-col ${
                !isAvailable
                  ? 'opacity-80 cursor-not-allowed border border-white/40'
                  : isSelected
                  ? 'scale-[1.02] border-2 border-amber-300 shadow-[0_20px_50px_-12px_rgba(245,158,11,0.3)] ring-4 ring-amber-50'
                  : 'border border-white/60 hover:border-amber-200 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1'
              } bg-white/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.04)]`}
            >
              {/* Lock badge for unavailable themes */}
              {!isAvailable && (
                <div className="absolute inset-0 z-30 bg-zinc-50/40 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-zinc-200/50">
                    <Crown className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-zinc-800">Upgrade Required</span>
                  </div>
                </div>
              )}

              {/* Top Section - Theme Gradient Preview */}
              <div className="h-32 w-full relative overflow-hidden bg-[#050505]">
                {/* Native Iframe Render */}
                <iframe
                  src={`/demo/${theme.id}?thumbnail=true`}
                  className="w-full h-[812px] absolute top-0 left-0 border-none pointer-events-none opacity-90 transition-opacity duration-500 group-hover:opacity-100"
                  tabIndex={-1}
                  aria-hidden="true"
                  loading="lazy"
                />
                
                {/* Floating Preview Pill */}
                <div 
                  className="absolute bottom-3 left-3 z-10 px-4 py-1.5 rounded-xl shadow-lg backdrop-blur-md border border-white/20 transition-transform duration-500 group-hover:scale-105"
                  style={{ 
                    backgroundColor: `${theme.bgHex}ee`,
                    color: theme.textHex
                  }}
                >
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
                    {theme.name.split(' ')[0]}
                  </span>
                </div>

                {/* Selected Checkmark overlay */}
                {isSelected && (
                  <div className="absolute top-4 right-4 z-20 animate-scaleIn">
                    <div className="bg-amber-500 rounded-full p-1 shadow-lg shadow-amber-500/40">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Section - Theme Details (Glass) */}
              <div className="p-5 flex flex-col gap-5 border-t border-white/50 bg-white/40">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-zinc-900 text-sm tracking-tight group-hover:text-amber-600 transition-colors">
                      {theme.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-semibold bg-white/80 px-2 py-0.5 rounded-lg border border-white">
                        {theme.pattern}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Color Swatches */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1.5">
                    {[
                      { hex: theme.primaryHex, name: "Utama" },
                      { hex: theme.secondaryHex, name: "Sekunder" },
                      { hex: theme.bgHex, name: "Background" },
                      { hex: theme.accentHex, name: "Aksen" },
                      { hex: theme.textHex, name: "Teks" }
                    ].map((color, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full border-[2.5px] border-white shadow-sm transition-transform duration-300 group-hover:-translate-y-1.5 hover:!scale-110 hover:!z-10 relative"
                        style={{ backgroundColor: color.hex, transitionDelay: `${i * 40}ms`, zIndex: 5 - i }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
