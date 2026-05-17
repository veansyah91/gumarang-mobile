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
        name="purchase-member"
        options={{ title: 'Riwayat Pembelian Emas' }}
      />
      <Stack.Screen
        name="invoice-member"
        options={{ title: 'Riwayat Penjualan Emas' }}
      />
      <Stack.Screen
        name="gold-convertion-member"
        options={{ title: 'Riwayat Tukar Emas' }}
      />
    </Stack>
  );
}
