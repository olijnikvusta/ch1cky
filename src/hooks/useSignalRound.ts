import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  CALL_BEAT_MS,
  FIRST_CALL_DELAY_MS,
  LIVES,
  MISTAKE_FREEZE_MS,
  PANIC_WINDOW_MS,
} from '../constants/config';
import { levelConfig } from '../game/levels';
import { mulberry32 } from '../game/rng';
import { multiplierFor, starsFor, windowMsFor } from '../game/scoring';
import { callForStep, generateRound, resolveAnswer } from '../game/signalEngine';
import { CallKind, GameSettings, RoundOutcome, RoundSummary, SignalCall } from '../game/types';

export type RoundPhase = 'idle' | 'playing' | 'mistake' | 'paused' | 'win' | 'lose';

export type RoundState = {
  phase: RoundPhase;
  lane: number;
  lives: number;
  combo: number;
  score: number;
  eggs: number;
  mistakes: number;
  bestCombo: number;
  correct: number;
  answers: number;
  call: SignalCall | null;
  stage: number;
  windowMs: number;
  /** Bumped on every new call so the window bar restarts. */
  callNonce: number;
  hazardNonce: number;
  eggNonce: number;
  carNonce: number;
  carLane: number;
  step: number;
  usedRush: number[];
  panic: boolean;
};

function initialState(): RoundState {
  return {
    phase: 'idle',
    lane: 0,
    lives: LIVES,
    combo: 0,
    score: 0,
    eggs: 0,
    mistakes: 0,
    bestCombo: 0,
    correct: 0,
    answers: 0,
    call: null,
    stage: 0,
    windowMs: 0,
    callNonce: 0,
    hazardNonce: 0,
    eggNonce: 0,
    carNonce: 0,
    carLane: -1,
    step: 0,
    usedRush: [],
    panic: false,
  };
}

type Options = {
  level: number;
  attempt: number;
  settings: GameSettings;
  onGameOver: (summary: RoundSummary) => void;
};

/**
 * The round loop. Every timer lives in a ref and is cleared on pause, restart and
 * unmount, so nothing keeps ticking after the screen is gone. Callbacks read the
 * live round from a ref, never from a stale render closure.
 */
