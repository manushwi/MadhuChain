import { Platform } from 'react-native';

export const palette = {
  background: '#EFEEE9', // Main background — Warm Ivory
  surface: '#E2DECE', // Main surface — Soft Cream
  surfaceAlt: '#D9D2C1', // Secondary surface — Champagne Beige
  sand: '#C9B69B', // Deep beige — Sand
  accent: '#C4835E', // Accent — Soft Terracotta
  accentBright: '#F39A68', // Bright accent — Peach Orange
  primaryDark: '#9B4E32', // Primary dark — Terracotta Brown
  darkAccent: '#81432D', // Dark accent — Cocoa Brown
  highlight: '#F8F7F2', // Highlight — Near White
  muted: '#A7A397', // Muted text — Warm Gray
} as const;

export const darkPalette = {
  background: '#1A1712',
  surface: '#262218',
  surfaceAlt: '#2E2920',
  sand: '#4A4032',
  accent: '#C4835E',
  accentBright: '#F39A68',
  primaryDark: '#E0A67F',
  darkAccent: '#F0BFA0',
  highlight: '#3A342A',
  muted: '#8C8578',
} as const;

export type HoneychainPalette = typeof palette;

// Deep warm shadow tone derived from sand/muted for neumorphism dark edge
export const themeShadow = {
  light: {
    light: '#FFFFFF',
    dark: '#C4BBAA',
  },
  dark: {
    light: '#2E2A22',
    dark: '#12100C',
  },
} as const;

export type ColorScheme = 'light' | 'dark';

export function getPalette(scheme: ColorScheme): HoneychainPalette {
  return scheme === 'dark' ? (darkPalette as unknown as HoneychainPalette) : palette;
}

export const statusColors = (c: HoneychainPalette) => ({
  healthy: c.accentBright,
  watch: c.accent,
  alert: c.darkAccent,
});

export const batchStatusColors = (c: HoneychainPalette) => ({
  MINTED: c.accentBright,
  'IN TRANSIT': c.accent,
  'AT FACTORY': c.sand,
  PROCESSING: c.accent,
  RELEASED: c.primaryDark,
  FLAGGED: c.darkAccent,
});

// Neumorphic soft shadow (dual-edge) applied to themed Views.
// Works cross-platform: elevation for Android, shadow* for iOS.
export function neuShadow(scheme: ColorScheme, intensity = 6) {
  const s = themeShadow[scheme];
  const distance = intensity;
  return {
    shadowColor: s.dark,
    shadowOffset: { width: distance, height: distance },
    shadowOpacity: 0.5,
    shadowRadius: distance,
    elevation: intensity * 2,
    ...(Platform.OS === 'ios' && {
      // highlight edge via border trick handled by themed surface color
    }),
  };
}

// Inset (pressed) variation for inputs / toggles
export function neuInset(scheme: ColorScheme, intensity = 6) {
  const s = themeShadow[scheme];
  const distance = intensity;
  return {
    shadowColor: s.light,
    shadowOffset: { width: -distance, height: -distance },
    shadowOpacity: 0.5,
    shadowRadius: distance,
    elevation: 0,
  };
}

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Compatibility export for the (tabs) layout / navigation label
export const Colors = {
  light: {
    text: palette.primaryDark,
    background: palette.background,
    tint: palette.accent,
    icon: palette.muted,
    tabIconDefault: palette.muted,
    tabIconSelected: palette.primaryDark,
  },
  dark: {
    text: darkPalette.primaryDark,
    background: darkPalette.background,
    tint: darkPalette.accent,
    icon: darkPalette.muted,
    tabIconDefault: darkPalette.muted,
    tabIconSelected: darkPalette.primaryDark,
  },
};
