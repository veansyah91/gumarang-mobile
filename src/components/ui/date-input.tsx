import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, radius, spacing } from '@/src/theme/tokens';

import { Text } from './text';

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeDate: (value: string) => void;
};

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function parseDateValue(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toMonthCursor(value: string) {
  const parsed = parseDateValue(value);
  return parsed ?? new Date();
}

function DateGrid({
  cursor,
  value,
  onSelect,
}: {
  cursor: Date;
  value: string;
  onSelect: (value: string) => void;
}) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstDay.getDay();
  const selectedValue = value;
  const todayValue = formatDateValue(new Date());

  const cells = [
    ...Array.from({ length: leadingBlanks }, (_, index) => ({
      key: `blank-${index}`,
    })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const cellDate = new Date(year, month, day);
      const cellValue = formatDateValue(cellDate);
      return {
        key: cellValue,
        day,
        cellValue,
      };
    }),
  ];

  return (
    <View style={styles.grid}>
      {WEEKDAYS.map((weekday) => (
        <Text key={weekday} tone="muted" style={styles.weekday}>
          {weekday}
        </Text>
      ))}
      {cells.map((cell) => {
        if (!('day' in cell)) {
          return <View key={cell.key} style={styles.dayCell} />;
        }

        const isSelected = cell.cellValue === selectedValue;
        const isToday = cell.cellValue === todayValue;

        return (
          <Pressable
            key={cell.key}
            onPress={() => onSelect(cell.cellValue)}
            style={({ pressed }) => [
              styles.dayCell,
              {
                borderColor: isSelected ? colors.primary : colors.border,
                backgroundColor: isSelected ? colors.primary : colors.surface,
                opacity: pressed ? 0.85 : 1,
              },
              isToday && !isSelected ? styles.todayCell : null,
            ]}
          >
            <Text
              style={[
                styles.dayText,
                { color: isSelected ? colors.background : colors.text },
              ]}
            >
              {cell.day}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function DateInput({
  label,
  placeholder = 'Pilih tanggal',
  value,
  onChangeDate,
}: Props) {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const [visible, setVisible] = useState(false);
  const [cursor, setCursor] = useState(() => toMonthCursor(value));

  const displayValue = useMemo(() => value || placeholder, [placeholder, value]);

  const open = () => {
    setCursor(toMonthCursor(value));
    setVisible(true);
  };

  const close = () => setVisible(false);

  const moveMonth = (delta: number) => {
    setCursor(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + delta, 1),
    );
  };

  return (
    <>
      <View style={styles.container}>
        {label ? <Text variant="eyebrow">{label}</Text> : null}
        <Pressable
          accessibilityRole="button"
          onPress={open}
          style={[
            styles.inputRow,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text tone={value ? 'default' : 'muted'} style={styles.inputText}>
            {displayValue}
          </Text>
          <Ionicons name="calendar-outline" size={18} color={colors.muted} />
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={visible}
        onRequestClose={close}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => moveMonth(-1)} hitSlop={8}>
                <Ionicons
                  name="chevron-back-outline"
                  size={20}
                  color={colors.text}
                />
              </Pressable>
              <Text variant="subtitle">
                {cursor.toLocaleDateString('id-ID', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <Pressable onPress={() => moveMonth(1)} hitSlop={8}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color={colors.text}
                />
              </Pressable>
            </View>

            <DateGrid
              cursor={cursor}
              value={value}
              onSelect={(nextValue) => {
                onChangeDate(nextValue);
                setVisible(false);
              }}
            />

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  onChangeDate('');
                  setVisible(false);
                }}
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text>Tidak ada</Text>
              </Pressable>
              <Pressable
                onPress={close}
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text>Tutup</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  inputText: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  weekday: {
    width: '14.2857%',
    textAlign: 'center',
    fontSize: 12,
  },
  dayCell: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
  },
  dayText: {
    fontWeight: '600',
  },
  todayCell: {
    borderStyle: 'dashed',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  actionButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
