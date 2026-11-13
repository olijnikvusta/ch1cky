import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { ASSETS } from '../assets';
import { C } from '../constants/theme';
import { comboColor } from '../game/scoring';
import { formatMultiplier } from '../utils/format';
import { ProgressBar } from './ProgressBar';

type Props = {
  combo: number;
  multiplier: number;
  eggs: number;
  windowMs: number;
  nonce: number;
  running: boolean;
  barWidth: number;
};

/** Combo chip, live window bar and the egg chip. The bar is scaleX only. */
function ComboMeterBase({
  combo,
  multiplier,
  eggs,
  windowMs,
  nonce,
  running,
  barWidth,
}: Props) {
  const tint = comboColor(multiplier);
  return (
    <View style={styles.strip}>
      <View style={styles.side}>
        <Text style={[styles.mult, { color: tint }]}>{formatMultiplier(multiplier)}</Text>
        <Text style={styles.caption}>COMBO {combo}</Text>
      </View>

      <View style={styles.center}>
        <ProgressBar
          progress={1}
          width={barWidth}
          height={6}
          colors={[C.signalGo, C.signalSlow, C.signalStop]}
          countdownMs={windowMs > 0 ? windowMs : undefined}
          nonce={nonce}
          running={running}
        />
      </View>

      <View style={[styles.side, styles.sideRight]}>
        {eggs > 0 ? (
          <View style={styles.eggChip}>
            <Image source={ASSETS.sprite3} style={styles.egg} resizeMode="contain" />
            <Text style={styles.eggCount}>x {eggs}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: C.bgAlt,
    borderTopWidth: 3,
    borderTopColor: C.primary,
  },
  side: { width: 86, justifyContent: 'center' },
  sideRight: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center' },
  mult: { fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  caption: { color: C.textMute, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  eggChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  egg: { width: 16, height: 16 },
  eggCount: { color: C.gold, fontSize: 14, lineHeight: 16, fontWeight: '800' },
});

export const ComboMeter = React.memo(ComboMeterBase);
