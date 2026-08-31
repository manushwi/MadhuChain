import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Chip, Text } from 'react-native-paper';

import { Neumorph } from '@/components/ui/neumorph';
import { AsyncState } from '@/components/ui/async-state';
import { Screen } from '@/components/ui/screen';
import { getPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAckAlert, useAlerts, useHives } from '@/hooks/use-queries';
import type { Alert, AlertType } from '@/lib/types';

const alertIcon: Record<AlertType, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  SUDDEN_WEIGHT_DROP: 'scale-bathroom',
  INTERNAL_TEMPERATURE_OUT_OF_BAND: 'thermometer-alert',
  INTERNAL_HUMIDITY_OUT_OF_BAND: 'water-alert',
  LOW_BATTERY: 'battery-alert-variant-outline',
  TELEMETRY_STALE: 'access-point-off',
  UNKNOWN: 'alert-circle-outline',
};

const alertLabel: Record<AlertType, string> = {
  SUDDEN_WEIGHT_DROP: 'Sudden weight change',
  INTERNAL_TEMPERATURE_OUT_OF_BAND: 'Internal temperature',
  INTERNAL_HUMIDITY_OUT_OF_BAND: 'Internal humidity',
  LOW_BATTERY: 'Low battery',
  TELEMETRY_STALE: 'Telemetry stale',
  UNKNOWN: 'Sensor alert',
};

export default function AlertsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const alertsQuery = useAlerts();
  const { data: alerts } = alertsQuery;
  const { data: hives } = useHives();
  const ack = useAckAlert();
  const [filter, setFilter] = useState<'active' | 'all' | Alert['severity']>('active');
  const filtered = (alerts ?? [])
    .filter((alert) => filter === 'all' || (filter === 'active' ? !alert.acknowledged : alert.severity === filter))
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity));

  return (
    <Screen scroll={false}>
      <Text variant="headlineSmall" style={{ color: c.darkAccent, fontWeight: '700', marginTop: 8, marginBottom: 16 }}>
        Alerts
      </Text>
      <View style={styles.filters} accessibilityLabel="Alert filters">
        {(['active', 'high', 'medium', 'low', 'all'] as const).map((value) => (
          <Chip key={value} compact selected={filter === value} onPress={() => setFilter(value)}>{value[0].toUpperCase() + value.slice(1)}</Chip>
        ))}
      </View>
      {ack.error ? <Text accessibilityRole="alert" style={{ color: c.darkAccent, marginBottom: 8 }}>{ack.error.message}</Text> : null}

      <FlatList
        data={filtered}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <AlertRow
            alert={item}
            onAck={() => ack.mutate(item.id)}
            ackLoading={ack.isPending && ack.variables === item.id}
            onHive={() => {
              const hive = hives?.find((candidate) => candidate.id === item.hive_id || candidate.hive_id === item.hive_id);
              if (hive) router.push(`/hive/${hive.id}`);
            }}
            canOpenHive={!!hives?.some((candidate) => candidate.id === item.hive_id || candidate.hive_id === item.hive_id)}
          />
        )}
        ListEmptyComponent={<AsyncState loading={alertsQuery.isLoading} error={alertsQuery.error} empty emptyMessage={filter === 'active' ? 'No active alerts.' : 'No alerts match this filter.'} onRetry={() => alertsQuery.refetch()} />}
      />
    </Screen>
  );
}

function AlertRow({ alert, onAck, ackLoading, onHive, canOpenHive }: { alert: Alert; onAck: () => void; ackLoading: boolean; onHive: () => void; canOpenHive: boolean }) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const color = alert.severity === 'high' ? c.darkAccent : alert.severity === 'medium' ? c.accent : c.sand;

  return (
    <Neumorph style={[styles.row, alert.acknowledged ? { opacity: 0.55 } : undefined]}>
      <View style={[styles.iconBox, { backgroundColor: c.surfaceAlt }]}>
        <MaterialCommunityIcons name={alertIcon[alert.type]} size={24} color={color} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text variant="labelLarge" style={{ color }}>{alertLabel[alert.type]}</Text>
          <Text variant="labelSmall" style={{ color: c.muted }}>
            {new Date(alert.created_at).toLocaleDateString()}
          </Text>
        </View>
        <Text variant="bodySmall" style={{ color: c.primaryDark }}>{alert.message}</Text>
        <Button mode="text" compact disabled={!canOpenHive} onPress={onHive} accessibilityLabel={`Open hive ${alert.hive_id}`}>Hive {alert.hive_id}</Button>
      </View>
      {!alert.acknowledged && (
        <Button mode="text" textColor={c.accent} compact onPress={onAck} loading={ackLoading} disabled={ackLoading}>
          Acknowledge
        </Button>
      )}
    </Neumorph>
  );
}

const severityRank = (severity: Alert['severity']) => ({ low: 1, medium: 2, high: 3 })[severity];

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, marginBottom: 12, paddingVertical: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
});
