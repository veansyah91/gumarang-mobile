import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { Header } from '@/src/components/ui/header';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { useAuthStore } from '@/src/state/auth-store';
import { palette, spacing } from '@/src/theme/tokens';

function TabIcon({
  name,
  color,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons name={name} size={22} color={color} />;
}

export default function TabsLayout() {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const user = useAuthStore((state) => state.user);

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        header: () => <Header />,
        sceneStyle: {
          backgroundColor: colors.background,
          paddingBottom: -spacing.xl,
          marginBottom: -spacing.xl,
        },
        tabBarStyle: user
          ? { backgroundColor: colors.surface, borderTopColor: colors.border }
          : { display: 'none' },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dasbor',
          tabBarIcon: ({ color }) => (
            <TabIcon name="grid-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-gold"
        options={{
          title: 'Emasku',
          tabBarIcon: ({ color }) => (
            <TabIcon name="cash-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="saving"
        options={{
          title: 'Tabunganku',
          tabBarIcon: ({ color }) => (
            <TabIcon name="book-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => (
            <TabIcon name="person-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
