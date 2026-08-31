import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

import { BarcodeLabelCard } from '@/components/barcode/label-card';
import { BatchTimeline } from '@/components/status/batch-timeline';
import { Neumorph } from '@/components/ui/neumorph';
import { AsyncState } from '@/components/ui/async-state';
import { Screen } from '@/components/ui/screen';
import { getPalette, batchStatusColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBatchBarcode, useMintTransaction } from '@/hooks/use-queries';

export default function BatchDetailScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const { batchId } = useLocalSearchParams<{ batchId: string }>();
  const batchQuery = useBatchBarcode(batchId ?? '');
  const { data: batch, isLoading } = batchQuery;
  const { data: mintTransaction } = useMintTransaction(batchId ?? '');

  if (isLoading || batchQuery.error || !batch) {
    return <Screen><AsyncState loading={isLoading} error={batchQuery.error} empty={!isLoading && !batchQuery.error} emptyMessage="Batch not found." onRetry={() => batchQuery.refetch()} /></Screen>;
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
        {batch.sensor_data_hash ? <Text selectable variant="bodySmall" style={{ color: c.muted }}>Sensor anchor: {batch.sensor_data_hash}</Text> : null}
      </Neumorph>

      <Neumorph style={styles.info}>
        <Text variant="titleSmall" style={{ color: c.primaryDark, marginBottom: 10 }}>Chain lifecycle</Text>
        <BatchTimeline state={batch.lifecycle_state} />
        {batch.flag_reason ? <Text style={{ color: c.darkAccent }}>Reason: {batch.flag_reason}</Text> : null}
        {batch.flag_resolution ? <Text style={{ color: c.muted }}>Resolution: {batch.flag_resolution}</Text> : null}
      </Neumorph>

      {mintTransaction ? (
        <Neumorph style={styles.info}>
          <Text variant="titleSmall" style={{ color: c.primaryDark, marginBottom: 8 }}>Mint ledger transaction</Text>
          <Text selectable variant="bodySmall" style={{ color: c.muted }}>ID: {mintTransaction.transaction_id}</Text>
          <Text variant="bodySmall" style={{ color: c.muted }}>Validation code: {mintTransaction.validation_code}</Text>
          <Text variant="bodySmall" style={{ color: mintTransaction.successful ? c.primaryDark : c.darkAccent }}>{mintTransaction.successful ? 'Committed successfully' : 'Commit unsuccessful'}</Text>
        </Neumorph>
      ) : null}

      <DetailSection title="Quality tests" empty="No quality tests recorded." rows={batch.quality_tests.map((test) => `${test.stage}: ${test.result ?? 'Pending'} · Moisture ${display(test.moisture)} · HMF ${display(test.hmf)} · Diastase ${display(test.diastase)} · Isotope ${display(test.isotopeRatio)}${test.sugarProfile ? ` · Sugars ${json(test.sugarProfile)}` : ''}${test.testerId ? ` · Tester ${test.testerId}` : ''} · ${new Date(test.ts).toLocaleString()}`)} />
      <DetailSection title="Processing log" empty="No processing actions recorded." rows={batch.processing_logs.map((log) => `${log.actionType} · ${new Date(log.ts).toLocaleString()}${log.operatorId ? ` · Operator ${log.operatorId}` : ''}${log.equipmentId ? ` · Equipment ${log.equipmentId}` : ''} · Weight ${display(log.weightBefore)} → ${display(log.weightAfter)} kg${log.parameters ? ` · ${json(log.parameters)}` : ''}`)} />
      <DetailSection title="Jars" empty="No jars packaged." rows={batch.jars.map((jar) => `${jar.jarId} · ${new Date(jar.packagingDate).toLocaleDateString()}`)} />
      <DetailSection title="Transfers" empty="No ownership transfers." rows={batch.transfers.map((transfer) => `${transfer.fromId ?? 'Origin'} → ${transfer.toId ?? 'Unknown'} · ${new Date(transfer.ts).toLocaleString()}`)} />
      <DetailSection title="Blend composition" empty="This batch is not a blend." rows={batch.blends.map((blend) => `${blend.sourceLotId} · ${blend.weightKg} kg · ${blend.percentage}%`)} />
    </Screen>
  );
}

function DetailSection({ title, rows, empty }: { title: string; rows: string[]; empty: string }) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  return (
    <Neumorph style={styles.info}>
      <Text variant="titleSmall" style={{ color: c.primaryDark, marginBottom: 8 }}>{title}</Text>
      {rows.length ? rows.map((row, index) => <Text key={`${title}-${index}`} variant="bodySmall" style={{ color: c.muted, marginBottom: 6 }}>{row}</Text>) : <Text variant="bodySmall" style={{ color: c.muted }}>{empty}</Text>}
    </Neumorph>
  );
}

const display = (value: number | null | undefined) => value == null ? 'N/A' : String(value);
const json = (value: unknown) => typeof value === 'string' ? value : JSON.stringify(value);

const styles = {
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 4 },
  statusPill: { borderRadius: 12, paddingVertical: 2, paddingHorizontal: 6 },
  info: { borderRadius: 20, marginTop: 16 },
} as const;
