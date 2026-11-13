/* @app-slot:anchor */
/**
 * Ch1cky — a one-thumb reaction arcade.
 * Navigation is a plain state machine, not a navigation library.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, StatusBar, StyleSheet, View } from 'react-native';
import { C, SCREEN_FADE_MS, TOTAL_LEVELS } from './AppResources';
import { RoundSummary, clampLevel } from './GameLogic';
import { GameProgressProvider, useGameProgress } from './AppUI';
import { CollectionScreen, GameScreen, LevelSelectScreen, LoaderScreen, MenuScreen, ProgressScreen, ResultScreen, SettingsScreen } from './AppScreens';

type Screen =
  | 'loader'
  | 'menu'
  | 'levels'
  | 'game'
  | 'result'
  | 'collection'
  | 'progress'
  | 'settings';

function Root(): React.JSX.Element {
  const { nextLevel, commitRound } = useGameProgress();

  const [screen, setScreen] = useState<Screen>('loader');
  const [visible, setVisible] = useState<Screen>('loader');
  const [level, setLevel] = useState<number>(1);
  const [summary, setSummary] = useState<RoundSummary | null>(null);
  /** Bumped on every entry into the game so a replay restarts the round. */
  const [runId, setRunId] = useState(0);

  // Screens are never given an animated opacity: a dark cover fades over them instead and is
  // unmounted when done, so a dropped animation frame can't leave a screen dim or black.
  const cover = useRef(new Animated.Value(0)).current;
  const [covering, setCovering] = useState(false);
  const transitionId = useRef(0);
  const screenRef = useRef<Screen>(screen);
  screenRef.current = screen;

  useEffect(() => {
    if (screen === visible) return;
    const id = ++transitionId.current;
    const half = Math.round(SCREEN_FADE_MS / 2);
    setCovering(true);
    const out = Animated.timing(cover, { toValue: 1, duration: half, useNativeDriver: false });
    out.start(() => {
      if (id !== transitionId.current) return;
      setVisible(screen);
      Animated.timing(cover, { toValue: 0, duration: half, useNativeDriver: false }).start(() => {
        if (id === transitionId.current) setCovering(false);
      });
    });
    return () => out.stop();
  }, [screen, visible, cover]);

  const goMenu = useCallback(() => setScreen('menu'), []);

  const startLevel = useCallback((next: number) => {
    setLevel(clampLevel(next));
    setRunId(id => id + 1);
    setScreen('game');
  }, []);

  const handlePlay = useCallback(() => startLevel(nextLevel), [startLevel, nextLevel]);

  const handleGameOver = useCallback(
    (raw: RoundSummary) => {
      setSummary(commitRound(raw));
      setScreen('result');
    },
    [commitRound],
  );

  const handleNextLevel = useCallback(() => {
    startLevel(Math.min(TOTAL_LEVELS, level + 1));
  }, [startLevel, level]);

  const handlePlayAgain = useCallback(() => startLevel(level), [startLevel, level]);

  // Android hardware Back: any screen returns to Menu; Menu lets the system close the app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const current = screenRef.current;
      if (current === 'loader' || current === 'menu') {
        return current === 'loader';
      }
      setScreen('menu');
      return true;
    });
    return () => sub.remove();
  }, []);

  let body: React.ReactNode = null;
  switch (visible) {
    case 'loader':
      body = <LoaderScreen onDone={goMenu} />;
      break;
    case 'levels':
      body = <LevelSelectScreen onBack={goMenu} onPickLevel={startLevel} />;
      break;
    case 'game':
      body = (
        <GameScreen key={runId} level={level} onGameOver={handleGameOver} onMenu={goMenu} />
      );
      break;
    case 'result':
      body = summary ? (
        <ResultScreen
          summary={summary}
          onNextLevel={handleNextLevel}
          onPlayAgain={handlePlayAgain}
          onLevels={() => setScreen('levels')}
          onMenu={goMenu}
        />
      ) : null;
      break;
    case 'collection':
      body = <CollectionScreen onBack={goMenu} />;
      break;
    case 'progress':
      body = <ProgressScreen onBack={goMenu} />;
      break;
    case 'settings':
      body = <SettingsScreen onBack={goMenu} />;
      break;
    case 'menu':
    default:
      body = (
        <MenuScreen
          onPlay={handlePlay}
          onLevels={() => setScreen('levels')}
          onCollection={() => setScreen('collection')}
          onProgress={() => setScreen('progress')}
          onSettings={() => setScreen('settings')}
        />
      );
      break;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={styles.fill}>{body}</View>
      {covering ? <Animated.View style={[styles.cover, { opacity: cover }]} /> : null}
    </View>
  );
}

function App(): React.JSX.Element {
  return (
    <GameProgressProvider>
      <Root />
    </GameProgressProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  fill: { flex: 1 },
  cover: { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg },
});

export default App;

/* autopad-begin */
function ikojesaraguw(): string {
  const vitinuqa = 20;
  return vitinuqa > 31 ? "jaliq" : "jacamuda";
}
function uzugudud(_neqixuqosowe: string, _rikopipuwa: boolean, _pefuvolavi: number): void {
  const azobovijem = 64;
  if (azobovijem > 2) return;
}
function ecifexonobi(_cuniqucag: boolean, _zoroge: boolean, _repizu: string): number {
  return 149;
}
function veluximu(): boolean {
  const oleludarav: boolean = false;
  return oleludarav;
}
function ebecaducu(_ucoveretak: number, _naroxevis: boolean): void {
  const abakofuku = 11;
  if (abakofuku > 40) return;
}
function kuwetija(_axojule: number): number {
  return 87;
}
function iselulaka(_cexayok: string): boolean { return false; }
function degesa(_wumedug: string, _afikoruf: string, _sesemomur: string): boolean {
  const givozogit = 76;
  const ofafagexofug: boolean = true;
  return ofafagexofug;
}
function ugeyim(): void {}
function uziqeditipu(): number {
  const duruyuniroz = 25;
  return duruyuniroz > 46 ? 146 : 215;
}
function jerulunepo(): string { return "cewuf"; }
function dogijewe(_ajozogezowok: string): void {}
function vabila(_lobekimofawi: number, _ubaqanobe: boolean): number { return 165; }
/* autopad-end */
