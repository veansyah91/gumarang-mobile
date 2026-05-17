import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, radius, spacing } from '@/src/theme/tokens';

type SubnavProps = {
  searchValue: string;
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  onFilterPress?: () => void;
  currentPage: number;
  lastPage: number;
  from: number | null | undefined;
  to: number | null | undefined;
  total: number | null | undefined;
  onPrev: () => void;
  onNext: () => void;
  prevLabel?: string;
  nextLabel?: string;
};

function formatPageInfo(
  from: number | null | undefined,
  to: number | null | undefined,
  total: number | null | undefined,
) {
  return `${from ?? 0}-${to ?? 0} dari ${(total ?? 0).toLocaleString('id-ID')}`;
}

function SearchField({
  value,
  placeholder,
  onChangeText,
  onClear,
}: {
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  onClear: () => void;
}) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  return (
    <View
      style={[
        styles.searchField,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Ionicons name="search-outline" size={18} color={colors.muted} />
      <TextInput
        autoFocus
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        style={[styles.searchInput, { color: colors.text }]}
      />
      {value ? (
        <Pressable onPress={onClear} hitSlop={8}>
          <Ionicons
            name="close-circle-outline"
            size={18}
            color={colors.muted}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

export function Subnav({
  searchValue,
  searchPlaceholder = 'Cari',
  onSearchChange,
  onSearchClear,
  onFilterPress,
  currentPage,
  lastPage,
  from,
  to,
  total,
  onPrev,
  onNext,
  prevLabel = 'Prev',
  nextLabel = 'Next',
}: SubnavProps) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const canPrev = currentPage > 1;
  const canNext = currentPage < lastPage;

  return (
    <View
      style={[
        styles.subnavCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.controlsRow}>
        <View style={styles.searchWrapper}>
          <SearchField
            value={searchValue}
            placeholder={searchPlaceholder}
            onChangeText={onSearchChange}
            onClear={onSearchClear}
          />
        </View>

        {onFilterPress ? (
          <Pressable
            accessibilityRole="button"
            onPress={onFilterPress}
            style={({ pressed }) => [
              styles.iconButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons name="filter-outline" size={18} color={colors.text} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.paginationRow}>
        <Pressable
          accessibilityRole="button"
          disabled={!canPrev}
          onPress={onPrev}
          style={({ pressed }) => [
            styles.paginationButton,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
              opacity: !canPrev ? 0.45 : pressed ? 0.85 : 1,
            },
          ]}
        >
          <Ionicons name="chevron-back-outline" size={16} color={colors.text} />
          <Text style={styles.paginationButtonText}>{prevLabel}</Text>
        </Pressable>

        <Text tone="muted" style={styles.pageInfo}>
          {formatPageInfo(from, to, total)}
        </Text>

        <Pressable
          accessibilityRole="button"
          disabled={!canNext}
          onPress={onNext}
          style={({ pressed }) => [
            styles.paginationButton,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
              opacity: !canNext ? 0.45 : pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={styles.paginationButtonText}>{nextLabel}</Text>
          <Ionicons
            name="chevron-forward-outline"
            size={16}
            color={colors.text}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  subnavCard: {
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  searchWrapper: {
    flex: 1,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: 36,
  },
  paginationButtonText: {
    fontWeight: '700',
  },
  pageInfo: {
    flex: 1,
    textAlign: 'center',
  },
});
