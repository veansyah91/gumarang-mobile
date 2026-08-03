import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Button } from '@/src/components/ui/button';
import { DateInput } from '@/src/components/ui/date-input';
import { Input } from '@/src/components/ui/input';
import { InvestmentSubHeader } from '@/src/components/ui/investment-sub-header';
import { Screen } from '@/src/components/ui/screen';
import { Text } from '@/src/components/ui/text';
import { useInvestment, useRevalueInvestment } from '@/src/hooks/use-investment';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { useToastStore } from '@/src/state/toast-store';
import { palette, spacing } from '@/src/theme/tokens';
import { formatIDR } from '@/src/utils/currency';
import { toAppError } from '@/src/utils/errors';

function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function RevaluePage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const assetId = Number(id);

  const theme = useResolvedTheme();
  const colors = palette[theme];

  const { data: asset } = useInvestment(assetId);
  const revalue = useRevalueInvestment();
  const showToast = useToastStore((state) => state.showToast);

  const [marketPrice, setMarketPrice] = useState('');
  const [valuedAt, setValuedAt] = useState(getTodayDate());

  const handleSubmit = async () => {
    if (!marketPrice) return;

    try {
      await revalue.mutateAsync({
        id: assetId,
        payload: {
          market_price: parseInt(marketPrice, 10),
          valued_at: valuedAt || undefined,
        },
      });
      showToast('Harga pasar berhasil diperbarui', 'success');
      router.back();
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  return (
    <>
      <InvestmentSubHeader
        title="Revaluasi Harga"
        subtitle={asset?.name}
      />
      <Screen
        scrollable
        safeAreaEdges={['left', 'right', 'bottom']}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.infoBox, { backgroundColor: colors.surface }]}>
              <Text style={styles.infoLabel}>{asset?.name}</Text>
              <Text tone="muted">
                Harga pasar saat ini: {formatIDR(asset?.last_market_price ?? 0)}
              </Text>
              <Text tone="muted">
                Jumlah unit: {asset?.unit_quantity}
              </Text>
            </View>

            <Input
              label="Harga Pasar Baru per Unit"
              value={marketPrice}
              onChangeText={(text) => setMarketPrice(text.replace(/\D/g, ''))}
              placeholder="0"
              keyboardType="number-pad"
              className="text-right"
            />

            <DateInput
              label="Tanggal Penilaian (opsional)"
              value={valuedAt}
              onChangeDate={setValuedAt}
            />

            <Button
              label="Simpan"
              onPress={handleSubmit}
              disabled={!marketPrice || revalue.isPending}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  form: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  infoBox: {
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.xs,
  },
  infoLabel: {
    fontWeight: '700',
    fontSize: 16,
  },
});
