import { Image, StyleSheet, View } from 'react-native';

import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { useAuthStore } from '@/src/state/auth-store';
import { palette, spacing } from '@/src/theme/tokens';

const logo = require('@/assets/images/logo.png');

export function Header() {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const { status, user } = useAuthStore();

  const isAuthenticated = status === 'authenticated' && !!user;
  const displayName = isAuthenticated ? user!.name : 'TOKO MAS GUMARANG';
  const displayPhone = isAuthenticated ? (user!.phone ?? '-') : null;

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
});
