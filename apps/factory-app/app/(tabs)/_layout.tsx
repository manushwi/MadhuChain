import { Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { LoadingState } from '@/src/components/cards';
import { palette } from '@/src/theme/palette';
import { isOperationsRole } from '@/src/auth/capabilities';
import { NeuButton, NeuCard, Screen, t } from '@/src/theme/primitives';

export default function TabsLayout() {
  const { status, user, logout } = useAuth();
  if (status === 'boot') return <LoadingState label="Restoring session…" />;
  if (status !== 'authenticated') return null;
  if (!isOperationsRole(user?.role)) {
    return (
      <Screen style={{ padding: 24, justifyContent: 'center' }}>
        <NeuCard style={{ gap: 12 }}>
          <Text style={t.h2}>Operations access unavailable</Text>
          <Text style={t.body}>
            {user?.role === 'BEEKEEPER' ? 'Beekeeper accounts use the Beekeeper app.' : 'Consumer accounts use the public verification experience.'}
            {' '}This console is provisioned only for operational roles.
          </Text>
          <View style={{ marginTop: 4 }}><NeuButton title="Sign out" onPress={logout} /></View>
        </NeuCard>
      </Screen>
    );
  }
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.bg },
        headerTintColor: palette.accentDeep,
        headerTitleStyle: { fontWeight: '800' },
        contentStyle: { backgroundColor: palette.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Operations' }} />
      <Stack.Screen name="batch/[id]" options={{ title: 'Batch' }} />
    </Stack>
  );
}
