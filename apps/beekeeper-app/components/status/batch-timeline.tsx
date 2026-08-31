import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { getPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { BatchLifecycleState } from '@/lib/types';

const steps: { state: BatchLifecycleState; label: string }[] = [
  { state: 'HARVESTED', label: 'Harvested' },
  { state: 'COLLECTED', label: 'Collected' },
  { state: 'LAB_APPROVED', label: 'Intake approved' },
  { state: 'PROCESSED', label: 'Processed' },
  { state: 'OUTPUT_APPROVED', label: 'Output approved' },
  { state: 'FINAL_QC', label: 'Final QC' },
  { state: 'RELEASED', label: 'Released' },
];

export function BatchTimeline({ state }: { state: BatchLifecycleState }) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const exceptional =
    state === 'FLAGGED' ||
    state === 'COLLECTION_REJECTED' ||
    state === 'LAB_REJECTED' ||
    state === 'REVOKED';
  const current = exceptional ? -1 : steps.findIndex((step) => step.state === state);

  return (
    <View accessibilityLabel={`Batch lifecycle: ${state}`}>
      {steps.map((step, index) => {
        const complete = current >= index;
        return (
          <View key={step.state} style={styles.row}>
            <MaterialCommunityIcons
              name={complete ? 'check-circle' : 'circle-outline'}
              size={20}
              color={complete ? c.accent : c.muted}
            />
            <Text style={{ color: complete ? c.primaryDark : c.muted }}>{step.label}</Text>
          </View>
        );
      })}
      {exceptional ? (
        <View style={styles.row}>
          <MaterialCommunityIcons name="alert-circle" size={20} color={c.darkAccent} />
          <Text style={{ color: c.darkAccent, fontWeight: '700' }}>{state}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 } });
