import { TOTAL_CHARMS } from '../src/constants/config';
import { CHARMS, charmById, evaluateCharms, UnlockContext } from '../src/game/collection';

const base: UnlockContext = {
  eggs: 0,
  totalStars: 0,
  clearedLevels: [],
  bestCombo: 0,
  bestScore: 0,
  bestStars: 0,
};

describe('collection unlocking', () => {
  it('ships twelve charms with unique ids and unique glyph shapes', () => {
    expect(CHARMS.length).toBe(TOTAL_CHARMS);
    expect(new Set(CHARMS.map(c => c.id)).size).toBe(TOTAL_CHARMS);
    expect(new Set(CHARMS.map(c => c.shape)).size).toBe(TOTAL_CHARMS);
  });

  it('unlocks nothing on a fresh profile', () => {
    expect(evaluateCharms(base, [])).toEqual([]);
  });

  it('unlocks egg charms at 3, 6 and 10 eggs', () => {
    expect(evaluateCharms({ ...base, eggs: 3 }, [])).toContain('crossing-badge');
    expect(evaluateCharms({ ...base, eggs: 6 }, [])).toContain('golden-yolk');
    expect(evaluateCharms({ ...base, eggs: 10 }, [])).toContain('night-lamp');
  });

  it('unlocks milestone charms for cleared levels and a x3 combo', () => {
    expect(evaluateCharms({ ...base, clearedLevels: [1, 6] }, [])).toContain('hazard-tape');
    expect(evaluateCharms({ ...base, bestCombo: 15 }, [])).toContain('lucky-pebble');
    expect(evaluateCharms({ ...base, bestStars: 3 }, [])).toContain('road-star');
  });

  it('never hands out a charm the player already owns', () => {
    const owned = ['crossing-badge'];
    expect(evaluateCharms({ ...base, eggs: 3 }, owned)).not.toContain('crossing-badge');
  });

  it('resolves a charm by id', () => {
    expect(charmById('dawn-crest')?.name).toBe('DAWN CREST');
    expect(charmById('nope')).toBeUndefined();
  });
});
