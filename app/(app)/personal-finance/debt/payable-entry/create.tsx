import { useLocalSearchParams } from 'expo-router';

import { DebtEntryCreateForm } from '@/src/components/debt-entry-create-form';

export default function DebtPayableEntryCreatePage() {
  const { debtId, amount } = useLocalSearchParams<{
    debtId?: string;
    amount?: string;
  }>();

  return (
    <DebtEntryCreateForm
      debtType="payable"
      entryType="debit"
      initialDebtId={debtId}
      initialAmount={amount ? Number(amount) : undefined}
    />
  );
}
