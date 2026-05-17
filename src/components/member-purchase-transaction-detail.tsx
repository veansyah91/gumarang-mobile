import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import { memberApi } from '@/src/services/api/member';
import { spacing } from '@/src/theme/tokens';
import type {
  PurchaseTransactionMemberInvoiceDetail,
  PurchaseTransactionMemberProduct,
} from '@/src/types/member';
import { formatIDR } from '@/src/utils/currency';
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
      <Text variant="subtitle">Detail pembelian belum bisa dimuat</Text>
      <Text tone="muted">{message}</Text>
    </Card>
  );
}

function ProductCard({ product }: { product: PurchaseTransactionMemberProduct }) {
  return (
    <Card>
      <Text variant="subtitle" style={styles.productTitle}>
        {product.name}
      </Text>
      <Text tone="muted">Berat: {formatWeight(product.weight, product.unit)}</Text>
      <Text tone="muted">Qty: {formatQuantity(product.qty)}</Text>
      <Text tone="muted">Nilai: {formatIDR(product.amount)}</Text>
    </Card>
  );
}

export function MemberPurchaseTransactionDetail() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const invoiceId = id ? Number(id) : Number.NaN;

  const query = useQuery({
    queryKey: ['member-purchase-transaction-detail', invoiceId],
    queryFn: () => memberApi.getPurchaseTransactionMember(invoiceId),
    enabled: Number.isFinite(invoiceId) && invoiceId > 0,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const data: PurchaseTransactionMemberInvoiceDetail | undefined = query.data;
  const errorMessage = query.error ? toAppError(query.error).userMessage : null;

  if (!Number.isFinite(invoiceId) || invoiceId <= 0) {
    return (
      <Screen scrollable contentContainerStyle={styles.content}>
        <Card>
          <Text variant="subtitle">ID pembelian tidak valid</Text>
          <Text tone="muted">Parameter detail pembelian tidak ditemukan.</Text>
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
            <Text tone="muted">Nilai Invoice: {formatIDR(data.value)}</Text>
          </Card>

          <View style={styles.section}>
            <Text variant="subtitle">Detail</Text>
            {data.products.length > 0 ? (
              data.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <Card>
                <Text tone="muted">Tidak ada produk pada invoice ini.</Text>
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
