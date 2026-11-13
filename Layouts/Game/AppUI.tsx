/* @app-slot:game */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { C, CALL_BEAT_MS, FIRST_CALL_DELAY_MS, LIVES, MISTAKE_FREEZE_MS, PANIC_WINDOW_MS, RECORD_HISTORY, THEME } from './AppResources';
import { Lock } from 'lucide-react-native';
import { ASSETS, CallKind, Charm, GameSettings, GlyphShape, Profile, RoundOutcome, RoundSummary, SignalCall, bestStars, callForStep, clearedFlags, clearedLevelNumbers, comboColor, emptyProfile, evaluateCharms, generateRound, levelConfig, loadProfile, mulberry32, multiplierFor, nextPlayableLevel, resetProfile, resolveAnswer, saveProfile, starsFor, totalStars, windowMsFor } from './GameLogic';
import Svg, { Circle, Defs, Line, Path, Pattern, Polygon, Rect } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { styles_BentoTile, styles_CharmCard, styles_ChickenRunner, styles_ComboMeter, styles_ConfirmDialog, styles_EmptyState, styles_GlowBlob, styles_HardButton, styles_HardCard, styles_HardSegmented, styles_HardToggle, styles_HazardStripe, styles_LevelCard, styles_LivesRow, styles_PauseOverlay, styles_ProgressBar, styles_RoadLane, styles_ScreenHeader, styles_ScreenShell, styles_SignalBeacon, styles_SignalPad, styles_StarRow, styles_StatCard } from './AppUI.styles';

// ------ BentoTile ------
const HIT_BentoTile = { top: 8, bottom: 8, left: 8, right: 8 };

type Props_BentoTile = {
  Icon: LucideIcon;
  caption: string;
  sub: string;
  accent: string;
  onPress: () => void;
  height: number;
  style?: ViewStyle;
  /** Entry stagger index. */
  order?: number;
};

/** One hub tile of the bento grid. The caption is the harness route word, verbatim. */
export function BentoTile({ Icon, caption, sub, accent, onPress, height, style, order = 0 }: Props_BentoTile) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.96);
  const enter = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const a = Animated.sequence([
      Animated.delay(60 * order),
      Animated.timing(enter, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]);
    a.start();
    return () => a.stop();
  }, [enter, order]);

  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT_BentoTile}
      accessibilityRole="button"
      accessibilityLabel={caption}
      style={[styles_BentoTile.press, { height }, style]}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles_BentoTile.card,
          { height, borderColor: accent, transform: [{ translateY }, { scale }] },
          THEME.hardShadow(C.bgAlt, 4),
        ]}>
        <View style={[styles_BentoTile.iconWrap, { borderColor: accent, backgroundColor: accent + '22' }]}>
          <Icon size={24} color={accent} />
        </View>
        <View style={styles_BentoTile.textCol}>
          <Text numberOfLines={1} style={styles_BentoTile.caption}>
            {caption}
          </Text>
          <Text numberOfLines={1} style={styles_BentoTile.sub}>
            {sub}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ------ CharmCard ------
type Props_CharmCard = {
  charm: Charm;
  unlocked: boolean;
  size: number;
};

/** Each charm carries its own vector shape — twelve distinct glyphs, no repeats. */
function CharmCardBase_CharmCard({ charm, unlocked, size }: Props_CharmCard) {
  return (
    <View
      style={[
        styles_CharmCard.card,
        {
          width: size,
          height: size + 26,
          borderColor: unlocked ? charm.accent : C.stroke,
          backgroundColor: unlocked ? C.surface : C.bgAlt,
        },
        THEME.hardShadow(C.bg, 4),
      ]}>
      {unlocked ? (
        <>
          <View style={styles_CharmCard.art}>
            <Image
              source={ASSETS.sprite4}
              style={[styles_CharmCard.sprite, { tintColor: charm.accent }]}
              resizeMode="contain"
            />
            <View style={[styles_CharmCard.badge, { borderColor: charm.accent }]}>
              <ShapeGlyph shape={charm.shape} size={12} color={charm.accent} />
            </View>
          </View>
          <Text numberOfLines={2} style={styles_CharmCard.name}>
            {charm.name}
          </Text>
        </>
      ) : (
        <>
          <View style={styles_CharmCard.art}>
            <Lock size={18} color={C.textMute} />
          </View>
          <Text numberOfLines={2} style={styles_CharmCard.locked}>
            {charm.condition}
          </Text>
        </>
      )}
    </View>
  );
}


export const CharmCard = React.memo(CharmCardBase_CharmCard);

// ------ ChickenRunner ------
type Props_ChickenRunner = {
  lane: number;
  laneHeight: number;
  /** Bumped on a mistake: the bird flinches half a lane back without losing ground. */
  flinchNonce: number;
};

