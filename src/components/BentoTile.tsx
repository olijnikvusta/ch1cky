import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { C, THEME } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

type Props = {
  Icon: LucideIcon;
  caption: string;
  sub: string;
  accent: string;
  onPress: () => void;
  height: number;
  style?: ViewStyle;
  /** Entry stagger index. */
  order?: number;
};

/** One hub tile of the bento grid. The caption is the harness route word, verbatim. */
export function BentoTile({ Icon, caption, sub, accent, onPress, height, style, order = 0 }: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.96);
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const a = Animated.sequence([
      Animated.delay(60 * order),
      Animated.timing(enter, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]);
    a.start();
    return () => a.stop();
  }, [enter, order]);

  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={caption}
      style={[styles.press, { height }, style]}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.card,
          { height, borderColor: accent, opacity: enter, transform: [{ translateY }, { scale }] },
          THEME.hardShadow(C.bgAlt, 4),
        ]}>
        <View style={[styles.iconWrap, { borderColor: accent, backgroundColor: accent + '22' }]}>
          <Icon size={24} color={accent} />
        </View>
        <View style={styles.textCol}>
          <Text numberOfLines={1} style={styles.caption}>
            {caption}
          </Text>
          <Text numberOfLines={1} style={styles.sub}>
            {sub}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%' },
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    backgroundColor: C.surface,
    borderWidth: THEME.border.card,
    borderRadius: THEME.radius.card,
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 2,
  },
  textCol: { flex: 1 },
  caption: { color: C.text, fontSize: 15, fontWeight: '800', letterSpacing: 1.5 },
  sub: { marginTop: 3, color: C.textMute, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
});
