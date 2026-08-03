import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { InvestmentDeleteConfirm } from '@/src/components/investment-delete-confirm';
import { InvestmentEditTransactionModal } from '@/src/components/investment-edit-transaction-modal';
import { InvestmentFormModal } from '@/src/components/investment-form-modal';
import { Button } from '@/src/components/ui/button';
import { InvestmentSubHeader } from '@/src/components/ui/investment-sub-header';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import {
  useDeleteInvestment,
  useDeletePurchase,
  useDeleteSale,
  useEditPurchase,
  useEditSale,
  useInvestment,
  useUpdateInvestment,
} from '@/src/hooks/use-investment';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { useToastStore } from '@/src/state/toast-store';
import { palette, radius, spacing } from '@/src/theme/tokens';
import type {
  InvestmentPurchase,
  InvestmentSale,
  UpdateInvestmentPayload,
} from '@/src/types/investment';
import { formatIDR } from '@/src/utils/currency';
import { toAppError } from '@/src/utils/errors';
import { resolveIconName } from '@/src/utils/icon';

const TYPE_LABELS: Record<string, string> = {
  gold: 'Emas',
  mutual_fund: 'Reksadana',
  stock: 'Saham',
  crypto: 'Crypto',
  bond: 'Obligasi',
  other: 'Lainnya',
};

