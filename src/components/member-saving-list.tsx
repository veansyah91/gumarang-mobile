import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { memberApi } from '@/src/services/api/member';
import { palette, radius, spacing } from '@/src/theme/tokens';
import type { SavingMember } from '@/src/types/member';
import { toAppError } from '@/src/utils/errors';

function SavingListSkeleton() {
  return (
    <View style={styles.listSection}>
      <Skeleton height={90} />
      <Skeleton height={90} />
      <Skeleton height={90} />
    </View>
  );
}

function SavingListErrorState({
  message,
  onRetry,
  isRetrying,
}: {
  message: string;
  onRetry: () => void | Promise<void>;
  isRetrying: boolean;
}) {
  return (
    <Card>
      <Text variant="subtitle">Data tabungan belum bisa dimuat</Text>
      <Text tone="muted">{message}</Text>
      <View style={styles.retryButton}>
        <Button
          label={isRetrying ? 'Memuat...' : 'Coba lagi'}
          onPress={onRetry}
          disabled={isRetrying}
          variant="secondary"
        />
      </View>
    </Card>
  );
}

function SavingCard({
  item,
  onPress,
}: {
  item: SavingMember;
  onPress: () => void;
}) {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const isActive = item.is_active === 1;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View
        style={[
          styles.savingCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.cardBody}>
          <View style={styles.cardRow}>
            <Text variant="subtitle">{item.no_ref}</Text>
            <Text variant="subtitle">
              {item.weight} {item.unit}
            </Text>
          </View>
          <Text tone="muted">{item.product_category.name}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isActive ? '#16a34a' : '#dc2626' },
          ]}
        >
          <Text style={styles.statusText}>
            {isActive ? 'Aktif' : 'Tidak Aktif'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function MemberSavingList() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const query = useQuery({
    queryKey: ['member-saving-list'],
    queryFn: () => memberApi.getSavingMembers(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const savings = query.data ?? [];
  const errorMessage = query.error ? toAppError(query.error).userMessage : null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await query.refetch();
    setIsRefreshing(false);
  };

  return (
    <Screen
      scrollable
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
      contentContainerStyle={styles.content}
    >
      {query.isLoading && !query.data ? (
        <SavingListSkeleton />
      ) : errorMessage && !query.data ? (
        <SavingListErrorState
          message={errorMessage}
          onRetry={async () => {
            await query.refetch();
          }}
          isRetrying={isRefreshing}
        />
      ) : (
        <View style={styles.listSection}>
          {savings.length > 0 ? (
            savings.map((item) => (
              <SavingCard
                key={item.id}
                item={item}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/saving-detail-member',
                    params: { user_saving_id: String(item.id) },
                  })
                }
              />
            ))
          ) : (
            <Card>
              <Text tone="muted">Belum ada data tabungan emas.</Text>
            </Card>
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.lg,
  },
  listSection: {
    gap: spacing.sm,
  },
  retryButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  savingCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardBody: {
    gap: spacing.xs,
    padding: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
