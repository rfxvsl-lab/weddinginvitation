/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Copy, 
  Share2, 
  Send, 
  Check, 
  Filter, 
  UserPlus, 
  ExternalLink,
  QrCode,
  Ticket,
  Printer,
  Download,
  FileText,
  CheckCircle,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Guest } from '../types';

interface GuestManagerProps {
  guests: Guest[];
  appUrl: string;
  slug: string;
  coupleNames: string;
  onAddGuest: (guest: Omit<Guest, 'id' | 'invitationCode'>) => void;
  onRemoveGuest: (id: string) => void;
  onUpdateGuestStatus: (id: string, status: Guest['status']) => void;
}

export default function GuestManager({ guests, appUrl, slug, coupleNames, onAddGuest, onRemoveGuest, onUpdateGuestStatus }: GuestManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('Semua');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // QR Check-In Terminal simulator states
  const [selectedQRBoxGuest, setSelectedQRBoxGuest] = useState<Guest | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  // Form state
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('Sahabat');
  const [newPhone, setNewPhone] = useState('');
  const [newPaxLimit, setNewPaxLimit] = useState(2);
  const [showAddForm, setShowAddForm] = useState(false);

  // CSV & PDF Export/Print Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState<'all' | 'filtered'>('all');
  const [includeSignatureColumn, setIncludeSignatureColumn] = useState(true);
  const [includePhoneColumn, setIncludePhoneColumn] = useState(true);
  const [includeStatusColumn, setIncludeStatusColumn] = useState(true);
  const [copiedReportMain, setCopiedReportMain] = useState(false);

  // Get unique groups
  const groups = ['Semua', ...Array.from(new Set(guests.map(g => g.group)))];

  // Filter guests
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          guest.phoneNumber.includes(searchTerm);
    const matchesGroup = selectedGroup === 'Semua' || guest.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddGuest({
      name: newName.trim(),
      group: newGroup,
      phoneNumber: newPhone.trim() || '081234567890',
      paxLimit: Number(newPaxLimit),
      status: 'Draft'
    });

    // Reset Form
    setNewName('');
    setNewPhone('');
    setNewPaxLimit(2);
    setShowAddForm(false);
  };

  // Generate real link referencing current development URL
  const generateInvitationLink = (guest: Guest) => {
    // Generate public link based on user slug and appUrl
    const baseUrl = appUrl || 'https://undangankita.rfx.web.id';
    return `${baseUrl}/${slug}?to=${encodeURIComponent(guest.name)}&code=${guest.invitationCode}`;
  };

  const handleCopyLink = (guest: Guest) => {
    const link = generateInvitationLink(guest);
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(guest.id);
      onUpdateGuestStatus(guest.id, 'Sent');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleSimulateWhatsApp = (guest: Guest) => {
    const link = generateInvitationLink(guest);
    const textMsg = `Halo *${guest.name}*, Kami mengundang Anda untuk hadir di acara pernikahan ${coupleNames}. Silakan buka tautan undangan digital berikut untuk detail acara dan konfirmasi RSVP: ${link}`;
    const waUrl = `https://api.whatsapp.com/send?phone=${guest.phoneNumber}&text=${encodeURIComponent(textMsg)}`;
    
    onUpdateGuestStatus(guest.id, 'Opened');
    window.open(waUrl, '_blank');
  };


  // Perform standard UTF-8 CSV downloads with BOM preamble for Microsoft Excel compliance
  const handleExportCSV = (scope: 'all' | 'filtered') => {
    const listToExport = scope === 'all' ? guests : filteredGuests;
    if (listToExport.length === 0) {
      alert("Tidak ada data tamu dalam kriteria cetak / ekspor ini!");
      return;
    }

    const headers = [
      'No',
      'Nama Tamu',
      'Kategori/Grup',
      'Nomor WhatsApp',
      'Batas Pax',
      'Kode Undangan Unik',
      'Link Undangan Digital',
      'Status Undangan'
    ];

    const rows = listToExport.map((guest, idx) => {
      const link = generateInvitationLink(guest);
      return [
        idx + 1,
        `"${guest.name.replace(/"/g, '""')}"`,
        `"${guest.group.replace(/"/g, '""')}"`,
        `"${guest.phoneNumber}"`,
        guest.paxLimit,
        `"${guest.invitationCode}"`,
        `"${link}"`,
        guest.status === 'Opened' ? 'Dibuka (Hadir)' : guest.status === 'Sent' ? 'Terkirim' : 'Draf'
      ];
    });

    // BOM format for perfect Indonesian Excel rendering
    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const scopeStr = scope === 'all' ? 'Semua' : 'Filtered';
    const dateStr = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
    link.setAttribute('download', `Daftar_Tamu_UndanganKita_${scopeStr}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Alternative odd/even signature lines for authentic Indonesian wedding check-in registries
  const renderSignatureCell = (index: number) => {
    const rowNum = index + 1;
    const isOdd = rowNum % 2 !== 0;
    return (
      <div className="w-40 h-8 flex items-center pr-1 text-[10px] text-zinc-650 font-mono">
        {isOdd ? (
          <span className="flex-1 text-left">{rowNum}. ..........................</span>
        ) : (
          <span className="flex-1 text-center font-semibold pl-12 pr-1">{rowNum}. ..........................</span>
        )}
      </div>
    );
  };

  // Open natural print layout page using native window.print and custom media classes
  const handleTriggerPrint = () => {
    // Hide our modal screen first before firing print setup so layout renders cleanly
    setIsExportModalOpen(false);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Manajemen Daftar Tamu Undangan
          </h3>
          <p className="text-xs text-slate-500">
            Kelola data tamu, atur jumlah porsi reservasi (pax limit), serta bagikan tautan kustom WhatsApp.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          {showAddForm ? 'Tutup Formulir' : 'Tambah Tamu Baru'}
        </button>
      </div>

      {/* FORM TAMBAH GUEST */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-5 border border-indigo-100 bg-indigo-50/20 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-4 animate-fadeIn">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Lengkap Tamu</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Bapak Budi Prasetyo"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Grup / Kategori</label>
            <select
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
            >
              <option value="Keluarga">Keluarga</option>
              <option value="Sahabat">Sahabat</option>
              <option value="Rekan Kerja">Rekan Kerja</option>
              <option value="Suami Istri">Suami Istri</option>
              <option value="Tetangga">Tetangga</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nomor WhatsApp (Phone)</label>
            <input
              type="text"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="e.g. 081234567890"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Porsi Pax Maksimal</label>
              <input
                type="number"
                min={1}
                max={10}
                value={newPaxLimit}
                onChange={(e) => setNewPaxLimit(Number(e.target.value))}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
            >
              Simpan
            </button>
          </div>
        </form>
      )}

      {/* FILTER & SEARCH */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama tamu atau nomor telepon..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none transition-all text-slate-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-105 text-slate-600"
          >
            {groups.map(grp => (
              <option key={grp} value={grp}>{grp}</option>
            ))}
          </select>
        </div>
      </div>

      {/* EXPORT DATA & PRINT CONTROL BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50 border border-slate-100 p-4 rounded-xl animate-fadeIn">
        <div className="text-xs text-slate-500">
          Menampilkan <span className="font-bold text-indigo-650 font-mono">{filteredGuests.length}</span> dari <span className="font-bold text-slate-700 font-mono">{guests.length}</span> total tamu undangan.
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setExportScope('filtered');
              setIsExportModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-[11px] font-bold transition shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600" />
            <span>Cetak PDF / Absensi</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleExportCSV('filtered')}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-[11px] font-bold transition shadow-sm cursor-pointer"
            title="Ekspor daftar tamu aktif saat ini sebagai dokumen file .csv"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Unduh CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setExportScope('all');
              setIsExportModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-205 rounded-xl text-[11px] font-bold transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Kustom Cetak (Lengkap)</span>
          </button>
        </div>
      </div>

      {/* GUEST LIST CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-semibold text-slate-500 border-b border-slate-100">
                <th className="px-5 py-3">Nama Tamu & Grup</th>
                <th className="px-4 py-3">Kode Unik</th>
                <th className="px-4 py-3">No. Telp</th>
                <th className="px-4 py-3 text-center">Pax limit</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi Undangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-55/65">
              {filteredGuests.length > 0 ? (
                filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-xs text-slate-800">{guest.name}</div>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/40 mt-1">
                        {guest.group}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <code className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {guest.invitationCode}
                      </code>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 font-mono">
                      {guest.phoneNumber}
                    </td>
                    <td className="px-4 py-3.5 text-center text-xs font-semibold text-slate-700">
                      {guest.paxLimit} Pax
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        guest.status === 'Opened'
                          ? 'bg-emerald-100 text-emerald-800'
                          : guest.status === 'Sent'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {guest.status === 'Opened' ? 'Dibuka' : guest.status === 'Sent' ? 'Terkirim' : 'Draf'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right flex items-center justify-end gap-1.5 h-full">
                      {/* Copy Link */}
                      <button
                        type="button"
                        onClick={() => handleCopyLink(guest)}
                        className={`p-1.5 rounded-lg border transition ${
                          copiedId === guest.id
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                        title="Salin Tautan Undangan Kustom"
                      >
                        {copiedId === guest.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {/* WA Simulation */}
                      <button
                        type="button"
                        onClick={() => handleSimulateWhatsApp(guest)}
                        className="p-1.5 bg-white text-emerald-600 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 rounded-lg transition flex items-center justify-center animate-fadeIn"
                        title="Simulasikan Kirim WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>

                      {/* QR Ticket & Check-in scan box */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedQRBoxGuest(guest);
                          setCheckInSuccess(false);
                          setIsCheckingIn(false);
                        }}
                        className="p-1.5 bg-white text-red-600 border border-slate-200 hover:bg-red-50 hover:border-red-200 rounded-lg transition"
                        title="Lihat Tiket QR Code & Simulasikan Registrasi"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      {/* Open Invitation Preview directly in new window */}
                      <a
                        href={generateInvitationLink(guest)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-white text-indigo-600 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 rounded-lg transition"
                        title="Buka Sebagai Tamu ini"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      {/* Remove Guest */}
                      <button
                        type="button"
                        onClick={() => onRemoveGuest(guest.id)}
                        className="p-1.5 bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-700 rounded-lg transition"
                        title="Hapus Penerima"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-xs text-slate-400">
                    Tidak ada data tamu yang cocok dengan pencarian Anda. Masukkan tamu baru menggunakan tombol di atas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GLOWING MODAL SHOWING THE SELECTED GUEST TICKET QR & CHECK-IN SYSTEM SIMULATOR */}
      {selectedQRBoxGuest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-fadeIn select-none">
          <div className="bg-[#050505] border border-zinc-800 rounded-[2.5rem] p-6 max-w-sm w-full space-y-5 text-center text-zinc-100 shadow-[0_0_35px_rgba(220,38,38,0.3)] relative overflow-hidden">
            {/* Header notch accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-650 via-red-500 to-red-650" />
            
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2.5">
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">TIKET QR & CHECK-IN DI LOKASI</span>
              <button 
                onClick={() => setSelectedQRBoxGuest(null)}
                className="text-zinc-500 hover:text-white transition text-xs font-bold leading-none p-1.5 hover:bg-zinc-900 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white leading-tight">{selectedQRBoxGuest.name}</h3>
              <p className="text-[11px] text-zinc-400">Grup: <strong className="text-red-500 uppercase tracking-wide">{selectedQRBoxGuest.group}</strong> • Limit Porsi: <strong>{selectedQRBoxGuest.paxLimit} Pax</strong></p>
            </div>

            {/* Simulated Live Ticket QR Scan box */}
            <div className="relative py-1.5 flex flex-col items-center">
              <div className={`p-4 rounded-3xl bg-white relative transition-all duration-500 ${
                checkInSuccess || selectedQRBoxGuest.status === 'Opened' ? 'ring-8 ring-emerald-500/20 scale-102 shadow-[0_0_20px_rgba(16,185,129,0.3)] border-emerald-500' : 'ring-1 ring-zinc-800'
              }`}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=dc2626&data=${encodeURIComponent(selectedQRBoxGuest.invitationCode)}`}
                  alt="Guest Ticket QR"
                  className="w-36 h-36 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="mt-4">
                <span className="text-[8px] font-mono text-zinc-500 tracking-wider block">KODE PENDAFTARAN Tamu</span>
                <code className="text-sm font-black font-mono tracking-widest text-red-550 bg-red-950/20 px-3.5 py-1 rounded-xl border border-red-900/30 inline-block mt-0.5">
                  {selectedQRBoxGuest.invitationCode}
                </code>
              </div>
            </div>

            {/* Check-In State Banner */}
            <div className={`p-3.5 rounded-2xl text-xs border transition-all ${
              selectedQRBoxGuest.status === 'Opened' || checkInSuccess
                ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400'
                : 'bg-zinc-900/40 border-zinc-850/80 text-zinc-450'
            }`}>
              <div className="flex items-center justify-center gap-1.5 font-semibold">
                <span className={`w-2 h-2 rounded-full ${selectedQRBoxGuest.status === 'Opened' || checkInSuccess ? 'bg-emerald-505 animate-ping' : 'bg-amber-500'}`} />
                Status di Lokasi: {selectedQRBoxGuest.status === 'Opened' || checkInSuccess ? 'SUDAH CHECK-IN (HADIR)' : 'Belum Check-In'}
              </div>
            </div>

            {/* Live Scan Action Simulator Button */}
            <div className="space-y-1.5">
              <button
                type="button"
                disabled={isCheckingIn || selectedQRBoxGuest.status === 'Opened'}
                onClick={() => {
                  setIsCheckingIn(true);
                  // 1.2 second fake network latency check-in scanner delay
                  setTimeout(() => {
                    onUpdateGuestStatus(selectedQRBoxGuest.id, 'Opened');
                    setCheckInSuccess(true);
                    setIsCheckingIn(false);
                  }, 1200);
                }}
                className={`w-full py-3.5 rounded-2xl text-xs font-bold leading-none cursor-pointer flex items-center justify-center gap-2 border transition-all ${
                  selectedQRBoxGuest.status === 'Opened'
                    ? 'bg-zinc-900/80 border-zinc-800/80 text-zinc-500 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.25)] hover:shadow-[0_0_20px_rgba(220,38,38,0.35)]'
                }`}
              >
                {isCheckingIn ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Menghubungkan ke Scanner...
                  </span>
                ) : selectedQRBoxGuest.status === 'Opened' ? (
                  'Sudah Verifikasi Hadir ✔'
                ) : (
                  <>
                    <Ticket className="w-3.5 h-3.5" />
                    Simulasikan Scanning Check-in
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedQRBoxGuest(null)}
                className="w-full py-2.5 rounded-xl text-zinc-500 hover:text-zinc-300 text-[10px] font-mono hover:bg-zinc-900/30 transition cursor-pointer"
              >
                Kembali ke Daftar Tamu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== ADVANCED CUSTOM EXPORT & PDF PRINT CONFIGURATION DIALOG ====== */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-[#000]/80 backdrop-blur-md z-[180] flex items-center justify-center p-4 animate-fadeIn select-none md:p-6">
          <div className="bg-white text-slate-800 rounded-3xl w-full max-w-4xl h-[90vh] md:h-[80vh] flex flex-col md:flex-row overflow-hidden shadow-2xl border border-slate-205">
            {/* Sidebar Controls */}
            <div className="w-full md:w-80 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-5 shrink-0 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-5">
                <div>
                  <span className="text-[9px] font-mono tracking-widest text-indigo-600 font-black uppercase block">Undangankita Export Wizard</span>
                  <h3 className="text-base font-extrabold text-slate-800 mt-0.5">Konfigurasi Laporan</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Format lembar rekap fisik, absensi manual & file spreadsheet dapat diunduh langsung.</p>
                </div>

                <div className="space-y-3.5">
                  {/* Scope Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Cakupan Data Tamu</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setExportScope('all')}
                        className={`py-2 px-3 text-xs rounded-xl border text-center font-bold cursor-pointer transition ${
                          exportScope === 'all'
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Semua ({guests.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setExportScope('filtered')}
                        className={`py-2 px-3 text-xs rounded-xl border text-center font-bold cursor-pointer transition ${
                          exportScope === 'filtered'
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Sesuai Filter ({filteredGuests.length})
                      </button>
                    </div>
                  </div>

                  {/* Toggle Columns list */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <label className="block text-xs font-bold text-slate-700">Pilihan Kolom Laporan</label>
                    
                    <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-150 text-[11.5px] cursor-pointer hover:bg-slate-100/50 transition">
                      <input
                        type="checkbox"
                        checked={includeSignatureColumn}
                        onChange={(e) => setIncludeSignatureColumn(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                      <div>
                        <span className="font-bold text-slate-705 block text-left">Kolom Tanda Tangan</span>
                        <span className="text-[10px] text-slate-400 block text-left">Lembar registrasi fisik di meja tamu.</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-150 text-[11.5px] cursor-pointer hover:bg-slate-100/50 transition">
                      <input
                        type="checkbox"
                        checked={includePhoneColumn}
                        onChange={(e) => setIncludePhoneColumn(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                      <div>
                        <span className="font-bold text-slate-705 block text-left">Kolom Kontak WA</span>
                        <span className="text-[10px] text-slate-400 block text-left">Menyertakan nomor handphone WhatsApp.</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-150 text-[11.5px] cursor-pointer hover:bg-slate-100/50 transition">
                      <input
                        type="checkbox"
                        checked={includeStatusColumn}
                        onChange={(e) => setIncludeStatusColumn(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                      <div>
                        <span className="font-bold text-slate-705 block text-left">Kolom Kehadiran Digital</span>
                        <span className="text-[10px] text-slate-400 block text-left">Status rsvp/check-in dari database.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Sidebar Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleExportCSV(exportScope)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 hover:border-emerald-750 text-white border border-emerald-600 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Ekspor File CSV (Excel)</span>
                </button>

                <button
                  type="button"
                  onClick={handleTriggerPrint}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 hover:border-indigo-750 text-white border border-indigo-600 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak PDF / Print Fisik</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="w-full py-2 text-slate-450 hover:text-slate-700 text-[11px] font-bold text-center hover:bg-slate-100 rounded-lg transition"
                >
                  Batal / Kembali
                </button>
              </div>
            </div>

            {/* WYSIWYG Print Preview Canvas Sheet */}
            <div className="flex-1 bg-slate-200 p-6 overflow-y-auto flex justify-center">
              <div className="bg-white w-[210mm] min-h-[297mm] h-fit p-10 shadow-lg border border-slate-250 flex flex-col justify-between text-slate-800 scale-95 origin-top relative rounded-sm">
                
                {/* Visual Watermarked Badge */}
                <div className="absolute top-2 right-4 text-[9px] font-mono tracking-widest text-slate-350 select-none uppercase">Print Preview Sheet A4 (Skala 95%)</div>
                
                <div className="space-y-6">
                  {/* Ledger Header */}
                  <div className="text-center border-b-2 border-slate-800 pb-3">
                    <span className="text-[9px] font-mono font-bold tracking-widest text-[#4f46e5]/80 uppercase block">REKAP DAFTAR TAMU & LEMBAR ABSENSI FISIK</span>
                    <h2 className="text-lg font-black uppercase mt-0.5 tracking-tight">PERNIKAHAN {coupleNames}</h2>
                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono mt-2">
                      <span>Platform Portal: undangankita.rfx.web.id</span>
                      <span>Dicetak: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Summary grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-150 p-2.5 rounded-lg text-[10px] font-mono">
                    <div>
                      <span className="text-slate-400 block">Target Kriteria:</span>
                      <strong className="text-slate-800 uppercase">{exportScope === 'all' ? 'Semua Tamu' : `Filter (${selectedGroup})`}</strong>
                    </div>
                    <div>
                      <span className="text-slate-450 block">Mata Anggaran:</span>
                      <strong className="text-slate-800">{(exportScope === 'all' ? guests : filteredGuests).length} Orang</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-450 block">Total Pax Terdata:</span>
                      <strong className="text-slate-800">{(exportScope === 'all' ? guests : filteredGuests).reduce((acc, g) => acc + g.paxLimit, 0)} Pax</strong>
                    </div>
                  </div>

                  {/* Table rendering demo */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-[10px] border-collapse leading-normal text-slate-800">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-205 font-bold text-slate-650 text-center text-[9px] uppercase">
                          <th className="px-2 py-1.5 border-r border-slate-200 w-8">No</th>
                          <th className="px-2 py-1.5 border-r border-slate-200 text-left">Nama Tamu</th>
                          <th className="px-2 py-1.5 border-r border-slate-200 w-20 text-center">Grup</th>
                          {includePhoneColumn && <th className="px-2 py-1.5 border-r border-slate-200 w-24">WhatsApp</th>}
                          <th className="px-1 py-1.5 border-r border-slate-200 w-10 text-center">Pax</th>
                          <th className="px-2 py-1.5 border-r border-slate-200 w-14">Kode</th>
                          {includeStatusColumn && <th className="px-2 py-1.5 border-r border-slate-200 w-16">Status</th>}
                          {includeSignatureColumn && <th className="px-2 py-1.5">Tanda Tangan</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {(exportScope === 'all' ? guests : filteredGuests).slice(0, 10).map((guest, idx) => (
                          <tr key={guest.id} className="hover:bg-slate-50/40">
                            <td className="px-2 py-2 border-r border-slate-200 text-center font-mono">{idx + 1}</td>
                            <td className="px-2 py-2 border-r border-slate-200 font-bold text-slate-800 text-left">{guest.name}</td>
                            <td className="px-2 py-2 border-r border-slate-200 text-center text-slate-500 font-medium">{guest.group}</td>
                            {includePhoneColumn && <td className="px-2 py-2 border-r border-slate-200 text-center font-mono text-slate-500">{guest.phoneNumber}</td>}
                            <td className="px-1 py-2 border-r border-slate-200 text-center font-bold text-slate-700">{guest.paxLimit} pax</td>
                            <td className="px-2 rounded-sm border-r border-slate-200 text-center text-[8.5px] font-mono text-slate-450">{guest.invitationCode}</td>
                            {includeStatusColumn && (
                              <td className="px-1.5 py-2 border-r border-slate-200 text-center text-[9px]">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-slate-500 font-bold ${
                                  guest.status === 'Opened' ? 'bg-emerald-50 text-emerald-750' : guest.status === 'Sent' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-400'
                                }`}>
                                  {guest.status === 'Opened' ? 'Hadir ✔' : guest.status === 'Sent' ? 'Terkirim' : 'Draf'}
                                </span>
                              </td>
                            )}
                            {includeSignatureColumn && (
                              <td className="px-2 py-1 text-[8.5px] text-slate-400 font-mono text-left">
                                {(idx + 1) % 2 !== 0 ? `${idx + 1}. ....................` : `......... ${idx + 1}.`}
                              </td>
                            )}
                          </tr>
                        ))}
                        {(exportScope === 'all' ? guests : filteredGuests).length > 10 && (
                          <tr className="bg-slate-50">
                            <td colSpan={includeSignatureColumn ? (includePhoneColumn ? (includeStatusColumn ? 8 : 7) : (includeStatusColumn ? 7 : 6)) : (includePhoneColumn ? (includeStatusColumn ? 7 : 6) : (includeStatusColumn ? 6 : 5))} className="text-center py-2 text-[9px] italic font-mono text-slate-400 border-t border-slate-200">
                              (Serta {(exportScope === 'all' ? guests : filteredGuests).length - 10} tamu baris lainnya disembunyikan pada ringkasan pratinjau lembar pertama ini...)
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between items-start text-[8.5px] text-slate-450 font-mono mt-6">
                  <div className="text-left">
                    <strong>Keterangan Lembar Absensi Fisik:</strong>
                    <p className="mt-0.5">Mencocokkan Kode Unik sangat dianjurkan untuk sinkronisasi check-in aplikasi.</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-6 pr-2">
                    <span>Saksi Penerima Meja Registrasi</span>
                    <span>( _________________________ )</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== HIDDEN PRINT-ONLY SECTION (STYLIZED PHYSICAL GUEST BOOK SHEET FOR A4 DOCUMENT EXTRACTION) ====== */}
      <div id="print-section" className="hidden p-8 font-sans text-black bg-white">
        {/* Style tag injected specifically for print context to control visibility flawlessly */}
        <div dangerouslySetInnerHTML={{__html: `
          <style>
            @media print {
              html, body {
                background-color: white !important;
                color: black !important;
                margin: 0 !important;
                padding: 0 !important;
                font-family: 'Inter', system-ui, sans-serif !important;
              }
              /* Hide all components of the main dashboard rendering */
              body > * {
                display: none !important;
              }
              /* FORCE only print-section to display */
              #print-section {
                display: block !important;
                visibility: visible !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: auto !important;
                background: white !important;
                color: black !important;
                padding: 15mm !important;
              }
              #print-section * {
                visibility: visible !important;
                color: black !important;
                border-color: #333 !important;
              }
              table {
                width: 100% !important;
                border-collapse: collapse !important;
                page-break-inside: auto !important;
                margin-top: 15px !important;
              }
              tr {
                page-break-inside: avoid !important;
                page-break-after: auto !important;
              }
              thead {
                display: table-header-group !important;
              }
              th, td {
                border: 1px solid #000 !important;
                padding: 6px 8px !important;
                font-size: 9pt !important;
                color: #000 !important;
              }
              th {
                background-color: #f1f5f9 !important;
                font-weight: bold !important;
              }
              .title-box {
                border-bottom: 2px solid #000 !important;
                padding-bottom: 12px !important;
                margin-bottom: 20px !important;
              }
            }
          </style>
        `}} />

        <div className="title-box text-center border-b-2 border-black pb-4 mb-6">
          <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500">REKAP DAFTAR TAMU & LEMBAR ABSENSI FISIK</div>
          <h1 className="text-xl font-black uppercase mt-1">PERNIKAHAN {getWeddingNames()}</h1>
          <div className="flex justify-between items-center text-[10px] mt-3 text-slate-700 font-mono">
            <span>Metode Ekspor: Undangankita Digital Planner (undangankita.rfx.web.id)</span>
            <span>Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 text-xs bg-slate-50 border border-slate-200 p-3 rounded-lg font-mono">
          <div>
            <span className="text-slate-500 block">Kriteria/Grup Data:</span>
            <span className="font-bold text-black uppercase">{exportScope === 'all' ? 'Semua Tamu' : `Filter Grup (${selectedGroup})`}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Total Baris:</span>
            <span className="font-bold text-black">{(exportScope === 'all' ? guests : filteredGuests).length} Tamu Terdata</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block">Kapasitas Maksimal:</span>
            <span className="font-bold text-black">{(exportScope === 'all' ? guests : filteredGuests).reduce((acc, g) => acc + g.paxLimit, 0)} Pax</span>
          </div>
        </div>

        <table className="w-full border-collapse border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-105 font-bold">
              <th className="border border-slate-350 px-2 py-1.5 text-center w-8">No</th>
              <th className="border border-slate-350 px-2 py-1.5 text-left">Nama Lengkap Tamu</th>
              <th className="border border-slate-350 px-2 py-1.5 text-center w-24">Grup/Kategori</th>
              {includePhoneColumn && <th className="border border-slate-350 px-2 py-1.5 text-center w-28">No. WhatsApp</th>}
              <th className="border border-slate-350 px-2 py-1.5 text-center w-12">Porsi</th>
              <th className="border border-slate-350 px-2 py-1.5 text-center w-16">Kode</th>
              {includeStatusColumn && <th className="border border-slate-350 px-2 py-1.5 text-center w-16">Status</th>}
              {includeSignatureColumn && <th className="border border-slate-350 px-2 py-1.5 text-left w-40 font-bold">Tanda Tangan / Kehadiran</th>}
            </tr>
          </thead>
          <tbody>
            {(exportScope === 'all' ? guests : filteredGuests).map((guest, idx) => (
              <tr key={guest.id} className="hover:bg-slate-50">
                <td className="border border-slate-300 px-2 py-1.5 text-center font-mono">{idx + 1}</td>
                <td className="border border-slate-300 px-2 py-1.5 font-bold text-slate-1000 text-left">{guest.name}</td>
                <td className="border border-slate-300 px-2 py-1.5 text-center text-slate-700 font-semibold">{guest.group}</td>
                {includePhoneColumn && <td className="border border-slate-300 px-2 py-1.5 text-center font-mono text-slate-600">{guest.phoneNumber}</td>}
                <td className="border border-slate-300 px-2 py-1.5 text-center font-bold text-slate-800">{guest.paxLimit} Pax</td>
                <td className="border border-slate-300 px-2 py-1.5 text-center font-mono text-slate-500">{guest.invitationCode}</td>
                {includeStatusColumn && (
                  <td className="border border-slate-300 px-2 py-1.5 text-center">
                    <span>
                      {guest.status === 'Opened' ? 'Hadir ✔' : guest.status === 'Sent' ? 'Terkirim' : 'Draf'}
                    </span>
                  </td>
                )}
                {includeSignatureColumn && (
                  <td className="border border-slate-350 px-1 py-1">
                    {renderSignatureCell(idx)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Notes */}
        <div className="mt-8 border-t border-slate-200 pt-4 flex justify-between items-start text-[9px] text-slate-500 font-mono leading-relaxed">
          <div className="max-w-md text-left">
            <strong>Keterangan Lembar Absensi Fisik:</strong>
            <p className="mt-0.5">Setiap tamu wajib membubuhkan tanda tangan sesuai dengan nomor urut. Bagi tamu yang membawa undangan digital, harap tunjukkan QR Code untuk sinkronisasi check-in digital.</p>
          </div>
          <div className="text-right flex flex-col items-end gap-12 mt-1 pr-4">
            <span className="block border-b border-dashed border-slate-400 pb-1 text-right">Saksi Penerima Meja Registrasi</span>
            <span className="text-right">( ___________________________ )</span>
          </div>
        </div>
      </div>
    </div>
  );
}
