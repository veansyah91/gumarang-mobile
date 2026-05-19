import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="gold-list" options={{ title: 'Data Emasku' }} />
      <Stack.Screen
        name="certificate"
        options={{ title: 'Data Sertifikatku' }}
      />
      <Stack.Screen
        name="certificate/[id]"
        options={{ title: 'Detail Sertifikat' }}
      />
      <Stack.Screen
        name="purchase-member"
        options={{ title: 'Riwayat Pembelian Emas' }}
      />
      <Stack.Screen
        name="purchase-member/[id]"
        options={{ title: 'Detail Pembelian Emas' }}
      />
      <Stack.Screen
        name="sale-member"
        options={{ title: 'Riwayat Penjualan Emas' }}
      />
      <Stack.Screen
        name="sale-member/[id]"
        options={{ title: 'Detail Penjualan Emas' }}
      />
      <Stack.Screen
        name="invoice-member"
        options={{ title: 'Riwayat Penjualan Emas' }}
      />
      <Stack.Screen
        name="gold-convertion-member"
        options={{ title: 'Riwayat Tukar Emas' }}
      />
      <Stack.Screen
        name="gold-convertion-member/[id]"
        options={{ title: 'Detail Tukar Emas' }}
      />
      <Stack.Screen
        name="saving-member"
        options={{ title: 'Data Tabunganku' }}
      />
      <Stack.Screen
        name="saving-detail-member"
        options={{ title: 'Buku Tabungan' }}
      />
      <Stack.Screen
        name="change-password"
        options={{ title: 'Ubah Password' }}
      />
    </Stack>
  );
}
