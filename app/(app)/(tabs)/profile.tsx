import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/ui/screen';
import { Text } from '@/src/components/ui/text';
import { useAuth } from '@/src/hooks/use-auth';
import { spacing } from '@/src/theme/tokens';

export default function ProfileScreen() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const handleLogout = async () => {
    router.replace('/(app)/(tabs)');
    await logout();
  };

  return (
    <Screen contentContainerStyle={styles.content} scrollable>
      <View style={styles.header}>
        <Text variant="eyebrow">Akun Saya</Text>
        <Text variant="title">{user?.name ?? '-'}</Text>
      </View>

      <Card>
        <Text variant="subtitle">Informasi Akun</Text>
        <View style={styles.stack}>
          <View style={styles.row}>
            <Text tone="muted" style={styles.label}>
              Nama
            </Text>
            <Text>{user?.name ?? '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text tone="muted" style={styles.label}>
              No. Handphone
            </Text>
            <Text>{user?.phone ?? '-'}</Text>
          </View>
        </View>
      </Card>

      <Card>
        <View style={styles.stack}>
          <Button label="Keluar" variant="danger" onPress={handleLogout} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  stack: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
  },
  hint: {
    fontSize: 13,
    lineHeight: 20,
  },
});
