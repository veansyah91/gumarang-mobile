import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, radius, spacing } from '@/src/theme/tokens';
import type { FixedAssetNode } from '@/src/types/fixed-asset';
import { formatIDR } from '@/src/utils/currency';
import { resolveIconName } from '@/src/utils/icon';

type Props = {
  item: FixedAssetNode;
  onPress: (id: number) => void;
  onLongPress?: (id: number) => void;
};

export function FixedAssetCard({ item, onPress, onLongPress }: Props) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  return (
    <Pressable
      onPress={() => onPress(item.id)}
      onLongPress={() => onLongPress?.(item.id)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderLeftColor: item.color,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={resolveIconName(item.icon) as any} size={22} color={item.color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text tone="muted" style={styles.date}>
          {item.acquisition_date ?? '-'}
        </Text>
      </View>
      <Text style={[styles.balance, { color: item.color }]}>
        {formatIDR(item.current_balance)}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderLeftWidth: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontWeight: '600',
    fontSize: 15,
  },
  date: {
    fontSize: 12,
  },
  balance: {
    fontWeight: '700',
    fontSize: 14,
  },
});
