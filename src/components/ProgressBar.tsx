import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { C } from '../constants/theme';

type Props = {
  /** 0..1 */
  progress: number;
  width: number;
  height?: number;
  colors?: readonly string[];
  /** When set, the bar animates from 1 to 0 over this many ms (the signal window). */
  countdownMs?: number;
  /** Change this to restart the countdown. */
  nonce?: number;
  running?: boolean;
  animateMs?: number;
};

/**
 * scaleX only — width is never animated, so useNativeDriver stays legal.
 * The fill is anchored left by shifting the track origin, not by animating layout.
 */
function ProgressBarBase({
  progress,
  width,
  height = 10,
  colors = [C.primary, C.secondary],
  countdownMs,
  nonce = 0,
  running = true,
  animateMs = 420,
}: Props) {
  const value = useRef(new Animated.Value(countdownMs ? 1 : 0)).current;
  const anim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (anim.current) {
      anim.current.stop();
      anim.current = null;
    }
    if (countdownMs && countdownMs > 0) {
      value.setValue(1);
      if (!running) {
        return;
      }
      const a = Animated.timing(value, {
        toValue: 0,
        duration: countdownMs,
        useNativeDriver: true,
      });
      anim.current = a;
      a.start(() => {
        anim.current = null;
      });
      return;
    }
    const a = Animated.timing(value, {
      toValue: Math.max(0, Math.min(1, progress)),
      duration: animateMs,
      useNativeDriver: true,
    });
    anim.current = a;
    a.start(() => {
      anim.current = null;
    });
  }, [value, progress, countdownMs, nonce, running, animateMs]);

  return (
    <View style={[styles.track, { width, height }]}>
      <Animated.View
        style={[
          styles.fillWrap,
          {
            width,
            height,
            marginLeft: -width / 2,
            left: width / 2,
            transform: [{ scaleX: value }],
          },
        ]}>
        <LinearGradient
          colors={colors as string[]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: C.strokeDim,
    borderWidth: 2,
    borderColor: C.stroke,
    borderRadius: 0,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fillWrap: { position: 'absolute' },
});

export const ProgressBar = React.memo(ProgressBarBase);
