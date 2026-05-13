export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const palette = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    muted: '#64748B',
    border: '#E2E8F0',
    primary: '#D97706',
    danger: '#DC2626',
    success: '#15803D',
    warning: '#B45309',
  },
  dark: {
    background: '#020617',
    surface: '#0F172A',
    text: '#F8FAFC',
    muted: '#94A3B8',
    border: '#1E293B',
    primary: '#F59E0B',
    danger: '#F87171',
    success: '#4ADE80',
    warning: '#FBBF24',
  },
} as const;

export type ThemeMode = keyof typeof palette;
