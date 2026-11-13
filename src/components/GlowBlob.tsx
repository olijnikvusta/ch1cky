import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  color: string;
  size?: number;
  top?: number;
  left?: number;
};

/** Three concentric neon circles — the glow layer that sits behind every screen. */
function GlowBlobBase({ color, size = 300, top = -90, left = -80 }: Props) {
  const r = size / 2;
  return (
    <View pointerEvents="none" style={[styles.wrap, { top, left, width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle cx={r} cy={r} r={r} fill={color} opacity={0.12} />
        <Circle cx={r} cy={r} r={r * 0.66} fill={color} opacity={0.08} />
        <Circle cx={r} cy={r} r={r * 0.36} fill={color} opacity={0.06} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
});

export const GlowBlob = React.memo(GlowBlobBase);
