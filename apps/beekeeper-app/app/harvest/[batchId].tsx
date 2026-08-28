import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

import { BarcodeLabelCard } from '@/components/barcode/label-card';
import { Neumorph } from '@/components/ui/neumorph';
import { Screen } from '@/components/ui/screen';
import { getPalette, batchStatusColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBatchBarcode } from '@/hooks/use-queries';

export default function BatchDetailScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const { batchId } = useLocalSearchParams<{ batchId: string }>();
  const { data: batch, isLoading } = useBatchBarcode(batchId ?? '');

  if (isLoading || !batch) {
    return <Screen><Text style={{ color: c.muted }}>Loading batch…</Text></Screen>;
  }

  const bsc = batchStatusColors(c);
  const statusColor = bsc[batch.status] ?? c.accent;

  return (
    <Screen>
      <View style={styles.statusRow}>
        <Text variant="headlineSmall" style={{ color: c.darkAccent, fontWeight: '700' }}>
          {batch.batch_id}
        </Text>
        <Neumorph inset style={styles.statusPill}>
          <Text variant="labelLarge" style={{ color: statusColor }}>{batch.status}</Text>
        </Neumorph>
      </View>

      <Text variant="bodyMedium" style={{ color: c.muted, marginBottom: 16 }}>
        Lot {batch.lot_id} · {batch.weight_kg} kg
      </Text>

      <BarcodeLabelCard batch={batch} />

      <Neumorph style={styles.info}>
        <Text variant="titleSmall" style={{ color: c.primaryDark, marginBottom: 8 }}>Details</Text>
        <Text variant="bodySmall" style={{ color: c.muted }}>
          Hives: {batch.hive_ids.join(', ')}
        </Text>
        <Text variant="bodySmall" style={{ color: c.muted }}>
          Harvest period: {batch.harvest_start} → {batch.harvest_end}
        </Text>
      </Neumorph>
    </Screen>
  );
}

const styles = {
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 4 },
  statusPill: { borderRadius: 12, paddingVertical: 2, paddingHorizontal: 6 },
  info: { borderRadius: 20, marginTop: 16 },
} as const;
