import { useQuery } from '@tanstack/react-query';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import { memberApi } from '@/src/services/api/member';
import { spacing } from '@/src/theme/tokens';
import type { GoldListDetailData } from '@/src/types/member';
import { toAppError } from '@/src/utils/errors';

function toNumber(value: number | string | null | undefined) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatWeight(
  value: number | string | null | undefined,
  unit?: string,
) {
  if (unit == 'miligram' || unit === 'milligram' || unit === 'mg') {
    const weightInGrams = toNumber(value) / 1000;
    return `${weightInGrams.toFixed(2)} gram`;
  }
  return `${toNumber(value).toFixed(2)}${unit ? ` ${unit}` : ''}`;
}

function formatRupiah(value: number | string | null | undefined) {
  return toNumber(value).toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function getStatusTone(status: 'profit' | 'loss') {
  return status === 'loss' ? 'danger' : 'success';
}

function DetailSkeleton() {
  return (
    <View style={styles.section}>
      <Card>
        <Skeleton height={24} />
        <Skeleton height={18} />
        <Skeleton height={18} />
      </Card>
      <Card>
        <Skeleton height={18} />
        <Skeleton height={24} />
      </Card>
      <Card>
        <Skeleton height={18} />
        <Skeleton height={24} />
      </Card>
      <Card>
        <Skeleton height={18} />
        <Skeleton height={24} />
      </Card>
    </View>
  );
}

function DetailErrorState({
  message,
  onRetry,
  isRetrying,
}: {
  message: string;
  onRetry: () => void | Promise<void>;
  isRetrying: boolean;
}) {
  return (
    <Card>
      <Text variant="subtitle">Detail Emasku belum bisa dimuat</Text>
      <Text tone="muted">{message}</Text>
      <View style={styles.retryButton}>
        <Button
          label={isRetrying ? 'Memuat...' : 'Coba lagi'}
          onPress={onRetry}
          disabled={isRetrying}
          variant="secondary"
        />
      </View>
    </Card>
  );
}

export function MemberGoldDetail({
  productId,
}: {
  productId: number | string;
}) {
  const query = useQuery({
    queryKey: ['member-gold-list-detail', productId],
    queryFn: () => memberApi.getGoldListDetail(productId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const data: GoldListDetailData | undefined = query.data;
  const errorMessage = query.error ? toAppError(query.error).userMessage : null;

  return (
    <Screen scrollable contentContainerStyle={styles.content}>
      {query.isLoading && !data ? (
        <DetailSkeleton />
      ) : errorMessage && !data ? (
        <DetailErrorState
          message={errorMessage}
          onRetry={async () => {
            await query.refetch();
          }}
          isRetrying={query.isRefetching}
        />
      ) : data ? (
        <View style={styles.section}>
          <Card>
            <Text variant="eyebrow">Nama Produk</Text>
            <Text variant="subtitle">{data.product.name}</Text>
            <Text tone="muted">Kode: {data.product.code}</Text>
          </Card>

          <Card>
            <Text variant="eyebrow">Total Berat</Text>
            <Text variant="subtitle">
              {formatWeight(data.product.weight, data.product.unit)}
            </Text>
          </Card>

          <Card>
            <Text variant="eyebrow">Estimasi Nilai Saat Ini</Text>
            <Text variant="subtitle">
              {formatRupiah(data.summary.current_value)}
            </Text>
          </Card>

          <Card>
            <Text variant="eyebrow">Status</Text>
            <Text variant="subtitle" tone={getStatusTone(data.summary.status)}>
              {formatRupiah(data.summary.profit_loss)}
            </Text>
            <Text tone="muted">
              {data.summary.status === 'loss' ? 'Loss' : 'Profit'}
            </Text>
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  retryButton: {
    alignSelf: 'flex-start',
  },
});
