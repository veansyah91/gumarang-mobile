import { Redirect } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Screen } from '@/src/components/ui/screen';
import { Text } from '@/src/components/ui/text';
import { useAuth } from '@/src/hooks/use-auth';

export default function MyGoldScreen() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <Text variant="title">Emasku</Text>
      <Text tone="muted">Halaman ini sedang dalam pengembangan.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
