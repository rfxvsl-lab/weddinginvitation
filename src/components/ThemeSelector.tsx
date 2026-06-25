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
        <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2.5 tracking-tight">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 shadow-sm">
            <Palette className="w-5 h-5" />
          </div>
          Pilihan Tema Undangan
        </h3>
        <p className="text-xs text-zinc-500 font-medium max-w-xl leading-relaxed">
          Eksplorasi koleksi palet warna eksklusif kami. Setiap tema dirancang dengan harmoni warna yang menciptakan kesan elegan, estetik, dan premium untuk hari bahagia Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {DEFAULT_THEMES.map((theme) => {
          const isSelected = theme.id === currentThemeId;
          const isAvailable = isThemeAvailable(packageId, theme.id);
          return (
            <button
              key={theme.id}
              onClick={() => handleThemeClick(theme.id)}
              className={`group text-left relative overflow-hidden rounded-[24px] border transition-all duration-500 ease-out flex flex-col ${
                !isAvailable
                  ? 'border-zinc-200 bg-zinc-50 opacity-75 cursor-not-allowed'
                  : isSelected
                  ? 'border-rose-400 bg-white ring-4 ring-rose-50 shadow-[0_8px_30px_rgb(244,63,94,0.15)] scale-[1.02]'
                  : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-[0_8px_25px_rgb(0,0,0,0.06)] hover:-translate-y-1'
              }`}
            >
              {/* Lock badge for unavailable themes */}
              {!isAvailable && <LockBadge />}

              {/* Top Section - Theme Gradient Preview */}
              <div 
                className={`h-24 w-full relative overflow-hidden flex items-center justify-center ${!isAvailable ? 'grayscale-[40%]' : ''}`}
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryHex} 0%, ${theme.bgHex} 100%)`
                }}
              >
                {/* Decorative Elements */}
                <div 
                  className="absolute inset-0 opacity-40 mix-blend-overlay"
                  style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, ${theme.textHex} 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                  }}
                />
                
                {/* Floating Preview Pill */}
                <div 
                  className="relative z-10 px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md border border-white/20 transition-transform duration-500 group-hover:scale-105"
                  style={{ 
                    backgroundColor: `${theme.bgHex}dd`,
                    color: theme.textHex,
                    fontFamily: theme.fontSerif === 'font-serif' ? 'Georgia, serif' : 'system-ui, sans-serif'
                  }}
                >
                  <span className="text-xs font-bold tracking-widest uppercase opacity-90">
                    {theme.name.split(' ')[0]}
                  </span>
                </div>

                {/* Selected Checkmark overlay */}
                {isSelected && (
                  <div className="absolute top-3 right-3 z-20 animate-scaleIn">
                    <div className="bg-white rounded-full p-0.5 shadow-md">
                      <Check className="w-6 h-6 text-rose-500" />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Section - Theme Details */}
              <div className="p-4.5 bg-white flex flex-col gap-4 border-t border-zinc-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-zinc-800 text-sm tracking-tight group-hover:text-rose-600 transition-colors">
                      {theme.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-semibold bg-zinc-100 px-2 py-0.5 rounded-md">
                        {theme.pattern}
                      </span>
                      {!isAvailable && (
                         <span className="text-[10px] text-amber-600 flex items-center gap-0.5 uppercase tracking-widest font-mono font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                           <Crown className="w-3 h-3" /> Upgrade
                         </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Color Swatches */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex -space-x-1">
                    {[
                      { hex: theme.primaryHex, name: "Utama" },
                      { hex: theme.secondaryHex, name: "Sekunder" },
                      { hex: theme.bgHex, name: "Background" },
                      { hex: theme.accentHex, name: "Aksen" },
                      { hex: theme.textHex, name: "Teks" }
                    ].map((color, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-full border-2 border-white shadow-sm ring-1 ring-zinc-200 transition-transform duration-300 group-hover:-translate-y-1 ${!isAvailable ? 'grayscale-[30%]' : ''}`}
                        style={{ backgroundColor: color.hex, transitionDelay: `${i * 50}ms` }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 font-medium ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    5 Colors
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
