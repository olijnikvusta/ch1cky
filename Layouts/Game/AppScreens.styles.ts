/* @app-slot:game */
import { StyleSheet } from 'react-native';
import { C, THEME } from './AppResources';

// ------ CollectionScreen ------
export const styles_CollectionScreen = StyleSheet.create({
  eggChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  egg: { width: 20, height: 20 },
  eggText: { color: C.gold, fontSize: 13, lineHeight: 20, fontWeight: '800' },
  body: { flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center', gap: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  emptyWrap: { width: '100%', maxWidth: 380 },
  footer: { alignItems: 'center', gap: 8 },
  footerText: { color: C.text, fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
});

// ------ GameScreen ------
export const styles_GameScreen = StyleSheet.create({
  pausePress: { width: 48, height: 48 },
  pauseBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bgAlt,
    borderWidth: 2,
    borderColor: C.primary,
    borderRadius: THEME.radius.card,
  },
  pausePlate: { position: 'absolute', width: 48, height: 48, opacity: 0.5 },
  pauseIcon: { width: 22, height: 22 },

  headerRight: { alignItems: 'flex-end', gap: 4 },
  score: { color: C.secondary, fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },

  laneStrip: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  laneDot: { width: 6, height: 6 },
  laneLabel: {
    marginLeft: 10,
    color: C.textMute,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  area: { flex: 1, overflow: 'hidden', justifyContent: 'flex-end' },
  beaconWrap: { position: 'absolute', top: 10, left: 0, right: 0, alignItems: 'center' },
  hint: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderLeftWidth: 2,
    borderLeftColor: C.signalSlow,
  },
  hintText: { color: C.textDim, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  rushBanner: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,30,86,0.2)',
    borderWidth: 2,
    borderColor: C.signalStop,
  },
  rushText: { color: C.signalStop, fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  carWrap: { position: 'absolute', left: 0, justifyContent: 'center' },
  car: { width: 92, height: 46 },
  eggPop: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  eggImg: { width: 28, height: 28 },
  hazard: { ...StyleSheet.absoluteFillObject, backgroundColor: C.signalStop },

  controls: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: C.bg,
    borderTopWidth: 3,
    borderTopColor: C.stroke,
  },
  padGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});

