import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { palette } from '@/src/theme/palette';
import { NeuCard, Screen, t } from '@/src/theme/primitives';

export default function RequestAccessScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.brand}>
          <Text style={t.h1}>HoneyChain</Text>
          <Text style={t.small}>provisioned operations access</Text>
        </View>
        <NeuCard style={{ gap: 14 }}>
          <Text style={t.h2}>Request an operator account</Text>
          <Text style={t.body}>
            Public sign-up is not available for custody, laboratory, factory, quality, distribution, or administrator accounts.
          </Text>
          <Text style={t.body}>
            Ask your HoneyChain site administrator to provision the correct role and facility access. Once issued, return here and sign in with your work email or phone number.
          </Text>
          <Text style={t.small}>Roles are assigned by workflow responsibility and cannot be selected at sign-in.</Text>
        </NeuCard>
        <Link href="/login" style={styles.link}>Return to sign in</Link>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 22 },
  brand: { alignItems: 'center', gap: 4 },
  link: { color: palette.accentDeep, fontWeight: '700', textAlign: 'center', minHeight: 44, paddingVertical: 12 },
});
