import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ConfirmDialog } from '../components/ConfirmDialog';
import { HardButton } from '../components/HardButton';
import { HardSegmented } from '../components/HardSegmented';
import { HardToggle } from '../components/HardToggle';
import { ScreenHeader, HeaderBackButton } from '../components/ScreenHeader';
import { ScreenShell } from '../components/ScreenShell';
import { C, THEME } from '../constants/theme';
import { useGameProgress } from '../hooks/useGameProgress';

type Props = {
  onBack: () => void;
};

type RowProps = {
  label: string;
  hint: string;
  accent: string;
  children: React.ReactNode;
};

function OptionRow({ label, hint, accent, children }: RowProps) {
  return (
    <View style={[styles.row, { borderColor: accent }, THEME.hardShadow(C.bg, 4)]}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowHint}>{hint}</Text>
      </View>
      <View style={styles.rowControl}>{children}</View>
    </View>
  );
}

/** Every option here changes real behaviour and is persisted. No audio controls: the app ships no audio. */
export function SettingsScreen({ onBack }: Props) {
  const { settings, updateSettings, resetAll } = useGameProgress();
  const [confirming, setConfirming] = useState(false);

  const handleReset = useCallback(() => {
    resetAll();
    setConfirming(false);
    onBack();
  }, [resetAll, onBack]);

  return (
    <ScreenShell overlay={THEME.overlays.settings} bgOpacity={0.3} blob={C.primary} blobSize={320}>
      <ScreenHeader
        accent={C.primary}
        title="SETTINGS"
        leftSlot={<HeaderBackButton onPress={onBack} />}
      />

      <View style={styles.body}>
        <OptionRow
          label="SIGNAL SHAPES"
          hint="A UNIQUE SHAPE ON EVERY LAMP AND PAD"
          accent={C.signalGo}>
          <HardToggle
            label="SIGNAL SHAPES"
            value={settings.signalShapes}
            accent={C.signalGo}
            onChange={v => updateSettings({ signalShapes: v })}
          />
        </OptionRow>

        <OptionRow label="PAD SIDE" hint="PUTS GO AND STOP UNDER YOUR THUMB" accent={C.secondary}>
          <HardSegmented
            options={['LEFT', 'RIGHT']}
            value={settings.padSide}
            accent={C.secondary}
            onChange={v => updateSettings({ padSide: v === 'LEFT' ? 'LEFT' : 'RIGHT' })}
          />
        </OptionRow>

        <OptionRow
          label="REACTION ASSIST"
          hint="+250 MS PER SIGNAL · CAPS THE AWARD AT 2 STARS"
          accent={C.signalSlow}>
          <HardToggle
            label="REACTION ASSIST"
            value={settings.reactionAssist}
            accent={C.signalSlow}
            onChange={v => updateSettings({ reactionAssist: v })}
          />
        </OptionRow>

        <OptionRow
          label="HAZARD FLASH"
          hint="RED FLASH ON A MISTAKE · TURN OFF FOR COMFORT"
          accent={C.signalStop}>
          <HardToggle
            label="HAZARD FLASH"
            value={settings.hazardFlash}
            accent={C.signalStop}
            onChange={v => updateSettings({ hazardFlash: v })}
          />
        </OptionRow>

        <View style={styles.resetBlock}>
          <Text style={styles.resetHint}>WIPES LEVELS, STARS, CHARMS AND RECORDS</Text>
          <HardButton
            label="RESET PROGRESS"
            onPress={() => setConfirming(true)}
            variant="secondary"
            accent={C.signalStop}
            height={56}
          />
        </View>
      </View>

      {confirming ? (
        <ConfirmDialog
          title="RESET EVERYTHING?"
          hint="THIS CANNOT BE UNDONE"
          confirmLabel="RESET"
          cancelLabel="KEEP"
          onConfirm={handleReset}
          onCancel={() => setConfirming(false)}
        />
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: 16, gap: 10 },
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: C.surface,
    borderWidth: THEME.border.card,
    borderRadius: THEME.radius.card,
  },
  rowText: { flex: 1 },
  rowControl: { alignItems: 'flex-end', justifyContent: 'center' },
  rowLabel: { color: C.text, fontSize: 14, fontWeight: '800', letterSpacing: 1.5 },
  rowHint: { marginTop: 4, color: C.textMute, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  // Hint above the CTA so the button shadow can never clobber it.
  resetBlock: { marginTop: 'auto', gap: 10 },
  resetHint: {
    color: C.textMute,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
});
