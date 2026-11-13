/* @app-slot:game */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Image, LayoutChangeEvent, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ASSETS, CALL_LABEL, CHARMS, CallKind, LEVEL_NAMES, RoundSummary, ZONES, accuracyOf, charmById, levelUnlocked, multiplierFor, padOrder, zoneOf, zoneUnlocked } from './GameLogic';
import { BentoTile, CharmCard, ChickenRunner, ComboMeter, ConfirmDialog, EmptyState, HardButton, HardSegmented, HardToggle, HazardStripe, HeaderBackButton, LevelCard, LivesRow, PAD_COLORS, PauseOverlay, ProgressBar, RoadLane, ScreenHeader, ScreenShell, SignalBeacon, SignalPad, StarRow, StatCard, formatMultiplier, formatPercent, groupNumber, useGameProgress, usePressScale, useSignalRound } from './AppUI';
import { C, LIVES, LOADER_DURATION_MS, THEME, TOTAL_CHARMS, TOTAL_LEVELS } from './AppResources';

import LinearGradient from 'react-native-linear-gradient';
import { LayoutGrid, Play, Settings as SettingsIcon, Sparkles, Trophy } from 'lucide-react-native';
import { styles_CollectionScreen, styles_GameScreen, styles_LevelSelectScreen, styles_LoaderScreen, styles_MenuScreen, styles_ProgressScreen, styles_ResultScreen, styles_SettingsScreen } from './AppScreens.styles';

// ------ CollectionScreen ------
type Props_CollectionScreen = {
  onBack: () => void;
};

export function CollectionScreen({ onBack }: Props_CollectionScreen) {
  const { width } = useWindowDimensions();
  const { profile } = useGameProgress();

  const GRID_W = Math.min(width - 32, 380);
  const CHARM = Math.floor((GRID_W - 2 * 13 - 2 * 10) / 3);
  const owned = profile.charms;
  const barWidth = Math.min(width - 64, 320);

  return (
    <ScreenShell overlay={THEME.overlays.collection} bgOpacity={0.3} blob={C.gold} blobSize={320}>
      <ScreenHeader
        accent={C.gold}
        title="COLLECTION"
        leftSlot={<HeaderBackButton onPress={onBack} />}
        rightSlot={
          <View style={styles_CollectionScreen.eggChip}>
            <Image source={ASSETS.sprite3} style={styles_CollectionScreen.egg} resizeMode="contain" />
            <Text style={styles_CollectionScreen.eggText}>x {profile.eggs}</Text>
          </View>
        }
      />

      <View style={styles_CollectionScreen.body}>
        {owned.length === 0 ? (
          <View style={styles_CollectionScreen.emptyWrap}>
            <EmptyState
              title="NOTHING IN THE COOP YET"
              hint="CATCH EGG SIGNALS TO FILL IT"
              accent={C.gold}
            />
          </View>
        ) : (
          <View style={[styles_CollectionScreen.grid, { width: GRID_W }]}>
            {CHARMS.map(charm => (
              <CharmCard
                key={charm.id}
                charm={charm}
                unlocked={owned.indexOf(charm.id) >= 0}
                size={CHARM}
              />
            ))}
          </View>
        )}

        <View style={styles_CollectionScreen.footer}>
          <Text style={styles_CollectionScreen.footerText}>
            {owned.length} / {TOTAL_CHARMS} CHARMS
          </Text>
          <ProgressBar
            progress={owned.length / TOTAL_CHARMS}
            width={barWidth}
            height={6}
            colors={[C.gold, C.primary]}
          />
        </View>
      </View>
    </ScreenShell>
  );
}

// ------ GameScreen ------
const HIT_GameScreen = { top: 8, bottom: 8, left: 8, right: 8 };
const HINT_MS_GameScreen = 4000;

type Props_GameScreen = {
  level: number;
  onGameOver: (summary: RoundSummary) => void;
  onMenu: () => void;
};

function PauseButton_GameScreen({ onPress }: { onPress: () => void }) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.92);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT_GameScreen}
      accessibilityRole="button"
      accessibilityLabel="PAUSE"
      style={styles_GameScreen.pausePress}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles_GameScreen.pauseBtn, THEME.hardShadow(C.primaryDeep, 4), { transform: [{ scale }] }]}>
        <Image source={ASSETS.buttonRound} style={styles_GameScreen.pausePlate} resizeMode="contain" />
        <Image source={ASSETS.iconPause} style={styles_GameScreen.pauseIcon} resizeMode="contain" />
      </Animated.View>
    </Pressable>
  );
}

