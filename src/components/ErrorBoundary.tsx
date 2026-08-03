'use client';

/**
 * ErrorBoundary â€” Menangkap crash komponen React agar tidak merusak seluruh halaman.
 * 
 * Cara pakai:
 * <ErrorBoundary fallback={<p>Terjadi error</p>}>
 *   <KomponenBesar />
 * </ErrorBoundary>
 * 
 * Atau dengan fallback default (auto):
 * <ErrorBoundary name="EditorPanel">
 *   <EditorPanel />
 * </ErrorBoundary>
 */

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Nama komponen â€” ditampilkan di pesan error default */
  name?: string;
  /** Custom fallback UI, jika tidak disediakan akan menampilkan fallback default */
  fallback?: React.ReactNode;
  /** Callback saat error tertangkap (untuk logging ke Sentry dll) */
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.name ? ` in ${this.props.name}` : ''}]`, error, info);
    this.props.onError?.(error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    // Default fallback UI â€” menggunakan design system yang ada
    return (
      <div
        role="alert"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          textAlign: 'center',
          gap: '16px',
          background: 'var(--color-danger-light)',
          border: '1px solid var(--color-danger)',
          borderRadius: '24px',
          maxWidth: '480px',
          margin: '24px auto',
        }}
      >
        {/* Icon */}
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'var(--color-danger)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '24px',
        }}>
          âš 
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: '14px', fontWeight: 700,
            color: 'var(--text-primary)', margin: 0,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {this.props.name ? `Komponen "${this.props.name}" mengalami error` : 'Terjadi kesalahan tak terduga'}
          </h3>
          <p style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: '12px', color: 'var(--text-secondary)', margin: 0,
          }}>
            {this.state.error?.message || 'Komponen gagal dirender. Coba muat ulang halaman.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={this.handleReset}
            style={{
              padding: '10px 20px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
              background: 'var(--color-primary)', color: 'white',
              border: 'none', cursor: 'pointer', fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            Coba Lagi
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
              background: 'transparent', color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)', cursor: 'pointer',
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            Muat Ulang Halaman
          </button>
        </div>
      </div>
    );
  }
}

/**
 * withErrorBoundary â€” HOC untuk membungkus komponen dengan ErrorBoundary
 * 
 * Usage:
 * const SafeEditorPanel = withErrorBoundary(EditorPanel, { name: 'EditorPanel' });
 */
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  options: Omit<ErrorBoundaryProps, 'children'> = {}
) {
  const displayName = options.name || Component.displayName || Component.name || 'Component';

  function SafeComponent(props: T) {
    return (
      <ErrorBoundary {...options} name={displayName}>
        <Component {...props} />
      </ErrorBoundary>
    );
  }

  SafeComponent.displayName = `withErrorBoundary(${displayName})`;
  return SafeComponent;
}
