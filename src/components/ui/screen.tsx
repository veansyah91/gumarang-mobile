import { type PropsWithChildren, type ReactElement } from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    type RefreshControlProps,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, spacing } from '@/src/theme/tokens';

type Props = PropsWithChildren<{
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshControl?: ReactElement<RefreshControlProps>;
}>;

export function Screen({
  children,
  scrollable,
  contentContainerStyle,
  refreshControl,
}: Props) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  if (scrollable) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <ScrollView
          contentContainerStyle={[styles.content, contentContainerStyle]}
          refreshControl={refreshControl}
          style={styles.flex}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.content, contentContainerStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xs,
  },
});
