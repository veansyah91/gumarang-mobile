import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/ui/screen';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, spacing } from '@/src/theme/tokens';

const sections = [
  {
    title: '1. Definisi',
    items: [
      'Toko Emas adalah penyedia layanan jual beli dan tabungan emas melalui aplikasi.',
      'Pengguna adalah setiap orang yang mendaftar dan menggunakan layanan.',
      'Transaksi mencakup pembelian, penjualan, dan penyimpanan emas di aplikasi.',
    ],
  },
  {
    title: '2. Pencatatan Transaksi',
    items: [
      'Setiap transaksi dicatat secara aman dan terenkripsi.',
      'Data transaksi dipakai untuk pencatatan, pelaporan, dan peningkatan layanan.',
    ],
  },
  {
    title: '3. Analisa dan Rekomendasi',
    items: [
      'Toko dapat menganalisa transaksi untuk membantu memberikan rekomendasi tabungan emas dan pola kepemilikan.',
      'Rekomendasi bersifat informatif dan bukan jaminan keuntungan atau nasihat investasi.',
    ],
  },
  {
    title: '4. Privasi dan Keamanan Data',
    items: [
      'Data pribadi dan data transaksi dijaga kerahasiaannya.',
      'Password disimpan dalam bentuk terenkripsi dan akses data dibatasi secara berkala.',
    ],
  },
  {
    title: '5. Kepemilikan Emas',
    items: [
      'Emas yang dibeli melalui aplikasi sepenuhnya milik pengguna.',
      'Seluruh transaksi mengikuti hukum dan peraturan yang berlaku di Indonesia.',
    ],
  },
  {
    title: '6. Penggunaan yang Dilarang',
    items: [
      'Pengguna dilarang memakai aplikasi untuk tindakan melanggar hukum, penipuan, atau pencucian uang.',
      'Pengguna juga dilarang mengakses data pengguna lain secara tidak sah.',
    ],
  },
  {
    title: '7. Penangguhan Layanan',
    items: [
      'Toko berhak menangguhkan atau menghentikan akses jika ada pelanggaran terhadap ketentuan ini.',
      'Layanan juga dapat dihentikan sementara untuk pemeliharaan atau kondisi force majeure.',
    ],
  },
  {
    title: '8. Perubahan dan Hukum yang Berlaku',
    items: [
      'Ketentuan ini dapat diperbarui sewaktu-waktu dan berlaku sejak tanggal efektif yang diumumkan.',
      'Syarat dan Ketentuan ini tunduk pada hukum Republik Indonesia.',
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

export default function TermsScreen() {
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
        <Text variant="title">Syarat & Ketentuan</Text>
        <Text tone="muted">Terakhir diperbarui: 25 Juli 2025</Text>
      </View>

      <Card>
        <View style={styles.body}>
          <Text tone="muted">
            Dengan menggunakan aplikasi Toko Mas Gumarang, Anda menyetujui
            ketentuan berikut.
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
