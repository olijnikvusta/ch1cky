export type CallKind = 'go' | 'slow' | 'stop' | 'egg';

export type RoundOutcome = 'win' | 'lose';

/** One beacon call. `second` makes it a double-signal, `rush` makes it a forced STOP hold. */
export type SignalCall = {
  index: number;
  kind: CallKind;
  second: CallKind | null;
  rush: boolean;
};

export type GameSettings = {
  signalShapes: boolean;
  padSide: 'LEFT' | 'RIGHT';
  reactionAssist: boolean;
  hazardFlash: boolean;
};

export type LevelProgress = {
  stars: number;
  bestScore: number;
  cleared: boolean;
};

export type RunRecord = {
  level: number;
  stars: number;
  score: number;
  bestCombo: number;
  outcome: RoundOutcome;
};

export type ProfileStats = {
  crossings: number;
  correct: number;
  answers: number;
  bestScore: number;
  bestCombo: number;
};

export type Profile = {
  levels: LevelProgress[];
  charms: string[];
  eggs: number;
  records: RunRecord[];
  stats: ProfileStats;
  settings: GameSettings;
};

export type RoundSummary = {
  level: number;
  outcome: RoundOutcome;
  score: number;
  stars: number;
  bestCombo: number;
  eggs: number;
  mistakes: number;
  lane: number;
  lanes: number;
  correct: number;
  answers: number;
  assist: boolean;
  seed: number;
  newCharms: string[];
};

export type AnswerResult = {
  correct: boolean;
  /** true while a double-signal still waits for its second pad. */
  partial: boolean;
  points: number;
  comboDelta: number;
  advance: boolean;
  egg: boolean;
};