export function GameScreen({ level, onGameOver, onMenu }: Props_GameScreen) {
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
    const t = setTimeout(() => setHintVisible(false), HINT_MS_GameScreen);
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
        leftSlot={<PauseButton_GameScreen onPress={pause} />}
        rightSlot={
          <View style={styles_GameScreen.headerRight}>
            <LivesRow lives={state.lives} max={LIVES} />
            <Text style={styles_GameScreen.score}>{groupNumber(state.score)}</Text>
          </View>
        }
      />

      <View style={styles_GameScreen.laneStrip}>
        {Array.from({ length: cfg.lanes }).map((_, i) => (
          <View
            key={i}
            style={[
              styles_GameScreen.laneDot,
              {
                backgroundColor:
                  i < state.lane ? C.signalGo : i === state.lane ? C.signalSlow : C.stroke,
              },
            ]}
          />
        ))}
        <Text style={styles_GameScreen.laneLabel}>
          LANE {state.lane} / {cfg.lanes}
        </Text>
      </View>

      <Animated.View
        pointerEvents="box-none"
        style={[styles_GameScreen.area, { transform: [{ translateX: shake }] }]}
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
              styles_GameScreen.carWrap,
              { bottom: carBottom, height: laneHeight, transform: [{ translateX: carX }] },
            ]}>
            <Image source={ASSETS.sprite2} style={styles_GameScreen.car} resizeMode="contain" />
          </Animated.View>
        ) : null}

        {laneHeight > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles_GameScreen.eggPop,
              {
                bottom: laneHeight * state.lane + laneHeight * 0.6,
                transform: [{ translateY: eggY }, { scale: eggScale }],
              },
            ]}>
            <Image source={ASSETS.sprite3} style={styles_GameScreen.eggImg} resizeMode="contain" />
          </Animated.View>
        ) : null}

        <View pointerEvents="none" style={styles_GameScreen.beaconWrap}>
          <SignalBeacon
            call={state.call}
            stage={state.stage}
            shapes={settings.signalShapes}
            idle={state.phase === 'idle'}
          />
          {showHint ? (
            <View style={styles_GameScreen.hint}>
              <Text style={styles_GameScreen.hintText}>TAP THE PAD THAT MATCHES THE LIT SIGNAL</Text>
            </View>
          ) : null}
          {state.call && state.call.rush ? (
            <View style={styles_GameScreen.rushBanner}>
              <Text style={styles_GameScreen.rushText}>RUSH HOUR · HOLD WITH STOP</Text>
            </View>
          ) : null}
        </View>

        <Animated.View
          pointerEvents="none"
          style={[styles_GameScreen.hazard, { opacity: hazard }]}
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

      <View style={[styles_GameScreen.controls, { height: PAD_CELL_H * 2 + PAD_GAP + 2 * 10 }]}>
        <View style={[styles_GameScreen.padGrid, { width: PAD_CELL * 2 + PAD_GAP, gap: PAD_GAP }]}>
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

// ------ LevelSelectScreen ------
type Props_LevelSelectScreen = {
  onBack: () => void;
  onPickLevel: (level: number) => void;
};

