import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, SegmentedButtons, Text } from 'react-native-paper';

import { SensorLineChart } from '@/components/charts/sensor-line-chart';
import { AsyncState } from '@/components/ui/async-state';
import { AiAnalysis } from '@/components/ai-analysis';
import { Neumorph } from '@/components/ui/neumorph';
import { Screen } from '@/components/ui/screen';
import { StatusBadge } from '@/components/status/badge';
import { getPalette, statusColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHiveAnalysis, useHiveLive, useReadings } from '@/hooks/use-queries';
import type { ReadingRange } from '@/lib/types';

export default function HiveDetailScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [range, setRange] = useState<ReadingRange>('day');

  const hiveQuery = useHiveLive(id ?? '');
  const readingsQuery = useReadings(id ?? '', range);
  const analysisQuery = useHiveAnalysis(id ?? '');
  const { data: hive } = hiveQuery;
  const { data: readings, isLoading } = readingsQuery;

  const sc = statusColors(c);
  const statusColor = hive?.status === 'NORMAL' ? sc.healthy : hive?.status === 'WATCH' ? sc.watch : hive?.status === 'ALERT' ? sc.alert : c.muted;

  if (!hive) return <Screen><AsyncState loading={hiveQuery.isLoading} error={hiveQuery.error} empty emptyMessage="Hive not found." onRetry={() => hiveQuery.refetch()} /></Screen>;

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
        {hive.apiary ? `${hive.apiary} · ` : ''}Sensor {hive.hive_id}
      </Text>

      {hive.lastReading && (
        <Neumorph style={{ borderRadius: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <LiveMetric label="Battery" value={formatMetric(hive.lastReading.battery, 2, ' V')} />
            <LiveMetric label="Temp" value={formatMetric(hive.lastReading.temperature, 1, '°C')} />
            <LiveMetric label="Humidity" value={formatMetric(hive.lastReading.humidity, 0, '%')} />
            <LiveMetric label="Weight" value={formatMetric(hive.lastReading.weight, 1, ' kg')} />
          </View>
          <Text variant="labelSmall" style={{ color: isStale(hive.lastReading.ts) ? c.darkAccent : c.muted, marginTop: 10 }}>
            {isStale(hive.lastReading.ts) ? 'Stale reading' : 'Fresh reading'} · {new Date(hive.lastReading.ts).toLocaleString()}
          </Text>
        </Neumorph>
      )}
      {!hive.lastReading ? <Text style={{ color: c.muted, marginBottom: 16 }}>No live sensor reading has been received for this hive.</Text> : null}

      {hive.assessment ? (
        <Neumorph style={{ borderRadius: 20, marginBottom: 16 }}>
          <Text variant="titleMedium" style={{ color: c.primaryDark, fontWeight: '700' }}>Sensor assessment</Text>
          <Text variant="labelSmall" style={{ color: c.muted, marginTop: 3 }}>
            Data quality {hive.assessment.dataQuality.label.toLowerCase()} · {hive.assessment.modelVersion}
          </Text>
          {hive.assessment.telemetryConditionScore != null ? <Text style={{ color: c.primaryDark, marginTop: 10 }}>Telemetry condition {hive.assessment.telemetryConditionScore}/100</Text> : null}
          {hive.assessment.reasons.map((reason) => <Text key={reason.code} style={{ color: c.darkAccent, marginTop: 8 }}>• {reason.message}</Text>)}
          {hive.assessment.recommendations.map((recommendation) => <Text key={recommendation} style={{ color: c.primaryDark, marginTop: 6 }}>Action: {recommendation}</Text>)}
          <Text variant="labelSmall" style={{ color: c.muted, marginTop: 12 }}>{hive.assessment.limitations[0]}</Text>
        </Neumorph>
      ) : null}

      <AiAnalysis
        analysis={analysisQuery.data}
        isLoading={analysisQuery.isLoading}
        error={analysisQuery.error}
        onRetry={() => analysisQuery.refetch()}
      />

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

      {isLoading || readingsQuery.error ? (
        <AsyncState loading={isLoading} error={readingsQuery.error} emptyMessage="No readings in this range." onRetry={() => readingsQuery.refetch()} />
      ) : (
        <Neumorph style={{ borderRadius: 20, marginBottom: 14 }}>
          <SensorLineChart points={points} metric="temperature" color={c.accent} label="Temperature" suffix="°C" />
        </Neumorph>
      )}

      {!isLoading && (
        <>
          <Neumorph style={{ borderRadius: 20, marginBottom: 14 }}>
            <SensorLineChart points={points} metric="humidity" color={c.accentBright} label="Humidity" suffix="%" decimals={0} />
          </Neumorph>
          <Neumorph style={{ borderRadius: 20, marginBottom: 14 }}>
            <SensorLineChart points={points} metric="weight" color={c.primaryDark} label="Weight" suffix=" kg" />
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

function isStale(ts: string) {
  const time = new Date(ts).getTime();
  return !Number.isFinite(time) || Date.now() - time > 30 * 60 * 1000;
}

function formatMetric(value: number | undefined, decimals: number, suffix: string) {
  return value == null ? 'Unavailable' : `${value.toFixed(decimals)}${suffix}`;
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
