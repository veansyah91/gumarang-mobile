import { memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, radius, spacing } from '@/src/theme/tokens';
import { Text } from './text';

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'success'
  | 'warning'
  | 'danger';

type Props = {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
};

function BadgeComponent({ label, variant = 'default', style }: Props) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const getStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: theme === 'light' ? '#F1F5F9' : '#1E293B',
          borderColor: 'transparent',
          textColor: colors.text,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.border,
          textColor: colors.text,
        };
      case 'success':
        return {
          backgroundColor: colors.success + '20',
          borderColor: 'transparent',
          textColor: colors.success,
        };
      case 'warning':
        return {
          backgroundColor: colors.warning + '20',
          borderColor: 'transparent',
          textColor: colors.warning,
        };
      case 'danger':
        return {
          backgroundColor: colors.danger + '20',
          borderColor: 'transparent',
          textColor: colors.danger,
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: 'transparent',
          textColor: '#FFFFFF',
        };
    }
  };

  const { backgroundColor, borderColor, textColor } = getStyles();

  return (
    <View style={[styles.badge, { backgroundColor, borderColor }, style]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
  },
});

export const Badge = memo(BadgeComponent);
