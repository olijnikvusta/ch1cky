import {
  ASSIST_BONUS_MS,
  ASSIST_STAR_CAP,
  COMBO_SQUEEZE,
  COMBO_TIERS,
  EGG_WINDOW_FACTOR,
  SCORE_CORRECT,
  SCORE_DOUBLE,
  SCORE_EGG,
  SCORE_RUSH_HOLD,
  STARS_BY_MISTAKES,
  WINDOW_COMBO_FLOOR_MS,
} from '../constants/config';
import { C } from '../constants/theme';
import { windowFor } from './levels';

/** Feather Multiplier: x1 -> x1.5 @5 -> x2 @10 -> x3 @15. */
export function multiplierFor(combo: number): number {
  const c = Math.max(0, Math.floor(combo || 0));
  for (let i = 0; i < COMBO_TIERS.length; i += 1) {
    if (c >= COMBO_TIERS[i].combo) {
      return COMBO_TIERS[i].mult;
    }
  }
  return 1;
}

export function comboColor(multiplier: number): string {
  if (multiplier >= 3) {
    return C.gold;
  }
  if (multiplier >= 2) {
    return C.signalGo;
  }
  if (multiplier > 1) {
    return C.secondary;
  }
  return C.textDim;
}

export type GainKind = 'correct' | 'double' | 'rush' | 'egg';

export function baseScore(kind: GainKind): number {
  switch (kind) {
    case 'double':
      return SCORE_DOUBLE;
    case 'rush':
      return SCORE_RUSH_HOLD;
    case 'egg':
      return SCORE_EGG;
    default:
      return SCORE_CORRECT;
  }
}

/** Every gain is scaled by the live multiplier. */
export function scoreFor(kind: GainKind, combo: number): number {
  return Math.round(baseScore(kind) * multiplierFor(combo));
}

/**
 * Live signal window: level curve, -8 % per 5 points of combo (floor 620 ms),
 * +250 ms with Reaction Assist, x0.8 for a golden egg call.
 */
export function windowMsFor(opts: {
  level: number;
  combo: number;
  assist: boolean;
  egg?: boolean;
  panic?: boolean;
  panicMs?: number;
}): number {
  if (opts.panic) {
    return (opts.panicMs || 900) + (opts.assist ? ASSIST_BONUS_MS : 0);
  }
  const steps = Math.floor(Math.max(0, opts.combo || 0) / 5);
  const squeezed = windowFor(opts.level) * Math.pow(1 - COMBO_SQUEEZE, steps);
  let ms = Math.max(WINDOW_COMBO_FLOOR_MS, squeezed);
  if (opts.egg) {
    ms = ms * EGG_WINDOW_FACTOR;
  }
  if (opts.assist) {
    ms += ASSIST_BONUS_MS;
  }
  return Math.round(ms);
}

/** 3 stars = flawless, 2 = one mistake, 1 = two mistakes. Assist caps the award at 2. */
export function starsFor(mistakes: number, assist: boolean): number {
  const m = Math.max(0, Math.floor(mistakes || 0));
  const raw = m < STARS_BY_MISTAKES.length ? STARS_BY_MISTAKES[m] : 1;
  return assist ? Math.min(ASSIST_STAR_CAP, raw) : raw;
}

export function accuracyOf(correct: number, answers: number): number {
  if (!answers || answers <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(1, correct / answers));
}
