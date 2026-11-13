import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Lock } from 'lucide-react-native';

import { C, THEME } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';
import { StarRow } from './StarRow';

const HIT = { top: 6, bottom: 6, left: 6, right: 6 };

type Props = {
  level: number;
  stars: number;
  locked: boolean;
  zoneColor: string;
  size: number;
  onPress: (level: number) => void;
};

function LevelCardBase({ level, stars, locked, zoneColor, size, onPress }: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.93);
  const handlePress = React.useCallback(() => onPress(level), [onPress, level]);

  return (
    <Pressable
      onPress={locked ? undefined : handlePress}
      onPressIn={locked ? undefined : onPressIn}
      onPressOut={locked ? undefined : onPressOut}
      disabled={locked}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={'LEVEL ' + level}
      accessibilityState={{ disabled: locked }}
      style={{ width: size, height: size }}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.card,
          {
            width: size,
            height: size,
            borderColor: locked ? C.stroke : zoneColor,
            backgroundColor: locked ? C.bgAlt : C.surface,
            opacity: locked ? 0.55 : 1,
            transform: [{ scale }],
          },
          THEME.hardShadow(locked ? C.bgAlt : C.bg, 4),
        ]}>
        {locked ? (
          <Lock size={20} color={C.textMute} />
        ) : (
          <View style={styles.inner}>
            <Text style={styles.num}>{level}</Text>
            <StarRow earned={stars} size={10} />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: THEME.border.card,
    borderRadius: THEME.radius.card,
  },
  inner: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  num: { color: C.text, fontSize: 22, fontWeight: '800' },
});

export const LevelCard = React.memo(LevelCardBase);
