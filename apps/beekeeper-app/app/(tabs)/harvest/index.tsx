import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { Neumorph } from '@/components/ui/neumorph';
import { AsyncState } from '@/components/ui/async-state';
import { Screen } from '@/components/ui/screen';
import { batchStatusColors, getPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBatches } from '@/hooks/use-queries';
import type { Batch } from '@/lib/types';

export default function MyBatchesScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const batchesQuery = useBatches();
  const { data: batches } = batchesQuery;

  return (
    <Screen scroll={false}>
      <View style={styles.headerRow}>
        <Text variant="headlineSmall" style={{ color: c.darkAccent, fontWeight: '700' }}>
          My Batches
        </Text>
        <Button mode="contained" buttonColor={c.accent} textColor={c.highlight} compact onPress={() => router.push('/harvest/new')} icon="plus">
          New Harvest
        </Button>
      </View>

      <FlatList
        data={batches ?? []}
        keyExtractor={(b) => b.batch_id}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <BatchRow batch={item} />}
        ListEmptyComponent={<AsyncState loading={batchesQuery.isLoading} error={batchesQuery.error} empty emptyMessage="No batches minted yet." onRetry={() => batchesQuery.refetch()} />}
      />
    </Screen>
  );
}

function BatchRow({ batch }: { batch: Batch }) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const bsc = batchStatusColors(c);
  const color = bsc[batch.status] ?? c.accent;

  return (
    <Pressable onPress={() => router.push(`/harvest/${batch.batch_id}`)}>
      {({ pressed }) => (
        <Neumorph style={[styles.row, pressed ? { opacity: 0.85 } : undefined]}>
          <View style={styles.rowTop}>
            <Text variant="titleMedium" style={{ color: c.primaryDark }}>{batch.batch_id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: c.surfaceAlt }]}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
              <Text variant="labelMedium" style={{ color }}>{batch.status}</Text>
            </View>
          </View>
          <View style={styles.rowMeta}>
            <Meta icon="ticket-outline" text={batch.lot_id} />
            <Meta icon="weight-kilogram" text={`${batch.weight_kg} kg`} />
            <Meta icon="calendar-outline" text={batch.harvest_end} />
          </View>
        </Neumorph>
      )}
    </Pressable>
  );
}

function Meta({ icon, text }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; text: string }) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <MaterialCommunityIcons name={icon} size={14} color={c.accent} />
      <Text variant="labelSmall" style={{ color: c.muted }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
  row: { borderRadius: 20, marginBottom: 14 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  rowMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
});
