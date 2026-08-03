import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { memberApi } from '@/src/services/api/member';
import { useAuthStore } from '@/src/state/auth-store';
import { palette, spacing } from '@/src/theme/tokens';
import type { NotificationItem } from '@/src/types/member';

const logo = require('@/assets/images/logo.png');

function getInitials(name: string) {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getColorForUser(name: string) {
  const colors = [
    '#f97316',
    '#ef4444',
    '#f59e0b',
    '#10b981',
    '#3b82f6',
    '#8b5cf6',
    '#06b6d4',
  ];
  if (!name) return colors[0];
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function Header() {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const { status, user } = useAuthStore();
  const router = useRouter();
  const [canFetch, setCanFetch] = useState(false);

  useEffect(() => {
    setCanFetch(true);
  }, []);

  const isAuthenticated = status === 'authenticated' && !!user;
  const displayName = isAuthenticated ? user!.name : 'TOKO MAS GUMARANG';
  const displayPhone = isAuthenticated ? (user!.phone ?? '-') : null;

  const { data: notificationList } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => memberApi.getNotifications(),
    enabled: canFetch && isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const notificationsArray: NotificationItem[] = Array.isArray(notificationList)
    ? (notificationList as unknown as NotificationItem[])
    : ((notificationList?.data as NotificationItem[]) ?? []);

  const unreadCount = notificationsArray.filter((n) => !n.read_at).length ?? 0;

  const handleNotificationPress = () => {
    router.push('/notifications');
  };

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: colors.background },
        isAuthenticated ? styles.headerAuthenticated : styles.headerGuest,
      ]}
    >
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      {isAuthenticated && (
        <Pressable
          onPress={() => router.push('/more')}
          style={({ pressed }) => [
            styles.avatarButton,
            { backgroundColor: getColorForUser(user!.name) },
            {
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
          hitSlop={8}
        >
          <Text style={styles.avatarText}>{getInitials(user!.name)}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingTop: spacing.xl,
    marginTop: spacing.md,
    paddingBottom: -spacing.xl,
    marginBottom: -spacing.md,
  },
  headerAuthenticated: {
    justifyContent: 'space-between',
  },
  headerGuest: {
    justifyContent: 'flex-start',
  },
  logo: {
    width: 40,
    height: 40,
  },
  userInfo: {
    marginLeft: spacing.md,
  },
  userInfoAuthenticated: {
    flex: 1,
    alignItems: 'flex-end',
  },
  userInfoGuest: {
    flex: 0,
    alignItems: 'flex-start',
  },
  userNameAuthenticated: {
    fontSize: 16,
    fontWeight: '500',
  },
  userNameGuest: {
    fontSize: 24,
    fontWeight: '700',
  },
  phone: {
    fontSize: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: spacing.sm,
    marginRight: -spacing.sm,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 20,
    textAlignVertical: 'center',
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.sm,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
  },
});
