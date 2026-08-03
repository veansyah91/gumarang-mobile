import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { LogBox } from 'react-native';

import { AppProviders, useAppBootstrap } from '@/src/providers/app-providers';
import { NotificationProvider } from '@/src/providers/notification-provider';
import { useAuthStore } from '@/src/state/auth-store';
import { ToastContainer } from '@/src/components/ui/toast';

LogBox.ignoreLogs(['props.pointerEvents is deprecated']);

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function RootNavigator() {
  const isReady = useAppBootstrap();
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (isReady && status !== 'restoring') {
      SplashScreen.hideAsync();
    }
  }, [isReady, status]);

  if (!isReady || status === 'restoring') {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <NotificationProvider>
        <RootNavigator />
        <ToastContainer />
      </NotificationProvider>
    </AppProviders>
  );
}
