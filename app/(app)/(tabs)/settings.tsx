import { StyleSheet, Switch, View } from 'react-native';

import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/ui/screen';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/state/app-store';
import { spacing } from '@/src/theme/tokens';

export default function SettingsScreen() {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const themeLabel =
    settings.themePreference === 'system'
      ? 'Follow device theme'
      : settings.themePreference === 'light'
        ? 'Light theme'
        : 'Dark theme';

  return (
    <Screen
      contentContainerStyle={styles.content}
      scrollable
      safeAreaEdges={['top', 'left', 'right']}
    >
      <View style={styles.header}>
        <Text variant="eyebrow">Settings</Text>
        <Text variant="title">Local preferences</Text>
        <Text tone="muted">
          App settings are persisted locally and restored on launch without
          blocking the UI.
        </Text>
      </View>

      <Card>
        <Text variant="subtitle">Appearance</Text>
        <View style={styles.row}>
          <View style={styles.copy}>
            <Text>{themeLabel}</Text>
            <Text tone="muted">
              Toggle between system and dark mode for quick theme verification.
            </Text>
          </View>
          <Switch
            value={settings.themePreference === 'dark'}
            onValueChange={(value) =>
              updateSettings({ themePreference: value ? 'dark' : 'system' })
            }
          />
        </View>
      </Card>

      <Card>
        <Text variant="subtitle">Offline support</Text>
        <View style={styles.row}>
          <View style={styles.copy}>
            <Text>Background draft sync</Text>
            <Text tone="muted">
              Keep local drafts queued and sync them automatically whenever the
              network is back.
            </Text>
          </View>
          <Switch
            value={settings.offlineSyncEnabled}
            onValueChange={(offlineSyncEnabled) =>
              updateSettings({ offlineSyncEnabled })
            }
          />
        </View>
      </Card>

      <Card>
        <Text variant="subtitle">UX defaults</Text>
        <View style={styles.row}>
          <View style={styles.copy}>
            <Text>Skeleton loading</Text>
            <Text tone="muted">
              Standardize loading states with reusable placeholders and
              cache-aware fallbacks.
            </Text>
          </View>
          <Switch
            value={settings.skeletonEnabled}
            onValueChange={(skeletonEnabled) =>
              updateSettings({ skeletonEnabled })
            }
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
});
