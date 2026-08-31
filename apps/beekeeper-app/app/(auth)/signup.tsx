import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

import { Neumorph } from '@/components/ui/neumorph';
import { OptionPicker } from '@/components/ui/option-picker';
import { getPalette } from '@/constants/theme';
import { BEE_SPECIES_OPTIONS, NECTAR_SOURCE_OPTIONS } from '@/constants/options';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/stores/auth-store';
import { setupPushNotifications } from '@/lib/notifications';

export default function SignupScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const router = useRouter();
  const signup = useAuthStore((s) => s.signup);

  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [apiary, setApiary] = useState('');
  const [location, setLocation] = useState('');
  const [beeSpecies, setBeeSpecies] = useState('');
  const [nectarSource, setNectarSource] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSignup = async () => {
    if (!name || !identifier.trim() || !password || !apiary || !location || !beeSpecies || !nectarSource) {
      setError('Please fill in all fields, including bee species and nectar source.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const credential = identifier.includes('@') ? { email: identifier.trim() } : { phone: identifier.trim() };
      await signup({ name, ...credential, password, apiary_name: apiary, location, bee_species: beeSpecies, nectar_source: nectarSource });
      setupPushNotifications();
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signup failed.');
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
          <MaterialCommunityIcons name="bee" size={56} color={c.accent} />
        </View>
        <Text variant="headlineMedium" style={{ color: c.darkAccent, fontWeight: '700', marginBottom: 4 }}>
          Create Account
        </Text>
        <Text variant="bodyMedium" style={{ color: c.muted, marginBottom: 20 }}>
          Your blockchain identity is managed securely — keep your password safe.
        </Text>

        <Neumorph style={styles.card}>
          <TextInput mode="outlined" label="Full name" value={name} onChangeText={setName} style={styles.input} activeOutlineColor={c.accent} />
          <TextInput mode="outlined" label="Email or phone" value={identifier} onChangeText={setIdentifier} autoCapitalize="none" keyboardType="default" style={styles.input} activeOutlineColor={c.accent} />
          <TextInput mode="outlined" label="Password" value={password} onChangeText={setPassword} secureTextEntry={secure} style={styles.input} activeOutlineColor={c.accent} right={<TextInput.Icon icon={secure ? 'eye-off' : 'eye'} onPress={() => setSecure((v) => !v)} />} />
          <TextInput mode="outlined" label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry style={styles.input} activeOutlineColor={c.accent} />
          <TextInput mode="outlined" label="Apiary name" value={apiary} onChangeText={setApiary} style={styles.input} activeOutlineColor={c.accent} />
          <TextInput mode="outlined" label="Location" value={location} onChangeText={setLocation} style={styles.input} activeOutlineColor={c.accent} />

          <OptionPicker
            label="Which bee species are you keeping?"
            options={BEE_SPECIES_OPTIONS}
            value={beeSpecies}
            onChange={setBeeSpecies}
          />
          <OptionPicker
            label="Which flower / nectar source are your bees getting?"
            options={NECTAR_SOURCE_OPTIONS}
            value={nectarSource}
            onChange={setNectarSource}
          />

          {error ? <Text variant="bodySmall" style={{ color: c.darkAccent, marginTop: 8 }}>{error}</Text> : null}

          <Button mode="contained" buttonColor={c.accent} textColor={c.highlight} style={styles.button} onPress={onSignup} disabled={loading}>
            {loading ? <ActivityIndicator color={c.highlight} /> : 'Create Account'}
          </Button>
        </Neumorph>

        <View style={styles.row}>
          <Text variant="bodyMedium" style={{ color: c.muted }}>Already have an account?</Text>
          <Link href="/(auth)/login" style={{ color: c.accent }}>Sign in</Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { alignItems: 'center', marginBottom: 12 },
  card: { marginTop: 4 },
  input: { marginBottom: 10, backgroundColor: 'transparent' },
  button: { marginTop: 16, borderRadius: 14 },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 20 },
});
