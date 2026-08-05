import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { BudgetDeleteConfirm } from '@/src/components/budget-delete-confirm';
import { Card } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { PersonalFinanceSubHeader } from '@/src/components/ui/personal-finance-sub-header';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import {
  useBudgetSummary,
  useBudgets,
  useDeleteBudget,
} from '@/src/hooks/use-budget';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { pfRoutes } from '@/src/navigation/personal-finance-routes';
import { useToastStore } from '@/src/state/toast-store';
import { palette, radius, spacing } from '@/src/theme/tokens';
import type { Budget } from '@/src/types/budget';
import { formatIDR } from '@/src/utils/currency';
import { toAppError } from '@/src/utils/errors';

function ProgressBar({
  percentage,
  alertType,
}: {
  percentage: number;
  alertType?: 'warning' | 'danger' | null;
}) {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const clampedPct = Math.min(percentage, 100);

  let barColor: string = colors.success;
  if (alertType === 'warning') barColor = colors.warning;
  if (alertType === 'danger') barColor = colors.danger;

  return (
    <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${clampedPct}%`,
            backgroundColor: barColor,
          },
        ]}
      />
    </View>
  );
}

function getAlertType(budget: Budget): 'warning' | 'danger' | null {
  if (!budget.alerts || budget.alerts.length === 0) return null;
  const dangerAlert = budget.alerts.find((a) => a.alert_type === 'danger' && a.is_triggered);
  if (dangerAlert) return 'danger';
  const warningAlert = budget.alerts.find((a) => a.alert_type === 'warning' && a.is_triggered);
  if (warningAlert) return 'warning';
  return null;
}

function BudgetCard({
  budget,
  onPress,
  onDelete,
}: {
  budget: Budget;
  onPress: () => void;
  onDelete: () => void;
}) {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const alertType = getAlertType(budget);
  const isOverBudget = budget.percentage_used >= 100;

  let borderColor: string = colors.border;
  if (alertType === 'warning') borderColor = colors.warning;
  if (alertType === 'danger') borderColor = colors.danger;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.budgetCard,
        {
          borderColor,
          backgroundColor: colors.surface,
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      <View style={styles.budgetHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.budgetName}>{budget.name}</Text>
          <Text tone="muted" style={styles.accountLabel}>
            {budget.account_name}
          </Text>
        </View>
        <Pressable
          onPress={onDelete}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </Pressable>
      </View>

      <ProgressBar percentage={budget.percentage_used} alertType={alertType} />

      <View style={styles.budgetStats}>
        <Text style={styles.spentText}>
          {formatIDR(budget.spent)}
          <Text tone="muted"> / {formatIDR(budget.amount)}</Text>
        </Text>
      </View>

      <View style={styles.budgetFooter}>
        <Text
          style={[
            styles.percentageText,
            {
              color: isOverBudget
                ? colors.danger
                : alertType === 'warning'
                  ? colors.warning
                  : colors.success,
            },
          ]}
        >
          {budget.percentage_used}%
        </Text>
        {budget.remaining > 0 ? (
          <Text tone="muted" style={styles.remainingText}>
            Sisa {formatIDR(budget.remaining)}
          </Text>
        ) : (
          <Text style={[styles.remainingText, { color: colors.danger }]}>
            Kelebihan {formatIDR(Math.abs(budget.remaining))}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function SummaryCard() {
  const { data: summary, isLoading } = useBudgetSummary();
  const theme = useResolvedTheme();
  const colors = palette[theme];

  if (isLoading || !summary) return null;

  const isOverBudget = summary.overall_percentage >= 100;

  return (
    <Card>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text tone="muted" style={styles.summaryLabel}>
            Total Budget
          </Text>
          <Text style={styles.summaryValue}>
            {formatIDR(summary.total_budget)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text tone="muted" style={styles.summaryLabel}>
            Terpakai
          </Text>
          <Text style={styles.summaryValue}>
            {formatIDR(summary.total_spent)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text tone="muted" style={styles.summaryLabel}>
            Sisa
          </Text>
          <Text
            style={[
              styles.summaryValue,
              { color: isOverBudget ? colors.danger : colors.success },
            ]}
          >
            {formatIDR(summary.total_remaining)}
          </Text>
        </View>
      </View>
      <View style={styles.summaryBar}>
        <ProgressBar percentage={summary.overall_percentage} />
        <Text
          style={[
            styles.summaryPct,
            { color: isOverBudget ? colors.danger : colors.text },
          ]}
        >
          {summary.overall_percentage}%
        </Text>
      </View>
      {summary.alert_budgets.length > 0 && (
        <View style={styles.alertRow}>
          <Ionicons name="warning-outline" size={16} color={colors.danger} />
          <Text tone="muted" style={styles.alertText}>
            {summary.alert_budgets.length} budget perlu perhatian
          </Text>
        </View>
      )}
    </Card>
  );
}

export default function BudgetListPage() {
  const router = useRouter();
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const { data, isLoading, isError, refetch } = useBudgets();
  const deleteBudget = useDeleteBudget();
  const showToast = useToastStore((state) => state.showToast);

  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [search, setSearch] = React.useState('');

  const budgets = data?.data ?? [];
  const filteredBudgets = search.trim()
    ? budgets.filter(
        (b) =>
          b.name.toLowerCase().includes(search.trim().toLowerCase()) ||
          (b.account_name ?? '').toLowerCase().includes(
            search.trim().toLowerCase(),
          ),
      )
    : budgets;
  const deleteItem = budgets.find((b) => b.id === deleteId);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBudget.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  return (
    <>
      <PersonalFinanceSubHeader
        title="Budget"
        rightAction={
          <Text style={[styles.headerCount, { color: colors.muted }]}>
            ({budgets.length})
          </Text>
        }
      />
      <Screen
        scrollable
        safeAreaEdges={['left', 'right', 'bottom']}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <View style={styles.container}>
          <SummaryCard />

          {isLoading ? (
            <View style={styles.skeletonList}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={120} />
              ))}
            </View>
          ) : isError ? (
            <View style={styles.centerState}>
              <Text tone="danger">Gagal memuat budget</Text>
              <Pressable onPress={() => refetch()} style={styles.retryButton}>
                <Text tone="muted">Coba Lagi</Text>
              </Pressable>
            </View>
          ) : budgets.length === 0 ? (
            <View style={styles.centerState}>
              <Ionicons
                name="wallet-outline"
                size={48}
                color={colors.muted}
              />
              <Text tone="muted" style={styles.emptyText}>
                Belum ada budget
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              <Input
                value={search}
                onChangeText={setSearch}
                placeholder="Cari budget..."
              />
              {filteredBudgets.length === 0 ? (
                <View style={styles.centerState}>
                  <Text tone="muted" style={styles.emptyText}>
                    Tidak ada budget yang cocok
                  </Text>
                </View>
              ) : (
                filteredBudgets.map((budget) => (
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    onPress={() =>
                      router.push(pfRoutes.budgetDetail(budget.id))
                    }
                    onDelete={() => setDeleteId(budget.id)}
                  />
                ))
              )}
            </View>
          )}
        </View>
      </Screen>

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() => router.push(pfRoutes.budgetCreate())}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      <BudgetDeleteConfirm
        visible={deleteId !== null}
        budgetName={deleteItem?.name ?? ''}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isDeleting={deleteBudget.isPending}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  skeletonList: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl * 2,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.sm,
  },
  emptyText: {
    marginTop: spacing.sm,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  budgetCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  budgetName: {
    fontSize: 15,
    fontWeight: '600',
  },
  accountLabel: {
    fontSize: 12,
    marginTop: 1,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  budgetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '700',
  },
  remainingText: {
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg * 2,
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryItem: {
    flex: 1,
    gap: 2,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryPct: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  alertText: {
    fontSize: 12,
  },
});
