import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/ui/screen';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, spacing } from '@/src/theme/tokens';

const sections = [
  {
    title: '1. Informasi yang Dikumpulkan',
    items: [
      'Data pribadi seperti nama, nomor telepon, dan informasi akun.',
      'Data transaksi seperti jenis transaksi, jumlah emas, tanggal, dan metode pembayaran.',
      'Data perangkat dan penggunaan yang dibutuhkan untuk menjaga layanan tetap aman.',
    ],
  },
  {
    title: '2. Penggunaan Informasi',
    items: [
      'Data digunakan untuk memproses transaksi dan menjalankan layanan.',
      'Kami juga memakainya untuk analisa layanan, peningkatan pengalaman pengguna, serta pemberitahuan penting.',
    ],
  },
  {
    title: '3. Penyimpanan dan Keamanan',
    items: [
      'Data disimpan di server yang aman.',
      'Password dan data sensitif dilindungi dengan enkripsi dan akses terbatas.',
      'Akses data diaudit secara berkala untuk menjaga keamanan.',
    ],
  },
  {
    title: '4. Pembagian Informasi',
    items: [
      'Kami tidak menjual atau menyewakan data pribadi pengguna.',
      'Data hanya dapat dibagikan jika diwajibkan hukum, dibutuhkan untuk operasional, atau dengan persetujuan eksplisit Anda.',
    ],
  },
  {
    title: '5. Cookie dan Teknologi Pelacak',
    items: [
      'Kami dapat menggunakan cookie atau teknologi serupa untuk membantu menjaga sesi dan meningkatkan layanan.',
      'Penggunaan teknologi ini tetap mengikuti kebijakan privasi dan keamanan yang berlaku.',
    ],
  },
  {
    title: '6. Hak Pengguna',
    items: [
      'Anda berhak mengakses, memperbaiki, dan meminta penghapusan data tertentu sesuai ketentuan yang berlaku.',
      'Anda juga dapat menghubungi kami jika ada pertanyaan terkait pengelolaan data pribadi.',
    ],
  },
  {
    title: '7. Perubahan Kebijakan',
    items: [
      'Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu.',
      'Perubahan akan diumumkan melalui aplikasi dan berlaku sejak tanggal efektif yang ditentukan.',
    ],
  },
];

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={styles.section}>
      <Text variant="subtitle">{title}</Text>
      <View style={styles.items}>
        {items.map((item) => (
          <View key={item} style={styles.itemRow}>
            <Text tone="muted">•</Text>
            <Text tone="muted" style={styles.itemText}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function PrivacyScreen() {
  const router = useRouter();
  const theme = useResolvedTheme();
  const colors = palette[theme];

  return (
    <Screen
      contentContainerStyle={styles.content}
      scrollable
      safeAreaEdges={['top', 'left', 'right']}
    >
      <View style={styles.header}>
        <Text variant="eyebrow">Legal</Text>
        <Text variant="title">Kebijakan Privasi</Text>
        <Text tone="muted">Terakhir diperbarui: 25 Juli 2025</Text>
      </View>

      <Card>
        <View style={styles.body}>
          <Text tone="muted">
            Kebijakan ini menjelaskan cara kami mengumpulkan, memakai, dan
            melindungi data pribadi Anda saat menggunakan aplikasi.
          </Text>
          {sections.map((section) => (
            <Section
              key={section.title}
              title={section.title}
              items={section.items}
            />
          ))}
        </View>
      </Card>

      <Pressable
        onPress={() => router.replace('/(auth)/register')}
        style={styles.backButton}
      >
        <Text style={{ color: colors.primary, fontWeight: '700' }}>
          ← Kembali
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  body: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  items: {
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  itemText: {
    flex: 1,
  },
  backButton: {
    alignSelf: 'center',
    marginBottom: spacing.xl,
    paddingBottom: spacing.sm,
  },
});
