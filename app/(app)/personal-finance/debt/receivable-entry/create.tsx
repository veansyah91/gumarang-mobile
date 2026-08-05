import { useLocalSearchParams } from 'expo-router';

import { DebtEntryCreateForm } from '@/src/components/debt-entry-create-form';

export default function DebtReceivableEntryCreatePage() {
  const { debtId, amount } = useLocalSearchParams<{
    debtId?: string;
    amount?: string;
  }>();

  return (
    <DebtEntryCreateForm
      debtType="receivable"
      entryType="credit"
      initialDebtId={debtId}
      initialAmount={amount ? Number(amount) : undefined}
    />
  );
}
