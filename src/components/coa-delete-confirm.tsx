import { Modal, StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/ui/button';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, radius, spacing } from '@/src/theme/tokens';

type Props = {
  visible: boolean;
  accountName: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isDeleting?: boolean;
};

export function CoaDeleteConfirm({
  visible,
  accountName,
  onClose,
  onConfirm,
  isDeleting,
}: Props) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[styles.dialog, { backgroundColor: colors.surface }]}
        >
          <Text variant="subtitle">Hapus Akun</Text>
          <Text tone="muted" style={styles.message}>
            Yakin ingin menghapus akun &quot;{accountName}&quot;?
          </Text>

          <View style={styles.actions}>
            <Button
              variant="secondary"
              label="Batal"
              onPress={onClose}
              disabled={isDeleting}
            />
            <Button
              variant="danger"
              label={isDeleting ? 'Menghapus...' : 'Hapus'}
              onPress={onConfirm}
              disabled={isDeleting}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  message: {
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
