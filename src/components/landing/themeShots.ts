/** Screenshot asli tiap tema (layar sampul di HP 390×844). */
const SHOT = (id: string) => `/assets/themes/shots/${id}.webp`;
// Semua tema punya screenshot dengan pola nama yang sama (scripts/theme_shots.py)
export const THEME_SHOTS: Record<string, string> = new Proxy({} as Record<string, string>, {
  get: (_t, id) => (typeof id === 'string' ? SHOT(id) : undefined),
});

export const THEME_CATEGORY_LABEL: Record<string, string> = {
  modern: 'Modern',
  classic: 'Klasik & adat',
  floral: 'Floral',
  minimalist: 'Minimalis',
  storybook: 'Interaktif',
};
