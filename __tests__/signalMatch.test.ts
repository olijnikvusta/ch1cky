import { resolveAnswer } from '../src/game/signalEngine';
import { SignalCall } from '../src/game/types';

const call = (kind: SignalCall['kind']): SignalCall => ({
  index: 0,
  kind,
  second: null,
  rush: false,
});

describe('signal matching (core)', () => {
  it('advances a lane and adds combo when the pad matches the lit lamp', () => {
    const r = resolveAnswer(call('go'), 'go', 0, 0);
    expect(r.correct).toBe(true);
    expect(r.advance).toBe(true);
    expect(r.comboDelta).toBe(1);
    expect(r.points).toBe(100);
  });

  it('scores every plain signal the same at x1', () => {
    expect(resolveAnswer(call('slow'), 'slow', 0, 0).points).toBe(100);
    expect(resolveAnswer(call('stop'), 'stop', 0, 0).points).toBe(100);
  });

  it('treats any other pad as a miss: no lane, no combo, no points', () => {
    const r = resolveAnswer(call('stop'), 'go', 0, 7);
    expect(r.correct).toBe(false);
    expect(r.advance).toBe(false);
    expect(r.comboDelta).toBe(0);
    expect(r.points).toBe(0);
  });
});
