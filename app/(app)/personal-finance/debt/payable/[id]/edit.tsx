import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { DateInput } from '@/src/components/ui/date-input';
import { FixedAssetSubHeader } from '@/src/components/ui/fixed-asset-sub-header';
import { Input } from '@/src/components/ui/input';
import { Screen } from '@/src/components/ui/screen';
import { AccountSearchSelect } from '@/src/components/ui/account-search-select';
import { SearchableSelect } from '@/src/components/ui/searchable-select';
import { Text } from '@/src/components/ui/text';
import { useContacts } from '@/src/hooks/use-contact';
import { useDebt, useUpdateDebt } from '@/src/hooks/use-debt';
import { useDebouncedValue } from '@/src/hooks/use-debounced-value';
import { useToastStore } from '@/src/state/toast-store';
import { spacing } from '@/src/theme/tokens';
import { formatIDR } from '@/src/utils/currency';
import { toAppError } from '@/src/utils/errors';

export default function DebtPayableEditPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const debtId = Number(id);
  const showToast = useToastStore((s) => s.showToast);

  const { data: debt, isLoading: isDebtLoading } = useDebt(debtId);
  const { mutateAsync: updateDebt, isPending: isSubmitting } = useUpdateDebt();

  const [contactId, setContactId] = useState<number | string>('');
  const [contactSearch, setContactSearch] = useState('');
  const [name, setName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [accountId, setAccountId] = useState<number | string>('');
  const [cashAccountId, setCashAccountId] = useState<number | string>('');
  const [notes, setNotes] = useState('');

  const debouncedContactSearch = useDebouncedValue(contactSearch, 400);

  const {
    data: contactsData,
    isFetching: isContactFetching,
  } = useContacts({
    search: debouncedContactSearch || undefined,
    perPage: 20,
  });

  useEffect(() => {
    if (debt) {
      setContactId(debt.contact_id);
      setContactSearch(debt.contact_name);
      setName(debt.name);
      setAmountStr(formatIDR(debt.amount));
      setDueDate(debt.due_date ?? '');
      setAccountId(debt.account_id);
      setNotes(debt.notes ?? '');
    }
  }, [debt]);

  const allContacts = contactsData?.pages.flatMap((p) => p.data) ?? [];
  const contactOptions = [
    { label: 'Pilih Kontak', value: '' },
    ...allContacts.map((c) => ({ label: c.name, value: c.id })),
  ];

  const amount = parseInt(amountStr.replace(/\D/g, ''), 10) || 0;

  const handleSubmit = async () => {
    if (!contactId) {
      showToast('Pilih kontak terlebih dahulu', 'danger');
      return;
    }
    if (!name.trim()) {
      showToast('Masukkan nama utang', 'danger');
      return;
    }
    if (amount <= 0) {
      showToast('Masukkan jumlah nominal', 'danger');
      return;
    }

    try {
      await updateDebt({
        id: debtId,
        payload: {
          contact_id: Number(contactId),
          name: name.trim(),
          amount,
          due_date: dueDate || undefined,
          notes: notes.trim() || undefined,
          account_id: accountId ? Number(accountId) : undefined,
          cash_account_id: cashAccountId ? Number(cashAccountId) : undefined,
        },
      });

      showToast('Utang berhasil diperbarui', 'success');
      router.back();
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  if (isDebtLoading) {
    return (
      <>
        <FixedAssetSubHeader title="Edit Utang" />
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
      <FixedAssetSubHeader title="Edit Utang" />
      <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
        <View style={formStyles.formContainer}>
          <Card>
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
            <Input
              label="Nama Utang"
              value={name}
              onChangeText={setName}
              placeholder="Contoh: Utang ke Budi"
            />
            <Input
              label="Jumlah Nominal"
              value={amountStr}
              onChangeText={(text) => {
                const numeric = text.replace(/\D/g, '');
                setAmountStr(numeric ? formatIDR(parseInt(numeric, 10)) : '');
              }}
              placeholder="Rp 0"
              keyboardType="numeric"
            />
            <DateInput
              label="Tanggal Jatuh Tempo"
              value={dueDate}
              onChangeDate={setDueDate}
            />
            <AccountSearchSelect
              label="Akun Utang"
              value={accountId}
              onChange={setAccountId}
              emptyOptionLabel="Pilih Akun Utang"
              placeholder="Cari akun utang..."
              type="liability"
              hasParent
              isCash={false}
              defaultAccountType="liability"
            />
            <AccountSearchSelect
              label="Akun Kas/Bank"
              value={cashAccountId}
              onChange={setCashAccountId}
              emptyOptionLabel="Pilih Akun Kas/Bank"
              placeholder="Cari akun kas/bank..."
              type="asset"
              assetCategory="current"
              hasParent
              isCash
              defaultAccountType="asset"
              defaultAssetType="current"
            />
            <Input
              label="Catatan"
              value={notes}
              onChangeText={setNotes}
              placeholder="Catatan tambahan (opsional)"
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
  loadingContainer: {
    padding: spacing.md,
  },
});
