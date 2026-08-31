import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, radii } from './palette';

export type BatchChainState =
  | 'HARVESTED'
  | 'COLLECTED'
  | 'COLLECTION_REJECTED'
  | 'LAB_APPROVED'
  | 'LAB_REJECTED'
  | 'PROCESSED'
  | 'OUTPUT_APPROVED'
  | 'FINAL_QC'
  | 'RELEASED'
  | 'FLAGGED'
  | 'REVOKED';

export function Screen({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <SafeAreaView style={[styles.screen, style]} edges={['top', 'left', 'right']}>{children}</SafeAreaView>;
}

export function NeuCard({
  children,
  lifted = true,
  sunken = false,
  style,
  onPress,
}: {
  children: React.ReactNode;
  lifted?: boolean;
  sunken?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const card = (
    <View
      style={[
        lifted ? styles.cardLifted : styles.cardFlat,
        sunken && styles.cardSunken,
        style,
      ]}
    >
      {children}
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => (pressed ? styles.pressed : styles.cardPressable)}>
        {card}
      </Pressable>
    );
  }
  return card;
}

const STATE_TONES: Record<string, { label: string; fg: string; bg: string }> = {
  HARVESTED: { label: 'HARVESTED', fg: palette.darkSoft, bg: palette.surface },
  COLLECTED: { label: 'COLLECTED', fg: palette.warn, bg: palette.warnSoft },
  COLLECTION_REJECTED: { label: 'COLLECTION REJECTED', fg: palette.bad, bg: palette.badSoft },
  LAB_APPROVED: { label: 'INTAKE APPROVED', fg: palette.ok, bg: palette.okSoft },
  LAB_REJECTED: { label: 'LAB REJECTED', fg: palette.bad, bg: palette.badSoft },
  PROCESSED: { label: 'PROCESSED', fg: palette.accentDeep, bg: palette.edgeLight },
  OUTPUT_APPROVED: { label: 'OUTPUT APPROVED', fg: palette.ok, bg: palette.okSoft },
  FINAL_QC: { label: 'FINAL QC', fg: palette.warn, bg: palette.warnSoft },
  RELEASED: { label: 'RELEASED', fg: palette.ok, bg: palette.okSoft },
  FLAGGED: { label: 'FLAGGED', fg: palette.bad, bg: palette.badSoft },
  REVOKED: { label: 'REVOKED', fg: palette.bad, bg: palette.badSoft },
};

export function StatePill({ state }: { state: string }) {
  const t = STATE_TONES[state] ?? { label: state, fg: palette.darkSoft, bg: palette.surface };
  return <View style={[styles.pill, { backgroundColor: t.bg }]}><Text style={[styles.pillText, { color: t.fg }]}>{t.label}</Text></View>;
}

export function NeuButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'accent' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const tone =
    variant === 'accent'
      ? { bg: palette.accentBright, fg: palette.onAccent }
      : variant === 'ghost'
        ? { bg: palette.surface, fg: palette.darkSoft }
        : variant === 'danger'
          ? { bg: palette.bad, fg: palette.onAccent }
          : { bg: palette.accentDeep, fg: palette.onAccent };
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={inactive ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: inactive ? palette.muted : tone.bg },
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={tone.fg} />
      ) : (
        <Text style={[styles.buttonLabel, { color: inactive ? palette.edgeLight : tone.fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function NeuInput({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & TextInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={palette.muted}
        style={styles.input}
        selectionColor={palette.accentDeep}
        {...props}
      />
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

export const t = {
  h1: { fontFamily: 'System', fontWeight: '800' as const, fontSize: 26, color: palette.dark, letterSpacing: -0.4 },
  h2: { fontFamily: 'System', fontWeight: '700' as const, fontSize: 18, color: palette.dark },
  h3: { fontFamily: 'System', fontWeight: '700' as const, fontSize: 15, color: palette.dark },
  body: { fontFamily: 'System', fontSize: 14, color: palette.darkSoft, lineHeight: 20 },
  mono: { fontFamily: 'monospace', fontSize: 13, color: palette.dark, letterSpacing: 0.3 },
  small: { fontFamily: 'System', fontSize: 12, color: palette.muted },
} as const;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  cardLifted: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: 16,
    shadowColor: palette.edgeDark,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 5,
  },
  cardFlat: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: 16,
  },
  cardSunken: {
    backgroundColor: palette.sunken,
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.45,
    shadowRadius: 9,
    elevation: 3,
  },
  cardPressable: { borderRadius: radii.lg },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  pill: { alignSelf: 'flex-start', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 4 },
  pillText: { fontFamily: 'System', fontWeight: '700', fontSize: 12, letterSpacing: 0.5 },
  button: {
    minHeight: 48,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.edgeDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonLabel: { fontFamily: 'System', fontWeight: '700', fontSize: 15 },
  field: { gap: 6 },
  fieldLabel: { fontFamily: 'System', fontWeight: '600', fontSize: 12, color: palette.darkSoft, letterSpacing: 0.3 },
  input: {
    minHeight: 48,
    backgroundColor: palette.sunken,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: palette.dark,
    fontSize: 15,
    borderWidth: 1,
    borderColor: palette.edgeDark,
  },
  fieldHint: { fontFamily: 'System', fontSize: 11, color: palette.muted },
});
