import { useLocalSearchParams } from 'expo-router';

import { DebtEntryEditForm } from '@/src/components/debt-entry-edit-form';

export default function DebtReceivableEntryEditPage() {
  const { id, debtId: debtIdParam } = useLocalSearchParams<{
    id: string;
    debtId?: string;
  }>();

  return (
    <DebtEntryEditForm
      debtId={Number(debtIdParam)}
      entryId={Number(id)}
      debtType="receivable"
    />
  );
}
