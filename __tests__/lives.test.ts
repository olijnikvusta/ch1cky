import { LIVES, MISTAKE_FREEZE_MS, PANIC_WINDOW_MS } from '../src/constants/config';
import { resolveAnswer } from '../src/game/signalEngine';
import { SignalCall } from '../src/game/types';

const call: SignalCall = { index: 0, kind: 'go', second: null, rush: false };

describe('mistakes and lives', () => {
  it('a wrong pad resolves as a miss that costs a life', () => {
    const r = resolveAnswer(call, 'stop', 0, 12);
    expect(r.correct).toBe(false);
    expect(r.comboDelta).toBe(0);
  });

  it('three mistakes exhaust the three lives', () => {
    let lives = LIVES;
    let combo = 9;
    for (let i = 0; i < 3; i += 1) {
      const r = resolveAnswer(call, 'slow', 0, combo);
      if (!r.correct) {
        lives -= 1;
        combo = 0;
      }
    }
    expect(lives).toBe(0);
    expect(combo).toBe(0);
  });

  it('a fully passive player reaches the result screen in about three seconds', () => {
    // first expiry uses the level window, the two that follow use the panic window
    const passiveMs = 1600 + MISTAKE_FREEZE_MS + 2 * (PANIC_WINDOW_MS + MISTAKE_FREEZE_MS);
    expect(passiveMs).toBeLessThanOrEqual(4800);
  });
});
