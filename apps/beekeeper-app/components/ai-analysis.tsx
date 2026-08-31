import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { Neumorph } from '@/components/ui/neumorph';
import { getPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { DiseaseAnalysis } from '@/lib/types';

interface AiAnalysisProps {
  analysis: DiseaseAnalysis | undefined;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function AiAnalysis({ analysis, isLoading, error, onRetry }: AiAnalysisProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);

  if (isLoading && !analysis) {
    return (
      <Neumorph style={styles.card}>
        <Row>
          <ActivityIndicator color={c.accent} />
          <Text variant="bodyMedium" style={{ color: c.muted }}>Analysing hive health…</Text>
        </Row>
      </Neumorph>
    );
  }

  if (error && !analysis) {
    return (
      <Neumorph style={styles.card}>
        <Text variant="bodyMedium" style={{ color: c.darkAccent }}>AI analysis unavailable.</Text>
        {onRetry ? <Text variant="labelMedium" style={{ color: c.accent, marginTop: 4 }} onPress={onRetry}>Tap to retry</Text> : null}
      </Neumorph>
    );
  }

  if (!analysis) {
    return (
      <Neumorph style={styles.card}>
        <Text variant="bodyMedium" style={{ color: c.muted }}>No AI analysis available yet for this hive.</Text>
      </Neumorph>
    );
  }

  const risk = analysis.riskScores.diseasePest;
  const riskColor = risk >= 50 ? c.darkAccent : risk >= 25 ? c.accent : c.accentBright;

  return (
    <Neumorph style={styles.card}>
      <Row style={{ marginBottom: 10 }}>
        <MaterialCommunityIcons name="bee-flower" size={20} color={c.accent} />
        <Text variant="titleMedium" style={{ color: c.primaryDark, fontWeight: '700' }}>
          AI Analysis
        </Text>
      </Row>

      <Row style={{ marginBottom: 12 }}>
        <Text variant="bodyMedium" style={{ color: c.muted }}>Health score</Text>
        <Text variant="titleLarge" style={{ color: c.primaryDark, fontWeight: '700' }}>
          {analysis.healthScore != null ? `${analysis.healthScore}/100` : 'n/a'}
        </Text>
      </Row>

      <View style={styles.riskBlock}>
        <Row>
          <Text variant="bodySmall" style={{ color: c.muted, flex: 1 }}>Disease / pest risk</Text>
          <Text variant="titleMedium" style={{ color: riskColor, fontWeight: '700' }}>{risk}/100</Text>
        </Row>
        <View style={styles.bar}>
          <View style={[styles.barFill, { width: `${Math.min(risk, 100)}%`, backgroundColor: riskColor }]} />
        </View>
      </View>

      {analysis.abnormal ? (
        <Text variant="labelMedium" style={{ color: c.darkAccent, marginTop: 8 }}>
          This hive is outside its normal range.
        </Text>
      ) : (
        <Text variant="labelMedium" style={{ color: c.accentBright, marginTop: 8 }}>
          Hive is within its normal operating range.
        </Text>
      )}

      {analysis.llm.generated && analysis.llm.analysis ? (
        <View style={styles.llm}>
          <Text variant="titleSmall" style={{ color: c.primaryDark, marginTop: 12 }}>AI disease estimate</Text>
          {analysis.llm.analysis.possibleDiseases.length > 0 ? (
            <View style={{ marginTop: 6 }}>
              {analysis.llm.analysis.possibleDiseases.map((d) => (
                <View key={d.name} style={styles.diseaseRow}>
                  <Text variant="bodyMedium" style={{ color: c.darkAccent, flex: 1 }}>• {d.name}</Text>
                  <Text variant="labelMedium" style={{ color: likelihoodColor(d.likelihood, c) }}>
                    {d.likelihood} risk
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          {analysis.llm.analysis.summary ? (
            <Text variant="bodySmall" style={{ color: c.muted, marginTop: 8 }}>{analysis.llm.analysis.summary}</Text>
          ) : null}
          {analysis.llm.analysis.recommendedActions.length > 0 ? (
            <View style={{ marginTop: 10 }}>
              <Text variant="labelLarge" style={{ color: c.primaryDark }}>Recommended actions</Text>
              {analysis.llm.analysis.recommendedActions.map((a, i) => (
                <Text key={i} variant="bodySmall" style={{ color: c.primaryDark, marginTop: 4 }}>• {a}</Text>
              ))}
            </View>
          ) : null}
          <Text variant="labelSmall" style={{ color: c.muted, marginTop: 10 }}>
            Risk estimation, not a diagnosis. Inspect the hive before acting.
          </Text>
        </View>
      ) : null}

      {analysis.llm.generated && analysis.llm.error ? (
        <Text variant="labelSmall" style={{ color: c.muted, marginTop: 8 }}>{analysis.llm.error}</Text>
      ) : null}

      {analysis.notes.length > 0 ? (
        <View style={{ marginTop: 10 }}>
          {analysis.notes.map((n, i) => (
            <Text key={i} variant="labelSmall" style={{ color: c.muted, marginTop: 2 }}>◦ {n}</Text>
          ))}
        </View>
      ) : null}
    </Neumorph>
  );
}

function likelihoodColor(likelihood: string, c: ReturnType<typeof getPalette>): string {
  if (likelihood === 'high') return c.darkAccent;
  if (likelihood === 'medium') return c.accent;
  return c.accentBright;
}

function Row({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 16, marginBottom: 14 },
  riskBlock: { marginTop: 4 },
  bar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.08)', marginTop: 6, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  llm: { marginTop: 4 },
  diseaseRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
});
