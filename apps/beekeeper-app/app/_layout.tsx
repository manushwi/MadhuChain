import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

import { paperThemeDark, paperThemeLight } from '@/constants/paper-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/stores/auth-store';

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const restore = useAuthStore((s) => s.restore);

  useEffect(() => {
    restore();
  }, [restore]);

  const scheme = useColorScheme() ?? 'light';
  const theme = scheme === 'dark' ? paperThemeDark : paperThemeLight;

  return (
    <PaperProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="hive/[id]" options={{ headerShown: true, title: 'Hive' }} />
          <Stack.Screen name="harvest/new" options={{ headerShown: true, title: 'New Harvest' }} />
          <Stack.Screen name="harvest/[batchId]" options={{ headerShown: true, title: 'Batch' }} />
        </Stack>
        <StatusBar style="dark" />
      </QueryClientProvider>
    </PaperProvider>
  );
}
