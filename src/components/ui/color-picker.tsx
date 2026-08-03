import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, radius, spacing } from '@/src/theme/tokens';

function normalizeHex(color: string): string {
  return (color || '').trim().replace(/^#/, '').toUpperCase();
}

const COLOR_OPTIONS = [
  '#EF4444',
  '#F97316',
  '#D97706',
  '#EAB308',
  '#22C55E',
  '#15803D',
  '#14B8A6',
  '#06B6D4',
  '#3B82F6',
  '#2563EB',
  '#8B5CF6',
  '#7C3AED',
  '#EC4899',
  '#DB2777',
  '#6B7280',
  '#4B5563',
];

type ColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  return (
    <View>
      <View style={styles.grid}>
        {COLOR_OPTIONS.map((c) => {
          const selected = normalizeHex(value) === normalizeHex(c) && value !== '';
          return (
            <Pressable
              key={c}
              style={[
                styles.swatch,
                { backgroundColor: c },
                selected && {
                  borderColor: colors.primary,
                  borderWidth: 3,
                },
              ]}
              onPress={() => onChange(c)}
            >
              {selected && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
