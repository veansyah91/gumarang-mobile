import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { useCreateDebt } from '@/src/hooks/use-debt';
import { useToastStore } from '@/src/state/toast-store';
import { spacing } from '@/src/theme/tokens';
import { formatIDR } from '@/src/utils/currency';
import { toAppError } from '@/src/utils/errors';

export default function DebtReceivableCreatePage() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  const [contactId, setContactId] = useState<number | string>('');
  const [contactSearch, setContactSearch] = useState('');
  const [name, setName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [accountId, setAccountId] = useState<number | string>('');
  const [cashAccountId, setCashAccountId] = useState<number | string>('');
  const [notes, setNotes] = useState('');

  const debouncedContactSearch = useDebouncedValue(contactSearch, 400);

  const { mutateAsync: createDebt, isPending: isSubmitting } = useCreateDebt();

  const { data: contactsData, isFetching: isContactFetching } = useContacts({
    search: debouncedContactSearch || undefined,
    perPage: 20,
  });

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
      showToast('Masukkan nama piutang', 'danger');
      return;
    }
    if (amount <= 0) {
      showToast('Masukkan jumlah nominal', 'danger');
      return;
    }
    if (!accountId) {
      showToast('Pilih akun piutang', 'danger');
      return;
    }
    if (!cashAccountId) {
      showToast('Pilih akun kas/bank', 'danger');
      return;
    }

    try {
      const result = await createDebt({
        contact_id: Number(contactId),
        type: 'receivable',
        name: name.trim(),
        amount,
        due_date: dueDate || undefined,
        notes: notes.trim() || undefined,
        account_id: Number(accountId),
        cash_account_id: Number(cashAccountId),
      });

      showToast('Piutang berhasil ditambahkan', 'success');
      router.replace(`/personal-finance/debt/receivable/${result.data.id}`);
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  return (
    <>
      <FixedAssetSubHeader title="Tambah Piutang" />
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
              label="Nama Piutang"
              value={name}
              onChangeText={setName}
              placeholder="Contoh: Piutang dari Budi"
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
              label="Akun Piutang"
              value={accountId}
              onChange={setAccountId}
              emptyOptionLabel="Pilih Akun Piutang"
              placeholder="Cari akun piutang..."
              type="asset"
              hasParent
              defaultAccountType="asset"
              defaultAssetType="current"
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
});
