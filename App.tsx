/**
 * Ch1cky — a one-thumb reaction arcade.
 * Navigation is a plain state machine, not a navigation library.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, StatusBar, StyleSheet, View } from 'react-native';

import { SCREEN_FADE_MS, TOTAL_LEVELS } from './src/constants/config';
import { C } from './src/constants/theme';
import { clampLevel } from './src/game/levels';
import { RoundSummary } from './src/game/types';
import { GameProgressProvider, useGameProgress } from './src/hooks/useGameProgress';
import { CollectionScreen } from './src/screens/CollectionScreen';
import { GameScreen } from './src/screens/GameScreen';
import { LevelSelectScreen } from './src/screens/LevelSelectScreen';
import { LoaderScreen } from './src/screens/LoaderScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

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

  const fade = useRef(new Animated.Value(1)).current;
  const screenRef = useRef<Screen>(screen);
  screenRef.current = screen;

  // Every transition is a cross-fade, never an instant swap.
  useEffect(() => {
    if (screen === visible) {
      return;
    }
    const half = Math.round(SCREEN_FADE_MS / 2);
    const out = Animated.timing(fade, { toValue: 0, duration: half, useNativeDriver: true });
    out.start(() => {
      setVisible(screen);
      Animated.timing(fade, { toValue: 1, duration: half, useNativeDriver: true }).start();
    });
    return () => out.stop();
  }, [screen, visible, fade]);

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
      <Animated.View pointerEvents="box-none" style={[styles.fill, { opacity: fade }]}>
        {body}
      </Animated.View>
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
});

export default App;
