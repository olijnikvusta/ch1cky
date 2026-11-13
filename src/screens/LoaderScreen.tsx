import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ASSETS } from '../assets';
import { HazardStripe } from '../components/HazardStripe';
import { ProgressBar } from '../components/ProgressBar';
import { ScreenShell } from '../components/ScreenShell';
import { LOADER_DURATION_MS } from '../constants/config';
import { C, THEME } from '../constants/theme';

type Props = {
  onDone: () => void;
};

/**
 * Brand card only: no PLAY button, no stat chips, no tap handler. The move to Menu
 * is driven purely by the 8 s timer, never by an animation callback or a touch.
 */
export function LoaderScreen({ onDone }: Props) {
  const { width } = useWindowDimensions();
  const plate = useRef(new Animated.Value(0)).current;
  const title = useRef(new Animated.Value(0)).current;
  const subtitle = useRef(new Animated.Value(0)).current;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const intro = Animated.parallel([
      Animated.spring(plate, { toValue: 1, tension: 40, friction: 7, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(380),
        Animated.timing(title, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(subtitle, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]);
    intro.start();

    const timer = setTimeout(() => onDoneRef.current(), LOADER_DURATION_MS);
    return () => {
      intro.stop();
      clearTimeout(timer);
    };
  }, [plate, title, subtitle]);

  const plateScale = plate.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] });
  const barWidth = Math.min(240, width - 80);

  return (
    <ScreenShell overlay={THEME.overlays.loader} bgOpacity={0.18} blob={C.primary} blobSize={340}>
      <View style={styles.root}>
        <View style={styles.stripeTop}>
          <HazardStripe width={width} height={14} opacity={0.35} />
        </View>

        <View style={styles.center}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.plate,
              THEME.hardShadow(C.primary, 6),
              { opacity: plate, transform: [{ scale: plateScale }] },
            ]}>
            <Image source={ASSETS.logo} style={styles.logo} resizeMode="contain" />
          </Animated.View>

          <Animated.Text style={[styles.title, { opacity: title }]}>CH1CKY</Animated.Text>
          <Animated.Text style={[styles.subtitle, { opacity: subtitle }]}>
            SIGNAL STEPS
          </Animated.Text>

          <View style={styles.barWrap}>
            <ProgressBar
              progress={1}
              width={barWidth}
              height={10}
              colors={[C.primary, C.secondary]}
              animateMs={LOADER_DURATION_MS}
            />
            <Text style={styles.status}>LOADING…</Text>
          </View>
        </View>

        <View style={styles.stripeBottom}>
          <HazardStripe width={width} height={14} opacity={0.35} />
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center' },
  stripeTop: { position: 'absolute', top: '18%', left: 0, right: 0 },
  stripeBottom: { position: 'absolute', top: '82%', left: 0, right: 0 },
  center: { alignItems: 'center', justifyContent: 'center' },
  plate: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bgAlt,
    borderWidth: THEME.border.card,
    borderColor: C.primary,
    borderRadius: THEME.radius.card,
  },
  logo: { width: 148, height: 148 },
  title: {
    marginTop: 28,
    color: C.text,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 3,
    textShadowColor: C.primary,
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 0,
  },
  subtitle: {
    marginTop: 10,
    color: C.secondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 4,
  },
  barWrap: { marginTop: 40, alignItems: 'center' },
  status: {
    marginTop: 10,
    color: C.textMute,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
