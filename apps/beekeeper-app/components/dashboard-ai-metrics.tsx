import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { Neumorph } from '@/components/ui/neumorph';
import { getPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Hive } from '@/lib/types';

interface DashboardAiMetricsProps {
  hives: Hive[];
  analysisByHive: Record<string, { healthScore: number | null; diseasePest: number; abnormal: boolean; llmGenerated: boolean; llmSummary?: string }> | undefined;
  isLoading?: boolean;
}

export function DashboardAiMetrics({ hives, analysisByHive, isLoading }: DashboardAiMetricsProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);

  if (!hives.length) return null;

  const cards = hives
    .map((h) => {
      const a = analysisByHive?.[h.id];
      return { hive: h, a };
    })
    .filter((x) => x.a);

  if (isLoading && !analysisByHive) {
    return (
      <Neumorph style={styles.card}>
        <View style={styles.headerRow}>
          <MaterialCommunityIcons name="bee-flower" size={20} color={c.accent} />
          <Text variant="titleMedium" style={{ color: c.primaryDark, fontWeight: '700' }}>AI Analysis</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <ActivityIndicator color={c.accent} size="small" />
          <Text variant="bodySmall" style={{ color: c.muted }}>Analysing hive health…</Text>
        </View>
      </Neumorph>
    );
  }

  if (!cards.length) return null;

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: c.primaryDark }]}>
        AI Analysis
      </Text>
      {cards.map(({ hive, a }) => {
        const risk = a!.diseasePest;
        const riskColor = risk >= 50 ? c.darkAccent : risk >= 25 ? c.accent : c.accentBright;
        return (
          <Pressable key={hive.id} onPress={() => router.push(`/hive/${hive.id}`)}>
            {({ pressed }) => (
              <Neumorph style={[styles.card, pressed ? { opacity: 0.85 } : undefined]}>
                <View style={styles.headerRow}>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleSmall" style={{ color: c.darkAccent, fontWeight: '700' }}>{hive.name}</Text>
                    <Text variant="labelSmall" style={{ color: c.muted }}>Sensor {hive.hive_id}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={22} color={c.muted} />
                </View>

                <View style={styles.metricsRow}>
                  <Metric label="Health" value={a!.healthScore != null ? `${a!.healthScore}` : 'n/a'} color={c.primaryDark} />
                  <Metric label="Disease risk" value={`${risk}`} color={riskColor} />
                  <Metric
                    label="Status"
                    value={a!.llmGenerated && a!.llmSummary ? 'AI reviewed' : a!.abnormal ? 'Abnormal' : 'Normal'}
                    color={a!.abnormal ? c.darkAccent : c.accentBright}
                  />
                </View>

                {a!.llmGenerated && a!.llmSummary ? (
                  <Text variant="bodySmall" style={{ color: c.muted, marginTop: 8 }} numberOfLines={3}>
                    {a!.llmSummary}
                  </Text>
                ) : a!.abnormal ? (
                  <Text variant="bodySmall" style={{ color: c.darkAccent, marginTop: 8 }}>
                    Outside normal range — view for full AI disease analysis.
                  </Text>
                ) : (
                  <Text variant="labelSmall" style={{ color: c.accentBright, marginTop: 8 }}>
                    Within normal range.
                  </Text>
                )}
              </Neumorph>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text variant="titleSmall" style={{ color }}>{value}</Text>
      <Text variant="labelSmall" style={{ color: getPalette('light').muted }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 4 },
  sectionTitle: { marginTop: 20, marginBottom: 10, fontWeight: '600' },
  card: { borderRadius: 20, padding: 14, marginBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricsRow: { flexDirection: 'row', marginTop: 12 },
});