export function LevelSelectScreen({ onBack, onPickLevel }: Props_LevelSelectScreen) {
  const { width } = useWindowDimensions();
  const { profile, stars, cleared } = useGameProgress();

  // Grid frame formula — the row can never overflow its panel.
  const ROW_MAX_W = Math.min(width - 32, 380);
  const ROW_FRAME = 10 + 3;
  const GAP = 10;
  const CARD = Math.floor((ROW_MAX_W - 2 * ROW_FRAME - 3 * GAP) / 4);

  const handlePick = useCallback((level: number) => onPickLevel(level), [onPickLevel]);

  return (
    <ScreenShell overlay={THEME.overlays.levels} bgOpacity={0.3} blob={C.secondary} blobSize={320}>
      <ScreenHeader
        accent={C.secondary}
        title="LEVEL SELECT"
        leftSlot={<HeaderBackButton onPress={onBack} />}
        rightSlot={
          <Text style={styles_LevelSelectScreen.starTotal}>
            {'★'} {stars}
          </Text>
        }
      />

      <View style={styles_LevelSelectScreen.body}>
        {ZONES.map(zone => {
          const open = zoneUnlocked(zone, stars);
          return (
            <View
              key={zone.id}
              style={[
                styles_LevelSelectScreen.zone,
                { borderColor: open ? zone.color : C.stroke },
                THEME.hardShadow(C.bg, 4),
              ]}>
              <View style={styles_LevelSelectScreen.zoneHead}>
                <Text style={[styles_LevelSelectScreen.zoneName, { color: open ? zone.color : C.textMute }]}>
                  {zone.name}
                </Text>
                {open ? (
                  <Text style={styles_LevelSelectScreen.zoneHint}>
                    {zone.levels.filter(l => cleared[l - 1]).length} / {zone.levels.length} CLEARED
                  </Text>
                ) : (
                  <Text style={styles_LevelSelectScreen.zoneLock}>
                    NEEDS {'★'} {zone.starsRequired}
                  </Text>
                )}
              </View>

              {open ? null : <HazardStripe width={ROW_MAX_W - 2 * ROW_FRAME} height={10} opacity={0.5} />}

              <View style={[styles_LevelSelectScreen.row, { gap: GAP }]}>
                {zone.levels.map(level => (
                  <LevelCard
                    key={level}
                    level={level}
                    stars={profile.levels[level - 1].stars}
                    locked={!open || !levelUnlocked(level, stars, cleared)}
                    zoneColor={zone.color}
                    size={CARD}
                    onPress={handlePick}
                  />
                ))}
              </View>

              {open ? null : (
                <Text style={styles_LevelSelectScreen.lockedLine}>
                  EARN {'★'} {zone.starsRequired} TO OPEN THIS ZONE
                </Text>
              )}
              {zone.id === 2 ? (
                <Image source={ASSETS.sprite2} style={styles_LevelSelectScreen.carDecor} resizeMode="contain" />
              ) : null}
            </View>
          );
        })}
      </View>
    </ScreenShell>
  );
}

// ------ LoaderScreen ------
type Props_LoaderScreen = {
  onDone: () => void;
};

/**
 * Brand card only: no PLAY button, no stat chips, no tap handler. The move to Menu
 * is driven purely by the 8 s timer, never by an animation callback or a touch.
 */
export function LoaderScreen({ onDone }: Props_LoaderScreen) {
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
      <View style={styles_LoaderScreen.root}>
        <View style={styles_LoaderScreen.stripeTop}>
          <HazardStripe width={width} height={14} opacity={0.35} />
        </View>

        <View style={styles_LoaderScreen.center}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles_LoaderScreen.plate,
              THEME.hardShadow(C.primary, 6),
              { opacity: plate, transform: [{ scale: plateScale }] },
            ]}>
            <Image source={ASSETS.logo} style={styles_LoaderScreen.logo} resizeMode="contain" />
          </Animated.View>

          <Animated.Text style={[styles_LoaderScreen.title, { opacity: title }]}>CH1CKY</Animated.Text>
          <Animated.Text style={[styles_LoaderScreen.subtitle, { opacity: subtitle }]}>
            SIGNAL STEPS
          </Animated.Text>

          <View style={styles_LoaderScreen.barWrap}>
            <ProgressBar
              progress={1}
              width={barWidth}
              height={10}
              colors={[C.primary, C.secondary]}
              animateMs={LOADER_DURATION_MS}
            />
            <Text style={styles_LoaderScreen.status}>LOADING…</Text>
          </View>
        </View>

        <View style={styles_LoaderScreen.stripeBottom}>
          <HazardStripe width={width} height={14} opacity={0.35} />
        </View>
      </View>
    </ScreenShell>
  );
}

// ------ MenuScreen ------
const HIT_MenuScreen = { top: 8, bottom: 8, left: 8, right: 8 };

type Props_MenuScreen = {
  onPlay: () => void;
  onLevels: () => void;
  onCollection: () => void;
  onProgress: () => void;
  onSettings: () => void;
};

