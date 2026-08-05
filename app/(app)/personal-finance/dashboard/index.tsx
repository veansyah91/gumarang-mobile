import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  createEmptyFilterDraft,
  type FilterDraft,
} from '@/src/components/cash-filter-modal';
import { BaseFilterModal } from '@/src/components/ui/base-filter-modal';
import { Card } from '@/src/components/ui/card';
import { FixedAssetSubHeader } from '@/src/components/ui/fixed-asset-sub-header';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import { useDashboard } from '@/src/hooks/use-dashboard';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { palette, radius, spacing } from '@/src/theme/tokens';
import type { BudgetAlert, DueDebt, TopAccount } from '@/src/types/dashboard';
import { formatIDR } from '@/src/utils/currency';

function currentMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  return {
    start_date: `${year}-${month}-01`,
    end_date: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
  };
}

function formatDueDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return (
    <Card>
      <View style={[styles.iconArea, { backgroundColor: `${color}1A` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text tone="muted" variant="eyebrow">
        {label}
      </Text>
      <Text style={[styles.summaryValue, { color: color }]}>{value}</Text>
    </Card>
  );
}

function CashFlowCard({
  title,
  total,
  topAccounts,
  icon,
  color,
  href,
}: {
  title: string;
  total: number;
  topAccounts: TopAccount[];
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  href: string;
}) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(href as never)}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Card>
        <View style={styles.cashHeader}>
          <View style={[styles.iconArea, { backgroundColor: `${color}1A` }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
          <Text tone="muted" variant="eyebrow">
            {title}
          </Text>
        </View>
        <Text style={[styles.summaryValue, { color: color }]}>
          {formatIDR(total)}
        </Text>
        <View style={styles.topAccountList}>
          {topAccounts.slice(0, 3).map((account) => (
            <View key={account.account_id} style={styles.topAccountRow}>
              <Text tone="muted" numberOfLines={1} style={styles.topAccountName}>
                {account.account_name}
              </Text>
              <Text style={styles.topAccountAmount}>
                {formatIDR(account.total_amount)}
              </Text>
            </View>
          ))}
        </View>
      </Card>
    </Pressable>
  );
}

function BudgetBarColor(
  percentage: number,
  colors: { danger: string; warning: string; success: string },
) {
  if (percentage > 100) return colors.danger;
  if (percentage >= 80) return colors.warning;
  return colors.success;
}

function BudgetAlertItem({ item }: { item: BudgetAlert }) {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const router = useRouter();

  const barColor = BudgetBarColor(item.percentage_used, colors);
  const barWidth = Math.min(100, item.percentage_used);

  return (
    <Pressable
      onPress={() =>
        router.push(`/personal-finance/budget/${item.id}` as never)
      }
      style={({ pressed }) => [
        styles.budgetItem,
        { borderColor: colors.border, backgroundColor: colors.surface },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.budgetHeader}>
        <Text style={styles.budgetTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text tone="muted" style={styles.budgetAccount}>
          {item.account_name}
        </Text>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${barWidth}%`, backgroundColor: barColor },
          ]}
        />
      </View>

      <Text tone="muted" style={styles.budgetMeta}>
        {Math.round(item.percentage_used)}% dari {formatIDR(item.amount)}
      </Text>
    </Pressable>
  );
}

function DueDebtItem({ item }: { item: DueDebt }) {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const router = useRouter();

  const isReceivable = item.type === 'receivable';
  const accent = isReceivable ? colors.success : colors.danger;
  const target = isReceivable
    ? `/personal-finance/debt/receivable/${item.id}`
    : `/personal-finance/debt/payable/${item.id}`;

  return (
    <Pressable
      onPress={() => router.push(target as never)}
      style={({ pressed }) => [
        styles.dueItem,
        { borderColor: colors.border, backgroundColor: colors.surface },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.dueInfo}>
        <Text style={styles.dueTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text tone="muted" style={styles.dueSubtitle}>
          {item.contact_name || 'Tanpa kontak'} · {formatDueDate(item.due_date)}
        </Text>
      </View>

      <View style={styles.dueRight}>
        <Text style={[styles.dueBalance, { color: accent }]}>
          {formatIDR(item.balance)}
        </Text>
        <View style={[styles.dueBadge, { backgroundColor: `${accent}1A` }]}>
          <Text style={[styles.dueBadgeText, { color: accent }]}>
            {isReceivable ? 'Piutang' : 'Utang'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function SectionTitle({ children }: { children: string }) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  return (
    <Text variant="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
      {children}
    </Text>
  );
}

export default function DashboardPage() {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const initialRange = currentMonthRange();
  const [appliedStartDate, setAppliedStartDate] = useState(
    initialRange.start_date,
  );
  const [appliedEndDate, setAppliedEndDate] = useState(initialRange.end_date);
  const [filterDraft, setFilterDraft] = useState<FilterDraft>(
    createEmptyFilterDraft(),
  );
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const isDefaultRange =
    appliedStartDate === initialRange.start_date &&
    appliedEndDate === initialRange.end_date;
  const activeFilterCount = isDefaultRange ? 0 : 1;

  const { data, isLoading, isError, refetch } = useDashboard({
    start_date: appliedStartDate || undefined,
    end_date: appliedEndDate || undefined,
  });

  const handleOpenFilter = () => {
    setFilterDraft({
      search: '',
      startDate: appliedStartDate,
      endDate: appliedEndDate,
      selectedPreset: '',
    });
    setIsFilterVisible(true);
  };

  const handleSubmitFilter = () => {
    setAppliedStartDate(filterDraft.startDate);
    setAppliedEndDate(filterDraft.endDate);
    setIsFilterVisible(false);
  };

  const handleResetFilter = () => {
    setFilterDraft(createEmptyFilterDraft());
    setAppliedStartDate(initialRange.start_date);
    setAppliedEndDate(initialRange.end_date);
    setIsFilterVisible(false);
  };

  const dueDebts = [
    ...(data?.due_receivables ?? []),
    ...(data?.due_payables ?? []),
  ].sort((a, b) => a.due_date.localeCompare(b.due_date));

  if (isLoading) {
    return (
      <>
        <FixedAssetSubHeader title="Dasbor" />
        <Screen scrollable safeAreaEdges={['left', 'right']}>
          <View style={styles.content}>
            <View style={styles.summaryRow}>
              <Skeleton height={110} />
              <Skeleton height={110} />
            </View>
            <Skeleton height={80} />
            <View style={styles.summaryRow}>
              <Skeleton height={160} />
              <Skeleton height={160} />
            </View>
            <Skeleton height={80} />
          </View>
        </Screen>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <FixedAssetSubHeader title="Dasbor" />
        <Screen scrollable safeAreaEdges={['left', 'right']}>
          <View style={styles.centerState}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
            <Text tone="danger">Gagal memuat dashboard</Text>
            <Pressable onPress={() => refetch()} style={styles.retryButton}>
              <Text tone="muted">Coba Lagi</Text>
            </Pressable>
          </View>
        </Screen>
      </>
    );
  }

  return (
    <>
      <FixedAssetSubHeader title="Dasbor" />
      <Screen scrollable safeAreaEdges={['left', 'right']}>
      <View style={styles.content}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryField}>
            <SummaryCard
              label="Total Aset"
              value={formatIDR(data?.total_assets ?? 0)}
              icon="wallet-outline"
              color={colors.success}
            />
          </View>
          <View style={styles.summaryField}>
            <SummaryCard
              label="Total Utang"
              value={formatIDR(data?.total_debt ?? 0)}
              icon="alert-circle-outline"
              color={colors.danger}
            />
          </View>
        </View>

        {data && data.budget_alerts.length > 0 ? (
          <View style={styles.section}>
            <SectionTitle>Peringatan Budget</SectionTitle>
            <View style={styles.sectionList}>
              {data.budget_alerts.map((item) => (
                <BudgetAlertItem key={item.id} item={item} />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.summaryRow}>
          <View style={styles.summaryField}>
            <CashFlowCard
              title="Kas Masuk"
              total={data?.cash_in.total ?? 0}
              topAccounts={data?.cash_in.top_accounts ?? []}
              icon="trending-up-outline"
              color="#2563eb"
              href="/personal-finance/cash-in"
            />
          </View>
          <View style={styles.summaryField}>
            <CashFlowCard
              title="Kas Keluar"
              total={data?.cash_out.total ?? 0}
              topAccounts={data?.cash_out.top_accounts ?? []}
              icon="trending-down-outline"
              color={colors.danger}
              href="/personal-finance/cash-out"
            />
          </View>
        </View>

        {dueDebts.length > 0 ? (
          <View style={styles.section}>
            <SectionTitle>Akan Jatuh Tempo</SectionTitle>
            <View style={styles.sectionList}>
              {dueDebts.map((item) => (
                <DueDebtItem key={`${item.type}-${item.id}`} item={item} />
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </Screen>

    <Pressable
      onPress={handleOpenFilter}
      style={({ pressed }) => [
        styles.filterFab,
        {
          backgroundColor:
            activeFilterCount > 0 ? colors.warning : colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Ionicons
        name="filter-outline"
        size={22}
        color={activeFilterCount > 0 ? colors.background : colors.text}
      />
      {activeFilterCount > 0 && (
        <View style={[styles.filterBadge, { backgroundColor: colors.danger }]}>
          <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
        </View>
      )}
    </Pressable>

    <BaseFilterModal
      visible={isFilterVisible}
      draft={filterDraft}
      onChangeDraft={setFilterDraft}
      onClose={() => setIsFilterVisible(false)}
      onSubmit={handleSubmitFilter}
      onReset={handleResetFilter}
    />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryField: {
    flex: 1,
  },
  iconArea: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  cashHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  topAccountList: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  topAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  topAccountName: {
    flex: 1,
    fontSize: 12,
  },
  topAccountAmount: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
  },
  sectionList: {
    gap: spacing.sm,
  },
  budgetItem: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  budgetTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  budgetAccount: {
    fontSize: 12,
  },
  progressTrack: {
    height: 8,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  budgetMeta: {
    fontSize: 12,
  },
  dueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  dueInfo: {
    flex: 1,
    gap: 2,
  },
  dueTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  dueSubtitle: {
    fontSize: 12,
  },
  dueRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  dueBalance: {
    fontSize: 14,
    fontWeight: '700',
  },
  dueBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  dueBadgeText: {
    fontSize: 10,
    fontWeight: '700',
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
  filterFab: {
    position: 'absolute',
    bottom: spacing.lg * 2,
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
