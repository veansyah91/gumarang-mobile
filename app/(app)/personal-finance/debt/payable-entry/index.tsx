import { useState } from 'react';
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
import { useCreateDebtEntry } from '@/src/hooks/use-debt';
import { useDebouncedValue } from '@/src/hooks/use-debounced-value';
import { useToastStore } from '@/src/state/toast-store';
import { spacing } from '@/src/theme/tokens';
import { formatIDR } from '@/src/utils/currency';
import { toAppError } from '@/src/utils/errors';

function getTodayDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DebtPayableEntryPage() {
  const showToast = useToastStore((state) => state.showToast);

  const [contactId, setContactId] = useState<number | string>('');
  const [contactSearch, setContactSearch] = useState('');
  const [date, setDate] = useState(getTodayDate());
  const [amountStr, setAmountStr] = useState('');
  const [accountId, setAccountId] = useState<number | string>('');
  const [notes, setNotes] = useState('');

  const debouncedContactSearch = useDebouncedValue(contactSearch, 400);

  const { mutateAsync: createEntry, isPending: isSubmitting } =
    useCreateDebtEntry();

  const {
    data: contactsData,
    isFetching: isContactFetching,
  } = useContacts({
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
    if (amount <= 0) {
      showToast('Masukkan jumlah pembayaran', 'danger');
      return;
    }
    if (!accountId) {
      showToast('Pilih akun kas/bank', 'danger');
      return;
    }

    try {
      await createEntry({
        contact_id: Number(contactId),
        type: 'payable',
        entry_type: 'credit',
        date,
        amount,
        account_id: accountId ? Number(accountId) : undefined,
        notes: notes.trim() || undefined,
      });

      showToast('Pembayaran utang berhasil dicatat', 'success');
      setAmountStr('');
      setNotes('');
      setDate(getTodayDate());
      setContactId('');
      setContactSearch('');
      setAccountId('');
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  return (
    <>
      <FixedAssetSubHeader title="Pembayaran Utang" />
      <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
        <View style={formStyles.formContainer}>
          <Card>
            <Text variant="subtitle" style={formStyles.infoText}>
              Mencatat pembayaran utang. Entry akan mengurangi saldo utang.
            </Text>
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
              label="Jumlah Pembayaran"
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
            />
            <Input
              label="Catatan"
              value={notes}
              onChangeText={setNotes}
              placeholder="Catatan pembayaran (opsional)"
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
