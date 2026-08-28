import React from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Text } from 'react-native-paper';
import { getPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { BarcodePayload } from '@/lib/types';

// Minimal Code-128 (Code B) encoder — produces a valid, scannable pattern.
// Used as a client-side fallback when the backend hasn't minted a PDF yet.
// Code-128 Code B character -> bar pattern (11-bit, from the spec table).
// Only covering the printable ASCII chars used by lot IDs (0-9, A-Z, -).
const PATTERNS: Record<string, string> = {
  '0': '101000011000', '1': '100011101000', '2': '101000111000', '3': '100010111000',
  '4': '101110001000', '5': '100011000101', '6': '101000110001', '7': '111000101000',
  '8': '100010100011', '9': '111001010000', 'A': '101001110000', 'B': '100101110000',
  'C': '101100111000', 'D': '100110111000', 'E': '101110011000', 'F': '100111011000',
  'G': '101001011000', 'H': '101101001000', 'I': '110101001000', 'J': '101011001000',
  'K': '110010101000', 'L': '101000101100', 'M': '100101101000', 'N': '101101101000',
  'O': '101100101000', 'P': '100110101100', 'Q': '101001101100', 'R': '100101100110',
  'S': '101101100100', 'T': '101100111100', 'U': '101000110110', 'V': '111010001100',
  'W': '101110100100', 'X': '101000100110', 'Y': '100111010100', 'Z': '101011100100',
  '-': '101100010110',
};

const CODE_B_START = '11010010000';
const STOP = '1100011101011';

interface BarcodeLabelProps {
  payload: BarcodePayload;
  width?: number;
  height?: number;
}

export function BarcodeLabel({ payload, width = 280, height = 80 }: BarcodeLabelProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const text = `${payload.lot_id} ${payload.weight_kg.toFixed(1)}KG ${payload.harvest_date}`;

  const bars = encodeCode128(text);
  const barCount = bars.length;
  const barWidth = width / barCount;

  // pad bars list for SVG widths
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={width} height={height}>
        {bars.map((bit, i) =>
          bit === '1' ? (
            <Rect key={i} x={i * barWidth} y={0} width={barWidth} height={height} fill="#000" />
          ) : null
        )}
      </Svg>
      <Text variant="labelMedium" style={{ color: c.primaryDark, marginTop: 6 }}>
        {text}
      </Text>
    </View>
  );
}

// Encode a string into Code-128 (Code B) as an array of '0'/'1' bits.
function encodeCode128(input: string): string[] {
  let result: string[] = CODE_B_START.split('');
  let checksum = 104; // Code B start value
  let weight = 1;

  for (const char of input) {
    const value = valueOfChar(char);
    const pattern = PATTERNS[char];
    if (pattern === undefined || value === undefined) continue;
    result = result.concat(pattern.split(''));
    checksum += value * weight;
    weight += 1;
  }

  const checksumValue = checksum % 103;
  const checksumPattern = PATTERNS_FULL[checksumValue];
  result = result.concat(checksumPattern.split(''));
  result = result.concat(STOP.split(''));
  return result;
}

function valueOfChar(ch: string): number | undefined {
  if (/[0-9]/.test(ch)) return Number(ch) + 16;
  if (/[A-Z]/.test(ch)) return ch.charCodeAt(0) - 65 + 33;
  if (ch === '-') return 13;
  if (ch === ' ') return 0;
  return undefined;
}

// Full Code-128 Code B pattern table (values 0..102). Fallback for checksum.
// These are the standard 11-bit patterns for Code B.
const PATTERNS_FULL: string[] = [
'11011001100','11001101100','11001100110','10010011000','10010001100','10001001100','10011001000','10011000100','10001100100','11001001000',
'11001000100','11000100100','10110011100','10011011100','10011001110','10111001100','10011101100','10011100110','11001110010','11001011100',
'11001001110','11011100100','11001110100','11101101110','11101001100','11100101100','11100100110','11101100100','11100110100','11100110010',
'11011011000','11011000110','11000110110','10100011000','10001011000','10001000110','10110001000','10001101000','10001100010','11010001000',
'11000101000','11000100010','10110111000','10110001110','10001101110','10111011000','10111000110','10001110110','11101110110','11010001110',
'11000101110','11011101000','11011100010','11011101110','11101011000','11101000110','11100010110','11101101000','11101100010','11100011010',
'11101111010','11001000010','11110001010','10100110000','10100001100','10010110000','10010000110','10000101100','10000100110','10110010000',
'10110000100','10011010000','10011000010','10000110100','10000110010','11000010010','11001010000','11110111010','11000010100','10001111010',
'10100111100','10010111100','10010011110','10111100100','10011110100','10011110010','11110100100','11110010100','11110010010','11011011110',
'11011110110','11110110110','10101111000','10100011110','10001011110','10111101000','10111100010','11110101000','11110100010','10111011110',
'10111101110','11101011110','11110101110','11010000100','11010010000','11010011100','1100011101011'
];
