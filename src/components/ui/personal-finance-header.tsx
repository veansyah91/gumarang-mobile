import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, spacing } from '@/src/theme/tokens';

export function PersonalFinanceHeader() {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const router = useRouter();

  const handleHomePress = () => {
    router.push('/');
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={styles.titleRow}>
        <Ionicons name="wallet-outline" size={28} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Atur Uang</Text>
      </View>

      <Pressable
        onPress={handleHomePress}
        style={({ pressed }) => [
          styles.homeButton,
          {
            opacity: pressed ? 0.7 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
        hitSlop={8}
      >
        <Ionicons name="home-outline" size={24} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingTop: spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  homeButton: {
    padding: spacing.sm,
    marginRight: -spacing.sm,
  },
});
