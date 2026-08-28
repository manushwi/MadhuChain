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
  const { data: hives } = useHives();
  const mint = useMintBatch();

  const [selected, setSelected] = useState<string[]>([]);
  const [start, setStart] = useState(() => today());
  const [end, setEnd] = useState(() => today());
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hive && !selected.includes(hive)) {
      setSelected((s) => (s.includes(hive) ? s : [...s, hive]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hive]);

  const toggle = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const submit = async () => {
    if (selected.length === 0) {
      setError('Select at least one hive.');
      return;
    }
    const weightKg = Number(weight);
    if (!weightKg || weightKg <= 0) {
      setError('Enter a valid collected weight.');
      return;
    }
    setError(null);
    try {
      const res = await mint.mutateAsync({
        hive_ids: selected,
        harvest_start: start,
        harvest_end: end,
        weight_kg: weightKg,
        note: note || undefined,
      });
      router.replace({ pathname: '/harvest/[batchId]', params: { batchId: res.batch_id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Minting failed.');
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

      <Text variant="labelLarge" style={{ color: c.primaryDark, marginBottom: 8 }}>Hive(s)</Text>
      <View style={styles.chips}>
        {(hives ?? []).map((h) => (
          <Chip
            key={h.id}
            selected={selected.includes(h.id)}
            onPress={() => toggle(h.id)}
            selectedColor={c.highlight}
            style={selected.includes(h.id) ? { backgroundColor: c.accent } : { backgroundColor: c.surfaceAlt }}>
            {h.name}
          </Chip>
        ))}
      </View>

      <View style={styles.dateRow}>
        <TextInput mode="outlined" label="Harvest start" value={start} onChangeText={setStart} placeholder="YYYY-MM-DD" style={styles.dateInput} activeOutlineColor={c.accent} />
        <TextInput mode="outlined" label="Harvest end" value={end} onChangeText={setEnd} placeholder="YYYY-MM-DD" style={styles.dateInput} activeOutlineColor={c.accent} />
      </View>

      <TextInput
        mode="outlined"
        label="Collected weight (kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        style={styles.input}
        activeOutlineColor={c.accent}
      />
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
        onPress={submit}
        loading={mint.isPending}
        icon="barcode-scan">
        Mint Batch & Generate Barcode
      </Button>
    </Screen>
  );
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateInput: { flex: 1, marginBottom: 12, backgroundColor: 'transparent' },
  input: { marginBottom: 12, backgroundColor: 'transparent' },
  submit: { marginTop: 16, borderRadius: 14 },
});
