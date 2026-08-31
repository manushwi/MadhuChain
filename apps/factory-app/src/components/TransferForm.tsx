import React, { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View, ScrollView, StyleSheet } from 'react-native';
import { transferOwnership, listOperators } from '@/src/api/batches';
import type { Operator, TransferResponse } from '@/src/api/types';
import { useAuth } from '@/src/context/AuthContext';
import { NeuButton, NeuInput } from '@/src/theme/primitives';
import { palette, radii } from '@/src/theme/palette';
import { ErrorNote } from './cards';

export function TransferForm({ batchId, onDone }: { batchId: string; onDone: (response: TransferResponse) => void }) {
  const { user } = useAuth();
  const fromId = user?.operatorId ?? user?.id ?? '';
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selected, setSelected] = useState<Operator | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    listOperators()
      .then((list) => { if (alive) setOperators(list.filter((op) => op.operatorId && op.operatorId !== fromId && op.organization?.mspId)); })
      .catch((e) => { if (alive) setError(e instanceof Error ? e.message : String(e)); });
    return () => { alive = false; };
  }, [fromId]);

  const transfer = async () => {
    if (!selected?.operatorId) return;
    setBusy(true);
    setError(null);
    try {
      onDone(await transferOwnership(batchId, selected.operatorId, selected.organization?.mspId ?? ''));
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const confirm = () => {
    if (!selected) return setError('Select the receiving operator.');
    Alert.alert('Confirm custody transfer', `Transfer ${batchId} from ${fromId} to ${selected.name} (${selected.operatorId})? This will be recorded on-chain.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Transfer', onPress: transfer },
    ]);
  };

  return (
    <View style={{ gap: 12 }}>
      <NeuInput label="from (you)" hint="autofilled from your logged-in account" value={fromId} editable={false} />
      <Text style={styles.sectionTitle}>Receiving operator</Text>
      <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
        {operators.map((op) => {
          const active = selected?.operatorId === op.operatorId;
          return (
            <Pressable
              key={op.id}
              onPress={() => setSelected(active ? null : op)}
              style={[styles.option, active && styles.optionActive]}
            >
              <Text style={[styles.optionName, active && styles.optionTextActive]}>{op.name}</Text>
              <Text style={[styles.optionMeta, active && styles.optionTextActive]}>
                {op.role} · {op.organization?.mspId ?? 'no org'}
              </Text>
              <Text style={[styles.optionMeta, active && styles.optionTextActive]}>{op.operatorId}</Text>
            </Pressable>
          );
        })}
        {!operators.length && !error ? <Text style={styles.meta}>No other registered operators available.</Text> : null}
      </ScrollView>
      <NeuInput label="receiving MSP" hint="derived from the selected operator's organization" value={selected?.organization?.mspId ?? ''} editable={false} />
      <ErrorNote message={error ?? undefined} />
      <NeuButton title="Transfer custody" onPress={confirm} loading={busy} disabled={!selected} />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 13, fontWeight: '700', color: palette.dark, marginTop: 4 },
  option: {
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionActive: { borderColor: palette.accent, backgroundColor: palette.edgeLight },
  optionName: { fontSize: 14, fontWeight: '700', color: palette.dark },
  optionMeta: { fontSize: 12, color: palette.muted, marginTop: 2 },
  optionTextActive: { color: palette.accentDeep },
  meta: { fontSize: 12, color: palette.muted },
});
