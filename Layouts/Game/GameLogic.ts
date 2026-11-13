/* @app-slot:game */
import { ASSIST_BONUS_MS, ASSIST_STAR_CAP, C, COMBO_SQUEEZE, COMBO_TIERS, DOUBLE_CHANCE_MAX, DOUBLE_CHANCE_MIN, DOUBLE_FROM_LEVEL, EGG_CHANCE_BASE, EGG_CHANCE_MAX, EGG_FROM_LEVEL, EGG_WINDOW_FACTOR, GEN_MAX_ATTEMPTS, MAX_SAME_IN_A_ROW, MAX_STOP_SHARE, RECORD_HISTORY, RUSH_FROM_LEVEL, SCORE_CORRECT, SCORE_DOUBLE, SCORE_EGG, SCORE_RUSH_HOLD, STARS_BY_MISTAKES, TOTAL_LEVELS, WINDOW_BASE_MS, WINDOW_COMBO_FLOOR_MS, WINDOW_FLOOR_MS, WINDOW_STEP_MS, ZONE_STAR_GATES } from './AppResources';

// ------ index ------
export const ASSETS = {
  bgGame: require('./assets/bg_game.png'),
  logo: require('./assets/logo.png'),
  iconHome: require('./assets/icon_home.png'),
  iconPause: require('./assets/icon_pause.png'),
  sprite1: require('./assets/sprite_1.png'),
  sprite2: require('./assets/sprite_2.png'),
  sprite3: require('./assets/sprite_3.png'),
  sprite4: require('./assets/sprite_4.png'),
  sprite5: require('./assets/sprite_5.png'),
  buttonRect: require('./assets/button_rect.png'),
  buttonRound: require('./assets/button_round.png'),
} as const;

export type AssetKey = keyof typeof ASSETS;

// ------ collection ------
export type GlyphShape =
  | 'circle'
  | 'square'
  | 'hexagon'
  | 'diamond'
  | 'triangle'
  | 'cross'
  | 'ring'
  | 'bar'
  | 'pentagon'
  | 'star'
  | 'arch'
  | 'grid';

export type Charm = {
  id: string;
  name: string;
  accent: string;
  shape: GlyphShape;
  /** Shown on the locked card instead of the name. */
  condition: string;
};

export type UnlockContext = {
  eggs: number;
  totalStars: number;
  clearedLevels: number[];
  bestCombo: number;
  bestScore: number;
  bestStars: number;
};

type Rule_collection = (ctx: UnlockContext) => boolean;

const cleared_collection = (level: number): Rule_collection => ctx => ctx.clearedLevels.indexOf(level) >= 0;

export const CHARMS: readonly Charm[] = [
  { id: 'morning-feather', name: 'MORNING FEATHER', accent: C.signalGo, shape: 'circle', condition: 'CLEAR LEVEL 1' },
  { id: 'crossing-badge', name: 'CROSSING BADGE', accent: C.gold, shape: 'hexagon', condition: '3 EGGS' },
  { id: 'golden-yolk', name: 'GOLDEN YOLK', accent: C.gold, shape: 'diamond', condition: '6 EGGS' },
  { id: 'night-lamp', name: 'NIGHT LAMP', accent: C.secondary, shape: 'ring', condition: '10 EGGS' },
  { id: 'hazard-tape', name: 'HAZARD TAPE', accent: C.signalSlow, shape: 'bar', condition: 'CLEAR LEVEL 6' },
  { id: 'lucky-pebble', name: 'LUCKY PEBBLE', accent: C.signalGo, shape: 'pentagon', condition: 'x3 COMBO' },
  { id: 'tin-whistle', name: 'TIN WHISTLE', accent: C.textDim, shape: 'triangle', condition: 'SCORE 5,000' },
  { id: 'red-ribbon', name: 'RED RIBBON', accent: C.signalStop, shape: 'cross', condition: 'EARN 6 STARS' },
  { id: 'copper-bell', name: 'COPPER BELL', accent: C.signalSlow, shape: 'arch', condition: 'EARN 14 STARS' },
  { id: 'blue-shell', name: 'BLUE SHELL', accent: C.secondary, shape: 'square', condition: 'CLEAR LEVEL 9' },
  { id: 'road-star', name: 'ROAD STAR', accent: C.gold, shape: 'star', condition: 'A 3-STAR LEVEL' },
  { id: 'dawn-crest', name: 'DAWN CREST', accent: C.primary, shape: 'grid', condition: 'CLEAR LEVEL 12' },
];

