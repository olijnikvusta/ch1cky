import React from 'react';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ASSETS } from '../assets';
import { CharmCard } from '../components/CharmCard';
import { EmptyState } from '../components/EmptyState';
import { ProgressBar } from '../components/ProgressBar';
import { ScreenHeader, HeaderBackButton } from '../components/ScreenHeader';
import { ScreenShell } from '../components/ScreenShell';
import { TOTAL_CHARMS } from '../constants/config';
import { C, THEME } from '../constants/theme';
import { CHARMS } from '../game/collection';
import { useGameProgress } from '../hooks/useGameProgress';

type Props = {
  onBack: () => void;
};

export function CollectionScreen({ onBack }: Props) {
  const { width } = useWindowDimensions();
  const { profile } = useGameProgress();

  const GRID_W = Math.min(width - 32, 380);
  const CHARM = Math.floor((GRID_W - 2 * 13 - 2 * 10) / 3);
  const owned = profile.charms;
  const barWidth = Math.min(width - 64, 320);

  return (
    <ScreenShell overlay={THEME.overlays.collection} bgOpacity={0.3} blob={C.gold} blobSize={320}>
      <ScreenHeader
        accent={C.gold}
        title="COLLECTION"
        leftSlot={<HeaderBackButton onPress={onBack} />}
        rightSlot={
          <View style={styles.eggChip}>
            <Image source={ASSETS.sprite3} style={styles.egg} resizeMode="contain" />
            <Text style={styles.eggText}>x {profile.eggs}</Text>
          </View>
        }
      />

      <View style={styles.body}>
        {owned.length === 0 ? (
          <View style={styles.emptyWrap}>
            <EmptyState
              title="NOTHING IN THE COOP YET"
              hint="CATCH EGG SIGNALS TO FILL IT"
              accent={C.gold}
            />
          </View>
        ) : (
          <View style={[styles.grid, { width: GRID_W }]}>
            {CHARMS.map(charm => (
              <CharmCard
                key={charm.id}
                charm={charm}
                unlocked={owned.indexOf(charm.id) >= 0}
                size={CHARM}
              />
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {owned.length} / {TOTAL_CHARMS} CHARMS
          </Text>
          <ProgressBar
            progress={owned.length / TOTAL_CHARMS}
            width={barWidth}
            height={6}
            colors={[C.gold, C.primary]}
          />
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  eggChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  egg: { width: 20, height: 20 },
  eggText: { color: C.gold, fontSize: 13, lineHeight: 20, fontWeight: '800' },
  body: { flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center', gap: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  emptyWrap: { width: '100%', maxWidth: 380 },
  footer: { alignItems: 'center', gap: 8 },
  footerText: { color: C.text, fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
});
