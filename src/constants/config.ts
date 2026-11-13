/**
 * Ch1cky tuning constants. Fictional points only — no money, no purchases, no ads.
 */

/** Splash holds for exactly 8000 ms, timer-driven. Never shorter: the QA capture needs it. */
export const LOADER_DURATION_MS = 8000;

/** Cross-fade between screens. */
export const SCREEN_FADE_MS = 260;

export const LIVES = 3;
export const TOTAL_LEVELS = 12;
export const TOTAL_CHARMS = 12;

/** Signal window (ms) before the call expires. */
export const WINDOW_BASE_MS = 1600;
export const WINDOW_STEP_MS = 90;
export const WINDOW_FLOOR_MS = 700;
/** Hard floor once the combo squeeze is applied. */
export const WINDOW_COMBO_FLOOR_MS = 620;
/** Reaction Assist adds this to every window and caps the star award at 2. */
export const ASSIST_BONUS_MS = 250;
/** -8 % per 5 points of combo. */
export const COMBO_SQUEEZE = 0.08;

/** After a missed window the next call always gets this generous "panic" window. */
export const PANIC_WINDOW_MS = 900;
/** Freeze after a mistake: hazard flash + shake + car sweep. */
export const MISTAKE_FREEZE_MS = 450;
/** Beat between a correct answer and the next call. */
export const CALL_BEAT_MS = 140;
/** Idle grace before the very first call of a round. */
export const FIRST_CALL_DELAY_MS = 1200;
/** Golden egg windows are tighter. */
export const EGG_WINDOW_FACTOR = 0.8;

export const SCORE_CORRECT = 100;
export const SCORE_DOUBLE = 250;
export const SCORE_RUSH_HOLD = 60;
export const SCORE_EGG = 500;

/** Multiplier tiers: combo threshold -> multiplier. */
export const COMBO_TIERS: ReadonlyArray<{ combo: number; mult: number }> = [
  { combo: 15, mult: 3 },
  { combo: 10, mult: 2 },
  { combo: 5, mult: 1.5 },
  { combo: 0, mult: 1 },
];

/** Golden egg chance grows with the multiplier: 6 % base -> 14 % at x3. */
export const EGG_CHANCE_BASE = 0.06;
export const EGG_CHANCE_MAX = 0.14;
/** EGG calls appear from this level on. */
export const EGG_FROM_LEVEL = 2;
/** Double-signal calls appear from this level on. */
export const DOUBLE_FROM_LEVEL = 4;
export const DOUBLE_CHANCE_MIN = 0.18;
export const DOUBLE_CHANCE_MAX = 0.3;
/** Rush Hour traffic appears from this level on. */
export const RUSH_FROM_LEVEL = 7;

/** Sequence generation: how many validation retries before the fallback is used. */
export const GEN_MAX_ATTEMPTS = 20;
/** Guard rails checked on every generated sequence. */
export const MAX_SAME_IN_A_ROW = 2;
export const MAX_STOP_SHARE = 0.4;

/** Star thresholds by mistake count. */
export const STARS_BY_MISTAKES = [3, 2, 1] as const;
/** Reaction Assist caps the award. */
export const ASSIST_STAR_CAP = 2;

/** Zone unlock thresholds, in total stars. */
export const ZONE_STAR_GATES = [0, 6, 14] as const;

/** How many finished runs the Progress screen keeps. */
export const RECORD_HISTORY = 5;