const RULES_collection: Record<string, Rule_collection> = {
  'morning-feather': cleared_collection(1),
  'crossing-badge': ctx => ctx.eggs >= 3,
  'golden-yolk': ctx => ctx.eggs >= 6,
  'night-lamp': ctx => ctx.eggs >= 10,
  'hazard-tape': cleared_collection(6),
  'lucky-pebble': ctx => ctx.bestCombo >= 15,
  'tin-whistle': ctx => ctx.bestScore >= 5000,
  'red-ribbon': ctx => ctx.totalStars >= 6,
  'copper-bell': ctx => ctx.totalStars >= 14,
  'blue-shell': cleared_collection(9),
  'road-star': ctx => ctx.bestStars >= 3,
  'dawn-crest': cleared_collection(12),
};

export function charmById(id: string): Charm | undefined {
  return CHARMS.find(c => c.id === id);
}

/** Returns the charm ids unlocked by this context that the player does not own yet. */
export function evaluateCharms(ctx: UnlockContext, owned: readonly string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < CHARMS.length; i += 1) {
    const charm = CHARMS[i];
    if (owned.indexOf(charm.id) >= 0) {
      continue;
    }
    const rule = RULES_collection[charm.id];
    if (rule && rule(ctx)) {
      out.push(charm.id);
    }
  }
  return out;
}

// ------ levels ------
export type Zone = {
  id: number;
  name: string;
  color: string;
  starsRequired: number;
  levels: number[];
};

export const ZONES: readonly Zone[] = [
  { id: 0, name: 'VILLAGE LANE', color: C.signalGo, starsRequired: ZONE_STAR_GATES[0], levels: [1, 2, 3, 4] },
  { id: 1, name: 'TOWN CROSSING', color: C.signalSlow, starsRequired: ZONE_STAR_GATES[1], levels: [5, 6, 7, 8] },
  { id: 2, name: 'NIGHT HIGHWAY', color: C.signalStop, starsRequired: ZONE_STAR_GATES[2], levels: [9, 10, 11, 12] },
];

export const LEVEL_NAMES: readonly string[] = [
  'FIRST STEPS', 'MORNING RUN', 'VILLAGE LANE', 'MARKET BEND',
  'TOWN CROSSING', 'SCHOOL ZONE', 'RUSH HOUR', 'IRON BRIDGE',
  'NIGHT HIGHWAY', 'NEON MILE', 'LAST LAMP', 'DAWN CREST',
];

export type LevelConfig = {
  level: number;
  name: string;
  zone: Zone;
  lanes: number;
  windowMs: number;
  doubleChance: number;
  rushCars: number;
  eggsAllowed: boolean;
};

export function clampLevel(level: number): number {
  if (!Number.isFinite(level)) {
    return 1;
  }
  return Math.max(1, Math.min(TOTAL_LEVELS, Math.floor(level)));
}

export function zoneOf(level: number): Zone {
  const l = clampLevel(level);
  const found = ZONES.find(z => z.levels.indexOf(l) >= 0);
  return found || ZONES[0];
}

/** LANES = 6 + floor(level / 3) -> 6 at L1, 10 at L12. */
export function lanesFor(level: number): number {
  return 6 + Math.floor(clampLevel(level) / 3);
}

/** window = max(700, 1600 - 90 * (level - 1)) */
export function windowFor(level: number): number {
  return Math.max(WINDOW_FLOOR_MS, WINDOW_BASE_MS - WINDOW_STEP_MS * (clampLevel(level) - 1));
}

