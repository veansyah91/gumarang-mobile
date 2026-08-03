import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Button } from '@/src/components/ui/button';
import { DateInput } from '@/src/components/ui/date-input';
import { Input } from '@/src/components/ui/input';
import { AccountSearchSelect } from '@/src/components/ui/account-search-select';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, spacing } from '@/src/theme/tokens';
import { formatNumber } from '@/src/utils/currency';

type Mode = 'purchase' | 'sale';

type Props = {
  mode: Mode;
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => void | Promise<void>;
  initialData: {
    unit_quantity: number;
    unit_price: number;
    transaction_date: string;
    notes?: string;
  };
  isSubmitting?: boolean;
};

export function InvestmentEditTransactionModal({
  mode,
  visible,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}: Props) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const isPurchase = mode === 'purchase';

  const [unitQty, setUnitQty] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [accountId, setAccountId] = useState<string | number>('');
  const [transactionDate, setTransactionDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible) {
      setUnitQty(String(initialData.unit_quantity));
      setUnitPrice(String(initialData.unit_price));
      setAccountId('');
      setTransactionDate(initialData.transaction_date);
      setNotes(initialData.notes ?? '');
    }
  }, [visible, initialData]);

  const handleSubmit = () => {
    if (!unitQty || !unitPrice || !transactionDate) return;

    const payload: Record<string, unknown> = {
      unit_quantity: parseFloat(unitQty),
      unit_price: parseInt(unitPrice, 10),
      transaction_date: transactionDate,
    };

    if (accountId) {
      if (isPurchase) {
        payload.source_account_id = Number(accountId);
      } else {
        payload.destination_account_id = Number(accountId);
      }
    }

    if (notes.trim()) {
      payload.notes = notes.trim();
    }

    void onSubmit(payload);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { borderColor: colors.border }]}>
          <Text variant="subtitle">
            {isPurchase ? 'Edit Pembelian' : 'Edit Penjualan'}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Jumlah Unit"
            value={unitQty}
            onChangeText={setUnitQty}
            placeholder="0"
            keyboardType="decimal-pad"
          />

          <Input
            label={isPurchase ? 'Harga Beli per Unit' : 'Harga Jual per Unit'}
            value={unitPrice ? formatNumber(unitPrice) : ''}
            onChangeText={(text) => setUnitPrice(text.replace(/\D/g, ''))}
            placeholder="0"
            keyboardType="number-pad"
            className="text-right"
          />

          <AccountSearchSelect
            label={isPurchase ? 'Akun Sumber Dana (opsional)' : 'Akun Tujuan'}
            value={accountId}
            onChange={setAccountId}
            type="asset"
            assetCategory="current"
            hasParent
            defaultAccountType="asset"
            defaultAssetType="current"
          />

          <DateInput
            label="Tanggal Transaksi"
            value={transactionDate}
            onChangeDate={setTransactionDate}
          />

          <Input
            label="Catatan (opsional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Catatan transaksi"
            multiline
          />
        </ScrollView>

        <View style={[styles.footer, { borderColor: colors.border }]}>
          <Button variant="secondary" label="Batal" onPress={onClose} />
          <Button
            label="Simpan"
            onPress={handleSubmit}
            disabled={!unitQty || !unitPrice || !transactionDate || isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xl * 2,
    borderBottomWidth: 1,
  },
  form: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl * 2,
    borderTopWidth: 1,
  },
});
