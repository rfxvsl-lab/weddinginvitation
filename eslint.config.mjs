import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import jsxA11y from 'eslint-plugin-jsx-a11y';

/**
 * Aturan Next.js + TypeScript + aksesibilitas (jsx-a11y recommended).
 * Pelanggaran lama yang belum dibereskan diturunkan ke "warn" (lihat bagian
 * paling bawah) supaya CI bisa langsung memblokir masalah BARU.
 */
const config = [
  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.{jsx,tsx}'],
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      // Region yang bisa di-scroll harus bisa difokus keyboard (axe: scrollable-region-focusable).
      // Pola yang dipakai: <div role="region" aria-label="…" tabIndex={0}>.
      'jsx-a11y/no-noninteractive-tabindex': ['error', { tags: [], roles: ['tabpanel', 'region'] }],
      // <audio> di sini hanya musik latar tanpa ucapan; tidak ada teks untuk dijadikan caption.
      'jsx-a11y/media-has-caption': 'off',
      // Tanda kutip/apostrof di teks JSX: murni gaya penulisan, tidak memengaruhi hasil.
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'scripts/**', 'tests/e2e/**'],
  },
];

export default config;