export function doubleChanceFor(level: number): number {
  const l = clampLevel(level);
  if (l < DOUBLE_FROM_LEVEL) {
    return 0;
  }
  const span = TOTAL_LEVELS - DOUBLE_FROM_LEVEL;
  const t = span <= 0 ? 1 : (l - DOUBLE_FROM_LEVEL) / span;
  return DOUBLE_CHANCE_MIN + (DOUBLE_CHANCE_MAX - DOUBLE_CHANCE_MIN) * t;
}

export function rushCarsFor(level: number): number {
  const l = clampLevel(level);
  if (l < RUSH_FROM_LEVEL) {
    return 0;
  }
  return l >= 10 ? 2 : 1;
}

export function levelConfig(level: number): LevelConfig {
  const l = clampLevel(level);
  return {
    level: l,
    name: LEVEL_NAMES[l - 1],
    zone: zoneOf(l),
    lanes: lanesFor(l),
    windowMs: windowFor(l),
    doubleChance: doubleChanceFor(l),
    rushCars: rushCarsFor(l),
    eggsAllowed: l >= EGG_FROM_LEVEL,
  };
}

/** A zone opens once the player owns enough stars in total. */
export function zoneUnlocked(zone: Zone, totalStars: number): boolean {
  return totalStars >= zone.starsRequired;
}

/** A level is playable when its zone is open and the previous level was cleared. */
export function levelUnlocked(level: number, totalStars: number, cleared: boolean[]): boolean {
  const l = clampLevel(level);
  if (!zoneUnlocked(zoneOf(l), totalStars)) {
    return false;
  }
  if (l === 1) {
    return true;
  }
  return cleared[l - 2] === true || zoneOf(l).levels[0] === l;
}

/** The lowest level that has not been cleared yet — the one the PLAY tile offers. */
export function nextPlayableLevel(totalStars: number, cleared: boolean[]): number {
  for (let l = 1; l <= TOTAL_LEVELS; l += 1) {
    if (!cleared[l - 1] && levelUnlocked(l, totalStars, cleared)) {
      return l;
    }
  }
  for (let l = TOTAL_LEVELS; l >= 1; l -= 1) {
    if (levelUnlocked(l, totalStars, cleared)) {
      return l;
    }
  }
  return 1;
}

// ------ rng ------
export function makeSeed(levelIndex: number, attempt: number): number {
  return ((levelIndex * 7919) ^ (attempt * 104729)) >>> 0;
}

export type Rng = {
  next(): number;
  int(maxExclusive: number): number;
  pick<T>(items: readonly T[]): T;
  chance(p: number): boolean;
};

/** mulberry32 — small, fast, fully deterministic. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  const next = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (maxExclusive: number) =>
      maxExclusive <= 0 ? 0 : Math.floor(next() * maxExclusive) % maxExclusive,
    pick: <T,>(items: readonly T[]) => items[Math.floor(next() * items.length) % items.length],
    chance: (p: number) => next() < p,
  };
}

// ------ scoring ------
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

// ------ signalEngine ------
export const PLAIN_KINDS: readonly CallKind[] = ['go', 'slow', 'stop'];
export const ALL_KINDS: readonly CallKind[] = ['go', 'slow', 'stop', 'egg'];

export const CALL_LABEL: Record<CallKind, string> = {
  go: 'GO',
  slow: 'SLOW',
  stop: 'STOP',
  egg: 'EGG',
};

/** Guaranteed-playable sequences, one per zone. Used only if 20 generations all fail. */
export const FALLBACK_SEQUENCE: readonly (readonly CallKind[])[] = [
  ['go', 'slow', 'go', 'stop', 'slow', 'go', 'egg', 'stop', 'go', 'slow', 'stop', 'go'],
  ['slow', 'go', 'stop', 'go', 'egg', 'slow', 'go', 'stop', 'slow', 'go', 'stop', 'slow'],
  ['stop', 'go', 'slow', 'egg', 'go', 'stop', 'slow', 'go', 'stop', 'slow', 'egg', 'go'],
];

