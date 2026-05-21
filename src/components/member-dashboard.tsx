import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Card } from '@/src/components/ui/card';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { memberApi } from '@/src/services/api/member';
import { palette, spacing } from '@/src/theme/tokens';

function formatWeight(value: number | undefined) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '-';
  }
  return `${value.toFixed(2)} gram`;
}

function formatIDR(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

type MetricItemProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  label: string;
  value: string | undefined;
  isLoading: boolean;
  fullWidth?: boolean;
};

function MetricItem({
  icon,
  iconColor,
  label,
  value,
  isLoading,
  fullWidth,
}: MetricItemProps) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  return (
    <View
      style={[
        styles.metricItem,
        { borderColor: colors.border, backgroundColor: colors.surface },
        fullWidth && styles.metricItemFull,
      ]}
    >
      <Ionicons name={icon} size={20} color={iconColor} />
      <Text tone="muted" style={styles.metricLabel}>
        {label}
      </Text>
      {isLoading && !value ? (
        <Skeleton height={20} />
      ) : (
        <Text style={styles.metricValue}>{value ?? '-'}</Text>
      )}
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  return (
    <Text style={[styles.sectionLabel, { color: colors.muted }]}>
      {children}
    </Text>
  );
}

export function MemberDashboard() {
  const [isRefetching, setIsRefetching] = useState(false);
  const summaryQuery = useQuery({
    queryKey: ['member-dashboard-summary'],
    queryFn: () => memberApi.getDashboardSummary(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const theme = useResolvedTheme();
  const colors = palette[theme];
  const d = summaryQuery.data;
  const isLoading = summaryQuery.isLoading;

  const handleRefresh = async () => {
    setIsRefetching(true);
    try {
      await summaryQuery.refetch();
    } finally {
      setIsRefetching(false);
    }
  };

  const totalDepositos = d?.depositos?.reduce(
    (sum, x) => sum + parseFloat(String(x.total_amount)),
    0,
  );
  const totalWithdraws = d?.withdraws?.reduce(
    (sum, x) => sum + parseFloat(String(x.total_amount)),
    0,
  );

  const profitColor = (d?.user_profit ?? 0) >= 0 ? '#22c55e' : '#ef4444';

  return (
    <Card>
      {/* Title */}
      <View style={styles.titleRow}>
        <Text variant="eyebrow" style={{ color: colors.primary }}>
          Dashboard
        </Text>
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={isRefetching}
          style={[styles.refreshButton, { opacity: isRefetching ? 0.5 : 1 }]}
        >
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Emasku */}
      <SectionLabel>Emasku</SectionLabel>
      <View style={styles.gridContainer}>
        {/* Baris 1 */}
        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <MetricItem
              icon="cube-outline"
              iconColor="#16a34a"
              label="Saldo Emas (gram)"
              value={
                d?.user_product_weight != null
                  ? formatWeight(d.user_product_weight)
                  : undefined
              }
              isLoading={isLoading}
            />
          </View>
          <View style={styles.gridItem}>
            <MetricItem
              icon="trending-up-outline"
              iconColor={profitColor}
              label="Keuntungan"
              value={
                d?.user_profit != null ? formatIDR(d.user_profit) : undefined
              }
              isLoading={isLoading}
            />
          </View>
        </View>

        {/* Baris 2 */}
        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <MetricItem
              icon="receipt-outline"
              iconColor="#0891b2"
              label="Pembelian Emas"
              value={
                d?.sale_invoice != null ? formatIDR(d.sale_invoice) : undefined
              }
              isLoading={isLoading}
            />
          </View>
          <View style={styles.gridItem}>
            <MetricItem
              icon="cart-outline"
              iconColor="#e11d48"
              label="Penjualan Emas"
              value={
                d?.purchase_invoice != null
                  ? formatIDR(d.purchase_invoice)
                  : undefined
              }
              isLoading={isLoading}
            />
          </View>
        </View>
      </View>

      {/* Tabungan */}
      <SectionLabel>Tabungan</SectionLabel>
      <View style={styles.savingSection}>
        {/* Tabungan Emas (Full Width) */}
        <MetricItem
          icon="save-outline"
          iconColor="#059669"
          label="Tabungan Emas"
          value={
            d?.user_saving_weight != null
              ? formatWeight(d.user_saving_weight)
              : undefined
          }
          isLoading={isLoading}
          fullWidth
        />

        {/* Setoran & Penarikan (Row Flex dengan lebar sama) */}
        <View style={styles.savingRow}>
          <View style={styles.savingRowItem}>
            <MetricItem
              icon="arrow-down-circle-outline"
              iconColor="#2563eb"
              label="Setoran"
              value={formatWeight(totalDepositos)}
              isLoading={isLoading}
            />
          </View>
          <View style={styles.savingRowItem}>
            <MetricItem
              icon="arrow-up-circle-outline"
              iconColor="#dc2626"
              label="Penarikan"
              value={formatWeight(totalWithdraws)}
              isLoading={isLoading}
            />
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  refreshButton: {
    padding: spacing.xs,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  // Container utama untuk layout vertikal (Emasku & Tabungan)
  gridContainer: {
    gap: spacing.sm, // Jarak vertikal antar-baris
  },
  savingSection: {
    gap: spacing.sm, // Jarak vertikal di area Tabungan
  },
  // Baris horizontal (Bisa digunakan untuk grid Emasku maupun baris Tabungan)
  gridRow: {
    flexDirection: 'row',
    gap: spacing.sm, // Jarak horizontal antar-kolom
    width: '100%',
  },
  savingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  // Pembungkus item agar membagi ruang secara adil (50% - 50%)
  gridItem: {
    flex: 1,
  },
  savingRowItem: {
    flex: 1,
  },
  // Komponen Card Metric tunggal
  metricItem: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  metricItemFull: {
    width: '100%',
  },
  metricLabel: {
    fontSize: 11,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
  },
});
