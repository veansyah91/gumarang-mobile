import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, radius, spacing } from '@/src/theme/tokens';

import { Text } from './text';

export type SelectOption = { label: string; value: string | number };

type SelectInputProps = {
  label: string;
  value: string | number;
  options: SelectOption[];
  onChange: (value: string | number) => void;
};

export function SelectInput({
  label,
  value,
  options,
  onChange,
}: SelectInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const selectedLabel = options.find((o) => o.value === value)?.label ?? '';

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.trigger,
          { borderColor: colors.border, backgroundColor: colors.background },
        ]}
        onPress={() => setIsOpen((v) => !v)}
        activeOpacity={0.7}
      >
        <Text>{selectedLabel}</Text>
        <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {isOpen && (
        <View
          style={[
            styles.dropdown,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          {options.map((option) => (
            <TouchableOpacity
              key={String(option.value)}
              style={[
                styles.option,
                option.value === value && {
                  backgroundColor: colors.primary + '22',
                },
              ]}
              onPress={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
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
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  trigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chevron: {
    fontSize: 10,
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
});
