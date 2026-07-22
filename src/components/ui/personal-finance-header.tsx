import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/src/components/ui/text';
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
      <View style={styles.leftContent}>
        <Ionicons
          name="wallet-outline"
          size={24}
          color={colors.primary}
          style={styles.icon}
        />
        <Text style={[styles.label, { color: colors.text }]}>Atur Uang</Text>
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
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    padding: spacing.sm,
    marginRight: -spacing.sm,
  },
});
