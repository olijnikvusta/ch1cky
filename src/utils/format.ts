/** Grouped score, e.g. 12480 -> "12,480". */
export function groupNumber(n: number): string {
  const safe = Math.max(0, Math.floor(Number.isFinite(n) ? n : 0));
  return String(safe).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Multiplier chip text, e.g. 1.5 -> "x1.5", 2 -> "x2". */
export function formatMultiplier(m: number): string {
  return 'x' + (Number.isInteger(m) ? String(m) : m.toFixed(1));
}

/** Percentage with no decimals, e.g. 0.8421 -> "84 %". */
export function formatPercent(ratio: number): string {
  const safe = Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : 0;
  return Math.round(safe * 100) + ' %';
}

/** "L5 · 12,480" style compact run label. */
export function formatRunLabel(level: number, score: number): string {
  return 'L' + level + ' · ' + groupNumber(score);
}
