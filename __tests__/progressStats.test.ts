import { accuracyOf } from '../src/game/scoring';
import {
  bestStars,
  clearedLevelNumbers,
  emptyProfile,
  totalStars,
} from '../src/game/storage';
import { formatPercent, groupNumber } from '../src/utils/format';

describe('progress statistics', () => {
  it('starts an empty profile with twelve zeroed levels', () => {
    const p = emptyProfile();
    expect(p.levels.length).toBe(12);
    expect(totalStars(p)).toBe(0);
    expect(bestStars(p)).toBe(0);
    expect(clearedLevelNumbers(p)).toEqual([]);
  });

  it('sums stars across levels and lists cleared ones', () => {
    const p = emptyProfile();
    p.levels[0] = { stars: 3, bestScore: 900, cleared: true };
    p.levels[4] = { stars: 2, bestScore: 2400, cleared: true };
    expect(totalStars(p)).toBe(5);
    expect(bestStars(p)).toBe(3);
    expect(clearedLevelNumbers(p)).toEqual([1, 5]);
  });

  it('formats the display values the screens use', () => {
    expect(groupNumber(12480)).toBe('12,480');
    expect(groupNumber(0)).toBe('0');
    expect(formatPercent(accuracyOf(84, 100))).toBe('84 %');
  });
});