export function useSignalRound({ level, attempt, settings, onGameOver }: Options) {
  const cfg = useMemo(() => levelConfig(level), [level]);
  const round = useMemo(() => generateRound(cfg.level, attempt), [cfg.level, attempt]);

  const [state, setState] = useState<RoundState>(initialState);
  const ref = useRef<RoundState>(state);
  ref.current = state;

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef<number>(0);
  const remainingRef = useRef<number>(0);
  const finishedRef = useRef<boolean>(false);
  const rngRef = useRef(mulberry32(round.seed));
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const commit = useCallback((patch: Partial<RoundState>) => {
    const next = { ...ref.current, ...patch };
    ref.current = next;
    setState(next);
  }, []);

  const finish = useCallback(
    (outcome: RoundOutcome) => {
      if (finishedRef.current) {
        return;
      }
      finishedRef.current = true;
      clearTimer();
      const s = ref.current;
      commit({ phase: outcome === 'win' ? 'win' : 'lose', call: null });
      const summary: RoundSummary = {
        level: cfg.level,
        outcome,
        score: s.score,
        stars: outcome === 'win' ? starsFor(s.mistakes, settingsRef.current.reactionAssist) : 0,
        bestCombo: s.bestCombo,
        eggs: s.eggs,
        mistakes: s.mistakes,
        lane: s.lane,
        lanes: cfg.lanes,
        correct: s.correct,
        answers: s.answers,
        assist: settingsRef.current.reactionAssist,
        seed: round.seed,
        newCharms: [],
      };
      // Let the win/lose beat play before the Result screen takes over.
      timerRef.current = setTimeout(() => {
        onGameOverRef.current(summary);
      }, 320);
    },
    [cfg.level, cfg.lanes, clearTimer, commit, round.seed],
  );

  /** Declared up front so issueCall and expire can reference each other. */
  const issueCallRef = useRef<() => void>(() => {});

  const expire = useCallback(() => {
    const s = ref.current;
    if (s.phase !== 'playing') {
      return;
    }
    clearTimer();
    const lives = s.lives - 1;
    commit({
      phase: 'mistake',
      lives,
      combo: 0,
      mistakes: s.mistakes + 1,
      answers: s.answers + 1,
      call: null,
      stage: 0,
      panic: true,
      hazardNonce: s.hazardNonce + 1,
      carNonce: s.carNonce + 1,
      carLane: s.lane,
    });
    if (lives <= 0) {
      timerRef.current = setTimeout(() => finish('lose'), MISTAKE_FREEZE_MS);
      return;
    }
    timerRef.current = setTimeout(() => issueCallRef.current(), MISTAKE_FREEZE_MS);
  }, [clearTimer, commit, finish]);

  const issueCall = useCallback(() => {
    const s = ref.current;
    if (finishedRef.current || s.phase === 'paused') {
      return;
    }
    const call = callForStep(
      round,
      s.step,
      s.lane,
      s.combo,
      cfg.level,
      s.usedRush,
      rngRef.current.next(),
    );
    const windowMs = windowMsFor({
      level: cfg.level,
      combo: s.combo,
      assist: settingsRef.current.reactionAssist,
      egg: call.kind === 'egg',
      panic: s.panic,
      panicMs: PANIC_WINDOW_MS,
    });
    commit({
      phase: 'playing',
      call,
      stage: 0,
      windowMs,
      callNonce: s.callNonce + 1,
      step: s.step + 1,
      panic: false,
      carNonce: call.rush ? s.carNonce + 1 : s.carNonce,
      carLane: call.rush ? s.lane : s.carLane,
    });
    clearTimer();
    startedAtRef.current = Date.now();
    remainingRef.current = windowMs;
    timerRef.current = setTimeout(expire, windowMs);
  }, [cfg.level, clearTimer, commit, expire, round]);

  issueCallRef.current = issueCall;

  const press = useCallback(
    (pad: CallKind) => {
      const s = ref.current;
      if (s.phase !== 'playing' || !s.call || finishedRef.current) {
        return;
      }
      const result = resolveAnswer(s.call, pad, s.stage, s.combo);

      if (!result.correct) {
        clearTimer();
        const lives = s.lives - 1;
        commit({
          phase: 'mistake',
          lives,
          combo: 0,
          mistakes: s.mistakes + 1,
          answers: s.answers + 1,
          call: null,
          stage: 0,
          hazardNonce: s.hazardNonce + 1,
          carNonce: s.carNonce + 1,
          carLane: s.lane,
        });
        if (lives <= 0) {
          timerRef.current = setTimeout(() => finish('lose'), MISTAKE_FREEZE_MS);
          return;
        }
        timerRef.current = setTimeout(() => issueCallRef.current(), MISTAKE_FREEZE_MS);
        return;
      }

      if (result.partial) {
        // First half of a double-signal landed: keep the window running, await pad two.
        commit({ stage: 1 });
        return;
      }

      clearTimer();
      const combo = s.combo + result.comboDelta;
      const lane = result.advance ? s.lane + 1 : s.lane;
      const usedRush =
        s.call.rush && s.usedRush.indexOf(s.lane) < 0 ? s.usedRush.concat([s.lane]) : s.usedRush;
      commit({
        combo,
        bestCombo: Math.max(s.bestCombo, combo),
        score: s.score + result.points,
        eggs: s.eggs + (result.egg ? 1 : 0),
        eggNonce: result.egg ? s.eggNonce + 1 : s.eggNonce,
        correct: s.correct + 1,
        answers: s.answers + 1,
        lane,
        stage: 0,
        call: null,
        usedRush,
      });

      if (lane >= cfg.lanes) {
        timerRef.current = setTimeout(() => finish('win'), 260);
        return;
      }
      timerRef.current = setTimeout(() => issueCallRef.current(), CALL_BEAT_MS);
    },
    [cfg.lanes, clearTimer, commit, finish],
  );

  const pause = useCallback(() => {
    const s = ref.current;
    if (s.phase !== 'playing' && s.phase !== 'idle') {
      return;
    }
    const elapsed = Date.now() - startedAtRef.current;
    remainingRef.current = Math.max(120, (s.windowMs || FIRST_CALL_DELAY_MS) - elapsed);
    clearTimer();
    commit({ phase: 'paused' });
  }, [clearTimer, commit]);

  const resume = useCallback(() => {
    const s = ref.current;
    if (s.phase !== 'paused') {
      return;
    }
    if (!s.call) {
      commit({ phase: 'idle' });
      clearTimer();
      timerRef.current = setTimeout(() => issueCallRef.current(), CALL_BEAT_MS);
      return;
    }
    commit({ phase: 'playing', callNonce: s.callNonce + 1, windowMs: remainingRef.current });
    clearTimer();
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(expire, remainingRef.current);
  }, [clearTimer, commit, expire]);

  const restart = useCallback(() => {
    clearTimer();
    finishedRef.current = false;
    rngRef.current = mulberry32(round.seed);
    const fresh = initialState();
    ref.current = fresh;
    setState(fresh);
    timerRef.current = setTimeout(() => issueCallRef.current(), FIRST_CALL_DELAY_MS);
  }, [clearTimer, round.seed]);

  /** The first call fires on its own; a pad touch during idle brings it forward. */
  const nudge = useCallback(() => {
    if (ref.current.phase !== 'idle') {
      return;
    }
    clearTimer();
    issueCallRef.current();
  }, [clearTimer]);

  useEffect(() => {
    // A new seed means a new attempt: wipe the round and start the clock again.
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    finishedRef.current = false;
    rngRef.current = mulberry32(round.seed);
    const fresh = initialState();
    ref.current = fresh;
    setState(fresh);
    timerRef.current = setTimeout(() => issueCallRef.current(), FIRST_CALL_DELAY_MS);
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      finishedRef.current = true;
    };
  }, [round.seed]);

  const multiplier = multiplierFor(state.combo);
  const padsEnabled = state.phase === 'playing' || state.phase === 'idle';

  return {
    cfg,
    round,
    state,
    multiplier,
    padsEnabled,
    press,
    pause,
    resume,
    restart,
    nudge,
  };
}
