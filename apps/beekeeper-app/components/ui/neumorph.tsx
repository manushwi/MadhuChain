import React from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { getPalette, neuInset, neuShadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface NeumorphProps extends ViewProps {
  /** true = extruded card, false = inset (pressed/input) */
  inset?: boolean;
  surface?: 'surface' | 'surfaceAlt' | 'background';
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Reusable neumorphic wrapper: applies the themed dual-edge shadow +
 * surface color on top of any children. Layers a thin styling pass over
 * mantained components so screens don't hand-roll shadows.
 */
export function Neumorph({
  inset = false,
  surface = 'surface',
  borderRadius = 20,
  style,
  children,
  ...rest
}: NeumorphProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const shadow = inset ? neuInset(scheme) : neuShadow(scheme);

  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: c[surface],
          borderRadius,
          padding: 16,
        },
        shadow,
        style,
      ]}>
      {children}
    </View>
  );
}
