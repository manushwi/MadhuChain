import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons, Text, TextInput } from 'react-native-paper';

import HiveMap from '@/components/hive-map';
import { Neumorph } from '@/components/ui/neumorph';
import { Screen } from '@/components/ui/screen';
import { StatusBadge } from '@/components/status/badge';
import { getPalette, statusColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCreateHive, useHives } from '@/hooks/use-queries';
import type { Hive } from '@/lib/types';

export default function HivesScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const params = useLocalSearchParams<{ register?: string }>();
  const { data: hives } = useHives();

  const [mode, setMode] = useState<'list' | 'map'>('list');
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    if (params.register === '1') {
      setRegisterOpen(true);
      router.setParams({});
    }
  }, [params.register]);

  return (
    <Screen scroll={false}>
      <View style={styles.headerRow}>
        <Text variant="headlineSmall" style={{ color: c.darkAccent, fontWeight: '700' }}>
          My Hives
        </Text>
        <Button mode="contained" buttonColor={c.accent} textColor={c.highlight} onPress={() => setRegisterOpen(true)} compact>
          + Register
        </Button>
      </View>

      <SegmentedButtons
        value={mode}
        onValueChange={(v) => setMode(v as 'list' | 'map')}
        buttons={[
          { value: 'list', icon: 'format-list-bulleted', label: 'List' },
          { value: 'map', icon: 'map-outline', label: 'Map' },
        ]}
        style={styles.segmented}
      />

      {mode === 'list' ? (
        <FlatList
          data={hives ?? []}
          keyExtractor={(h) => h.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <HiveRow hive={item} />}
          ListEmptyComponent={<Text style={{ color: c.muted, textAlign: 'center', marginTop: 40 }}>No hives registered yet.</Text>}
        />
        ) : (
          <HiveMap hives={hives ?? []} onSelect={(id) => router.push(`/hive/${id}`)} />
        )}

      {registerOpen && <RegisterHive onClose={() => setRegisterOpen(false)} />}
    </Screen>
  );
}

function HiveRow({ hive }: { hive: Hive }) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const sc = statusColors(c);
  const color = hive.status === 'HEALTHY' ? sc.healthy : hive.status === 'WATCH' ? sc.watch : sc.alert;

  return (
    <Pressable onPress={() => router.push(`/hive/${hive.id}`)}>
      {({ pressed }) => (
        <Neumorph style={[styles.hiveRow, pressed ? { opacity: 0.85 } : undefined]}>
          <View style={styles.hiveRowTop}>
            <Text variant="titleMedium" style={{ color: c.primaryDark }}>
              {hive.name}
            </Text>
            <StatusBadge label={hive.status} color={color} />
          </View>
          <Text variant="bodySmall" style={styles.mutedText}>
            {hive.apiary}
          </Text>
          {hive.lastReading && (
            <View style={styles.readings}>
              <Reading icon="thermometer" value={`${hive.lastReading.temperature.toFixed(1)}°C`} />
              <Reading icon="water-outline" value={`${hive.lastReading.humidity.toFixed(0)}%`} />
              <Reading icon="weight-kilogram" value={`${hive.lastReading.weight.toFixed(1)} kg`} />
              <Reading icon="battery" value={`${hive.lastReading.battery.toFixed(0)}%`} />
            </View>
          )}
        </Neumorph>
      )}
    </Pressable>
  );
}

function Reading({ icon, value }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; value: string }) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <MaterialCommunityIcons name={icon} size={15} color={c.accent} />
      <Text variant="labelSmall" style={{ color: c.muted }}>{value}</Text>
    </View>
  );
}

function RegisterHive({ onClose }: { onClose: () => void }) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const create = useCreateHive();
  const [hiveId, setHiveId] = useState('');
  const [name, setName] = useState('');

  const submit = async () => {
    if (!hiveId || !name) return;
    await create.mutateAsync({
      hive_id: hiveId,
      name,
      location: { latitude: 12.9716, longitude: 77.5946 },
    });
    onClose();
  };

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
      <Neumorph style={styles.registerCard}>
        <Text variant="titleLarge" style={{ color: c.darkAccent, fontWeight: '700', marginBottom: 12 }}>
          Register New Hive
        </Text>
        <TextInput mode="outlined" label="Sensor node ID (hive_id)" value={hiveId} onChangeText={setHiveId} style={styles.input} activeOutlineColor={c.accent} />
        <TextInput mode="outlined" label="Hive name" value={name} onChangeText={setName} style={styles.input} activeOutlineColor={c.accent} />
        <View style={styles.registerActions}>
          <Button mode="text" textColor={c.muted} onPress={onClose}>Cancel</Button>
          <Button mode="contained" buttonColor={c.accent} textColor={c.highlight} onPress={submit} loading={create.isPending}>
            Register
          </Button>
        </View>
      </Neumorph>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
  segmented: { marginBottom: 16 },
  hiveRow: { marginBottom: 14, borderRadius: 20 },
  hiveRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  mutedText: { color: getPalette('light').muted, marginBottom: 8 },
  readings: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 10 },
  registerCard: { width: '100%', borderRadius: 22 },
  input: { marginBottom: 10, backgroundColor: 'transparent' },
  registerActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
});
