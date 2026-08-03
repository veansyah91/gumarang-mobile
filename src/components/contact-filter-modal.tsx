import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, radius, spacing } from '@/src/theme/tokens';

export type ContactFilterDraft = {
  search: string;
};

export function createEmptyContactFilterDraft(): ContactFilterDraft {
  return {
    search: '',
  };
}

export function ContactFilterModal({
  visible,
  draft,
  onChangeDraft,
  onClose,
  onSubmit,
  onReset,
}: {
  visible: boolean;
  draft: ContactFilterDraft;
  onChangeDraft: (draft: ContactFilterDraft) => void;
  onClose: () => void;
  onSubmit: () => void;
  onReset: () => void;
}) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          <Text variant="subtitle">Filter</Text>

          <Input
            label="Cari kontak"
            value={draft.search}
            onChangeText={(text) =>
              onChangeDraft({ ...draft, search: text })
            }
            placeholder="Nama atau telepon"
          />

          <View style={styles.modalActions}>
            <Button
              label="Reset"
              variant="secondary"
              onPress={onReset}
            />
            <Button
              label="Terapkan"
              onPress={onSubmit}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  modalCard: {
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
});
