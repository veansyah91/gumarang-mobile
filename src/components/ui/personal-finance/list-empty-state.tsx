import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, spacing } from '@/src/theme/tokens';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
};

export function ListEmptyState({ icon, title }: Props) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.muted} />
      <Text tone="muted" style={styles.title}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.sm,
    flex: 1,
  },
  title: {
    marginTop: spacing.sm,
  },
});
