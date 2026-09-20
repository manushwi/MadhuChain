import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

import { Neumorph } from '@/components/ui/neumorph';
import { getPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/stores/auth-store';
import { setupPushNotifications } from '@/lib/notifications';

export default function LoginScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLogin = async () => {
    if (!identifier.trim() || !password) {
      setError('Please enter your email or phone and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(identifier, password);
      setupPushNotifications();
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <MaterialCommunityIcons name="bee" size={64} color={c.accent} />
        </View>
        <Text variant="headlineLarge" style={{ color: c.darkAccent, fontWeight: '700', marginBottom: 4 }}>
          MadhuChain
        </Text>
        <Text variant="bodyMedium" style={{ color: c.muted, marginBottom: 24 }}>
          Sign in to your beekeeper account
        </Text>

        <Neumorph style={styles.card}>
          <TextInput
            mode="outlined"
            label="Email or phone"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            keyboardType="default"
            style={styles.input}
            activeOutlineColor={c.accent}
          />
          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secure}
            style={styles.input}
            activeOutlineColor={c.accent}
            right={
              <TextInput.Icon icon={secure ? 'eye-off' : 'eye'} onPress={() => setSecure((v) => !v)} />
            }
          />

          <Link href="/(auth)/forgot-password" style={[styles.forgot, { color: c.accent }]}>
            Forgot password?
          </Link>

          {error ? (
            <Text variant="bodySmall" style={{ color: c.darkAccent, marginTop: 8 }}>
              {error}
            </Text>
          ) : null}

          <Button
            mode="contained"
            buttonColor={c.accent}
            textColor={c.highlight}
            style={styles.button}
            onPress={onLogin}
            disabled={loading}>
            {loading ? <ActivityIndicator color={c.highlight} /> : 'Sign In'}
          </Button>
        </Neumorph>

        <View style={styles.signupRow}>
          <Text variant="bodyMedium" style={{ color: c.muted }}>
            New beekeeper?
          </Text>
          <Link href="/(auth)/signup" style={{ color: c.accent }}>
            Create account
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { alignItems: 'center', marginBottom: 16 },
  card: { marginTop: 8 },
  input: { marginBottom: 12, backgroundColor: 'transparent' },
  forgot: { alignSelf: 'flex-end', marginVertical: 4, fontWeight: '600' },
  button: { marginTop: 16, borderRadius: 14 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 24 },
});
