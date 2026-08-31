import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import { getPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Hive } from '@/lib/types';

interface HiveMapProps {
  hives: Hive[];
  onSelect: (id: string) => void;
}

// Web-safe fallback: native map isn't available on web, so show a location list.
export default function HiveMap({ hives }: HiveMapProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);

  return (
    <View style={styles.container} testID="hive-map-fallback">
      <View style={styles.header}>
        <MaterialCommunityIcons name="map-outline" size={20} color={c.accent} />
        <Text variant="labelLarge" style={{ color: c.muted }}>
          Interactive map is available in the mobile app
        </Text>
      </View>
      {hives.filter((h) => h.location).map((h, i) => (
        <View key={h.id} style={styles.row}>
          <Text variant="bodySmall" style={{ color: c.primaryDark }}>
            {i + 1}. {h.name}
          </Text>
          <Text variant="labelSmall" style={{ color: c.muted }}>
            {h.location!.latitude.toFixed(4)}, {h.location!.longitude.toFixed(4)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEEE9', borderRadius: 20, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  row: { marginBottom: 10 },
});
