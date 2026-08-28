import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import type { Hive } from '@/lib/types';

interface HiveMapProps {
  hives: Hive[];
  onSelect: (id: string) => void;
}

export default function HiveMap({ hives, onSelect }: HiveMapProps) {
  const region =
    hives.length > 0
      ? {
          latitude: hives[0].location.latitude,
          longitude: hives[0].location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : { latitude: 12.9716, longitude: 77.5946, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  return (
    <MapView style={styles.map} region={region}>
      {hives.map((h) => (
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
