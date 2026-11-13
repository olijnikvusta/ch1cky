import React from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { ASSETS } from '../assets';
import { usePressScale } from '../hooks/usePressScale';
import { C, THEME } from '../constants/theme';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

type BackProps = {
  onPress: () => void;
  label?: string;
};

/** The one way back. Caption is literal text so the UI walker can find it. */
export function HeaderBackButton({ onPress, label = 'MENU' }: BackProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.92);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.backPress}>
      <Animated.View style={[styles.backPlate, { transform: [{ scale }] }]} pointerEvents="box-none">
        <Image source={ASSETS.buttonRound} style={styles.backPlateArt} resizeMode="contain" />
        <View style={styles.row}>
          <Image source={ASSETS.iconHome} style={styles.icon24} resizeMode="contain" />
          <Text style={styles.backLabel}>{label}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

type Props = {
  title: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  accent?: string;
};

/**
 * The shared header for every screen — one component, different slots, so the
 * styling cannot drift between Menu, Game, Result and the sub-screens.
 */
export function ScreenHeader({ title, leftSlot, rightSlot, accent = C.stroke }: Props) {
  return (
    <View style={[styles.header, { borderBottomColor: accent }]}>
      <View style={styles.side}>{leftSlot}</View>
      <View style={styles.center}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      </View>
      <View style={[styles.side, styles.sideRight]}>{rightSlot}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 44,
    height: 116,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.38)',
    borderBottomWidth: 3,
  },
  side: { width: 112, justifyContent: 'center' },
  sideRight: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    color: C.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  backPress: { width: 108, height: 48 },
  backPlate: {
    width: 108,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bgAlt,
    borderWidth: THEME.border.card,
    borderColor: C.primary,
    borderRadius: THEME.radius.card,
    ...THEME.hardShadow(C.primaryDeep, 4),
  },
  backPlateArt: {
    position: 'absolute',
    width: 108,
    height: 48,
    opacity: 0.3,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  icon24: { width: 24, height: 24, resizeMode: 'contain' },
  backLabel: {
    color: C.text,
    fontSize: 13,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
