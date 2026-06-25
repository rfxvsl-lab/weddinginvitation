import React, { useState, useEffect } from 'react';
import { Copy, Check, MessageSquare, AlertCircle, ChevronRight, CheckCircle, ExternalLink, Send, Globe } from 'lucide-react';
import { Logo } from './ui/Logo';
import { SaaSUser } from '../types';
import { DEFAULT_THEMES } from '../data/defaultData';
import { canAccess } from '../lib/packageLimits';
import UpgradePrompt from './UpgradePrompt';
import { useAlertModal } from '../hooks/useAlertModal';

interface PublishModalProps {
  show: boolean;
  onClose: () => void;
  user: SaaSUser | null;
  wedding: any;
}

export default function PublishModal({ show, onClose, user, wedding }: PublishModalProps) {
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [customShareMessage, setCustomShareMessage] = useState('');
  const [shareMessageCopied, setShareMessageCopied] = useState(false);
  const [selectedShareGuestId, setSelectedShareGuestId] = useState('');
  const [selectedShareTemplateId, setSelectedShareTemplateId] = useState('formal');
  const [isPublishing, setIsPublishing] = useState(false);
  const [linkCopiedInPublishModal, setLinkCopiedInPublishModal] = useState(false);
  const alertModal = useAlertModal();

  const guests = wedding.guests || [];
  const activeSaaSUser = user;

  // Generate message
  const generateFormattedMessage = (guestId: string, templateId: string) => {
    const guest = guests.find((g: any) => g.id === guestId);
    if (!guest) return '';
    const url = `https://ruanghadir.net/${user?.activeSlug || 'demo'}?to=${encodeURIComponent(guest.name)}&code=${guest.invitationCode}`;
    
    if (templateId === 'formal') {
      return `Kepada Yth. Bapak/Ibu/Saudara/i ${guest.name},\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada acara pernikahan kami.\n\nDetail acara dan undangan lengkap dapat dilihat melalui tautan berikut:\n${url}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.\n\nTerima kasih.\n\nHormat kami,\n${wedding.weddingData.couple.bride.nickname} & ${wedding.weddingData.couple.groom.nickname}`;
    } else if (templateId === 'casual') {
      return `Halo ${guest.name}! 👋\n\nKami sangat berbahagia mengundang kamu untuk hadir di momen spesial pernikahan kami!\n\nBuka tautan ini untuk melihat detail acara dan undangan digitalnya:\n${url}\n\nKehadiranmu akan sangat berarti bagi kami. Sampai jumpa di hari bahagia kami! ✨\n\nSalam hangat,\n${wedding.weddingData.couple.bride.nickname} & ${wedding.weddingData.couple.groom.nickname}`;
    } else {
      return `Undangan Pernikahan ${wedding.weddingData.couple.bride.nickname} & ${wedding.weddingData.couple.groom.nickname} untuk ${guest.name}\n\nBuka tautan undangan digital:\n${url}`;
    }
  };

  useEffect(() => {
    if (selectedShareGuestId) {
      const msg = generateFormattedMessage(selectedShareGuestId, selectedShareTemplateId);
      setCustomShareMessage(msg);
    }
  }, [selectedShareGuestId, selectedShareTemplateId, guests, wedding.weddingData]);

  useEffect(() => {
    if (guests.length > 0 && !selectedShareGuestId) {
      setSelectedShareGuestId(guests[0].id);
    }
  }, [guests]);

  if (!show || !activeSaaSUser) return null;

  const packageId = activeSaaSUser.packageId || 'demo';
  const publishAllowed = canAccess(packageId, 'canPublish');
  const themeName = DEFAULT_THEMES.find(t => t.id === wedding.themeId)?.name || 'Grand Ballroom';
  const siteUrl = `ruanghadir.net/${activeSaaSUser.activeSlug || 'demo'}`;

  // If publish not allowed (demo), show upgrade prompt
  if (!publishAllowed) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center p-4 z-[300] animate-fadeIn">
        <div className="bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-3xl w-full max-w-md space-y-5 shadow-2xl relative border border-white/50">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-800 text-sm transition-all cursor-pointer"
          >
            ✕
          </button>
          <div className="text-center space-y-3 pt-2">
            <Logo isLink={false} className="justify-center" />
            <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Publish Tidak Tersedia</h3>
            <p className="text-sm text-zinc-500">Paket Demo hanya untuk preview. Upgrade untuk mempublikasikan undangan Anda.</p>
          </div>
          <UpgradePrompt packageId={packageId} featureName="Publish Undangan" variant="banner" />
          <button
            onClick={onClose}
            className="w-full bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-xl py-3 text-xs font-bold cursor-pointer transition-all"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center p-4 z-[300] animate-fadeIn overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-3xl w-full max-w-4xl space-y-6 shadow-2xl relative my-8 border border-white/50">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setLinkCopiedInPublishModal(false);
            onClose();
          }}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-800 text-sm transition-all cursor-pointer"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center space-y-3 pt-2">
          <Logo isLink={false} className="justify-center" />
          <div>
            <h3 className="text-xl font-bold text-zinc-900 tracking-tight">
              Publish & Bagikan Undangan
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              Rilis template <span className="font-semibold text-rose-600">{themeName}</span> dan kirim pesan personal ke tamu.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Account Info Card */}
            <div className="bg-gradient-to-br from-zinc-50 to-zinc-100/50 border border-zinc-200/60 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-700">Rincian Akun</h4>
                <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-[10px] font-bold text-white shadow-sm">
                  Aktif
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-500">Nama Pengguna</span>
                  <span className="font-semibold text-zinc-800">{activeSaaSUser.fullName}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-100">
                  <span className="text-zinc-500">Platform Tautan</span>
                  <span className="font-semibold text-rose-600 text-[11px]">{siteUrl}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-zinc-500">Paket</span>
                  <span className="px-2.5 py-1 bg-white border border-zinc-200 rounded-lg text-[10px] font-bold text-zinc-700 shadow-sm">
                    {activeSaaSUser.packageId?.toUpperCase() || 'PREMIUM'} — {activeSaaSUser.isCustomByRfx ? 'Full RFX' : 'Mandiri'}
                  </span>
                </div>
              </div>
            </div>

            {/* Copy Link */}
            {!publishSuccess && (
              <div className="bg-gradient-to-br from-rose-50 to-pink-50/50 border border-rose-100 p-5 rounded-2xl space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-700">Salin Tautan Terlebih Dahulu</h4>
                    <p className="text-[11px] text-zinc-600 leading-relaxed mt-0.5">
                      Salin tautan undangan resmi di bawah ini sebelum bisa menekan tombol Publish.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 items-center bg-white p-2.5 rounded-xl border border-rose-100/50 shadow-sm">
                  <div className="flex-1 flex items-center gap-2 px-2">
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="text-[11px] text-zinc-600 break-all select-all">{siteUrl}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(siteUrl);
                      setLinkCopiedInPublishModal(true);
                    }}
                    className={`px-4 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all duration-300 shrink-0 ${
                      linkCopiedInPublishModal
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md shadow-rose-500/20'
                    }`}
                  >
                    {linkCopiedInPublishModal ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {publishSuccess && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200 p-5 rounded-2xl text-center space-y-2 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-sm font-bold text-emerald-700">
                  {wedding.invitation?.isPublished ? 'Undangan Berhasil Diperbarui!' : 'Berhasil Dipublikasikan!'}
                </h4>
                <p className="text-[11px] text-zinc-600">
                  Undangan digital Anda telah aktif dan bisa diakses melalui tautan di atas.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  setLinkCopiedInPublishModal(false);
                  onClose();
                }}
                className="flex-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-800 border border-zinc-200 rounded-xl py-3 text-xs font-bold cursor-pointer transition-all"
              >
                Kembali
              </button>

              {!publishSuccess && (
                <button
                  onClick={async () => {
                    if (!linkCopiedInPublishModal && !wedding.invitation?.isPublished) {
                      alertModal.warning('Salin Tautan', 'Harap salin tautan rilis Anda terlebih dahulu!');
                      return;
                    }
                    setIsPublishing(true);
                    try {
                      await wedding.publishInvitation();
                      setPublishSuccess(true);
                    } catch (err) {
                      console.error('Publish failed:', err);
                      alertModal.error('Gagal Publish', 'Gagal mempublikasikan undangan. Silakan coba lagi.');
                    } finally {
                      setIsPublishing(false);
                    }
                  }}
                  disabled={isPublishing || (!linkCopiedInPublishModal && !wedding.invitation?.isPublished)}
                  className={`flex-1 rounded-xl py-3 text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                    isPublishing || (!linkCopiedInPublishModal && !wedding.invitation?.isPublished)
                      ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-500/20'
                  }`}
                >
                  {isPublishing ? (
                    <span>Memproses...</span>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      <span>{wedding.invitation?.isPublished ? 'Update Undangan' : 'Publish Sekarang'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: WhatsApp Share */}
          <div className="bg-gradient-to-br from-zinc-50 to-white border border-zinc-200/60 p-5 rounded-2xl space-y-4 flex flex-col justify-between h-full">
            <div className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-800">WhatsApp Share</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Kirim pesan personal & tautan ke tamu via WhatsApp.
                  </p>
                </div>
              </div>

              {/* Guest Selector */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-zinc-500 font-semibold">Pilih Penerima</label>
                {guests && guests.length > 0 ? (
                  <select
                    value={selectedShareGuestId}
                    onChange={(e) => setSelectedShareGuestId(e.target.value)}
                    className="w-full bg-white text-zinc-800 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 cursor-pointer transition-all"
                  >
                    {guests.map((g: any) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.group}) — {g.phoneNumber}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-xl">
                    Belum ada tamu. Tambahkan nama tamu di tab <span className="font-bold">"Daftar Tamu"</span> terlebih dahulu.
                  </div>
                )}
              </div>

              {/* Template Selector */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-zinc-500 font-semibold">Gaya Bahasa</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'formal', label: 'Formal', color: 'rose' },
                    { id: 'casual', label: 'Kasual', color: 'violet' },
                    { id: 'short', label: 'Ringkas', color: 'sky' },
                  ] as const).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedShareTemplateId(t.id)}
                      className={`py-2 text-[11px] rounded-xl font-bold transition-all duration-200 border cursor-pointer ${
                        selectedShareTemplateId === t.id
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-rose-500 shadow-md shadow-rose-500/10'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Editor */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-zinc-500 font-semibold">Pesan Undangan</label>
                <textarea
                  value={customShareMessage}
                  onChange={(e) => setCustomShareMessage(e.target.value)}
                  rows={5}
                  placeholder="Draf pesan teks undangan otomatis..."
                  className="w-full bg-white text-zinc-800 text-[11px] border border-zinc-200 p-3 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 leading-relaxed resize-none transition-all"
                />
              </div>
            </div>

            {/* Share Action Buttons */}
            {selectedShareGuestId && (
              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(customShareMessage);
                    setShareMessageCopied(true);
                    wedding.updateGuestStatus(selectedShareGuestId, 'Sent');
                    setTimeout(() => setShareMessageCopied(false), 2000);
                  }}
                  className="py-2.5 px-3 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer text-zinc-600 transition-all"
                >
                  {shareMessageCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Pesan</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const guest = guests.find((g: any) => g.id === selectedShareGuestId);
                    if (!guest) return;
                    const waUrl = `https://api.whatsapp.com/send?phone=${guest.phoneNumber}&text=${encodeURIComponent(customShareMessage)}`;
                    wedding.updateGuestStatus(guest.id, 'Opened');
                    window.open(waUrl, '_blank');
                  }}
                  className="py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim WA</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
