import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LayoutGrid, Play, Settings as SettingsIcon, Sparkles, Trophy } from 'lucide-react-native';

import { ASSETS } from '../assets';
import { BentoTile } from '../components/BentoTile';
import { EmptyState } from '../components/EmptyState';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenShell } from '../components/ScreenShell';
import { StatCard } from '../components/StatCard';
import { TOTAL_CHARMS, TOTAL_LEVELS } from '../constants/config';
import { C, THEME } from '../constants/theme';
import { LEVEL_NAMES, zoneOf } from '../game/levels';
import { useGameProgress } from '../hooks/useGameProgress';
import { usePressScale } from '../hooks/usePressScale';
import { groupNumber } from '../utils/format';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

type Props = {
  onPlay: () => void;
  onLevels: () => void;
  onCollection: () => void;
  onProgress: () => void;
  onSettings: () => void;
};

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function MenuScreen({ onPlay, onLevels, onCollection, onProgress, onSettings }: Props) {
  const { height } = useWindowDimensions();
  const { profile, stars, nextLevel } = useGameProgress();

  const bodyH = height - 116 - 32 - 24;
  const heroH = clamp(Math.round(bodyH * 0.44), 170, 240);
  const statH = Math.round((heroH - 12) / 2);
  const tileH = clamp(Math.round((bodyH - heroH - 12) / 2), 72, 112);

  const breathe = useRef(new Animated.Value(0)).current;
  const { scale, onPressIn, onPressOut } = usePressScale(0.96);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathe]);

  const breatheScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.012] });
  const zone = zoneOf(nextLevel);
  const charmCount = profile.charms.length;
  const bestScore = profile.stats.bestScore;
  const hasRuns = bestScore > 0 || stars > 0;

  return (
    <ScreenShell overlay={THEME.overlays.menu} bgOpacity={0.4} blob={C.primary} blobSize={360}>
      <ScreenHeader
        accent={C.primary}
        title="CH1CKY"
        leftSlot={
          <View style={styles.logoFrame}>
            <Image source={ASSETS.logo} style={styles.logoImg} resizeMode="contain" />
          </View>
        }
        rightSlot={
          <View style={styles.eggChip}>
            <Image source={ASSETS.sprite3} style={styles.eggImg} resizeMode="contain" />
            <Text style={styles.eggText}>x {profile.eggs}</Text>
          </View>
        }
      />

      <View style={styles.body}>
        <View style={[styles.row, { height: heroH }]}>
          <Pressable
            onPress={onPlay}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            hitSlop={HIT}
            accessibilityRole="button"
            accessibilityLabel="PLAY"
            style={styles.heroSlot}>
            <Animated.View
              pointerEvents="box-none"
              style={[
                styles.hero,
                THEME.hardShadow(C.secondary, 6),
                { transform: [{ scale }, { scale: breatheScale }] },
              ]}>
              <Image source={ASSETS.buttonRect} style={styles.heroPlate} resizeMode="stretch" />
              <LinearGradient
                colors={[C.primary, C.primaryDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFill, styles.heroGrad]}
              />
              <Text style={styles.heroCaption}>
                LEVEL {nextLevel} · {LEVEL_NAMES[nextLevel - 1]}
              </Text>
              <View style={styles.heroRow}>
                <View style={styles.icon28}>
                  <Play size={28} color={C.text} />
                </View>
                <Text style={styles.heroLabel}>PLAY</Text>
              </View>
              <Text style={styles.heroZone}>{zone.name}</Text>
            </Animated.View>
          </Pressable>

          <View style={styles.statCol}>
            {hasRuns ? (
              <>
                <View style={{ height: statH, justifyContent: 'center' }}>
                  <StatCard
                    value={groupNumber(bestScore)}
                    label="BEST SCORE"
                    accent={C.secondary}
                    hideWhenEmpty={false}
                  />
                </View>
                <View style={{ height: statH, justifyContent: 'center' }}>
                  <StatCard
                    value={stars + '/' + TOTAL_LEVELS * 3}
                    label="STARS"
                    accent={C.gold}
                    hideWhenEmpty={false}
                  />
                </View>
              </>
            ) : (
              <EmptyState
                title="NO RUNS YET"
                hint="CROSS YOUR FIRST ROAD"
                accent={C.secondary}
              />
            )}
          </View>
        </View>

        <View style={[styles.row, { height: tileH }]}>
          <View style={styles.tileSlot}>
            <BentoTile
              Icon={LayoutGrid}
              caption="LEVELS"
              sub={TOTAL_LEVELS + ' ROUTES · 3 ZONES'}
              accent={C.secondary}
              height={tileH}
              order={1}
              onPress={onLevels}
            />
          </View>
          <View style={styles.tileSlot}>
            <BentoTile
              Icon={Sparkles}
              caption="COLLECTION"
              sub={charmCount + ' / ' + TOTAL_CHARMS + ' CHARMS'}
              accent={C.gold}
              height={tileH}
              order={2}
              onPress={onCollection}
            />
          </View>
        </View>

        <View style={[styles.row, { height: tileH }]}>
          <View style={styles.tileSlot}>
            <BentoTile
              Icon={Trophy}
              caption="PROGRESS"
              sub="STATS & STREAKS"
              accent={C.signalGo}
              height={tileH}
              order={3}
              onPress={onProgress}
            />
          </View>
          <View style={styles.tileSlot}>
            <BentoTile
              Icon={SettingsIcon}
              caption="SETTINGS"
              sub="SIGNALS & ASSIST"
              accent={C.primary}
              height={tileH}
              order={4}
              onPress={onSettings}
            />
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  logoFrame: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: C.stroke,
    borderRadius: THEME.radius.chip,
    backgroundColor: C.bgAlt,
  },
  logoImg: { width: 34, height: 34 },
  eggChip: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: C.gold,
    borderRadius: THEME.radius.chip,
    backgroundColor: 'rgba(255,213,74,0.12)',
  },
  eggImg: { width: 20, height: 20 },
  eggText: { color: C.gold, fontSize: 13, lineHeight: 20, fontWeight: '800' },

  body: { flex: 1, padding: 16, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  heroSlot: { flex: 2, height: '100%' },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
    borderWidth: THEME.border.card,
    borderColor: C.text,
    borderRadius: THEME.radius.card,
    overflow: 'hidden',
  },
  heroPlate: { position: 'absolute', width: '100%', height: '100%', opacity: 0.35 },
  heroGrad: { opacity: 0.88 },
  heroCaption: {
    color: 'rgba(255,255,255,0.80)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  heroRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  icon28: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  heroLabel: { color: C.text, fontSize: 28, lineHeight: 28, fontWeight: '800', letterSpacing: 3 },
  heroZone: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.72)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  statCol: { flex: 1, gap: 12, justifyContent: 'center' },
  tileSlot: { flex: 1 },
});
