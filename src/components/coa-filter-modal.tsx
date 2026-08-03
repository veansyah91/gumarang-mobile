import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, radius, spacing } from '@/src/theme/tokens';
import type { AccountType } from '@/src/types/account';

export type CoaFilterDraft = {
  search: string;
  type: AccountType | '';
  isActive: boolean;
};

const TYPE_OPTIONS: { label: string; value: AccountType | '' }[] = [
  { label: 'Aset', value: 'asset' },
  { label: 'Liabilitas', value: 'liability' },
  { label: 'Ekuitas', value: 'equity' },
  { label: 'Pendapatan', value: 'income' },
  { label: 'Beban', value: 'expense' },
];

export function createEmptyCoaFilterDraft(): CoaFilterDraft {
  return {
    search: '',
    type: '',
    isActive: true,
  };
}

export function CoaFilterModal({
  visible,
  draft,
  onChangeDraft,
  onClose,
  onSubmit,
  onReset,
}: {
  visible: boolean;
  draft: CoaFilterDraft;
  onChangeDraft: (draft: CoaFilterDraft) => void;
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
            label="Cari akun"
            value={draft.search}
            onChangeText={(text) =>
              onChangeDraft({ ...draft, search: text })
            }
            placeholder="Nama atau no. referensi"
          />

          <Text variant="eyebrow">Tipe Akun</Text>
          <View style={styles.presetRow}>
            {TYPE_OPTIONS.map((opt) => {
              const isActive = draft.type === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() =>
                    onChangeDraft({
                      ...draft,
                      type: draft.type === opt.value ? '' : opt.value,
                    })
                  }
                  style={({ pressed }) => [
                    styles.presetChip,
                    {
                      borderColor: isActive ? colors.primary : colors.border,
                      backgroundColor: isActive
                        ? colors.primary
                        : colors.surface,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetLabel,
                      { color: isActive ? colors.background : colors.text },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => onChangeDraft({ ...draft, isActive: !draft.isActive })}
            style={styles.toggleRow}
          >
            <Ionicons
              name={draft.isActive ? 'checkbox' : 'square-outline'}
              size={20}
              color={draft.isActive ? colors.primary : colors.muted}
            />
            <Text tone={draft.isActive ? 'default' : 'muted'}>
              Aktif saja
            </Text>
          </Pressable>

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
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  presetChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
});
