import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, spacing } from '@/src/theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
  onBack?: () => void;
};

export function PersonalFinanceSubHeader({
  title,
  subtitle,
  rightAction,
  onBack,
}: Props) {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const router = useRouter();

  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <Pressable
        onPress={onBack ?? (() => router.back())}
        style={({ pressed }) => [
          styles.backButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        hitSlop={8}
      >
        <Ionicons name="chevron-back" size={24} color={colors.primary} />
      </Pressable>

      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text tone="muted" style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightAction ? <View style={styles.rightAction}>{rightAction}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingTop: spacing.xl,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
    marginRight: spacing.xs,
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  rightAction: {
    marginLeft: spacing.sm,
  },
});
