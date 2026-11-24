'use client';

import React from 'react';
import type { WeddingData, ThemeConfig } from '../../types';
import { convertGoogleDriveUrl } from '../../utils/googleDrive';
import IframePreview from '../IframePreview';
import { getKitTheme } from '../../themes/catalog';
import { DesktopAside } from '../../themes/kit/standard';
import { fontImport } from '../../themes/kit/primitives';

interface DesktopInvitationWrapperProps {
  children: React.ReactNode;
  data: WeddingData;
  theme: ThemeConfig;
  embedded?: boolean;
}

/**
 * Tata letak desktop undangan (pola template premium): foto pasangan layar penuh di kiri
 * dengan nama & tanggal memakai huruf tema, undangan (kolom ponsel) di kanan.
 * Di layar < 1024px hanya kolom undangan yang tampil.
 */
export default function DesktopInvitationWrapper({ children, data, theme, embedded = false }: DesktopInvitationWrapperProps) {
  if (embedded) return <>{children}</>;

  const spec = getKitTheme(theme.id);
  const groom = data.couple.groom.nickname;
  const bride = data.couple.bride.nickname;
  const img = (u?: string) => convertGoogleDriveUrl(u || '');
  const photos = [data.bgImageUrl, ...(data.gallery || []).slice(0, 4), data.couple.groom.photoUrl]
    .filter(Boolean)
    .map((u) => img(u))
    .filter((u, i, a) => a.indexOf(u) === i);
  const mainDate = data.events?.akad?.date || data.events?.resepsi?.date || data.countdownDate?.slice(0, 10);
  const d = mainDate ? new Date(mainDate) : null;
  const dateText = d && !isNaN(d.getTime()) ? d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const fonts = spec
    ? { display: spec.fonts.display, script: spec.fonts.script || spec.fonts.display, label: spec.fonts.label || spec.fonts.body, body: spec.fonts.body }
    : { display: 'Georgia, serif', script: 'Georgia, serif', label: 'system-ui, sans-serif', body: 'system-ui, sans-serif' };
  const quote = data.quoteText && data.quoteText.length < 240 ? `“${data.quoteText}”` : undefined;

  return (
    <div className="invitation-desktop-shell" style={{ backgroundColor: theme.bgHex, color: theme.textHex }}>
      <style>{`
        ${spec ? fontImport(spec.fonts.google) : ''}
        .invitation-desktop-shell { display: flex; width: 100%; height: 100vh; height: 100dvh; overflow: hidden; }
        .invitation-desktop-photo { display: none; }
        .invitation-mobile-viewport { width: 100%; height: 100%; min-width: 0; }
        .invitation-mobile-viewport > iframe { display: block; }
        @media (min-width: 1024px) {
          .invitation-desktop-photo { display: block; flex: 1; position: relative; min-width: 0; overflow: hidden; }
          .invitation-mobile-viewport { flex: 0 0 430px; width: 430px; box-shadow: -24px 0 48px -24px rgba(0,0,0,.5); position: relative; z-index: 1; }
        }
      `}</style>
      <aside className="invitation-desktop-photo" aria-label={`Pernikahan ${groom} dan ${bride}`}>
        <DesktopAside
          photos={photos}
          title={spec?.copy?.heroTitle || 'The Wedding of'}
          groom={groom}
          bride={bride}
          dateText={dateText}
          quote={quote}
          fonts={fonts}
          accent={spec?.palette.secondary || theme.secondaryHex || '#E8D5A8'}
        />
      </aside>
      <main className="invitation-mobile-viewport" aria-label="Undangan pernikahan">
        <IframePreview>{children}</IframePreview>
      </main>
    </div>
  );
}
