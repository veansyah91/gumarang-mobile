import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import { memberApi } from '@/src/services/api/member';
import { spacing } from '@/src/theme/tokens';
import type {
    GoldConvertionDetail,
    GoldConvertionProduct,
} from '@/src/types/member';
import { formatDateID } from '@/src/utils/date';
import { toAppError } from '@/src/utils/errors';

function toNumber(value: number | string | null | undefined) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatWeight(value: number | string | null | undefined, unit: string) {
  const formatted = toNumber(value).toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return `${formatted} ${unit}`;
}

function formatQuantity(value: number | string | null | undefined) {
  return toNumber(value).toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function DetailSkeleton() {
  return (
    <View style={styles.section}>
      <Card>
        <Skeleton height={24} />
        <Skeleton height={20} />
        <Skeleton height={20} />
      </Card>
      <Skeleton height={170} />
      <Skeleton height={170} />
    </View>
  );
}

function DetailErrorState({ message }: { message: string }) {
  return (
    <Card>
      <Text variant="subtitle">Detail tukar emas belum bisa dimuat</Text>
      <Text tone="muted">{message}</Text>
    </Card>
  );
}

function ProductCard({ product }: { product: GoldConvertionProduct }) {
  return (
    <Card>
      <Text variant="subtitle" style={styles.productTitle}>
        {product.product_name}
      </Text>
      <Text tone="muted">
        Berat: {formatWeight(product.weight, product.unit)}
      </Text>
      <Text tone="muted">Qty: {formatQuantity(product.qty)}</Text>
    </Card>
  );
}

export function MemberGoldConvertionDetail() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const convertionId = id ? Number(id) : Number.NaN;

  const query = useQuery({
    queryKey: ['member-gold-convertion-detail', convertionId],
    queryFn: () => memberApi.getGoldConvertion(convertionId),
    enabled: Number.isFinite(convertionId) && convertionId > 0,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const data: GoldConvertionDetail | undefined = query.data;
  const errorMessage = query.error ? toAppError(query.error).userMessage : null;

  const groupedProducts = useMemo(() => {
    if (!data?.products) return { start: [], end: [] };

    return {
      start: data.products.filter((p) => p.status === 'start'),
      end: data.products.filter((p) => p.status === 'end'),
    };
  }, [data?.products]);

  if (!Number.isFinite(convertionId) || convertionId <= 0) {
    return (
      <Screen scrollable contentContainerStyle={styles.content}>
        <Card>
          <Text variant="subtitle">ID tukar emas tidak valid</Text>
          <Text tone="muted">Parameter detail tukar emas tidak ditemukan.</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scrollable contentContainerStyle={styles.content}>
      {query.isLoading && !data ? (
        <DetailSkeleton />
      ) : errorMessage && !data ? (
        <DetailErrorState message={errorMessage} />
      ) : data ? (
        <View style={styles.section}>
          <Card>
            <Text variant="eyebrow">No. Invoice</Text>
            <Text variant="subtitle">{data.no_ref}</Text>
            <Text tone="muted">Tanggal: {formatDateID(data.date)}</Text>
          </Card>

          <View style={styles.section}>
            <Text variant="subtitle">Awal Emas</Text>
            {groupedProducts.start.length > 0 ? (
              groupedProducts.start.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <Card>
                <Text tone="muted">Tidak ada produk awal emas.</Text>
              </Card>
            )}
          </View>

          <View style={styles.section}>
            <Text variant="subtitle">Akhir Emas</Text>
            {groupedProducts.end.length > 0 ? (
              groupedProducts.end.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <Card>
                <Text tone="muted">Tidak ada produk akhir emas.</Text>
              </Card>
            )}
          </View>
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
  productTitle: {
    marginBottom: 0,
  },
});
