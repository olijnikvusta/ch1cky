import { LOADER_DURATION_MS, SCREEN_FADE_MS, TOTAL_LEVELS } from '../src/constants/config';
import { nextPlayableLevel } from '../src/game/levels';
import { clearedFlags, emptyProfile, totalStars } from '../src/game/storage';

describe('menu hub and splash routing', () => {
  it('holds the loader for exactly 8000 ms', () => {
    expect(LOADER_DURATION_MS).toBe(8000);
  });

  it('cross-fades between screens rather than swapping instantly', () => {
    expect(SCREEN_FADE_MS).toBeGreaterThan(0);
  });

  it('points the PLAY tile at level 1 on a fresh profile', () => {
    const p = emptyProfile();
    expect(nextPlayableLevel(totalStars(p), clearedFlags(p))).toBe(1);
  });

  it('moves the PLAY tile forward as levels are cleared', () => {
    const p = emptyProfile();
    p.levels[0] = { stars: 3, bestScore: 1200, cleared: true };
    p.levels[1] = { stars: 3, bestScore: 1500, cleared: true };
    expect(nextPlayableLevel(totalStars(p), clearedFlags(p))).toBe(3);
  });

  it('never routes past the last level', () => {
    const p = emptyProfile();
    for (let i = 0; i < TOTAL_LEVELS; i += 1) {
      p.levels[i] = { stars: 3, bestScore: 1000, cleared: true };
    }
    const next = nextPlayableLevel(totalStars(p), clearedFlags(p));
    expect(next).toBeLessThanOrEqual(TOTAL_LEVELS);
    expect(next).toBeGreaterThanOrEqual(1);
  });
});
