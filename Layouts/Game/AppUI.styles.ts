/* @app-slot:game */
import { StyleSheet } from 'react-native';
import { C, THEME } from './AppResources';

// ------ BentoTile ------
export const styles_BentoTile = StyleSheet.create({
  press: { width: '100%' },
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    backgroundColor: C.surface,
    borderWidth: THEME.border.card,
    borderRadius: THEME.radius.card,
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 2,
  },
  textCol: { flex: 1 },
  caption: { color: C.text, fontSize: 15, fontWeight: '800', letterSpacing: 1.5 },
  sub: { marginTop: 3, color: C.textMute, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
});

// ------ CharmCard ------
export const styles_CharmCard = StyleSheet.create({
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderWidth: THEME.border.card,
    borderRadius: THEME.radius.card,
  },
  art: { height: 46, alignItems: 'center', justifyContent: 'center' },
  sprite: { width: 40, height: 40 },
  // Kept inside the rounded frame: positive offsets only, never a peeking corner.
  badge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 2,
    backgroundColor: C.bg,
  },
  name: {
    marginTop: 4,
    color: C.text,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  locked: {
    marginTop: 4,
    color: C.textMute,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
});

// ------ ChickenRunner ------
export const styles_ChickenRunner = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ------ ComboMeter ------
export const styles_ComboMeter = StyleSheet.create({
  strip: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: C.bgAlt,
    borderTopWidth: 3,
    borderTopColor: C.primary,
  },
  side: { width: 86, justifyContent: 'center' },
  sideRight: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center' },
  mult: { fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  caption: { color: C.textMute, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  eggChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  egg: { width: 16, height: 16 },
  eggCount: { color: C.gold, fontSize: 14, lineHeight: 16, fontWeight: '800' },
});

// ------ ConfirmDialog ------
export const styles_ConfirmDialog = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,10,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  panel: {
    width: '100%',
    padding: 20,
    backgroundColor: C.surface,
    borderWidth: THEME.border.card,
    borderColor: C.signalStop,
    borderRadius: THEME.radius.card,
  },
  title: { color: C.text, fontSize: 20, fontWeight: '800', letterSpacing: 1.5, textAlign: 'center' },
  hint: {
    marginTop: 8,
    color: C.textDim,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  actions: { marginTop: 20, gap: 12 },
});

// ------ EmptyState ------
export const styles_EmptyState = StyleSheet.create({
  wrap: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surface,
    borderWidth: THEME.border.card,
    borderRadius: THEME.radius.card,
  },
  mark: { width: 10, height: 10, marginBottom: 10 },
  title: {
    color: C.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  hint: {
    marginTop: 6,
    color: C.textMute,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
});

// ------ GlowBlob ------
export const styles_GlowBlob = StyleSheet.create({
  wrap: { position: 'absolute' },
});

// ------ HardButton ------
export const styles_HardButton = StyleSheet.create({
  press: { justifyContent: 'center' },
  body: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: THEME.border.card,
    borderRadius: THEME.radius.card,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  label: { fontSize: 17, lineHeight: 24, fontWeight: '800', letterSpacing: 2 },
});

// ------ HardCard ------
export const styles_HardCard = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderWidth: THEME.border.card,
    borderRadius: THEME.radius.card,
  },
});

// ------ HardSegmented ------
export const styles_HardSegmented = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 8 },
  seg: {
    width: 62,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: 2,
  },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '800', letterSpacing: 1 },
});

// ------ HardToggle ------
export const styles_HardToggle = StyleSheet.create({
  press: { width: 56, height: 48, alignItems: 'center', justifyContent: 'center' },
  track: {
    width: 56,
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 3,
    borderRadius: 2,
  },
  knob: { width: 22, height: 22, borderRadius: 1 },
});

// ------ HazardStripe ------
export const styles_HazardStripe = StyleSheet.create({
  wrap: { overflow: 'hidden' },
});

