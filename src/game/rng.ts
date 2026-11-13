/**
 * One seed per attempt, deterministic and logged in the round summary, so any
 * generated round can be reproduced from its seed. Never Math.random() in a round.
 */

/** seed = levelIndex * 7919 ^ attempt * 104729 */
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
