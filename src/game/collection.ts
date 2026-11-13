import { C } from '../constants/theme';

/** Twelve distinct vector shapes — no emoji, no repeated icon in the set. */
export type GlyphShape =
  | 'circle'
  | 'square'
  | 'hexagon'
  | 'diamond'
  | 'triangle'
  | 'cross'
  | 'ring'
  | 'bar'
  | 'pentagon'
  | 'star'
  | 'arch'
  | 'grid';

export type Charm = {
  id: string;
  name: string;
  accent: string;
  shape: GlyphShape;
  /** Shown on the locked card instead of the name. */
  condition: string;
};

export type UnlockContext = {
  eggs: number;
  totalStars: number;
  clearedLevels: number[];
  bestCombo: number;
  bestScore: number;
  bestStars: number;
};

type Rule = (ctx: UnlockContext) => boolean;

const cleared = (level: number): Rule => ctx => ctx.clearedLevels.indexOf(level) >= 0;

export const CHARMS: readonly Charm[] = [
  { id: 'morning-feather', name: 'MORNING FEATHER', accent: C.signalGo, shape: 'circle', condition: 'CLEAR LEVEL 1' },
  { id: 'crossing-badge', name: 'CROSSING BADGE', accent: C.gold, shape: 'hexagon', condition: '3 EGGS' },
  { id: 'golden-yolk', name: 'GOLDEN YOLK', accent: C.gold, shape: 'diamond', condition: '6 EGGS' },
  { id: 'night-lamp', name: 'NIGHT LAMP', accent: C.secondary, shape: 'ring', condition: '10 EGGS' },
  { id: 'hazard-tape', name: 'HAZARD TAPE', accent: C.signalSlow, shape: 'bar', condition: 'CLEAR LEVEL 6' },
  { id: 'lucky-pebble', name: 'LUCKY PEBBLE', accent: C.signalGo, shape: 'pentagon', condition: 'x3 COMBO' },
  { id: 'tin-whistle', name: 'TIN WHISTLE', accent: C.textDim, shape: 'triangle', condition: 'SCORE 5,000' },
  { id: 'red-ribbon', name: 'RED RIBBON', accent: C.signalStop, shape: 'cross', condition: 'EARN 6 STARS' },
  { id: 'copper-bell', name: 'COPPER BELL', accent: C.signalSlow, shape: 'arch', condition: 'EARN 14 STARS' },
  { id: 'blue-shell', name: 'BLUE SHELL', accent: C.secondary, shape: 'square', condition: 'CLEAR LEVEL 9' },
  { id: 'road-star', name: 'ROAD STAR', accent: C.gold, shape: 'star', condition: 'A 3-STAR LEVEL' },
  { id: 'dawn-crest', name: 'DAWN CREST', accent: C.primary, shape: 'grid', condition: 'CLEAR LEVEL 12' },
];

const RULES: Record<string, Rule> = {
  'morning-feather': cleared(1),
  'crossing-badge': ctx => ctx.eggs >= 3,
  'golden-yolk': ctx => ctx.eggs >= 6,
  'night-lamp': ctx => ctx.eggs >= 10,
  'hazard-tape': cleared(6),
  'lucky-pebble': ctx => ctx.bestCombo >= 15,
  'tin-whistle': ctx => ctx.bestScore >= 5000,
  'red-ribbon': ctx => ctx.totalStars >= 6,
  'copper-bell': ctx => ctx.totalStars >= 14,
  'blue-shell': cleared(9),
  'road-star': ctx => ctx.bestStars >= 3,
  'dawn-crest': cleared(12),
};

export function charmById(id: string): Charm | undefined {
  return CHARMS.find(c => c.id === id);
}

/** Returns the charm ids unlocked by this context that the player does not own yet. */
export function evaluateCharms(ctx: UnlockContext, owned: readonly string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < CHARMS.length; i += 1) {
    const charm = CHARMS[i];
    if (owned.indexOf(charm.id) >= 0) {
      continue;
    }
    const rule = RULES[charm.id];
    if (rule && rule(ctx)) {
      out.push(charm.id);
    }
  }
  return out;
}
