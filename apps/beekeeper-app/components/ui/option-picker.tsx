import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

import { getPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface OptionPickerProps {
  label: string;
  options: string[];
  value?: string | null;
  onChange: (value: string) => void;
  otherLabel?: string;
  placeholder?: string;
}

/**
 * Fixed-options + free-text-fallback selector. Shows the provided options as
 * selectable chips; when "Other" is picked (or the current value isn't one of
 * the options), a free-text input appears so the user can type their own answer.
 */
export function OptionPicker({
  label,
  options,
  value,
  onChange,
  otherLabel = 'Other / type your own',
  placeholder = 'Type your own…',
}: OptionPickerProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const [customText, setCustomText] = useState('');

  const isPreset = value != null && options.includes(value);
  const isOtherSelected = value != null && !isPreset;

  useEffect(() => {
    if (isOtherSelected && value != null && value !== customText) {
      setCustomText(value);
    }
  }, [isOtherSelected, value, customText]);

  const pick = (option: string) => {
    if (option === value) {
      onChange('');
      return;
    }
    onChange(option);
  };

  const pickOther = () => {
    if (!isOtherSelected) {
      onChange(customText || 'Other');
    }
  };

  return (
    <View style={styles.wrap}>
      <Text variant="labelLarge" style={{ color: c.primaryDark, marginBottom: 6 }}>{label}</Text>
      <View style={styles.chips}>
        {options.map((option) => (
          <Pressable key={option} onPress={() => pick(option)}>
            {({ pressed }) => (
              <View
                style={[
                  styles.chip,
                  {
                    borderColor: option === value ? c.accent : c.sand,
                    backgroundColor: option === value ? c.accent : 'transparent',
                  },
                  pressed ? { opacity: 0.8 } : undefined,
                ]}>
                <Text
                  variant="labelMedium"
                  style={{ color: option === value ? c.highlight : c.primaryDark }}>
                  {option}
                </Text>
              </View>
            )}
          </Pressable>
        ))}
        <Pressable onPress={pickOther}>
          {({ pressed }) => (
            <View
              style={[
                styles.chip,
                {
                  borderColor: isOtherSelected ? c.accent : c.sand,
                  backgroundColor: isOtherSelected ? c.accent : 'transparent',
                },
                pressed ? { opacity: 0.8 } : undefined,
              ]}>
              <Text variant="labelMedium" style={{ color: isOtherSelected ? c.highlight : c.primaryDark }}>
                {otherLabel}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {isOtherSelected && (
        <TextInput
          mode="outlined"
          label={placeholder}
          value={customText}
          onChangeText={(text) => {
            setCustomText(text);
            onChange(text);
          }}
          style={styles.input}
          activeOutlineColor={c.accent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  input: { backgroundColor: 'transparent', marginTop: 4 },
});