export default function InvestmentDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const assetId = Number(id);

  const theme = useResolvedTheme();
  const colors = palette[theme];

  const { data: asset, isLoading, isError, refetch } = useInvestment(assetId);

  const updateAsset = useUpdateInvestment();
  const deleteAsset = useDeleteInvestment();
  const editPurchase = useEditPurchase();
  const deletePurchase = useDeletePurchase();
  const editSale = useEditSale();
  const deleteSale = useDeleteSale();

  const showToast = useToastStore((state) => state.showToast);

  const [formVisible, setFormVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'purchase' | 'sale'>('purchase');
  const [expandedMenuIndex, setExpandedMenuIndex] = useState<number | null>(
    null,
  );
  const [editTransaction, setEditTransaction] = useState<
    | { mode: 'purchase'; transaction: InvestmentPurchase }
    | { mode: 'sale'; transaction: InvestmentSale }
    | null
  >(null);
  const [deleteTransaction, setDeleteTransaction] = useState<{
    mode: 'purchase' | 'sale';
    transactionId: number;
  } | null>(null);

  const handleUpdate = async (payload: UpdateInvestmentPayload) => {
    try {
      await updateAsset.mutateAsync({ id: assetId, payload });
      setFormVisible(false);
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAsset.mutateAsync(assetId);
      setDeleteVisible(false);
      router.back();
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  const handleEditTransaction = async (payload: Record<string, unknown>) => {
    if (!editTransaction) return;
    try {
      if (editTransaction.mode === 'purchase') {
        await editPurchase.mutateAsync({
          id: assetId,
          transactionId: editTransaction.transaction.transaction_id!,
          payload: payload as any,
        });
      } else {
        await editSale.mutateAsync({
          id: assetId,
          transactionId: editTransaction.transaction.transaction_id!,
          payload: payload as any,
        });
      }
      setEditTransaction(null);
      showToast('Riwayat berhasil diperbarui', 'success');
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deleteTransaction) return;
    try {
      if (deleteTransaction.mode === 'purchase') {
        await deletePurchase.mutateAsync({
          id: assetId,
          transactionId: deleteTransaction.transactionId,
        });
      } else {
        await deleteSale.mutateAsync({
          id: assetId,
          transactionId: deleteTransaction.transactionId,
        });
      }
      setDeleteTransaction(null);
      showToast('Riwayat berhasil dihapus', 'success');
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  if (isLoading) {
    return (
      <>
        <InvestmentSubHeader title="Detail Investasi" />
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

  if (isError || !asset) {
    return (
      <>
        <InvestmentSubHeader title="Detail Investasi" />
        <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
          <View style={styles.centerState}>
            <Text tone="danger">Gagal memuat detail investasi</Text>
            <Pressable onPress={() => refetch()} style={styles.retryButton}>
              <Text tone="muted">Coba Lagi</Text>
            </Pressable>
          </View>
        </Screen>
      </>
    );
  }

  const isGain = asset.unrealized_gain_loss >= 0;
  const purchases = asset.history?.purchases ?? [];
  const sales = asset.history?.sales ?? [];
  const children = asset.children ?? [];
  const hasChildren = children.length > 0;
  const hasParent = asset.parent_id !== null;

  return (
    <>
      <InvestmentSubHeader title={asset.name} subtitle="Detail Investasi" />
      <Screen
        scrollable
        safeAreaEdges={['left', 'right', 'bottom']}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <View style={styles.detailCard}>
          <View
            style={[styles.iconRow, { backgroundColor: asset.color + '20' }]}
          >
            <Ionicons
              name={resolveIconName(asset.icon, 'trending-up-outline') as any}
              size={40}
              color={asset.color}
            />
          </View>

          <DetailRow
            label="Tipe"
            value={TYPE_LABELS[asset.investment_type] ?? asset.investment_type}
            icon="folder-outline"
            colors={colors}
          />
          <DetailRow
            label="Nilai Saat Ini"
            value={formatIDR(asset.current_balance)}
            icon="cash-outline"
            colors={colors}
          />
          {hasParent && (
            <>
              <DetailRow
                label="Jumlah Unit"
                value={String(asset.unit_quantity)}
                icon="layers-outline"
                colors={colors}
              />
              <DetailRow
                label="Harga Rata-rata"
                value={formatIDR(asset.unit_cost_avg)}
                icon="calculator-outline"
                colors={colors}
              />
              <DetailRow
                label="Harga Pasar Terakhir"
                value={formatIDR(asset.last_market_price)}
                icon="trending-up-outline"
                colors={colors}
              />
              <DetailRow
                label="Unrealized Gain/Loss"
                value={`${isGain ? '+' : ''}${formatIDR(asset.unrealized_gain_loss)}`}
                icon="pulse-outline"
                colors={colors}
              />
              <DetailRow
                label="Terakhir Dinilai"
                value={asset.last_valued_at ?? '-'}
                icon="calendar-outline"
                colors={colors}
              />
            </>
          )}
        </View>

        {!hasParent && hasChildren && (
          <View style={styles.section}>
            <Text variant="subtitle" style={styles.sectionTitle}>
              Sub Aset ({children.length})
            </Text>
            <View style={[styles.detailCard, { marginTop: 0 }]}>
              {children.map((child) => (
                <Pressable
                  key={child.id}
                  onPress={() =>
                    router.push(
                      `/personal-finance/investment/${child.id}` as any,
                    )
                  }
                  style={({ pressed }) => [
                    styles.childRow,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <View
                    style={[
                      styles.childIcon,
                      { backgroundColor: child.color + '20' },
                    ]}
                  >
                    <Ionicons
                      name={
                        resolveIconName(
                          child.icon,
                          'trending-up-outline',
                        ) as any
                      }
                      size={18}
                      color={child.color}
                    />
                  </View>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={[styles.childBalance, { color: child.color }]}>
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
          {hasParent && (
            <>
              <ActionButton
                label="Beli"
                icon="add-circle-outline"
                color={colors.primary}
                onPress={() =>
                  router.push(
                    `/personal-finance/investment/${assetId}/buy` as any,
                  )
                }
              />
              <ActionButton
                label="Jual"
                icon="remove-circle-outline"
                color={colors.danger}
                onPress={() =>
                  router.push(
                    `/personal-finance/investment/${assetId}/sell` as any,
                  )
                }
              />
              <ActionButton
                label="Nilai"
                icon="trending-up-outline"
                color={colors.warning}
                onPress={() =>
                  router.push(
                    `/personal-finance/investment/${assetId}/revalue` as any,
                  )
                }
              />
            </>
          )}
          <ActionButton
            label="Edit"
            icon="create-outline"
            color={colors.primary}
            onPress={() => setFormVisible(true)}
          />
          <ActionButton
            label="Hapus"
            icon="trash-outline"
            color={colors.danger}
            onPress={() => setDeleteVisible(true)}
            disabled={hasChildren}
          />
        </View>

        {hasParent && (
          <>
            <View style={styles.tabRow}>
              <Pressable
                onPress={() => setActiveTab('purchase')}
                style={[
                  styles.tab,
                  activeTab === 'purchase' && {
                    borderBottomColor: colors.primary,
                    borderBottomWidth: 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'purchase' && { color: colors.primary },
                  ]}
                >
                  Riwayat Pembelian
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setActiveTab('sale')}
                style={[
                  styles.tab,
                  activeTab === 'sale' && {
                    borderBottomColor: colors.primary,
                    borderBottomWidth: 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'sale' && { color: colors.primary },
                  ]}
                >
                  Riwayat Penjualan
                </Text>
              </Pressable>
            </View>

            <View style={styles.historyList}>
              {activeTab === 'purchase' ? (
                purchases.length === 0 ? (
                  <Text tone="muted" style={styles.emptyHistory}>
                    Belum ada riwayat pembelian
                  </Text>
                ) : (
                  purchases.map((p, i) => {
                    const isExpanded = expandedMenuIndex === i;
                    return isExpanded ? (
                      <Animated.View
                        key={i}
                        entering={FadeIn}
                        exiting={FadeOut}
                        style={styles.historyActionRow}
                      >
                        <Pressable
                          onPress={() => {
                            setExpandedMenuIndex(null);
                            setEditTransaction({
                              mode: 'purchase',
                              transaction: p,
                            });
                          }}
                          style={styles.historyActionButton}
                        >
                          <Ionicons
                            name="create-outline"
                            size={20}
                            color={colors.primary}
                          />
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            setExpandedMenuIndex(null);
                            setDeleteTransaction({
                              mode: 'purchase',
                              transactionId: p.transaction_id!,
                            });
                          }}
                          style={styles.historyActionButton}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color={colors.danger}
                          />
                        </Pressable>
                        <Pressable
                          onPress={() => setExpandedMenuIndex(null)}
                          style={styles.historyActionButton}
                        >
                          <Ionicons
                            name="close-outline"
                            size={20}
                            color={colors.muted}
                          />
                        </Pressable>
                      </Animated.View>
                    ) : (
                      <Animated.View
                        key={i}
                        entering={FadeIn}
                        exiting={FadeOut}
                        style={styles.historyItem}
                      >
                        <View style={styles.historyInfo}>
                          <Text style={styles.historyDate}>{p.date}</Text>
                          <Text tone="muted">
                            {p.unit_quantity} unit @ {formatIDR(p.unit_price)}
                          </Text>
                        </View>
                        <Text style={styles.historyAmount}>
                          {formatIDR(
                            p.total_amount ?? p.unit_quantity * p.unit_price,
                          )}
                        </Text>
                        <Pressable
                          onPress={() => setExpandedMenuIndex(i)}
                          style={({ pressed }) => ({
                            opacity: pressed ? 0.6 : 1,
                            padding: spacing.xs,
                          })}
                        >
                          <Ionicons
                            name="ellipsis-vertical"
                            size={20}
                            color={colors.muted}
                          />
                        </Pressable>
                      </Animated.View>
                    );
                  })
                )
              ) : sales.length === 0 ? (
                <Text tone="muted" style={styles.emptyHistory}>
                  Belum ada riwayat penjualan
                </Text>
              ) : (
                sales.map((s, i) => {
                  const isExpanded = expandedMenuIndex === i;
                  return isExpanded ? (
                    <Animated.View
                      key={i}
                      entering={FadeIn}
                      exiting={FadeOut}
                      style={styles.historyActionRow}
                    >
                      <Pressable
                        onPress={() => {
                          setExpandedMenuIndex(null);
                          setEditTransaction({ mode: 'sale', transaction: s });
                        }}
                        style={styles.historyActionButton}
                      >
                        <Ionicons
                          name="create-outline"
                          size={20}
                          color={colors.primary}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          setExpandedMenuIndex(null);
                          setDeleteTransaction({
                            mode: 'sale',
                            transactionId: s.transaction_id!,
                          });
                        }}
                        style={styles.historyActionButton}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color={colors.danger}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => setExpandedMenuIndex(null)}
                        style={styles.historyActionButton}
                      >
                        <Ionicons
                          name="close-outline"
                          size={20}
                          color={colors.muted}
                        />
                      </Pressable>
                    </Animated.View>
                  ) : (
                    <Animated.View
                      key={i}
                      entering={FadeIn}
                      exiting={FadeOut}
                      style={styles.historyItem}
                    >
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyDate}>{s.date}</Text>
                        <Text tone="muted">
                          {s.unit_quantity} unit @ {formatIDR(s.unit_price)}
                        </Text>
                      </View>
                      <Text style={styles.historyAmount}>
                        {formatIDR(
                          s.total_amount ?? s.unit_quantity * s.unit_price,
                        )}
                      </Text>
                      <Pressable
                        onPress={() => setExpandedMenuIndex(i)}
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.6 : 1,
                          padding: spacing.xs,
                        })}
                      >
                        <Ionicons
                          name="ellipsis-vertical"
                          size={20}
                          color={colors.muted}
                        />
                      </Pressable>
                    </Animated.View>
                  );
                })
              )}
            </View>
          </>
          )}
      </Screen>

      <InvestmentFormModal
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={handleUpdate}
        initialData={{
          name: asset.name,
          investment_type: asset.investment_type,
          icon: asset.icon,
          color: asset.color,
        }}
        isEdit
        isSubmitting={updateAsset.isPending}
      />

      <InvestmentDeleteConfirm
        visible={deleteVisible}
        assetName={asset.name}
        onClose={() => setDeleteVisible(false)}
        onConfirm={handleDelete}
        isDeleting={deleteAsset.isPending}
      />

      <InvestmentEditTransactionModal
        mode={editTransaction?.mode ?? 'purchase'}
        visible={editTransaction !== null}
        onClose={() => setEditTransaction(null)}
        onSubmit={handleEditTransaction}
        initialData={
          editTransaction
            ? {
                unit_quantity: editTransaction.transaction.unit_quantity,
                unit_price: editTransaction.transaction.unit_price,
                transaction_date: editTransaction.transaction.date,
                notes: editTransaction.transaction.notes,
              }
            : { unit_quantity: 0, unit_price: 0, transaction_date: '' }
        }
        isSubmitting={
          editTransaction?.mode === 'purchase'
            ? editPurchase.isPending
            : editSale.isPending
        }
      />

      <Modal
        visible={deleteTransaction !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTransaction(null)}
      >
        <View style={styles.overlay}>
          <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
            <Text variant="subtitle">Hapus Riwayat</Text>
            <Text tone="muted" style={styles.message}>
              Yakin ingin menghapus riwayat ini? Data yang sudah dihapus tidak
              dapat dikembalikan.
            </Text>

            <View style={styles.dialogActions}>
              <Button
                variant="secondary"
                label="Batal"
                onPress={() => setDeleteTransaction(null)}
                disabled={deletePurchase.isPending || deleteSale.isPending}
              />
              <Button
                variant="danger"
                label={
                  deletePurchase.isPending || deleteSale.isPending
                    ? 'Menghapus...'
                    : 'Hapus'
                }
                onPress={handleDeleteTransaction}
                disabled={deletePurchase.isPending || deleteSale.isPending}
              />
            </View>
          </View>
        </View>
      </Modal>
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

function ActionButton({
  label,
  icon,
  color,
  onPress,
  disabled,
}: {
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.actionButton,
        { opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
      ]}
    >
      <View
        style={[
          styles.actionIcon,
          { backgroundColor: (disabled ? '#9CA3AF' : color) + '20' },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={20}
          color={disabled ? '#9CA3AF' : color}
        />
      </View>
      <Text
        style={[styles.actionLabel, { color: disabled ? '#9CA3AF' : color }]}
      >
        {label}
      </Text>
    </Pressable>
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
  tabRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  historyList: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  emptyHistory: {
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  historyInfo: {
    flex: 1,
    gap: 1,
  },
  historyDate: {
    fontSize: 13,
    fontWeight: '600',
  },
  historyAmount: {
    fontWeight: '700',
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingBottom: spacing.xl * 2,
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 60,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 11,
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
  childIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
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
  historyActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  historyActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.sm,
  },
  historyActionButton: {
    padding: spacing.sm,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  message: {
    lineHeight: 20,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
