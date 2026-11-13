import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { C, THEME } from '../constants/theme';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

type Props = {
  value: boolean;
  onChange: (next: boolean) => void;
  accent?: string;
  label: string;
};

function HardToggleBase({ value, onChange, accent = C.signalGo, label }: Props) {
  const pos = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(pos, {
      toValue: value ? 1 : 0,
      tension: 220,
      friction: 14,
      useNativeDriver: true,
    }).start();
  }, [pos, value]);

  const translateX = pos.interpolate({ inputRange: [0, 1], outputRange: [0, 24] });

  return (
    <Pressable
      onPress={() => onChange(!value)}
      hitSlop={HIT}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      style={styles.press}>
      <View
        style={[
          styles.track,
          {
            borderColor: value ? accent : C.stroke,
            backgroundColor: value ? accent + '40' : C.bgAlt,
          },
        ]}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.knob,
            { backgroundColor: value ? accent : C.textMute, transform: [{ translateX }] },
            THEME.hardShadow(C.bg, 3),
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: 56, height: 48, alignItems: 'center', justifyContent: 'center' },
  track: {
    width: 56,
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 3,
    borderRadius: 2,
  },
  knob: { width: 22, height: 22, borderRadius: 1 },
});

export const HardToggle = React.memo(HardToggleBase);
