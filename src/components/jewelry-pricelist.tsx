import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/src/components/ui/card';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { catalogApi } from '@/src/services/api/catalog';
import { useAuthStore } from '@/src/state/auth-store';
import { palette, spacing } from '@/src/theme/tokens';
import { JewelryPriceTrend } from '@/src/types/catalog';

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
  trend: JewelryPriceTrend['trend'];
  difference: number;
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

  const pct = ((difference / prevSale) * 100).toFixed(2);
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

export function JewelryPricelist() {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading } = useQuery({
    queryKey: ['jewelry-price-list'],
    queryFn: () => catalogApi.getJewelryPriceList(),
    staleTime: 1000 * 60 * 5,
  });

  const theme = useResolvedTheme();
  const colors = palette[theme];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Skeleton height={100} />
      </View>
    );
  }

  if (!data) return null;

  return (
    <View style={styles.container}>
      {Object.entries(data).map(([key, item]) => {
        const cur = item.current.price;
        const prev = item.previous?.price;
        
        // Capitalize key for label
        const label = key.charAt(0).toUpperCase() + key.slice(1);

        return (
          <Card key={key}>
            <View style={styles.rowHeader}>
              <Text variant="eyebrow" style={{ color: colors.primary, marginBottom: 0 }}>
                Harga {label}
              </Text>
              <TrendBadge
                trend={item.trend}
                difference={item.difference}
                prevSale={prev?.saleValue}
              />
            </View>
            
            <View style={styles.priceDetails}>
              {user ? (
                <View style={styles.priceItem}>
                  <Text tone="muted" style={styles.priceLabel}>
                    Harga Beli
                  </Text>
                  <Text style={styles.priceValue}>
                    {formatIDR(cur.purchaseValue)}
                  </Text>
                </View>
              ) : (
                <View style={styles.priceItem}>
                  <Text tone="muted" style={styles.priceLabel}>
                    Harga Jual
                  </Text>
                  <Text style={styles.priceValue}>
                    {formatIDR(cur.saleValue)}
                  </Text>
                </View>
              )}
            </View>
            
            {item.current.date && (
              <Text tone="muted" style={styles.dateLabel}>
                Terakhir diperbarui: {item.current.date}
              </Text>
            )}
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  trendRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 3 
  },
  trendText: { 
    fontSize: 12,
    fontWeight: '600'
  },
  priceDetails: { 
    flexDirection: 'row', 
    gap: spacing.md 
  },
  priceItem: { 
    flex: 1 
  },
  priceLabel: { 
    fontSize: 11 
  },
  priceValue: { 
    fontSize: 15, 
    fontWeight: '700' 
  },
  dateLabel: { 
    fontSize: 10, 
    marginTop: spacing.sm,
    fontStyle: 'italic'
  },
});
