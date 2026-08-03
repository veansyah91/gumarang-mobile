import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, radius, spacing } from '@/src/theme/tokens';

import { Text } from './text';

type Mode = 'year' | 'month' | 'day';

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeDate: (value: string) => void;
  error?: boolean;
};

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des',
];

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

  const cells: { key: string; day?: number; cellValue?: string }[] = [
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

        const cellValue = cell.cellValue!;
        const isSelected = cellValue === selectedValue;
        const isToday = cellValue === todayValue;

        return (
          <Pressable
            key={cell.key}
            onPress={() => onSelect(cellValue)}
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
                styles.cellText,
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

function YearGrid({
  cursor,
  onSelect,
}: {
  cursor: Date;
  onSelect: (year: number) => void;
}) {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const cursorYear = cursor.getFullYear();

  const years = Array.from({ length: 12 }, (_, i) => cursorYear - 5 + i);

  return (
    <View style={styles.grid4Col}>
      {years.map((year) => {
        const isActive = year === cursorYear;
        return (
          <Pressable
            key={year}
            onPress={() => onSelect(year)}
            style={({ pressed }) => [
              styles.grid4ColCell,
              {
                borderColor: isActive ? colors.primary : colors.border,
                backgroundColor: isActive ? colors.primary : colors.surface,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.cellText,
                { color: isActive ? colors.background : colors.text },
              ]}
            >
              {year}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MonthGrid({
  cursor,
  onSelect,
}: {
  cursor: Date;
  onSelect: (month: number) => void;
}) {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const cursorMonth = cursor.getMonth();

  return (
    <View style={styles.grid4Col}>
      {MONTHS_SHORT.map((name, index) => {
        const isActive = index === cursorMonth;
        return (
          <Pressable
            key={name}
            onPress={() => onSelect(index)}
            style={({ pressed }) => [
              styles.grid4ColCell,
              {
                borderColor: isActive ? colors.primary : colors.border,
                backgroundColor: isActive ? colors.primary : colors.surface,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.cellText,
                { color: isActive ? colors.background : colors.text },
              ]}
            >
              {name}
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
  error,
}: Props) {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const [visible, setVisible] = useState(false);
  const [cursor, setCursor] = useState(() => toMonthCursor(value));
  const [mode, setMode] = useState<Mode>('day');

  const displayValue = useMemo(
    () => value || placeholder,
    [placeholder, value],
  );

  const open = () => {
    setCursor(toMonthCursor(value));
    setMode('day');
    setVisible(true);
  };

  const close = () => setVisible(false);

  const moveCursor = (delta: number) => {
    setCursor((current) => {
      if (mode === 'year') {
        return new Date(current.getFullYear() + delta * 10, current.getMonth(), 1);
      }
      if (mode === 'month') {
        return new Date(current.getFullYear() + delta, current.getMonth(), 1);
      }
      return new Date(current.getFullYear(), current.getMonth() + delta, 1);
    });
  };

  const goBack = () => {
    if (mode === 'year') {
      setMode('day');
    } else if (mode === 'month') {
      setMode('year');
    }
  };

  const headerTitle =
    mode === 'day'
      ? cursor.toLocaleDateString('id-ID', {
          month: 'long',
          year: 'numeric',
        })
      : String(cursor.getFullYear());

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
              borderColor: error ? colors.danger : colors.border,
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
              <View style={styles.headerLeft}>
                {mode !== 'day' && (
                  <Pressable onPress={goBack} hitSlop={8} style={styles.headerIconButton}>
                    <Ionicons
                      name="chevron-back"
                      size={20}
                      color={colors.text}
                    />
                  </Pressable>
                )}
                <Pressable onPress={() => moveCursor(-1)} hitSlop={8} style={styles.headerIconButton}>
                  <Ionicons
                    name="chevron-back-outline"
                    size={20}
                    color={colors.text}
                  />
                </Pressable>
              </View>

              <Pressable
                onPress={mode === 'day' ? () => setMode('year') : goBack}
              >
                <Text variant="subtitle">{headerTitle}</Text>
              </Pressable>

              <Pressable onPress={() => moveCursor(1)} hitSlop={8} style={styles.headerIconButton}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color={colors.text}
                />
              </Pressable>
            </View>

            {mode === 'year' && (
              <YearGrid
                cursor={cursor}
                onSelect={(year) => {
                  setCursor(new Date(year, cursor.getMonth(), 1));
                  setMode('month');
                }}
              />
            )}

            {mode === 'month' && (
              <MonthGrid
                cursor={cursor}
                onSelect={(month) => {
                  setCursor(new Date(cursor.getFullYear(), month, 1));
                  setMode('day');
                }}
              />
            )}

            {mode === 'day' && (
              <DateGrid
                cursor={cursor}
                value={value}
                onSelect={(nextValue) => {
                  onChangeDate(nextValue);
                  setVisible(false);
                }}
              />
            )}

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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerIconButton: {
    padding: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  grid4Col: {
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
  grid4ColCell: {
    width: '25%',
    aspectRatio: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
  },
  cellText: {
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