export type GeneratedRound = {
  seed: number;
  calls: SignalCall[];
  /** Lane indices where Rush Hour traffic forces a STOP hold. */
  rushLanes: number[];
  attempts: number;
  fallbackUsed: boolean;
};

/** Golden egg chance climbs with the Feather Multiplier: 6 % base to 14 % at x3. */
export function eggChanceFor(multiplier: number): number {
  const t = Math.max(0, Math.min(1, (multiplier - 1) / 2));
  return EGG_CHANCE_BASE + (EGG_CHANCE_MAX - EGG_CHANCE_BASE) * t;
}

export function validateSequence(calls: readonly SignalCall[], level: number): boolean {
  if (calls.length === 0) {
    return false;
  }
  let run = 1;
  let stops = 0;
  let eggs = 0;
  for (let i = 0; i < calls.length; i += 1) {
    const k = calls[i].kind;
    if (k === 'stop') {
      stops += 1;
    }
    if (k === 'egg' || calls[i].second === 'egg') {
      eggs += 1;
    }
    if (i > 0 && calls[i - 1].kind === k) {
      run += 1;
      if (run > MAX_SAME_IN_A_ROW) {
        return false;
      }
    } else {
      run = 1;
    }
  }
  if (stops / calls.length > MAX_STOP_SHARE) {
    return false;
  }
  if (levelConfig(level).eggsAllowed && eggs === 0) {
    return false;
  }
  return true;
}

export function validateRushLanes(rushLanes: readonly number[], lanes: number): boolean {
  const sorted = rushLanes.slice().sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i += 1) {
    if (sorted[i] < 1 || sorted[i] > lanes - 2) {
      return false;
    }
    if (i > 0 && sorted[i] - sorted[i - 1] < 2) {
      return false;
    }
  }
  return true;
}

function buildCalls_signalEngine(rng: Rng, level: number, count: number): SignalCall[] {
  const cfg = levelConfig(level);
  const out: SignalCall[] = [];
  let eggs = 0;

  for (let i = 0; i < count; i += 1) {
    let kind: CallKind = rng.pick(PLAIN_KINDS);
    // Golden egg: the seed places candidates, the live multiplier re-weights them at runtime.
    if (cfg.eggsAllowed && rng.chance(EGG_CHANCE_MAX)) {
      kind = 'egg';
    }
    // Keep the guard rail inside the generator: never more than two identical in a row.
    const pool = cfg.eggsAllowed ? ALL_KINDS : PLAIN_KINDS;
    let guard = 0;
    while (
      i >= MAX_SAME_IN_A_ROW &&
      out[i - 1].kind === kind &&
      out[i - 2].kind === kind &&
      guard < 8
    ) {
      kind = pool[(pool.indexOf(kind) + 1 + rng.int(pool.length - 1)) % pool.length];
      guard += 1;
    }
    if (kind === 'egg') {
      eggs += 1;
    }

    let second: CallKind | null = null;
    if (cfg.doubleChance > 0 && rng.chance(cfg.doubleChance)) {
      second = rng.pick(PLAIN_KINDS);
      if (second === kind) {
        second = PLAIN_KINDS[(PLAIN_KINDS.indexOf(second) + 1) % PLAIN_KINDS.length];
      }
    }
    out.push({ index: i, kind, second, rush: false });
  }

  // From level 2 a round always carries at least one egg chance.
  if (cfg.eggsAllowed && eggs === 0 && out.length > 2) {
    const slot = 1 + rng.int(out.length - 2);
    out[slot] = { index: slot, kind: 'egg', second: null, rush: false };
  }
  return out;
}

