import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ASSETS } from '../assets';
import { HardButton } from '../components/HardButton';
import { HazardStripe } from '../components/HazardStripe';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenShell } from '../components/ScreenShell';
import { StarRow } from '../components/StarRow';
import { StatCard } from '../components/StatCard';
import { TOTAL_LEVELS } from '../constants/config';
import { C, THEME } from '../constants/theme';
import { charmById } from '../game/collection';
import { LEVEL_NAMES } from '../game/levels';
import { RoundSummary } from '../game/types';
import { formatMultiplier, groupNumber } from '../utils/format';
import { multiplierFor } from '../game/scoring';

type Props = {
  summary: RoundSummary;
  onNextLevel: () => void;
  onPlayAgain: () => void;
  onLevels: () => void;
  onMenu: () => void;
};

/** Counts the score up over 600 ms without animating any layout property. */
function useCountUp(target: number, ms: number): number {
  const [value, setValue] = useState(0);
  const targetRef = useRef(target);
  targetRef.current = target;

  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - started) / ms);
      setValue(Math.round(targetRef.current * t));
      if (t >= 1) {
        clearInterval(id);
      }
    }, 30);
    return () => clearInterval(id);
  }, [target, ms]);

  return value;
}

export function ResultScreen({ summary, onNextLevel, onPlayAgain, onLevels, onMenu }: Props) {
  const { width } = useWindowDimensions();
  const win = summary.outcome === 'win';
  const shown = useCountUp(summary.score, 600);

  const banner = win ? 'SAFE CROSSING!' : 'RUFFLED FEATHERS!';
  const bannerColor = win ? C.signalGo : C.signalStop;
  const subLine = win
    ? 'LEVEL ' + summary.level + ' CLEARED'
    : 'CAUGHT IN LANE ' + (summary.lane + 1);

  const cards = [
    { value: groupNumber(shown), label: 'SCORE', accent: C.secondary, has: summary.score > 0 },
    {
      value: formatMultiplier(multiplierFor(summary.bestCombo)),
      label: 'BEST COMBO',
      accent: C.signalGo,
      has: summary.bestCombo > 0,
    },
    { value: 'x ' + summary.eggs, label: 'EGGS', accent: C.gold, has: summary.eggs > 0 },
  ];
  const visible = cards.filter(c => c.has);
  const newCharm = summary.newCharms.length > 0 ? charmById(summary.newCharms[0]) : undefined;
  const hasNext = win && summary.level < TOTAL_LEVELS;

  return (
    <ScreenShell
      overlay={win ? THEME.overlays.resultWin : THEME.overlays.resultLose}
      bgOpacity={0.3}
      blob={bannerColor}
      blobSize={340}>
      <ScreenHeader
        accent={bannerColor}
        title="ROUND RESULT"
        rightSlot={<Text style={[styles.levelTag, { color: bannerColor }]}>L{summary.level}</Text>}
      />

      <View style={styles.body}>
        <View style={styles.bannerBlock}>
          <HazardStripe width={Math.min(width - 48, 340)} height={10} opacity={0.4} />
          <Text style={[styles.banner, { color: bannerColor }]}>{banner}</Text>
          <Text style={styles.sub}>{subLine}</Text>
          <Text style={styles.levelName}>{LEVEL_NAMES[summary.level - 1]}</Text>
        </View>

        <StarRow earned={summary.stars} size={34} animate />

        {visible.length >= 2 ? (
          <View style={styles.statRow}>
            {visible.map(c => (
              <View key={c.label} style={styles.statSlot}>
                <StatCard value={c.value} label={c.label} accent={c.accent} hideWhenEmpty={false} />
              </View>
            ))}
          </View>
        ) : null}

        {newCharm ? (
          <View style={[styles.charmLine, { borderColor: newCharm.accent }]}>
            <Image
              source={ASSETS.sprite4}
              style={[styles.charmArt, { tintColor: newCharm.accent }]}
              resizeMode="contain"
            />
            <Text style={[styles.charmText, { color: newCharm.accent }]}>
              NEW CHARM · {newCharm.name}
            </Text>
          </View>
        ) : null}

        {summary.assist ? <Text style={styles.assist}>ASSIST ON · MAX 2 STARS</Text> : null}

        <View style={styles.actions}>
          {hasNext ? <HardButton label="NEXT LEVEL" onPress={onNextLevel} height={56} /> : null}
          <HardButton
            label="PLAY AGAIN"
            onPress={onPlayAgain}
            variant={hasNext ? 'secondary' : 'primary'}
            accent={C.secondary}
            height={56}
          />
          <HardButton label="LEVELS" onPress={onLevels} variant="secondary" accent={C.stroke} height={52} />
          <HardButton label="MENU" onPress={onMenu} variant="secondary" accent={C.stroke} height={52} />
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
