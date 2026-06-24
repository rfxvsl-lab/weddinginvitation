'use client';

import React, { useState, useEffect } from 'react';

export default function GodMode() {
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    if (clicks >= 3) {
      const isGodMode = localStorage.getItem('godMode') === 'true';
      if (!isGodMode) {
        localStorage.setItem('godMode', 'true');
        alert("[GODMODE ACTIVATED]\nSemua akses premium terbuka. Bypass kadaluarsa aktif.");
      } else {
        localStorage.removeItem('godMode');
        alert("[GODMODE DEACTIVATED]\nMode normal dipulihkan.");
      }
      window.location.reload();
      setClicks(0);
    }

    // Reset clicks after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      setClicks(0);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [clicks]);

  return (
    <div
      onClick={() => setClicks((prev) => prev + 1)}
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '50px',
        height: '50px',
        cursor: 'default',
        zIndex: 99999,
        opacity: 0, // completely hidden
      }}
      title="Secret GodMode Toggle"
    />
  );
}
