import { darkPalette, palette } from '@/constants/theme';

export const themeTabBar = {
  light: {
    active: palette.primaryDark,
    inactive: palette.muted,
    background: palette.surface,
    border: palette.surfaceAlt,
  },
  dark: {
    active: darkPalette.primaryDark,
    inactive: darkPalette.muted,
    background: darkPalette.surface,
    border: darkPalette.surfaceAlt,
  },
} as const;
