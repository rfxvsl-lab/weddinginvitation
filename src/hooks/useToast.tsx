'use client';

/**
 * Toast Notification System
 * Menggantikan alert() di seluruh aplikasi dengan toast yang lebih elegan.
 */

import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
  };
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ICONS: Record<ToastType, string> = {
  success: 'âœ“',
  error: 'âœ•',
  warning: 'âš ',
  info: 'â„¹',
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
  success: {
    bg: 'var(--color-success-light)',
    border: 'var(--color-success)',
    icon: 'var(--color-success)',
    text: '#1a6640',
  },
  error: {
    bg: 'var(--color-danger-light)',
    border: 'var(--color-danger)',
    icon: 'var(--color-danger)',
    text: '#7a1f1a',
  },
  warning: {
    bg: 'var(--color-warning-light)',
    border: 'var(--color-warning)',
    icon: 'var(--color-warning)',
    text: '#7a4a1a',
  },
  info: {
    bg: 'var(--color-info-light)',
    border: 'var(--color-info)',
    icon: 'var(--color-info)',
    text: '#1a3a6a',
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  }, [toast.id, onDismiss]);

  useEffect(() => {
    const duration = toast.duration ?? 4000;
    timerRef.current = setTimeout(handleDismiss, duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.duration, handleDismiss]);

  const colors = COLORS[toast.type];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        borderRadius: '14px',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        boxShadow: '0 8px 24px rgba(45,42,38,0.12), 0 2px 6px rgba(45,42,38,0.06)',
        maxWidth: '360px',
        width: '100%',
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'translateX(20px)' : 'translateX(0)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
      }}
      onClick={handleDismiss}
      role="alert"
    >
      {/* Icon */}
      <div style={{
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        background: colors.border,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 700,
        flexShrink: 0,
        marginTop: '1px',
      }}>
        {ICONS[toast.type]}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: '13px',
          fontWeight: 600,
          color: colors.text,
          lineHeight: 1.4,
        }}>
          {toast.title}
        </p>
        {toast.message && (
          <p style={{
            margin: '3px 0 0 0',
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            color: colors.text,
            opacity: 0.75,
            lineHeight: 1.4,
          }}>
            {toast.message}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: colors.text,
          opacity: 0.5,
          fontSize: '16px',
          lineHeight: 1,
          padding: '0 2px',
          flexShrink: 0,
        }}
        aria-label="Tutup notifikasi"
      >
        Ã—
      </button>

      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '3px',
        borderRadius: '0 0 14px 14px',
        background: colors.border,
        opacity: 0.35,
        transformOrigin: 'left',
        animation: `toast-progress ${toast.duration ?? 4000}ms linear forwards`,
      }} />
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (title: string, message?: string) => addToast('success', title, message),
    error: (title: string, message?: string) => addToast('error', title, message),
    warning: (title: string, message?: string) => addToast('warning', title, message),
    info: (title: string, message?: string) => addToast('info', title, message),
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}

      {/* Toast Container */}
      <div
        aria-live="polite"
        aria-label="Notifikasi"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'flex-end',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto', animation: 'toast-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(20px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toast-progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
}

/**
 * Singleton toast untuk digunakan di luar React tree (hooks/utils)
 * Usage: import { toastSingleton } from './useToast'; toastSingleton.error('...')
 */
let _toastRef: ToastContextType['toast'] | null = null;
export function _registerToastRef(ref: ToastContextType['toast']) {
  _toastRef = ref;
}
export const toastSingleton = {
  success: (title: string, msg?: string) => _toastRef?.success(title, msg),
  error: (title: string, msg?: string) => _toastRef?.error(title, msg),
  warning: (title: string, msg?: string) => _toastRef?.warning(title, msg),
  info: (title: string, msg?: string) => _toastRef?.info(title, msg),
};
