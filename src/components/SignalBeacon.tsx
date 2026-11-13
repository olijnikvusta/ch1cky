import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

import { ASSETS } from '../assets';
import { C, THEME } from '../constants/theme';
import { CallKind, SignalCall } from '../game/types';
import { PAD_COLORS } from './SignalPad';
import { ShapeGlyph, SIGNAL_SHAPE } from './ShapeGlyph';

const ORDER: readonly CallKind[] = ['go', 'slow', 'stop', 'egg'];

type LampProps = {
  kind: CallKind;
  lit: boolean;
  shapes: boolean;
};

function Lamp({ kind, lit, shapes }: LampProps) {
  const pulse = useRef(new Animated.Value(1)).current;
  const color = PAD_COLORS[kind];

  useEffect(() => {
    if (!lit) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 300, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, lit]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.lamp,
        {
          borderColor: color,
          backgroundColor: lit ? color + '66' : C.bgAlt,
          opacity: lit ? 1 : 0.22,
          transform: [{ scale: pulse }],
        },
        lit ? THEME.hardShadow(color, 3) : null,
      ]}>
      {shapes ? <ShapeGlyph shape={SIGNAL_SHAPE[kind]} size={14} color={color} /> : null}
    </Animated.View>
  );
}

type Props = {
  call: SignalCall | null;
  stage: number;
  shapes: boolean;
  idle: boolean;
};

/** The beacon housing: sprite_5 plate + four lamps. Exactly one lamp is ever lit. */
function SignalBeaconBase({ call, stage, shapes, idle }: Props) {
  const active: CallKind | null = call
    ? stage === 1 && call.second
      ? call.second
      : call.kind
    : null;

  return (
    <View style={[styles.housing, THEME.hardShadow(C.bg, 6)]}>
      <Image source={ASSETS.sprite5} style={styles.plate} resizeMode="contain" />
      <View style={styles.grid}>
        {ORDER.map(kind => (
          <Lamp key={kind} kind={kind} lit={active === kind} shapes={shapes} />
        ))}
      </View>
      {idle ? <Text style={styles.idle}>TAP TO BEGIN</Text> : null}
      {call && call.second ? (
        <Text style={styles.double}>DOUBLE {stage === 0 ? '1 / 2' : '2 / 2'}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  housing: {
    width: 118,
    height: 136,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bg,
    borderWidth: THEME.border.card,
    borderColor: C.stroke,
    borderRadius: THEME.radius.card,
  },
  plate: { position: 'absolute', width: 110, height: 128, opacity: 0.6 },
  grid: {
    width: 86,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  lamp: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 2,
  },
  idle: {
    position: 'absolute',
    bottom: 8,
    color: C.textDim,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  double: {
    position: 'absolute',
    bottom: 8,
    color: C.gold,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

export const SignalBeacon = React.memo(SignalBeaconBase);
