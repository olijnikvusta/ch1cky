import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';

import { ASSETS } from '../assets';

type Props = {
  lane: number;
  laneHeight: number;
  /** Bumped on a mistake: the bird flinches half a lane back without losing ground. */
  flinchNonce: number;
};

/** The hero sprite. Plain contain-fitted image over the road, never clipped or stretched. */
function ChickenRunnerBase({ lane, laneHeight, flinchNonce }: Props) {
  const y = useRef(new Animated.Value(0)).current;
  const squash = useRef(new Animated.Value(1)).current;
  const flinch = useRef(new Animated.Value(0)).current;
  const firstFlinch = useRef(true);
  // Keep the bird inside its lane so the road never clips it.
  const size = Math.round(Math.min(56, Math.max(28, laneHeight - 6)));

  useEffect(() => {
    const hop = Animated.parallel([
      Animated.spring(y, {
        toValue: -laneHeight * lane,
        tension: 180,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(squash, { toValue: 0.86, duration: 90, useNativeDriver: true }),
        Animated.timing(squash, { toValue: 1, duration: 90, useNativeDriver: true }),
      ]),
    ]);
    hop.start();
    return () => hop.stop();
  }, [y, squash, lane, laneHeight]);

  useEffect(() => {
    if (firstFlinch.current) {
      firstFlinch.current = false;
      return;
    }
    const a = Animated.sequence([
      Animated.timing(flinch, { toValue: laneHeight * 0.5, duration: 140, useNativeDriver: true }),
      Animated.spring(flinch, { toValue: 0, tension: 160, friction: 10, useNativeDriver: true }),
    ]);
    a.start();
    return () => a.stop();
  }, [flinch, flinchNonce, laneHeight]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          height: laneHeight,
          transform: [{ translateY: y }, { translateY: flinch }, { scaleY: squash }],
        },
      ]}>
      <Image
        source={ASSETS.sprite1}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const ChickenRunner = React.memo(ChickenRunnerBase);
