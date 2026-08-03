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

function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

type Mode = 'buy' | 'sell';

type Props = {
  mode: Mode;
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => void | Promise<void>;
  assetName: string;
  unitQuantity: number;
  unitCostAvg: number;
  isSubmitting?: boolean;
};

export function InvestmentBuySellModal({
  mode,
  visible,
  onClose,
  onSubmit,
  assetName,
  unitQuantity,
  unitCostAvg,
  isSubmitting,
}: Props) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const isBuy = mode === 'buy';

  const [unitQty, setUnitQty] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [accountId, setAccountId] = useState<string | number>('');
  const [transactionDate, setTransactionDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible) {
      setUnitQty('');
      setUnitPrice('');
      setAccountId('');
      setTransactionDate(getTodayDate());
      setNotes('');
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!unitQty || !unitPrice || !accountId || !transactionDate) return;

    const payload: Record<string, unknown> = {
      unit_quantity: parseFloat(unitQty),
      unit_price: parseInt(unitPrice, 10),
      transaction_date: transactionDate,
    };

    if (isBuy) {
      payload.source_account_id = Number(accountId);
    } else {
      payload.destination_account_id = Number(accountId);
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
            {isBuy ? 'Beli Unit' : 'Jual Unit'}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[styles.infoBox, { backgroundColor: colors.surface }]}
          >
            <Text style={styles.infoLabel}>{assetName}</Text>
            <Text tone="muted" style={styles.infoSub}>
              Unit tersedia: {unitQuantity} | Harga rata-rata:{' '}
              {unitCostAvg.toLocaleString('id-ID')}
            </Text>
          </View>

          <Input
            label="Jumlah Unit"
            value={unitQty}
            onChangeText={setUnitQty}
            placeholder="0"
            keyboardType="decimal-pad"
          />

          <Input
            label={isBuy ? 'Harga Beli per Unit' : 'Harga Jual per Unit'}
            value={unitPrice ? formatNumber(unitPrice) : ''}
            onChangeText={(text) => setUnitPrice(text.replace(/\D/g, ''))}
            placeholder="0"
            keyboardType="number-pad"
            className="text-right"
          />

          <AccountSearchSelect
            label={isBuy ? 'Akun Sumber Dana' : 'Akun Tujuan'}
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
            placeholder="Contoh: Take profit"
            multiline
          />
        </ScrollView>

        <View style={[styles.footer, { borderColor: colors.border }]}>
          <Button variant="secondary" label="Batal" onPress={onClose} />
          <Button
            label={isBuy ? 'Beli' : 'Jual'}
            onPress={handleSubmit}
            disabled={!unitQty || !unitPrice || !accountId || !transactionDate || isSubmitting}
            variant={isBuy ? 'primary' : 'danger'}
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
  infoBox: {
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.xs,
  },
  infoLabel: {
    fontWeight: '700',
    fontSize: 16,
  },
  infoSub: {
    fontSize: 12,
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
