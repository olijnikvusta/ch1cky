import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { ASSETS } from '../assets';
import { ChickenRunner } from '../components/ChickenRunner';
import { ComboMeter } from '../components/ComboMeter';
import { LivesRow } from '../components/LivesRow';
import { PauseOverlay } from '../components/PauseOverlay';
import { RoadLane } from '../components/RoadLane';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenShell } from '../components/ScreenShell';
import { SignalBeacon } from '../components/SignalBeacon';
import { PAD_COLORS, SignalPad } from '../components/SignalPad';
import { LIVES } from '../constants/config';
import { C, THEME } from '../constants/theme';
import { CALL_LABEL, padOrder } from '../game/signalEngine';
import { CallKind, RoundSummary } from '../game/types';
import { useGameProgress } from '../hooks/useGameProgress';
import { usePressScale } from '../hooks/usePressScale';
import { useSignalRound } from '../hooks/useSignalRound';
import { groupNumber } from '../utils/format';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };
const HINT_MS = 4000;

type Props = {
  level: number;
  onGameOver: (summary: RoundSummary) => void;
  onMenu: () => void;
};

function PauseButton({ onPress }: { onPress: () => void }) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.92);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel="PAUSE"
      style={styles.pausePress}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.pauseBtn, THEME.hardShadow(C.primaryDeep, 4), { transform: [{ scale }] }]}>
        <Image source={ASSETS.buttonRound} style={styles.pausePlate} resizeMode="contain" />
        <Image source={ASSETS.iconPause} style={styles.pauseIcon} resizeMode="contain" />
      </Animated.View>
    </Pressable>
  );
}

