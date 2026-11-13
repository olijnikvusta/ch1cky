import React, { useCallback } from 'react';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ASSETS } from '../assets';
import { HazardStripe } from '../components/HazardStripe';
import { LevelCard } from '../components/LevelCard';
import { ScreenHeader, HeaderBackButton } from '../components/ScreenHeader';
import { ScreenShell } from '../components/ScreenShell';
import { C, THEME } from '../constants/theme';
import { levelUnlocked, zoneUnlocked, ZONES } from '../game/levels';
import { useGameProgress } from '../hooks/useGameProgress';

type Props = {
  onBack: () => void;
  onPickLevel: (level: number) => void;
};

export function LevelSelectScreen({ onBack, onPickLevel }: Props) {
  const { width } = useWindowDimensions();
  const { profile, stars, cleared } = useGameProgress();

  // Grid frame formula — the row can never overflow its panel.
  const ROW_MAX_W = Math.min(width - 32, 380);
  const ROW_FRAME = 10 + 3;
  const GAP = 10;
  const CARD = Math.floor((ROW_MAX_W - 2 * ROW_FRAME - 3 * GAP) / 4);

  const handlePick = useCallback((level: number) => onPickLevel(level), [onPickLevel]);

  return (
    <ScreenShell overlay={THEME.overlays.levels} bgOpacity={0.3} blob={C.secondary} blobSize={320}>
      <ScreenHeader
        accent={C.secondary}
        title="LEVEL SELECT"
        leftSlot={<HeaderBackButton onPress={onBack} />}
        rightSlot={
          <Text style={styles.starTotal}>
            {'★'} {stars}
          </Text>
        }
      />

      <View style={styles.body}>
        {ZONES.map(zone => {
          const open = zoneUnlocked(zone, stars);
          return (
            <View
              key={zone.id}
              style={[
                styles.zone,
                { borderColor: open ? zone.color : C.stroke },
                THEME.hardShadow(C.bg, 4),
              ]}>
              <View style={styles.zoneHead}>
                <Text style={[styles.zoneName, { color: open ? zone.color : C.textMute }]}>
                  {zone.name}
                </Text>
                {open ? (
                  <Text style={styles.zoneHint}>
                    {zone.levels.filter(l => cleared[l - 1]).length} / {zone.levels.length} CLEARED
                  </Text>
                ) : (
                  <Text style={styles.zoneLock}>
                    NEEDS {'★'} {zone.starsRequired}
                  </Text>
                )}
              </View>

              {open ? null : <HazardStripe width={ROW_MAX_W - 2 * ROW_FRAME} height={10} opacity={0.5} />}

              <View style={[styles.row, { gap: GAP }]}>
                {zone.levels.map(level => (
                  <LevelCard
                    key={level}
                    level={level}
                    stars={profile.levels[level - 1].stars}
                    locked={!open || !levelUnlocked(level, stars, cleared)}
                    zoneColor={zone.color}
                    size={CARD}
                    onPress={handlePick}
                  />
                ))}
              </View>

              {open ? null : (
                <Text style={styles.lockedLine}>
                  EARN {'★'} {zone.starsRequired} TO OPEN THIS ZONE
                </Text>
              )}
              {zone.id === 2 ? (
                <Image source={ASSETS.sprite2} style={styles.carDecor} resizeMode="contain" />
              ) : null}
            </View>
          );
        })}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
