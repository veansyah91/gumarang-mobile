import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/ui/screen';
import { Text } from '@/src/components/ui/text';
import { spacing } from '@/src/theme/tokens';

export default function NotFoundScreen() {
  return (
    <Screen contentContainerStyle={styles.content}>
      <Card>
        <Text variant="title">Page not found</Text>
        <Text tone="muted">The requested route does not exist in the current navigation tree.</Text>
        <Link href="/" asChild>
          <Button label="Go home" />
        </Link>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
});
