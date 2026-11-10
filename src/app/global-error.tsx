'use client';

/** Dipakai jika layout root sendiri gagal; harus merender <html> dan <body> sendiri. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#F6F1EA', color: '#2B2018' }}>
        <div role="alert" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div style={{ maxWidth: 420 }}>
            <h1 style={{ fontSize: 22 }}>Terjadi kesalahan</h1>
            <p style={{ fontSize: 14, color: '#6B5B4A', lineHeight: 1.6 }}>Halaman gagal dimuat. Coba lagi sebentar lagi.</p>
            <button
              type="button"
              onClick={reset}
              style={{ minHeight: 44, padding: '0 24px', borderRadius: 12, border: 0, background: '#8E2F45', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >
              Coba lagi
            </button>
            {error.digest && <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#6B5B4A' }}>Kode: {error.digest}</p>}
          </div>
        </div>
      </body>
    </html>
  );
}
