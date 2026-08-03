import { useLocalSearchParams, useRouter } from 'expo-router';

import { InvestmentFormModal } from '@/src/components/investment-form-modal';
import { useInvestment, useUpdateInvestment } from '@/src/hooks/use-investment';
import { useToastStore } from '@/src/state/toast-store';
import type { UpdateInvestmentPayload } from '@/src/types/investment';

export default function EditInvestmentPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const assetId = Number(id);

  const { data: asset, isLoading, isError } = useInvestment(assetId);
  const updateAsset = useUpdateInvestment();
  const showToast = useToastStore((state) => state.showToast);

  if (isLoading) return null;
  if (isError || !asset) return null;

  const handleSubmit = async (payload: UpdateInvestmentPayload) => {
    await updateAsset.mutateAsync({
      id: assetId,
      payload,
    });
    showToast('Aset investasi berhasil diperbarui', 'success');
    router.back();
  };

  return (
    <InvestmentFormModal
      visible
      onClose={() => router.back()}
      onSubmit={handleSubmit}
      initialData={
        asset
          ? {
              name: asset.name,
              investment_type: asset.investment_type,
              icon: asset.icon,
              color: asset.color,
            }
          : null
      }
      isEdit
      isSubmitting={updateAsset.isPending}
    />
  );
}
