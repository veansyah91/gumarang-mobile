import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useLayoutEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/src/components/ui/screen';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { memberApi } from '@/src/services/api/member';
import { useAuthStore } from '@/src/state/auth-store';
import { palette, spacing } from '@/src/theme/tokens';
import type { NotificationItem } from '@/src/types/member';

export default function MoreScreen() {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const router = useRouter();
  const { status, user } = useAuthStore();
  const isAuthenticated = status === 'authenticated' && !!user;
  const navigation: any = useNavigation();

  useLayoutEffect(() => {
    if (user) {
      // set the back button title and header title to the user's full name
      navigation.setOptions({ headerBackTitle: user.name, title: user.name });
    } else {
      // fallback title when user not available
      navigation.setOptions({ title: 'More' });
    }
  }, [navigation, user]);

  useEffect(() => {
    // If the user is not authenticated, redirect to login
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const { data: notificationList } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => memberApi.getNotifications(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  const unreadCount =
    notificationList?.data?.filter((n: NotificationItem) => !n.read_at)
      .length ?? 0;

  const items = [
    {
      title: 'Profil',
      icon: 'person-outline' as const,
      onPress: () => router.push('/profile'),
    },
    {
      title: 'Notifikasi',
      icon: 'notifications-outline' as const,
      onPress: () => router.push('/notifications'),
      badge: unreadCount,
    },
    {
      title: 'Atur Uang',
      icon: 'cash-outline' as const,
      onPress: () => router.push('/personal-finance'),
    },
  ];

  return (
    <Screen safeAreaEdges={['top', 'left', 'right']} scrollable>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.list}>
          {items.map((it) => (
            <Pressable
              key={it.title}
              onPress={it.onPress}
              style={({ pressed }) => [
                styles.item,
                { backgroundColor: colors.surface, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <View style={styles.itemInner}>
                <Ionicons name={it.icon} size={22} color={colors.primary} />
                <Text style={styles.itemText}>{it.title}</Text>
                {it.badge ? (
                  <View
                    style={[styles.badge, { backgroundColor: colors.primary }]}
                  >
                    <Text
                      style={[styles.badgeText, { color: colors.background }]}
                    >
                      {it.badge > 9 ? '9+' : it.badge}
                    </Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    borderRadius: 12,
    padding: spacing.md,
  },
  itemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
