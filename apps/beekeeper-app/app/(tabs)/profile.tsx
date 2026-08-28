import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert as RNAlert, StyleSheet, View } from 'react-native';
import { Button, Switch, Text, TextInput } from 'react-native-paper';

import { Neumorph } from '@/components/ui/neumorph';
import { Screen } from '@/components/ui/screen';
import { getPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProfile, useUpdateProfile } from '@/hooks/use-queries';
import { useAuthStore } from '@/stores/auth-store';

export default function ProfileScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const { data: profile } = useProfile();
  const update = useUpdateProfile();

  const [name, setName] = useState('');
  const [apiary, setApiary] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setApiary(profile.apiary_name);
      setLocation(profile.location ?? '');
      setPhone(profile.phone ?? '');
    }
  }, [profile]);

  const save = async () => {
    await update.mutateAsync({ name, apiary_name: apiary, location, phone });
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  };

  const onLogout = () => {
    RNAlert.alert('Sign out', 'Sign out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  return (
    <Screen>
      <Text variant="headlineSmall" style={{ color: c.darkAccent, fontWeight: '700', marginTop: 8, marginBottom: 16 }}>
        Profile
      </Text>

      <Neumorph style={{ borderRadius: 20, marginBottom: 14 }}>
        <Text variant="titleSmall" style={{ color: c.primaryDark, marginBottom: 10 }}>Account</Text>
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
      </Neumorph>

      <Neumorph style={styles.card}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text variant="titleSmall" style={{ color: c.primaryDark }}>Push notifications</Text>
            <Text variant="bodySmall" style={{ color: c.muted }}>Alerts for weight, brood temp, battery & swarming</Text>
          </View>
          <Switch value={pushEnabled} onValueChange={setPushEnabled} color={c.accent} />
        </View>
      </Neumorph>

      {done && <Text variant="bodySmall" style={{ color: c.primaryDark, marginBottom: 8 }}>Saved ✓</Text>}

      <Button mode="contained" buttonColor={c.accent} textColor={c.highlight} style={styles.save} onPress={save} loading={update.isPending}>
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
