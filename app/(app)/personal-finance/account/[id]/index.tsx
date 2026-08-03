import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { CoaDeleteConfirm } from '@/src/components/coa-delete-confirm';
import { CoaFormModal } from '@/src/components/coa-form-modal';
import { FixedAssetSubHeader } from '@/src/components/ui/fixed-asset-sub-header';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import {
  useAccount,
  useDeleteAccount,
  useUpdateAccount,
} from '@/src/hooks/use-account';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { useToastStore } from '@/src/state/toast-store';
import { palette, radius, spacing } from '@/src/theme/tokens';
import type { CreateAccountPayload } from '@/src/types/account';
import { formatIDR } from '@/src/utils/currency';
import { toAppError } from '@/src/utils/errors';
import { resolveIconName } from '@/src/utils/icon';

export default function AccountDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const accountId = Number(id);

  const theme = useResolvedTheme();
  const colors = palette[theme];

  const { data: account, isLoading, isError, refetch } = useAccount(accountId);

  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();

  const showToast = useToastStore((state) => state.showToast);

  const [formVisible, setFormVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const handleUpdate = async (payload: CreateAccountPayload) => {
    try {
      await updateAccount.mutateAsync({ id: accountId, payload });
      setFormVisible(false);
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount.mutateAsync(accountId);
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
        <FixedAssetSubHeader title="Detail Akun" />
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

  if (isError || !account) {
    return (
      <>
        <FixedAssetSubHeader title="Detail Akun" />
        <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
          <View style={styles.centerState}>
            <Text tone="danger">Gagal memuat detail akun</Text>
            <Pressable onPress={() => refetch()} style={styles.retryButton}>
              <Text tone="muted">Coba Lagi</Text>
            </Pressable>
          </View>
        </Screen>
      </>
    );
  }

  const children = account.children ?? [];
  const hasChildren = children.length > 0;

  return (
    <>
      <FixedAssetSubHeader
        title={account.name}
        subtitle="Detail Akun"
      />
      <Screen
        scrollable
        safeAreaEdges={['left', 'right', 'bottom']}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <View style={styles.detailCard}>
          <View
            style={[styles.iconRow, { backgroundColor: account.color + '20' }]}
          >
            <Ionicons
              name={resolveIconName(account.icon, 'ellipse') as any}
              size={40}
              color={account.color}
            />
          </View>

          <DetailRow
            label="Nama Akun"
            value={account.name}
            icon="pencil-outline"
            colors={colors}
          />
          <DetailRow
            label="Tipe"
            value={account.type}
            icon="folder-outline"
            colors={colors}
          />
          <DetailRow
            label="Normal Balance"
            value={account.normal_balance === 'debit' ? 'Debit' : 'Kredit'}
            icon="swap-horizontal-outline"
            colors={colors}
          />
          {['asset', 'liability', 'equity'].includes(account.type) && (
            <DetailRow
              label="Saldo"
              value={formatIDR(account.current_balance)}
              icon="cash-outline"
              colors={colors}
            />
          )}
          <DetailRow
            label="Status"
            value={account.is_active ? 'Aktif' : 'Nonaktif'}
            icon="checkmark-circle-outline"
            colors={colors}
          />
        </View>

        {children.length > 0 && (
          <View style={styles.section}>
            <Text variant="subtitle" style={styles.sectionTitle}>
              Sub Akun ({children.length})
            </Text>
            <View style={[styles.detailCard, { marginTop: 0 }]}>
              {children.map((child) => (
                <Pressable
                  key={child.id}
                  onPress={() =>
                    router.push(`/personal-finance/account/${child.id}` as any)
                  }
                  style={({ pressed }) => [
                    styles.childRow,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childBalance}>
                    {formatIDR(child.current_balance)}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.muted}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.actionRow}>
          {account.parent_id !== null && (
            <Pressable
              onPress={() =>
                router.push(`/personal-finance/account/${accountId}/history` as any)
              }
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Ionicons name="time-outline" size={18} color="#FFFFFF" />
              <Text style={styles.actionText}>Riwayat</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => setFormVisible(true)}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: colors.warning,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons name="create-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionText}>Edit</Text>
          </Pressable>
          <Pressable
            onPress={() => setDeleteVisible(true)}
            disabled={hasChildren}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: colors.danger,
                opacity: hasChildren ? 0.4 : pressed ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionText}>Hapus</Text>
          </Pressable>
        </View>
      </Screen>

      <CoaFormModal
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={handleUpdate}
        initialData={{
          id: account.id,
          name: account.name,
          type: account.type,
          parent_id: account.parent_id,
          icon: account.icon,
          color: account.color,
          opening_balance: account.opening_balance,
          asset_type: account.asset_category as 'fixed' | 'investment' | 'current' | undefined,
          acquisition_date: account.acquisition_date ?? undefined,
          investment_type: account.investment_type as 'gold' | 'mutual_fund' | 'stock' | 'crypto' | 'bond' | 'other' | undefined,
          unit_quantity: account.unit_quantity ?? undefined,
          last_market_price: account.last_market_price ?? undefined,
        }}
        hasChildren={hasChildren}
        isSubmitting={updateAccount.isPending}
      />

      <CoaDeleteConfirm
        visible={deleteVisible}
        accountName={account.name}
        onClose={() => setDeleteVisible(false)}
        onConfirm={handleDelete}
        isDeleting={deleteAccount.isPending}
      />
    </>
  );
}

function DetailRow({
  label,
  value,
  icon,
  colors,
}: {
  label: string;
  value: string;
  icon: string;
  colors: Record<string, string>;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon as any} size={16} color={colors.muted} />
      </View>
      <View style={styles.detailContent}>
        <Text tone="muted" style={styles.detailLabel}>
          {label}
        </Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonList: {
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
  detailCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    marginTop: spacing.sm,
    gap: 0,
    overflow: 'hidden',
  },
  iconRow: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  detailIcon: {
    width: 24,
    alignItems: 'center',
    paddingTop: 2,
  },
  detailContent: {
    flex: 1,
    gap: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  childName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  childBalance: {
    fontWeight: '700',
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
