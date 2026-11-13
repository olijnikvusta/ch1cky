import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Lock } from 'lucide-react-native';

import { ASSETS } from '../assets';
import { Charm } from '../game/collection';
import { C, THEME } from '../constants/theme';
import { ShapeGlyph } from './ShapeGlyph';

type Props = {
  charm: Charm;
  unlocked: boolean;
  size: number;
};

/** Each charm carries its own vector shape — twelve distinct glyphs, no repeats. */
function CharmCardBase({ charm, unlocked, size }: Props) {
  return (
    <View
      style={[
        styles.card,
        {
          width: size,
          height: size + 26,
          borderColor: unlocked ? charm.accent : C.stroke,
          backgroundColor: unlocked ? C.surface : C.bgAlt,
        },
        THEME.hardShadow(C.bg, 4),
      ]}>
      {unlocked ? (
        <>
          <View style={styles.art}>
            <Image
              source={ASSETS.sprite4}
              style={[styles.sprite, { tintColor: charm.accent }]}
              resizeMode="contain"
            />
            <View style={[styles.badge, { borderColor: charm.accent }]}>
              <ShapeGlyph shape={charm.shape} size={12} color={charm.accent} />
            </View>
          </View>
          <Text numberOfLines={2} style={styles.name}>
            {charm.name}
          </Text>
        </>
      ) : (
        <>
          <View style={styles.art}>
            <Lock size={18} color={C.textMute} />
          </View>
          <Text numberOfLines={2} style={styles.locked}>
            {charm.condition}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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

export const CharmCard = React.memo(CharmCardBase);
