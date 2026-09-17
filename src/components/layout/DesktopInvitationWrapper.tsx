'use client';

import React from 'react';
import type { WeddingData, ThemeConfig } from '../../types';
import { convertGoogleDriveUrl } from '../../utils/googleDrive';
import IframePreview from '../IframePreview';

interface DesktopInvitationWrapperProps {
  children: React.ReactNode;
  data: WeddingData;
  theme: ThemeConfig;
  embedded?: boolean;
}

export default function DesktopInvitationWrapper({ children, data, theme, embedded = false }: DesktopInvitationWrapperProps) {
  if (embedded) return <>{children}</>;

  const groom = data.couple.groom.nickname;
  const bride = data.couple.bride.nickname;
  const photo = convertGoogleDriveUrl(data.bgImageUrl || data.gallery?.[0] || data.couple.groom.photoUrl || data.couple.bride.photoUrl || '');

  return (
    <div className="invitation-desktop-shell" style={{ backgroundColor: theme.bgHex, color: theme.textHex }}>
      <style>{`
        .invitation-desktop-shell { display: flex; width: 100%; height: 100vh; height: 100dvh; overflow: hidden; }
        .invitation-desktop-photo { display: none; }
        .invitation-mobile-viewport { width: 100%; height: 100%; min-width: 0; }
        .invitation-mobile-viewport > iframe { display: block; }
        @media (min-width: 1024px) {
          .invitation-desktop-photo { display: flex; flex: 1; position: relative; min-width: 0; align-items: center; justify-content: center; overflow: hidden; }
          .invitation-desktop-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
          .invitation-desktop-monogram { padding: 3rem; text-align: center; }
          .invitation-desktop-monogram p { text-transform: uppercase; letter-spacing: .3em; font-size: .7rem; margin-bottom: 2rem; }
          .invitation-desktop-monogram h2 { font-size: clamp(3rem, 5vw, 6rem); font-weight: 400; line-height: 1.1; }
          .invitation-desktop-monogram span { display: block; font-size: .5em; margin: .5em; }
          .invitation-mobile-viewport { flex: 0 0 33.333333%; width: 33.333333%; min-width: 390px; max-width: 480px; border-left: 1px solid ${theme.bgPatternHex}; }
        }
      `}</style>
      <aside className="invitation-desktop-photo" aria-label={`Pernikahan ${groom} dan ${bride}`}>
        <div className={`invitation-desktop-monogram ${theme.fontSerif}`}>
          <p>The wedding of</p>
          <h2>{groom}<span>&amp;</span>{bride}</h2>
        </div>
        {photo && <img key={photo} src={photo} referrerPolicy="no-referrer" alt={`${groom} & ${bride}`} ref={image => { if (image?.complete && !image.naturalWidth) image.style.display = 'none'; }} onError={event => { event.currentTarget.style.display = 'none'; }} />}
      </aside>
      <main className="invitation-mobile-viewport" aria-label="Undangan pernikahan">
        <IframePreview>{children}</IframePreview>
      </main>
    </div>
  );
}
