import { DOUBLE_FROM_LEVEL, EGG_FROM_LEVEL, RUSH_FROM_LEVEL } from '../src/constants/config';
import { doubleChanceFor, lanesFor, levelConfig, rushCarsFor, windowFor } from '../src/game/levels';

describe('difficulty progression', () => {
  it('grows the road from 6 lanes to 10', () => {
    expect(lanesFor(1)).toBe(6);
    expect(lanesFor(12)).toBe(10);
    for (let l = 2; l <= 12; l += 1) {
      expect(lanesFor(l)).toBeGreaterThanOrEqual(lanesFor(l - 1));
    }
  });

  it('shortens the window monotonically', () => {
    for (let l = 2; l <= 12; l += 1) {
      expect(windowFor(l)).toBeLessThanOrEqual(windowFor(l - 1));
    }
  });

  it('introduces eggs, double-signals and rush hour at their levels', () => {
    expect(levelConfig(EGG_FROM_LEVEL - 1).eggsAllowed).toBe(false);
    expect(levelConfig(EGG_FROM_LEVEL).eggsAllowed).toBe(true);
    expect(doubleChanceFor(DOUBLE_FROM_LEVEL - 1)).toBe(0);
    expect(doubleChanceFor(DOUBLE_FROM_LEVEL)).toBeCloseTo(0.18, 5);
    expect(doubleChanceFor(12)).toBeCloseTo(0.3, 5);
    expect(rushCarsFor(RUSH_FROM_LEVEL - 1)).toBe(0);
    expect(rushCarsFor(RUSH_FROM_LEVEL)).toBeGreaterThan(0);
  });

  it('clamps a level outside the 12-level range', () => {
    expect(levelConfig(0).level).toBe(1);
    expect(levelConfig(99).level).toBe(12);
  });
});
