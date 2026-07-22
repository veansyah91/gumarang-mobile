import { StyleSheet, View } from 'react-native';

import { Screen } from '@/src/components/ui/screen';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, spacing } from '@/src/theme/tokens';

export default function CoaPage() {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']} scrollable>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text variant="title">COA</Text>
        <Text tone="muted" style={{ marginTop: spacing.sm }}>
          COA (Chart of Accounts) — placeholder page.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
});
