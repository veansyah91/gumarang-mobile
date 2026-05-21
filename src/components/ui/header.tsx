import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { memberApi } from '@/src/services/api/member';
import { useAuthStore } from '@/src/state/auth-store';
import { palette, spacing } from '@/src/theme/tokens';
import type { NotificationItem } from '@/src/types/member';

const logo = require('@/assets/images/logo.png');

export function Header() {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const { status, user } = useAuthStore();
  const router = useRouter();

  const isAuthenticated = status === 'authenticated' && !!user;
  const displayName = isAuthenticated ? user!.name : 'TOKO MAS GUMARANG';
  const displayPhone = isAuthenticated ? (user!.phone ?? '-') : null;

  const { data: notificationList } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => memberApi.getNotifications(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const unreadCount = notificationList?.data?.filter((n: NotificationItem) => !n.read_at).length ?? 0;

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
      <View
        style={[
          styles.userInfo,
          isAuthenticated ? styles.userInfoAuthenticated : styles.userInfoGuest,
        ]}
      >
        <Text
          style={
            isAuthenticated
              ? styles.userNameAuthenticated
              : styles.userNameGuest
          }
        >
          {displayName}
        </Text>
        {displayPhone ? (
          <Text style={styles.phone} tone="muted">
            {displayPhone}
          </Text>
        ) : null}
      </View>
      {isAuthenticated && (
        <Pressable
          onPress={handleNotificationPress}
          style={styles.notificationButton}
          hitSlop={8}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color={colors.primary}
          />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.badgeText, { color: colors.background }]}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
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
});
