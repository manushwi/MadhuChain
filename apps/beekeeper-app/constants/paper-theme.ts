import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { darkPalette, palette } from '@/constants/theme';

export const paperThemeLight = {
  ...MD3LightTheme,
  roundness: 14,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.accent,
    onPrimary: palette.highlight,
    primaryContainer: palette.accentBright,
    onPrimaryContainer: palette.primaryDark,
    secondary: palette.sand,
    onSecondary: palette.primaryDark,
    background: palette.background,
    onBackground: palette.primaryDark,
    surface: palette.surface,
    onSurface: palette.primaryDark,
    surfaceVariant: palette.surfaceAlt,
    onSurfaceVariant: palette.muted,
    outline: palette.sand,
    error: palette.darkAccent,
    onError: palette.highlight,
  },
};

export const paperThemeDark = {
  ...MD3DarkTheme,
  roundness: 14,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkPalette.accent,
    onPrimary: darkPalette.background,
    primaryContainer: darkPalette.accentBright,
    onPrimaryContainer: darkPalette.primaryDark,
    secondary: darkPalette.sand,
    onSecondary: darkPalette.background,
    background: darkPalette.background,
    onBackground: darkPalette.primaryDark,
    surface: darkPalette.surface,
    onSurface: darkPalette.primaryDark,
    surfaceVariant: darkPalette.surfaceAlt,
    onSurfaceVariant: darkPalette.muted,
    outline: darkPalette.sand,
    error: darkPalette.darkAccent,
    onError: darkPalette.background,
  },
};
