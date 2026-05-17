import { StyleSheet, View } from 'react-native';

import { Screen } from '@/src/components/ui/screen';
import { Text } from '@/src/components/ui/text';
import { spacing } from '@/src/theme/tokens';

type Props = {
  title: string;
  description: string;
};

export function MemberSectionScreen({ title, description }: Props) {
  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.body}>
        <Text variant="title">{title}</Text>
        <Text tone="muted" style={styles.description}>
          {description}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  description: {
    textAlign: 'center',
  },
});
