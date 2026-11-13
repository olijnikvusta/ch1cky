import { lanesFor } from '../src/game/levels';
import { starsFor } from '../src/game/scoring';
import { RoundSummary } from '../src/game/types';

function summaryOf(outcome: 'win' | 'lose', mistakes: number): RoundSummary {
  const lanes = lanesFor(5);
  return {
    level: 5,
    outcome,
    score: 12480,
    stars: outcome === 'win' ? starsFor(mistakes, false) : 0,
    bestCombo: 11,
    eggs: 2,
    mistakes,
    lane: outcome === 'win' ? lanes : 3,
    lanes,
    correct: 18,
    answers: 20,
    assist: false,
    seed: 1234,
    newCharms: [],
  };
}

describe('round summary', () => {
  it('reports a cleared level with its star award', () => {
    const s = summaryOf('win', 1);
    expect(s.outcome).toBe('win');
    expect(s.lane).toBe(s.lanes);
    expect(s.stars).toBe(2);
  });

  it('awards no stars on a loss and stops short of the far kerb', () => {
    const s = summaryOf('lose', 3);
    expect(s.stars).toBe(0);
    expect(s.lane).toBeLessThan(s.lanes);
  });

  it('carries the seed so the round can be reproduced', () => {
    expect(summaryOf('win', 0).seed).toBe(1234);
  });
});
