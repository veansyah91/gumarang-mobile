import { StyleSheet } from 'react-native';

import { Footer } from '@/src/components/footer';
import { LoginCard } from '@/src/components/login-card';
import { MemberDashboard } from '@/src/components/member-dashboard';
import { PricelistCard } from '@/src/components/pricelist-card';
import { Screen } from '@/src/components/ui/screen';
import { useAuthStore } from '@/src/state/auth-store';
import { spacing } from '@/src/theme/tokens';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <Screen
      scrollable
      contentContainerStyle={styles.content}
      safeAreaEdges={['top', 'left', 'right']}
    >
      <PricelistCard />
      {user ? (
        <MemberDashboard />
      ) : (
        <>
          <LoginCard />
          <Footer />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
});
