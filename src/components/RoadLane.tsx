import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { C } from '../constants/theme';

type Props = {
  index: number;
  active: boolean;
  width: number;
  height: number;
  rush: boolean;
};

/** One strip of asphalt with its dashed centre line. */
function RoadLaneBase({ index, active, width, height, rush }: Props) {
  const base = index % 2 === 0 ? C.bgAlt : '#0E0E18';
  return (
    <View
      style={[
        styles.lane,
        {
          height,
          backgroundColor: active ? '#171729' : base,
          borderBottomColor: rush ? C.signalStop : C.strokeDim,
          borderBottomWidth: rush ? 2 : 1,
        },
      ]}>
      <Svg width={width} height={2} style={styles.dash}>
        <Line
          x1={0}
          y1={1}
          x2={width}
          y2={1}
          stroke={C.signalSlow}
          strokeOpacity={active ? 0.65 : 0.35}
          strokeWidth={3}
          strokeDasharray="18 14"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  lane: { width: '100%', justifyContent: 'center' },
  dash: { alignSelf: 'center' },
});

export const RoadLane = React.memo(RoadLaneBase);
