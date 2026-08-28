import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, SegmentedButtons, Text } from 'react-native-paper';

import { SensorLineChart } from '@/components/charts/sensor-line-chart';
import { Neumorph } from '@/components/ui/neumorph';
import { Screen } from '@/components/ui/screen';
import { StatusBadge } from '@/components/status/badge';
import { getPalette, statusColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHiveLive, useReadings } from '@/hooks/use-queries';
import type { ReadingRange } from '@/lib/types';

export default function HiveDetailScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [range, setRange] = useState<ReadingRange>('day');

  const { data: hive } = useHiveLive(id ?? '');
  const { data: readings, isLoading } = useReadings(id ?? '', range);

  const sc = statusColors(c);
  const statusColor = hive?.status === 'HEALTHY' ? sc.healthy : hive?.status === 'WATCH' ? sc.watch : sc.alert;

  if (!hive) return <Screen><Text style={{ color: c.muted }}>Loading hive…</Text></Screen>;

  const points = readings ?? [];

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text variant="headlineSmall" style={{ color: c.darkAccent, fontWeight: '700' }}>
          {hive.name}
        </Text>
        {hive.status && <StatusBadge label={hive.status} color={statusColor} />}
      </View>
      <Text variant="bodyMedium" style={{ color: c.muted, marginBottom: 16 }}>
        {hive.apiary} · Sensor {hive.hive_id}
      </Text>

      {hive.lastReading && (
        <Neumorph style={{ borderRadius: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <LiveMetric label="Battery" value={`${hive.lastReading.battery.toFixed(0)}%`} />
            <LiveMetric label="Temp" value={`${hive.lastReading.temperature.toFixed(1)}°C`} />
            <LiveMetric label="Humidity" value={`${hive.lastReading.humidity.toFixed(0)}%`} />
            <LiveMetric label="Weight" value={`${hive.lastReading.weight.toFixed(1)} kg`} />
          </View>
        </Neumorph>
      )}

      <SegmentedButtons
        value={range}
        onValueChange={(v) => setRange(v as ReadingRange)}
        buttons={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
        ]}
        style={{ marginBottom: 20 }}
      />

      {isLoading ? (
        <Text style={{ color: c.muted }}>Loading readings…</Text>
      ) : (
        <Neumorph style={{ borderRadius: 20, marginBottom: 14 }}>
          <SensorLineChart points={points} color={c.accent} label="Temperature" suffix="°C" />
        </Neumorph>
      )}

      {!isLoading && (
        <>
          <Neumorph style={{ borderRadius: 20, marginBottom: 14 }}>
            <SensorLineChart points={points.map((p) => ({ ...p, weight: p.humidity }))} color={c.accentBright} label="Humidity" suffix="%" decimals={0} />
          </Neumorph>
          <Neumorph style={{ borderRadius: 20, marginBottom: 14 }}>
            <SensorLineChart points={points} color={c.primaryDark} label="Weight" suffix=" kg" />
          </Neumorph>
        </>
      )}

      <Button
        mode="contained"
        buttonColor={c.accent}
        textColor={c.highlight}
        style={{ marginTop: 4, borderRadius: 14 }}
        onPress={() => router.push(`/harvest/new?hive=${hive.id}`)}>
        Record Harvest
      </Button>
    </Screen>
  );
}

function LiveMetric({ label, value }: { label: string; value: string }) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  return (
    <View style={{ alignItems: 'center' }}>
      <Text variant="titleMedium" style={{ color: c.primaryDark }}>{value}</Text>
      <Text variant="labelSmall" style={{ color: c.muted }}>{label}</Text>
    </View>
  );
}
