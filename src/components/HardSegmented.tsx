import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { C, THEME } from '../constants/theme';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

type Props = {
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
  accent?: string;
};

function HardSegmentedBase({ options, value, onChange, accent = C.secondary }: Props) {
  return (
    <View style={styles.wrap}>
      {options.map(opt => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            hitSlop={HIT}
            accessibilityRole="button"
            accessibilityLabel={opt}
            accessibilityState={{ selected: active }}
            style={[
              styles.seg,
              {
                borderColor: active ? accent : C.stroke,
                backgroundColor: active ? accent + '2A' : C.bgAlt,
              },
              THEME.hardShadow(C.bg, 3),
            ]}>
            <Text style={[styles.label, { color: active ? accent : C.textMute }]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 8 },
  seg: {
    width: 62,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: 2,
  },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '800', letterSpacing: 1 },
});

export const HardSegmented = React.memo(HardSegmentedBase);
