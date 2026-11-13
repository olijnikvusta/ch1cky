import { RECORD_HISTORY, TOTAL_LEVELS } from '../constants/config';
import { GameSettings, Profile, RunRecord } from './types';

/**
 * Profile persistence behind a tiny adapter seam.
 *
 * Stated assumption: the dependency whitelist for this pipeline does not include a
 * native key-value module, and adding an autolinked native dependency is what broke
 * earlier builds. So the shipped adapter is a module-level JSON snapshot: progress
 * survives navigation, re-render and backgrounding inside the app session. Swapping
 * in a real key-value store is a one-file change here, with no call-site edits.
 */
export type StorageAdapter = {
  read(): string | null;
  write(raw: string): void;
  clear(): void;
};

let snapshot: string | null = null;

const memoryAdapter: StorageAdapter = {
  read: () => snapshot,
  write: raw => {
    snapshot = raw;
  },
  clear: () => {
    snapshot = null;
  },
};

let adapter: StorageAdapter = memoryAdapter;

export function setStorageAdapter(next: StorageAdapter): void {
  adapter = next;
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

function sanitize(raw: unknown): Profile {
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
    const raw = adapter.read();
    if (!raw) {
      return emptyProfile();
    }
    return sanitize(JSON.parse(raw));
  } catch (e) {
    return emptyProfile();
  }
}

export function saveProfile(profile: Profile): void {
  try {
    adapter.write(JSON.stringify(profile));
  } catch (e) {
    // Persistence is best-effort; a write failure must never break a round.
  }
}

export function resetProfile(): Profile {
  try {
    adapter.clear();
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
