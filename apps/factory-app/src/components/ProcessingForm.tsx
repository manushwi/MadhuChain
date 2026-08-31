import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, radii } from '@/src/theme/palette';
import { NeuButton, NeuInput } from '@/src/theme/primitives';
import { recordProcessingAction } from '@/src/api/batches';
import type { ProcessingResponse } from '@/src/api/types';
import { ErrorNote } from './cards';

export function ProcessingForm({
  batchId,
  onDone,
}: {
  batchId: string;
  onDone: (r: ProcessingResponse) => void;
}) {
  const [action, setAction] = useState<'heating' | 'filtering'>('heating');
  const [before, setBefore] = useState('');
  const [after, setAfter] = useState('');
  const [equipment, setEquipment] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const wb = Number.parseFloat(before);
  const wa = Number.parseFloat(after);
  const validWeights = Number.isFinite(wb) && wb > 0 && Number.isFinite(wa) && wa > 0;
  const deltaPct = validWeights ? ((wa - wb) / wb) * 100 : null;
  const invalidBalance = deltaPct !== null && deltaPct > 2;

  const submit = async () => {
    const eq = equipment.trim().toUpperCase();
    if (!eq) return setErr('Equipment ID is required');
    if (!/^[A-Za-z0-9._-]{1,40}$/.test(eq)) return setErr('Equipment ID may only contain letters, numbers, and . _ -');
    if (!Number.isFinite(wb) || wb <= 0) return setErr('Weight before must be a positive number');
    if (!Number.isFinite(wa) || wa <= 0) return setErr('Weight after must be a positive number');
    if (invalidBalance) return setErr('Weight after cannot exceed weight before by more than 2%');
    setBusy(true);
    setErr(null);
    try {
      const res = await recordProcessingAction(batchId, {
        action_type: action,
        weight_before: wb,
        weight_after: wa,
        equipment_id: eq,
      });
      onDone(res);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ gap: 14 }}>
      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: 'System', fontWeight: '600', fontSize: 12, color: palette.darkSoft }}>ACTION</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {(['heating', 'filtering'] as const).map((a) => {
            const active = action === a;
            return (
              <Pressable
                key={a}
                onPress={() => setAction(a)}
                style={[styles.seg, active && styles.segActive]}
              >
                <Text style={[styles.segText, active && { color: palette.onAccent }]}>
                  {a === 'heating' ? 'Warm / filter set' : 'Mesh / finishing filter'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <NeuInput label="weight_before" hint="kg, required" value={before} onChangeText={setBefore} keyboardType="decimal-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <NeuInput label="weight_after" hint="kg, required" value={after} onChangeText={setAfter} keyboardType="decimal-pad" />
        </View>
      </View>
      {deltaPct !== null ? (
        <Text style={{ fontSize: 11, color: invalidBalance ? palette.bad : palette.muted, fontWeight: invalidBalance ? '700' : '400' }}>
          Mass balance: {deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(1)}%. Processing output may not increase by more than 2%.
        </Text>
      ) : null}
      <NeuInput label="equipment_id" hint="required, e.g. PPT-02" value={equipment} onChangeText={setEquipment} />
      <ErrorNote message={err ?? undefined} />
      <NeuButton title="Log processing action" onPress={submit} loading={busy} disabled={!equipment.trim() || !validWeights || invalidBalance} />
    </View>
  );
}

const styles = StyleSheet.create({
  seg: {
    flex: 1,
    borderRadius: radii.sm,
    backgroundColor: palette.sunken,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.edgeDark,
  },
  segActive: { backgroundColor: palette.accentDeep },
  segText: { fontFamily: 'System', fontWeight: '700', fontSize: 13, color: palette.darkSoft, textAlign: 'center' },
});
