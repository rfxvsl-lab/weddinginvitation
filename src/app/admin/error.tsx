'use client';

import { useEffect } from 'react';
import { ErrorState } from '../../components/states/PageStates';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <ErrorState
      title="Panel admin gagal dimuat"
      message="Coba muat ulang halaman ini."
      onRetry={reset}
      digest={error.digest}
    />
  );
}
