import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/ui/button';
import { DateInput } from '@/src/components/ui/date-input';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, radius, spacing } from '@/src/theme/tokens';

export type BaseFilterDraft = {
  startDate: string;
  endDate: string;
  selectedPreset: string;
};

export type Preset = { key: string; label: string };
export const PRESETS: Preset[] = [
  { key: 'today', label: 'Hari Ini' },
  { key: 'thisWeek', label: 'Minggu Ini' },
  { key: 'thisMonth', label: 'Bulan Ini' },
  { key: 'thisYear', label: 'Tahun Ini' },
  { key: 'custom', label: 'Kustom' },
];

export function createEmptyBaseFilterDraft(): BaseFilterDraft {
  return {
    startDate: '',
    endDate: '',
    selectedPreset: '',
  };
}

export function computeDateRange(
  preset: string,
): { startDate: string; endDate: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  switch (preset) {
    case 'today':
      return { startDate: todayStr, endDate: todayStr };
    case 'thisWeek': {
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(now);
      monday.setDate(now.getDate() - diff);
      const my = monday.getFullYear();
      const mm = String(monday.getMonth() + 1).padStart(2, '0');
      const md = String(monday.getDate()).padStart(2, '0');
      return { startDate: `${my}-${mm}-${md}`, endDate: todayStr };
    }
    case 'thisMonth':
      return { startDate: `${y}-${m}-01`, endDate: todayStr };
    case 'thisYear':
      return { startDate: `${y}-01-01`, endDate: todayStr };
    default:
      return { startDate: '', endDate: '' };
  }
}

type Props<T extends BaseFilterDraft> = {
  visible: boolean;
  draft: T;
  onChangeDraft: (draft: T) => void;
  onClose: () => void;
  onSubmit: () => void;
  onReset: () => void;
  title?: string;
  submitLabel?: string;
  extraFields?: ReactNode;
};

export function BaseFilterModal<T extends BaseFilterDraft>({
  visible,
  draft,
  onChangeDraft,
  onClose,
  onSubmit,
  onReset,
  title = 'Filter',
  submitLabel = 'Terapkan',
  extraFields,
}: Props<T>) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const handlePresetPress = (preset: string) => {
    const range = computeDateRange(preset);
    onChangeDraft({
      ...draft,
      selectedPreset: preset,
      startDate: range.startDate,
      endDate: range.endDate,
    });
  };

  const isCustom = draft.selectedPreset === 'custom';

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
          <Text variant="subtitle">{title}</Text>

          {extraFields}

          <Text variant="eyebrow">Tanggal</Text>
          <View style={styles.presetRow}>
            {PRESETS.map((p) => {
              const isActive = draft.selectedPreset === p.key;
              return (
                <Pressable
                  key={p.key}
                  onPress={() => handlePresetPress(p.key)}
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
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {isCustom && (
            <View style={styles.customRow}>
              <View style={styles.dateField}>
                <DateInput
                  label="Tanggal Awal"
                  value={draft.startDate}
                  onChangeDate={(val) =>
                    onChangeDraft({ ...draft, startDate: val })
                  }
                />
              </View>
              <View style={styles.dateField}>
                <DateInput
                  label="Tanggal Akhir"
                  value={draft.endDate}
                  onChangeDate={(val) =>
                    onChangeDraft({ ...draft, endDate: val })
                  }
                />
              </View>
            </View>
          )}

          <View style={styles.modalActions}>
            <Button label="Reset" variant="secondary" onPress={onReset} />
            <Button label={submitLabel} onPress={onSubmit} />
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
  customRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateField: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
});
