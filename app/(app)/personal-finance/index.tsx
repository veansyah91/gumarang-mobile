import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Screen } from '@/src/components/ui/screen';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, spacing } from '@/src/theme/tokens';

type MenuItem = {
  title: string;
  description?: string;
  href: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  tint: string;
};

const MAIN_MENU_ITEMS: MenuItem[] = [
  {
    title: 'Dasbor',
    href: '/personal-finance/dashboard',
    icon: 'speedometer-outline',
    color: '#2563eb',
    tint: '#dbeafe',
  },
  {
    title: 'Kontak',
    href: '/personal-finance/contact',
    icon: 'people-outline',
    color: '#7c3aed',
    tint: '#f3e8ff',
  },
  {
    title: 'Daftar Akun',
    href: '/personal-finance/account',
    icon: 'grid-outline',
    color: '#7c3aed',
    tint: '#f3e8ff',
  },
  {
    title: 'Aset Tetap',
    href: '/personal-finance/fixed-asset',
    icon: 'diamond-outline',
    color: '#f59e0b',
    tint: '#fef3c7',
  },
  {
    title: 'Investasi',
    href: '/personal-finance/investment',
    icon: 'trending-up-outline',
    color: '#059669',
    tint: '#d1fae5',
  },
];

const TRANSACTION_MENU_ITEMS: MenuItem[] = [
  {
    title: 'Kas Masuk',
    href: '/personal-finance/cash-in',
    icon: 'add-circle-outline',
    color: '#2563eb',
    tint: '#dbeafe',
  },
  {
    title: 'Kas Keluar',
    href: '/personal-finance/cash-out',
    icon: 'remove-circle-outline',
    color: '#dc2626',
    tint: '#fee2e2',
  },
  {
    title: 'Budget',
    href: '/personal-finance/budget',
    icon: 'wallet-outline',
    color: '#0891b2',
    tint: '#e0f2fe',
  },
];

const DEBT_MENU_ITEMS: MenuItem[] = [
  {
    title: 'Daftar Utang',
    href: '/personal-finance/debt/payable',
    icon: 'arrow-down-circle-outline',
    color: '#dc2626',
    tint: '#fee2e2',
  },
  {
    title: 'Pembayaran Utang',
    href: '/personal-finance/debt/payable-entry',
    icon: 'cash-outline',
    color: '#dc2626',
    tint: '#fee2e2',
  },
  {
    title: 'Daftar Piutang',
    href: '/personal-finance/debt/receivable',
    icon: 'arrow-up-circle-outline',
    color: '#059669',
    tint: '#d1fae5',
  },
  {
    title: 'Pembayaran Piutang',
    href: '/personal-finance/debt/receivable-entry',
    icon: 'cash-outline',
    color: '#059669',
    tint: '#d1fae5',
  },
];

function MenuCard({ item, cardWidth }: { item: MenuItem; cardWidth: number }) {
  const router = useRouter();
  const theme = useResolvedTheme();
  const colors = palette[theme];

  return (
    <Pressable
      onPress={() => router.push(item.href as any)}
      style={({ pressed }) => [
        styles.menuCard,
        {
          width: cardWidth,
          borderColor: item.color,
          backgroundColor: colors.surface,
          opacity: pressed ? 0.95 : 1,
          transform: [{ scale: pressed ? 0.995 : 1 }],
        },
      ]}
    >
      <View style={styles.menuCardInner}>
        <View style={[styles.iconArea, { backgroundColor: item.tint }]}>
          <Ionicons name={item.icon} size={17} color={item.color} />
        </View>

        <View style={[styles.footer, { backgroundColor: `${item.color}1A` }]}>
          <Text variant="subtitle" style={{ textAlign: 'center', fontSize: 9 }}>
            {item.title}
          </Text>
          {item.description ? (
            <Text tone="muted" style={styles.description}>
              {item.description}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export default function PersonalFinanceIndex() {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const { width } = useWindowDimensions();

  const breakpoint = 600;
  const maxGridWidth = 520;
  const screenPadding = spacing.md * 2;
  const columns = width >= breakpoint ? 4 : 3;
  const gapCount = columns - 1;
  const gridWidth = Math.min(width - screenPadding, maxGridWidth);
  const totalGap = spacing.sm * gapCount;
  const cardWidth = (gridWidth - totalGap) / columns;

  return (
    <Screen scrollable safeAreaEdges={['top', 'left', 'right']}>
      <View style={[styles.grid, { width: gridWidth }]}>
        {MAIN_MENU_ITEMS.map((item) => (
          <MenuCard key={item.title} item={item} cardWidth={cardWidth} />
        ))}

        <View style={styles.sectionLabel}>
          <Text
            variant="subtitle"
            style={[styles.sectionText, { color: colors.text }]}
          >
            Transaksi
          </Text>
        </View>

        {TRANSACTION_MENU_ITEMS.map((item) => (
          <MenuCard key={item.title} item={item} cardWidth={cardWidth} />
        ))}

        <View style={styles.sectionLabel}>
          <Text
            variant="subtitle"
            style={[styles.sectionText, { color: colors.text }]}
          >
            Utang Piutang
          </Text>
        </View>

        {DEBT_MENU_ITEMS.map((item) => (
          <MenuCard key={item.title} item={item} cardWidth={cardWidth} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    alignSelf: 'center',
  },
  sectionLabel: {
    width: '100%',
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  sectionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  menuCard: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuCardInner: {
    flex: 1,
    minHeight: 75,
  },
  iconArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  footer: {
    minHeight: 35,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  description: {
    fontSize: 7,
    textAlign: 'center',
  },
});
