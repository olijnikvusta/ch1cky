import {
  DOUBLE_CHANCE_MAX,
  DOUBLE_CHANCE_MIN,
  DOUBLE_FROM_LEVEL,
  EGG_FROM_LEVEL,
  RUSH_FROM_LEVEL,
  TOTAL_LEVELS,
  WINDOW_BASE_MS,
  WINDOW_FLOOR_MS,
  WINDOW_STEP_MS,
  ZONE_STAR_GATES,
} from '../constants/config';
import { C } from '../constants/theme';

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
