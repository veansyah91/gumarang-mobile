import { useColorScheme } from 'react-native';

import { useAppStore } from '@/src/state/app-store';
import type { ThemeMode } from '@/src/theme/tokens';

export function useResolvedTheme(): ThemeMode {
  const preference = useAppStore((state) => state.settings.themePreference);
  const systemTheme = useColorScheme();

  if (preference === 'system') {
    return systemTheme === 'dark' ? 'dark' : 'light';
  }

  return preference;
}
