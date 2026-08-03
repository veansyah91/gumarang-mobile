import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Badge } from '@/src/components/ui/badge';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, spacing } from '@/src/theme/tokens';
import type { AccountTreeNode } from '@/src/types/account';
import { resolveIconName } from '@/src/utils/icon';

type Props = {
  account: AccountTreeNode;
  onPress?: (id: number) => void;
  onLongPress?: (id: number) => void;
  depth?: number;
};

function formatBalance(balance: number): string {
  return new Intl.NumberFormat('id-ID').format(balance);
}

function CoaTreeItemComponent({
  account,
  onPress,
  onLongPress,
  depth = 0,
}: Props) {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const iconName = resolveIconName(account.icon, 'ellipse');

  return (
    <View style={{ marginLeft: depth * 20 }}>
      <Pressable
        onPress={() => onPress?.(account.id)}
        onLongPress={() => onLongPress?.(account.id)}
        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
      >
        <Card>
          <View style={styles.row}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: account.color + '20' },
              ]}
            >
              <Ionicons
                name={iconName as any}
                size={20}
                color={account.color}
              />
            </View>

            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {account.name}
                </Text>
                <Badge
                  label={account.type}
                  variant={
                    account.type === 'asset'
                      ? 'success'
                      : account.type === 'expense'
                        ? 'warning'
                        : 'secondary'
                  }
                />
              </View>

              {['asset', 'liability', 'equity'].includes(account.type) && (
                <Text tone="muted" style={styles.balance}>
                  Rp {formatBalance(account.current_balance)}
                </Text>
              )}
            </View>

            {account.is_parent && account.children.length > 0 && (
              <Ionicons name="chevron-down" size={18} color={colors.muted} />
            )}
          </View>
        </Card>
      </Pressable>

      {(account.children ?? []).map((child) => (
        <CoaTreeItemComponent
          key={child.id}
          account={child}
          onPress={onPress}
          onLongPress={onLongPress}
          depth={depth + 1}
        />
      ))}
    </View>
  );
}

export const CoaTreeItem = CoaTreeItemComponent;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontWeight: '600',
    fontSize: 15,
    flexShrink: 1,
  },
  balance: {
    fontSize: 13,
  },
});
