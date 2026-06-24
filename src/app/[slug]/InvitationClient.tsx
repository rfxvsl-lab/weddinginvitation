'use client';

import React, { useState, useEffect } from 'react';
import InvitationPreview from '../../components/InvitationPreview';
import { addRSVP, addVisitorLog } from '../../lib/api';
import type { WeddingData, Guest, RSVP } from '../../types';

interface InvitationClientProps {
  invitationId: string;
  weddingData: WeddingData;
  themeId: string;
  guests: Guest[];
  initialRsvps: RSVP[];
  urlGuest?: Guest;
}

export default function InvitationClient({
  invitationId,
  weddingData,
  themeId,
  guests,
  initialRsvps,
  urlGuest,
}: InvitationClientProps) {
  const [rsvps, setRsvps] = useState<RSVP[]>(initialRsvps);

  const handleAddRSVP = async (newRSVP: Omit<RSVP, 'id'>) => {
    try {
      const saved = await addRSVP(invitationId, newRSVP);
      setRsvps(prev => [saved, ...prev]);
    } catch (err) {
      console.error('Failed to save RSVP:', err);
    }
  };

  useEffect(() => {
    if (urlGuest) {
      const log = {
        guestName: urlGuest.name,
        device: /Android|iPhone|iPad/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
        browser: navigator.userAgent.includes('Chrome') ? 'Google Chrome' : 'Safari / Webkit',
        timestamp: new Date().toISOString(),
      };
      addVisitorLog(invitationId, log).catch(console.error);
    }
  }, [urlGuest, invitationId]);

  return (
    <InvitationPreview
      data={weddingData}
      themeId={themeId}
      onAddRSVP={handleAddRSVP}
      rsvps={rsvps}
      guest={urlGuest}
    />
  );
}
