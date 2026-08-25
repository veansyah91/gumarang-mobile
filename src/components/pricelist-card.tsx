import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/ui/card';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { homeApi } from '@/src/services/api/home';
import { memberApi } from '@/src/services/api/member';
import { useAuthStore } from '@/src/state/auth-store';

import { palette, spacing } from '@/src/theme/tokens';
import type {
  PriceListsDashboardTrend,
  TransactionDashboardTrend,
} from '@/src/types/home';

function formatTodayID() {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatIDR(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

function TrendBadge({
  trend,
  difference,
  prevSale,
}: {
  trend: TransactionDashboardTrend['trend'];
  difference: number | null;
  prevSale: number | null | undefined;
}) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  if (!trend || !prevSale)
    return (
      <Text style={styles.trendText} tone="muted">
        -
      </Text>
    );

  const pct = (((difference ?? 0) / prevSale) * 100).toFixed(2);
  const color =
    trend === 'up'
      ? colors.success
      : trend === 'down'
        ? colors.danger
        : colors.muted;
  const iconName: React.ComponentProps<typeof Ionicons>['name'] =
    trend === 'up' ? 'arrow-up' : trend === 'down' ? 'arrow-down' : 'remove';

  return (
    <View style={styles.trendRow}>
      <Ionicons name={iconName} size={12} color={color} />
      <Text style={[styles.trendText, { color }]}>{pct}%</Text>
    </View>
  );
}

type PriceItem = {
  label: string;
  data: TransactionDashboardTrend;
};

export function PricelistCard() {
  const user = useAuthStore((state) => state.user);

  const summaryQuery = useQuery({
    queryKey: ['member-dashboard-summary'],
    queryFn: () => memberApi.getDashboardSummary(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: !!user,
  });

  const homeQuery = useQuery({
    queryKey: ['home-data'],
    queryFn: homeApi.getHomeData,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: !user,
  });

  const theme = useResolvedTheme();
  const colors = palette[theme];
  const priceData: PriceListsDashboardTrend | undefined = user
    ? summaryQuery.data?.price_list_trend
    : homeQuery.data?.priceListTrend;

  const isLoading = user ? summaryQuery.isLoading : homeQuery.isLoading;

  const buildTenGram = (): TransactionDashboardTrend | null => {
    if (!priceData) return null;
    const g = priceData.gram;
    const curPrice = g.current?.price;
    const prevPrice = g.previous?.price;
    const diff =
      curPrice && prevPrice
        ? curPrice.saleValue * 10 - prevPrice.saleValue * 10
        : null;
    const trend: TransactionDashboardTrend['trend'] =
      diff == null ? null : diff > 0 ? 'up' : diff < 0 ? 'down' : 'equal';
    return {
      current: {
        date: g.current?.date ?? null,
        price: curPrice
          ? {
              saleValue: curPrice.saleValue * 10,
              purchaseValue: curPrice.purchaseValue * 10,
            }
          : { saleValue: 0, purchaseValue: 0 },
      },
      previous: prevPrice
        ? {
            date: g.previous?.date ?? null,
            price: {
              saleValue: prevPrice.saleValue * 10,
              purchaseValue: prevPrice.purchaseValue * 10,
            },
          }
        : null,
      difference: diff,
      trend,
    };
  };

  const items: PriceItem[] = priceData
    ? [
        { label: 'Logam Mulia 0,1g', data: priceData.miligram },
        { label: 'Logam Mulia 1g', data: priceData.gram },
        { label: 'Logam Mulia 10g', data: buildTenGram()! },
      ]
    : [];

  return (
    <Card>
      <Text variant="eyebrow" style={{ color: colors.primary }}>
        Harga Emas
      </Text>

      {isLoading && !priceData ? (
        <View style={{ gap: spacing.sm }}>
          <Skeleton height={56} />
          <Skeleton height={56} />
          <Skeleton height={56} />
        </View>
      ) : items.length === 0 ? (
        <Text tone="muted">Data tidak tersedia</Text>
      ) : (
        items.map(({ label, data }) => {
          const cur = data.current?.price;
          const prev = data.previous?.price;
          return (
            <View
              key={label}
              style={[styles.priceRow, { borderColor: colors.border }]}
            >
              <View style={styles.rowHeader}>
                <Text style={styles.unitLabel}>{label}</Text>
                <TrendBadge
                  trend={data.trend}
                  difference={data.difference}
                  prevSale={prev?.saleValue}
                />
              </View>
              <View style={styles.priceDetails}>
                {user ? (
                  <View style={styles.priceItem}>
                    <Text tone="muted" style={styles.priceLabel}>
                      Beli
                    </Text>
                    <Text style={styles.priceValue}>
                      {cur ? formatIDR(cur.purchaseValue) : '-'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.priceItem}>
                    <Text tone="muted" style={styles.priceLabel}>
                      Jual
                    </Text>
                    <Text style={styles.priceValue}>
                      {cur ? formatIDR(cur.saleValue) : '-'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })
      )}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center', // Menjaga teks tetap sejajar secara vertikal
        }}
      >
        <Text tone="muted" style={[styles.dateLabel, { fontStyle: 'italic' }]}>
          Per tanggal
        </Text>
        <Text tone="muted" style={[styles.dateLabel, { fontStyle: 'italic' }]}>
          {formatTodayID()}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  priceRow: {
    borderWidth: 1,
    borderRadius: 6,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitLabel: { fontSize: 13, fontWeight: '600' },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  trendText: { fontSize: 11 },
  priceDetails: { flexDirection: 'row', gap: spacing.md },
  priceItem: { flex: 1 },
  priceLabel: { fontSize: 11 },
  priceValue: { fontSize: 13, fontWeight: '700' },
  dateLabel: { fontSize: 12, marginTop: -spacing.sm },
});
