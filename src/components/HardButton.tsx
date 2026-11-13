import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { C, THEME } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  accent?: string;
  disabled?: boolean;
  height?: number;
  width?: number | '100%';
};

/**
 * Every CTA on every screen. Plain uppercase <Text> label (never an image, never a
 * glyph), gradient fill plus a coloured hard shadow, and a visibly dimmed disabled
 * state. Pressable is the parent; the animated view is its child.
 */
export function HardButton({
  label,
  onPress,
  variant = 'primary',
  accent = C.primary,
  disabled = false,
  height = 60,
  width = '100%',
}: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.95);
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : onPressIn}
      onPressOut={disabled ? undefined : onPressOut}
      disabled={disabled}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[styles.press, { width, height, opacity: disabled ? 0.4 : 1 }]}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.body,
          {
            height,
            borderColor: isPrimary ? C.text : accent,
            backgroundColor: isPrimary ? C.primary : C.bgAlt,
            transform: [{ scale }],
          },
          THEME.hardShadow(isPrimary ? C.secondary : accent, 5),
        ]}>
        {isPrimary ? (
          <LinearGradient
            colors={[C.primary, C.primaryDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View style={styles.row}>
          <Text style={[styles.label, { color: isPrimary ? C.text : accent }]}>{label}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { justifyContent: 'center' },
  body: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: THEME.border.card,
    borderRadius: THEME.radius.card,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  label: { fontSize: 17, lineHeight: 24, fontWeight: '800', letterSpacing: 2 },
});
