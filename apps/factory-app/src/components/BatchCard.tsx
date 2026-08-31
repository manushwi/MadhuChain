import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette, radii } from '@/src/theme/palette';
import { NeuCard, StatePill, t } from '@/src/theme/primitives';
import type { BatchSummary } from '@/src/api/types';
import { fmtDate } from '@/src/utils/format';

export function BatchCard({ batch, onPress }: { batch: BatchSummary; onPress?: () => void }) {
  const flags = batch.hives?.length
    ? batch.hives.map((h) => h.hive?.name ?? h.hiveId).join(', ')
    : null;
  return (
    <NeuCard onPress={onPress} style={{ gap: 8 }}>
      <View style={styles.row}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={t.mono}>{batch.batchId}</Text>
          <Text style={t.small}>{batch.lotId ?? 'no lot yet'}</Text>
        </View>
        <StatePill state={batch.state} />
      </View>
      <View style={styles.row}>
        <Text style={[t.body, { color: palette.dark }]}>{batch.weightKg != null ? `${batch.weightKg} kg` : 'weight pending'}</Text>
        <Text style={t.small}>{fmtDate(batch.harvestEnd ?? batch.createdAt)}</Text>
      </View>
      {flags ? <Text style={t.small}>hives · {flags}</Text> : null}
      {batch.flagged ? (
        <View style={styles.flagChip}>
          <Text style={styles.flagChipText}>⚠ FLAGGED{`${batch.flagReason ? ` — ${batch.flagReason}` : ''}`}</Text>
        </View>
      ) : null}
    </NeuCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  flagChip: {
    alignSelf: 'flex-start',
    backgroundColor: palette.badSoft,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  flagChipText: { fontFamily: 'System', fontWeight: '700', fontSize: 11, color: palette.bad },
});