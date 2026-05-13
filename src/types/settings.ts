import type { ThemeMode } from '@/src/theme/tokens';

export type ThemePreference = ThemeMode | 'system';

export type AppSettings = {
  themePreference: ThemePreference;
  offlineSyncEnabled: boolean;
  skeletonEnabled: boolean;
};
