import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { Carousel, type CarouselHandle } from '@/components/onboarding-carousel';
import { Neumorph } from '@/components/ui/neumorph';
import { getPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { setOnboardingComplete } from '@/lib/onboarding';

const slides = [
  {
    icon: 'bee' as const,
    title: 'Monitor Your Hives',
    body: 'Live temperature, humidity and weight for every hive. Keep an eye on hive health from anywhere with healthy, watch and alert status badges.',
  },
  {
    icon: 'barcode-scan' as const,
    title: 'Record & Trace Harvests',
    body: 'Each harvest becomes a traceable, blockchain-backed raw batch with a printable barcode label to paste on your honey boxes.',
  },
  {
    icon: 'bell-ring-outline' as const,
    title: 'Stay Alert & In Control',
    body: 'Get notified instantly about theft, abnormal brood temperature, low battery or swarming signals — and act before it\'s too late.',
  },
];

export default function OnboardingScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const router = useRouter();
  const carousel = useRef<CarouselHandle>(null);
  const [index, setIndex] = useState(0);

  const goNext = () => {
    if (index < slides.length - 1) {
      carousel.current?.setPage(index + 1);
    } else {
      finish();
    }
  };

  const finish = async () => {
    await setOnboardingComplete(true);
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Carousel ref={carousel} onIndexChange={setIndex}>
        {slides.map((s) => (
          <View style={styles.slide} key={s.title}>
            <Neumorph style={styles.iconCard}>
              <MaterialCommunityIcons name={s.icon} size={72} color={c.accent} />
            </Neumorph>
            <Text variant="headlineMedium" style={[styles.title, { color: c.darkAccent }]}>
              {s.title}
            </Text>
            <Text variant="bodyLarge" style={[styles.body, { color: c.primaryDark }]}>
              {s.body}
            </Text>
          </View>
        ))}
      </Carousel>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === index ? c.accent : c.sand },
              ]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <Button mode="text" textColor={c.muted} onPress={finish}>
            Skip
          </Button>
          <Button
            mode="contained"
            buttonColor={c.accent}
            textColor={c.highlight}
            onPress={goNext}>
            {index === slides.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  iconCard: { marginBottom: 32, borderRadius: 28 },
  title: { textAlign: 'center', marginBottom: 12, fontWeight: '700' },
  body: { textAlign: 'center', lineHeight: 24 },
  footer: { paddingHorizontal: 24, paddingBottom: 40 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
