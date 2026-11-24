/**
 * Ikon garis untuk undangan (gaya Phosphor "regular", digambar ulang agar tanpa dependency).
 * Semua memakai currentColor, stroke 1.6, ukuran default 18.
 */
import React from 'react';

type P = { size?: number; style?: React.CSSProperties };

const base = (size: number, style?: React.CSSProperties) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  style: { flex: 'none', display: 'block', ...style },
});

export const IcPin = ({ size = 18, style }: P) => (
  <svg {...base(size, style)}>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);
export const IcCalendar = ({ size = 18, style }: P) => (
  <svg {...base(size, style)}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
  </svg>
);
export const IcClock = ({ size = 18, style }: P) => (
  <svg {...base(size, style)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
export const IcCopy = ({ size = 18, style }: P) => (
  <svg {...base(size, style)}>
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" />
  </svg>
);
export const IcCheck = ({ size = 18, style }: P) => (
  <svg {...base(size, style)}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const IcInstagram = ({ size = 18, style }: P) => (
  <svg {...base(size, style)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
  </svg>
);
export const IcHeart = ({ size = 18, style }: P) => (
  <svg {...base(size, style)}>
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />
  </svg>
);
export const IcHome = ({ size = 18, style }: P) => (
  <svg {...base(size, style)}>
    <path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4Z" />
  </svg>
);
export const IcImage = ({ size = 18, style }: P) => (
  <svg {...base(size, style)}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m4 17 5-4.5 3.5 3 3-2.5L20 17" />
  </svg>
);
export const IcGift = ({ size = 18, style }: P) => (
  <svg {...base(size, style)}>
    <rect x="3.5" y="8.5" width="17" height="4" rx="1" />
    <path d="M5 12.5V20h14v-7.5M12 8.5V20M12 8.5S10.8 4 8.3 4.6C6.4 5 7 8.5 12 8.5ZM12 8.5S13.2 4 15.7 4.6C17.6 5 17 8.5 12 8.5Z" />
  </svg>
);
export const IcChat = ({ size = 18, style }: P) => (
  <svg {...base(size, style)}>
    <path d="M4 5.5h16v11H9.5L5 20v-3.5H4Z" />
    <path d="M8 10h8M8 13h5" />
  </svg>
);
export const IcEnvelope = ({ size = 18, style }: P) => (
  <svg {...base(size, style)}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
    <path d="m4 6.5 8 6 8-6" />
  </svg>
);
export const IcPlay = ({ size = 18, style }: P) => (
  <svg {...base(size, style)}>
    <path d="M8 5.5v13l10-6.5Z" fill="currentColor" />
  </svg>
);
export const IcPause = ({ size = 18, style }: P) => (
  <svg {...base(size, style)}>
    <path d="M8.5 5.5v13M15.5 5.5v13" strokeWidth={2.4} />
  </svg>
);
export const IcChevron = ({ size = 18, style, dir = 'right' }: P & { dir?: 'left' | 'right' | 'down' }) => (
  <svg {...base(size, style)}>
    <path d={dir === 'left' ? 'M14.5 5.5 8 12l6.5 6.5' : dir === 'down' ? 'M5.5 9.5 12 16l6.5-6.5' : 'M9.5 5.5 16 12l-6.5 6.5'} />
  </svg>
);
export const IcClose = ({ size = 18, style }: P) => (
  <svg {...base(size, style)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const IcBroadcast = ({ size = 18, style }: P) => (
  <svg {...base(size, style)}>
    <circle cx="12" cy="12" r="2" />
    <path d="M8.2 15.8a5.4 5.4 0 0 1 0-7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6M5.4 18.6a9.3 9.3 0 0 1 0-13.2M18.6 5.4a9.3 9.3 0 0 1 0 13.2" />
  </svg>
);
export const IcHouse = IcHome;
