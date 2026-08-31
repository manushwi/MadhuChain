import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { Alert as RNAlert, StyleSheet, View } from 'react-native';
import { Button, Switch, Text, TextInput } from 'react-native-paper';

import { Neumorph } from '@/components/ui/neumorph';
import { AsyncState } from '@/components/ui/async-state';
import { OptionPicker } from '@/components/ui/option-picker';
import { Screen } from '@/components/ui/screen';
import { getPalette } from '@/constants/theme';
import { BEE_SPECIES_OPTIONS, NECTAR_SOURCE_OPTIONS } from '@/constants/options';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProfile, useUpdateProfile } from '@/hooks/use-queries';
import { useAuthStore } from '@/stores/auth-store';

export default function ProfileScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  const profileQuery = useProfile();
  const { data: profile } = profileQuery;
  const update = useUpdateProfile();

  const [name, setName] = useState('');
  const [apiary, setApiary] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [beeSpecies, setBeeSpecies] = useState('');
  const [nectarSource, setNectarSource] = useState('');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setApiary(profile.apiary_name);
      setLocation(profile.location ?? '');
      setPhone(profile.phone ?? '');
      setBeeSpecies(profile.beeSpecies ?? '');
      setNectarSource(profile.nectarSource ?? '');
    }
  }, [profile]);

  const save = async () => {
    setError(null);
    try {
      await update.mutateAsync({ name, apiary_name: apiary, location, phone, bee_species: beeSpecies, nectar_source: nectarSource });
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Profile update failed.');
    }
  };

  const onLogout = () => {
    RNAlert.alert('Sign out', 'Sign out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); queryClient.clear(); router.replace('/(auth)/login'); } },
    ]);
  };

  return (
    <Screen>
      <Text variant="headlineSmall" style={{ color: c.darkAccent, fontWeight: '700', marginTop: 8, marginBottom: 16 }}>
        Profile
      </Text>
      {!profile ? <AsyncState loading={profileQuery.isLoading} error={profileQuery.error} empty emptyMessage="Profile unavailable." onRetry={() => profileQuery.refetch()} /> : null}

      <Neumorph style={{ borderRadius: 20, marginBottom: 14 }}>
        <Text variant="titleSmall" style={{ color: c.primaryDark, marginBottom: 10 }}>Account</Text>
        <Text variant="labelSmall" selectable style={{ color: c.muted, marginBottom: 8 }}>Beekeeper ID: {profile?.id ?? 'Unavailable'}</Text>
        <TextInput mode="outlined" label="Full name" value={name} onChangeText={setName} style={styles.input} activeOutlineColor={c.accent} />
        <Text variant="bodyMedium" style={{ color: c.muted, marginBottom: 12 }}>
          {profile?.email}
        </Text>
        <TextInput mode="outlined" label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} activeOutlineColor={c.accent} />
      </Neumorph>

      <Neumorph style={styles.card}>
        <Text variant="titleSmall" style={{ color: c.primaryDark, marginBottom: 10 }}>Apiary</Text>
        <TextInput mode="outlined" label="Apiary name" value={apiary} onChangeText={setApiary} style={styles.input} activeOutlineColor={c.accent} />
        <TextInput mode="outlined" label="Location" value={location} onChangeText={setLocation} style={styles.input} activeOutlineColor={c.accent} />
        <OptionPicker label="Bee species you keep" options={BEE_SPECIES_OPTIONS} value={beeSpecies} onChange={setBeeSpecies} />
        <OptionPicker label="Flower / nectar source" options={NECTAR_SOURCE_OPTIONS} value={nectarSource} onChange={setNectarSource} />
      </Neumorph>

      <Neumorph style={styles.card}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text variant="titleSmall" style={{ color: c.primaryDark }}>Push notifications</Text>
            <Text variant="bodySmall" style={{ color: c.muted }}>Alerts for measured weight, internal temperature, humidity, battery, and connectivity</Text>
          </View>
          <Switch value={pushEnabled} onValueChange={setPushEnabled} color={c.accent} />
        </View>
      </Neumorph>

      {done && <Text variant="bodySmall" style={{ color: c.primaryDark, marginBottom: 8 }}>Saved ✓</Text>}
      {error ? <Text accessibilityRole="alert" variant="bodySmall" style={{ color: c.darkAccent, marginBottom: 8 }}>{error}</Text> : null}

      <Button mode="contained" buttonColor={c.accent} textColor={c.highlight} style={styles.save} onPress={save} loading={update.isPending} disabled={update.isPending || !profile}>
        Save Changes
      </Button>

      <Button mode="outlined" textColor={c.darkAccent} style={styles.logout} onPress={onLogout}>
        Sign Out
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 14 },
  input: { marginBottom: 10, backgroundColor: 'transparent' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  save: { marginTop: 8, borderRadius: 14 },
  logout: { marginTop: 12, borderRadius: 14, borderColor: getPalette('light').sand },
});
