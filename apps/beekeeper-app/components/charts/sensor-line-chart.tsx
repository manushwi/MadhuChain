import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { LineChart } from 'react-native-gifted-charts';
import { getPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ReadingPoint } from '@/lib/types';

interface SensorLineChartProps {
  points: ReadingPoint[];
  color: string;
  label?: string;
  suffix?: string;
  decimals?: number;
  metric: 'temperature' | 'humidity' | 'weight';
}

export function SensorLineChart({ points, color, label, suffix = '', decimals = 1, metric }: SensorLineChartProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);

  const data = points.flatMap((p, i) => {
    const value = p[metric];
    return value == null ? [] : [{ value: Number(value.toFixed(decimals)), label: i % 4 === 0 ? fmtShort(p.ts) : '' }];
  });

  if (data.length === 0) return <Text style={{ color: c.muted }}>No {label?.toLowerCase() ?? metric} readings in this range.</Text>;

  return (
    <View>
      {label ? (
        <Text variant="labelLarge" style={{ color: c.primaryDark, marginBottom: 8 }}>
          {label}
        </Text>
      ) : null}
      <LineChart
        data={data}
        color={color}
        thickness={2}
        curved
        hideDataPoints
        areaChart
        startFillColor={color}
        endFillColor="transparent"
        startOpacity={0.25}
        endOpacity={0}
        height={150}
        spacing={22}
        initialSpacing={16}
        endSpacing={16}
        scrollToEnd
        yAxisTextStyle={{ color: c.muted, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: c.muted, fontSize: 9 }}
        rulesColor="rgba(0,0,0,0.05)"
        yAxisLabelSuffix={suffix}
        noOfSections={4}
      />
    </View>
  );
}

function fmtShort(ts: string): string {
  const d = new Date(ts);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}
