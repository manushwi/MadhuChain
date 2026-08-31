// Warm honey palette — the neumorphic "factory console" look from the build guide.
export const palette = {
  bg: '#EFEEE9', // warm sand paper
  surface: '#E4E0D3', // raised card
  sunken: '#D9D4C6', // recessed field / pressed
  edgeLight: '#FBF9F2', // top-left highlight
  edgeDark: '#C8C1B2', // bottom-right shadow
  accent: '#C4835E', // honey amber
  accentBright: '#F39A68', // bright amber highlight
  accentDeep: '#9B4E32', // darkened terracotta
  dark: '#3D3628', // ink / text
  darkSoft: '#6B6352', // secondary text
  muted: '#A7A397', // tertiary text
  onAccent: '#FFF9EE',
  ok: '#5B7E63',
  okSoft: '#DCE5D9',
  warn: '#C08A3E',
  warnSoft: '#EFE3C8',
  bad: '#A54838',
  badSoft: '#EBD3C9',
} as const;

export const radii = { sm: 10, md: 14, lg: 22, pill: 999 } as const;