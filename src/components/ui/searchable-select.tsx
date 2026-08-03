import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, radius, spacing } from '@/src/theme/tokens';

import { Text } from './text';
import type { SelectOption } from './select-input';

type SearchableSelectProps = {
  label: string;
  value: string | number;
  options: SelectOption[];
  onChange: (value: string | number) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  loading?: boolean;
  placeholder?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
};

export function SearchableSelect({
  label,
  value,
  options,
  onChange,
  searchText,
  onSearchChange,
  loading,
  placeholder = 'Cari akun induk...',
  emptyActionLabel,
  onEmptyAction,
}: SearchableSelectProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const selectedLabel = options.find((o) => o.value === value)?.label ?? '';

  const showDropdown =
    isFocused && (loading || options.length > 0 || searchText.length > 0);

  const handleOptionSelect = (option: SelectOption) => {
    onChange(option.value);
    onSearchChange(option.label);
    setIsFocused(false);
  };

  return (
    <View>
      <Text variant="eyebrow">{label}</Text>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.surface,
            borderColor: isFocused ? colors.primary : colors.border,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          value={searchText}
          onChangeText={onSearchChange}
          placeholder={selectedLabel || placeholder}
          placeholderTextColor={colors.muted}
          onFocus={() => setIsFocused(true)}
          style={[styles.input, { color: colors.text }]}
        />
      </Pressable>

      {showDropdown && (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={[
            styles.dropdown,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : options.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text tone="muted">Tidak ada hasil</Text>
              {emptyActionLabel && onEmptyAction && (
                <TouchableOpacity
                  onPress={onEmptyAction}
                  style={styles.emptyAction}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: colors.primary, fontWeight: '600' }}>
                    + {emptyActionLabel}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            options.map((option) => (
              <TouchableOpacity
                key={String(option.value)}
                style={[
                  styles.option,
                  option.value === value && {
                    backgroundColor: colors.primary + '22',
                  },
                ]}
                onPress={() => handleOptionSelect(option)}
                activeOpacity={0.7}
              >
                <Text
                  style={
                    option.value === value
                      ? { color: colors.primary, fontWeight: '600' }
                      : undefined
                  }
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  dropdown: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  loadingRow: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  emptyRow: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  emptyAction: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
