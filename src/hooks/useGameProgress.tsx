import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { RECORD_HISTORY } from '../constants/config';
import { evaluateCharms } from '../game/collection';
import { nextPlayableLevel } from '../game/levels';
import {
  bestStars,
  clearedFlags,
  clearedLevelNumbers,
  emptyProfile,
  loadProfile,
  resetProfile,
  saveProfile,
  totalStars,
} from '../game/storage';
import { GameSettings, Profile, RoundSummary } from '../game/types';

type ProgressValue = {
  profile: Profile;
  settings: GameSettings;
  stars: number;
  cleared: boolean[];
  nextLevel: number;
  updateSettings: (patch: Partial<GameSettings>) => void;
  commitRound: (summary: RoundSummary) => RoundSummary;
  resetAll: () => void;
};

const ProgressContext = createContext<ProgressValue | null>(null);

export function GameProgressProvider({ children }: { children: React.ReactNode }) {
  // Rehydrated once at app start; the ref keeps callbacks off stale closures.
  const [profile, setProfile] = useState<Profile>(() => loadProfile());
  const profileRef = useRef<Profile>(profile);
  profileRef.current = profile;

  const persist = useCallback((next: Profile) => {
    profileRef.current = next;
    saveProfile(next);
    setProfile(next);
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<GameSettings>) => {
      const current = profileRef.current;
      persist({ ...current, settings: { ...current.settings, ...patch } });
    },
    [persist],
  );

  const commitRound = useCallback(
    (summary: RoundSummary): RoundSummary => {
      const current = profileRef.current;
      const levels = current.levels.map((lv, i) => {
        if (i !== summary.level - 1) {
          return lv;
        }
        return {
          stars: summary.outcome === 'win' ? Math.max(lv.stars, summary.stars) : lv.stars,
          bestScore: Math.max(lv.bestScore, summary.score),
          cleared: lv.cleared || summary.outcome === 'win',
        };
      });

      const stats = {
        crossings: current.stats.crossings + summary.lane,
        correct: current.stats.correct + summary.correct,
        answers: current.stats.answers + summary.answers,
        bestScore: Math.max(current.stats.bestScore, summary.score),
        bestCombo: Math.max(current.stats.bestCombo, summary.bestCombo),
      };

      const eggs = current.eggs + summary.eggs;
      const draft: Profile = {
        ...current,
        levels,
        eggs,
        stats,
        records: [
          {
            level: summary.level,
            stars: summary.outcome === 'win' ? summary.stars : 0,
            score: summary.score,
            bestCombo: summary.bestCombo,
            outcome: summary.outcome,
          },
          ...current.records,
        ].slice(0, RECORD_HISTORY),
      };

      const unlocked = evaluateCharms(
        {
          eggs,
          totalStars: totalStars(draft),
          clearedLevels: clearedLevelNumbers(draft),
          bestCombo: stats.bestCombo,
          bestScore: stats.bestScore,
          bestStars: bestStars(draft),
        },
        draft.charms,
      );

      const next: Profile = { ...draft, charms: draft.charms.concat(unlocked) };
      persist(next);
      return { ...summary, newCharms: unlocked };
    },
    [persist],
  );

  const resetAll = useCallback(() => {
    const fresh = resetProfile();
    persist(fresh);
  }, [persist]);

  const value = useMemo<ProgressValue>(() => {
    const cleared = clearedFlags(profile);
    const stars = totalStars(profile);
    return {
      profile,
      settings: profile.settings,
      stars,
      cleared,
      nextLevel: nextPlayableLevel(stars, cleared),
      updateSettings,
      commitRound,
      resetAll,
    };
  }, [profile, updateSettings, commitRound, resetAll]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

const FALLBACK: ProgressValue = {
  profile: emptyProfile(),
  settings: emptyProfile().settings,
  stars: 0,
  cleared: [],
  nextLevel: 1,
  updateSettings: () => {},
  commitRound: s => s,
  resetAll: () => {},
};

export function useGameProgress(): ProgressValue {
  return useContext(ProgressContext) || FALLBACK;
}

/** Narrow selectors — a component subscribes to what it draws, not to everything. */
export function useSettings(): GameSettings {
  return useGameProgress().settings;
}

export function useTotalStars(): number {
  return useGameProgress().stars;
}

export function useEggCount(): number {
  return useGameProgress().profile.eggs;
}
