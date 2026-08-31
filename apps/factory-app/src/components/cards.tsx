import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { palette } from '@/src/theme/palette';
import { NeuButton, NeuCard, t } from '@/src/theme/primitives';
import { shortTx } from '@/src/utils/format';
import type { TransactionMetadata } from '@/src/api/types';

export function ActionCard({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <NeuCard style={{ gap: 14 }}>
      <View>
        <Text style={t.h3}>{title}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      {children}
    </NeuCard>
  );
}

export function TransactionNote({ tx }: { tx: TransactionMetadata }) {
  return (
    <View style={styles.transaction} accessibilityLabel={`Transaction ${tx.transaction_id}, ${tx.successful ? 'successful' : 'failed'}`}>
      <Text style={styles.tx} numberOfLines={1}>tx {shortTx(tx.transaction_id)}</Text>
      <Text style={[styles.txStatus, { color: tx.successful ? palette.ok : palette.bad }]}>
        {tx.successful ? 'COMMITTED' : 'FAILED'} · validation {tx.validation_code}
      </Text>
    </View>
  );
}

export function SuccessNote({ message, tx }: { message: string; tx?: TransactionMetadata }) {
  return (
    <View style={styles.success}>
      <Text style={[styles.successTitle, { color: palette.ok }]}>✓ {message}</Text>
      {tx ? <TransactionNote tx={tx} /> : null}
    </View>
  );
}

export function ErrorNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <View style={styles.error} accessibilityRole="alert">
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.center} accessibilityRole="progressbar">
      <ActivityIndicator color={palette.accentDeep} size="large" />
      <Text style={[t.small, { marginTop: 10 }]}>{label}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={[t.body, { textAlign: 'center' }]}>{message}</Text>
      {onRetry ? <NeuButton title="Retry" variant="ghost" onPress={onRetry} style={{ marginTop: 14, alignSelf: 'center' }} /> : null}
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <Text style={[t.body, { textAlign: 'center' }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { marginTop: 4, fontFamily: 'System', fontSize: 12, color: palette.muted, lineHeight: 17 },
  success: {
    backgroundColor: palette.okSoft,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  successTitle: { fontFamily: 'System', fontWeight: '700', fontSize: 13.5 },
  tx: { fontFamily: 'monospace', fontSize: 11, color: palette.darkSoft },
  transaction: { gap: 2 },
  txStatus: { fontFamily: 'System', fontWeight: '700', fontSize: 10, letterSpacing: 0.4 },
  error: {
    backgroundColor: palette.badSoft,
    borderRadius: 12,
    padding: 12,
  },
  errorText: { fontFamily: 'System', fontWeight: '600', fontSize: 13, color: palette.bad },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 6 },
});
