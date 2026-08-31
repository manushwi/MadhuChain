import { Link } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { Neumorph } from '@/components/ui/neumorph';
import { getPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ForgotPasswordScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.center}>
        <Text variant="headlineMedium" style={{ color: c.darkAccent, fontWeight: '700', marginBottom: 8 }}>
          Reset Password
        </Text>
        <Text variant="bodyMedium" style={{ color: c.muted, marginBottom: 20, textAlign: 'center' }}>
          Password reset is not available in the app yet. Contact your HoneyChain administrator for account access help.
        </Text>

        <Neumorph style={styles.card}>
          <Text variant="bodyMedium" style={{ color: c.darkAccent, textAlign: 'center' }}>
            No reset request has been sent.
          </Text>
        </Neumorph>

        <Link href="/(auth)/login" style={{ color: c.accent, marginTop: 16 }}>
          Back to Sign In
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', padding: 24 },
  card: { marginTop: 8 },
});
