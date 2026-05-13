import { type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, radius, spacing } from '@/src/theme/tokens';

export function Card({ children }: PropsWithChildren) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
});
