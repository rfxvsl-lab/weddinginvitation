'use client';

/**
 * Halaman admin. Hanya dirender setelah server memastikan pemanggil adalah
 * admin (lihat src/app/admin/page.tsx); data diambil lewat server action
 * yang memeriksa peran admin lagi.
 */

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { ErrorBoundary } from './ErrorBoundary';
import AdminPanelView from './auth/AdminPanelView';

export default function AdminPage() {
  const auth = useAuth();
  const { fetchAdminData } = auth;

  useEffect(() => {
    void fetchAdminData();
  }, [fetchAdminData]);

  return (
    <div className="min-h-screen bg-[#F6F1EA] text-[#2B2018] font-sans">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#E4D8C3] bg-[#FFFDFB]">
        <h1 className="text-sm font-bold uppercase tracking-widest">Panel Admin</h1>
        <nav className="flex items-center gap-4 text-xs font-bold">
          <Link href="/dashboard" className="underline-offset-4 hover:underline">
            Dashboard
          </Link>
          <button
            type="button"
            onClick={async () => {
              await auth.logout();
              window.location.href = '/auth';
            }}
            className="cursor-pointer underline-offset-4 hover:underline"
          >
            Keluar
          </button>
        </nav>
      </header>
      <main className="flex flex-col items-center px-4 py-10">
        {auth.isLoading && auth.allUsers.length === 0 ? (
          <p className="text-sm text-[#6B5B4A]" role="status">
            Memuat data admin…
          </p>
        ) : (
          <ErrorBoundary name="AdminPanel">
            <AdminPanelView
              usersList={auth.allUsers}
              transactions={auth.allTransactions}
              onApprove={auth.approveTransaction}
              onReject={auth.rejectTransaction}
              onDeleteUser={auth.deleteUser}
            />
          </ErrorBoundary>
        )}
      </main>
    </div>
  );
}
