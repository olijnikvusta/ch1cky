import { levelUnlocked, nextPlayableLevel, zoneOf, zoneUnlocked, ZONES } from '../src/game/levels';

const noneCleared = new Array(12).fill(false);

describe('level and zone unlocking', () => {
  it('opens zone 1 immediately and gates zones 2 and 3 on stars', () => {
    expect(zoneUnlocked(ZONES[0], 0)).toBe(true);
    expect(zoneUnlocked(ZONES[1], 5)).toBe(false);
    expect(zoneUnlocked(ZONES[1], 6)).toBe(true);
    expect(zoneUnlocked(ZONES[2], 13)).toBe(false);
    expect(zoneUnlocked(ZONES[2], 14)).toBe(true);
  });

  it('maps every level to exactly one zone', () => {
    for (let l = 1; l <= 12; l += 1) {
      const zone = zoneOf(l);
      expect(zone.levels.indexOf(l)).toBeGreaterThanOrEqual(0);
    }
  });

  it('refuses a locked zone even when the previous level was cleared', () => {
    const cleared = noneCleared.slice();
    cleared[3] = true; // level 4 cleared, but zone 2 still needs 6 stars
    expect(levelUnlocked(5, 0, cleared)).toBe(false);
    expect(levelUnlocked(5, 6, cleared)).toBe(true);
  });

  it('offers the first uncleared playable level', () => {
    expect(nextPlayableLevel(0, noneCleared)).toBe(1);
    const cleared = noneCleared.slice();
    cleared[0] = true;
    expect(nextPlayableLevel(3, cleared)).toBe(2);
  });
});
