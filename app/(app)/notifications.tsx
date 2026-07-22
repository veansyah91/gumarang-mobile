import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { Screen } from '@/src/components/ui/screen';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { memberApi } from '@/src/services/api/member';
import type { ThemeMode } from '@/src/theme/tokens';
import { palette, spacing } from '@/src/theme/tokens';
import type { NotificationItem } from '@/src/types/member';

function NotificationListItem({
  item,
  theme,
  onPress,
}: {
  item: NotificationItem;
  theme: ThemeMode;
  onPress?: () => void;
}) {
  const colors = palette[theme];
  const isUnread = !item.read_at;
  const createdDate = new Date(item.created_at);
  const timeStr = createdDate.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <View
        style={[
          styles.notificationItem,
          {
            backgroundColor: isUnread ? colors.border : colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.notificationContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={2}>
              {item.data.title}
            </Text>
            <Text style={styles.body} tone="muted" numberOfLines={2}>
              {item.data.body}
            </Text>
          </View>
          {isUnread && (
            <View
              style={[styles.unreadBadge, { backgroundColor: colors.primary }]}
            />
          )}
        </View>
        <Text style={styles.timestamp} tone="muted">
          {timeStr}
        </Text>
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const queryClient = useQueryClient();
  const router = useRouter();

  // Use React Query to cache notifications for 30 seconds
  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: () => memberApi.getNotifications(),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const notifications = notificationsQuery.data?.data ?? [];
  const isLoading = notificationsQuery.isLoading;
  const error = notificationsQuery.error ? 'Gagal memuat notifikasi. Silakan coba lagi.' : null;

  // Ensure markAllNotificationsAsRead is performed once after first successful fetch,
  // but update cache locally to avoid triggering a refetch.
  const markedAllRef = useRef(false);
  useEffect(() => {
    if (!notificationsQuery.isSuccess) return;

    const hasUnread = notifications.some((n) => !n.read_at);
    if (hasUnread && !markedAllRef.current) {
      markedAllRef.current = true;
      void memberApi
        .markAllNotificationsAsRead()
        .then(() => {
          // update cache optimistically: mark all as read
          queryClient.setQueryData(['notifications'], (old: any) => {
            if (!old || !old.data) return old;
            const updated = {
              ...old,
              data: old.data.map((n: NotificationItem) => ({
                ...n,
                read_at: n.read_at ?? new Date().toISOString(),
              })),
            };
            return updated;
          });
        })
        .catch((err) => {
          console.error('[notifications] markAllNotificationsAsRead failed:', err);
        });
    }
  }, [notificationsQuery.isSuccess, notifications, queryClient]);

  const handleNotificationPress = useCallback(
    async (item: NotificationItem) => {
      try {
        // mark as read if not already
        if (!item.read_at) {
          try {
            await memberApi.markNotificationAsRead(item.id);
          } catch (err) {
            // don't fail navigation if marking read fails
            console.error('[notifications] markNotificationAsRead failed:', err);
          }

          // update cache optimistically for the single item
          queryClient.setQueryData(['notifications'], (old: any) => {
            if (!old || !old.data) return old;
            return {
              ...old,
              data: old.data.map((n: NotificationItem) =>
                n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n,
              ),
            };
          });
        }

        const txType = item.data.transactionType;
        const ref = item.data.referenceNumber;

        if (!txType) return;

        // Routing rules per planning (follow mapping exactly)
        if (txType === 'purchase') {
          // purchase -> sale detail
          if (ref) router.push(`/(app)/sale-member/${ref}`);
        } else if (txType === 'sale') {
          // sale -> purchase detail
          if (ref) router.push(`/(app)/purchase-member/${ref}`);
        } else if (txType === 'deposit' || txType === 'withdrawal') {
          router.push(`/(app)/saving-member`);
        }
      } catch (err) {
        console.error('[notifications] handle press failed:', err);
      }
    },
    [queryClient, router],
  );

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </Screen>
    );
  }

  if (notifications.length === 0) {
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <Text tone="muted">Tidak ada notifikasi</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationListItem
            item={item}
            theme={theme}
            onPress={() => void handleNotificationPress(item)}
          />
        )}
        scrollEnabled={false}
        contentContainerStyle={{ gap: 0 }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  notificationItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  body: {
    fontSize: 12,
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 2,
  },
  timestamp: {
    fontSize: 11,
  },
});
