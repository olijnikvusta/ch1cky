import {
  ASSIST_BONUS_MS,
  PANIC_WINDOW_MS,
  WINDOW_COMBO_FLOOR_MS,
} from '../src/constants/config';
import { windowFor } from '../src/game/levels';
import { windowMsFor } from '../src/game/scoring';

describe('fast-changing sequence (window shrink)', () => {
  it('follows max(700, 1600 - 90 * (level - 1))', () => {
    expect(windowFor(1)).toBe(1600);
    expect(windowFor(5)).toBe(1240);
    expect(windowFor(12)).toBe(700);
  });

  it('squeezes the window by 8 % for every 5 points of combo', () => {
    const base = windowMsFor({ level: 1, combo: 0, assist: false });
    const squeezed = windowMsFor({ level: 1, combo: 5, assist: false });
    expect(squeezed).toBeLessThan(base);
    expect(squeezed).toBe(Math.round(1600 * 0.92));
  });

  it('never drops below the combo floor', () => {
    expect(windowMsFor({ level: 12, combo: 60, assist: false })).toBe(WINDOW_COMBO_FLOOR_MS);
  });

  it('adds the assist bonus to every window', () => {
    const plain = windowMsFor({ level: 3, combo: 0, assist: false });
    const assisted = windowMsFor({ level: 3, combo: 0, assist: true });
    expect(assisted - plain).toBe(ASSIST_BONUS_MS);
  });

  it('tightens a golden egg window and widens a panic window', () => {
    const plain = windowMsFor({ level: 3, combo: 0, assist: false });
    expect(windowMsFor({ level: 3, combo: 0, assist: false, egg: true })).toBeLessThan(plain);
    expect(
      windowMsFor({ level: 3, combo: 0, assist: false, panic: true, panicMs: PANIC_WINDOW_MS }),
    ).toBe(PANIC_WINDOW_MS);
  });
});