function buildRushLanes_signalEngine(rng: Rng, level: number): number[] {
  const cfg = levelConfig(level);
  const picked: number[] = [];
  const high = cfg.lanes - 2;
  for (let i = 0; i < cfg.rushCars; i += 1) {
    for (let tries = 0; tries < 12; tries += 1) {
      const lane = 1 + rng.int(Math.max(1, high));
      if (picked.every(p => Math.abs(p - lane) >= 2)) {
        picked.push(lane);
        break;
      }
    }
  }
  return picked.sort((a, b) => a - b);
}

/**
 * Builds one attempt of a level. Placement (call order, egg spots, double spots,
 * rush lanes) always comes from the seeded generator, never from a constant, so
 * two attempts at the same level look visibly different.
 */
export function generateRound(level: number, attempt: number): GeneratedRound {
  const cfg = levelConfig(level);
  const seed = makeSeed(cfg.level, attempt);
  const count = cfg.lanes * 4 + 8;

  for (let a = 1; a <= GEN_MAX_ATTEMPTS; a += 1) {
    const rng = mulberry32((seed + a * 2654435761) >>> 0);
    const calls = buildCalls_signalEngine(rng, cfg.level, count);
    const rushLanes = buildRushLanes_signalEngine(rng, cfg.level);
    if (validateSequence(calls, cfg.level) && validateRushLanes(rushLanes, cfg.lanes)) {
      return { seed, calls, rushLanes, attempts: a, fallbackUsed: false };
    }
  }

  const pool = FALLBACK_SEQUENCE[cfg.zone.id] || FALLBACK_SEQUENCE[0];
  const calls: SignalCall[] = [];
  for (let i = 0; i < count; i += 1) {
    calls.push({ index: i, kind: pool[i % pool.length], second: null, rush: false });
  }
  return { seed, calls, rushLanes: [], attempts: GEN_MAX_ATTEMPTS, fallbackUsed: true };
}

/** The pad the player must hit right now for the given call and stage. */
export function expectedPad(call: SignalCall, stage: number): CallKind {
  if (call.rush) {
    return 'stop';
  }
  if (stage === 1 && call.second) {
    return call.second;
  }
  return call.kind;
}

/**
 * Resolves one pad press. `stage` is 0 for the first pad of a call and 1 for the
 * second pad of a double-signal. A wrong order on a double is ONE mistake, not two.
 */
export function resolveAnswer(
  call: SignalCall,
  pad: CallKind,
  stage: number,
  combo: number,
): AnswerResult {
  const miss: AnswerResult = {
    correct: false,
    partial: false,
    points: 0,
    comboDelta: 0,
    advance: false,
    egg: false,
  };
  if (pad !== expectedPad(call, stage)) {
    return miss;
  }
  if (call.rush) {
    // Rush Hour: hold position and let the car pass. Rewarded, but no lane is crossed.
    return {
      correct: true,
      partial: false,
      points: scoreFor('rush', combo),
      comboDelta: 1,
      advance: false,
      egg: false,
    };
  }
  if (call.second && stage === 0) {
    return { correct: true, partial: true, points: 0, comboDelta: 0, advance: false, egg: false };
  }
  if (call.second) {
    return {
      correct: true,
      partial: false,
      points: scoreFor('double', combo),
      comboDelta: 2,
      advance: true,
      egg: false,
    };
  }
  if (call.kind === 'egg') {
    return {
      correct: true,
      partial: false,
      points: scoreFor('egg', combo),
      comboDelta: 1,
      advance: true,
      egg: true,
    };
  }
  return {
    correct: true,
    partial: false,
    points: scoreFor('correct', combo),
    comboDelta: 1,
    advance: true,
    egg: false,
  };
}

/**
 * Picks the call that is actually issued for the current lane: a Rush Hour lane
 * overrides the generated call with a forced STOP, and the live multiplier can
 * upgrade a plain call into a golden egg call.
 */
