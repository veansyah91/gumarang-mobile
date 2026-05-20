import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import { memberApi } from '@/src/services/api/member';
import { radius, spacing } from '@/src/theme/tokens';
import type {
  GoldListPriceList,
  GoldListProduct,
  UnitKey,
} from '@/src/types/member';
import { toAppError } from '@/src/utils/errors';

function toNumber(value: number | string | null | undefined) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatWeight(value: number) {
  return `${value.toFixed(2)} gram`;
}

function formatPercentage(value: number) {
  const formatted = value.toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${formatted}%`;
}

function normalizeUnit(unit: string): UnitKey | null {
  const value = unit.trim().toLowerCase();

  if (value === 'gram' || value === 'gr') {
    return 'gram';
  }

  if (value === 'miligram' || value === 'milligram' || value === 'mg') {
    return 'miligram';
  }

  return null;
}

function getCurrentBuybackPrice(unit: UnitKey, priceList: GoldListPriceList) {
  return priceList[unit].purchaseValue;
}

function getComparableProductPrice(price: number, unit: UnitKey) {
  return unit === 'miligram' ? price / 10 : price;
}

function analyzeBuyback(
  productPrice: number,
  unit: UnitKey,
  priceList: GoldListPriceList,
): number {
  const comparablePrice = getComparableProductPrice(productPrice, unit);

  return (
    ((getCurrentBuybackPrice(unit, priceList) - comparablePrice) /
      comparablePrice) *
    100
  );
}

function getBuybackTone(value: number) {
  if (value > 0) {
    return 'success';
  }

  if (value < 0) {
    return 'danger';
  }

  return 'warning';
}

function GoldListLoadingState() {
  return (
    <View style={styles.section}>
      <Card>
        <Skeleton height={24} />
        <Skeleton height={18} />
        <Skeleton height={18} />
      </Card>

      <Card>
        <View style={styles.summaryGrid}>
          <Skeleton height={74} />
          <Skeleton height={74} />
        </View>
        <Skeleton height={74} />
      </Card>

      <Card>
        <Skeleton height={20} />
        <Skeleton height={64} />
        <Skeleton height={64} />
      </Card>

      <Card>
        <Skeleton height={120} />
        <Skeleton height={120} />
      </Card>
    </View>
  );
}

function GoldListErrorState({
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
      <Text variant="subtitle">Data belum bisa dimuat</Text>
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


function ProductCard({
  product,
  priceList,
  onPress,
}: {
  product: GoldListProduct;
  priceList: GoldListPriceList;
  onPress: () => void;
}) {
  const unit = normalizeUnit(product.unit);
  const productPrice = toNumber(product.price);
  const qty = toNumber(product.qty);
  let weight = toNumber(product.weight);

  if (unit === 'miligram') {
    weight = weight / 1000;
  }

  const buybackPercentage =
    unit && productPrice > 0
      ? analyzeBuyback(productPrice, unit, priceList)
      : null;
  const analysisTone =
    buybackPercentage == null ? 'muted' : getBuybackTone(buybackPercentage);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Card>
        <Text variant="subtitle" style={styles.productTitle}>
          {product.name}
        </Text>
        <View style={styles.productRow}>
          <Text tone="muted">Qty: {qty.toLocaleString('id-ID')}</Text>
          <Text tone={analysisTone} style={styles.productAnalysis}>
            {buybackPercentage == null
              ? '-'
              : formatPercentage(buybackPercentage)}
          </Text>
        </View>
        <Text tone="muted">Total Berat: {formatWeight(weight)}</Text>
      </Card>
    </Pressable>
  );
}

export function MemberGoldList() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const query = useQuery({
    queryKey: ['member-gold-list'],
    queryFn: () => memberApi.getGoldList(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const data = query.data;
  const errorMessage = query.error ? toAppError(query.error).userMessage : null;

  const summary = useMemo(() => {
    if (!data) {
      return null;
    }

    // Filter out products with qty === 0
    const filteredProducts = data.products.filter(
      (product) => toNumber(product.qty) > 0,
    );

    const totalProducts = filteredProducts.length;
    const totalWeight = filteredProducts.reduce(
      (sum, product) => sum + toNumber(product.weight),
      0,
    );
    const totalAmount = filteredProducts.reduce(
      (sum, product) => sum + toNumber(product.amount),
      0,
    );
    const totalEstimatedBuyback = filteredProducts.reduce((sum, product) => {
      const unit = normalizeUnit(product.unit);

      if (!unit) {
        return sum;
      }

      return sum + getCurrentBuybackPrice(unit, data.price_list);
    }, 0);

    return {
      filteredProducts,
      totalProducts,
      totalWeight,
      totalAmount,
      totalEstimatedBuyback,
    };
  }, [data]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await query.refetch();
    setIsRefreshing(false);
  };

  return (
    <Screen
      scrollable
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
      contentContainerStyle={styles.content}
    >
      {query.isLoading && !data ? (
        <GoldListLoadingState />
      ) : errorMessage && !data ? (
        <GoldListErrorState
          message={errorMessage}
          onRetry={async () => {
            await query.refetch();
          }}
          isRetrying={isRefreshing}
        />
      ) : data && summary ? (
        <View style={styles.section}>
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Text variant="eyebrow">Daftar Emas</Text>
              <Text tone="muted">
                {summary.totalProducts.toLocaleString('id-ID')} item
              </Text>
            </View>

            {summary.totalProducts === 0 ? (
              <Card>
                <Text variant="subtitle">Belum ada data emas</Text>
                <Text tone="muted">
                  Produk emas member akan muncul di halaman ini saat data sudah
                  tersedia.
                </Text>
              </Card>
            ) : (
              summary.filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priceList={data.price_list}
                  onPress={() => {
                    router.push({
                      pathname: '/(app)/gold-list/[id]',
                      params: { id: String(product.id) },
                    });
                  }}
                />
              ))
            )}
          </View>
        </View>
      ) : (
        <Card>
          <Text tone="muted">Data tidak tersedia.</Text>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  retryButton: {
    alignSelf: 'flex-start',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryItem: {
    width: '48%',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  summaryLabel: {
    fontSize: 11,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  priceRow: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  priceTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  priceValues: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  fieldLabel: {
    fontSize: 11,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  flexItem: {
    flex: 1,
  },
  listSection: {
    gap: spacing.sm,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productTitle: {
    marginBottom: 0,
    fontSize: 18,
    lineHeight: 24,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  productAnalysis: {
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
