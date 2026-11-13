import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { ASSETS } from '../assets';
import { C } from '../constants/theme';
import { GlowBlob } from './GlowBlob';

type Props = {
  /** Per-screen gradient overlay — the only thing that tells the screens apart. */
  overlay: readonly string[];
  /** Background photo opacity. The Loader keeps it low so it reads darker than Menu. */
  bgOpacity?: number;
  blob?: string;
  blobSize?: number;
  blobTop?: number;
  blobLeft?: number;
  children: React.ReactNode;
};

/** bg_game + gradient + glow blob: three depth layers under every screen. */
export function ScreenShell({
  overlay,
  bgOpacity = 0.3,
  blob,
  blobSize,
  blobTop,
  blobLeft,
  children,
}: Props) {
  return (
    <View style={styles.root}>
      <ImageBackground
        source={ASSETS.bgGame}
        style={StyleSheet.absoluteFill}
        imageStyle={{ opacity: bgOpacity }}
        resizeMode="cover"
      />
      <LinearGradient
        colors={overlay as string[]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {blob ? (
        <GlowBlob color={blob} size={blobSize} top={blobTop} left={blobLeft} />
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { flex: 1 },
});
