import {
  EGG_CHANCE_BASE,
  EGG_CHANCE_MAX,
  GEN_MAX_ATTEMPTS,
  MAX_SAME_IN_A_ROW,
  MAX_STOP_SHARE,
} from '../constants/config';
import { levelConfig } from './levels';
import { makeSeed, mulberry32, Rng } from './rng';
import { multiplierFor, scoreFor } from './scoring';
import { AnswerResult, CallKind, SignalCall } from './types';

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

function buildCalls(rng: Rng, level: number, count: number): SignalCall[] {
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

function buildRushLanes(rng: Rng, level: number): number[] {
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
    const calls = buildCalls(rng, cfg.level, count);
    const rushLanes = buildRushLanes(rng, cfg.level);
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