export function GameScreen({ level, onGameOver, onMenu }: Props) {
  const { width } = useWindowDimensions();
  const { settings } = useGameProgress();
  const [attempt, setAttempt] = useState(1);
  const [areaH, setAreaH] = useState(0);
  const [hintVisible, setHintVisible] = useState(true);

  const { cfg, state, multiplier, padsEnabled, press, pause, resume, restart, nudge } =
    useSignalRound({ level, attempt, settings, onGameOver });

  // Pad grid frame formula — the 2x2 pad can never exceed its block.
  const PAD_MAX_W = Math.min(width - 32, 380);
  const PAD_FRAME = 10 + 3;
  const PAD_GAP = 10;
  const PAD_CELL = Math.floor((PAD_MAX_W - 2 * PAD_FRAME - PAD_GAP) / 2);
  const PAD_CELL_H = 88;

  const laneHeight = areaH > 0 ? areaH / cfg.lanes : 0;

  const hazard = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const carX = useRef(new Animated.Value(-140)).current;
  const eggScale = useRef(new Animated.Value(0)).current;
  const eggY = useRef(new Animated.Value(0)).current;
  const firstHazard = useRef(true);
  const firstCar = useRef(true);
  const firstEgg = useRef(true);

  const onArea = useCallback((e: LayoutChangeEvent) => {
    setAreaH(e.nativeEvent.layout.height);
  }, []);

  useEffect(() => {
    if (cfg.level === 1) {
      return;
    }
    const t = setTimeout(() => setHintVisible(false), HINT_MS);
    return () => clearTimeout(t);
  }, [cfg.level, attempt]);

  // Mistake feedback: hazard flash (comfort option) + shake.
  useEffect(() => {
    if (firstHazard.current) {
      firstHazard.current = false;
      return;
    }
    const seq: Animated.CompositeAnimation[] = [];
    if (settings.hazardFlash) {
      seq.push(
        Animated.sequence([
          Animated.timing(hazard, { toValue: 0.5, duration: 110, useNativeDriver: true }),
          Animated.timing(hazard, { toValue: 0, duration: 110, useNativeDriver: true }),
        ]),
      );
    }
    seq.push(
      Animated.sequence([
        Animated.timing(shake, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]),
    );
    const a = Animated.parallel(seq);
    a.start();
    return () => a.stop();
  }, [state.hazardNonce, settings.hazardFlash, hazard, shake]);

  // Traffic sweep: the car crosses the lane left to right. sprite_2 faces RIGHT.
  useEffect(() => {
    if (firstCar.current) {
      firstCar.current = false;
      return;
    }
    carX.setValue(-140);
    const a = Animated.timing(carX, {
      toValue: width + 140,
      duration: 1100,
      useNativeDriver: true,
    });
    a.start();
    return () => a.stop();
  }, [state.carNonce, carX, width]);

  // Golden egg pop.
  useEffect(() => {
    if (firstEgg.current) {
      firstEgg.current = false;
      return;
    }
    eggScale.setValue(0);
    eggY.setValue(0);
    const a = Animated.sequence([
      Animated.spring(eggScale, { toValue: 1.25, tension: 220, friction: 9, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(eggY, { toValue: -40, duration: 420, useNativeDriver: true }),
        Animated.timing(eggScale, { toValue: 0, duration: 420, useNativeDriver: true }),
      ]),
    ]);
    a.start();
    return () => a.stop();
  }, [state.eggNonce, eggScale, eggY]);

  const handlePad = useCallback(
    (kind: CallKind) => {
      if (state.phase === 'idle') {
        nudge();
        return;
      }
      press(kind);
    },
    [state.phase, nudge, press],
  );

  const handleRestart = useCallback(() => {
    setAttempt(a => a + 1);
    setHintVisible(true);
    restart();
  }, [restart]);

  const pads = padOrder(settings.padSide);

  const lanes = [];
  for (let i = cfg.lanes - 1; i >= 0; i -= 1) {
    lanes.push(
      <RoadLane
        key={i}
        index={i}
        active={i === state.lane}
        width={width}
        height={laneHeight}
        rush={cfg.rushCars > 0}
      />,
    );
  }

  const showHint = cfg.level === 1 || hintVisible;
  const carBottom = laneHeight > 0 ? laneHeight * Math.max(0, state.carLane) : 0;

  return (
    <ScreenShell overlay={THEME.overlays.game} bgOpacity={0.35}>
      <ScreenHeader
        accent={C.stroke}
        title={'LEVEL ' + cfg.level}
        leftSlot={<PauseButton onPress={pause} />}
        rightSlot={
          <View style={styles.headerRight}>
            <LivesRow lives={state.lives} max={LIVES} />
            <Text style={styles.score}>{groupNumber(state.score)}</Text>
          </View>
        }
      />

      <View style={styles.laneStrip}>
        {Array.from({ length: cfg.lanes }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.laneDot,
              {
                backgroundColor:
                  i < state.lane ? C.signalGo : i === state.lane ? C.signalSlow : C.stroke,
              },
            ]}
          />
        ))}
        <Text style={styles.laneLabel}>
          LANE {state.lane} / {cfg.lanes}
        </Text>
      </View>

      <Animated.View
        pointerEvents="box-none"
        style={[styles.area, { transform: [{ translateX: shake }] }]}
        onLayout={onArea}>
        {laneHeight > 0 ? lanes : null}

        {laneHeight > 0 ? (
          <ChickenRunner
            lane={state.lane}
            laneHeight={laneHeight}
            flinchNonce={state.hazardNonce}
          />
        ) : null}

        {laneHeight > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.carWrap,
              { bottom: carBottom, height: laneHeight, transform: [{ translateX: carX }] },
            ]}>
            <Image source={ASSETS.sprite2} style={styles.car} resizeMode="contain" />
          </Animated.View>
        ) : null}

        {laneHeight > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.eggPop,
              {
                bottom: laneHeight * state.lane + laneHeight * 0.6,
                transform: [{ translateY: eggY }, { scale: eggScale }],
              },
            ]}>
            <Image source={ASSETS.sprite3} style={styles.eggImg} resizeMode="contain" />
          </Animated.View>
        ) : null}

        <View pointerEvents="none" style={styles.beaconWrap}>
          <SignalBeacon
            call={state.call}
            stage={state.stage}
            shapes={settings.signalShapes}
            idle={state.phase === 'idle'}
          />
          {showHint ? (
            <View style={styles.hint}>
              <Text style={styles.hintText}>TAP THE PAD THAT MATCHES THE LIT SIGNAL</Text>
            </View>
          ) : null}
          {state.call && state.call.rush ? (
            <View style={styles.rushBanner}>
              <Text style={styles.rushText}>RUSH HOUR · HOLD WITH STOP</Text>
            </View>
          ) : null}
        </View>

        <Animated.View
          pointerEvents="none"
          style={[styles.hazard, { opacity: hazard }]}
        />
      </Animated.View>

      <ComboMeter
        combo={state.combo}
        multiplier={multiplier}
        eggs={state.eggs}
        windowMs={state.phase === 'playing' ? state.windowMs : 0}
        nonce={state.callNonce}
        running={state.phase === 'playing'}
        barWidth={Math.min(width - 210, 200)}
      />

      <View style={[styles.controls, { height: PAD_CELL_H * 2 + PAD_GAP + 2 * 10 }]}>
        <View style={[styles.padGrid, { width: PAD_CELL * 2 + PAD_GAP, gap: PAD_GAP }]}>
          {pads.map(kind => (
            <SignalPad
              key={kind}
              kind={kind}
              label={CALL_LABEL[kind]}
              color={PAD_COLORS[kind]}
              width={PAD_CELL}
              height={PAD_CELL_H}
              shapes={settings.signalShapes}
              disabled={!padsEnabled}
              onPress={handlePad}
            />
          ))}
        </View>
      </View>

      {state.phase === 'paused' ? (
        <PauseOverlay
          level={cfg.level}
          lane={state.lane}
          lanes={cfg.lanes}
          onResume={resume}
          onRestart={handleRestart}
          onMenu={onMenu}
        />
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  pausePress: { width: 48, height: 48 },
  pauseBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bgAlt,
    borderWidth: 2,
    borderColor: C.primary,
    borderRadius: THEME.radius.card,
  },
  pausePlate: { position: 'absolute', width: 48, height: 48, opacity: 0.5 },
  pauseIcon: { width: 22, height: 22 },

  headerRight: { alignItems: 'flex-end', gap: 4 },
  score: { color: C.secondary, fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },

  laneStrip: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  laneDot: { width: 6, height: 6 },
  laneLabel: {
    marginLeft: 10,
    color: C.textMute,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  area: { flex: 1, overflow: 'hidden', justifyContent: 'flex-end' },
  beaconWrap: { position: 'absolute', top: 10, left: 0, right: 0, alignItems: 'center' },
  hint: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderLeftWidth: 2,
    borderLeftColor: C.signalSlow,
  },
  hintText: { color: C.textDim, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  rushBanner: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,30,86,0.2)',
    borderWidth: 2,
    borderColor: C.signalStop,
  },
  rushText: { color: C.signalStop, fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  carWrap: { position: 'absolute', left: 0, justifyContent: 'center' },
  car: { width: 92, height: 46 },
  eggPop: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  eggImg: { width: 28, height: 28 },
  hazard: { ...StyleSheet.absoluteFillObject, backgroundColor: C.signalStop },

  controls: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: C.bg,
    borderTopWidth: 3,
    borderTopColor: C.stroke,
  },
  padGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
