import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  Linking,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, spacing } from '@/src/theme/tokens';

export function Footer() {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSendWA = () => {
    const waPhone = '6285271766661';
    const text = `ٱلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ ٱللَّٰهِ وَبَرَكَاتُهُ\n\nNama: ${name}\nNo. Handphone: ${phone}\nPesan: ${message}`;
    Linking.openURL(
      `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`,
    );
  };

  const inputStyle = [
    styles.input,
    {
      borderColor: colors.border,
      color: colors.text,
      backgroundColor: colors.surface,
    },
  ];

  return (
    <View style={[styles.container, { borderTopColor: colors.border }]}>
      <Text style={[styles.heading, { color: colors.text }]}>Hubungi Kami</Text>
      <Text tone="muted" style={styles.subheading}>
        Jika Anda memiliki pertanyaan atau ingin informasi lebih lanjut, silakan
        hubungi kami.
      </Text>

      <Text style={[styles.label, { color: colors.text }]}>Alamat</Text>
      <Text tone="muted" style={styles.value}>
        Jl. Sudirman, Pasar Lama Taman Penyu, Kelurahan Air Molek 1, Kecamatan
        Pasir Penyu, Kabupaten Indragiri Hulu, Riau
      </Text>

      <Text style={[styles.label, { color: colors.text }]}>Whatsapp</Text>
      <Text tone="muted" style={styles.value}>
        62 852 717 6666 1
      </Text>

      <Text style={[styles.label, { color: colors.text }]}>
        Jam Operasional
      </Text>
      <Text tone="muted" style={styles.value}>
        Senin - Minggu: 09.00 - 17.00 WIB
      </Text>

      <Text
        style={[styles.heading, { color: colors.text, marginTop: spacing.lg }]}
      >
        Kirim Pesan
      </Text>

      <Text style={[styles.fieldLabel, { color: colors.muted }]}>
        Nama Lengkap
      </Text>
      <TextInput
        style={inputStyle}
        value={name}
        onChangeText={setName}
        placeholder="Nama lengkap Anda"
        placeholderTextColor={colors.muted}
      />

      <Text style={[styles.fieldLabel, { color: colors.muted }]}>
        No. Handphone
      </Text>
      <TextInput
        style={inputStyle}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="Nomor handphone Anda"
        placeholderTextColor={colors.muted}
      />

      <Text style={[styles.fieldLabel, { color: colors.muted }]}>Pesan</Text>
      <TextInput
        style={[...inputStyle, styles.textarea]}
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        placeholder="Pesan Anda"
        placeholderTextColor={colors.muted}
      />

      <TouchableOpacity style={styles.sendButton} onPress={handleSendWA}>
        <Ionicons name="logo-whatsapp" size={20} color="white" />
        <Text style={styles.sendButtonText}>Kirim</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    borderTopWidth: 1,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg, // <-- Menambahkan padding di bagian bawah dalam container
    marginBottom: spacing.lg, // <-- Menambahkan jarak di luar bagian bawah container
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
  },
  subheading: {
    fontSize: 13,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  value: {
    fontSize: 13,
  },
  fieldLabel: {
    fontSize: 12,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 14,
  },
  textarea: {
    height: 96,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#25D366',
    borderRadius: 8,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
});
