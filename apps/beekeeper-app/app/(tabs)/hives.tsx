import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons, Text, TextInput } from 'react-native-paper';

import HiveMap from '@/components/hive-map';
import { Neumorph } from '@/components/ui/neumorph';
import { Screen } from '@/components/ui/screen';
import { StatusBadge } from '@/components/status/badge';
import { AsyncState } from '@/components/ui/async-state';
import { getPalette, statusColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCreateHive, useHives } from '@/hooks/use-queries';
import type { Hive } from '@/lib/types';

export default function HivesScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const params = useLocalSearchParams<{ register?: string }>();
  const hivesQuery = useHives();
  const { data: hives } = hivesQuery;

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
          ListEmptyComponent={<AsyncState loading={hivesQuery.isLoading} error={hivesQuery.error} empty emptyMessage="No hives registered yet." onRetry={() => hivesQuery.refetch()} />}
        />
        ) : (
          hivesQuery.isLoading || hivesQuery.error ? <AsyncState loading={hivesQuery.isLoading} error={hivesQuery.error} emptyMessage="No mapped hives." onRetry={() => hivesQuery.refetch()} /> : <HiveMap hives={(hives ?? []).filter((h) => h.location)} onSelect={(id) => router.push(`/hive/${id}`)} />
        )}

      {registerOpen && <RegisterHive onClose={() => setRegisterOpen(false)} />}
    </Screen>
  );
}

function HiveRow({ hive }: { hive: Hive }) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const sc = statusColors(c);
  const color = hive.status === 'NORMAL' ? sc.healthy : hive.status === 'WATCH' ? sc.watch : hive.status === 'ALERT' ? sc.alert : c.muted;

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
            {hive.apiary || `Sensor ${hive.hive_id}`}
          </Text>
          {hive.lastReading && (
            <View style={styles.readings}>
              <Reading icon="thermometer" value={metric(hive.lastReading.temperature, 1, '°C')} />
              <Reading icon="water-outline" value={metric(hive.lastReading.humidity, 0, '%')} />
              <Reading icon="weight-kilogram" value={metric(hive.lastReading.weight, 1, ' kg')} />
              <Reading icon="battery" value={metric(hive.lastReading.battery, 2, ' V')} />
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
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!hiveId.trim() || !name.trim()) {
      setError('Sensor node ID and hive name are required.');
      return;
    }
    const hasCoordinates = latitude.trim() !== '' || longitude.trim() !== '';
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (hasCoordinates && (!latitude.trim() || !longitude.trim() || !Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180)) {
      setError('Enter both valid GPS coordinates, or leave both blank.');
      return;
    }
    setError(null);
    try {
      await create.mutateAsync({ hive_id: hiveId.trim(), name: name.trim(), location: hasCoordinates ? { latitude: lat, longitude: lng } : undefined });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hive registration failed.');
    }
  };

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
      <Neumorph style={styles.registerCard}>
        <Text variant="titleLarge" style={{ color: c.darkAccent, fontWeight: '700', marginBottom: 12 }}>
          Register New Hive
        </Text>
        <TextInput mode="outlined" label="Sensor node ID (hive_id)" value={hiveId} onChangeText={setHiveId} style={styles.input} activeOutlineColor={c.accent} />
        <TextInput mode="outlined" label="Hive name" value={name} onChangeText={setName} style={styles.input} activeOutlineColor={c.accent} />
        <View style={styles.coordinateRow}>
          <TextInput mode="outlined" label="Latitude (optional)" value={latitude} onChangeText={setLatitude} keyboardType="numbers-and-punctuation" style={[styles.input, styles.coordinate]} activeOutlineColor={c.accent} />
          <TextInput mode="outlined" label="Longitude (optional)" value={longitude} onChangeText={setLongitude} keyboardType="numbers-and-punctuation" style={[styles.input, styles.coordinate]} activeOutlineColor={c.accent} />
        </View>
        {error ? <Text accessibilityRole="alert" style={{ color: c.darkAccent }}>{error}</Text> : null}
        <View style={styles.registerActions}>
          <Button mode="text" textColor={c.muted} onPress={onClose} disabled={create.isPending}>Cancel</Button>
          <Button mode="contained" buttonColor={c.accent} textColor={c.highlight} onPress={submit} loading={create.isPending} disabled={create.isPending}>
            Register
          </Button>
        </View>
      </Neumorph>
    </View>
  );
}

const metric = (value: number | undefined, decimals: number, suffix: string) => value == null ? 'Unavailable' : `${value.toFixed(decimals)}${suffix}`;

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
  coordinateRow: { flexDirection: 'row', gap: 8 },
  coordinate: { flex: 1 },
});
