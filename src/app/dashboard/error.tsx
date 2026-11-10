'use client';

import { useEffect } from 'react';
import { ErrorState } from '../../components/states/PageStates';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <ErrorState
      title="Dashboard gagal dimuat"
      message="Perubahan yang sudah tersimpan aman. Coba muat ulang; jika masih gagal, hubungi kami lewat chat."
      onRetry={reset}
      digest={error.digest}
    />
  );
}
