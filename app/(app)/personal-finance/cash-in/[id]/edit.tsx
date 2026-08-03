import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { DateInput } from '@/src/components/ui/date-input';
import { FixedAssetSubHeader } from '@/src/components/ui/fixed-asset-sub-header';
import { Input } from '@/src/components/ui/input';
import { Screen } from '@/src/components/ui/screen';
import { AccountSearchSelect } from '@/src/components/ui/account-search-select';
import { Text } from '@/src/components/ui/text';
import { useCashIn, useUpdateCashIn } from '@/src/hooks/use-cash-in';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { useToastStore } from '@/src/state/toast-store';
import { palette, spacing } from '@/src/theme/tokens';
import { formatIDR } from '@/src/utils/currency';
import { toAppError } from '@/src/utils/errors';
import {
  CashInDetailRow,
  createEmptyDetail,
  type DetailEntry,
  formStyles,
  getTodayDate,
} from '@/src/components/cash-in-form';

export default function CashInEditPage() {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const { id } = useLocalSearchParams<{ id: string }>();
  const transactionId = Number(id);

  const { data: transaction, isLoading: isDetailLoading } =
    useCashIn(transactionId);
  const { mutateAsync: updateCashIn, isPending: isSubmitting } =
    useUpdateCashIn();

  const [date, setDate] = useState(getTodayDate());
  const [ref, setRef] = useState('');
  const [cashAccountId, setCashAccountId] = useState<number | string>('');
  const [notes, setNotes] = useState('');
  const [details, setDetails] = useState<DetailEntry[]>([createEmptyDetail()]);

  useEffect(() => {
    if (transaction) {
      const debitEntry = transaction.entries.find(
        (e) => e.entry_type === 'debit',
      );
      const creditEntries = transaction.entries.filter(
        (e) => e.entry_type === 'credit',
      );

      setDate(transaction.created_at?.split('T')[0] || getTodayDate());
      setRef(transaction.reference);
      setCashAccountId(debitEntry?.account_id ?? '');
      setNotes(transaction.notes || '');

      if (creditEntries.length > 0) {
        setDetails(
          creditEntries.map((entry) => ({
            accountId: entry.account_id,
            amount: String(entry.amount),
            investmentType: '',
            unitQty: '',
            unitPrice: '',
            transactionDate: getTodayDate(),
            notes: '',
          })),
        );
      }
    }
  }, [transaction]);

  const totalAmount = details.reduce(
    (sum, d) => sum + (parseInt(d.amount.replace(/\D/g, ''), 10) || 0),
    0,
  );

  const updateDetail = useCallback(
    (index: number, updates: Partial<DetailEntry>) => {
      setDetails((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...updates };
        return next;
      });
    },
    [],
  );

  const removeDetail = useCallback((index: number) => {
    setDetails((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addDetail = useCallback(() => {
    setDetails((prev) => [...prev, createEmptyDetail()]);
  }, []);

  const handleSubmit = async () => {
    if (!cashAccountId) {
      showToast('Pilih akun kas terlebih dahulu', 'danger');
      return;
    }

    const validDetails = details.filter(
      (d) => d.accountId && parseInt(d.amount.replace(/\D/g, ''), 10) > 0,
    );

    if (validDetails.length === 0) {
      showToast('Tambahkan minimal satu rincian pemasukan', 'danger');
      return;
    }

    if (totalAmount <= 0) {
      showToast('Jumlah total harus lebih dari 0', 'danger');
      return;
    }

    try {
      await updateCashIn({
        id: transactionId,
        payload: {
          total_amount: totalAmount,
          notes: notes || undefined,
          ref,
          details: [
            {
              cash_account_id: Number(cashAccountId),
              amount: totalAmount,
              entry_type: 'debit',
            },
            ...validDetails.map((d) => ({
              account_id: Number(d.accountId),
              amount: parseInt(d.amount.replace(/\D/g, ''), 10),
              entry_type: 'credit' as const,
            })),
          ],
        },
      });

      showToast('Kas Masuk berhasil diubah', 'success');
      router.back();
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  if (isDetailLoading) {
    return (
      <>
        <FixedAssetSubHeader title="Edit Kas Masuk" />
        <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
          <View style={localStyles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </Screen>
      </>
    );
  }

  return (
    <>
      <FixedAssetSubHeader title="Edit Kas Masuk" />
      <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
        <View style={formStyles.formContainer}>
          <Card>
            <DateInput label="Tanggal" value={date} onChangeDate={setDate} />
            <Input label="No. Ref" value={ref} editable={false} />
            <AccountSearchSelect
              label="Kas"
              value={cashAccountId}
              onChange={setCashAccountId}
              emptyOptionLabel="Pilih Akun Kas"
              type="asset"
              assetCategory="current"
              hasParent
              isCash
              defaultAccountType="asset"
              defaultAssetType="current"
            />
            <Input
              label="Keterangan"
              value={notes}
              onChangeText={setNotes}
              placeholder="Catatan transaksi"
              multiline
            />
          </Card>

          <Text style={formStyles.sectionTitle}>Rincian</Text>

          {details.map((detail, index) => (
            <CashInDetailRow
              key={index}
              detail={detail}
              index={index}
              onUpdate={updateDetail}
              onRemove={removeDetail}
            />
          ))}

          <Button variant="secondary" label="+ Tambah" onPress={addDetail} />

          <View
            style={[
              formStyles.totalRow,
              {
                borderTopColor: colors.border,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <Text variant="subtitle">Total</Text>
            <Text variant="subtitle">{formatIDR(totalAmount)}</Text>
          </View>

          <View style={formStyles.submitContainer}>
            <Button
              label="Perbarui"
              onPress={handleSubmit}
              disabled={isSubmitting}
            />
          </View>
        </View>
      </Screen>
    </>
  );
}

const localStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
});
