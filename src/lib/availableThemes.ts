import { DEFAULT_THEMES } from '../data/defaultData';

/** Owner-retained choices. Keep the full registry for already-saved invitations. */
export const RETAINED_THEME_IDS = ['sunda-kujang', 'storybook-interactive'] as const;
export const AVAILABLE_THEMES = DEFAULT_THEMES.filter(theme =>
  RETAINED_THEME_IDS.some(id => id === theme.id),
);
export function hasAvailableThemeCategory(category: string) {
  return category === 'all' || AVAILABLE_THEMES.some(theme =>
    category === 'special' ? theme.tier === 'special' : theme.pattern === category,
  );
}
