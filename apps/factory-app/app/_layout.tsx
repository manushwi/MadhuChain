import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { palette } from '@/src/theme/palette';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { LoadingState } from '@/src/components/cards';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const { status } = useAuth();
  if (status === 'boot') return <LoadingState label="Restoring session..." />;
  const authenticated = status === 'authenticated';
  return (
    <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: palette.bg },
          headerTintColor: palette.accentDeep,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: palette.bg },
        }}
      >
        <Stack.Protected guard={!authenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={authenticated}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="scan"
            options={{ presentation: 'modal', headerShown: true, headerTitle: 'Scan asset' }}
          />
          <Stack.Screen name="blend/create" options={{ headerShown: true, headerTitle: 'New blend' }} />
        </Stack.Protected>
    </Stack>
  );
}
