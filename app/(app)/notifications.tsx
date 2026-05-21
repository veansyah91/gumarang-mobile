import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { Screen } from '@/src/components/ui/screen';
import { Text } from '@/src/components/ui/text';
import { memberApi } from '@/src/services/api/member';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, spacing } from '@/src/theme/tokens';
import type { NotificationItem } from '@/src/types/member';
import type { ThemeMode } from '@/src/theme/tokens';

function NotificationListItem({
  item,
  theme,
}: {
  item: NotificationItem;
  theme: ThemeMode;
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
  );
}

export default function NotificationsScreen() {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const queryClient = useQueryClient();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await memberApi.getNotifications();
      setNotifications(data.data);

      await memberApi.markAllNotificationsAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (err) {
      console.error('[notifications] Failed to load:', err);
      setError('Gagal memuat notifikasi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  useFocusEffect(
    useCallback(() => {
      void loadNotifications();
    }, [loadNotifications]),
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
          <NotificationListItem item={item} theme={theme} />
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
