import NetInfo from '@react-native-community/netinfo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { registerUnauthorizedHandler } from '@/src/services/api/client';
import { useAppStore } from '@/src/state/app-store';
import { useAuthStore } from '@/src/state/auth-store';
import { palette } from '@/src/theme/tokens';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
  },
});

function NavigationThemeProvider({ children }: PropsWithChildren) {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const navigationTheme = useMemo(
    () => ({
      ...(theme === 'dark' ? DarkTheme : DefaultTheme),
      colors: {
        ...(theme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
        background: colors.background,
        border: colors.border,
        card: colors.surface,
        primary: colors.primary,
        text: colors.text,
      },
    }),
    [colors, theme],
  );

  return <ThemeProvider value={navigationTheme}>{children}</ThemeProvider>;
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationThemeProvider>{children}</NavigationThemeProvider>
    </QueryClientProvider>
  );
}

export function useAppBootstrap() {
  const [isReady, setIsReady] = useState(false);
  const bootstrapApp = useAppStore((state) => state.bootstrap);
  const setNetworkOnline = useAppStore((state) => state.setNetworkOnline);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const handleUnauthorized = useAuthStore((state) => state.handleUnauthorized);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      void handleUnauthorized();
    });
  }, [handleUnauthorized]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });

    return unsubscribe;
  }, [setNetworkOnline]);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      await Promise.all([bootstrapApp(), restoreSession()]);

      if (mounted) {
        setIsReady(true);
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [bootstrapApp, restoreSession]);

  return isReady;
}
