'use client';

import { useEffect } from 'react';
import { ErrorState } from '../../components/states/PageStates';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <ErrorState
      tone="invitation"
      title="Undangan gagal dimuat"
      message="Periksa koneksi internet Anda, lalu coba lagi. Jika masih gagal, hubungi pengirim undangan."
      onRetry={reset}
      digest={error.digest}
    />
  );
}
