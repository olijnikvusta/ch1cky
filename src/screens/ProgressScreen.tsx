import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { EmptyState } from '../components/EmptyState';
import { ProgressBar } from '../components/ProgressBar';
import { ScreenHeader, HeaderBackButton } from '../components/ScreenHeader';
import { ScreenShell } from '../components/ScreenShell';
import { StatCard } from '../components/StatCard';
import { C, THEME } from '../constants/theme';
import { ZONES } from '../game/levels';
import { accuracyOf, multiplierFor } from '../game/scoring';
import { useGameProgress } from '../hooks/useGameProgress';
import { formatMultiplier, formatPercent, groupNumber } from '../utils/format';

type Props = {
  onBack: () => void;
};

export function ProgressScreen({ onBack }: Props) {
  const { width } = useWindowDimensions();
  const { profile, stars } = useGameProgress();
  const stats = profile.stats;
  const barWidth = Math.min(width - 96, 300);

  const cards = [
    { value: groupNumber(stats.bestScore), label: 'BEST SCORE', accent: C.secondary, has: stats.bestScore > 0 },
    {
      value: formatMultiplier(multiplierFor(stats.bestCombo)),
      label: 'BEST COMBO',
      accent: C.signalGo,
      has: stats.bestCombo > 0,
    },
    { value: String(stats.crossings), label: 'CROSSINGS', accent: C.gold, has: stats.crossings > 0 },
    {
      value: formatPercent(accuracyOf(stats.correct, stats.answers)),
      label: 'ACCURACY',
      accent: C.primary,
      has: stats.answers > 0,
    },
  ];
  const visible = cards.filter(c => c.has);

  return (
    <ScreenShell overlay={THEME.overlays.progress} bgOpacity={0.3} blob={C.signalGo} blobSize={320}>
      <ScreenHeader
        accent={C.signalGo}
        title="PROGRESS"
        leftSlot={<HeaderBackButton onPress={onBack} />}
        rightSlot={
          <Text style={styles.starTotal}>
            {'★'} {stars}
          </Text>
        }
      />

      <View style={styles.body}>
        <View style={styles.zoneBlock}>
          {ZONES.map(zone => {
            const done = zone.levels.filter(l => profile.levels[l - 1].cleared).length;
            return (
              <View
                key={zone.id}
                style={[styles.zoneRow, { borderColor: zone.color }, THEME.hardShadow(C.bg, 4)]}>
                <View style={styles.zoneHead}>
                  <Text style={[styles.zoneName, { color: zone.color }]}>{zone.name}</Text>
                  <Text style={styles.zoneCount}>
                    {done} / {zone.levels.length} LEVELS
                  </Text>
                </View>
                <ProgressBar
                  progress={done / zone.levels.length}
                  width={barWidth}
                  height={10}
                  colors={[zone.color, zone.color]}
                />
              </View>
            );
          })}
        </View>

        {visible.length >= 2 ? (
          <View style={styles.grid}>
            {visible.map(c => (
              <View key={c.label} style={styles.gridSlot}>
                <StatCard value={c.value} label={c.label} accent={c.accent} hideWhenEmpty={false} />
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            title="NO RUNS RECORDED"
            hint="PLAY A LEVEL TO START YOUR RECORD"
            accent={C.signalGo}
          />
        )}

        <View style={styles.runs}>
          <Text style={styles.runsTitle}>LAST RUNS</Text>
          {profile.records.length === 0 ? (
            <Text style={styles.runsEmpty}>NO CROSSINGS LOGGED YET</Text>
          ) : (
            profile.records.map((r, i) => (
              <Text key={i} style={styles.runLine}>
                L{r.level} · {'★'} {r.stars} · {groupNumber(r.score)} ·{' '}
                {formatMultiplier(multiplierFor(r.bestCombo))}
              </Text>
            ))
          )}
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
