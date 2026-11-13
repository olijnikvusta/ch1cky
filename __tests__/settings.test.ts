import { ASSIST_BONUS_MS } from '../src/constants/config';
import { starsFor, windowMsFor } from '../src/game/scoring';
import { padOrder } from '../src/game/signalEngine';
import { DEFAULT_SETTINGS } from '../src/game/storage';

describe('settings have real, visible effects', () => {
  it('ships the documented defaults and no audio option', () => {
    expect(DEFAULT_SETTINGS.signalShapes).toBe(true);
    expect(DEFAULT_SETTINGS.padSide).toBe('RIGHT');
    expect(DEFAULT_SETTINGS.reactionAssist).toBe(false);
    expect(DEFAULT_SETTINGS.hazardFlash).toBe(true);
    expect(Object.keys(DEFAULT_SETTINGS).sort()).toEqual([
      'hazardFlash',
      'padSide',
      'reactionAssist',
      'signalShapes',
    ]);
  });

  it('PAD SIDE mirrors the 2x2 grid and keeps all four pads', () => {
    const right = padOrder('RIGHT');
    const left = padOrder('LEFT');
    expect(right).not.toEqual(left);
    expect(right.slice().sort()).toEqual(left.slice().sort());
    expect(right.length).toBe(4);
    // GO and STOP sit in the right-hand column for a right-thumb player.
    expect(right[1]).toBe('go');
    expect(right[3]).toBe('stop');
  });

  it('REACTION ASSIST widens every window and caps the award', () => {
    const plain = windowMsFor({ level: 6, combo: 3, assist: false });
    const assisted = windowMsFor({ level: 6, combo: 3, assist: true });
    expect(assisted - plain).toBe(ASSIST_BONUS_MS);
    expect(starsFor(0, true)).toBe(2);
  });
});