export function callForStep(
  round: GeneratedRound,
  step: number,
  lane: number,
  combo: number,
  level: number,
  usedRushLanes: readonly number[],
  roll: number,
): SignalCall {
  const base = round.calls[step % round.calls.length];
  if (round.rushLanes.indexOf(lane) >= 0 && usedRushLanes.indexOf(lane) < 0) {
    return { index: step, kind: 'stop', second: null, rush: true };
  }
  const cfg = levelConfig(level);
  if (cfg.eggsAllowed && base.kind !== 'egg' && !base.second && roll < eggChanceFor(multiplierFor(combo))) {
    return { index: step, kind: 'egg', second: null, rush: false };
  }
  if (!cfg.eggsAllowed && base.kind === 'egg') {
    return { index: step, kind: 'go', second: null, rush: false };
  }
  return { index: step, kind: base.kind, second: base.second, rush: false };
}

/** Pad Side mirrors the 2x2 grid so GO and STOP sit under the dominant thumb. */
export function padOrder(side: 'LEFT' | 'RIGHT'): CallKind[] {
  return side === 'RIGHT'
    ? ['slow', 'go', 'egg', 'stop']
    : ['go', 'slow', 'stop', 'egg'];
}

// ------ storage ------
export type StorageAdapter = {
  read(): string | null;
  write(raw: string): void;
  clear(): void;
};

let snapshot_storage: string | null = null;

const memoryAdapter_storage: StorageAdapter = {
  read: () => snapshot_storage,
  write: raw => {
    snapshot_storage = raw;
  },
  clear: () => {
    snapshot_storage = null;
  },
};

let adapter_storage: StorageAdapter = memoryAdapter_storage;

export function setStorageAdapter(next: StorageAdapter): void {
  adapter_storage = next;
}

export const DEFAULT_SETTINGS: GameSettings = {
  signalShapes: true,
  padSide: 'RIGHT',
  reactionAssist: false,
  hazardFlash: true,
};

export function emptyProfile(): Profile {
  const levels = [];
  for (let i = 0; i < TOTAL_LEVELS; i += 1) {
    levels.push({ stars: 0, bestScore: 0, cleared: false });
  }
  return {
    levels,
    charms: [],
    eggs: 0,
    records: [],
    stats: { crossings: 0, correct: 0, answers: 0, bestScore: 0, bestCombo: 0 },
    settings: { ...DEFAULT_SETTINGS },
  };
}

function sanitize_storage(raw: unknown): Profile {
  const base = emptyProfile();
  if (!raw || typeof raw !== 'object') {
    return base;
  }
  const p = raw as Partial<Profile>;
  if (Array.isArray(p.levels)) {
    for (let i = 0; i < base.levels.length; i += 1) {
      const lv = p.levels[i];
      if (lv && typeof lv === 'object') {
        base.levels[i] = {
          stars: Math.max(0, Math.min(3, Number(lv.stars) || 0)),
          bestScore: Math.max(0, Number(lv.bestScore) || 0),
          cleared: lv.cleared === true,
        };
      }
    }
  }
  if (Array.isArray(p.charms)) {
    base.charms = p.charms.filter(c => typeof c === 'string');
  }
  base.eggs = Math.max(0, Number(p.eggs) || 0);
  if (Array.isArray(p.records)) {
    base.records = p.records.slice(0, RECORD_HISTORY) as RunRecord[];
  }
  if (p.stats && typeof p.stats === 'object') {
    base.stats = {
      crossings: Math.max(0, Number(p.stats.crossings) || 0),
      correct: Math.max(0, Number(p.stats.correct) || 0),
      answers: Math.max(0, Number(p.stats.answers) || 0),
      bestScore: Math.max(0, Number(p.stats.bestScore) || 0),
      bestCombo: Math.max(0, Number(p.stats.bestCombo) || 0),
    };
  }
  if (p.settings && typeof p.settings === 'object') {
    base.settings = {
      signalShapes: p.settings.signalShapes !== false,
      padSide: p.settings.padSide === 'LEFT' ? 'LEFT' : 'RIGHT',
      reactionAssist: p.settings.reactionAssist === true,
      hazardFlash: p.settings.hazardFlash !== false,
    };
  }
  return base;
}

