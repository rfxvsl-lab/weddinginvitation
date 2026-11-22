'use client';

import React, { useState, useEffect } from 'react';
import InvitationPreview from '../../components/InvitationPreview';
import WatermarkOverlay from '../../components/WatermarkOverlay';
import LiveMomentsDock from '../../components/LiveMomentsDock';
import { addRSVP, addVisitorLog, confirmGuestAttendance } from '../../lib/api';
import type { WeddingData, Guest, RSVP } from '../../types';
import type { WatermarkType } from '../../lib/packageLimits';

interface InvitationClientProps {
  invitationId: string;
  weddingData: WeddingData;
  themeId: string;
  initialRsvps: RSVP[];
  urlGuest?: Guest;
  watermarkType?: WatermarkType;
  slug?: string;
  appUrl?: string;
  serverNow?: string;
}

export default function InvitationClient({
  invitationId,
  weddingData,
  themeId,
  initialRsvps,
  urlGuest,
  watermarkType = 'none',
  slug = '',
  appUrl = 'https://ruanghadir.net',
  serverNow,
}: InvitationClientProps) {
  const [rsvps, setRsvps] = useState<RSVP[]>(initialRsvps);

  const handleAddRSVP = async (newRSVP: Omit<RSVP, 'id'>) => {
    try {
      const saved = await addRSVP(invitationId, newRSVP);
      setRsvps(prev => [saved, ...prev]);

      // Tamu personal (punya kode undangan): status kehadiran ikut dikonfirmasi di daftar tamu
      if (urlGuest?.invitationCode) {
        await confirmGuestAttendance(invitationId, urlGuest.invitationCode, newRSVP.status, newRSVP.paxCount);
      }
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

  const coupleNames = `${weddingData?.couple?.groom?.nickname || ''} & ${weddingData?.couple?.bride?.nickname || ''}`;
  const eventDate = weddingData?.countdownDate
    ? new Date(weddingData.countdownDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : weddingData?.events?.resepsi?.date;

  return (
    <>
      <InvitationPreview
        data={weddingData}
        themeId={themeId}
        onAddRSVP={handleAddRSVP}
        rsvps={rsvps}
        guest={urlGuest}
        serverNow={serverNow}
        invitationId={invitationId}
      />
      {slug && weddingData?.enableLiveMoments !== false && (
        <LiveMomentsDock
          invitationId={invitationId}
          guestName={urlGuest?.name}
          coupleNames={coupleNames}
          eventDate={eventDate}
          slug={slug}
          appUrl={appUrl}
        />
      )}
      <WatermarkOverlay type={watermarkType} />
    </>
  );
}
