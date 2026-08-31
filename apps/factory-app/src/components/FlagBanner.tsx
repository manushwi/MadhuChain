import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette, radii } from '@/src/theme/palette';
import type { BatchDetail } from '@/src/api/types';

export function FlagBanner({ batch }: { batch: BatchDetail }) {
  if (!batch.flagged) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.title}>⚠ LOT FLAGGED</Text>
      {batch.flagReason ? <Text style={styles.reason}>{batch.flagReason}</Text> : null}
      {batch.flagResolution ? (
        <Text style={styles.resolution}>resolution: {batch.flagResolution}</Text>
      ) : null}
      <Text style={styles.sub}>Only a QC Manager can resolve this flag.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: palette.badSoft,
    borderRadius: radii.md,
    padding: 14,
    gap: 4,
  },
  title: { fontFamily: 'System', fontWeight: '800', fontSize: 15, color: palette.bad, letterSpacing: 0.5 },
  reason: { fontFamily: 'System', fontWeight: '600', fontSize: 13, color: palette.dark },
  resolution: { fontFamily: 'System', fontSize: 12, color: palette.bad },
  sub: { fontFamily: 'System', fontSize: 11, color: palette.darkSoft },
});