export function loadProfile(): Profile {
  try {
    const raw = adapter_storage.read();
    if (!raw) {
      return emptyProfile();
    }
    return sanitize_storage(JSON.parse(raw));
  } catch (e) {
    return emptyProfile();
  }
}

export function saveProfile(profile: Profile): void {
  try {
    adapter_storage.write(JSON.stringify(profile));
  } catch (e) {
    // Persistence is best-effort; a write failure must never break a round.
  }
}

export function resetProfile(): Profile {
  try {
    adapter_storage.clear();
  } catch (e) {
    // ignore
  }
  return emptyProfile();
}

export function totalStars(profile: Profile): number {
  return profile.levels.reduce((sum, lv) => sum + lv.stars, 0);
}

export function clearedFlags(profile: Profile): boolean[] {
  return profile.levels.map(lv => lv.cleared);
}

export function clearedLevelNumbers(profile: Profile): number[] {
  const out: number[] = [];
  profile.levels.forEach((lv, i) => {
    if (lv.cleared) {
      out.push(i + 1);
    }
  });
  return out;
}

export function bestStars(profile: Profile): number {
  return profile.levels.reduce((best, lv) => Math.max(best, lv.stars), 0);
}

// ------ types ------
export type CallKind = 'go' | 'slow' | 'stop' | 'egg';

export type RoundOutcome = 'win' | 'lose';

/** One beacon call. `second` makes it a double-signal, `rush` makes it a forced STOP hold. */
export type SignalCall = {
  index: number;
  kind: CallKind;
  second: CallKind | null;
  rush: boolean;
};

export type GameSettings = {
  signalShapes: boolean;
  padSide: 'LEFT' | 'RIGHT';
  reactionAssist: boolean;
  hazardFlash: boolean;
};

export type LevelProgress = {
  stars: number;
  bestScore: number;
  cleared: boolean;
};

export type RunRecord = {
  level: number;
  stars: number;
  score: number;
  bestCombo: number;
  outcome: RoundOutcome;
};

export type ProfileStats = {
  crossings: number;
  correct: number;
  answers: number;
  bestScore: number;
  bestCombo: number;
};

export type Profile = {
  levels: LevelProgress[];
  charms: string[];
  eggs: number;
  records: RunRecord[];
  stats: ProfileStats;
  settings: GameSettings;
};

export type RoundSummary = {
  level: number;
  outcome: RoundOutcome;
  score: number;
  stars: number;
  bestCombo: number;
  eggs: number;
  mistakes: number;
  lane: number;
  lanes: number;
  correct: number;
  answers: number;
  assist: boolean;
  seed: number;
  newCharms: string[];
};

export type AnswerResult = {
  correct: boolean;
  /** true while a double-signal still waits for its second pad. */
  partial: boolean;
  points: number;
  comboDelta: number;
  advance: boolean;
  egg: boolean;
};

/* autopad-begin */
function difayovaxu(_awujaxuz: string, _mobuguf: number): void {
  const revajogew: number = 109;
}
function vokape(): number {
  return 7;
}
function axesowacoye(_zoyizocucomu: number, _oyudaqa: string): string {
  const atavogucanov = 2;
  const odizivim: string = "efu";
  return odizivim;
}
function ezerotu(_kimotufu: string): number {
  return 118;
}
function nagoso(): number {
  const jujase = 97;
  return jujase > 94 ? 153 : 169;
}
function kifala(_bupimimuxe: number, _osenucuzefim: number, _uriciziyeros: string): number { return 72; }
function orerafejed(_oxiladunawo: number, _boqumuqarim: number, _kedamupecot: boolean): string {
  const dotazin: string = "resamob";
  return dotazin;
}
function tivobibebe(_retusab: number): boolean {
  let golowoku: boolean = true;
  golowoku = false;
  return golowoku;
}
function tewodokuman(_zininura: number, _aqequdixotot: string): string {
  const exipucuri: string = "ofiju";
  return exipucuri;
}
/* autopad-end */
