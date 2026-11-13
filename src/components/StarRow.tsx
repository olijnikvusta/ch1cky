import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { C } from '../constants/theme';

type Props = {
  earned: number;
  total?: number;
  size?: number;
  animate?: boolean;
};

/** The star glyph is on the safe list on Android; it never falls back to tofu. */
function Star({
  filled,
  size,
  animate,
  index,
}: {
  filled: boolean;
  size: number;
  animate: boolean;
  index: number;
}) {
  const scale = useRef(new Animated.Value(animate ? 0 : 1)).current;

  useEffect(() => {
    if (!animate) {
      scale.setValue(1);
      return;
    }
    const a = Animated.sequence([
      Animated.delay(120 * index),
      Animated.spring(scale, { toValue: 1.25, tension: 220, friction: 9, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 220, friction: 9, useNativeDriver: true }),
    ]);
    a.start();
    return () => a.stop();
  }, [scale, animate, index]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Text
        style={[
          styles.star,
          {
            fontSize: size,
            lineHeight: size * 1.15,
            color: filled ? C.gold : C.stroke,
          },
          filled && size > 20 ? styles.glow : null,
        ]}>
        {'★'}
      </Text>
    </Animated.View>
  );
}

function StarRowBase({ earned, total = 3, size = 12, animate = false }: Props) {
  const stars = [];
  for (let i = 0; i < total; i += 1) {
    stars.push(
      <Star key={i} index={i} filled={i < earned} size={size} animate={animate} />,
    );
  }
  return <View style={[styles.row, { gap: Math.max(2, size * 0.2) }]}>{stars}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  star: { fontWeight: '800' },
  glow: {
    textShadowColor: C.primary,
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 0,
  },
});

export const StarRow = React.memo(StarRowBase);
