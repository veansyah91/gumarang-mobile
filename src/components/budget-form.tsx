import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AccountSearchSelect } from '@/src/components/ui/account-search-select';
import { Button } from '@/src/components/ui/button';
import { DateInput } from '@/src/components/ui/date-input';
import { Input } from '@/src/components/ui/input';
import { RadioGroup } from '@/src/components/ui/radio-group';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { useToastStore } from '@/src/state/toast-store';
import { palette, spacing } from '@/src/theme/tokens';
import type { BudgetPeriodType, CreateBudgetPayload, UpdateBudgetPayload } from '@/src/types/budget';
import { formatNumber } from '@/src/utils/currency';
import { toAppError } from '@/src/utils/errors';

function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getEndDate(periodType: BudgetPeriodType) {
  const d = new Date();
  if (periodType === 'monthly') {
    d.setMonth(d.getMonth() + 1, 0);
  } else if (periodType === 'yearly') {
    d.setFullYear(d.getFullYear() + 1, 0, 0);
  } else {
    d.setMonth(d.getMonth() + 1, 0);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const PERIOD_OPTIONS: { label: string; value: BudgetPeriodType }[] = [
  { label: 'Bulanan', value: 'monthly' },
  { label: 'Tahunan', value: 'yearly' },
  { label: 'Kustom', value: 'custom' },
];

type InitialData = {
  account_id: number;
  name: string;
  amount: number;
  period_type: BudgetPeriodType;
  start_date: string;
  end_date: string;
  repeat: boolean;
  is_active: boolean;
};

type BudgetFormProps = {
  mode: 'create' | 'edit';
  initialData?: InitialData | null;
  onSubmit: (payload: CreateBudgetPayload | UpdateBudgetPayload) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
};

export function BudgetForm({
  mode,
  initialData,
  onSubmit,
  isSubmitting,
  onCancel,
}: BudgetFormProps) {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const showToast = useToastStore((state) => state.showToast);
  const isEdit = mode === 'edit';

  const [accountId, setAccountId] = useState<string | number>('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [periodType, setPeriodType] = useState<BudgetPeriodType>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [repeat, setRepeat] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialData && !initialized) {
      setAccountId(initialData.account_id);
      setName(initialData.name);
      setAmount(String(initialData.amount));
      setPeriodType(initialData.period_type);
      setStartDate(initialData.start_date);
      setEndDate(initialData.end_date);
      setRepeat(initialData.repeat);
      setIsActive(initialData.is_active);
      setInitialized(true);
    }
  }, [initialData, initialized]);

  useEffect(() => {
    if (!isEdit && !initialData) {
      setStartDate(getTodayDate());
      setEndDate(getEndDate('monthly'));
      setRepeat(true);
    }
  }, [isEdit, initialData]);

  const handlePeriodChange = useCallback(
    (value: BudgetPeriodType) => {
      setPeriodType(value);
      if (!isEdit || !initialData) {
        setEndDate(getEndDate(value));
      }
      if (value === 'custom') {
        setRepeat(false);
      } else if (!isEdit) {
        setRepeat(true);
      }
    },
    [isEdit, initialData],
  );

  const handleSubmit = async () => {
    const missingFields: string[] = [];
    if (!accountId && !isEdit) missingFields.push('Akun');
    if (!name.trim()) missingFields.push('Nama Budget');
    if (!amount && !isEdit) missingFields.push('Jumlah Anggaran');
    if (!startDate && !isEdit) missingFields.push('Tanggal Mulai');
    if (!endDate && !isEdit) missingFields.push('Tanggal Akhir');

    if (missingFields.length > 0) {
      showToast(`Lengkapi: ${missingFields.join(', ')}`, 'danger');
      return;
    }

    try {
      if (isEdit) {
        const payload: UpdateBudgetPayload = {
          account_id: accountId ? Number(accountId) : undefined,
          name: name.trim(),
          amount: amount ? parseInt(amount, 10) : undefined,
          period_type: periodType,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          repeat,
          is_active: isActive,
        };
        await onSubmit(payload);
      } else {
        const payload: CreateBudgetPayload = {
          account_id: Number(accountId),
          name: name.trim(),
          amount: parseInt(amount, 10),
          period_type: periodType,
          start_date: startDate,
          end_date: endDate,
          repeat,
        };
        await onSubmit(payload);
      }
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { borderColor: colors.border }]}>
        <Text variant="subtitle">
          {isEdit ? 'Edit Budget' : 'Buat Budget Baru'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        <AccountSearchSelect
          label="Akun Pengeluaran"
          value={accountId}
          onChange={setAccountId}
          placeholder="Cari akun..."
          type="expense"
          hasParent
          defaultAccountType="expense"
        />

        <Input
          label="Nama Budget"
          value={name}
          onChangeText={setName}
          placeholder="Contoh: Budget Makanan Juli"
        />

        <Input
          label="Jumlah Anggaran"
          value={amount ? formatNumber(amount) : ''}
          onChangeText={(text) => setAmount(text.replace(/\D/g, ''))}
          placeholder="0"
          keyboardType="number-pad"
        />

        <RadioGroup
          label="Tipe Periode"
          options={PERIOD_OPTIONS}
          value={periodType}
          onChange={handlePeriodChange}
        />

        <DateInput
          label="Tanggal Mulai"
          value={startDate}
          onChangeDate={setStartDate}
        />

        <DateInput
          label="Tanggal Akhir"
          value={endDate}
          onChangeDate={setEndDate}
        />

        <View style={styles.toggleRow}>
          <Text>Ulangi setiap periode</Text>
          <Button
            variant={repeat ? 'primary' : 'secondary'}
            label={repeat ? 'Ya' : 'Tidak'}
            onPress={() => setRepeat((v) => !v)}
            disabled={periodType === 'custom'}
          />
        </View>

        {isEdit && (
          <View style={styles.toggleRow}>
            <Text>Status Aktif</Text>
            <Button
              variant={isActive ? 'primary' : 'secondary'}
              label={isActive ? 'Aktif' : 'Nonaktif'}
              onPress={() => setIsActive((v) => !v)}
            />
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { borderColor: colors.border }]}>
        <Button variant="secondary" label="Batal" onPress={onCancel} />
        <Button
          label="Simpan"
          onPress={handleSubmit}
          disabled={!name.trim() || isSubmitting}
        />
      </View>
    </KeyboardAvoidingView>
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
