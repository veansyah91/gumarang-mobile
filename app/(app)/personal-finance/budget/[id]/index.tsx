import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { BudgetDeleteConfirm } from '@/src/components/budget-delete-confirm';
import { BudgetSubHeader } from '@/src/components/ui/budget-sub-header';
import { Button } from '@/src/components/ui/button';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import { useBudget, useDeleteBudget } from '@/src/hooks/use-budget';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { pfRoutes } from '@/src/navigation/personal-finance-routes';
import { useToastStore } from '@/src/state/toast-store';
import { palette, radius, spacing } from '@/src/theme/tokens';
import type { BudgetAlert } from '@/src/types/budget';
import { formatIDR } from '@/src/utils/currency';
import { toAppError } from '@/src/utils/errors';

const PERIOD_LABELS: Record<string, string> = {
  monthly: 'Bulanan',
  yearly: 'Tahunan',
  custom: 'Kustom',
};

function DetailRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: Record<string, string>;
}) {
  return (
    <View style={styles.detailRow}>
      <Text tone="muted" style={styles.detailLabel}>
        {label}
      </Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function AlertItem({ alert }: { alert: BudgetAlert }) {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const isDanger = alert.alert_type === 'danger';
  const iconName = isDanger ? 'alert-circle' : 'warning';
  const iconColor = isDanger ? colors.danger : colors.warning;

  return (
    <View
      style={[
        styles.alertItem,
        {
          backgroundColor: isDanger
            ? colors.danger + '15'
            : colors.warning + '15',
          borderColor: iconColor,
        },
      ]}
    >
      <Ionicons name={iconName as any} size={20} color={iconColor} />
      <View style={styles.alertContent}>
        <Text
          style={[styles.alertTitle, { color: iconColor }]}
        >
          {isDanger ? 'Over Budget' : 'Peringatan Anggaran'}
        </Text>
        <Text tone="muted" style={styles.alertDesc}>
          Pengeluaran mencapai {alert.threshold_percentage}% dari limit
        </Text>
      </View>
    </View>
  );
}

export default function BudgetDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const budgetId = Number(id);

  const theme = useResolvedTheme();
  const colors = palette[theme];

  const { data: budget, isLoading, isError, refetch } = useBudget(budgetId);
  const deleteBudget = useDeleteBudget();
  const showToast = useToastStore((state) => state.showToast);

  const [deleteVisible, setDeleteVisible] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteBudget.mutateAsync(budgetId);
      setDeleteVisible(false);
      router.back();
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  if (isLoading) {
    return (
      <>
        <BudgetSubHeader title="Detail Budget" />
        <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
          <View style={styles.skeletonList}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={48} />
            ))}
          </View>
        </Screen>
      </>
    );
  }

  if (isError || !budget) {
    return (
      <>
        <BudgetSubHeader title="Detail Budget" />
        <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
          <View style={styles.centerState}>
            <Text tone="danger">Gagal memuat detail budget</Text>
            <Pressable onPress={() => refetch()} style={styles.retryButton}>
              <Text tone="muted">Coba Lagi</Text>
            </Pressable>
          </View>
        </Screen>
      </>
    );
  }

  const isOverBudget = budget.percentage_used >= 100;
  const alerts = budget.alerts ?? [];

  return (
    <>
      <BudgetSubHeader title="Detail Budget" />
      <Screen
        scrollable
        safeAreaEdges={['left', 'right', 'bottom']}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <View style={styles.container}>
          <View
            style={[
              styles.budgetCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={styles.budgetName}>{budget.name}</Text>
            <Text tone="muted" style={styles.accountName}>
              {budget.account_name}
            </Text>

            <View style={styles.bigNumberRow}>
              <View style={styles.bigNumberItem}>
                <Text
                  style={[
                    styles.bigNumber,
                    {
                      color: isOverBudget ? colors.danger : colors.success,
                    },
                  ]}
                >
                  {formatIDR(budget.spent)}
                </Text>
                <Text tone="muted" style={styles.bigLabel}>
                  Terpakai
                </Text>
              </View>
              <View style={styles.bigNumberItem}>
                <Text style={styles.bigNumber}>
                  {formatIDR(budget.amount)}
                </Text>
                <Text tone="muted" style={styles.bigLabel}>
                  Limit
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.progressTrack,
                { backgroundColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(budget.percentage_used, 100)}%`,
                    backgroundColor: isOverBudget
                      ? colors.danger
                      : colors.primary,
                  },
                ]}
              />
            </View>

            <View style={styles.percentageRow}>
              <Text
                style={{
                  color: isOverBudget ? colors.danger : colors.text,
                  fontWeight: '700',
                }}
              >
                {budget.percentage_used}%
              </Text>
              <Text tone="muted">
                Sisa {formatIDR(budget.remaining)}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.detailCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <DetailRow
              label="Periode"
              value={`${budget.start_date} - ${budget.end_date}`}
              colors={colors}
            />
            <DetailRow
              label="Tipe Periode"
              value={PERIOD_LABELS[budget.period_type] ?? budget.period_type}
              colors={colors}
            />
            <DetailRow
              label="Ulangi"
              value={budget.repeat ? 'Ya' : 'Tidak'}
              colors={colors}
            />
            <DetailRow
              label="Status"
              value={budget.is_active ? 'Aktif' : 'Nonaktif'}
              colors={colors}
            />
          </View>

          {alerts.length > 0 && (
            <View style={styles.alertsSection}>
              <Text variant="subtitle" style={styles.sectionTitle}>
                Peringatan ({alerts.length})
              </Text>
              <View style={styles.alertsList}>
                {alerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </View>
            </View>
          )}

          <View style={styles.actionRow}>
            <Button
              label="Edit Budget"
              variant="primary"
              onPress={() =>
                router.push(pfRoutes.budgetEdit(budgetId))
              }
            />
            <Button
              label="Hapus Budget"
              variant="danger"
              onPress={() => setDeleteVisible(true)}
            />
          </View>
        </View>
      </Screen>

      <BudgetDeleteConfirm
        visible={deleteVisible}
        budgetName={budget.name}
        onClose={() => setDeleteVisible(false)}
        onConfirm={handleDelete}
        isDeleting={deleteBudget.isPending}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.md,
  },
  skeletonList: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.sm,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  budgetCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  budgetName: {
    fontSize: 20,
    fontWeight: '700',
  },
  accountName: {
    fontSize: 14,
    marginTop: -spacing.sm,
  },
  bigNumberRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  bigNumberItem: {
    flex: 1,
    gap: 2,
  },
  bigNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  bigLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressTrack: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertsSection: {
    gap: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  alertsList: {
    gap: spacing.sm,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  alertContent: {
    flex: 1,
    gap: 2,
  },
  alertTitle: {
    fontWeight: '600',
    fontSize: 14,
  },
  alertDesc: {
    fontSize: 12,
  },
  actionRow: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl * 2,
  },
});