/** The hero sprite. Plain contain-fitted image over the road, never clipped or stretched. */
function ChickenRunnerBase_ChickenRunner({ lane, laneHeight, flinchNonce }: Props_ChickenRunner) {
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
        styles_ChickenRunner.wrap,
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


export const ChickenRunner = React.memo(ChickenRunnerBase_ChickenRunner);

// ------ ComboMeter ------
type Props_ComboMeter = {
  combo: number;
  multiplier: number;
  eggs: number;
  windowMs: number;
  nonce: number;
  running: boolean;
  barWidth: number;
};

/** Combo chip, live window bar and the egg chip. The bar is scaleX only. */
function ComboMeterBase_ComboMeter({
  combo,
  multiplier,
  eggs,
  windowMs,
  nonce,
  running,
  barWidth,
}: Props_ComboMeter) {
  const tint = comboColor(multiplier);
  return (
    <View style={styles_ComboMeter.strip}>
      <View style={styles_ComboMeter.side}>
        <Text style={[styles_ComboMeter.mult, { color: tint }]}>{formatMultiplier(multiplier)}</Text>
        <Text style={styles_ComboMeter.caption}>COMBO {combo}</Text>
      </View>

      <View style={styles_ComboMeter.center}>
        <ProgressBar
          progress={1}
          width={barWidth}
          height={6}
          colors={[C.signalGo, C.signalSlow, C.signalStop]}
          countdownMs={windowMs > 0 ? windowMs : undefined}
          nonce={nonce}
          running={running}
        />
      </View>

      <View style={[styles_ComboMeter.side, styles_ComboMeter.sideRight]}>
        {eggs > 0 ? (
          <View style={styles_ComboMeter.eggChip}>
            <Image source={ASSETS.sprite3} style={styles_ComboMeter.egg} resizeMode="contain" />
            <Text style={styles_ComboMeter.eggCount}>x {eggs}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}


export const ComboMeter = React.memo(ComboMeterBase_ComboMeter);

// ------ ConfirmDialog ------
type Props_ConfirmDialog = {
  title: string;
  hint: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  title,
  hint,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: Props_ConfirmDialog) {
  return (
    <View style={styles_ConfirmDialog.scrim}>
      <View style={[styles_ConfirmDialog.panel, THEME.hardShadow(C.signalStop, 6)]}>
        <Text style={styles_ConfirmDialog.title}>{title}</Text>
        <Text style={styles_ConfirmDialog.hint}>{hint}</Text>
        <View style={styles_ConfirmDialog.actions}>
          <HardButton label={cancelLabel} onPress={onCancel} variant="secondary" accent={C.stroke} height={52} />
          <HardButton label={confirmLabel} onPress={onConfirm} variant="secondary" accent={C.signalStop} height={52} />
        </View>
      </View>
    </View>
  );
}

// ------ EmptyState ------
type Props_EmptyState = {
  title: string;
  hint: string;
  accent?: string;
};

/** A themed message, centred in its container — never a blank area. */
function EmptyStateBase_EmptyState({ title, hint, accent = C.stroke }: Props_EmptyState) {
  return (
    <View style={[styles_EmptyState.wrap, { borderColor: accent }, THEME.hardShadow(C.bgAlt, 4)]}>
      <View style={[styles_EmptyState.mark, { backgroundColor: accent }]} />
      <Text style={styles_EmptyState.title}>{title}</Text>
      <Text style={styles_EmptyState.hint}>{hint}</Text>
    </View>
  );
}


export const EmptyState = React.memo(EmptyStateBase_EmptyState);

// ------ GlowBlob ------
type Props_GlowBlob = {
  color: string;
  size?: number;
  top?: number;
  left?: number;
};

/** Three concentric neon circles — the glow layer that sits behind every screen. */
function GlowBlobBase_GlowBlob({ color, size = 300, top = -90, left = -80 }: Props_GlowBlob) {
  const r = size / 2;
  return (
    <View pointerEvents="none" style={[styles_GlowBlob.wrap, { top, left, width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle cx={r} cy={r} r={r} fill={color} opacity={0.12} />
        <Circle cx={r} cy={r} r={r * 0.66} fill={color} opacity={0.08} />
        <Circle cx={r} cy={r} r={r * 0.36} fill={color} opacity={0.06} />
      </Svg>
    </View>
  );
}


export const GlowBlob = React.memo(GlowBlobBase_GlowBlob);

// ------ HardButton ------
const HIT_HardButton = { top: 8, bottom: 8, left: 8, right: 8 };

type Props_HardButton = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  accent?: string;
  disabled?: boolean;
  height?: number;
  width?: number | '100%';
};

/**
 * Every CTA on every screen. Plain uppercase <Text> label (never an image, never a
 * glyph), gradient fill plus a coloured hard shadow, and a visibly dimmed disabled
 * state. Pressable is the parent; the animated view is its child.
 */
export function HardButton({
  label,
  onPress,
  variant = 'primary',
  accent = C.primary,
  disabled = false,
  height = 60,
  width = '100%',
}: Props_HardButton) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.95);
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : onPressIn}
      onPressOut={disabled ? undefined : onPressOut}
      disabled={disabled}
      hitSlop={HIT_HardButton}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[styles_HardButton.press, { width, height, opacity: disabled ? 0.4 : 1 }]}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles_HardButton.body,
          {
            height,
            borderColor: isPrimary ? C.text : accent,
            backgroundColor: isPrimary ? C.primary : C.bgAlt,
            transform: [{ scale }],
          },
          THEME.hardShadow(isPrimary ? C.secondary : accent, 5),
        ]}>
        {isPrimary ? (
          <LinearGradient
            colors={[C.primary, C.primaryDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View style={styles_HardButton.row}>
          <Text style={[styles_HardButton.label, { color: isPrimary ? C.text : accent }]}>{label}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ------ HardCard ------
type Props_HardCard = {
  accent?: string;
  shadowColor?: string;
  dy?: number;
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
};

/** The brutalist surface primitive: flat fill, 3 px border, hard offset shadow. */
export function HardCard({ accent = C.stroke, shadowColor, dy = 4, style, children }: Props_HardCard) {
  return (
    <View
      style={[
        styles_HardCard.card,
        { borderColor: accent },
        THEME.hardShadow(shadowColor || C.bgAlt, dy),
        style as ViewStyle,
      ]}>
      {children}
    </View>
  );
}

// ------ HardSegmented ------
const HIT_HardSegmented = { top: 8, bottom: 8, left: 8, right: 8 };

type Props_HardSegmented = {
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
  accent?: string;
};

function HardSegmentedBase_HardSegmented({ options, value, onChange, accent = C.secondary }: Props_HardSegmented) {
  return (
    <View style={styles_HardSegmented.wrap}>
      {options.map(opt => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            hitSlop={HIT_HardSegmented}
            accessibilityRole="button"
            accessibilityLabel={opt}
            accessibilityState={{ selected: active }}
            style={[
              styles_HardSegmented.seg,
              {
                borderColor: active ? accent : C.stroke,
                backgroundColor: active ? accent + '2A' : C.bgAlt,
              },
              THEME.hardShadow(C.bg, 3),
            ]}>
            <Text style={[styles_HardSegmented.label, { color: active ? accent : C.textMute }]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}


export const HardSegmented = React.memo(HardSegmentedBase_HardSegmented);

// ------ HardToggle ------
const HIT_HardToggle = { top: 8, bottom: 8, left: 8, right: 8 };

type Props_HardToggle = {
  value: boolean;
  onChange: (next: boolean) => void;
  accent?: string;
  label: string;
};

function HardToggleBase_HardToggle({ value, onChange, accent = C.signalGo, label }: Props_HardToggle) {
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
      hitSlop={HIT_HardToggle}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      style={styles_HardToggle.press}>
      <View
        style={[
          styles_HardToggle.track,
          {
            borderColor: value ? accent : C.stroke,
            backgroundColor: value ? accent + '40' : C.bgAlt,
          },
        ]}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles_HardToggle.knob,
            { backgroundColor: value ? accent : C.textMute, transform: [{ translateX }] },
            THEME.hardShadow(C.bg, 3),
          ]}
        />
      </View>
    </Pressable>
  );
}


export const HardToggle = React.memo(HardToggleBase_HardToggle);

// ------ HazardStripe ------
type Props_HazardStripe = {
  width: number;
  height?: number;
  color?: string;
  opacity?: number;
};

/** Diagonal road-works banding — the brutalist signature band. */
function HazardStripeBase_HazardStripe({ width, height = 14, color = C.signalSlow, opacity = 0.35 }: Props_HazardStripe) {
  const id = 'hazard' + Math.round(width) + Math.round(height);
  return (
    <View pointerEvents="none" style={[styles_HazardStripe.wrap, { width, height, opacity }]}>
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


export const HazardStripe = React.memo(HazardStripeBase_HazardStripe);

// ------ LevelCard ------
const HIT_LevelCard = { top: 6, bottom: 6, left: 6, right: 6 };

type Props_LevelCard = {
  level: number;
  stars: number;
  locked: boolean;
  zoneColor: string;
  size: number;
  onPress: (level: number) => void;
};

function LevelCardBase_LevelCard({ level, stars, locked, zoneColor, size, onPress }: Props_LevelCard) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.93);
  const handlePress = React.useCallback(() => onPress(level), [onPress, level]);

  return (
    <Pressable
      onPress={locked ? undefined : handlePress}
      onPressIn={locked ? undefined : onPressIn}
      onPressOut={locked ? undefined : onPressOut}
      disabled={locked}
      hitSlop={HIT_LevelCard}
      accessibilityRole="button"
      accessibilityLabel={'LEVEL ' + level}
      accessibilityState={{ disabled: locked }}
      style={{ width: size, height: size }}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles_LevelCard.card,
          {
            width: size,
            height: size,
            borderColor: locked ? C.stroke : zoneColor,
            backgroundColor: locked ? C.bgAlt : C.surface,
            opacity: locked ? 0.55 : 1,
            transform: [{ scale }],
          },
          THEME.hardShadow(locked ? C.bgAlt : C.bg, 4),
        ]}>
        {locked ? (
          <Lock size={20} color={C.textMute} />
        ) : (
          <View style={styles_LevelCard.inner}>
            <Text style={styles_LevelCard.num}>{level}</Text>
            <StarRow earned={stars} size={10} />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}


export const LevelCard = React.memo(LevelCardBase_LevelCard);

// ------ LivesRow ------
type Props_LivesRow = {
  lives: number;
  max: number;
};

/** Three chicken pips; a spent life keeps its slot but drops to 25 % opacity. */
function LivesRowBase_LivesRow({ lives, max }: Props_LivesRow) {
  const pips = [];
  for (let i = 0; i < max; i += 1) {
    const alive = i < lives;
    pips.push(
      <Image
        key={i}
        source={ASSETS.sprite1}
        resizeMode="contain"
        style={[
          styles_LivesRow.pip,
          { opacity: alive ? 1 : 0.25, tintColor: alive ? C.signalStop : C.textMute },
        ]}
      />,
    );
  }
  return <View style={styles_LivesRow.row}>{pips}</View>;
}


export const LivesRow = React.memo(LivesRowBase_LivesRow);

// ------ PauseOverlay ------
type Props_PauseOverlay = {
  level: number;
  lane: number;
  lanes: number;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
};

export function PauseOverlay({ level, lane, lanes, onResume, onRestart, onMenu }: Props_PauseOverlay) {
  return (
    <View style={styles_PauseOverlay.scrim}>
      <Text style={styles_PauseOverlay.title}>PAUSED</Text>
      <Text style={styles_PauseOverlay.sub}>
        LEVEL {level} · LANE {lane} / {lanes}
      </Text>
      <View style={styles_PauseOverlay.actions}>
        <HardButton label="RESUME" onPress={onResume} height={56} />
        <HardButton label="RESTART" onPress={onRestart} variant="secondary" accent={C.signalSlow} height={56} />
        <HardButton label="MENU" onPress={onMenu} variant="secondary" accent={C.stroke} height={56} />
      </View>
    </View>
  );
}

// ------ ProgressBar ------
type Props_ProgressBar = {
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
function ProgressBarBase_ProgressBar({
  progress,
  width,
  height = 10,
  colors = [C.primary, C.secondary],
  countdownMs,
  nonce = 0,
  running = true,
  animateMs = 420,
}: Props_ProgressBar) {
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
    <View style={[styles_ProgressBar.track, { width, height }]}>
      <Animated.View
        style={[
          styles_ProgressBar.fillWrap,
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


export const ProgressBar = React.memo(ProgressBarBase_ProgressBar);

// ------ RoadLane ------
type Props_RoadLane = {
  index: number;
  active: boolean;
  width: number;
  height: number;
  rush: boolean;
};

/** One strip of asphalt with its dashed centre line. */
function RoadLaneBase_RoadLane({ index, active, width, height, rush }: Props_RoadLane) {
  const base = index % 2 === 0 ? C.bgAlt : '#0E0E18';
  return (
    <View
      style={[
        styles_RoadLane.lane,
        {
          height,
          backgroundColor: active ? '#171729' : base,
          borderBottomColor: rush ? C.signalStop : C.strokeDim,
          borderBottomWidth: rush ? 2 : 1,
        },
      ]}>
      <Svg width={width} height={2} style={styles_RoadLane.dash}>
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


export const RoadLane = React.memo(RoadLaneBase_RoadLane);

// ------ ScreenHeader ------
const HIT_ScreenHeader = { top: 8, bottom: 8, left: 8, right: 8 };

type BackProps_ScreenHeader = {
  onPress: () => void;
  label?: string;
};

/** The one way back. Caption is literal text so the UI walker can find it. */
export function HeaderBackButton({ onPress, label = 'MENU' }: BackProps_ScreenHeader) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.92);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT_ScreenHeader}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles_ScreenHeader.backPress}>
      <Animated.View style={[styles_ScreenHeader.backPlate, { transform: [{ scale }] }]} pointerEvents="box-none">
        <Image source={ASSETS.buttonRound} style={styles_ScreenHeader.backPlateArt} resizeMode="contain" />
        <View style={styles_ScreenHeader.row}>
          <Image source={ASSETS.iconHome} style={styles_ScreenHeader.icon24} resizeMode="contain" />
          <Text style={styles_ScreenHeader.backLabel}>{label}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

type Props_ScreenHeader = {
  title: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  accent?: string;
};

/**
 * The shared header for every screen — one component, different slots, so the
 * styling cannot drift between Menu, Game, Result and the sub-screens.
 */
export function ScreenHeader({ title, leftSlot, rightSlot, accent = C.stroke }: Props_ScreenHeader) {
  return (
    <View style={[styles_ScreenHeader.header, { borderBottomColor: accent }]}>
      <View style={styles_ScreenHeader.side}>{leftSlot}</View>
      <View style={styles_ScreenHeader.center}>
        <Text numberOfLines={1} style={styles_ScreenHeader.title}>
          {title}
        </Text>
      </View>
      <View style={[styles_ScreenHeader.side, styles_ScreenHeader.sideRight]}>{rightSlot}</View>
    </View>
  );
}

// ------ ScreenShell ------
type Props_ScreenShell = {
  /** Per-screen gradient overlay — the only thing that tells the screens apart. */
  overlay: readonly string[];
  /** Background photo opacity. The Loader keeps it low so it reads darker than Menu. */
  bgOpacity?: number;
  blob?: string;
  blobSize?: number;
  blobTop?: number;
  blobLeft?: number;
  children: React.ReactNode;
};

/** bg_game + gradient + glow blob: three depth layers under every screen. */
export function ScreenShell({
  overlay,
  bgOpacity = 0.3,
  blob,
  blobSize,
  blobTop,
  blobLeft,
  children,
}: Props_ScreenShell) {
  return (
    <View style={styles_ScreenShell.root}>
      <ImageBackground
        source={ASSETS.bgGame}
        style={StyleSheet.absoluteFill}
        imageStyle={{ opacity: bgOpacity }}
        resizeMode="cover"
      />
      <LinearGradient
        colors={overlay as string[]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {blob ? (
        <GlowBlob color={blob} size={blobSize} top={blobTop} left={blobLeft} />
      ) : null}
      <View style={styles_ScreenShell.content}>{children}</View>
    </View>
  );
}

// ------ ShapeGlyph ------
export const SIGNAL_SHAPE: Record<CallKind, GlyphShape> = {
  go: 'circle',
  slow: 'square',
  stop: 'hexagon',
  egg: 'diamond',
};

type Props_ShapeGlyph = {
  shape: GlyphShape;
  size?: number;
  color: string;
};

function poly_ShapeGlyph(points: number[][], s: number): string {
  return points.map(p => `${p[0] * s},${p[1] * s}`).join(' ');
}

function ShapeGlyphBase_ShapeGlyph({ shape, size = 22, color }: Props_ShapeGlyph) {
  const s = size;
  switch (shape) {
    case 'square':
      return (
        <Svg width={s} height={s}>
          <Rect x={s * 0.14} y={s * 0.14} width={s * 0.72} height={s * 0.72} fill={color} />
        </Svg>
      );
    case 'hexagon':
      return (
        <Svg width={s} height={s}>
          <Polygon
            points={poly_ShapeGlyph(
              [[0.5, 0.06], [0.93, 0.3], [0.93, 0.7], [0.5, 0.94], [0.07, 0.7], [0.07, 0.3]],
              s,
            )}
            fill={color}
          />
        </Svg>
      );
    case 'diamond':
      return (
        <Svg width={s} height={s}>
          <Polygon points={poly_ShapeGlyph([[0.5, 0.04], [0.96, 0.5], [0.5, 0.96], [0.04, 0.5]], s)} fill={color} />
        </Svg>
      );
    case 'triangle':
      return (
        <Svg width={s} height={s}>
          <Polygon points={poly_ShapeGlyph([[0.5, 0.08], [0.95, 0.9], [0.05, 0.9]], s)} fill={color} />
        </Svg>
      );
    case 'cross':
      return (
        <Svg width={s} height={s}>
          <Rect x={s * 0.38} y={s * 0.06} width={s * 0.24} height={s * 0.88} fill={color} />
          <Rect x={s * 0.06} y={s * 0.38} width={s * 0.88} height={s * 0.24} fill={color} />
        </Svg>
      );
    case 'ring':
      return (
        <Svg width={s} height={s}>
          <Circle
            cx={s / 2}
            cy={s / 2}
            r={s * 0.36}
            stroke={color}
            strokeWidth={s * 0.18}
            fill="none"
          />
        </Svg>
      );
    case 'bar':
      return (
        <Svg width={s} height={s}>
          <Rect x={s * 0.06} y={s * 0.2} width={s * 0.88} height={s * 0.2} fill={color} />
          <Rect x={s * 0.06} y={s * 0.6} width={s * 0.88} height={s * 0.2} fill={color} />
        </Svg>
      );
    case 'pentagon':
      return (
        <Svg width={s} height={s}>
          <Polygon
            points={poly_ShapeGlyph([[0.5, 0.05], [0.96, 0.4], [0.79, 0.95], [0.21, 0.95], [0.04, 0.4]], s)}
            fill={color}
          />
        </Svg>
      );
    case 'star':
      return (
        <Svg width={s} height={s}>
          <Polygon
            points={poly_ShapeGlyph(
              [
                [0.5, 0.03], [0.62, 0.36], [0.97, 0.36], [0.69, 0.57], [0.8, 0.92],
                [0.5, 0.71], [0.2, 0.92], [0.31, 0.57], [0.03, 0.36], [0.38, 0.36],
              ],
              s,
            )}
            fill={color}
          />
        </Svg>
      );
    case 'arch':
      return (
        <Svg width={s} height={s}>
          <Path
            d={`M${s * 0.08} ${s * 0.9} L${s * 0.08} ${s * 0.5} A${s * 0.42} ${s * 0.42} 0 0 1 ${
              s * 0.92
            } ${s * 0.5} L${s * 0.92} ${s * 0.9} L${s * 0.68} ${s * 0.9} L${s * 0.68} ${
              s * 0.52
            } A${s * 0.18} ${s * 0.18} 0 0 0 ${s * 0.32} ${s * 0.52} L${s * 0.32} ${s * 0.9} Z`}
            fill={color}
          />
        </Svg>
      );
    case 'grid':
      return (
        <Svg width={s} height={s}>
          <Rect x={s * 0.08} y={s * 0.08} width={s * 0.36} height={s * 0.36} fill={color} />
          <Rect x={s * 0.56} y={s * 0.08} width={s * 0.36} height={s * 0.36} fill={color} />
          <Rect x={s * 0.08} y={s * 0.56} width={s * 0.36} height={s * 0.36} fill={color} />
          <Rect x={s * 0.56} y={s * 0.56} width={s * 0.36} height={s * 0.36} fill={color} />
        </Svg>
      );
    case 'circle':
    default:
      return (
        <Svg width={s} height={s}>
          <Circle cx={s / 2} cy={s / 2} r={s * 0.42} fill={color} />
        </Svg>
      );
  }
}

export const ShapeGlyph = React.memo(ShapeGlyphBase_ShapeGlyph);

// ------ SignalBeacon ------
const ORDER_SignalBeacon: readonly CallKind[] = ['go', 'slow', 'stop', 'egg'];

type LampProps_SignalBeacon = {
  kind: CallKind;
  lit: boolean;
  shapes: boolean;
};

function Lamp_SignalBeacon({ kind, lit, shapes }: LampProps_SignalBeacon) {
  const pulse = useRef(new Animated.Value(1)).current;
  const color = PAD_COLORS[kind];

  useEffect(() => {
    if (!lit) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 300, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, lit]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles_SignalBeacon.lamp,
        {
          borderColor: color,
          backgroundColor: lit ? color + '66' : C.bgAlt,
          opacity: lit ? 1 : 0.22,
          transform: [{ scale: pulse }],
        },
        lit ? THEME.hardShadow(color, 3) : null,
      ]}>
      {shapes ? <ShapeGlyph shape={SIGNAL_SHAPE[kind]} size={14} color={color} /> : null}
    </Animated.View>
  );
}

type Props_SignalBeacon = {
  call: SignalCall | null;
  stage: number;
  shapes: boolean;
  idle: boolean;
};

/** The beacon housing: sprite_5 plate + four lamps. Exactly one lamp is ever lit. */
function SignalBeaconBase_SignalBeacon({ call, stage, shapes, idle }: Props_SignalBeacon) {
  const active: CallKind | null = call
    ? stage === 1 && call.second
      ? call.second
      : call.kind
    : null;

  return (
    <View style={[styles_SignalBeacon.housing, THEME.hardShadow(C.bg, 6)]}>
      <Image source={ASSETS.sprite5} style={styles_SignalBeacon.plate} resizeMode="contain" />
      <View style={styles_SignalBeacon.grid}>
        {ORDER_SignalBeacon.map(kind => (
          <Lamp_SignalBeacon key={kind} kind={kind} lit={active === kind} shapes={shapes} />
        ))}
      </View>
      {idle ? <Text style={styles_SignalBeacon.idle}>TAP TO BEGIN</Text> : null}
      {call && call.second ? (
        <Text style={styles_SignalBeacon.double}>DOUBLE {stage === 0 ? '1 / 2' : '2 / 2'}</Text>
      ) : null}
    </View>
  );
}


export const SignalBeacon = React.memo(SignalBeaconBase_SignalBeacon);

// ------ SignalPad ------
const HIT_SignalPad = { top: 8, bottom: 8, left: 8, right: 8 };

type Props_SignalPad = {
  kind: CallKind;
  label: string;
  color: string;
  width: number;
  height: number;
  shapes: boolean;
  disabled: boolean;
  onPress: (kind: CallKind) => void;
};

/** Darkens a #rrggbb by the given factor — used for the hard pressed-in shadow. */
export function darken(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * factor);
  const g = Math.round(((n >> 8) & 255) * factor);
  const b = Math.round((n & 255) * factor);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function SignalPadBase_SignalPad({ kind, label, color, width, height, shapes, disabled, onPress }: Props_SignalPad) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.94);
  const [down, setDown] = useState(false);

  const handleIn = useCallback(() => {
    setDown(true);
    onPressIn();
  }, [onPressIn]);

  const handleOut = useCallback(() => {
    setDown(false);
    onPressOut();
  }, [onPressOut]);

  const handlePress = useCallback(() => onPress(kind), [onPress, kind]);

  return (
    <Pressable
      onPress={disabled ? undefined : handlePress}
      onPressIn={disabled ? undefined : handleIn}
      onPressOut={disabled ? undefined : handleOut}
      disabled={disabled}
      hitSlop={HIT_SignalPad}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={{ width, height, opacity: disabled ? 0.4 : 1 }}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles_SignalPad.pad,
          {
            width,
            height,
            borderColor: color,
            backgroundColor: color + '2E',
            transform: [{ scale }],
          },
          THEME.hardShadow(darken(color, 0.45), down ? 1 : 5),
        ]}>
        {shapes ? (
          <View style={styles_SignalPad.glyph}>
            <ShapeGlyph shape={SIGNAL_SHAPE[kind]} size={22} color={color} />
          </View>
        ) : null}
        <Text style={[styles_SignalPad.label, { color }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}


export const SignalPad = React.memo(SignalPadBase_SignalPad);
export const PAD_COLORS: Record<CallKind, string> = {
  go: C.signalGo,
  slow: C.signalSlow,
  stop: C.signalStop,
  egg: C.secondary,
};

// ------ StarRow ------
type Props_StarRow = {
  earned: number;
  total?: number;
  size?: number;
  animate?: boolean;
};

/** The star glyph is on the safe list on Android; it never falls back to tofu. */
function Star_StarRow({
  filled,
  size,
  animate,
  index,
}: {
  filled: boolean;
  size: number;
  animate: boolean;
  index: number;
}) {
  const scale = useRef(new Animated.Value(animate ? 0 : 1)).current;

  useEffect(() => {
    if (!animate) {
      scale.setValue(1);
      return;
    }
    const a = Animated.sequence([
      Animated.delay(120 * index),
      Animated.spring(scale, { toValue: 1.25, tension: 220, friction: 9, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 220, friction: 9, useNativeDriver: true }),
    ]);
    a.start();
    return () => a.stop();
  }, [scale, animate, index]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Text
        style={[
          styles_StarRow.star,
          {
            fontSize: size,
            lineHeight: size * 1.15,
            color: filled ? C.gold : C.stroke,
          },
          filled && size > 20 ? styles_StarRow.glow : null,
        ]}>
        {'★'}
      </Text>
    </Animated.View>
  );
}

function StarRowBase_StarRow({ earned, total = 3, size = 12, animate = false }: Props_StarRow) {
  const stars = [];
  for (let i = 0; i < total; i += 1) {
    stars.push(
      <Star_StarRow key={i} index={i} filled={i < earned} size={size} animate={animate} />,
    );
  }
  return <View style={[styles_StarRow.row, { gap: Math.max(2, size * 0.2) }]}>{stars}</View>;
}


export const StarRow = React.memo(StarRowBase_StarRow);

// ------ StatCard ------
type Props_StatCard = {
  value: string;
  label: string;
  accent: string;
  /** Renders null when there is nothing to show — never an empty rounded box. */
  hideWhenEmpty?: boolean;
  height?: number;
};

/**
 * All stat cards in a row share one shape: an accent square (not a PNG sprite, so
 * nothing can differ in aspect ratio), one big value, one caption. Only the colour
 * and the number change between them.
 */
function StatCardBase_StatCard({ value, label, accent, hideWhenEmpty = true, height }: Props_StatCard) {
  const empty = !value || value === '0' || value === 'x0' || value === '0 %';
  if (hideWhenEmpty && empty) {
    return null;
  }
  return (
    <View
      style={[
        styles_StatCard.card,
        height ? { height } : null,
        { borderColor: accent },
        THEME.hardShadow(C.bgAlt, 4),
      ]}>
      <View style={[styles_StatCard.accentSquare, { backgroundColor: accent }]} />
      <Text numberOfLines={1} style={[styles_StatCard.value, { color: accent }]}>
        {value}
      </Text>
      <Text numberOfLines={1} style={styles_StatCard.label}>
        {label}
      </Text>
    </View>
  );
}


export const StatCard = React.memo(StatCardBase_StatCard);

// ------ useGameProgress ------
type ProgressValue_useGameProgress = {
  profile: Profile;
  settings: GameSettings;
  stars: number;
  cleared: boolean[];
  nextLevel: number;
  updateSettings: (patch: Partial<GameSettings>) => void;
  commitRound: (summary: RoundSummary) => RoundSummary;
  resetAll: () => void;
};

const ProgressContext_useGameProgress = createContext<ProgressValue_useGameProgress | null>(null);

export function GameProgressProvider({ children }: { children: React.ReactNode }) {
  // Rehydrated once at app start; the ref keeps callbacks off stale closures.
  const [profile, setProfile] = useState<Profile>(() => loadProfile());
  const profileRef = useRef<Profile>(profile);
  profileRef.current = profile;

  const persist = useCallback((next: Profile) => {
    profileRef.current = next;
    saveProfile(next);
    setProfile(next);
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<GameSettings>) => {
      const current = profileRef.current;
      persist({ ...current, settings: { ...current.settings, ...patch } });
    },
    [persist],
  );

  const commitRound = useCallback(
    (summary: RoundSummary): RoundSummary => {
      const current = profileRef.current;
      const levels = current.levels.map((lv, i) => {
        if (i !== summary.level - 1) {
          return lv;
        }
        return {
          stars: summary.outcome === 'win' ? Math.max(lv.stars, summary.stars) : lv.stars,
          bestScore: Math.max(lv.bestScore, summary.score),
          cleared: lv.cleared || summary.outcome === 'win',
        };
      });

      const stats = {
        crossings: current.stats.crossings + summary.lane,
        correct: current.stats.correct + summary.correct,
        answers: current.stats.answers + summary.answers,
        bestScore: Math.max(current.stats.bestScore, summary.score),
        bestCombo: Math.max(current.stats.bestCombo, summary.bestCombo),
      };

      const eggs = current.eggs + summary.eggs;
      const draft: Profile = {
        ...current,
        levels,
        eggs,
        stats,
        records: [
          {
            level: summary.level,
            stars: summary.outcome === 'win' ? summary.stars : 0,
            score: summary.score,
            bestCombo: summary.bestCombo,
            outcome: summary.outcome,
          },
          ...current.records,
        ].slice(0, RECORD_HISTORY),
      };

      const unlocked = evaluateCharms(
        {
          eggs,
          totalStars: totalStars(draft),
          clearedLevels: clearedLevelNumbers(draft),
          bestCombo: stats.bestCombo,
          bestScore: stats.bestScore,
          bestStars: bestStars(draft),
        },
        draft.charms,
      );

      const next: Profile = { ...draft, charms: draft.charms.concat(unlocked) };
      persist(next);
      return { ...summary, newCharms: unlocked };
    },
    [persist],
  );

  const resetAll = useCallback(() => {
    const fresh = resetProfile();
    persist(fresh);
  }, [persist]);

  const value = useMemo<ProgressValue_useGameProgress>(() => {
    const cleared = clearedFlags(profile);
    const stars = totalStars(profile);
    return {
      profile,
      settings: profile.settings,
      stars,
      cleared,
      nextLevel: nextPlayableLevel(stars, cleared),
      updateSettings,
      commitRound,
      resetAll,
    };
  }, [profile, updateSettings, commitRound, resetAll]);

  return <ProgressContext_useGameProgress.Provider value={value}>{children}</ProgressContext_useGameProgress.Provider>;
}

const FALLBACK_useGameProgress: ProgressValue_useGameProgress = {
  profile: emptyProfile(),
  settings: emptyProfile().settings,
  stars: 0,
  cleared: [],
  nextLevel: 1,
  updateSettings: () => {},
  commitRound: s => s,
  resetAll: () => {},
};

export function useGameProgress(): ProgressValue_useGameProgress {
  return useContext(ProgressContext_useGameProgress) || FALLBACK_useGameProgress;
}

/** Narrow selectors — a component subscribes to what it draws, not to everything. */
export function useSettings(): GameSettings {
  return useGameProgress().settings;
}

export function useTotalStars(): number {
  return useGameProgress().stars;
}

export function useEggCount(): number {
  return useGameProgress().profile.eggs;
}

// ------ usePressScale ------
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

// ------ useSignalRound ------
export type RoundPhase = 'idle' | 'playing' | 'mistake' | 'paused' | 'win' | 'lose';

export type RoundState = {
  phase: RoundPhase;
  lane: number;
  lives: number;
  combo: number;
  score: number;
  eggs: number;
  mistakes: number;
  bestCombo: number;
  correct: number;
  answers: number;
  call: SignalCall | null;
  stage: number;
  windowMs: number;
  /** Bumped on every new call so the window bar restarts. */
  callNonce: number;
  hazardNonce: number;
  eggNonce: number;
  carNonce: number;
  carLane: number;
  step: number;
  usedRush: number[];
  panic: boolean;
};

function initialState_useSignalRound(): RoundState {
  return {
    phase: 'idle',
    lane: 0,
    lives: LIVES,
    combo: 0,
    score: 0,
    eggs: 0,
    mistakes: 0,
    bestCombo: 0,
    correct: 0,
    answers: 0,
    call: null,
    stage: 0,
    windowMs: 0,
    callNonce: 0,
    hazardNonce: 0,
    eggNonce: 0,
    carNonce: 0,
    carLane: -1,
    step: 0,
    usedRush: [],
    panic: false,
  };
}

type Options_useSignalRound = {
  level: number;
  attempt: number;
  settings: GameSettings;
  onGameOver: (summary: RoundSummary) => void;
};

/**
 * The round loop. Every timer lives in a ref and is cleared on pause, restart and
 * unmount, so nothing keeps ticking after the screen is gone. Callbacks read the
 * live round from a ref, never from a stale render closure.
 */
export function useSignalRound({ level, attempt, settings, onGameOver }: Options_useSignalRound) {
  const cfg = useMemo(() => levelConfig(level), [level]);
  const round = useMemo(() => generateRound(cfg.level, attempt), [cfg.level, attempt]);

  const [state, setState] = useState<RoundState>(initialState_useSignalRound);
  const ref = useRef<RoundState>(state);
  ref.current = state;

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef<number>(0);
  const remainingRef = useRef<number>(0);
  const finishedRef = useRef<boolean>(false);
  const rngRef = useRef(mulberry32(round.seed));
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const commit = useCallback((patch: Partial<RoundState>) => {
    const next = { ...ref.current, ...patch };
    ref.current = next;
    setState(next);
  }, []);

  const finish = useCallback(
    (outcome: RoundOutcome) => {
      if (finishedRef.current) {
        return;
      }
      finishedRef.current = true;
      clearTimer();
      const s = ref.current;
      commit({ phase: outcome === 'win' ? 'win' : 'lose', call: null });
      const summary: RoundSummary = {
        level: cfg.level,
        outcome,
        score: s.score,
        stars: outcome === 'win' ? starsFor(s.mistakes, settingsRef.current.reactionAssist) : 0,
        bestCombo: s.bestCombo,
        eggs: s.eggs,
        mistakes: s.mistakes,
        lane: s.lane,
        lanes: cfg.lanes,
        correct: s.correct,
        answers: s.answers,
        assist: settingsRef.current.reactionAssist,
        seed: round.seed,
        newCharms: [],
      };
      // Let the win/lose beat play before the Result screen takes over.
      timerRef.current = setTimeout(() => {
        onGameOverRef.current(summary);
      }, 120);
    },
    [cfg.level, cfg.lanes, clearTimer, commit, round.seed],
  );

  /** Declared up front so issueCall and expire can reference each other. */
  const issueCallRef = useRef<() => void>(() => {});

  const expire = useCallback(() => {
    const s = ref.current;
    if (s.phase !== 'playing') {
      return;
    }
    clearTimer();
    const lives = s.lives - 1;
    commit({
      phase: 'mistake',
      lives,
      combo: 0,
      mistakes: s.mistakes + 1,
      answers: s.answers + 1,
      call: null,
      stage: 0,
      panic: true,
      hazardNonce: s.hazardNonce + 1,
      carNonce: s.carNonce + 1,
      carLane: s.lane,
    });
    if (lives <= 0) {
      timerRef.current = setTimeout(() => finish('lose'), MISTAKE_FREEZE_MS);
      return;
    }
    timerRef.current = setTimeout(() => issueCallRef.current(), MISTAKE_FREEZE_MS);
  }, [clearTimer, commit, finish]);

  const issueCall = useCallback(() => {
    const s = ref.current;
    if (finishedRef.current || s.phase === 'paused') {
      return;
    }
    const call = callForStep(
      round,
      s.step,
      s.lane,
      s.combo,
      cfg.level,
      s.usedRush,
      rngRef.current.next(),
    );
    const windowMs = windowMsFor({
      level: cfg.level,
      combo: s.combo,
      assist: settingsRef.current.reactionAssist,
      egg: call.kind === 'egg',
      panic: s.panic,
      panicMs: PANIC_WINDOW_MS,
    });
    commit({
      phase: 'playing',
      call,
      stage: 0,
      windowMs,
      callNonce: s.callNonce + 1,
      step: s.step + 1,
      panic: false,
      carNonce: call.rush ? s.carNonce + 1 : s.carNonce,
      carLane: call.rush ? s.lane : s.carLane,
    });
    clearTimer();
    startedAtRef.current = Date.now();
    remainingRef.current = windowMs;
    timerRef.current = setTimeout(expire, windowMs);
  }, [cfg.level, clearTimer, commit, expire, round]);

  issueCallRef.current = issueCall;

  const press = useCallback(
    (pad: CallKind) => {
      const s = ref.current;
      if (s.phase !== 'playing' || !s.call || finishedRef.current) {
        return;
      }
      const result = resolveAnswer(s.call, pad, s.stage, s.combo);

      if (!result.correct) {
        clearTimer();
        const lives = s.lives - 1;
        commit({
          phase: 'mistake',
          lives,
          combo: 0,
          mistakes: s.mistakes + 1,
          answers: s.answers + 1,
          call: null,
          stage: 0,
          hazardNonce: s.hazardNonce + 1,
          carNonce: s.carNonce + 1,
          carLane: s.lane,
        });
        if (lives <= 0) {
          timerRef.current = setTimeout(() => finish('lose'), MISTAKE_FREEZE_MS);
          return;
        }
        timerRef.current = setTimeout(() => issueCallRef.current(), MISTAKE_FREEZE_MS);
        return;
      }

      if (result.partial) {
        // First half of a double-signal landed: keep the window running, await pad two.
        commit({ stage: 1 });
        return;
      }

      clearTimer();
      const combo = s.combo + result.comboDelta;
      const lane = result.advance ? s.lane + 1 : s.lane;
      const usedRush =
        s.call.rush && s.usedRush.indexOf(s.lane) < 0 ? s.usedRush.concat([s.lane]) : s.usedRush;
      commit({
        combo,
        bestCombo: Math.max(s.bestCombo, combo),
        score: s.score + result.points,
        eggs: s.eggs + (result.egg ? 1 : 0),
        eggNonce: result.egg ? s.eggNonce + 1 : s.eggNonce,
        correct: s.correct + 1,
        answers: s.answers + 1,
        lane,
        stage: 0,
        call: null,
        usedRush,
      });

      if (lane >= cfg.lanes) {
        timerRef.current = setTimeout(() => finish('win'), 260);
        return;
      }
      timerRef.current = setTimeout(() => issueCallRef.current(), CALL_BEAT_MS);
    },
    [cfg.lanes, clearTimer, commit, finish],
  );

  const pause = useCallback(() => {
    const s = ref.current;
    if (s.phase !== 'playing' && s.phase !== 'idle') {
      return;
    }
    const elapsed = Date.now() - startedAtRef.current;
    remainingRef.current = Math.max(120, (s.windowMs || FIRST_CALL_DELAY_MS) - elapsed);
    clearTimer();
    commit({ phase: 'paused' });
  }, [clearTimer, commit]);

  const resume = useCallback(() => {
    const s = ref.current;
    if (s.phase !== 'paused') {
      return;
    }
    if (!s.call) {
      commit({ phase: 'idle' });
      clearTimer();
      timerRef.current = setTimeout(() => issueCallRef.current(), CALL_BEAT_MS);
      return;
    }
    commit({ phase: 'playing', callNonce: s.callNonce + 1, windowMs: remainingRef.current });
    clearTimer();
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(expire, remainingRef.current);
  }, [clearTimer, commit, expire]);

  const restart = useCallback(() => {
    clearTimer();
    finishedRef.current = false;
    rngRef.current = mulberry32(round.seed);
    const fresh = initialState_useSignalRound();
    ref.current = fresh;
    setState(fresh);
    timerRef.current = setTimeout(() => issueCallRef.current(), FIRST_CALL_DELAY_MS);
  }, [clearTimer, round.seed]);

  /** The first call fires on its own; a pad touch during idle brings it forward. */
  const nudge = useCallback(() => {
    if (ref.current.phase !== 'idle') {
      return;
    }
    clearTimer();
    issueCallRef.current();
  }, [clearTimer]);

  useEffect(() => {
    // A new seed means a new attempt: wipe the round and start the clock again.
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    finishedRef.current = false;
    rngRef.current = mulberry32(round.seed);
    const fresh = initialState_useSignalRound();
    ref.current = fresh;
    setState(fresh);
    timerRef.current = setTimeout(() => issueCallRef.current(), FIRST_CALL_DELAY_MS);
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      finishedRef.current = true;
    };
  }, [round.seed]);

  const multiplier = multiplierFor(state.combo);
  const padsEnabled = state.phase === 'playing' || state.phase === 'idle';

  return {
    cfg,
    round,
    state,
    multiplier,
    padsEnabled,
    press,
    pause,
    resume,
    restart,
    nudge,
  };
}

// ------ format ------
export function groupNumber(n: number): string {
  const safe = Math.max(0, Math.floor(Number.isFinite(n) ? n : 0));
  return String(safe).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Multiplier chip text, e.g. 1.5 -> "x1.5", 2 -> "x2". */
export function formatMultiplier(m: number): string {
  return 'x' + (Number.isInteger(m) ? String(m) : m.toFixed(1));
}

/** Percentage with no decimals, e.g. 0.8421 -> "84 %". */
export function formatPercent(ratio: number): string {
  const safe = Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : 0;
  return Math.round(safe * 100) + ' %';
}

/** "L5 · 12,480" style compact run label. */
export function formatRunLabel(level: number, score: number): string {
  return 'L' + level + ' · ' + groupNumber(score);
}

/* autopad-begin */
function ufetezitip(): number { return 184; }
function ivolux(): void {}
function igokiyajaqa(_mewirilav: string, _teliyunizibi: number, _ujopocuxa: boolean): number {
  const oquqifa: number = 94;
  return oquqifa;
}
function ubuyizik(): number {
  const zuweyuta = 40;
  return zuweyuta > 53 ? 79 : 139;
}
function xeyamuyutel(_orocamobeq: number, _ojidoxe: string): void {
  const qalosaz = 27;
  if (qalosaz > 79) return;
}
function muyageni(_iviberapuf: boolean): string { return "uvod"; }
function enibap(_zaliqini: string, _nefumi: boolean, _unufuja: number): void {
  const voyanado = 56;
  if (voyanado > 9) return;
}
function upaqaro(_azadafeyevaf: string, _memoxavef: number): string {
  const umuturikisam = 48;
  const luqogusosuq: string = "kisi";
  return luqogusosuq;
}
function bevuniw(_uxacaq: number, _uyirafu: string): number {
  const likoqol = 7;
  const nelomemete: number = 183;
  return nelomemete;
}
function pefoxace(_amorixaso: boolean): number {
  const oqutixuqoc: number = 93;
  return oqutixuqoc;
}
/* autopad-end */
