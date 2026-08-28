import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getOnboardingComplete } from '@/lib/onboarding';
import { useAuthStore } from '@/stores/auth-store';

export default function RootIndexGuard() {
  const scheme = useColorScheme() ?? 'light';
  const status = useAuthStore((s) => s.status);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const bg = scheme === 'dark' ? '#1A1712' : '#EFEEE9';
  const accent = '#C4835E';

  useEffect(() => {
    getOnboardingComplete().then(setOnboarded);
  }, []);

  if (onboarded === null || status === 'idle') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: bg }}>
        <ActivityIndicator color={accent} size="large" />
      </View>
    );
  }

  if (!onboarded) {
    return <Redirect href="/(onboarding)" />;
  }

  if (status === 'unauthenticated') {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
