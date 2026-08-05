import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { DateInput } from '@/src/components/ui/date-input';
import { FixedAssetSubHeader } from '@/src/components/ui/fixed-asset-sub-header';
import { Input } from '@/src/components/ui/input';
import { Screen } from '@/src/components/ui/screen';
import { SelectInput } from '@/src/components/ui/select-input';
import { Text } from '@/src/components/ui/text';
import { useDebtEntry, useUpdateDebtEntry } from '@/src/hooks/use-debt';
import { useToastStore } from '@/src/state/toast-store';
import { spacing } from '@/src/theme/tokens';
import { formatIDR } from '@/src/utils/currency';
import { toAppError } from '@/src/utils/errors';

interface DebtEntryEditFormProps {
  debtId: number;
  entryId: number;
  debtType: 'payable' | 'receivable';
}

const LABELS = {
  payable: {
    title: 'Edit Entry Utang',
    amountLabel: 'Jumlah',
    notesPlaceholder: 'Catatan pembayaran (opsional)',
    amountValidationToast: 'Masukkan jumlah pembayaran',
    selectCreditLabel: 'Credit (Bayar)',
  },
  receivable: {
    title: 'Edit Entry Piutang',
    amountLabel: 'Jumlah',
    notesPlaceholder: 'Catatan pelunasan (opsional)',
    amountValidationToast: 'Masukkan jumlah pelunasan',
    selectCreditLabel: 'Credit (Kurangi saldo)',
  },
} as const;

export function DebtEntryEditForm({
  debtId,
  entryId,
  debtType,
}: DebtEntryEditFormProps) {
  const labels = LABELS[debtType];
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);

  const { data: entry, isLoading: isEntryLoading } = useDebtEntry(
    debtId,
    entryId,
  );
  const { mutateAsync: updateEntry, isPending: isSubmitting } =
    useUpdateDebtEntry();

  const [date, setDate] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [entryType, setEntryType] = useState<string | number>('debit');
  const [notes, setNotes] = useState('');

  const entryTypeOptions = [
    { label: 'Debit (Tambah saldo)', value: 'debit' },
    { label: labels.selectCreditLabel, value: 'credit' },
  ];

  useEffect(() => {
    if (entry) {
      setDate(entry.date);
      setAmountStr(formatIDR(entry.amount));
      setEntryType(entry.type);
      setNotes(entry.notes ?? '');
    }
  }, [entry]);

  const amount = parseInt(amountStr.replace(/\D/g, ''), 10) || 0;

  const handleSubmit = async () => {
    if (amount <= 0) {
      showToast(labels.amountValidationToast, 'danger');
      return;
    }

    try {
      await updateEntry({
        debtId,
        entryId,
        payload: {
          date: date || undefined,
          amount,
          entry_type: entryType as 'debit' | 'credit',
          notes: notes.trim() || undefined,
        },
      });

      showToast('Entry berhasil diperbarui', 'success');
      router.replace(
        `/personal-finance/debt/${debtType}-entry/${entryId}?debtId=${debtId}`,
      );
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  if (isEntryLoading) {
    return (
      <>
        <FixedAssetSubHeader title={labels.title} />
        <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
          <View style={formStyles.loadingContainer}>
            <Text>Memuat...</Text>
          </View>
        </Screen>
      </>
    );
  }

  return (
    <>
      <FixedAssetSubHeader title={labels.title} />
      <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
        <View style={formStyles.formContainer}>
          <Card>
            <Text variant="subtitle" style={formStyles.infoText}>
              {entry?.no_ref}
            </Text>
            <DateInput label="Tanggal" value={date} onChangeDate={setDate} />
            <Input
              label={labels.amountLabel}
              value={amountStr}
              onChangeText={(text) => {
                const numeric = text.replace(/\D/g, '');
                setAmountStr(numeric ? formatIDR(parseInt(numeric, 10)) : '');
              }}
              placeholder="Rp 0"
              keyboardType="numeric"
            />
            <SelectInput
              label="Tipe Entry"
              value={entryType}
              options={entryTypeOptions}
              onChange={setEntryType}
            />
            <Input
              label="Catatan"
              value={notes}
              onChangeText={setNotes}
              placeholder={labels.notesPlaceholder}
              multiline
            />
          </Card>

          <View style={formStyles.submitContainer}>
            <Button
              label="Simpan"
              onPress={handleSubmit}
              disabled={isSubmitting}
            />
          </View>
        </View>
      </Screen>
    </>
  );
}

const formStyles = StyleSheet.create({
  loadingContainer: {
    padding: spacing.md,
  },
  formContainer: {
    gap: spacing.md,
    padding: spacing.md,
  },
  submitContainer: {
    marginTop: spacing.sm,
  },
  infoText: {
    marginBottom: spacing.sm,
  },
});
