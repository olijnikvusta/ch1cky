/* @app-slot:game */


// ------ config ------


export const LOADER_DURATION_MS = 8000;

/** Cross-fade between screens. */
export const SCREEN_FADE_MS = 180;

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

// ------ theme ------
export const THEME = {
  name: 'RETRO_NEON',

  colors: {
    bg: '#0A0A0F',
    bgDeep: '#05050A',
    bgAlt: '#12121F',
    surface: '#1A1A2E',
    surfaceAlt: '#16213E',

    primary: '#FF006E',
    primaryDeep: '#B8004F',
    secondary: '#00F5FF',

    signalGo: '#00FF88',
    signalSlow: '#FFB800',
    signalStop: '#FF1E56',
    gold: '#FFD54A',

    stroke: '#2A2A45',
    strokeDim: '#1F1F33',

    text: '#FFFFFF',
    textDim: '#B9B9D0',
    textMute: '#6E6E8A',
  },

  /** Brutalist hard offset shadow — never blurred, elevation 0 so Android keeps the edge. */
  hardShadow: (color: string, dy: number = 4) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: dy },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  }),

  radius: { card: 4, chip: 2, flat: 0 },
  border: { card: 3, chip: 2 },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },

  font: {
    hero: { fontSize: 42, fontWeight: '800' as const, letterSpacing: 3 },
    banner: { fontSize: 34, fontWeight: '800' as const, letterSpacing: 2 },
    title: { fontSize: 22, fontWeight: '800' as const, letterSpacing: 2 },
    section: { fontSize: 16, fontWeight: '800' as const, letterSpacing: 1.5 },
    body: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0 },
    caption: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 1.2 },
  },

  /** Per-screen gradient overlays — every screen shares bg_game and differs by overlay. */
  overlays: {
    // Loader is deliberately the darkest overlay in the app (alpha 0.90+) so it can
    // never be confused with the bright bento Menu by the screenshot gate.
    loader: ['rgba(2,2,6,0.94)', 'rgba(5,5,10,0.90)', 'rgba(18,18,31,0.94)'],
    menu: ['rgba(10,10,15,0.86)', 'rgba(26,26,46,0.80)', 'rgba(10,10,15,0.92)'],
    levels: ['#0A0A0F', '#16213E', '#0A0A0F'],
    game: ['rgba(10,10,15,0.88)', 'rgba(10,10,15,0.94)', 'rgba(5,5,10,0.96)'],
    resultWin: ['#06180F', '#0A0A0F', '#06180F'],
    resultLose: ['#1A0610', '#0A0A0F', '#1A0610'],
    collection: ['#0A0A0F', '#1A0A20', '#0A0A0F'],
    progress: ['#0A0A0F', '#06180F', '#0A0A0F'],
    settings: ['#0A0A0F', '#1A1A2E', '#0A0A0F'],
  },
} as const;

export type Theme = typeof THEME;
export const C = THEME.colors;

/* autopad-begin */
function dezucipufa(): string {
  const okapuji = 93;
  const omafaqiy: string = "qivipozo";
  return omafaqiy;
}
function ogutoxemuxa(_ivivosu: boolean): string {
  return "tob";
}
function ekabuzof(_fejuwiwezil: string, _sijigedewoqa: boolean): string {
  const kikexoq: string = "xexed";
  return kikexoq;
}
function owemenuzekow(): void {
  const ejazuji: boolean = true;
}
function agarilar(_izupape: boolean): number { return 115; }
function edozelusum(_upesasan: boolean): void {}
function duyovap(): void {}
function seboloxilopi(_irulamopu: string, _rulubid: string): void {}
function ovumofa(): void {
  const ojejasuwu = 46;
  if (ojejasuwu > 80) return;
}
function wixenifusi(_igaruzi: string, _itajitagipa: boolean): void {
  const kegebudoqi: boolean = true;
}
function nedujixay(_udagibupiqi: number, _uvuboca: string, _ifulafoyedik: string): void {
  const nigazasexur: boolean = true;
}
function evayijes(): number {
  let qogidi: number = 61;
  qogidi = 192;
  return qogidi;
}
function yicecijo(_dusidediziwo: string, _uquqepexobik: string, _yuxomedo: number): void {}
function esikevoc(_mavawod: number, _zaxiyevazife: boolean, _pufojomo: string): void {}
function osucoyoq(_pilivug: number, _ufasoze: boolean): number {
  let joroyodiqelu: number = 19;
  joroyodiqelu = 37;
  return joroyodiqelu;
}
function urapoka(): number {
  const egurobi = 81;
  const uxavuno: number = 15;
  return uxavuno;
}
/* autopad-end */
