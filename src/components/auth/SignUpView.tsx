'use client';

/**
 * SignUpView — 3-Step Registration Wizard
 */

import React from 'react';
import {
  PiUserDuotone as User,
  PiEnvelopeDuotone as Mail,
  PiPhoneDuotone as Phone,
  PiGlobeHemisphereWestDuotone as Globe,
  PiWarningCircleDuotone as AlertCircle,
  PiCaretRightDuotone as ChevronRight,
  PiLockKeyDuotone as Lock,
} from 'react-icons/pi';

import { PACKAGE_PRICES } from '../../lib/packageLimits';

const PRICES = PACKAGE_PRICES;

type PackageId = 'demo' | 'reguler' | 'premium' | 'luxury';

interface GoogleUser {
  unverifiedEmail: string;
  name: string;
  avatarUrl?: string;
}

interface SignUpViewProps {
  step: 1 | 2 | 3;
  fullName: string; groomName: string; brideName: string;
  email: string; password: string; noWa: string; sosmed: string;
  slug: string; packageId: PackageId; isCustomByRfx: boolean;
  slugError: string; error: string | null; isLoading: boolean;
  googleUser: GoogleUser | null;
  onFullNameChange: (v: string) => void;
  onGroomChange: (v: string) => void;
  onBrideChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onNoWaChange: (v: string) => void;
  onSosmedChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  onPackageChange: (id: PackageId) => void;
  onCustomByRfxChange: (v: boolean) => void;
  onBack: () => void;
  onNext1: () => void;
  onNext2: () => void;
  onComplete: () => void;
}

