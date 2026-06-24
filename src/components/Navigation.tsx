'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { PiSignOutDuotone as LogOut, PiUserDuotone as UserCircle, PiHouseDuotone as House } from 'react-icons/pi';

interface NavigationProps {
  isDashboard?: boolean;
}

export default function Navigation({ isDashboard = false }: NavigationProps) {
  const auth = useAuth();

  return (
    <nav className="relative z-50 glass-nav px-8 py-5 flex items-center justify-between border-b border-[var(--border-light)]">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-inner border border-rose-100">
          <svg width="22" height="22" viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 3.5C2.5 2.67157 3.17157 2 4 2H20C20.8284 2 21.5 2.67157 21.5 3.5V14.5C21.5 15.3284 20.8284 16 20 16H4C3.17157 16 2.5 15.3284 2.5 14.5V3.5Z" />
            <path d="M2.5 3.5L12 9.5L21.5 3.5" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
            UndanganKita
            <span className="bg-rose-100 text-rose-600 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {isDashboard ? 'Editor' : 'Premium'}
            </span>
          </h1>
          <p className="text-[10px] text-slate-500 font-medium">Undangan Digital Pernikahan</p>
        </div>
      </Link>

      {isDashboard ? (
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 mr-4 font-medium text-sm text-[var(--text-secondary)]">
            <Link href="/" className="flex items-center gap-1.5 hover:text-[var(--color-primary)] transition-colors">
              <House className="w-4 h-4" /> Beranda
            </Link>
            <Link href="/dashboard/profile" className="flex items-center gap-1.5 hover:text-[var(--color-primary)] transition-colors cursor-pointer">
              <UserCircle className="w-4 h-4" /> Edit Profile
            </Link>
          </div>
          <button 
            onClick={() => {
              auth.logout();
              window.location.href = '/';
            }}
            className="btn-ghost rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      ) : (
        <>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-[var(--text-secondary)]">
            <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">Beranda</Link>
            <Link href="/fitur" className="hover:text-[var(--color-primary)] transition-colors">Fitur</Link>
            <Link href="/tema" className="hover:text-[var(--color-primary)] transition-colors">Tema</Link>
            <Link href="/harga" className="hover:text-[var(--color-primary)] transition-colors">Harga</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold shadow-[var(--shadow-glow-rose)] hover:shadow-lg hover:-translate-y-0.5 transition-all">
              Buat Undangan / Dashboard
            </Link>
          </div>
        </>
      )}
    </nav>
  );
}
