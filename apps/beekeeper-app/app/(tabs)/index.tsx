import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { Neumorph } from '@/components/ui/neumorph';
import { AsyncState } from '@/components/ui/async-state';
import { DashboardAiMetrics } from '@/components/dashboard-ai-metrics';
import { Screen } from '@/components/ui/screen';
import { getPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAlerts, useBatches, useHives, useHivesAnalysis, useProfile } from '@/hooks/use-queries';
import type { BatchStatus } from '@/lib/types';

const inProgressStatuses: BatchStatus[] = ['MINTED', 'IN TRANSIT', 'AT FACTORY', 'PROCESSING'];

export default function DashboardScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);

  const profileQuery = useProfile();
  const hivesQuery = useHives();
  const alertsQuery = useAlerts();
  const batchesQuery = useBatches();
  const profile = profileQuery.data;
  const hives = hivesQuery.data;
  const alerts = alertsQuery.data;
  const batches = batchesQuery.data;
  const firstError = profileQuery.error ?? hivesQuery.error ?? alertsQuery.error ?? batchesQuery.error;
  const loading = profileQuery.isLoading || hivesQuery.isLoading || alertsQuery.isLoading || batchesQuery.isLoading;

  const hiveIds = (hives ?? []).map((h) => h.id);
  const analysesQuery = useHivesAnalysis(hiveIds);
  const analysisByHive = analysesQuery.data
    ? Object.fromEntries(
        Object.entries(analysesQuery.data).map(([id, a]) => [
          id,
          {
            healthScore: a.healthScore,
            diseasePest: a.riskScores.diseasePest,
            abnormal: a.abnormal,
            llmGenerated: a.llm.generated,
            llmSummary: a.llm.analysis?.summary,
          },
        ]),
      )
    : undefined;

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
      {firstError ? <AsyncState error={firstError} emptyMessage="Dashboard unavailable." onRetry={() => { profileQuery.refetch(); hivesQuery.refetch(); alertsQuery.refetch(); batchesQuery.refetch(); }} /> : null}
      {!firstError && loading ? <AsyncState loading emptyMessage="Loading dashboard." /> : null}

      <View style={styles.grid}>
        <StatCard
          icon="hexagon-multiple-outline"
          label="Total Hives"
          value={hives?.length ?? '–'}
          color={c.accent}
          onPress={() => router.push('/hives')}
        />
        <StatCard
          icon="bell-outline"
          label="Active Alerts"
          value={activeAlerts.length}
          color={activeAlerts.length > 0 ? c.darkAccent : c.accent}
          onPress={() => router.push('/alerts')}
        />
        <StatCard
          icon="package-variant-closed"
          label="Batches"
          value={batches?.length ?? '–'}
          color={c.sand}
          onPress={() => router.push('/harvest')}
        />
        <StatCard
          icon="progress-clock"
          label="In Progress"
          value={inProgress.length}
          color={c.accentBright}
          onPress={() => router.push('/harvest')}
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

      <DashboardAiMetrics hives={hives ?? []} analysisByHive={analysisByHive} isLoading={analysesQuery.isLoading} />
    </Screen>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: number | string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.statCard} onPress={onPress} accessibilityRole="button" accessibilityLabel={`Open ${label}`}>
    <Neumorph style={styles.statCardInner}>
      <MaterialCommunityIcons name={icon} size={26} color={color} />
      <Text variant="headlineSmall" style={{ color }}>
        {value}
      </Text>
      <Text variant="labelMedium" style={{ color: getPalette('light').muted }}>
        {label}
      </Text>
    </Neumorph>
    </Pressable>
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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ flex: 1 }, pressed ? { opacity: 0.85 } : undefined]}>
      <Neumorph style={styles.actionCard}>
        <MaterialCommunityIcons name={icon} size={34} color={color} style={styles.actionIcon} />
        <Text variant="labelLarge" style={{ color: c.primaryDark, textAlign: 'center' }}>
          {label}
        </Text>
      </Neumorph>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  greeting: { fontWeight: '700', marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 },
  statCard: { width: '48%' },
  statCardInner: { borderRadius: 20 },
  sectionTitle: { marginTop: 24, marginBottom: 12, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12 },
  actionCard: { flex: 1, borderRadius: 20, alignItems: 'center' },
  actionIcon: { marginBottom: 8 },
});
