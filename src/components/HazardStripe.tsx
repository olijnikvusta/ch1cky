import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Pattern, Path, Rect } from 'react-native-svg';

import { C } from '../constants/theme';

type Props = {
  width: number;
  height?: number;
  color?: string;
  opacity?: number;
};

/** Diagonal road-works banding — the brutalist signature band. */
function HazardStripeBase({ width, height = 14, color = C.signalSlow, opacity = 0.35 }: Props) {
  const id = 'hazard' + Math.round(width) + Math.round(height);
  return (
    <View pointerEvents="none" style={[styles.wrap, { width, height, opacity }]}>
      <Svg width={width} height={height}>
        <Defs>
          <Pattern id={id} patternUnits="userSpaceOnUse" width={24} height={height}>
            <Rect x={0} y={0} width={24} height={height} fill={C.bg} />
            <Path d={`M0 ${height} L12 0 L24 0 L12 ${height} Z`} fill={color} />
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
});

export const HazardStripe = React.memo(HazardStripeBase);
