import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { Neumorph } from '@/components/ui/neumorph';
import { Screen } from '@/components/ui/screen';
import { getPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAlerts, useBatches, useHives, useProfile } from '@/hooks/use-queries';
import type { BatchStatus } from '@/lib/types';

const inProgressStatuses: BatchStatus[] = ['MINTED', 'IN TRANSIT', 'AT FACTORY', 'PROCESSING'];

export default function DashboardScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);

  const { data: profile } = useProfile();
  const { data: hives } = useHives();
  const { data: alerts } = useAlerts();
  const { data: batches } = useBatches();

  const activeAlerts = alerts?.filter((a) => !a.acknowledged) ?? [];
  const inProgress = batches?.filter((b) => inProgressStatuses.includes(b.status)) ?? [];

  return (
    <Screen>
      <Text variant="headlineMedium" style={[styles.greeting, { color: c.darkAccent }]}>
        Hello, {profile?.name?.split(' ')[0] ?? 'Beekeeper'}
      </Text>
      <Text variant="bodyMedium" style={{ color: c.muted, marginBottom: 20 }}>
        {profile?.apiary_name ?? 'Your apiary'}
      </Text>

      <View style={styles.grid}>
        <StatCard
          icon="hexagon-multiple-outline"
          label="Total Hives"
          value={hives?.length ?? '–'}
          color={c.accent}
        />
        <StatCard
          icon="bell-outline"
          label="Active Alerts"
          value={activeAlerts.length}
          color={activeAlerts.length > 0 ? c.darkAccent : c.accent}
        />
        <StatCard
          icon="package-variant-closed"
          label="Batches"
          value={batches?.length ?? '–'}
          color={c.sand}
        />
        <StatCard
          icon="progress-clock"
          label="In Progress"
          value={inProgress.length}
          color={c.accentBright}
        />
      </View>

      <Text variant="titleMedium" style={[styles.sectionTitle, { color: c.primaryDark }]}>
        Quick Actions
      </Text>
      <View style={styles.actions}>
        <ActionCard icon="barcode-scan" label="New Harvest" color={c.accent} onPress={() => router.push('/harvest/new')} />
        <ActionCard icon="plus-circle-outline" label="Register Hive" color={c.primaryDark} onPress={() => router.push('/hives?register=1')} />
        <ActionCard icon="bell-ring-outline" label="View Alerts" color={c.darkAccent} onPress={() => router.push('/alerts')} />
      </View>
    </Screen>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <Neumorph style={styles.statCard}>
      <MaterialCommunityIcons name={icon} size={26} color={color} />
      <Text variant="headlineSmall" style={{ color }}>
        {value}
      </Text>
      <Text variant="labelMedium" style={{ color: getPalette('light').muted }}>
        {label}
      </Text>
    </Neumorph>
  );
}

function ActionCard({
  icon,
  label,
  color,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  color: string;
  onPress: () => void;
}) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  return (
    <Neumorph style={styles.actionCard}>
      <MaterialCommunityIcons name={icon} size={34} color={color} style={styles.actionIcon} />
      <Text variant="labelLarge" style={{ color: c.primaryDark, textAlign: 'center' }}>
        {label}
      </Text>
    </Neumorph>
  );
}

const styles = StyleSheet.create({
  greeting: { fontWeight: '700', marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 },
  statCard: { width: '48%', borderRadius: 20 },
  sectionTitle: { marginTop: 24, marginBottom: 12, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12 },
  actionCard: { flex: 1, borderRadius: 20, alignItems: 'center' },
  actionIcon: { marginBottom: 8 },
});
