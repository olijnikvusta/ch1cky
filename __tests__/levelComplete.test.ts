import { lanesFor } from '../src/game/levels';
import { generateRound, resolveAnswer, expectedPad } from '../src/game/signalEngine';

describe('chicken crosses the road (level clear)', () => {
  it('reaches the far kerb after exactly LANES correct answers', () => {
    const level = 1;
    const lanes = lanesFor(level);
    const round = generateRound(level, 1);

    let lane = 0;
    let step = 0;
    while (lane < lanes && step < round.calls.length) {
      const call = round.calls[step];
      let r = resolveAnswer(call, expectedPad(call, 0), 0, 0);
      if (r.partial) {
        r = resolveAnswer(call, expectedPad(call, 1), 1, 0);
      }
      expect(r.correct).toBe(true);
      if (r.advance) {
        lane += 1;
      }
      step += 1;
    }

    expect(lane).toBe(lanes);
  });

  it('level 1 is always passable with the generated sequence', () => {
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const round = generateRound(1, attempt);
      expect(round.calls.length).toBeGreaterThanOrEqual(lanesFor(1));
    }
  });
});
