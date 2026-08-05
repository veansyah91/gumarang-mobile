import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/src/components/ui/skeleton';
import { spacing } from '@/src/theme/tokens';

type Props = {
  count?: number;
  height?: number;
};

export function ListSkeleton({ count = 4, height = 80 }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
});
