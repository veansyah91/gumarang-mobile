import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, radius, spacing } from '@/src/theme/tokens';

const ICON_OPTIONS = [
  { key: 'wallet', icon: 'wallet-outline', label: 'Dompet' },
  { key: 'bank', icon: 'business-outline', label: 'Bank' },
  { key: 'landmark', icon: 'business-outline', label: 'Gedung' },
  { key: 'credit-card', icon: 'card-outline', label: 'Kartu' },
  { key: 'smartphone', icon: 'phone-portrait-outline', label: 'HP' },
  { key: 'dollar-sign', icon: 'cash-outline', label: 'Uang' },
  { key: 'coffee', icon: 'cafe-outline', label: 'Kopi' },
  { key: 'shopping-cart', icon: 'cart-outline', label: 'Belanja' },
  { key: 'utensils', icon: 'restaurant-outline', label: 'Makan' },
  { key: 'truck', icon: 'car-outline', label: 'Kendaraan' },
  { key: 'droplet', icon: 'water-outline', label: 'Air' },
  { key: 'gift', icon: 'gift-outline', label: 'Hadiah' },
  { key: 'briefcase', icon: 'briefcase-outline', label: 'Kerja' },
  { key: 'bag', icon: 'bag-outline', label: 'Tas' },
  { key: 'star', icon: 'star-outline', label: 'Bintang' },
  { key: 'desktop', icon: 'desktop-outline', label: 'Komputer' },
  { key: 'motorcycle', icon: 'car-sport-outline', label: 'Motor' },
  { key: 'bicycle', icon: 'bicycle-outline', label: 'Sepeda' },
  { key: 'land', icon: 'map-outline', label: 'Tanah' },
  { key: 'tablet', icon: 'tablet-portrait-outline', label: 'Tablet' },
  { key: 'tools', icon: 'construct-outline', label: 'Peralatan' },
  { key: 'printer', icon: 'print-outline', label: 'Printer' },
  { key: 'home', icon: 'home-outline', label: 'Rumah' },
  { key: 'electricity', icon: 'flash-outline', label: 'Listrik' },
  { key: 'internet', icon: 'wifi-outline', label: 'Internet' },
  { key: 'phone-call', icon: 'call-outline', label: 'Pulsa' },
  { key: 'gas', icon: 'flame-outline', label: 'Gas' },
  { key: 'education', icon: 'school-outline', label: 'Pendidikan' },
  { key: 'health', icon: 'medkit-outline', label: 'Kesehatan' },
  { key: 'transport', icon: 'bus-outline', label: 'Angkutan' },
  { key: 'tv', icon: 'tv-outline', label: 'TV' },
  { key: 'clothing', icon: 'shirt-outline', label: 'Pakaian' },
  { key: 'insurance', icon: 'shield-checkmark-outline', label: 'Asuransi' },
  { key: 'repair', icon: 'hammer-outline', label: 'Renovasi' },
  { key: 'furniture', icon: 'bed-outline', label: 'Furnitur' },
  { key: 'camera', icon: 'camera-outline', label: 'Kamera' },
  { key: 'watch', icon: 'watch-outline', label: 'Jam' },
  { key: 'grocery', icon: 'basket-outline', label: 'Sembako' },
  { key: 'pet', icon: 'paw-outline', label: 'Hewan' },
  { key: 'gold-bar', icon: 'diamond-outline', label: 'Emas' },
  { key: 'charity', icon: 'hand-left-outline', label: 'Donasi' },
] as const;

type IconPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function IconPicker({ value, onChange }: IconPickerProps) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  return (
    <View style={styles.grid}>
      {ICON_OPTIONS.map((item) => {
        const selected = value === item.key;
        return (
          <Pressable
            key={item.key}
            style={[
              styles.item,
              {
                borderColor: selected ? colors.primary : colors.border,
                backgroundColor: selected
                  ? colors.primary + '18'
                  : colors.surface,
              },
            ]}
            onPress={() => onChange(item.key)}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={selected ? colors.primary : colors.text}
            />
            <Text
              style={[
                styles.label,
                { color: selected ? colors.primary : colors.muted },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  item: {
    width: '18%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: radius.sm,
    gap: 2,
  },
  label: {
    fontSize: 8,
    textAlign: 'center',
  },
});