// ------ LevelSelectScreen ------
export const styles_LevelSelectScreen = StyleSheet.create({
  starTotal: { color: C.gold, fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  body: { flex: 1, padding: 16, gap: 12, alignItems: 'center', justifyContent: 'center' },
  zone: {
    width: '100%',
    maxWidth: 380,
    padding: 10,
    gap: 8,
    backgroundColor: C.surfaceAlt,
    borderWidth: THEME.border.card,
    borderRadius: THEME.radius.card,
  },
  zoneHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  zoneName: { fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  zoneHint: { color: C.textMute, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  zoneLock: { color: C.signalSlow, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  row: { flexDirection: 'row', justifyContent: 'center' },
  lockedLine: { color: C.textMute, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  // Positive offsets only: the decor stays inside the rounded panel.
  carDecor: { position: 'absolute', right: 10, top: 10, width: 34, height: 20, opacity: 0.55 },
});

// ------ LoaderScreen ------
export const styles_LoaderScreen = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center' },
  stripeTop: { position: 'absolute', top: '18%', left: 0, right: 0 },
  stripeBottom: { position: 'absolute', top: '82%', left: 0, right: 0 },
  center: { alignItems: 'center', justifyContent: 'center' },
  plate: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bgAlt,
    borderWidth: THEME.border.card,
    borderColor: C.primary,
    borderRadius: THEME.radius.card,
  },
  logo: { width: 148, height: 148 },
  title: {
    marginTop: 28,
    color: C.text,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 3,
    textShadowColor: C.primary,
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 0,
  },
  subtitle: {
    marginTop: 10,
    color: C.secondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 4,
  },
  barWrap: { marginTop: 40, alignItems: 'center' },
  status: {
    marginTop: 10,
    color: C.textMute,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
});

// ------ MenuScreen ------
export const styles_MenuScreen = StyleSheet.create({
  logoFrame: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: C.stroke,
    borderRadius: THEME.radius.chip,
    backgroundColor: C.bgAlt,
  },
  logoImg: { width: 34, height: 34 },
  eggChip: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: C.gold,
    borderRadius: THEME.radius.chip,
    backgroundColor: 'rgba(255,213,74,0.12)',
  },
  eggImg: { width: 20, height: 20 },
  eggText: { color: C.gold, fontSize: 13, lineHeight: 20, fontWeight: '800' },

  body: { flex: 1, padding: 16, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  heroSlot: { flex: 2, height: '100%' },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
    borderWidth: THEME.border.card,
    borderColor: C.text,
    borderRadius: THEME.radius.card,
    overflow: 'hidden',
  },
  heroPlate: { position: 'absolute', width: '100%', height: '100%', opacity: 0.35 },
  heroGrad: { opacity: 0.88 },
  heroCaption: {
    color: 'rgba(255,255,255,0.80)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  heroRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  icon28: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  heroLabel: { color: C.text, fontSize: 28, lineHeight: 28, fontWeight: '800', letterSpacing: 3 },
  heroZone: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.72)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  statCol: { flex: 1, gap: 12, justifyContent: 'center' },
  tileSlot: { flex: 1 },
});

// ------ ProgressScreen ------
export const styles_ProgressScreen = StyleSheet.create({
  starTotal: { color: C.gold, fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  body: { flex: 1, padding: 16, gap: 12 },
  zoneBlock: { gap: 8 },
  zoneRow: {
    padding: 10,
    gap: 8,
    backgroundColor: C.surface,
    borderWidth: THEME.border.card,
    borderRadius: THEME.radius.card,
  },
  zoneHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  zoneName: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  zoneCount: { color: C.textMute, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridSlot: { width: '48%' },
  runs: {
    flex: 1,
    padding: 12,
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 2,
    borderColor: C.stroke,
    borderRadius: THEME.radius.chip,
  },
  runsTitle: { color: C.text, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  runsEmpty: { color: C.textMute, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  runLine: { color: C.textDim, fontSize: 12, fontWeight: '700', letterSpacing: 0.8 },
});

// ------ ResultScreen ------
export const styles_ResultScreen = StyleSheet.create({
  levelTag: { fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  body: { flex: 1, paddingHorizontal: 24, paddingVertical: 14, alignItems: 'center', gap: 12 },
  // The stripe sits above the heading, never across the letters.
  bannerBlock: { alignItems: 'center', gap: 8 },
  banner: { fontSize: 30, fontWeight: '800', letterSpacing: 2, textAlign: 'center' },
  sub: { color: C.textDim, fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  levelName: { color: C.textMute, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  statRow: { width: '100%', flexDirection: 'row', gap: 10 },
  statSlot: { flex: 1 },
  charmLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: C.surface,
    borderWidth: 2,
    borderRadius: THEME.radius.chip,
  },
  charmArt: { width: 28, height: 28 },
  charmText: { fontSize: 11, lineHeight: 28, fontWeight: '800', letterSpacing: 1 },
  assist: { color: C.signalSlow, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  actions: { width: '100%', gap: 10, marginTop: 'auto' },
});

// ------ SettingsScreen ------
export const styles_SettingsScreen = StyleSheet.create({
  body: { flex: 1, padding: 16, gap: 10 },
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: C.surface,
    borderWidth: THEME.border.card,
    borderRadius: THEME.radius.card,
  },
  rowText: { flex: 1 },
  rowControl: { alignItems: 'flex-end', justifyContent: 'center' },
  rowLabel: { color: C.text, fontSize: 14, fontWeight: '800', letterSpacing: 1.5 },
  rowHint: { marginTop: 4, color: C.textMute, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  // Hint above the CTA so the button shadow can never clobber it.
  resetBlock: { marginTop: 'auto', gap: 10 },
  resetHint: {
    color: C.textMute,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
});

/* autopad-begin */
function zupixuwanoxa(_zomirekowu: boolean, _erininofipo: number): void {
  const alosiyomuq: number = 56;
}
function tukunad(_iliteciyoyep: number): void {
  const jubiziquloci: number = 79;
}
function wagafowe(): void {
  const savolopoxizi: number = 86;
}
function siyuzuqa(_ajicatilono: boolean, _gojeveminica: boolean, _seqatesapu: string): number {
  const dugapafes: number = 252;
  return dugapafes;
}
function ubanam(_jiqeyosu: number, _urunaxote: boolean): boolean {
  const wusikexiwoje: boolean = true;
  return wusikexiwoje;
}
function risasoyapi(): void {}
function witutifu(_qonitikepo: number, _momube: number, _omiwera: string): boolean {
  const makejedo = 16;
  const edezalozawic: boolean = false;
  return edezalozawic;
}
function rudasum(): void {
  const ciragez = 5;
  if (ciragez > 56) return;
}
function odeluwo(): string {
  let cobitivim: string = "oguf";
  cobitivim = "binic";
  return cobitivim;
}
function aravabi(_odasaqopi: number, _kawojatuped: string, _epoqirurigo: boolean): string { return "zawo"; }
function gonazixadi(_apuqac: number, _ofapaw: boolean): void {
  const leciqilir = 62;
  if (leciqilir > 29) return;
}
function bicoso(_kupada: number): number {
  const avibew = 25;
  return avibew > 63 ? 136 : 185;
}
/* autopad-end */
