import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { palette } from '@/src/theme/palette';
import { NeuButton, NeuInput, t } from '@/src/theme/primitives';
import { recordPackaging } from '@/src/api/batches';
import type { PackagingResponse } from '@/src/api/types';
import { ErrorNote } from './cards';

export function PackagingForm({
  batchId,
  outputWeightKg,
  onDone,
}: {
  batchId: string;
  outputWeightKg: number | null;
  onDone: (r: PackagingResponse) => void;
}) {
  const [count, setCount] = useState('');
  const [avg, setAvg] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const nCount = Number.parseInt(count, 10);
  const nAvg = Number.parseFloat(avg);
  const hasCount = Number.isInteger(nCount) && nCount > 0;
  const hasAvg = Number.isFinite(nAvg) && nAvg > 0;

  const estimated = hasCount && hasAvg ? nCount * nAvg : null;
  const deltaPct = estimated != null && outputWeightKg ? ((estimated - outputWeightKg) / outputWeightKg) * 100 : null;
  const invalidBalance = deltaPct !== null && Math.abs(deltaPct) > 2;

  const submit = async () => {
    if (!hasCount) return setErr('Enter a whole jar count');
    if (!hasAvg) return setErr('Enter a numeric average jar weight (kg)');
    if (invalidBalance) return setErr('Packed weight must be within 2% of recorded processing output');
    setBusy(true);
    setErr(null);
    try {
      const res = await recordPackaging(batchId, nCount, nAvg);
      onDone(res);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <NeuInput label="jar_count" hint="whole jars" value={count} onChangeText={setCount} keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <NeuInput label="average_jar_weight_kg" hint="e.g. 0.45" value={avg} onChangeText={setAvg} keyboardType="decimal-pad" />
        </View>
      </View>
      {estimated != null ? (
        <View style={{ gap: 4 }}>
          <Text style={t.small}>
            total packed ~ <Text style={{ color: palette.dark, fontWeight: '700' }}>{estimated.toFixed(2)} kg</Text>
            {outputWeightKg ? ` · processing output ${outputWeightKg} kg (${deltaPct!.toFixed(1)}%)` : ''}
          </Text>
          {deltaPct !== null && Math.abs(deltaPct) > 2 ? (
            <Text style={{ fontSize: 11, color: palette.bad, fontWeight: '700' }}>
              Packed weight must remain within 2% of processing output.
            </Text>
          ) : null}
        </View>
      ) : null}
      {outputWeightKg == null ? (
        <Text style={t.small}>No processing output weight is available from the API. Original batch weight is not used as an authoritative packaging balance.</Text>
      ) : null}
      <ErrorNote message={err ?? undefined} />
      <NeuButton title="Record packaging + generate jar serials" onPress={submit} loading={busy} disabled={invalidBalance} />
    </View>
  );
}