// ------ LevelCard ------
export const styles_LevelCard = StyleSheet.create({
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: THEME.border.card,
    borderRadius: THEME.radius.card,
  },
  inner: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  num: { color: C.text, fontSize: 22, fontWeight: '800' },
});

// ------ LivesRow ------
export const styles_LivesRow = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pip: { width: 16, height: 16 },
});

// ------ PauseOverlay ------
export const styles_PauseOverlay = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,10,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: { color: C.text, fontSize: 30, fontWeight: '800', letterSpacing: 3 },
  sub: { marginTop: 8, color: C.textDim, fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  actions: { marginTop: 28, width: '100%', gap: 12 },
});

// ------ ProgressBar ------
export const styles_ProgressBar = StyleSheet.create({
  track: {
    backgroundColor: C.strokeDim,
    borderWidth: 2,
    borderColor: C.stroke,
    borderRadius: 0,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fillWrap: { position: 'absolute' },
});

// ------ RoadLane ------
export const styles_RoadLane = StyleSheet.create({
  lane: { width: '100%', justifyContent: 'center' },
  dash: { alignSelf: 'center' },
});

// ------ ScreenHeader ------
export const styles_ScreenHeader = StyleSheet.create({
  header: {
    paddingTop: 44,
    height: 116,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: C.bgAlt,
    borderBottomWidth: 3,
  },
  side: { width: 112, justifyContent: 'center' },
  sideRight: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    color: C.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  backPress: { width: 108, height: 48 },
  backPlate: {
    width: 108,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bgAlt,
    borderWidth: THEME.border.card,
    borderColor: C.primary,
    borderRadius: THEME.radius.card,
    ...THEME.hardShadow(C.primaryDeep, 4),
  },
  backPlateArt: {
    position: 'absolute',
    width: 108,
    height: 48,
    opacity: 0.3,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  icon24: { width: 24, height: 24, resizeMode: 'contain' },
  backLabel: {
    color: C.text,
    fontSize: 13,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});

// ------ ScreenShell ------
export const styles_ScreenShell = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { flex: 1 },
});

// ------ SignalBeacon ------
export const styles_SignalBeacon = StyleSheet.create({
  housing: {
    width: 118,
    height: 136,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bg,
    borderWidth: THEME.border.card,
    borderColor: C.stroke,
    borderRadius: THEME.radius.card,
  },
  plate: { position: 'absolute', width: 110, height: 128, opacity: 0.6 },
  grid: {
    width: 86,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  lamp: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 2,
  },
  idle: {
    position: 'absolute',
    bottom: 8,
    color: C.textDim,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  double: {
    position: 'absolute',
    bottom: 8,
    color: C.gold,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

// ------ SignalPad ------
export const styles_SignalPad = StyleSheet.create({
  pad: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: THEME.border.card,
    borderRadius: THEME.radius.card,
  },
  glyph: { alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 20, lineHeight: 24, fontWeight: '800', letterSpacing: 2 },
});

// ------ StarRow ------
export const styles_StarRow = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  star: { fontWeight: '800' },
  glow: {
    textShadowColor: C.primary,
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 0,
  },
});

// ------ StatCard ------
export const styles_StatCard = StyleSheet.create({
  // width 100 % (never flex:1 inside a flex:1 slot) + intrinsic height.
  card: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surface,
    borderWidth: THEME.border.card,
    borderRadius: THEME.radius.card,
  },
  accentSquare: { width: 8, height: 8, marginBottom: 8 },
  value: { fontSize: 24, fontWeight: '800', letterSpacing: 0.5 },
  label: {
    marginTop: 4,
    color: C.textMute,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});

/* autopad-begin */
function imeduy(_uwubiwiya: number, _apeqoy: string, _rizodabuxoj: number): void {
  const tusujeqifala: number = 227;
}
function dapaxosuji(): string {
  let obazujem: string = "ure";
  obazujem = "nutaxuc";
  return obazujem;
}
function enedipibaxu(): boolean {
  return true;
}
function ayobozo(_awomuxayo: string): void {
  const xumibe = 26;
  if (xumibe > 49) return;
}
/* autopad-end */