function clamp_MenuScreen(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function MenuScreen({ onPlay, onLevels, onCollection, onProgress, onSettings }: Props_MenuScreen) {
  const { height } = useWindowDimensions();
  const { profile, stars, nextLevel } = useGameProgress();

  const bodyH = height - 116 - 32 - 24;
  const heroH = clamp_MenuScreen(Math.round(bodyH * 0.44), 170, 240);
  const statH = Math.round((heroH - 12) / 2);
  const tileH = clamp_MenuScreen(Math.round((bodyH - heroH - 12) / 2), 72, 112);

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
          <View style={styles_MenuScreen.logoFrame}>
            <Image source={ASSETS.logo} style={styles_MenuScreen.logoImg} resizeMode="contain" />
          </View>
        }
        rightSlot={
          <View style={styles_MenuScreen.eggChip}>
            <Image source={ASSETS.sprite3} style={styles_MenuScreen.eggImg} resizeMode="contain" />
            <Text style={styles_MenuScreen.eggText}>x {profile.eggs}</Text>
          </View>
        }
      />

      <View style={styles_MenuScreen.body}>
        <View style={[styles_MenuScreen.row, { height: heroH }]}>
          <Pressable
            onPress={onPlay}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            hitSlop={HIT_MenuScreen}
            accessibilityRole="button"
            accessibilityLabel="PLAY"
            style={styles_MenuScreen.heroSlot}>
            <Animated.View
              pointerEvents="box-none"
              style={[
                styles_MenuScreen.hero,
                THEME.hardShadow(C.secondary, 6),
                { transform: [{ scale }, { scale: breatheScale }] },
              ]}>
              <Image source={ASSETS.buttonRect} style={styles_MenuScreen.heroPlate} resizeMode="stretch" />
              <LinearGradient
                colors={[C.primary, C.primaryDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFill, styles_MenuScreen.heroGrad]}
              />
              <Text style={styles_MenuScreen.heroCaption}>
                LEVEL {nextLevel} · {LEVEL_NAMES[nextLevel - 1]}
              </Text>
              <View style={styles_MenuScreen.heroRow}>
                <View style={styles_MenuScreen.icon28}>
                  <Play size={28} color={C.text} />
                </View>
                <Text style={styles_MenuScreen.heroLabel}>PLAY</Text>
              </View>
              <Text style={styles_MenuScreen.heroZone}>{zone.name}</Text>
            </Animated.View>
          </Pressable>

          <View style={styles_MenuScreen.statCol}>
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

        <View style={[styles_MenuScreen.row, { height: tileH }]}>
          <View style={styles_MenuScreen.tileSlot}>
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
          <View style={styles_MenuScreen.tileSlot}>
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

        <View style={[styles_MenuScreen.row, { height: tileH }]}>
          <View style={styles_MenuScreen.tileSlot}>
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
          <View style={styles_MenuScreen.tileSlot}>
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

// ------ ProgressScreen ------
type Props_ProgressScreen = {
  onBack: () => void;
};

export function ProgressScreen({ onBack }: Props_ProgressScreen) {
  const { width } = useWindowDimensions();
  const { profile, stars } = useGameProgress();
  const stats = profile.stats;
  const barWidth = Math.min(width - 96, 300);

  const cards = [
    { value: groupNumber(stats.bestScore), label: 'BEST SCORE', accent: C.secondary, has: stats.bestScore > 0 },
    {
      value: formatMultiplier(multiplierFor(stats.bestCombo)),
      label: 'BEST COMBO',
      accent: C.signalGo,
      has: stats.bestCombo > 0,
    },
    { value: String(stats.crossings), label: 'CROSSINGS', accent: C.gold, has: stats.crossings > 0 },
    {
      value: formatPercent(accuracyOf(stats.correct, stats.answers)),
      label: 'ACCURACY',
      accent: C.primary,
      has: stats.answers > 0,
    },
  ];
  const visible = cards.filter(c => c.has);

  return (
    <ScreenShell overlay={THEME.overlays.progress} bgOpacity={0.3} blob={C.signalGo} blobSize={320}>
      <ScreenHeader
        accent={C.signalGo}
        title="PROGRESS"
        leftSlot={<HeaderBackButton onPress={onBack} />}
        rightSlot={
          <Text style={styles_ProgressScreen.starTotal}>
            {'★'} {stars}
          </Text>
        }
      />

      <View style={styles_ProgressScreen.body}>
        <View style={styles_ProgressScreen.zoneBlock}>
          {ZONES.map(zone => {
            const done = zone.levels.filter(l => profile.levels[l - 1].cleared).length;
            return (
              <View
                key={zone.id}
                style={[styles_ProgressScreen.zoneRow, { borderColor: zone.color }, THEME.hardShadow(C.bg, 4)]}>
                <View style={styles_ProgressScreen.zoneHead}>
                  <Text style={[styles_ProgressScreen.zoneName, { color: zone.color }]}>{zone.name}</Text>
                  <Text style={styles_ProgressScreen.zoneCount}>
                    {done} / {zone.levels.length} LEVELS
                  </Text>
                </View>
                <ProgressBar
                  progress={done / zone.levels.length}
                  width={barWidth}
                  height={10}
                  colors={[zone.color, zone.color]}
                />
              </View>
            );
          })}
        </View>

        {visible.length >= 2 ? (
          <View style={styles_ProgressScreen.grid}>
            {visible.map(c => (
              <View key={c.label} style={styles_ProgressScreen.gridSlot}>
                <StatCard value={c.value} label={c.label} accent={c.accent} hideWhenEmpty={false} />
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            title="NO RUNS RECORDED"
            hint="PLAY A LEVEL TO START YOUR RECORD"
            accent={C.signalGo}
          />
        )}

        <View style={styles_ProgressScreen.runs}>
          <Text style={styles_ProgressScreen.runsTitle}>LAST RUNS</Text>
          {profile.records.length === 0 ? (
            <Text style={styles_ProgressScreen.runsEmpty}>NO CROSSINGS LOGGED YET</Text>
          ) : (
            profile.records.map((r, i) => (
              <Text key={i} style={styles_ProgressScreen.runLine}>
                L{r.level} · {'★'} {r.stars} · {groupNumber(r.score)} ·{' '}
                {formatMultiplier(multiplierFor(r.bestCombo))}
              </Text>
            ))
          )}
        </View>
      </View>
    </ScreenShell>
  );
}

// ------ ResultScreen ------
type Props_ResultScreen = {
  summary: RoundSummary;
  onNextLevel: () => void;
  onPlayAgain: () => void;
  onLevels: () => void;
  onMenu: () => void;
};

/** Counts the score up over 600 ms without animating any layout property. */
function useCountUp_ResultScreen(target: number, ms: number): number {
  const [value, setValue] = useState(0);
  const targetRef = useRef(target);
  targetRef.current = target;

  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - started) / ms);
      setValue(Math.round(targetRef.current * t));
      if (t >= 1) {
        clearInterval(id);
      }
    }, 30);
    return () => clearInterval(id);
  }, [target, ms]);

  return value;
}

