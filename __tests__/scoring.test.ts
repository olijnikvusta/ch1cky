import { accuracyOf, scoreFor, starsFor } from '../src/game/scoring';

describe('score and stars', () => {
  it('pays each gain kind its base value at x1', () => {
    expect(scoreFor('correct', 0)).toBe(100);
    expect(scoreFor('double', 0)).toBe(250);
    expect(scoreFor('rush', 0)).toBe(60);
    expect(scoreFor('egg', 0)).toBe(500);
  });

  it('scales every gain by the live multiplier', () => {
    expect(scoreFor('correct', 10)).toBe(200);
    expect(scoreFor('egg', 15)).toBe(1500);
  });

  it('awards 3 / 2 / 1 stars by mistake count', () => {
    expect(starsFor(0, false)).toBe(3);
    expect(starsFor(1, false)).toBe(2);
    expect(starsFor(2, false)).toBe(1);
  });

  it('caps the award at 2 stars while Reaction Assist is on', () => {
    expect(starsFor(0, true)).toBe(2);
    expect(starsFor(2, true)).toBe(1);
  });

  it('reports accuracy safely with no answers', () => {
    expect(accuracyOf(0, 0)).toBe(0);
    expect(accuracyOf(8, 10)).toBeCloseTo(0.8, 5);
  });
});
