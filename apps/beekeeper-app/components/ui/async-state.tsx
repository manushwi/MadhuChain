import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';

import { getPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function AsyncState({
  loading,
  error,
  empty,
  emptyMessage,
  onRetry,
}: {
  loading?: boolean;
  error?: unknown;
  empty?: boolean;
  emptyMessage: string;
  onRetry?: () => void;
}) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);

  if (!loading && !error && !empty) return null;
  return (
    <View style={styles.container} accessibilityRole="alert">
      {loading ? <ActivityIndicator color={c.accent} /> : null}
      <Text style={{ color: error ? c.darkAccent : c.muted, textAlign: 'center' }}>
        {loading ? 'Loading…' : error instanceof Error ? error.message : error ? 'Something went wrong.' : emptyMessage}
      </Text>
      {error && onRetry ? <Button onPress={onRetry}>Try again</Button> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 36 },
});
