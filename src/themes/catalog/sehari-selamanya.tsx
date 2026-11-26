import { defineTheme } from '../types';
/** Independent editorial renderer dispatched by this ID; no generated ornament. */
export default defineTheme({
  id: 'sehari-selamanya', name: 'Sehari, Selamanya', category: 'modern', addedAt: '2026-11-26',
  description: 'Foto editorial, kertas hangat, biru kobalt dan catatan kuning. Komposisi asimetris dengan ruang untuk cerita pasangan.',
  palette: { bg: '#faf6ed', surface: '#e6ecdf', primary: '#183fc4', secondary: '#efce61', text: '#22352e', muted: '#46584b', onPrimary: '#faf6ed', cover: '#faf6ed', onCover: '#22352e' },
  fonts: { display: 'Georgia, serif', body: 'Manrope, sans-serif', google: '' },
  divider: 'none', ornament: 'none', frame: 'rect', radius: 0,
  cover: 'photo', hero: 'photo', couple: 'split', countdown: 'inline', events: 'timeline', gallery: 'grid', ambient: 'none', reveal: 'fade',
});
