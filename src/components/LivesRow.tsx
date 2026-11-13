import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { ASSETS } from '../assets';
import { C } from '../constants/theme';

type Props = {
  lives: number;
  max: number;
};

/** Three chicken pips; a spent life keeps its slot but drops to 25 % opacity. */
function LivesRowBase({ lives, max }: Props) {
  const pips = [];
  for (let i = 0; i < max; i += 1) {
    const alive = i < lives;
    pips.push(
      <Image
        key={i}
        source={ASSETS.sprite1}
        resizeMode="contain"
        style={[
          styles.pip,
          { opacity: alive ? 1 : 0.25, tintColor: alive ? C.signalStop : C.textMute },
        ]}
      />,
    );
  }
  return <View style={styles.row}>{pips}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pip: { width: 16, height: 16 },
});

export const LivesRow = React.memo(LivesRowBase);
