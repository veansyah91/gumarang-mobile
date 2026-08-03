import { useRouter } from 'expo-router';

import { BudgetForm } from '@/src/components/budget-form';
import { useCreateBudget } from '@/src/hooks/use-budget';
import { useToastStore } from '@/src/state/toast-store';
import { toAppError } from '@/src/utils/errors';

export default function CreateBudgetPage() {
  const router = useRouter();
  const createBudget = useCreateBudget();
  const showToast = useToastStore((state) => state.showToast);

  const handleSubmit = async (payload: unknown) => {
    try {
      await createBudget.mutateAsync(payload as any);
      showToast('Budget berhasil dibuat', 'success');
      router.back();
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  return (
    <BudgetForm
      mode="create"
      onSubmit={handleSubmit}
      isSubmitting={createBudget.isPending}
      onCancel={() => router.back()}
    />
  );
}
