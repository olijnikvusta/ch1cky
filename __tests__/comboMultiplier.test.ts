import { comboColor, multiplierFor, scoreFor } from '../src/game/scoring';
import { formatMultiplier } from '../src/utils/format';

describe('feather multiplier', () => {
  it('steps at 5, 10 and 15 and caps at x3', () => {
    expect(multiplierFor(0)).toBe(1);
    expect(multiplierFor(4)).toBe(1);
    expect(multiplierFor(5)).toBe(1.5);
    expect(multiplierFor(9)).toBe(1.5);
    expect(multiplierFor(10)).toBe(2);
    expect(multiplierFor(15)).toBe(3);
    expect(multiplierFor(99)).toBe(3);
  });

  it('scales every score gain', () => {
    expect(scoreFor('correct', 5)).toBe(150);
    expect(scoreFor('double', 10)).toBe(500);
    expect(scoreFor('rush', 15)).toBe(180);
  });

  it('resets to x1 after a mistake clears the combo', () => {
    const combo = 0; // a mistake sets combo back to zero
    expect(multiplierFor(combo)).toBe(1);
  });

  it('gives each tier its own chip colour and label', () => {
    const tiers = [1, 1.5, 2, 3];
    const colours = tiers.map(comboColor);
    expect(new Set(colours).size).toBe(tiers.length);
    expect(formatMultiplier(1.5)).toBe('x1.5');
    expect(formatMultiplier(3)).toBe('x3');
  });
});
