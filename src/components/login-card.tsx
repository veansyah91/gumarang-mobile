import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/ui/button';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { useAuthStore } from '@/src/state/auth-store';
import { palette, spacing } from '@/src/theme/tokens';

export function LoginCard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const theme = useResolvedTheme();
  const colors = palette[theme];

  if (user) {
    return (
      <View style={styles.userInfo}>
        <Text style={{ fontWeight: '700', color: colors.text }}>
          {user.name}
        </Text>
        <Text style={{ fontSize: 12, color: colors.muted }}>{user.phone}</Text>
      </View>
    );
  }

  return (
    <View style={styles.buttons}>
      <Button label="Masuk" onPress={() => router.push('/(auth)/login')} />
      <Button
        label="Daftar"
        onPress={() => router.push('/(auth)/register')}
        variant="secondary"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  userInfo: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
});
