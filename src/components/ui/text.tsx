import { memo } from 'react';
import { StyleSheet, Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, spacing } from '@/src/theme/tokens';

type TextVariant = 'body' | 'eyebrow' | 'subtitle' | 'title';
type TextTone = 'default' | 'muted' | 'danger' | 'success' | 'warning';

type Props = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
};

const variantStyles = StyleSheet.create({
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: spacing.xs,
  },
});

function TextComponent({ style, variant = 'body', tone = 'default', ...props }: Props) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const toneColor =
    tone === 'muted'
      ? colors.muted
      : tone === 'danger'
        ? colors.danger
        : tone === 'success'
          ? colors.success
          : tone === 'warning'
            ? colors.warning
            : colors.text;

  return <RNText {...props} style={[variantStyles[variant], { color: toneColor }, style]} />;
}

export const Text = memo(TextComponent);
