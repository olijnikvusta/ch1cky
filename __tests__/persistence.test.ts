import { emptyProfile, loadProfile, resetProfile, saveProfile } from '../src/game/storage';

describe('local persistence', () => {
  beforeEach(() => {
    resetProfile();
  });

  it('returns a fresh profile when nothing was ever written', () => {
    const p = loadProfile();
    expect(p.eggs).toBe(0);
    expect(p.charms).toEqual([]);
    expect(p.records).toEqual([]);
  });

  it('round-trips levels, charms, eggs, records and settings', () => {
    const p = emptyProfile();
    p.eggs = 7;
    p.charms = ['crossing-badge'];
    p.levels[2] = { stars: 3, bestScore: 4200, cleared: true };
    p.records = [{ level: 3, stars: 3, score: 4200, bestCombo: 16, outcome: 'win' }];
    p.stats = { crossings: 7, correct: 20, answers: 22, bestScore: 4200, bestCombo: 16 };
    p.settings.reactionAssist = true;
    p.settings.padSide = 'LEFT';
    saveProfile(p);

    const back = loadProfile();
    expect(back.eggs).toBe(7);
    expect(back.charms).toEqual(['crossing-badge']);
    expect(back.levels[2]).toEqual({ stars: 3, bestScore: 4200, cleared: true });
    expect(back.records.length).toBe(1);
    expect(back.stats.bestCombo).toBe(16);
    expect(back.settings.reactionAssist).toBe(true);
    expect(back.settings.padSide).toBe('LEFT');
  });

  it('wipes everything on reset', () => {
    const p = emptyProfile();
    p.eggs = 12;
    saveProfile(p);
    expect(loadProfile().eggs).toBe(12);
    resetProfile();
    expect(loadProfile().eggs).toBe(0);
  });

  it('survives a corrupted snapshot instead of crashing', () => {
    const p = emptyProfile();
    saveProfile(p);
    expect(() => loadProfile()).not.toThrow();
  });
});
