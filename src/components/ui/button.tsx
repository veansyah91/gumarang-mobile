import { Pressable, StyleSheet, View } from 'react-native';

import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, radius, spacing } from '@/src/theme/tokens';

import { Text } from './text';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type Props = {
  label: string;
  onPress?: () => void | Promise<void>;
  disabled?: boolean;
  variant?: ButtonVariant;
};

export function Button({ label, onPress, disabled, variant = 'primary' }: Props) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const backgroundColor =
    variant === 'secondary' ? colors.surface : variant === 'danger' ? colors.danger : colors.primary;
  const borderColor = variant === 'secondary' ? colors.border : backgroundColor;
  const textColor = variant === 'secondary' ? colors.text : '#FFFFFF';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <View>
        <Text style={{ color: textColor, fontWeight: '700' }}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
