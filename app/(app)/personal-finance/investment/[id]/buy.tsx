import { useLocalSearchParams, useRouter } from 'expo-router';

import { InvestmentSubHeader } from '@/src/components/ui/investment-sub-header';
import { Screen } from '@/src/components/ui/screen';
import { useBuyUnit, useInvestment } from '@/src/hooks/use-investment';
import { useToastStore } from '@/src/state/toast-store';
import { InvestmentBuySellModal } from '@/src/components/investment-buy-sell-modal';
import { toAppError } from '@/src/utils/errors';

export default function BuyUnitPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const assetId = Number(id);

  const { data: asset } = useInvestment(assetId);
  const buyUnit = useBuyUnit();
  const showToast = useToastStore((state) => state.showToast);

  const handleSubmit = async (payload: Record<string, unknown>) => {
    try {
      await buyUnit.mutateAsync({
        id: assetId,
        payload: payload as unknown as Parameters<typeof buyUnit.mutateAsync>[0]['payload'],
      });
      showToast('Unit berhasil dibeli', 'success');
      router.back();
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  return (
    <>
      <InvestmentSubHeader title="Beli Unit" />
      <Screen safeAreaEdges={['left', 'right', 'bottom']}>
        <InvestmentBuySellModal
          mode="buy"
          visible
          onClose={() => router.back()}
          onSubmit={handleSubmit}
          assetName={asset?.name ?? ''}
          unitQuantity={asset?.unit_quantity ?? 0}
          unitCostAvg={asset?.unit_cost_avg ?? 0}
          isSubmitting={buyUnit.isPending}
        />
      </Screen>
    </>
  );
}