export function ResultScreen({ summary, onNextLevel, onPlayAgain, onLevels, onMenu }: Props_ResultScreen) {
  const { width } = useWindowDimensions();
  const win = summary.outcome === 'win';
  const shown = useCountUp_ResultScreen(summary.score, 600);

  const banner = win ? 'SAFE CROSSING!' : 'RUFFLED FEATHERS!';
  const bannerColor = win ? C.signalGo : C.signalStop;
  const subLine = win
    ? 'LEVEL ' + summary.level + ' CLEARED'
    : 'CAUGHT IN LANE ' + (summary.lane + 1);

  const cards = [
    { value: groupNumber(shown), label: 'SCORE', accent: C.secondary, has: summary.score > 0 },
    {
      value: formatMultiplier(multiplierFor(summary.bestCombo)),
      label: 'BEST COMBO',
      accent: C.signalGo,
      has: summary.bestCombo > 0,
    },
    { value: 'x ' + summary.eggs, label: 'EGGS', accent: C.gold, has: summary.eggs > 0 },
  ];
  const visible = cards.filter(c => c.has);
  const newCharm = summary.newCharms.length > 0 ? charmById(summary.newCharms[0]) : undefined;
  const hasNext = win && summary.level < TOTAL_LEVELS;

  return (
    <ScreenShell
      overlay={win ? THEME.overlays.resultWin : THEME.overlays.resultLose}
      bgOpacity={0.3}
      blob={bannerColor}
      blobSize={340}>
      <ScreenHeader
        accent={bannerColor}
        title="ROUND RESULT"
        rightSlot={<Text style={[styles_ResultScreen.levelTag, { color: bannerColor }]}>L{summary.level}</Text>}
      />

      <View style={styles_ResultScreen.body}>
        <View style={styles_ResultScreen.bannerBlock}>
          <HazardStripe width={Math.min(width - 48, 340)} height={10} opacity={0.4} />
          <Text style={[styles_ResultScreen.banner, { color: bannerColor }]}>{banner}</Text>
          <Text style={styles_ResultScreen.sub}>{subLine}</Text>
          <Text style={styles_ResultScreen.levelName}>{LEVEL_NAMES[summary.level - 1]}</Text>
        </View>

        <StarRow earned={summary.stars} size={34} animate />

        {visible.length >= 2 ? (
          <View style={styles_ResultScreen.statRow}>
            {visible.map(c => (
              <View key={c.label} style={styles_ResultScreen.statSlot}>
                <StatCard value={c.value} label={c.label} accent={c.accent} hideWhenEmpty={false} />
              </View>
            ))}
          </View>
        ) : null}

        {newCharm ? (
          <View style={[styles_ResultScreen.charmLine, { borderColor: newCharm.accent }]}>
            <Image
              source={ASSETS.sprite4}
              style={[styles_ResultScreen.charmArt, { tintColor: newCharm.accent }]}
              resizeMode="contain"
            />
            <Text style={[styles_ResultScreen.charmText, { color: newCharm.accent }]}>
              NEW CHARM · {newCharm.name}
            </Text>
          </View>
        ) : null}

        {summary.assist ? <Text style={styles_ResultScreen.assist}>ASSIST ON · MAX 2 STARS</Text> : null}

        <View style={styles_ResultScreen.actions}>
          {hasNext ? <HardButton label="NEXT LEVEL" onPress={onNextLevel} height={56} /> : null}
          <HardButton
            label="PLAY AGAIN"
            onPress={onPlayAgain}
            variant={hasNext ? 'secondary' : 'primary'}
            accent={C.secondary}
            height={56}
          />
          <HardButton label="LEVELS" onPress={onLevels} variant="secondary" accent={C.stroke} height={52} />
          <HardButton label="MENU" onPress={onMenu} variant="secondary" accent={C.stroke} height={52} />
        </View>
      </View>
    </ScreenShell>
  );
}

