import { StyleSheet, View } from 'react-native';

import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, radius } from '@/src/theme/tokens';

type Props = {
  height?: number;
};

export function Skeleton({ height = 48 }: Props) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  return <View style={[styles.skeleton, { backgroundColor: colors.border, height }]} />;
}

const styles = StyleSheet.create({
  skeleton: {
    borderRadius: radius.md,
    width: '100%',
  },
});
