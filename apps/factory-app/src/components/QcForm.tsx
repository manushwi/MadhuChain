import React, { useState } from 'react';
import { View } from 'react-native';
import { palette } from '@/src/theme/palette';
import { NeuButton, NeuInput } from '@/src/theme/primitives';
import { DRIFT } from '@/src/theme/drift';
import type { QualityResponse, QualityTest } from '@/src/api/types';
import { recordQualityTest } from '@/src/api/batches';
import { ErrorNote } from './cards';

interface Field {
  key: string;
  label: string;
  unit: string;
  current: (v: Record<string, string>) => number | undefined;
  base: (q: QualityTest) => number | undefined;
  tol: number;
}

const FIELDS: Field[] = [
  { key: 'moisture', label: 'moisture', unit: '% w/w', current: (v) => toNum(v.moisture), base: (q) => q.moisture ?? undefined, tol: DRIFT.moistureDelta },
  { key: 'hmf', label: 'hmf', unit: 'mg/kg', current: (v) => toNum(v.hmf), base: (q) => q.hmf ?? undefined, tol: DRIFT.hmfDelta },
  { key: 'diastase', label: 'diastase', unit: 'Schade', current: (v) => toNum(v.diastase), base: (q) => q.diastase ?? undefined, tol: DRIFT.diastaseDelta },
  { key: 'fructose', label: 'fructose', unit: '%', current: (v) => toNum(v.fructose), base: (q) => q.sugarProfile?.fructose, tol: DRIFT.sugarProfileDelta },
  { key: 'glucose', label: 'glucose', unit: '%', current: (v) => toNum(v.glucose), base: (q) => q.sugarProfile?.glucose, tol: DRIFT.sugarProfileDelta },
  { key: 'sucrose', label: 'sucrose', unit: '%', current: (v) => toNum(v.sucrose), base: (q) => q.sugarProfile?.sucrose, tol: DRIFT.sugarProfileDelta },
  { key: 'isotope', label: 'isotope_ratio', unit: 'C4 ‰', current: (v) => toNum(v.isotope), base: (q) => q.isotopeRatio ?? undefined, tol: DRIFT.isotopeDelta },
];

function toNum(s: string | undefined): number | undefined {
  if (s === undefined || s === '') return undefined;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : undefined;
}

export function QcForm({
  stage,
  batchId,
  intakeHint,
  onDone,
}: {
  stage: 'INTAKE' | 'OUTPUT';
  batchId: string;
  intakeHint?: QualityTest;
  onDone: (r: QualityResponse) => void;
}) {
  const [v, setV] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const outcomeHint = (f: Field) => {
    if (stage !== 'OUTPUT' || !intakeHint) return undefined;
    const cur = f.current(v);
    const base = f.base(intakeHint);
    if (cur === undefined || base === undefined) return undefined;
    const delta = cur - base;
    const over = Math.abs(delta) > f.tol;
    return `${base} → ${cur} (Δ ${delta >= 0 ? '+' : ''}${delta.toFixed(2)})${over ? ' — over tolerance' : ''}`;
  };

  const submit = async () => {
    const moisture = toNum(v.moisture);
    const hmf = toNum(v.hmf);
    const diastase = toNum(v.diastase);
    const fructose = toNum(v.fructose);
    const glucose = toNum(v.glucose);
    const sucrose = toNum(v.sucrose);
    const isotope = toNum(v.isotope);
    const missing = FIELDS.filter((f) => f.current(v) === undefined).map((f) => f.key);
    if (missing.length) {
      setErr(`Enter numeric values for: ${missing.join(', ')}`);
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const res = await recordQualityTest(batchId, {
        stage,
        moisture: moisture!,
        hmf: hmf!,
        diastase: diastase!,
        fructose: fructose!,
        glucose: glucose!,
        sucrose: sucrose!,
        isotopeRatio: isotope!,
      });
      onDone(res);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ gap: 12 }}>
      {FIELDS.map((f) => (
        <NeuInput
          key={f.key}
          label={f.label}
          hint={[f.unit, outcomeHint(f)].filter(Boolean).join(' · ') || undefined}
          value={v[f.key]}
          onChangeText={(s) => setV((old) => ({ ...old, [f.key]: s }))}
          keyboardType="decimal-pad"
          placeholder="0.0"
          placeholderTextColor={palette.muted}
        />
      ))}
      <ErrorNote message={err ?? undefined} />
      <NeuButton title={`Submit ${stage} test`} onPress={submit} loading={busy} />
    </View>
  );
}