import { useLocalSearchParams, useRouter } from 'expo-router';

import { BudgetForm } from '@/src/components/budget-form';
import { useBudget, useUpdateBudget } from '@/src/hooks/use-budget';
import { useToastStore } from '@/src/state/toast-store';
import type {
  CreateBudgetPayload,
  UpdateBudgetPayload,
} from '@/src/types/budget';
import { toAppError } from '@/src/utils/errors';

export default function EditBudgetPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const budgetId = Number(id);

  const { data: budget, isLoading } = useBudget(budgetId);
  const updateBudget = useUpdateBudget();
  const showToast = useToastStore((state) => state.showToast);

  const handleSubmit = async (
    payload: CreateBudgetPayload | UpdateBudgetPayload,
  ) => {
    try {
      await updateBudget.mutateAsync({ id: budgetId, payload });
      showToast('Budget berhasil diperbarui', 'success');
      router.back();
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  if (isLoading) return null;
  if (!budget) return null;

  return (
    <BudgetForm
      mode="edit"
      initialData={{
        account_id: budget.account_id,
        name: budget.name,
        amount: budget.amount,
        period_type: budget.period_type,
        start_date: budget.start_date,
        end_date: budget.end_date,
        repeat: budget.repeat,
        is_active: budget.is_active,
      }}
      onSubmit={handleSubmit}
      isSubmitting={updateBudget.isPending}
      onCancel={() => router.back()}
    />
  );
}
