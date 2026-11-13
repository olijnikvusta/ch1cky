import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { C, THEME } from '../constants/theme';
import { HardButton } from './HardButton';

type Props = {
  title: string;
  hint: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  title,
  hint,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <View style={styles.scrim}>
      <View style={[styles.panel, THEME.hardShadow(C.signalStop, 6)]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.hint}>{hint}</Text>
        <View style={styles.actions}>
          <HardButton label={cancelLabel} onPress={onCancel} variant="secondary" accent={C.stroke} height={52} />
          <HardButton label={confirmLabel} onPress={onConfirm} variant="secondary" accent={C.signalStop} height={52} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,10,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  panel: {
    width: '100%',
    padding: 20,
    backgroundColor: C.surface,
    borderWidth: THEME.border.card,
    borderColor: C.signalStop,
    borderRadius: THEME.radius.card,
  },
  title: { color: C.text, fontSize: 20, fontWeight: '800', letterSpacing: 1.5, textAlign: 'center' },
  hint: {
    marginTop: 8,
    color: C.textDim,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  actions: { marginTop: 20, gap: 12 },
});
