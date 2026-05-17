import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/src/components/ui/screen';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, radius, spacing } from '@/src/theme/tokens';

type MenuItem = {
  title: string;
  description: string;
  href:
    | '/(app)/gold-list'
    | '/(app)/certificate'
    | '/(app)/purchase-member'
    | '/(app)/sale-member'
    | '/(app)/invoice-member'
    | '/(app)/gold-convertion-member';
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  tint: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    title: 'Data Emasku',
    description: 'Emas yang dimiliki.',
    href: '/(app)/gold-list',
    icon: 'grid-outline',
    color: '#65a30d',
    tint: '#ecfccb',
  },
  {
    title: 'Data Sertifikatku',
    description: 'Sertifikat emas yang dimiliki.',
    href: '/(app)/certificate',
    icon: 'document-text-outline',
    color: '#1d4ed8',
    tint: '#dbeafe',
  },
  {
    title: 'Riwayat Pembelian Emas',
    description: 'Pantau transaksi pembelian emas.',
    href: '/(app)/purchase-member',
    icon: 'receipt-outline',
    color: '#0891b2',
    tint: '#cffafe',
  },
  {
    title: 'Riwayat Penjualan Emas',
    description: 'Pantau transaksi penjualan emas.',
    href: '/(app)/sale-member',
    icon: 'newspaper-outline',
    color: '#e11d48',
    tint: '#ffe4e6',
  },
  {
    title: 'Riwayat Tukar Emas',
    description: 'Lihat riwayat tukar emas.',
    href: '/(app)/gold-convertion-member',
    icon: 'repeat-outline',
    color: '#d97706',
    tint: '#fef3c7',
  },
];

function MenuCard({ item }: { item: MenuItem }) {
  const router = useRouter();
  const theme = useResolvedTheme();
  const colors = palette[theme];

  return (
    <Pressable
      onPress={() => router.push(item.href)}
      style={({ pressed }) => [
        styles.menuCard,
        {
          borderColor: item.color,
          backgroundColor: colors.surface,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
    >
      <View style={styles.menuCardInner}>
        <View style={[styles.iconArea, { backgroundColor: item.tint }]}>
          <Ionicons name={item.icon} size={34} color={item.color} />
        </View>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: `${item.color}1A`,
            },
          ]}
        >
          <Text
            variant="subtitle"
            style={{ textAlign: 'center', fontSize: 14 }}
          >
            {item.title}
          </Text>
          <Text tone="muted" style={styles.description}>
            {item.description}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function MyGoldScreen() {
  return (
    <Screen scrollable safeAreaEdges={['top', 'left', 'right']}>
      <View style={styles.grid}>
        {MENU_ITEMS.map((item) => (
          <MenuCard key={item.title} item={item} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  menuCard: {
    width: '47%',
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  menuCardInner: {
    flex: 1,
    minHeight: 170,
  },
  iconArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  footer: {
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  description: {
    fontSize: 10,
    textAlign: 'center',
  },
});
