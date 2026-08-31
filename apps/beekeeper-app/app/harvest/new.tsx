import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, Text, TextInput } from 'react-native-paper';

import { Screen } from '@/components/ui/screen';
import { getPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHives, useMintBatch } from '@/hooks/use-queries';

export default function NewHarvestScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const { hive } = useLocalSearchParams<{ hive?: string }>();
  const { data: hives, isLoading: hivesLoading, error: hivesError, refetch } = useHives();
  const mint = useMintBatch();

  const [selected, setSelected] = useState<string[]>([]);
  const [start, setStart] = useState(() => daysAgo(1));
  const [end, setEnd] = useState(() => daysAgo(0));
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    if (hive) {
      // `hive` param is the DB id passed from the hive detail screen; convert
      // to the physical sensor hive_id before selecting.
      const h = (hives ?? []).find((x) => x.id === hive);
      const physical = h?.hive_id ?? hive;
      setSelected((s) => (s.includes(physical) ? s : [...s, physical]));
    }
    }, [hive, hives]);

  const toggle = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const validate = () => {
    if (selected.length === 0) {
      setError('Select at least one hive.');
      return false;
    }
    const weightKg = Number(weight);
    if (!weightKg || weightKg <= 0) {
      setError('Enter a valid collected weight.');
      return false;
    }
    if (!isDate(start) || !isDate(end)) {
      setError('Enter both dates as YYYY-MM-DD.');
      return false;
    }
    if (new Date(`${start}T00:00:00`).getTime() >= new Date(`${end}T23:59:59`).getTime()) {
      setError('Harvest start must be before harvest end.');
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (mint.isPending || !validate()) return;
    const weightKg = Number(weight);
    setError(null);
    try {
      const res = await mint.mutateAsync({
        hive_ids: selected,
        harvest_start: `${start}T00:00:00`,
        harvest_end: `${end}T23:59:59`,
        weight_kg: weightKg,
        note: note || undefined,
      });
      router.replace({ pathname: '/harvest/[batchId]', params: { batchId: res.batch_id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Minting failed.');
      setReviewing(false);
    }
  };

  return (
    <Screen>
      <Text variant="headlineSmall" style={{ color: c.darkAccent, fontWeight: '700', marginBottom: 4 }}>
        New Harvest
      </Text>
      <Text variant="bodyMedium" style={{ color: c.muted, marginBottom: 16 }}>
        Select hive(s) and weight to mint a raw batch with a barcode label.
      </Text>

      {reviewing ? (
        <View accessibilityLabel="Harvest review summary">
          <Text variant="titleMedium" style={{ color: c.primaryDark, marginBottom: 12 }}>Review harvest</Text>
          <Text style={{ color: c.muted }}>Hives: {selected.join(', ')}</Text>
          <Text style={{ color: c.muted }}>Sensor window: {start} to {end}</Text>
          <Text style={{ color: c.muted }}>Collected weight: {weight} kg</Text>
          {note ? <Text style={{ color: c.muted }}>Note: {note}</Text> : null}
        </View>
      ) : <>
      <Text variant="labelLarge" style={{ color: c.primaryDark, marginBottom: 8 }}>Hive(s)</Text>
      {hivesLoading ? <Text style={{ color: c.muted }}>Loading hives…</Text> : null}
      {hivesError ? <Button onPress={() => refetch()}>Could not load hives. Try again</Button> : null}
      <View style={styles.chips}>
        {(hives ?? []).map((h) => (
          <Chip
            key={h.id}
            selected={selected.includes(h.hive_id)}
            onPress={() => toggle(h.hive_id)}
            selectedColor={c.highlight}
            style={selected.includes(h.hive_id) ? { backgroundColor: c.accent } : { backgroundColor: c.surfaceAlt }}>
            {h.name}
          </Chip>
        ))}
      </View>

      <View style={styles.dateRow}>
        <TextInput mode="outlined" label="Harvest start" value={start} onChangeText={setStart} placeholder="YYYY-MM-DD" style={styles.dateInput} activeOutlineColor={c.accent} />
        <TextInput mode="outlined" label="Harvest end" value={end} onChangeText={setEnd} placeholder="YYYY-MM-DD" style={styles.dateInput} activeOutlineColor={c.accent} />
      </View>
      <Text variant="bodySmall" style={{ color: c.muted, marginBottom: 12 }}>
        This window must include sensor readings for every selected hive. Start must be before end.
      </Text>

      <TextInput
        mode="outlined"
        label="Collected weight (kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        style={styles.input}
        activeOutlineColor={c.accent}
      />
      </>}
      <TextInput
        mode="outlined"
        label="Note (optional)"
        value={note}
        onChangeText={setNote}
        multiline
        style={styles.input}
        activeOutlineColor={c.accent}
      />

      {error ? <Text variant="bodySmall" style={{ color: c.darkAccent }}>{error}</Text> : null}

      <Button
        mode="contained"
        buttonColor={c.accent}
        textColor={c.highlight}
        style={styles.submit}
        onPress={() => {
          if (!reviewing) {
            if (validate()) {
              setError(null);
              setReviewing(true);
            }
            return;
          }
          submit();
        }}
        disabled={mint.isPending || hivesLoading}
        loading={mint.isPending}
        icon="barcode-scan">
        {reviewing ? 'Confirm & Mint Batch' : 'Review Harvest'}
      </Button>
      {reviewing ? <Button onPress={() => setReviewing(false)} disabled={mint.isPending}>Edit details</Button> : null}
    </Screen>
  );
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const isDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.getFullYear() === Number(match[1]) && date.getMonth() === Number(match[2]) - 1 && date.getDate() === Number(match[3]);
};

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateInput: { flex: 1, marginBottom: 12, backgroundColor: 'transparent' },
  input: { marginBottom: 12, backgroundColor: 'transparent' },
  submit: { marginTop: 16, borderRadius: 14 },
});
