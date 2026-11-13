import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { C, THEME } from '../constants/theme';

type Props = {
  accent?: string;
  shadowColor?: string;
  dy?: number;
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
};

/** The brutalist surface primitive: flat fill, 3 px border, hard offset shadow. */
export function HardCard({ accent = C.stroke, shadowColor, dy = 4, style, children }: Props) {
  return (
    <View
      style={[
        styles.card,
        { borderColor: accent },
        THEME.hardShadow(shadowColor || C.bgAlt, dy),
        style as ViewStyle,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderWidth: THEME.border.card,
    borderRadius: THEME.radius.card,
  },
});
