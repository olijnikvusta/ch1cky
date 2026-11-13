import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Shared press feedback. The <Pressable> is always the PARENT and the
 * <Animated.View> the CHILD, so no animated wrapper can swallow the tap.
 * Only transform is animated, so useNativeDriver is safe.
 */
export function usePressScale(target: number = 0.94) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: target,
      tension: 300,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [scale, target]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 300,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return { scale, onPressIn, onPressOut };
}
