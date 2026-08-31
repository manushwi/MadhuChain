import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { API_BASE_URL, API_CONFIGURATION_ERROR } from '@/constants/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getOnboardingComplete } from '@/lib/onboarding';
import { useAuthStore } from '@/stores/auth-store';

export default function RootIndexGuard() {
  const scheme = useColorScheme() ?? 'light';
  const status = useAuthStore((s) => s.status);
  const restoreError = useAuthStore((s) => s.restoreError);
  const restore = useAuthStore((s) => s.restore);
  const [onboarding, setOnboarding] = useState<{ loading: boolean; complete: boolean }>({
    loading: true,
    complete: false,
  });
  const bg = scheme === 'dark' ? '#1A1712' : '#EFEEE9';
  const accent = '#C4835E';

  useEffect(() => {
    let active = true;
    void getOnboardingComplete()
      .then((complete) => {
        if (active) setOnboarding({ loading: false, complete });
      })
      .catch(() => {
        if (active) setOnboarding({ loading: false, complete: false });
      });
    return () => {
      active = false;
    };
  }, []);

  if (onboarding.loading || status === 'idle' || status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: bg }}>
        <ActivityIndicator color={accent} size="large" />
      </View>
    );
  }

  if (!onboarding.complete) {
    return <Redirect href="/(onboarding)" />;
  }

  if (API_CONFIGURATION_ERROR || status === 'error') {
    return (
      <View style={[styles.errorContainer, { backgroundColor: bg }]} accessibilityRole="alert">
        <Text variant="headlineSmall" style={{ color: scheme === 'dark' ? '#F0BFA0' : '#81432D', fontWeight: '700' }}>
          Unable to connect
        </Text>
        <Text style={[styles.errorText, { color: scheme === 'dark' ? '#8C8578' : '#706C63' }]}>
          {API_CONFIGURATION_ERROR ?? restoreError ?? 'The saved session could not be restored.'}
        </Text>
        {API_BASE_URL ? (
          <Text variant="bodySmall" style={{ color: scheme === 'dark' ? '#8C8578' : '#706C63' }}>
            API: {API_BASE_URL}
          </Text>
        ) : null}
        <Button mode="contained" buttonColor={accent} textColor="#F8F7F2" onPress={() => void restore()}>
          Retry
        </Button>
      </View>
    );
  }

  if (status === 'unauthenticated') {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32 },
  errorText: { maxWidth: 420, textAlign: 'center' },
});
