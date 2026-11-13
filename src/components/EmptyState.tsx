import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { C, THEME } from '../constants/theme';

type Props = {
  title: string;
  hint: string;
  accent?: string;
};

/** A themed message, centred in its container — never a blank area. */
function EmptyStateBase({ title, hint, accent = C.stroke }: Props) {
  return (
    <View style={[styles.wrap, { borderColor: accent }, THEME.hardShadow(C.bgAlt, 4)]}>
      <View style={[styles.mark, { backgroundColor: accent }]} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surface,
    borderWidth: THEME.border.card,
    borderRadius: THEME.radius.card,
  },
  mark: { width: 10, height: 10, marginBottom: 10 },
  title: {
    color: C.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  hint: {
    marginTop: 6,
    color: C.textMute,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
});

export const EmptyState = React.memo(EmptyStateBase);
