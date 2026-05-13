import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/ui/screen';
import { Text } from '@/src/components/ui/text';
import { useAuth } from '@/src/hooks/use-auth';
import { spacing } from '@/src/theme/tokens';

export default function ProfileScreen() {
  const { user, logout, status } = useAuth();

  return (
    <Screen contentContainerStyle={styles.content} scrollable>
      <View style={styles.header}>
        <Text variant="eyebrow">Profile</Text>
        <Text variant="title">Persistent session</Text>
        <Text tone="muted">The auth store restores the last secure session before protected routes are shown.</Text>
      </View>

      <Card>
        <Text variant="subtitle">Current user</Text>
        <View style={styles.stack}>
          <Text>{user?.name ?? 'Guest session'}</Text>
          <Text tone="muted">{user?.email ?? 'No stored profile available.'}</Text>
          <Text tone="muted">Status: {status}</Text>
        </View>
      </Card>

      <Card>
        <Text variant="subtitle">Security guardrails</Text>
        <View style={styles.stack}>
          <Text>• Tokens are stored in SecureStore</Text>
          <Text>• Protected routes redirect on expired or missing sessions</Text>
          <Text>• Unauthorized API responses clear invalid sessions centrally</Text>
          <Button label="Log out" variant="danger" onPress={logout} />
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
    gap: spacing.sm,
  },
  stack: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