// ------ SettingsScreen ------
type Props_SettingsScreen = {
  onBack: () => void;
};

type RowProps_SettingsScreen = {
  label: string;
  hint: string;
  accent: string;
  children: React.ReactNode;
};

function OptionRow_SettingsScreen({ label, hint, accent, children }: RowProps_SettingsScreen) {
  return (
    <View style={[styles_SettingsScreen.row, { borderColor: accent }, THEME.hardShadow(C.bg, 4)]}>
      <View style={styles_SettingsScreen.rowText}>
        <Text style={styles_SettingsScreen.rowLabel}>{label}</Text>
        <Text style={styles_SettingsScreen.rowHint}>{hint}</Text>
      </View>
      <View style={styles_SettingsScreen.rowControl}>{children}</View>
    </View>
  );
}

/** Every option here changes real behaviour and is persisted. No audio controls: the app ships no audio. */
export function SettingsScreen({ onBack }: Props_SettingsScreen) {
  const { settings, updateSettings, resetAll } = useGameProgress();
  const [confirming, setConfirming] = useState(false);

  const handleReset = useCallback(() => {
    resetAll();
    setConfirming(false);
    onBack();
  }, [resetAll, onBack]);

  return (
    <ScreenShell overlay={THEME.overlays.settings} bgOpacity={0.3} blob={C.primary} blobSize={320}>
      <ScreenHeader
        accent={C.primary}
        title="SETTINGS"
        leftSlot={<HeaderBackButton onPress={onBack} />}
      />

      <View style={styles_SettingsScreen.body}>
        <OptionRow_SettingsScreen
          label="SIGNAL SHAPES"
          hint="A UNIQUE SHAPE ON EVERY LAMP AND PAD"
          accent={C.signalGo}>
          <HardToggle
            label="SIGNAL SHAPES"
            value={settings.signalShapes}
            accent={C.signalGo}
            onChange={v => updateSettings({ signalShapes: v })}
          />
        </OptionRow_SettingsScreen>

        <OptionRow_SettingsScreen label="PAD SIDE" hint="PUTS GO AND STOP UNDER YOUR THUMB" accent={C.secondary}>
          <HardSegmented
            options={['LEFT', 'RIGHT']}
            value={settings.padSide}
            accent={C.secondary}
            onChange={v => updateSettings({ padSide: v === 'LEFT' ? 'LEFT' : 'RIGHT' })}
          />
        </OptionRow_SettingsScreen>

        <OptionRow_SettingsScreen
          label="REACTION ASSIST"
          hint="+250 MS PER SIGNAL · CAPS THE AWARD AT 2 STARS"
          accent={C.signalSlow}>
          <HardToggle
            label="REACTION ASSIST"
            value={settings.reactionAssist}
            accent={C.signalSlow}
            onChange={v => updateSettings({ reactionAssist: v })}
          />
        </OptionRow_SettingsScreen>

        <OptionRow_SettingsScreen
          label="HAZARD FLASH"
          hint="RED FLASH ON A MISTAKE · TURN OFF FOR COMFORT"
          accent={C.signalStop}>
          <HardToggle
            label="HAZARD FLASH"
            value={settings.hazardFlash}
            accent={C.signalStop}
            onChange={v => updateSettings({ hazardFlash: v })}
          />
        </OptionRow_SettingsScreen>

        <View style={styles_SettingsScreen.resetBlock}>
          <Text style={styles_SettingsScreen.resetHint}>WIPES LEVELS, STARS, CHARMS AND RECORDS</Text>
          <HardButton
            label="RESET PROGRESS"
            onPress={() => setConfirming(true)}
            variant="secondary"
            accent={C.signalStop}
            height={56}
          />
        </View>
      </View>

      {confirming ? (
        <ConfirmDialog
          title="RESET EVERYTHING?"
          hint="THIS CANNOT BE UNDONE"
          confirmLabel="RESET"
          cancelLabel="KEEP"
          onConfirm={handleReset}
          onCancel={() => setConfirming(false)}
        />
      ) : null}
    </ScreenShell>
  );
}

