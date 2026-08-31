import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import type { Hive } from '@/lib/types';

interface HiveMapProps {
  hives: Hive[];
  onSelect: (id: string) => void;
}

export default function HiveMap({ hives, onSelect }: HiveMapProps) {
  const located = hives.filter((h): h is Hive & { location: NonNullable<Hive['location']> } => !!h.location);
  const region =
    located.length > 0
      ? {
          latitude: located[0].location.latitude,
          longitude: located[0].location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : undefined;

  return (
    <MapView style={styles.map} region={region}>
      {located.map((h) => (
        <Marker
          key={h.id}
          coordinate={h.location}
          title={h.name}
          onPress={() => onSelect(h.id)}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, borderRadius: 20 },
});
