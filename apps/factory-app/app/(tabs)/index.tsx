import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router, Stack, useFocusEffect } from 'expo-router';
import { useRemote } from '@/src/hooks/use-remote';
import { listBatches } from '@/src/api/batches';
import { Screen, NeuInput, t } from '@/src/theme/primitives';
import { palette } from '@/src/theme/palette';
import { BatchCard } from '@/src/components/BatchCard';
import { EmptyState, ErrorState, LoadingState } from '@/src/components/cards';
import { useAuth } from '@/src/context/AuthContext';
import { can, isRoleWork, ROLE_LABELS } from '@/src/auth/capabilities';

type Filter = 'ALL' | 'WORK' | 'INPROGRESS' | 'RELEASED' | 'FLAGGED';

const FILTERS: Filter[] = ['WORK', 'ALL', 'INPROGRESS', 'RELEASED', 'FLAGGED'];

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const { data, error, loading, refetch } = useRemote(listBatches, `hc.factory.${user?.id}.batches`);
  const [filter, setFilter] = useState<Filter>(user?.role === 'ADMIN' ? 'ALL' : 'WORK');
  const [q, setQ] = useState('');

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const batches = useMemo(() => {
    const list = data ?? [];
    const needle = q.trim().toLowerCase();
    return list.filter((b) => {
       const inProgress = ['RECEIVED', 'INTAKE_TEST', 'PROCESSING', 'OUTPUT_TEST', 'PACKAGING', 'FLAGGED'].includes(b.state);
       if (filter === 'WORK' && user && !isRoleWork(user.role, b.state, b.flagged)) return false;
      if (filter === 'INPROGRESS' && !inProgress) return false;
      if (filter === 'RELEASED' && b.state !== 'RELEASED') return false;
      if (filter === 'FLAGGED' && !b.flagged) return false;
      if (needle && !`${b.batchId} ${b.lotId ?? ''}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [data, filter, q, user]);

  const workCount = user ? (data ?? []).filter((b) => isRoleWork(user.role, b.state, b.flagged)).length : 0;

  if (error && !data) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={() => {
                logout();
              }}
              hitSlop={12}
              style={styles.logout}
            >
              <Text style={styles.logoutText}>Sign out</Text>
            </Pressable>
          ),
        }}
      />
      <FlatList
        data={batches}
        keyExtractor={(b) => b.batchId}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={palette.accentDeep} />}
        ListHeaderComponent={
          <View style={{ gap: 14 }}>
            <View style={{ gap: 3 }}>
              <Text style={t.h1}>{user ? ROLE_LABELS[user.role] : 'Operations'}</Text>
              <Text style={t.small}>{user?.role === 'ADMIN' ? 'Read-only lifecycle and quality oversight' : `${workCount} batch${workCount === 1 ? '' : 'es'} in your work queue`}</Text>
            </View>
            {user ? (
              <View style={styles.sessionRow}>
                <Text style={styles.sessionName}>{user.name}</Text>
                <Text style={[styles.sessionPill, { color: palette.accentDeep }]}>{user.role}</Text>
              </View>
            ) : null}
            <NeuInput
              label="search"
              hint="batch id or lot id"
              value={q}
              onChangeText={setQ}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {FILTERS.filter((f) => !(f === 'WORK' && user?.role === 'ADMIN')).map((f) => {
                const active = filter === f;
                return (
                  <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, active && styles.chipActive]}>
                    <Text style={[styles.chipText, active && { color: palette.onAccent }]}>{f === 'WORK' ? 'MY WORK' : f}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={[t.small, { marginTop: 2 }]}>
              {batches.length} batch{batches.length === 1 ? '' : 'es'}
              {data && batches.length !== data.length ? ` of ${data.length}` : ''} · tap a card for detail
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? <LoadingState /> : <EmptyState message={q || filter !== 'ALL' ? 'No batches match this filter.' : 'No batches on the ledger yet.'} />
        }
        renderItem={({ item }) => (
          <BatchCard batch={item} onPress={() => router.push(`/batch/${item.batchId}`)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      />
      {can(user?.role, 'blend') ? (
        <Pressable accessibilityRole="button" onPress={() => router.push('/blend/create')} style={[styles.fab, { bottom: 96, backgroundColor: palette.surface }]}>
          <Text style={[styles.fabText, { color: palette.accentDeep }]}>New blend</Text>
        </Pressable>
      ) : null}
      <Pressable accessibilityRole="button" onPress={() => router.push('/scan')} style={styles.fab}>
        <Text style={styles.fabText}>Scan</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 110 },
  chip: {
    borderRadius: 999,
    backgroundColor: palette.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: palette.edgeDark,
  },
  chipActive: { backgroundColor: palette.accentDeep },
  chipText: { fontFamily: 'System', fontWeight: '700', fontSize: 12, color: palette.darkSoft, letterSpacing: 0.4 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 26,
    backgroundColor: palette.accentBright,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 30,
    minHeight: 48,
    justifyContent: 'center',
    shadowColor: palette.edgeDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  fabText: { fontFamily: 'System', fontWeight: '800', fontSize: 15, color: palette.onAccent, letterSpacing: 0.5 },
  logout: { paddingHorizontal: 4, paddingVertical: 2 },
  logoutText: { fontFamily: 'System', fontWeight: '700', fontSize: 14, color: palette.accentDeep },
  sessionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  sessionName: { fontFamily: 'System', fontWeight: '700', fontSize: 14, color: palette.dark },
  sessionPill: { fontFamily: 'System', fontWeight: '800', fontSize: 11, letterSpacing: 0.6 },
});
