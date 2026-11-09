'use client';

import React, { useState } from 'react';
import { AuthProvider } from '../../hooks/useAuth';
import { AlertModalProvider } from '../../hooks/useAlertModal';
import GuestManager from '../../components/GuestManager';
import QrCheckInScanner from '../../components/QrCheckInScanner';
import { INITIAL_GUESTS } from '../../data/defaultData';
import type { Guest } from '../../types';

function Harness() {
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [scanner, setScanner] = useState(false);
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-3">
      <button onClick={() => setScanner(true)} className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold">
        BUKA SCANNER (direct) — state: {String(scanner)}
      </button>
      {scanner && (
        <QrCheckInScanner
          guests={guests}
          onCheckIn={async (g, pax, table) => {
            setGuests((prev) => prev.map((x) => (x.id === g.id ? { ...x, checkedInAt: new Date().toISOString(), checkInPax: pax, tableNo: table } : x)));
          }}
          onClose={() => setScanner(false)}
        />
      )}
      <GuestManager
        guests={guests}
        appUrl="http://127.0.0.1:3100"
        slug="rian-salsa"
        coupleNames="Rian & Salsa"
        onAddGuest={(g) => setGuests((p) => [{ ...g, id: `g-${Date.now()}`, invitationCode: 'W-NEW' }, ...p])}
        onRemoveGuest={(id) => setGuests((p) => p.filter((g) => g.id !== id))}
        onUpdateGuestStatus={(id, status) => setGuests((p) => p.map((g) => (g.id === id ? { ...g, status } : g)))}
      />
    </div>
  );
}

export default function TestGuestsPage() {
  return (
    <AuthProvider>
      <AlertModalProvider>
        <Harness />
      </AlertModalProvider>
    </AuthProvider>
  );
}
