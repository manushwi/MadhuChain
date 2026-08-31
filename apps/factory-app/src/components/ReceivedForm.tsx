import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { NeuButton, NeuInput } from '@/src/theme/primitives';
import { useAuth } from '@/src/context/AuthContext';
import { recordReceived } from '@/src/api/batches';
import type { ReceivedResponse } from '@/src/api/types';
import { ErrorNote } from './cards';

export function ReceivedForm({
  batchId,
  onDone,
}: {
  batchId: string;
  onDone: (r: ReceivedResponse) => void;
}) {
  const { user } = useAuth();
  const operatorId = user?.operatorId ?? user?.id ?? '';
  const [weight, setWeight] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    const w = Number.parseFloat(weight);
    if (!operatorId) return setErr('Operator identity is unavailable');
    if (!Number.isFinite(w) || w <= 0) return setErr('Enter a positive weight_in (kg)');
    setBusy(true);
    setErr(null);
    try {
      const res = await recordReceived(batchId, operatorId, w);
      onDone(res);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ gap: 12 }}>
      <NeuInput label="transporter_id" hint="identity of the carrier / vehicle" value={operatorId} editable={false} />
      <Text style={{ fontSize: 12, opacity: 0.6 }}>Identified from your logged-in account.</Text>
      <NeuInput label="weight_in" hint="kg gross at receiving" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
      <ErrorNote message={err ?? undefined} />
      <NeuButton title="Confirm receipt → INTAKE QC" onPress={submit} loading={busy} disabled={!operatorId} />
    </View>
  );
}