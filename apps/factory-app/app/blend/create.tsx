import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useRemote } from '@/src/hooks/use-remote';
import { createBlend, listBatches } from '@/src/api/batches';
import type { BatchSummary, BlendResponse } from '@/src/api/types';
import { NeuButton, NeuCard, NeuInput, Screen, StatePill, t } from '@/src/theme/primitives';
import { palette } from '@/src/theme/palette';
import { ErrorNote, LoadingState, SuccessNote } from '@/src/components/cards';
import { useAuth } from '@/src/context/AuthContext';
import { can } from '@/src/auth/capabilities';

interface Selection {
  batchId: string;
  lotId: string | null;
  weight: string;
}

export default function BlendCreateScreen() {
  const { user } = useAuth();
  const { data, error, loading, refetch } = useRemote(listBatches, `hc.factory.${user?.id}.batches`);
  const [selected, setSelected] = useState<Record<string, Selection>>({});
  const [declared, setDeclared] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<BlendResponse | null>(null);

  const candidates = useMemo(
    () => (data ?? []).filter((b) => b.state === 'RELEASED' && !b.flagged && !!b.lotId),
    [data],
  );

  const toggle = (b: BatchSummary) => {
    setSelected((old) => {
      const next = { ...old };
      if (next[b.batchId]) {
        delete next[b.batchId];
      } else {
        next[b.batchId] = { batchId: b.batchId, lotId: b.lotId, weight: b.weightKg != null ? String(b.weightKg) : '' };
      }
      return next;
    });
  };

  const setWeight = (batchId: string, w: string) =>
    setSelected((old) => ({ ...old, [batchId]: { ...old[batchId], weight: w } }));

  const sumSelected = Object.values(selected).reduce((acc, s) => acc + (Number.parseFloat(s.weight) || 0), 0);
  const declaredNum = Number.parseFloat(declared);
  const declaredOk = Number.isFinite(declaredNum) && declaredNum > 0;
  const declDelta = declaredOk && sumSelected > 0 ? ((declaredNum - sumSelected) / sumSelected) * 100 : null;

  const submit = async () => {
    setBusy(true);
    setErr(null);
    try {
      const entries = Object.values(selected);
      if (entries.length < 2) throw new Error('Select at least two released, unflagged lots');
      const sources = entries.map((s) => {
        const w = Number.parseFloat(s.weight);
        if (!Number.isFinite(w) || w <= 0) throw new Error(`Invalid weight for ${s.lotId ?? s.batchId}`);
        return { lot_id: s.lotId!, weight_kg: w };
      });
      if (!declaredOk) throw new Error('Declared blend weight_kg must be a positive number');
      if (declDelta === null || Math.abs(declDelta) > 2) throw new Error('Declared blend weight must be within 2% of source mass');
      const res = await createBlend(entries[0].batchId, sources, declaredNum);
      setResult(res);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (!can(user?.role, 'blend')) {
    return (
      <Screen style={{ padding: 24 }}>
        <ErrorNote message="Blending is restricted to Factory Workers. Return to the batch list for read-only oversight." />
        <NeuButton title="Back to operations" variant="ghost" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </Screen>
    );
  }

  if (error && !data) {
    return (
      <Screen>
        <View style={{ padding: 24 }}>
          <ErrorNote message={error} />
          <NeuButton title="Retry" variant="ghost" onPress={refetch} style={{ marginTop: 16 }} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <NeuCard style={{ gap: 10 }}>
          <Text style={t.h3}>New blend lot</Text>
          <Text style={[t.body, { color: palette.muted }]}>
            Mix two or more released, unflagged lots into a new composite batch. Sources keep their verification data;
            the blend batch carries its own lot id on-chain.
          </Text>
        </NeuCard>

        {result ? (
          <NeuCard style={{ gap: 12 }}>
            <SuccessNote message={`Blend anchored on-chain as ${result.batch_id}`} tx={result.tx} />
            <Text style={t.small}>new lot {result.lot_id} · total {declaredNum} kg</Text>
            <NeuButton title="Open the blend batch" onPress={() => router.replace({ pathname: '/batch/[id]', params: { id: result.batch_id } })} disabled={!result.batch_id} />
          </NeuCard>
        ) : (
          <>
            <Text style={t.h3}>Source lots on the ledger</Text>
            {candidates.length === 0 ? (
              loading ? <LoadingState /> : <Text style={[t.body, { color: palette.muted }]}>No released, unflagged lots available.</Text>
            ) : (
              candidates.map((b) => {
                const sel = selected[b.batchId];
                const active = !!sel;
                return (
                  <NeuCard key={b.batchId} sunken style={{ gap: 10 }} >
                    <Pressable onPress={() => toggle(b)} style={styles.sourceHeader}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={t.mono}>{b.batchId}</Text>
                        <Text style={t.small}>{b.lotId ?? '—'}</Text>
                      </View>
                      <StatePill state={b.state} />
                    </Pressable>
                    {active ? (
                      <NeuInput
                        label="weight_kg to blend"
                        hint={`total source ${b.weightKg != null ? `${b.weightKg} kg` : 'unknown'}`}
                        value={sel.weight}
                        onChangeText={(w) => setWeight(b.batchId, w)}
                        keyboardType="decimal-pad"
                      />
                    ) : null}
                  </NeuCard>
                );
              })
            )}

            <NeuCard style={{ gap: 12 }}>
              <Text style={t.h3}>Blend totals</Text>
              <View style={styles.rowBetween}>
                <Text style={t.small}>Σ sources</Text>
                <Text style={t.mono}>{sumSelected.toFixed(2)} kg</Text>
              </View>
              <NeuInput
                label="declared weight_kg"
                hint={declDelta !== null ? `${declDelta >= 0 ? '+' : ''}${declDelta.toFixed(1)}% vs Σ sources${Math.abs(declDelta) > 2 ? ' — outside ±2%' : ''}` : 'kg for the new blend batch'}
                value={declared}
                onChangeText={setDeclared}
                keyboardType="decimal-pad"
              />
              <ErrorNote message={err ?? undefined} />
              <NeuButton title="Anchor blend batch" variant="accent" onPress={submit} loading={busy} disabled={Object.keys(selected).length < 2 || !declaredOk || declDelta === null || Math.abs(declDelta) > 2} />
            </NeuCard>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  sourceHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
