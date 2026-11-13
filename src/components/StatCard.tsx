import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { C, THEME } from '../constants/theme';

type Props = {
  value: string;
  label: string;
  accent: string;
  /** Renders null when there is nothing to show — never an empty rounded box. */
  hideWhenEmpty?: boolean;
  height?: number;
};

/**
 * All stat cards in a row share one shape: an accent square (not a PNG sprite, so
 * nothing can differ in aspect ratio), one big value, one caption. Only the colour
 * and the number change between them.
 */
function StatCardBase({ value, label, accent, hideWhenEmpty = true, height }: Props) {
  const empty = !value || value === '0' || value === 'x0' || value === '0 %';
  if (hideWhenEmpty && empty) {
    return null;
  }
  return (
    <View
      style={[
        styles.card,
        height ? { height } : null,
        { borderColor: accent },
        THEME.hardShadow(C.bgAlt, 4),
      ]}>
      <View style={[styles.accentSquare, { backgroundColor: accent }]} />
      <Text numberOfLines={1} style={[styles.value, { color: accent }]}>
        {value}
      </Text>
      <Text numberOfLines={1} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // width 100 % (never flex:1 inside a flex:1 slot) + intrinsic height.
  card: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surface,
    borderWidth: THEME.border.card,
    borderRadius: THEME.radius.card,
  },
  accentSquare: { width: 8, height: 8, marginBottom: 8 },
  value: { fontSize: 24, fontWeight: '800', letterSpacing: 0.5 },
  label: {
    marginTop: 4,
    color: C.textMute,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});

export const StatCard = React.memo(StatCardBase);
