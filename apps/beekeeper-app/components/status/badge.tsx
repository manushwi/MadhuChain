import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { getPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function StatusDot({ color }: { color: string }) {
  return (
    <View
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: color,
      }}
    />
  );
}

export function StatusBadge({ label, color }: { label: string; color: string }) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: c.surfaceAlt,
      }}>
      <StatusDot color={color} />
      <Text variant="labelMedium" style={{ color: c.primaryDark }}>
        {label}
      </Text>
    </View>
  );
}
