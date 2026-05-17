import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import { memberApi } from '@/src/services/api/member';
import { radius, spacing } from '@/src/theme/tokens';
import type { CertificateDetail, CertificateProduct } from '@/src/types/certificate';
import { formatDateID } from '@/src/utils/date';
import { toAppError } from '@/src/utils/errors';

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatWeight(value: number | string | null | undefined) {
  return `${toNumber(value).toFixed(2)} gram`;
}

function ProductDimensions({ product }: { product: CertificateProduct }) {
  const dimensions = [
    { label: 'Panjang', value: product.length },
    { label: 'Lebar', value: product.width },
    { label: 'Tebal', value: product.height },
    { label: 'Diameter', value: product.diameter },
  ].filter((item) => toNumber(item.value) > 0);

  if (dimensions.length === 0) {
    return null;
  }

  return (
    <View style={styles.dimensions}>
      {dimensions.map((dimension) => (
        <Text key={dimension.label} tone="muted">
          {dimension.label} (mm): {toNumber(dimension.value).toFixed(2)}
        </Text>
      ))}
    </View>
  );
}

function DetailSkeleton() {
  return (
    <View style={styles.section}>
      <Card>
        <Skeleton height={24} />
        <Skeleton height={20} />
        <Skeleton height={20} />
      </Card>
      <Skeleton height={180} />
      <Skeleton height={180} />
    </View>
  );
}

function DetailErrorState({ message }: { message: string }) {
  return (
    <Card>
      <Text variant="subtitle">Detail certificate belum bisa dimuat</Text>
      <Text tone="muted">{message}</Text>
    </Card>
  );
}

export function MemberCertificateDetail() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const certificateId = id ? Number(id) : Number.NaN;

  const query = useQuery({
    queryKey: ['member-certificate-detail', certificateId],
    queryFn: () => memberApi.getCertificate(certificateId),
    enabled: Number.isFinite(certificateId) && certificateId > 0,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const data: CertificateDetail | undefined = query.data;
  const errorMessage = query.error ? toAppError(query.error).userMessage : null;

  if (!Number.isFinite(certificateId) || certificateId <= 0) {
    return (
      <Screen scrollable contentContainerStyle={styles.content}>
        <Card>
          <Text variant="subtitle">ID certificate tidak valid</Text>
          <Text tone="muted">Parameter detail certificate tidak ditemukan.</Text>
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
            <Text variant="eyebrow">No. Sertifikat</Text>
            <Text variant="subtitle">{data.no_ref}</Text>
            <Text tone="muted">Tanggal Pembuatan: {formatDateID(data.created_at)}</Text>
            <Text tone="muted">Total Berat (gram): {formatWeight(data.weight)}</Text>
          </Card>

          <View style={styles.section}>
            <Text variant="subtitle">Detail Produk</Text>
            {data.products.length > 0 ? (
              data.products.map((product) => (
                <Card key={product.id}>
                  <Text variant="subtitle" style={styles.productTitle}>
                    {product.name}
                  </Text>
                  <Text tone="muted">Qty: {toNumber(product.qty)}</Text>
                  <Text tone="muted">Berat (gram): {formatWeight(product.weight)}</Text>
                  <ProductDimensions product={product} />
                </Card>
              ))
            ) : (
              <Card>
                <Text tone="muted">Tidak ada produk pada certificate ini.</Text>
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
  dimensions: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: spacing.xs,
  },
});
