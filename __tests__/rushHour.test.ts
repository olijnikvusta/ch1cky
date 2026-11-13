import { RUSH_FROM_LEVEL } from '../src/constants/config';
import { lanesFor, rushCarsFor } from '../src/game/levels';
import {
  callForStep,
  generateRound,
  resolveAnswer,
  validateRushLanes,
} from '../src/game/signalEngine';
import { SignalCall } from '../src/game/types';

const rush: SignalCall = { index: 0, kind: 'stop', second: null, rush: true };

describe('rush hour traffic', () => {
  it('rewards a STOP hold without crossing a lane', () => {
    const r = resolveAnswer(rush, 'stop', 0, 0);
    expect(r.correct).toBe(true);
    expect(r.advance).toBe(false);
    expect(r.comboDelta).toBe(1);
    expect(r.points).toBe(60);
  });

  it('treats any other pad as being hit by the car', () => {
    expect(resolveAnswer(rush, 'go', 0, 0).correct).toBe(false);
    expect(resolveAnswer(rush, 'egg', 0, 0).correct).toBe(false);
  });

  it('appears only from level 7', () => {
    expect(rushCarsFor(RUSH_FROM_LEVEL - 1)).toBe(0);
    expect(generateRound(RUSH_FROM_LEVEL - 1, 1).rushLanes).toEqual([]);
    expect(generateRound(RUSH_FROM_LEVEL, 1).rushLanes.length).toBeGreaterThan(0);
  });

  it('never places a car on adjacent lanes or on the last lane', () => {
    for (let level = RUSH_FROM_LEVEL; level <= 12; level += 1) {
      for (let attempt = 1; attempt <= 4; attempt += 1) {
        const round = generateRound(level, attempt);
        expect(validateRushLanes(round.rushLanes, lanesFor(level))).toBe(true);
        round.rushLanes.forEach(lane => {
          expect(lane).toBeLessThanOrEqual(lanesFor(level) - 2);
        });
      }
    }
  });

  it('forces a STOP call on a rush lane and only once per lane', () => {
    const round = generateRound(RUSH_FROM_LEVEL, 1);
    const lane = round.rushLanes[0];
    const forced = callForStep(round, 0, lane, 0, RUSH_FROM_LEVEL, [], 0.99);
    expect(forced.rush).toBe(true);
    expect(forced.kind).toBe('stop');

    const after = callForStep(round, 1, lane, 0, RUSH_FROM_LEVEL, [lane], 0.99);
    expect(after.rush).toBe(false);
  });
});
