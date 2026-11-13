import { EGG_CHANCE_BASE, EGG_CHANCE_MAX } from '../src/constants/config';
import { multiplierFor } from '../src/game/scoring';
import { callForStep, eggChanceFor, generateRound, resolveAnswer } from '../src/game/signalEngine';
import { SignalCall } from '../src/game/types';

const eggCall: SignalCall = { index: 0, kind: 'egg', second: null, rush: false };

describe('golden egg signal', () => {
  it('pays 500 x multiplier and banks one egg', () => {
    const r = resolveAnswer(eggCall, 'egg', 0, 0);
    expect(r.correct).toBe(true);
    expect(r.egg).toBe(true);
    expect(r.points).toBe(500);
    expect(r.advance).toBe(true);
    expect(resolveAnswer(eggCall, 'egg', 0, 15).points).toBe(1500);
  });

  it('is missed by any other pad', () => {
    expect(resolveAnswer(eggCall, 'go', 0, 0).correct).toBe(false);
    expect(resolveAnswer(eggCall, 'go', 0, 0).egg).toBe(false);
  });

  it('grows the egg chance from 6 % at x1 to 14 % at x3', () => {
    expect(eggChanceFor(multiplierFor(0))).toBeCloseTo(EGG_CHANCE_BASE, 5);
    expect(eggChanceFor(multiplierFor(15))).toBeCloseTo(EGG_CHANCE_MAX, 5);
    expect(eggChanceFor(multiplierFor(10))).toBeGreaterThan(EGG_CHANCE_BASE);
  });

  it('never issues an egg call before level 2', () => {
    const round = generateRound(1, 1);
    for (let step = 0; step < 20; step += 1) {
      const call = callForStep(round, step, 0, 20, 1, [], 0);
      expect(call.kind).not.toBe('egg');
    }
  });

  it('issues an egg call from level 2 when the roll lands inside the chance', () => {
    const round = generateRound(3, 1);
    const call = callForStep(round, 0, 0, 15, 3, [], 0);
    expect(call.kind).toBe('egg');
  });
});
