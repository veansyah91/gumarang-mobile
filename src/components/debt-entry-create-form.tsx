import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AccountSearchSelect } from '@/src/components/ui/account-search-select';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { DateInput } from '@/src/components/ui/date-input';
import { FixedAssetSubHeader } from '@/src/components/ui/fixed-asset-sub-header';
import { Input } from '@/src/components/ui/input';
import { Screen } from '@/src/components/ui/screen';
import { SearchableSelect } from '@/src/components/ui/searchable-select';
import { useContacts } from '@/src/hooks/use-contact';
import { useDebouncedValue } from '@/src/hooks/use-debounced-value';
import { useCreateDebtEntry, useSearchDebts } from '@/src/hooks/use-debt';
import { useToastStore } from '@/src/state/toast-store';
import { spacing } from '@/src/theme/tokens';
import { formatIDR } from '@/src/utils/currency';
import { toAppError } from '@/src/utils/errors';

interface DebtEntryCreateFormProps {
  debtType: 'payable' | 'receivable';
  entryType: 'debit' | 'credit';
  initialDebtId?: number | string;
  initialAmount?: number;
}

const LABELS = {
  payable: {
    title: 'Pembayaran Utang',
    debtLabel: 'Utang',
    debtPlaceholder: 'Cari utang yang belum lunas...',
    debtEmptyLabel: 'Pilih Utang',
    debtValidationToast: 'Pilih utang terlebih dahulu',
    amountLabel: 'Jumlah Pembayaran',
    amountValidationToast: 'Masukkan jumlah pembayaran',
    notesPlaceholder: 'Catatan pembayaran (opsional)',
    successToast: 'Pembayaran utang berhasil dicatat',
  },
  receivable: {
    title: 'Pembayaran Piutang',
    debtLabel: 'Piutang',
    debtPlaceholder: 'Cari piutang yang belum lunas...',
    debtEmptyLabel: 'Pilih Piutang',
    debtValidationToast: 'Pilih piutang terlebih dahulu',
    amountLabel: 'Jumlah Pelunasan',
    amountValidationToast: 'Masukkan jumlah pelunasan',
    notesPlaceholder: 'Catatan pelunasan (opsional)',
    successToast: 'Pembayaran piutang berhasil dicatat',
  },
} as const;

function getTodayDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function DebtEntryCreateForm({
  debtType,
  entryType,
  initialDebtId,
  initialAmount,
}: DebtEntryCreateFormProps) {
  const labels = LABELS[debtType];
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  const [debtId, setDebtId] = useState<number | string>(
    initialDebtId ?? '',
  );
  const [debtSearch, setDebtSearch] = useState('');
  const [contactId, setContactId] = useState<number | string>('');
  const [contactSearch, setContactSearch] = useState('');
  const [date, setDate] = useState(getTodayDate());
  const [amountStr, setAmountStr] = useState(
    initialAmount && initialAmount > 0 ? formatIDR(initialAmount) : '',
  );
  const [accountId, setAccountId] = useState<number | string>('');
  const [notes, setNotes] = useState('');
  const appliedInitialDebt = useRef(false);

  const debouncedDebtSearch = useDebouncedValue(debtSearch, 400);
  const debouncedContactSearch = useDebouncedValue(contactSearch, 400);

  const { mutateAsync: createEntry, isPending: isSubmitting } =
    useCreateDebtEntry();

  const { data: debtsData, isFetching: isDebtFetching } = useSearchDebts({
    query: debouncedDebtSearch || undefined,
    type: debtType,
    perPage: 20,
  });

  const { data: contactsData, isFetching: isContactFetching } = useContacts({
    search: debouncedContactSearch || undefined,
    perPage: 20,
  });

  const allDebts = useMemo(() => debtsData?.data ?? [], [debtsData]);
  const debtOptions = [
    { label: labels.debtEmptyLabel, value: '' },
    ...allDebts.map((d) => ({
      label: `${d.name} - ${d.contact_name} (Sisa ${formatIDR(d.balance)})`,
      value: d.id,
    })),
  ];

  const allContacts = useMemo(
    () => contactsData?.pages.flatMap((p) => p.data) ?? [],
    [contactsData],
  );
  const contactOptions = [
    { label: 'Pilih Kontak', value: '' },
    ...allContacts.map((c) => ({ label: c.name, value: c.id })),
  ];

  const applyDebtSelection = useCallback(
    (value: string | number) => {
      setDebtId(value);
      const debt = allDebts.find((d) => d.id === Number(value));
      if (debt) {
        setContactId(debt.contact_id);
        setContactSearch(debt.contact_name);
        setAmountStr(debt.balance > 0 ? formatIDR(debt.balance) : '');
      }
    },
    [allDebts],
  );

  useEffect(() => {
    if (
      !appliedInitialDebt.current &&
      initialDebtId !== undefined &&
      initialDebtId !== '' &&
      allDebts.length > 0
    ) {
      const matched = allDebts.find((d) => d.id === Number(initialDebtId));
      if (matched) {
        applyDebtSelection(matched.id);
        setDebtSearch(
          `${matched.name} - ${matched.contact_name} (Sisa ${formatIDR(matched.balance)})`,
        );
      }
      appliedInitialDebt.current = true;
    }
  }, [initialDebtId, allDebts, applyDebtSelection]);

  const handleDebtChange = (value: string | number) => {
    applyDebtSelection(value);
  };

  const amount = parseInt(amountStr.replace(/\D/g, ''), 10) || 0;

  const handleSubmit = async () => {
    if (!debtId) {
      showToast(labels.debtValidationToast, 'danger');
      return;
    }
    if (amount <= 0) {
      showToast(labels.amountValidationToast, 'danger');
      return;
    }
    if (!accountId) {
      showToast('Pilih akun kas/bank', 'danger');
      return;
    }

    try {
      const entryResult = await createEntry({
        debt_id: Number(debtId),
        entry_type: entryType,
        date,
        amount,
        account_id: accountId ? Number(accountId) : undefined,
        notes: notes.trim() || undefined,
      });

      showToast(labels.successToast, 'success');
      router.replace(
        `/personal-finance/debt/${debtType}-entry/${entryResult.data.id}?debtId=${entryResult.data.debt_id}`,
      );
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  return (
    <>
      <FixedAssetSubHeader title={labels.title} />
      <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
        <View style={formStyles.formContainer}>
          <Card>
            <SearchableSelect
              label={labels.debtLabel}
              value={debtId}
              options={debtOptions}
              onChange={handleDebtChange}
              searchText={debtSearch}
              onSearchChange={setDebtSearch}
              loading={isDebtFetching}
              placeholder={labels.debtPlaceholder}
            />
            <SearchableSelect
              label="Kontak"
              value={contactId}
              options={contactOptions}
              onChange={setContactId}
              searchText={contactSearch}
              onSearchChange={setContactSearch}
              loading={isContactFetching}
              placeholder="Cari kontak..."
            />
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
            <AccountSearchSelect
              label="Akun Kas/Bank"
              value={accountId}
              onChange={setAccountId}
              emptyOptionLabel="Pilih Akun Kas/Bank"
              placeholder="Cari akun kas/bank..."
              type="asset"
              assetCategory="current"
              isCash
              defaultAccountType="asset"
              defaultAssetType="current"
              hasParent={true}
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
