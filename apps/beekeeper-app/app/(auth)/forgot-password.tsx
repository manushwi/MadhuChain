import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

import { Neumorph } from '@/components/ui/neumorph';
import { getPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ForgotPasswordScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setSent(true);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.center}>
        <Text variant="headlineMedium" style={{ color: c.darkAccent, fontWeight: '700', marginBottom: 8 }}>
          Reset Password
        </Text>
        <Text variant="bodyMedium" style={{ color: c.muted, marginBottom: 20, textAlign: 'center' }}>
          {sent
            ? 'If that account exists, a reset link / OTP has been sent to your email or phone.'
            : 'Enter your email or phone and we\'ll send you a reset link.'}
        </Text>

        {!sent ? (
          <Neumorph style={styles.card}>
            <TextInput
              mode="outlined"
              label="Email or phone"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              activeOutlineColor={c.accent}
            />
            <Button
              mode="contained"
              buttonColor={c.accent}
              textColor={c.highlight}
              style={styles.button}
              onPress={onSend}
              disabled={loading || !email}>
              {loading ? <ActivityIndicator color={c.highlight} /> : 'Send Reset Link'}
            </Button>
          </Neumorph>
        ) : (
          <View style={styles.card}>
            <Button
              mode="contained"
              buttonColor={c.accent}
              textColor={c.highlight}
              style={styles.button}
              onPress={() => router.back()}>
              Back to Sign In
            </Button>
          </View>
        )}

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
  input: { marginBottom: 12, backgroundColor: 'transparent' },
  button: { marginTop: 16, borderRadius: 14 },
});
