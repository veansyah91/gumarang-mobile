import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { FixedAssetDeleteConfirm } from '@/src/components/fixed-asset-delete-confirm';
import { FixedAssetFormModal } from '@/src/components/fixed-asset-form-modal';
import { FixedAssetSubHeader } from '@/src/components/ui/fixed-asset-sub-header';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import {
  useDeleteFixedAsset,
  useFixedAsset,
  useUpdateFixedAsset,
} from '@/src/hooks/use-fixed-asset';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { useToastStore } from '@/src/state/toast-store';
import { palette, radius, spacing } from '@/src/theme/tokens';
import type { CreateFixedAssetPayload } from '@/src/types/fixed-asset';
import { formatIDR } from '@/src/utils/currency';
import { toAppError } from '@/src/utils/errors';
import { resolveIconName } from '@/src/utils/icon';

export default function FixedAssetDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const assetId = Number(id);

  const theme = useResolvedTheme();
  const colors = palette[theme];

  const { data: asset, isLoading, isError, refetch } = useFixedAsset(assetId);

  const updateAsset = useUpdateFixedAsset();
  const deleteAsset = useDeleteFixedAsset();

  const showToast = useToastStore((state) => state.showToast);

  const [formVisible, setFormVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const handleUpdate = async (payload: CreateFixedAssetPayload) => {
    try {
      await updateAsset.mutateAsync({
        id: assetId,
        payload: {
          asset_name: payload.asset_name,
          icon: payload.icon ?? null,
          color: payload.color ?? null,
          parent_id: payload.parent_id ?? null,
          opening_balance: payload.opening_balance,
          current_balance: payload.current_balance,
          acquisition_date: payload.acquisition_date ?? null,
        },
      });
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

  if (isLoading) {
    return (
      <>
        <FixedAssetSubHeader title="Detail Aset Tetap" />
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
        <FixedAssetSubHeader title="Detail Aset Tetap" />
        <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
          <View style={styles.centerState}>
            <Text tone="danger">Gagal memuat detail aset tetap</Text>
            <Pressable onPress={() => refetch()} style={styles.retryButton}>
              <Text tone="muted">Coba Lagi</Text>
            </Pressable>
          </View>
        </Screen>
      </>
    );
  }

  const children = asset.children ?? [];
  const hasChildren = children.length > 0;

  return (
    <>
      <FixedAssetSubHeader
        title={asset.name}
        subtitle="Detail Aset Tetap"
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
            style={[styles.iconRow, { backgroundColor: asset.color + '20' }]}
          >
            <Ionicons
              name={resolveIconName(asset.icon, 'diamond-outline') as any}
              size={40}
              color={asset.color}
            />
          </View>

          <DetailRow
            label="Nama Aset"
            value={asset.name}
            icon="pencil-outline"
            colors={colors}
          />
          <DetailRow
            label="Nilai"
            value={formatIDR(asset.current_balance)}
            icon="cash-outline"
            colors={colors}
          />
          {!hasChildren && (
            <DetailRow
              label="Tanggal Akuisisi"
              value={asset.acquisition_date ?? '-'}
              icon="calendar-outline"
              colors={colors}
            />
          )}
          <DetailRow
            label="Status"
            value={asset.is_active ? 'Aktif' : 'Nonaktif'}
            icon="checkmark-circle-outline"
            colors={colors}
          />
        </View>

        {children.length > 0 && (
          <View style={styles.section}>
            <Text variant="subtitle" style={styles.sectionTitle}>
              Sub Aset ({children.length})
            </Text>
            <View style={[styles.detailCard, { marginTop: 0 }]}>
              {children.map((child) => (
                <Pressable
                  key={child.id}
                  onPress={() =>
                    router.push(`/personal-finance/fixed-asset/${child.id}` as any)
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
                      name={resolveIconName(child.icon, 'diamond-outline') as any}
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
          <Pressable
            onPress={() => setFormVisible(true)}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons name="create-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionText}>Edit</Text>
          </Pressable>
          <Pressable
            onPress={() => setDeleteVisible(true)}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: colors.danger,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionText}>Hapus</Text>
          </Pressable>
        </View>
      </Screen>

      <FixedAssetFormModal
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={handleUpdate}
        initialData={{
          asset_name: asset.name,
          opening_balance: asset.opening_balance,
          acquisition_date: asset.acquisition_date,
          icon: asset.icon,
          color: asset.color,
          parent_id: asset.parent_id,
          current_balance: asset.current_balance,
        }}
        hasChildren={hasChildren}
        isSubmitting={updateAsset.isPending}
      />

      <FixedAssetDeleteConfirm
        visible={deleteVisible}
        assetName={asset.name}
        onClose={() => setDeleteVisible(false)}
        onConfirm={handleDelete}
        isDeleting={deleteAsset.isPending}
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