function StepIndicator({ step }: { step: number }) {
  const steps = [
    { n: 1, label: 'Profil' },
    { n: 2, label: 'Kontak' },
    { n: 3, label: 'Paket' },
  ];
  return (
    <div className="flex justify-between items-center pb-4 border-b border-border">
      {steps.map((s, idx) => (
        <React.Fragment key={s.n}>
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all duration-300 ${step >= s.n ? 'bg-foreground text-background shadow-md' : 'bg-muted text-muted-foreground'}`}>
              {s.n}
            </span>
            <span className={`text-[10px] font-mono tracking-widest uppercase font-bold hidden sm:inline ${step >= s.n ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
          </div>
          {idx < steps.length - 1 && <div className={`flex-1 h-[1px] mx-4 transition-colors duration-300 ${step > s.n ? 'bg-foreground' : 'bg-border'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function PackageCard({ id, label, tier, desc, price, priceLabel, badge, badgeColor, isSelected, onClick }: {
  id: string; label: string; tier: string; desc: string;
  price: string; priceLabel: string; badge?: string; badgeColor?: string;
  isSelected: boolean; onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`group/bento p-6 rounded-xl border cursor-pointer relative flex flex-col justify-between transition-all duration-200 bg-card hover:shadow-xl ${isSelected ? 'border-foreground shadow-lg scale-[1.02]' : 'border-border hover:border-zinc-300'}`}
    >
      {badge && (
        <span className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase ${badgeColor || 'bg-foreground text-background'}`}>
          {badge}
        </span>
      )}
      <div className="space-y-1.5">
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{tier}</span>
        <h4 className="text-lg font-serif font-bold text-foreground tracking-tight">{label}</h4>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className="pt-4 border-t border-border mt-4">
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest block mb-1">{priceLabel}</span>
        <h4 className="text-xl font-bold text-foreground font-sans">{price}</h4>
      </div>
    </div>
  );
}

export default function SignUpView({
  step, fullName, groomName, brideName, email, password, noWa, sosmed,
  slug, packageId, isCustomByRfx, slugError, error, isLoading,
  googleUser,
  onFullNameChange, onGroomChange, onBrideChange, onEmailChange,
  onPasswordChange, onNoWaChange, onSosmedChange, onSlugChange,
  onPackageChange, onCustomByRfxChange, onBack, onNext1, onNext2, onComplete,
}: SignUpViewProps) {
  const stepTitles = [
    'Profil Pernikahan', 'Detail Kontak', 'Pilih Paket Layanan',
  ];
  const stepDescs = [
    'Tentukan nama panggilan serta tautan unik Anda.',
    'Lengkapi kontak RSVP.',
    'Pilih layanan sesuai kebutuhan.',
  ];

  return (
    <div className="w-full max-w-xl bg-card border border-border p-8 rounded-3xl shadow-xl animate-in fade-in zoom-in-95 duration-500 space-y-8">
      <StepIndicator step={step} />

      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-[10px] tracking-[0.25em] font-bold uppercase text-muted-foreground font-mono">REGISTRASI RUANGHADIR</span>
        <h2 className="text-3xl font-serif text-foreground tracking-tight">
          {stepTitles[step - 1]}
        </h2>
        <p className="text-sm text-muted-foreground">{stepDescs[step - 1]}</p>
      </div>

      {/* —— Step 1: Profil —— */}
      {step === 1 && (
        <div className="space-y-5">
          {!googleUser && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Nama Pemesan</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input id="signup-fullname" type="text" required value={fullName} onChange={(e) => onFullNameChange(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-1 focus:ring-foreground focus:border-foreground transition-all outline-none" placeholder="Contoh: Ridho Alamsyah" />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Panggilan Pria</label>
              <input id="signup-groom" type="text" required value={groomName} onChange={(e) => onGroomChange(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-1 focus:ring-foreground focus:border-foreground transition-all outline-none" placeholder="Contoh: Ridho" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Panggilan Wanita</label>
              <input id="signup-bride" type="text" required value={brideName} onChange={(e) => onBrideChange(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-1 focus:ring-foreground focus:border-foreground transition-all outline-none" placeholder="Contoh: Jennie" />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={onBack} className="flex-1 py-3.5 border border-border text-foreground hover:bg-muted font-bold uppercase tracking-widest text-xs rounded-xl transition-all">Batal</button>
            <button id="signup-next1" onClick={onNext1} className="flex-1 py-3.5 bg-foreground text-background hover:bg-foreground/90 font-bold uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2">
              <span>Lanjut</span><ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* —— Step 2: Kontak —— */}
      {step === 2 && (
        <div className="space-y-5">
          {!googleUser && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Alamat Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input id="signup-email" type="email" required value={email} onChange={(e) => onEmailChange(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-1 focus:ring-foreground focus:border-foreground transition-all outline-none" placeholder="nama@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Password Akun</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input id="signup-password" type="password" required value={password} onChange={(e) => onPasswordChange(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-1 focus:ring-foreground focus:border-foreground transition-all outline-none" placeholder="Minimal 6 karakter" />
                </div>
              </div>
            </>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">WhatsApp Aktif</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input id="signup-wa" type="tel" required value={noWa} onChange={(e) => onNoWaChange(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-1 focus:ring-foreground focus:border-foreground transition-all outline-none" placeholder="Format: 0812xxxxxxxx" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Instagram/TikTok</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input id="signup-sosmed" type="text" required value={sosmed} onChange={(e) => onSosmedChange(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-1 focus:ring-foreground focus:border-foreground transition-all outline-none" placeholder="@username" />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={() => onBack()} className="flex-1 py-3.5 border border-border text-foreground hover:bg-muted font-bold uppercase tracking-widest text-xs rounded-xl transition-all">Kembali</button>
            <button id="signup-next2" onClick={onNext2} className="flex-1 py-3.5 bg-foreground text-background hover:bg-foreground/90 font-bold uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2">
              <span>Lanjut</span><ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* —— Step 3: Paket —— */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PackageCard id="demo" label="DEMO" tier="Uji Coba" desc="3 hari aktif • 20 tamu • 2 tema"
              price="Gratis" priceLabel="Biaya" badge="3 Hari" badgeColor="bg-muted text-muted-foreground border border-border"
              isSelected={packageId === 'demo'} onClick={() => onPackageChange('demo')} />
            <PackageCard id="reguler" label="REGULER" tier="Dasar" desc="20 hari aktif • 100 tamu • 3 tema"
              price="Rp 35.000" priceLabel="Buat Sendiri"
              isSelected={packageId === 'reguler'} onClick={() => onPackageChange('reguler')} />
            <PackageCard id="premium" label="PREMIUM" tier="Lengkap" desc="2 bulan aktif • 500 tamu • semua tema"
              price="Rp 90.000" priceLabel="Buat Sendiri" badge="Populer" badgeColor="bg-foreground text-background"
              isSelected={packageId === 'premium'} onClick={() => onPackageChange('premium')} />
            <PackageCard id="luxury" label="LUXURY" tier="Eksklusif" desc="3 bulan aktif • ∞ tamu • semua tema"
              price="Rp 150.000" priceLabel="Buat Sendiri" badge="Terlengkap" badgeColor="bg-background text-foreground border border-foreground"
              isSelected={packageId === 'luxury'} onClick={() => onPackageChange('luxury')} />
          </div>

          {/* Slug input */}
          <div className="space-y-3 bg-muted/50 border border-border p-5 rounded-2xl">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-foreground tracking-widest uppercase flex items-center gap-1.5">
                <Globe className="w-4 h-4" /><span>Slug / Link Undangan</span>
              </label>
              <span className="text-[10px] text-muted-foreground font-mono">{packageId === 'demo' ? 'Otomatis' : 'Custom'}</span>
            </div>
            <input id="signup-slug" type="text" required value={slug} onChange={(e) => onSlugChange(e.target.value)}
              disabled={packageId === 'demo'}
              className={`w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-mono focus:ring-1 focus:ring-foreground focus:border-foreground transition-all outline-none ${packageId === 'demo' ? 'opacity-60 cursor-not-allowed' : ''}`}
              placeholder="Contoh: ridho-jennie" />
            {packageId !== 'demo' && slugError ? (
              <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 p-3 border border-destructive/20 rounded-xl mt-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{slugError}</span>
              </div>
            ) : slug ? (
              <p className="text-xs text-muted-foreground mt-2">
                Link: <span className="font-bold font-mono bg-background px-2 py-1 rounded-md border border-border">ruanghadir.net/{slug}</span>
              </p>
            ) : null}
          </div>

          {/* Custom/Mandiri toggle */}
          {packageId !== 'demo' && (
            <div className="bg-muted/50 border border-border p-5 rounded-3xl space-y-4">
              <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Opsi Pembuatan</label>
              <div className="flex flex-col sm:flex-row gap-4">
                {[
                  { val: false, label: 'Buat Sendiri', sub: 'Edit via builder', price: PRICES[packageId].mandiri },
                  { val: true, label: 'Terima Beres', sub: 'Dibuatkan tim kami', price: PRICES[packageId].rfx },
                ].map(({ val, label, sub, price }) => (
                  <div key={label} onClick={() => onCustomByRfxChange(val)}
                    className={`flex-1 p-5 rounded-2xl border cursor-pointer flex flex-col justify-between bg-card transition-all duration-300 ${isCustomByRfx === val ? 'border-foreground shadow-md' : 'border-border hover:border-foreground/50'}`}
                  >
                    <div>
                      <h5 className="text-xs font-bold text-foreground uppercase tracking-widest">{label}</h5>
                      <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>
                    </div>
                    <span className="text-sm font-bold text-foreground mt-4 block">Rp {price.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total summary */}
          <div className="bg-foreground text-background p-6 rounded-3xl flex justify-between items-center shadow-lg">
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-widest text-background/70 uppercase">Total Ringkasan</span>
              <h5 className="text-sm font-bold">
                Paket {packageId.toUpperCase()} {packageId !== 'demo' && `+ ${isCustomByRfx ? 'Terima Beres' : 'Buat Sendiri'}`}
              </h5>
            </div>
            <h4 className="text-2xl font-serif font-bold">
              {packageId === 'demo' ? 'Gratis' : `Rp ${PRICES[packageId as keyof typeof PRICES][isCustomByRfx ? 'rfx' : 'mandiri'].toLocaleString('id-ID')}`}
            </h4>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-3.5 border border-destructive/20 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-border mt-6">
            <button onClick={() => onBack()} className="flex-1 py-3.5 border border-border text-foreground hover:bg-muted font-bold uppercase tracking-widest text-xs rounded-xl transition-all">Kembali</button>
            <button id="signup-complete" onClick={onComplete} disabled={isLoading} className="flex-[2] py-3.5 bg-foreground text-background hover:bg-foreground/90 font-bold uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              <span>{isLoading ? 'Memproses...' : 'Selesaikan'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
