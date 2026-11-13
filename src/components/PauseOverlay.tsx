import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { C } from '../constants/theme';
import { HardButton } from './HardButton';

type Props = {
  level: number;
  lane: number;
  lanes: number;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
};

export function PauseOverlay({ level, lane, lanes, onResume, onRestart, onMenu }: Props) {
  return (
    <View style={styles.scrim}>
      <Text style={styles.title}>PAUSED</Text>
      <Text style={styles.sub}>
        LEVEL {level} · LANE {lane} / {lanes}
      </Text>
      <View style={styles.actions}>
        <HardButton label="RESUME" onPress={onResume} height={56} />
        <HardButton label="RESTART" onPress={onRestart} variant="secondary" accent={C.signalSlow} height={56} />
        <HardButton label="MENU" onPress={onMenu} variant="secondary" accent={C.stroke} height={56} />
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
  title: { color: C.text, fontSize: 30, fontWeight: '800', letterSpacing: 3 },
  sub: { marginTop: 8, color: C.textDim, fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  actions: { marginTop: 28, width: '100%', gap: 12 },
});
