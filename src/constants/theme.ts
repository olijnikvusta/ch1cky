/**
 * Ch1cky theme — preset RETRO_NEON, style BRUTALISM.
 * Flat blocks, 3 px hard borders, hard offset shadows (shadowRadius 0), radius 0-4.
 */

export const THEME = {
  name: 'RETRO_NEON',

  colors: {
    bg: '#0A0A0F',
    bgDeep: '#05050A',
    bgAlt: '#12121F',
    surface: '#1A1A2E',
    surfaceAlt: '#16213E',

    primary: '#FF006E',
    primaryDeep: '#B8004F',
    secondary: '#00F5FF',

    signalGo: '#00FF88',
    signalSlow: '#FFB800',
    signalStop: '#FF1E56',
    gold: '#FFD54A',

    stroke: '#2A2A45',
    strokeDim: '#1F1F33',

    text: '#FFFFFF',
    textDim: '#B9B9D0',
    textMute: '#6E6E8A',
  },

  /** Brutalist hard offset shadow — never blurred, elevation 0 so Android keeps the edge. */
  hardShadow: (color: string, dy: number = 4) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: dy },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  }),

  radius: { card: 4, chip: 2, flat: 0 },
  border: { card: 3, chip: 2 },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },

  font: {
    hero: { fontSize: 42, fontWeight: '800' as const, letterSpacing: 3 },
    banner: { fontSize: 34, fontWeight: '800' as const, letterSpacing: 2 },
    title: { fontSize: 22, fontWeight: '800' as const, letterSpacing: 2 },
    section: { fontSize: 16, fontWeight: '800' as const, letterSpacing: 1.5 },
    body: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0 },
    caption: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 1.2 },
  },

  /** Per-screen gradient overlays — every screen shares bg_game and differs by overlay. */
  overlays: {
    // Loader is deliberately the darkest overlay in the app (alpha 0.90+) so it can
    // never be confused with the bright bento Menu by the screenshot gate.
    loader: ['rgba(2,2,6,0.94)', 'rgba(5,5,10,0.90)', 'rgba(18,18,31,0.94)'],
    menu: ['rgba(10,10,15,0.86)', 'rgba(26,26,46,0.80)', 'rgba(10,10,15,0.92)'],
    levels: ['#0A0A0F', '#16213E', '#0A0A0F'],
    game: ['rgba(10,10,15,0.88)', 'rgba(10,10,15,0.94)', 'rgba(5,5,10,0.96)'],
    resultWin: ['#06180F', '#0A0A0F', '#06180F'],
    resultLose: ['#1A0610', '#0A0A0F', '#1A0610'],
    collection: ['#0A0A0F', '#1A0A20', '#0A0A0F'],
    progress: ['#0A0A0F', '#06180F', '#0A0A0F'],
    settings: ['#0A0A0F', '#1A1A2E', '#0A0A0F'],
  },
} as const;

export type Theme = typeof THEME;
export const C = THEME.colors;
