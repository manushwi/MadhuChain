import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BatchChainState } from '@/src/theme/primitives';
import { palette } from '@/src/theme/palette';
import { NeuCard, t } from '@/src/theme/primitives';

const STEPS: BatchChainState[] = ['HARVESTED', 'COLLECTED', 'LAB_APPROVED', 'PROCESSED', 'OUTPUT_APPROVED', 'RELEASED'];

export function Lifecycle({ state }: { state: BatchChainState }) {
  const current = STEPS.indexOf(state);
  return (
    <NeuCard sunken style={{ gap: 10 }}>
      <Text style={t.h3}>Lifecycle progress</Text>
      <View accessibilityLabel={`Batch lifecycle, current state ${state}`} style={styles.track}>
        {STEPS.map((step, index) => {
          const complete = current >= index && current !== -1;
          return <View key={step} style={[styles.node, complete && styles.complete, state === step && styles.current]} />;
        })}
      </View>
      <Text style={t.small}>
        {state === 'FLAGGED' ? 'Paused for quality review' : ['REVOKED', 'COLLECTION_REJECTED', 'LAB_REJECTED'].includes(state) ? 'Closed as rejected' : state.replaceAll('_', ' ')}
      </Text>
    </NeuCard>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', gap: 6 },
  node: { height: 8, flex: 1, borderRadius: 8, backgroundColor: palette.edgeDark },
  complete: { backgroundColor: palette.accent },
  current: { backgroundColor: palette.accentDeep },
});
