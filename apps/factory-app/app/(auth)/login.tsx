import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { palette } from '@/src/theme/palette';
import { NeuButton, NeuCard, NeuInput, Screen, t } from '@/src/theme/primitives';
import { ErrorNote } from '@/src/components/cards';
import { useAuth } from '@/src/context/AuthContext';
import { API_CONFIGURATION_ERROR } from '@/constants/api';

export default function LoginScreen() {
  const { login } = useAuth();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!id.trim() || !password) {
      setErr('Enter email/phone and password');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await login(id.includes('@') ? { email: id.trim(), password } : { phone: id.trim(), password });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Text style={t.h1}>MadhuChain</Text>
            <Text style={[t.small, { marginTop: 4 }]}>operations · custody, quality and production</Text>
          </View>
          <NeuCard lifted style={{ gap: 16 }}>
            <Text style={t.h3}>Sign in</Text>
            <NeuInput
              label="email or phone"
              value={id}
              onChangeText={setId}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <NeuInput
              label="password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
            />
            <ErrorNote message={API_CONFIGURATION_ERROR ?? err ?? undefined} />
            <NeuButton title="Sign in" onPress={submit} loading={busy} disabled={Boolean(API_CONFIGURATION_ERROR)} />
          </NeuCard>
          <View style={styles.foot}>
            <Text style={t.body}>Need operations access?</Text>
            <Link href="/signup" style={styles.link}>
              <Text style={{ color: palette.accentDeep, fontWeight: '700' }}>Request access</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 22 },
  brand: { alignItems: 'center', marginBottom: 4 },
  foot: { flexDirection: 'row', gap: 6, justifyContent: 'center', alignItems: 'center' },
  link: { paddingVertical: 2 },
});
