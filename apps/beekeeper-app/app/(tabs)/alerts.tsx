import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { Neumorph } from '@/components/ui/neumorph';
import { Screen } from '@/components/ui/screen';
import { getPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAckAlert, useAlerts } from '@/hooks/use-queries';
import type { Alert, AlertType } from '@/lib/types';

const alertIcon: Record<AlertType, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  WEIGHT_DROP: 'scale-bathroom',
  BROOD_TEMP: 'thermometer-alert',
  LOW_BATTERY: 'battery-alert-variant-outline',
  SWARMING: 'bee',
};

const alertLabel: Record<AlertType, string> = {
  WEIGHT_DROP: 'Weight drop',
  BROOD_TEMP: 'Brood temperature',
  LOW_BATTERY: 'Low battery',
  SWARMING: 'Swarming',
};

export default function AlertsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const { data: alerts } = useAlerts();
  const ack = useAckAlert();

  return (
    <Screen>
      <Text variant="headlineSmall" style={{ color: c.darkAccent, fontWeight: '700', marginTop: 8, marginBottom: 16 }}>
        Alerts
      </Text>

      <FlatList
        data={alerts ?? []}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <AlertRow alert={item} onAck={() => ack.mutate(item.id)} ackLoading={ack.isPending} />
        )}
        ListEmptyComponent={<Text style={{ color: c.muted, textAlign: 'center', marginTop: 40 }}>No alerts right now.</Text>}
      />
    </Screen>
  );
}

function AlertRow({ alert, onAck, ackLoading }: { alert: Alert; onAck: () => void; ackLoading: boolean }) {
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
        <Text variant="labelSmall" style={{ color: c.muted }}>Hive {alert.hive_id}</Text>
      </View>
      {!alert.acknowledged && (
        <Button mode="text" textColor={c.accent} compact onPress={onAck} loading={ackLoading}>
          Acknowledge
        </Button>
      )}
    </Neumorph>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, marginBottom: 12, paddingVertical: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