/* autopad-begin */
function ubeboqarij(_secufejej: boolean, _iliwomokap: string, _todaqapemi: string): void {}
function abeleyi(): void {
  const inixuxerulut = 14;
  if (inixuxerulut > 99) return;
}
function aradoyuyat(_jinijuqugew: boolean, _opuxogeqob: number): void {
  const nibeqowiteki: boolean = true;
}
function kubeme(_avoyir: string): boolean {
  let uwemegecilac: boolean = true;
  uwemegecilac = true;
  return uwemegecilac;
}
function lixecotolib(_medusa: string, _erimavacupoq: number): boolean {
  const xigero = 72;
  const rotigi: boolean = true;
  return rotigi;
}
function zoceqa(_vopaqemerasa: boolean): boolean {
  let sijubufi: boolean = true;
  sijubufi = false;
  return sijubufi;
}
function denuzujul(_aloludiquc: number, _xofuta: boolean): void {
  const unosikalux: number = 126;
}
function iruweka(_uvayuqoqu: number): void {
  const ayivicuwaq = 42;
  if (ayivicuwaq > 30) return;
}
function isigev(_bebajetos: number, _opajede: number): number {
  return 57;
}
function lucaqe(_ovoyixakulux: boolean): number { return 46; }
function kosayek(_emiperivan: boolean, _cefupaqo: number, _apiwuq: boolean): number {
  return 7;
}
function cerafozer(_lawuyulalod: number, _jimutuqabuk: string, _azavubum: number): void {
  const laxivavew = 50;
  if (laxivavew > 6) return;
}
function uyiyoxitupef(_uciwezanat: string): string {
  const dimebelidug: string = "womicatu";
  return dimebelidug;
}
function jaqemawejixa(_qobojejox: boolean): void {
  const cofubiga: boolean = false;
}
function eyicakoyi(_avuzaj: number): string {
  let jukasi: string = "keneji";
  jukasi = "uvamifek";
  return jukasi;
}
/* autopad-end */
