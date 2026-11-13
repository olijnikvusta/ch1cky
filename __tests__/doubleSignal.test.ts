import { doubleChanceFor } from '../src/game/levels';
import { expectedPad, resolveAnswer } from '../src/game/signalEngine';
import { SignalCall } from '../src/game/types';

const double: SignalCall = { index: 0, kind: 'go', second: 'stop', rush: false };

describe('double-signal call', () => {
  it('asks for the first lamp, then the second', () => {
    expect(expectedPad(double, 0)).toBe('go');
    expect(expectedPad(double, 1)).toBe('stop');
  });

  it('holds the round open after the first correct pad', () => {
    const first = resolveAnswer(double, 'go', 0, 0);
    expect(first.correct).toBe(true);
    expect(first.partial).toBe(true);
    expect(first.advance).toBe(false);
    expect(first.points).toBe(0);
  });

  it('pays 250 x multiplier and two combo for the completed pair', () => {
    const second = resolveAnswer(double, 'stop', 1, 0);
    expect(second.correct).toBe(true);
    expect(second.partial).toBe(false);
    expect(second.advance).toBe(true);
    expect(second.comboDelta).toBe(2);
    expect(second.points).toBe(250);
  });

  it('counts a wrong order as one miss, not two', () => {
    const wrongOrder = resolveAnswer(double, 'stop', 0, 0);
    expect(wrongOrder.correct).toBe(false);
    expect(wrongOrder.comboDelta).toBe(0);
  });

  it('appears from level 4 and grows to 30 % by level 12', () => {
    expect(doubleChanceFor(3)).toBe(0);
    expect(doubleChanceFor(4)).toBeCloseTo(0.18, 5);
    expect(doubleChanceFor(12)).toBeCloseTo(0.3, 5);
  });
});
