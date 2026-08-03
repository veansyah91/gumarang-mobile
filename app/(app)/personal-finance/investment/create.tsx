import { useLocalSearchParams, useRouter } from 'expo-router';

import { InvestmentFormModal } from '@/src/components/investment-form-modal';
import { useCreateInvestment } from '@/src/hooks/use-investment';
import { useToastStore } from '@/src/state/toast-store';
import type { CreateInvestmentPayload, UpdateInvestmentPayload } from '@/src/types/investment';

export default function CreateInvestmentPage() {
  const router = useRouter();
  const { parentId: parentIdParam } = useLocalSearchParams<{ parentId?: string }>();
  const initialParentId = parentIdParam ? Number(parentIdParam) : null;

  const createAsset = useCreateInvestment();
  const showToast = useToastStore((state) => state.showToast);

  const handleSubmit = async (payload: CreateInvestmentPayload | UpdateInvestmentPayload) => {
    await createAsset.mutateAsync(payload as CreateInvestmentPayload);
    showToast('Aset investasi berhasil ditambahkan', 'success');
    router.back();
  };

  return (
    <InvestmentFormModal
      visible
      onClose={() => router.back()}
      onSubmit={handleSubmit}
      isSubmitting={createAsset.isPending}
      parentId={initialParentId}
    />
  );
}
