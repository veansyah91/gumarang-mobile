import { StyleSheet, View } from 'react-native';

import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, spacing } from '@/src/theme/tokens';

export default function CatalogScreen() {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text variant="title">Katalog Perhiasan</Text>
      <Text style={[styles.text, { color: colors.text }]}>
        Halaman sedang dalam pengembangan
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});
