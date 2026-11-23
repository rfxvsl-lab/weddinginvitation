'use client';

import { useEffect } from 'react';

/**
 * Kunci zoom di seluruh aplikasi: pinch, ctrl+scroll/trackpad, ctrl +/-.
 * - Viewport `user-scalable=no` + CSS `touch-action: pan-x pan-y` (juga mematikan double-tap zoom)
 * - iOS Safari mengabaikan `user-scalable=no`, jadi gesture pinch dicegah lewat JS.
 * Dipakai juga di dalam iframe pratinjau undangan. Mengembalikan fungsi pelepas.
 */
export function lockZoom(doc: Document, win: Window): () => void {
  const stop = (e: Event) => e.preventDefault();

  // iOS Safari: event gesture khusus pinch
  const gestureOpts: AddEventListenerOptions = { passive: false };
  doc.addEventListener('gesturestart', stop, gestureOpts);
  doc.addEventListener('gesturechange', stop, gestureOpts);
  doc.addEventListener('gestureend', stop, gestureOpts);

  // Dua jari atau lebih = pinch
  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 1 || ((e as unknown as { scale?: number }).scale ?? 1) !== 1) e.preventDefault();
  };
  doc.addEventListener('touchmove', onTouchMove, { passive: false });

  // Desktop: trackpad pinch / ctrl+scroll
  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) e.preventDefault();
  };
  win.addEventListener('wheel', onWheel, { passive: false });

  // Desktop: ctrl/cmd + (+, -, 0)
  const onKey = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && ['+', '=', '-', '_', '0'].includes(e.key)) e.preventDefault();
  };
  win.addEventListener('keydown', onKey);

  return () => {
    doc.removeEventListener('gesturestart', stop);
    doc.removeEventListener('gesturechange', stop);
    doc.removeEventListener('gestureend', stop);
    doc.removeEventListener('touchmove', onTouchMove);
    win.removeEventListener('wheel', onWheel);
    win.removeEventListener('keydown', onKey);
  };
}

export default function ZoomLock() {
  useEffect(() => lockZoom(document, window), []);
  return null;
}
