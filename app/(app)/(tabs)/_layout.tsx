import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';

import { Header } from '@/src/components/ui/header';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { useAuthStore } from '@/src/state/auth-store';
import { palette } from '@/src/theme/tokens';

function TabIcon({
  name,
  color,
  type = 'ionicons',
}: {
  name: any;
  color: string;
  type?: 'ionicons' | 'material';
}) {
  if (type === 'material') {
    return <MaterialCommunityIcons name={name} size={22} color={color} />;
  }
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
        sceneStyle: { backgroundColor: colors.background },
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
        name="catalog"
        options={{
          title: 'Katalog',
          tabBarIcon: ({ color }) => (
            <TabIcon name="ring" color={color} type="material" />
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
