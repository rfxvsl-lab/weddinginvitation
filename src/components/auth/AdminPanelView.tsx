'use client';

/**
 * AdminPanelView — Panel Administrasi SaaS
 * Menampilkan daftar pengguna + riwayat transaksi + tombol override manual
 */

import React, { useState } from 'react';
import {
  PiTrashDuotone as Trash2,
  PiEyeDuotone as Eye,
  PiPrinterDuotone as Printer,
  PiFileTextDuotone as FileText,
} from 'react-icons/pi';
import type { SaaSUser, TransactionReport } from '../../types';
import { PACKAGE_PRICES as PRICES } from '../../lib/packageLimits';

interface AdminPanelViewProps {
  usersList: SaaSUser[];
  transactions: TransactionReport[];
  onApprove: (txId: string) => Promise<void>;
  onReject: (txId: string) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

function PrintModal({ tx, onClose }: { tx: TransactionReport; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white text-zinc-900 p-8 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative" id="print-area">
        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2 print:hidden z-20">
          <button onClick={() => window.print()} className="btn-primary p-2.5 text-xs shadow-md">
            <Printer className="w-4 h-4" /><span>Cetak Sekarang</span>
          </button>
          <button onClick={onClose} className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-none flex items-center gap-1.5 text-xs font-bold transition shadow-md cursor-pointer">
            <span>Tutup</span>
          </button>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-zinc-200 pb-5">
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-[var(--color-primary)] uppercase">ruanghadir.net</h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-1">Platform Undangan Digital</p>
          </div>
          <div className="text-right">
            <span className="bg-[var(--color-primary)] text-white text-[9px] px-3 py-1 rounded-md font-mono font-bold tracking-wide uppercase">LAPORAN AUDIT KHUSUS</span>
            <p className="text-xs text-zinc-500 font-mono mt-1.5">No Referensi: tx-{tx.id}</p>
          </div>
        </div>

        {/* Client info */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          {[
            ['Nama Klien', tx.userName],
            ['Email', tx.userEmail],
            ['Slug / Link', tx.userSlug],
            ['Paket', tx.packageId?.toUpperCase()],
            ['Nominal Tagihan', `Rp ${tx.nominalExpected.toLocaleString('id-ID')}`],
            ['Waktu Transaksi', tx.timestamp],
            ['Status AI', tx.status.toUpperCase()],
            ['Keaslian', tx.aiResult?.isAuthentic !== false ? 'Asli (Lolos)' : 'Palsu (Gagal)'],
          ].map(([label, value]) => (
            <div key={label} className="space-y-1">
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 font-bold">{label}</span>
              <p className="font-semibold text-zinc-800">{value}</p>
            </div>
          ))}
        </div>

        {/* Proof image */}
        {tx.proofImage && (
          <div className="border border-zinc-200 rounded-2xl overflow-hidden">
            <img src={tx.proofImage} alt="Bukti Transfer" className="w-full max-h-64 object-contain bg-zinc-50" />
          </div>
        )}

        {/* AI reasons */}
        {tx.aiResult?.reasons && (
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-2">
            <p className="text-[9px] font-mono uppercase tracking-widest font-bold text-zinc-400">Analisis AI:</p>
            <ul className="list-disc pl-4 space-y-1 text-xs text-zinc-700">
              {tx.aiResult.reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}

        <div className="border-t-2 border-zinc-200 pt-4 text-[10px] text-zinc-400 font-mono text-center">
          Dokumen ini dibuat secara otomatis oleh sistem ruanghadir.net • {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </div>
  );
}

export default function AdminPanelView({ usersList, transactions, onApprove, onReject, onDeleteUser }: AdminPanelViewProps) {
  const [printingReport, setPrintingReport] = useState<TransactionReport | null>(null);

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Apakah anda yakin ingin menghapus user ini dan semua data transaksinya?')) return;
    await onDeleteUser(userId);
  };

  return (
    <div className="w-full max-w-5xl card-glass-strong p-8 rounded-[38px] animate-slideUp space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-[var(--border-default)]">
        <div className="space-y-1">
          <span className="text-[10px] tracking-[0.35em] font-bold uppercase text-[var(--color-primary)] font-mono">PANEL ADMINISTRASI ruanghadir.net</span>
          <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] uppercase tracking-tight">Inspeksi Keuangan SaaS</h2>
        </div>
        <div className="flex gap-2">
          <span className="px-3.5 py-1 rounded-full bg-[var(--bg-surface-alt)] border border-[var(--border-light)] text-[var(--text-secondary)] font-mono text-xs">
            Total Users: <span className="text-[var(--text-primary)] font-bold">{usersList.length}</span>
          </span>
          <span className="px-3.5 py-1 rounded-full bg-[var(--bg-surface-alt)] border border-[var(--border-light)] text-[var(--text-secondary)] font-mono text-xs">
            Transaksi: <span className="text-[var(--color-secondary)] font-bold">{transactions.length}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* User list */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-[11px] font-semibold text-[var(--text-muted)] tracking-wider uppercase font-mono">Daftar Pengguna SaaS</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-elegant">
            {usersList.length === 0 ? (
              <div className="p-6 border border-[var(--border-light)] rounded-3xl text-center text-xs text-[var(--text-muted)] font-mono">
                Belum ada pengguna terdaftar
              </div>
            ) : (
              usersList.map((usr) => {
                const safePackageId = usr.packageId && PRICES[usr.packageId] ? usr.packageId : 'reguler';
                const amount = PRICES[safePackageId][usr.isCustomByRfx ? 'rfx' : 'mandiri'];
                return (
                  <div key={usr.id} className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-default)] space-y-3 relative group">
                    <button onClick={() => handleDeleteUser(usr.id)}
                      className="absolute top-3 right-3 p-1 rounded-lg hover:bg-[var(--color-danger-light)] text-[var(--text-faint)] hover:text-[var(--color-danger)] opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title="Hapus Pengguna">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase">{usr.fullName}</h4>
                      <p className="text-[10.5px] text-[var(--text-secondary)] font-mono">{usr.email}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">WA: {usr.noWa}</p>
                    </div>
                    <div className="pt-2 border-t border-[var(--border-light)] flex justify-between items-center text-[10.5px]">
                      <div>
                        <span className="px-2 py-0.5 rounded bg-[var(--bg-surface-alt)] text-[var(--text-secondary)] font-mono text-[9px] font-bold">{(usr.packageId || '').toUpperCase()}</span>
                        <span className="text-[9.5px] font-mono text-[var(--color-primary)] ml-1.5 font-bold">Rp {amount.toLocaleString('id-ID')}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase font-mono ${
                        usr.paymentStatus === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : usr.paymentStatus === 'pending' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-600 border border-red-500/20'
                      }`}>{usr.paymentStatus}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Transaction list */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[11px] font-semibold text-[var(--text-muted)] tracking-wider uppercase font-mono">Bukti Analisis Transfer</h3>
            <span className="text-[9.5px] text-[var(--text-faint)] font-mono">Detail Laporan Analisis Admin</span>
          </div>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-elegant">
            {transactions.length === 0 ? (
              <div className="p-8 border border-[var(--border-light)] rounded-3xl text-center text-xs text-[var(--text-muted)] font-mono bg-[var(--bg-surface-alt)]">
                Belum ada transaksi bukti pembayaran masuk yang tercatat
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-default)] space-y-4">
                  {/* Header */}
                  <div className="flex justify-between sm:flex-row flex-col gap-2 items-start pb-3 border-b border-[var(--border-light)]">
                    <div>
                      <h4 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-tight">{tx.userName}</h4>
                      <p className="text-[10px] text-[var(--text-secondary)] font-mono mt-0.5">Email: {tx.userEmail} | Slug: {tx.userSlug}</p>
                      <p className="text-[9px] text-[var(--text-muted)] font-mono mt-0.5">Tagihan: Rp {tx.nominalExpected.toLocaleString('id-ID')} | {(tx.packageId || '').toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-[var(--bg-surface-alt)] text-[var(--text-secondary)] px-2.5 py-1 rounded font-mono text-[9px] border border-[var(--border-light)]">{tx.timestamp}</span>
                      <div className="mt-2.5">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono tracking-wider font-bold uppercase ${tx.status === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                          AI STATUS: {tx.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Image + AI details */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-5 bg-[var(--bg-surface-alt)] p-2 rounded-2xl border border-[var(--border-light)] flex flex-col justify-between">
                      <img src={tx.proofImage} alt="Receipt" className="w-full h-44 object-contain bg-white rounded-xl" />
                      <div className="pt-2 text-center">
                        <a href={tx.proofImage} target="_blank" rel="noreferrer"
                          className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--color-primary)] underline font-mono flex items-center justify-center gap-1 transition-colors">
                          <Eye className="w-3.5 h-3.5" /><span>Buka Gambar Asli</span>
                        </a>
                      </div>
                    </div>
                    <div className="md:col-span-7 bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-default)] text-[11px] leading-relaxed space-y-3 font-mono">
                      <span className="block text-[8.5px] font-semibold text-[var(--text-muted)] tracking-wider uppercase mb-1">Inspektur Pembaca AI:</span>
                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-[var(--bg-surface)] p-2.5 border border-[var(--border-light)] rounded-xl">
                        <div>
                          <span className="text-[var(--text-faint)] block text-[8px] uppercase font-bold">Akun Penerima</span>
                          <span className="text-[var(--text-primary)] font-bold">{tx.aiResult?.recipientAccount || 'Tidak terdeteksi'}</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-faint)] block text-[8px] uppercase font-bold">Nominal Transfer</span>
                          <span className="text-[var(--text-primary)] font-bold">
                            {tx.aiResult?.nominalDetected ? `Rp ${tx.aiResult.nominalDetected.toLocaleString('id-ID')}` : 'Tidak terdeteksi'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <span className="block text-[var(--text-faint)] text-[8px] uppercase font-bold">Alasan & Rekomendasi:</span>
                        <ul className="list-disc pl-3.5 space-y-1 text-[var(--text-secondary)] text-[10px]">
                          {tx.aiResult?.reasons?.map((r, idx) => <li key={idx}>{r}</li>)}
                        </ul>
                      </div>
                      <div className="flex justify-between items-center pt-2.5 border-t border-[var(--border-light)]">
                        <span className="text-[9px] text-[var(--text-muted)]">Keaslian: {tx.aiResult?.isAuthentic !== false ? 'Asli (Lolos)' : 'Palsu (Gagal)'}</span>
                        <button onClick={() => setPrintingReport(tx)} className="btn-ghost px-2.5 py-1.5 text-[10px]" title="Cetak Laporan PDF">
                          <Printer className="w-3.5 h-3.5 text-[var(--color-primary)]" /><span>Cetak PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Override buttons */}
                  <div className="flex gap-2.5 pt-3 border-t border-[var(--border-light)] justify-end">
                    <span className="text-xs text-[var(--text-faint)] flex items-center mr-auto font-mono text-[9px] tracking-wide uppercase font-bold">Intervensi Manual:</span>
                    {tx.status !== 'success' && (
                      <button onClick={() => onApprove(tx.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-[10px] font-bold text-emerald-700 uppercase transition cursor-pointer">
                        Setujui Transaksi (Override)
                      </button>
                    )}
                    {tx.status !== 'failed' && (
                      <button onClick={() => onReject(tx.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 border border-red-300 text-[10px] font-bold text-red-700 uppercase transition cursor-pointer">
                        Tolak Transaksi (Override)
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {printingReport && <PrintModal tx={printingReport} onClose={() => setPrintingReport(null)} />}
    </div>
  );
}
