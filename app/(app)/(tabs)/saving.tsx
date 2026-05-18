import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/src/components/ui/screen';
import { Text } from '@/src/components/ui/text';
import { useAuth } from '@/src/hooks/use-auth';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, radius, spacing } from '@/src/theme/tokens';
import { Redirect } from 'expo-router';

type MenuItem = {
  title: string;
  description: string;
  href: '/(app)/saving-member' | '/(app)/saving-detail-member';
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  tint: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    title: 'Data Tabunganku',
    description: 'Lihat saldo dan data tabungan emas.',
    href: '/(app)/saving-member',
    icon: 'wallet-outline',
    color: '#0891b2',
    tint: '#cffafe',
  },
  {
    title: 'Buku Tabungan',
    description: 'Riwayat mutasi tabungan emas.',
    href: '/(app)/saving-detail-member',
    icon: 'book-outline',
    color: '#7c3aed',
    tint: '#ede9fe',
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

export default function SavingScreen() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

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
