import { type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, radius, spacing } from '@/src/theme/tokens';

import { Text } from './text';

type Props = TextInputProps & {
  label?: string;
  rightElement?: ReactNode;
};

export function Input({ label, style, rightElement, ...props }: Props) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  return (
    <View style={styles.container}>
      {label ? <Text variant="eyebrow">{label}</Text> : null}
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <TextInput
          placeholderTextColor={colors.muted}
          {...props}
          style={[styles.input, { color: colors.text }, style]}
        />
        {rightElement ? (
          <View style={styles.rightElement}>{rightElement}</View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  rightElement: {
    marginLeft: spacing.sm,
  },
});
