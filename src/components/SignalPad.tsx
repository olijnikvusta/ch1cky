import React, { useCallback, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { C, THEME } from '../constants/theme';
import { CallKind } from '../game/types';
import { usePressScale } from '../hooks/usePressScale';
import { ShapeGlyph, SIGNAL_SHAPE } from './ShapeGlyph';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

type Props = {
  kind: CallKind;
  label: string;
  color: string;
  width: number;
  height: number;
  shapes: boolean;
  disabled: boolean;
  onPress: (kind: CallKind) => void;
};

/** Darkens a #rrggbb by the given factor — used for the hard pressed-in shadow. */
export function darken(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * factor);
  const g = Math.round(((n >> 8) & 255) * factor);
  const b = Math.round((n & 255) * factor);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function SignalPadBase({ kind, label, color, width, height, shapes, disabled, onPress }: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.94);
  const [down, setDown] = useState(false);

  const handleIn = useCallback(() => {
    setDown(true);
    onPressIn();
  }, [onPressIn]);

  const handleOut = useCallback(() => {
    setDown(false);
    onPressOut();
  }, [onPressOut]);

  const handlePress = useCallback(() => onPress(kind), [onPress, kind]);

  return (
    <Pressable
      onPress={disabled ? undefined : handlePress}
      onPressIn={disabled ? undefined : handleIn}
      onPressOut={disabled ? undefined : handleOut}
      disabled={disabled}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={{ width, height, opacity: disabled ? 0.4 : 1 }}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.pad,
          {
            width,
            height,
            borderColor: color,
            backgroundColor: color + '2E',
            transform: [{ scale }],
          },
          THEME.hardShadow(darken(color, 0.45), down ? 1 : 5),
        ]}>
        {shapes ? (
          <View style={styles.glyph}>
            <ShapeGlyph shape={SIGNAL_SHAPE[kind]} size={22} color={color} />
          </View>
        ) : null}
        <Text style={[styles.label, { color }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pad: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: THEME.border.card,
    borderRadius: THEME.radius.card,
  },
  glyph: { alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 20, lineHeight: 24, fontWeight: '800', letterSpacing: 2 },
});

export const SignalPad = React.memo(SignalPadBase);
export const PAD_COLORS: Record<CallKind, string> = {
  go: C.signalGo,
  slow: C.signalSlow,
  stop: C.signalStop,
  egg: C.secondary,
};
