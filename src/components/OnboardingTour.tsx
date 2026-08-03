import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PiPaletteDuotone as Palette, PiPencilCircleDuotone as Edit3, PiUsersDuotone as Users, PiGlobeHemisphereWestDuotone as Globe, PiCaretRightDuotone as ChevronRight, PiCheckDuotone as Check, PiDesktopDuotone as Desktop, PiDeviceMobileDuotone as Mobile } from 'react-icons/pi';

export default function OnboardingTour() {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [deviceType, setDeviceType] = useState<'pc' | 'mobile' | null>(null);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('rfx_onboarding_v3');
    if (!hasSeenTour) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeTour = () => {
    localStorage.setItem('rfx_onboarding_v3', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  if (deviceType === null) {
    return (
      <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 select-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-[#0a0a0a] border border-[var(--border-light)] p-8 rounded-[2rem] w-full max-w-lg shadow-2xl relative overflow-hidden text-center"
        >
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500" />
          
          <h2 className="text-3xl font-black text-[var(--text-primary)] mb-2 mt-4">Selamat Datang!</h2>
          <p className="text-[var(--text-muted)] mb-8 text-sm">Di ruanghadir.net Invitation Builder. Untuk menyesuaikan panduan tutorial, perangkat apa yang sedang Anda gunakan saat ini?</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <button 
              onClick={() => setDeviceType('pc')}
              className="flex flex-col items-center justify-center gap-4 p-8 bg-[var(--bg-surface-alt)] hover:bg-[var(--border-light)] border border-[var(--border-light)] hover:border-sky-500 rounded-2xl transition group cursor-pointer"
            >
              <Desktop className="w-14 h-14 text-[var(--text-muted)] group-hover:text-sky-500 transition" />
              <span className="font-bold text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">PC / Laptop</span>
            </button>
            <button 
              onClick={() => setDeviceType('mobile')}
              className="flex flex-col items-center justify-center gap-4 p-8 bg-[var(--bg-surface-alt)] hover:bg-[var(--border-light)] border border-[var(--border-light)] hover:border-rose-500 rounded-2xl transition group cursor-pointer"
            >
              <Mobile className="w-14 h-14 text-[var(--text-muted)] group-hover:text-rose-500 transition" />
              <span className="font-bold text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">Handphone / Mobile</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const steps = [
    {
      icon: <Palette className="w-10 h-10 text-rose-500" />,
      title: "Langkah 1: Pemilihan Tema",
      desc: "Langkah pertama Anda adalah memilih palet warna utama dari Theme Engine kami. Tenang saja, Anda selalu bisa mengubahnya kapanpun nanti melalui menu Ganti Desain!"
    },
    {
      icon: <Edit3 className="w-10 h-10 text-sky-500" />,
      title: "Langkah 2: Live Editor",
      desc: deviceType === 'pc' 
        ? "Dashboard Builder kami dilengkapi dengan Live Preview di layar samping. Semua perubahan teks, foto, dan acara di panel editor akan langsung terlihat seketika secara real-time!"
        : "Pada tampilan Handphone, Anda dapat menekan tombol 'Live Preview' untuk menyembunyikan panel editor dan melihat hasil undangan secara real-time pada layar Anda!"
    },
    {
      icon: <Users className="w-10 h-10 text-emerald-500" />,
      title: "Langkah 3: Manajemen Tamu",
      desc: "Gunakan tab Guest Manager untuk mendata tamu undangan Anda. Anda dapat mengatur batasan porsi (Pax) dan menggunakan fitur Check-in QR Scanner kami di hari H."
    },
    {
      icon: <Globe className="w-10 h-10 text-indigo-500" />,
      title: "Langkah 4: Publikasi Tautan",
      desc: "Setelah semua data undangan sempurna, klik tombol 'Publish' berwarna biru muda di pojok kanan atas. Tautan unik Anda akan aktif online dan siap dibagikan!"
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 select-none">
      <AnimatePresence mode="wait">
        <motion.div 
          key={step}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -15 }}
          transition={{ duration: 0.3 }}
          className="bg-[#0a0a0a] border border-[var(--border-light)] p-8 rounded-[2rem] w-full max-w-lg shadow-2xl relative overflow-hidden"
        >
          {/* Background Accent */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500" />
          
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-[var(--bg-surface-alt)] rounded-2xl border border-[var(--border-light)] shadow-inner">
              {currentStep.icon}
            </div>
            <span className="text-[10px] font-mono tracking-widest text-[var(--text-muted)] uppercase bg-[var(--bg-surface-alt)] px-3 py-1 rounded-full border border-[var(--border-light)]">
              Tutorial {step + 1} / {steps.length}
            </span>
          </div>

          <div className="space-y-3 mb-8">
            <h3 className="text-2xl font-black text-[var(--text-primary)] leading-tight tracking-tight">{currentStep.title}</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              {currentStep.desc}
            </p>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-[var(--border-light)]/80">
            <div className="flex gap-1.5">
              {steps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${step === idx ? 'w-6 bg-rose-500' : 'w-2 bg-[var(--border-light)]'}`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                if (step < steps.length - 1) {
                  setStep(step + 1);
                } else {
                  completeTour();
                }
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-white/10"
            >
              {step < steps.length - 1 ? (
                <><span>Lanjut Mengerti</span><ChevronRight className="w-4 h-4" /></>
              ) : (
                <><span>Selesai & Mulai</span><Check className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
