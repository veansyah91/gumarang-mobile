import { RefreshControl, StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import { useCachedResource } from '@/src/hooks/use-cached-resource';
import { useDraftSync } from '@/src/hooks/use-draft-sync';
import { authApi } from '@/src/services/api/auth';
import { useAppStore } from '@/src/state/app-store';
import { useAuthStore } from '@/src/state/auth-store';
import { spacing } from '@/src/theme/tokens';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const createDraft = useAppStore((state) => state.createDraft);
  const pendingDrafts = useAppStore((state) => state.pendingDrafts);
  const isOnline = useAppStore((state) => state.networkOnline);
  const { syncDrafts, isSyncing } = useDraftSync();
  const profileQuery = useCachedResource({
    queryKey: ['current-user'],
    storageKey: 'cache:current-user',
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(user),
    queryFn: authApi.getProfile,
  });

  const currentUser = profileQuery.data ?? user;

  return (
    <Screen
      scrollable
      refreshControl={<RefreshControl refreshing={profileQuery.isRefetching} onRefresh={() => profileQuery.refetch()} />}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text variant="eyebrow">Dashboard</Text>
        <Text variant="title">Fast, cache-first foundation</Text>
        <Text tone="muted">
          {isOnline ? 'Online and ready to sync with Laravel.' : 'Offline mode enabled with persisted drafts and cached session data.'}
        </Text>
      </View>

      <Card>
        <Text variant="subtitle">Authentication status</Text>
        {profileQuery.isLoading && !currentUser ? (
          <Skeleton height={72} />
        ) : (
          <View style={styles.stack}>
            <Text>{currentUser?.name ?? 'No profile loaded yet'}</Text>
            <Text tone="muted">{currentUser?.email ?? 'Sign in to hydrate the current user from the API.'}</Text>
            <Text tone={profileQuery.isFromCache ? 'warning' : 'success'}>
              {profileQuery.isFromCache ? 'Showing cached profile data.' : 'Showing live profile data.'}
            </Text>
          </View>
        )}
      </Card>

      <Card>
        <Text variant="subtitle">Offline drafts</Text>
        <View style={styles.stack}>
          <Text>{pendingDrafts} pending draft transaction(s)</Text>
          <Text tone="muted">
            Drafts are saved locally first, then synced automatically whenever connectivity and auth are restored.
          </Text>
          <View style={styles.actions}>
            <Button label="Save draft" variant="secondary" onPress={() => createDraft()} />
            <Button label={isSyncing ? 'Syncing...' : 'Sync now'} onPress={syncDrafts} disabled={isSyncing || !pendingDrafts} />
          </View>
        </View>
      </Card>

      <Card>
        <Text variant="subtitle">Architecture snapshot</Text>
        <View style={styles.stack}>
          <Text>• Expo Router groups auth, app, and settings/profile flows</Text>
          <Text>• Axios interceptors centralize tokens, timeout, and 401 handling</Text>
          <Text>• Zustand stores UI/auth state separately from React Query server data</Text>
          <Text>• SecureStore + AsyncStorage persist sessions, settings, cache, and drafts</Text>
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
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
