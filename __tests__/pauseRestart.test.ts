import { PANIC_WINDOW_MS } from '../src/constants/config';
import { makeSeed } from '../src/game/rng';
import { windowMsFor } from '../src/game/scoring';
import { generateRound } from '../src/game/signalEngine';

describe('pause and restart', () => {
  it('rebuilds the round with a different seed on the next attempt', () => {
    const first = generateRound(5, 1);
    const second = generateRound(5, 2);
    expect(first.seed).not.toBe(second.seed);
    expect(first.seed).toBe(makeSeed(5, 1));

    const a = first.calls.map(c => c.kind).join('');
    const b = second.calls.map(c => c.kind).join('');
    expect(a).not.toBe(b);
  });

  it('is deterministic: the same attempt always rebuilds the same round', () => {
    const a = generateRound(7, 3);
    const b = generateRound(7, 3);
    expect(a.calls.map(c => c.kind)).toEqual(b.calls.map(c => c.kind));
    expect(a.rushLanes).toEqual(b.rushLanes);
  });

  it('resumes with a window that is never zero', () => {
    const remaining = windowMsFor({
      level: 4,
      combo: 0,
      assist: false,
      panic: true,
      panicMs: PANIC_WINDOW_MS,
    });
    expect(remaining).toBeGreaterThan(0);
  });
});
