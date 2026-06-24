/**
 * LiveChat.tsx — WhatsApp-Style Live Chat Widget
 * Floating chat bubble + full chat panel for client-admin communication
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PiChatCircleDuotone as MessageCircle,
  PiXCircleDuotone as XCircle,
  PiPaperPlaneRightDuotone as Send,
  PiChecksDuotone as CheckCheck,
  PiCheckDuotone as Check,
  PiCameraDuotone as Camera,
  PiSpinnerGapDuotone as Spinner,
} from 'react-icons/pi';
import type { SaaSUser } from '../types';
import * as api from '../lib/api';
import { uploadToCloudinary } from '../lib/cloudinary';

interface LiveChatProps {
  currentUser: SaaSUser;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
    '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#a855f7',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) return 'Hari Ini';
    if (d.toDateString() === yesterday.toDateString()) return 'Kemarin';
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function LiveChat({ currentUser }: LiveChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<api.ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminAvatar, setAdminAvatar] = useState('');
  const [clientAvatar, setClientAvatar] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const conversationId = currentUser.id; // Each user has one conversation
  const isAdmin = currentUser.email === 'mhmmadridho64@gmail.com';

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const msgs = await api.getChatMessages(conversationId);
      setMessages(msgs);
      
      // Get unread count
      const count = await api.getUnreadCount(conversationId, 'client');
      setUnreadCount(count);
      
      // If chat is open, mark admin messages as read
      if (isOpen && count > 0) {
        await api.markMessagesAsRead(conversationId, 'client');
        setUnreadCount(0);
      }
    } catch (err) {
      console.log('Chat load error:', err);
    }
  }, [conversationId, isOpen]);

  // Load admin avatar and client avatar
  useEffect(() => {
    api.getAdminUser().then(admin => {
      if (admin?.avatarUrl) {
        setAdminAvatar(admin.avatarUrl);
      }
    }).catch(() => {});

    if (!isAdmin) {
      api.getInvitationsByUserId(currentUser.id).then(invs => {
        if (invs && invs.length > 0) {
          try {
            const wd = invs[0].weddingData;
            if (wd.couple?.groom?.photoUrl) setClientAvatar(wd.couple.groom.photoUrl);
            else if (wd.couple?.bride?.photoUrl) setClientAvatar(wd.couple.bride.photoUrl);
          } catch(e) {}
        }
      }).catch(() => {});
    }
  }, [currentUser.id, isAdmin]);

  // Polling
  useEffect(() => {
    loadMessages();
    pollingRef.current = setInterval(loadMessages, 5000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [loadMessages]);

  // Scroll to bottom when messages change or chat opens
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, scrollToBottom]);

  // When chat opens, mark as read and focus input
  useEffect(() => {
    if (isOpen) {
      api.markMessagesAsRead(conversationId, 'client').then(() => setUnreadCount(0)).catch(() => {});
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, conversationId]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInputText('');

    try {
      const newMsg = await api.sendChatMessage(
        conversationId,
        currentUser.id,
        currentUser.fullName,
        clientAvatar, // Set from fetched state or empty
        'client',
        text
      );
      setMessages(prev => [...prev, newMsg]);
      scrollToBottom();
    } catch (err) {
      console.error('Send error:', err);
      setInputText(text); // Restore on failure
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleAdminAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isAdmin) return;

    try {
      setIsUploadingPhoto(true);
      const uploadResult = await uploadToCloudinary(file);
      const url = uploadResult.secureUrl;
      await api.updateUserAvatar(currentUser.id, url);
      setAdminAvatar(url);
    } catch (err) {
      console.error('Failed to upload admin photo', err);
      alert('Gagal mengupload foto profil.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date
  const groupedMessages: { date: string; msgs: api.ChatMessage[] }[] = [];
  messages.forEach(msg => {
    const dateKey = formatDate(msg.createdAt);
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateKey) {
      lastGroup.msgs.push(msg);
    } else {
      groupedMessages.push({ date: dateKey, msgs: [msg] });
    }
  });

  return (
    <>
      {/* FLOATING CHAT BUBBLE */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-[200] p-4 bg-emerald-600 hover:bg-emerald-500 text-[var(--text-primary)] rounded-full shadow-[0_4px_25px_rgba(16,185,129,0.5)] transition-all duration-300 hover:scale-110 cursor-pointer group"
          title="Live Chat dengan UndanganKita.visual Support"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--color-primary)] text-[var(--text-primary)] text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-lg">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          {/* Ripple effect */}
          <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping pointer-events-none" />
        </button>
      )}

      {/* CHAT PANEL */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-[200] w-[380px] max-w-[calc(100vw-48px)] h-[560px] max-h-[calc(100vh-100px)] bg-[#0b141a] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] border border-[var(--border-light)]/60 flex flex-col overflow-hidden animate-fadeIn">
          
          {/* HEADER — WhatsApp Style */}
          <div className="bg-[#005c4b] px-4 py-3 flex items-center gap-3 border-b border-[var(--border-light)]/50 select-none rounded-t-2xl">
            {/* Admin Avatar */}
            <div className="relative group/avatar">
              {adminAvatar ? (
                <img src={adminAvatar} alt="Admin" className="w-10 h-10 rounded-full object-cover border-2 border-emerald-600/40" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-[var(--text-primary)] text-sm font-black border-2 border-emerald-500/30">
                  RF
                </div>
              )}
              {isAdmin && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                  title="Ganti Foto Profil"
                >
                  {isUploadingPhoto ? <Spinner className="w-4 h-4 text-[var(--text-primary)] animate-spin" /> : <Camera className="w-4 h-4 text-[var(--text-primary)]" />}
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAdminAvatarUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] rounded-full border-2 border-[#005c4b]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-semibold text-[var(--text-primary)] truncate">UndanganKita.visual Support</h3>
              <p className="text-[11px] text-[var(--text-primary)]/80 font-normal">Online</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-[var(--text-primary)]/70 hover:text-[var(--text-primary)] transition cursor-pointer rounded-lg hover:bg-white/10"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* CHAT BODY */}
          <div
            className="flex-1 overflow-y-auto px-3 py-3 space-y-1"
            style={{
              backgroundImage: `url("https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-cool-dark-green-new-theme-whatsapp.jpg")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#0b141a',
            }}
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-10">
                <div className="w-16 h-16 rounded-full bg-emerald-900/30 border border-emerald-800/30 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-emerald-500/60" />
                </div>
                <div>
                  <p className="text-[12px] text-[var(--text-muted)] font-medium">Belum ada pesan</p>
                  <p className="text-[10px] text-zinc-600 mt-1">Ketik pesan untuk memulai percakapan dengan admin UndanganKita.visual</p>
                </div>
              </div>
            )}

            {groupedMessages.map((group, gi) => (
              <div key={gi}>
                {/* Date separator */}
                {group.date && (
                  <div className="flex justify-center my-3">
                    <span className="bg-[#182229] text-[var(--text-primary)]/70 text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-sm">
                      {group.date}
                    </span>
                  </div>
                )}

                {group.msgs.map((msg) => {
                  const isClient = msg.senderRole === 'client';
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-1.5 mb-1 ${isClient ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Admin avatar on left */}
                      {!isClient && (
                        <div className="flex-shrink-0 mb-1">
                          {adminAvatar ? (
                            <img src={adminAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-emerald-700 flex items-center justify-center text-[var(--text-primary)] text-[8px] font-black">
                              RF
                            </div>
                          )}
                        </div>
                      )}

                      {/* Message bubble */}
                      <div
                        className={`max-w-[75%] px-2.5 py-1.5 rounded-lg relative shadow-sm ${
                          isClient
                            ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                            : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                        }`}
                      >
                        {/* Sender name (only for admin in group) */}
                        {!isClient && (
                          <p className="text-[11px] font-semibold text-[#53bdeb] mb-0.5">{msg.senderName || 'UndanganKita.visual Support'}</p>
                        )}
                        <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                        <div className={`flex items-center gap-1 mt-0.5 -mb-0.5 justify-end`}>
                          <span className="text-[10px] text-[var(--text-primary)]/50">{formatTime(msg.createdAt)}</span>
                          {isClient && (
                            msg.isRead
                              ? <CheckCheck className="w-[14px] h-[14px] text-[#53bdeb]" />
                              : <Check className="w-[14px] h-[14px] text-[var(--text-primary)]/50" />
                          )}
                        </div>
                      </div>

                      {/* Client avatar on right */}
                      {isClient && (
                        <div className="flex-shrink-0 mb-1">
                          {clientAvatar ? (
                            <img src={clientAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--text-primary)] text-[9px] font-bold"
                              style={{ backgroundColor: getAvatarColor(currentUser.fullName) }}
                            >
                              {getInitials(currentUser.fullName)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT BAR */}
          <div className="bg-[#202c33] px-3 py-2 flex items-center gap-2 select-none">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              className="flex-1 bg-[#2a3942] text-[#d1d7db] text-[14px] px-4 py-2.5 rounded-lg border-none outline-none placeholder:text-[#8696a0]"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isSending}
              className="p-3 bg-[#00a884] hover:bg-[#00a884]/90 disabled:opacity-50 disabled:hover:bg-[#00a884] text-[var(--text-primary)] rounded-full transition cursor-pointer flex-shrink-0 flex items-center justify-center"
            >
              <Send className="w-5 h-5 -ml-0.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
