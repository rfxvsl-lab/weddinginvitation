'use client';

/**
 * AlertModal — Premium center-screen notification modal
 * Menggantikan semua alert() bawaan browser di dashboard.
 * 
 * Cara pakai:
 *   import { useAlertModal } from '../hooks/useAlertModal';
 *   const alert = useAlertModal();
 *   alert.warning('Batas Tercapai', 'Galeri sudah penuh.');
 *   alert.success('Berhasil', 'Undangan telah dipublish.');
 *   alert.error('Gagal', 'Terjadi kesalahan.');
 *   alert.info('Info', 'Keterangan tambahan.');
 */

import React, { useState, useCallback, createContext, useContext, useRef, useEffect } from 'react';
import {
  PiCheckCircleDuotone as CheckCircle,
  PiWarningCircleDuotone as WarningCircle,
  PiXCircleDuotone as XCircle,
  PiInfoDuotone as Info,
  PiLockKeyDuotone as Lock,
  PiArrowUpDuotone as ArrowUp,
} from 'react-icons/pi';

type AlertType = 'success' | 'error' | 'warning' | 'info' | 'upgrade';

interface AlertData {
  type: AlertType;
  title: string;
  message?: string;
  buttonText?: string;
  onAction?: () => void;
}

interface AlertModalContextType {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  upgrade: (title: string, message?: string) => void;
}

const AlertModalContext = createContext<AlertModalContextType | undefined>(undefined);

const THEME: Record<AlertType, { icon: React.ReactNode; iconBg: string; buttonBg: string }> = {
  success: {
    icon: <CheckCircle className="w-7 h-7 text-white" />,
    iconBg: 'bg-emerald-700',
    buttonBg: 'bg-emerald-700 hover:bg-emerald-800',
  },
  error: {
    icon: <XCircle className="w-7 h-7 text-white" />,
    iconBg: 'bg-red-700',
    buttonBg: 'bg-red-700 hover:bg-red-800',
  },
  warning: {
    icon: <WarningCircle className="w-7 h-7 text-white" />,
    iconBg: 'bg-amber-700',
    buttonBg: 'bg-amber-700 hover:bg-amber-800',
  },
  info: {
    icon: <Info className="w-7 h-7 text-white" />,
    iconBg: 'bg-blue-700',
    buttonBg: 'bg-blue-700 hover:bg-blue-800',
  },
  upgrade: {
    icon: <Lock className="w-7 h-7 text-white" />,
    iconBg: 'bg-amber-700',
    buttonBg: 'bg-amber-700 hover:bg-amber-800',
  },
};

function AlertModalOverlay({ alert, onClose }: { alert: AlertData; onClose: () => void }) {
  const theme = THEME[alert.type];
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className="saas-scope rh-product rh-alert fixed inset-0 z-[99999] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      style={{ animation: 'alertFadeIn 0.2s ease-out' }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="rh-alert-title"
        aria-describedby={alert.message ? 'rh-alert-message' : undefined}
        className="relative bg-white rounded-xl border border-[var(--rh-line)] w-full max-w-sm overflow-hidden"
        style={{ animation: 'alertScaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Content */}
        <div className="px-7 pt-7 pb-6 text-left space-y-4">
          {/* Icon circle */}
          <div className={`w-9 h-9 rounded-lg ${theme.iconBg} flex items-center justify-center`}
          >
            {theme.icon}
          </div>

          {/* Text */}
          <div className="space-y-1.5">
            <h3 id="rh-alert-title" className="text-lg font-semibold text-[var(--rh-ink)] tracking-tight">
              {alert.title}
            </h3>
            {alert.message && (
              <p id="rh-alert-message" className="text-sm text-[var(--rh-ink-2)] leading-relaxed">
                {alert.message}
              </p>
            )}
          </div>

          {/* Action button */}
          <div className="flex gap-3 pt-2">
            {alert.type === 'upgrade' ? (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Nanti Saja
                </button>
                <button
                  onClick={() => { alert.onAction?.(); onClose(); }}
                  className={`flex-[1.5] py-3 ${theme.buttonBg} text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5`}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  Upgrade Sekarang
                </button>
              </>
            ) : (
              <button
                onClick={() => { alert.onAction?.(); onClose(); }}
                autoFocus
                className={`w-full py-3 ${theme.buttonBg} text-white text-xs font-bold rounded-lg transition-all cursor-pointer`}
              >
                {alert.buttonText || 'Mengerti'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AlertModalProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<AlertData[]>([]);

  const show = useCallback((type: AlertType, title: string, message?: string, buttonText?: string, onAction?: () => void) => {
    setQueue(prev => [...prev, { type, title, message, buttonText, onAction }]);
  }, []);

  const dismiss = useCallback(() => {
    setQueue(prev => prev.slice(1));
  }, []);

  const ctx: AlertModalContextType = {
    success: (title, message) => show('success', title, message),
    error: (title, message) => show('error', title, message),
    warning: (title, message) => show('warning', title, message),
    info: (title, message) => show('info', title, message),
    upgrade: (title, message) => show('upgrade', title, message),
  };

  // Register singleton
  _registerAlertRef(ctx);

  return (
    <AlertModalContext.Provider value={ctx}>
      {children}
      {queue.length > 0 && (
        <AlertModalOverlay alert={queue[0]} onClose={dismiss} />
      )}

      <style>{`
        @keyframes alertFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes alertScaleIn {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </AlertModalContext.Provider>
  );
}

export function useAlertModal() {
  const ctx = useContext(AlertModalContext);
  if (!ctx) throw new Error('useAlertModal must be used within AlertModalProvider');
  return ctx;
}

/**
 * Singleton alert modal untuk digunakan di luar React tree
 * Usage: import { alertModal } from './useAlertModal'; alertModal.warning('Title', 'msg');
 */
let _alertRef: AlertModalContextType | null = null;
function _registerAlertRef(ref: AlertModalContextType) {
  _alertRef = ref;
}
export const alertModal = {
  success: (title: string, msg?: string) => _alertRef?.success(title, msg),
  error: (title: string, msg?: string) => _alertRef?.error(title, msg),
  warning: (title: string, msg?: string) => _alertRef?.warning(title, msg),
  info: (title: string, msg?: string) => _alertRef?.info(title, msg),
  upgrade: (title: string, msg?: string) => _alertRef?.upgrade(title, msg),
};
