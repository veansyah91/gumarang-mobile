import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { ContactFilterModal, createEmptyContactFilterDraft, type ContactFilterDraft } from '@/src/components/contact-filter-modal';
import { ContactListItem } from '@/src/components/contact-list-item';
import { FixedAssetSubHeader } from '@/src/components/ui/fixed-asset-sub-header';
import { Screen } from '@/src/components/ui/screen';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Text } from '@/src/components/ui/text';
import { useContacts, useDeleteContact } from '@/src/hooks/use-contact';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { useToastStore } from '@/src/state/toast-store';
import { palette, spacing } from '@/src/theme/tokens';
import { toAppError } from '@/src/utils/errors';

export default function ContactListPage() {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  const [searchText, setSearchText] = useState('');
  const [filterDraft, setFilterDraft] = useState<ContactFilterDraft>(
    createEmptyContactFilterDraft(),
  );
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useContacts({ search: searchText || undefined, perPage: 15 });

  const deleteContact = useDeleteContact();

  const allContacts = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.meta?.total ?? 0;

  const activeFilterCount = searchText ? 1 : 0;

  const handleOpenFilter = () => {
    setFilterDraft({ search: searchText });
    setIsFilterVisible(true);
  };

  const handleSubmitFilter = () => {
    setSearchText(filterDraft.search);
    setIsFilterVisible(false);
  };

  const handleResetFilter = () => {
    setFilterDraft(createEmptyContactFilterDraft());
    setSearchText('');
    setIsFilterVisible(false);
  };

  const handlePress = (id: number) => {
    router.push(`/personal-finance/contact/${id}` as any);
  };

  const handleLongPress = (id: number) => {
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteContact.mutateAsync(deleteId);
      setDeleteId(null);
      showToast('Kontak berhasil dihapus', 'success');
    } catch (err) {
      const appErr = toAppError(err);
      showToast(appErr.userMessage, 'danger');
    }
  };

  const deleteContactItem = deleteId
    ? allContacts.find((c) => c.id === deleteId)
    : null;

  if (isLoading) {
    return (
      <>
        <FixedAssetSubHeader title="Kontak" />
        <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
          <View style={styles.skeletonList}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={72} />
            ))}
          </View>
        </Screen>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <FixedAssetSubHeader title="Kontak" />
        <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
          <View style={styles.centerState}>
            <Text tone="danger">Gagal memuat kontak</Text>
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
      <FixedAssetSubHeader title="Kontak" subtitle={String(total)} />
      <Screen safeAreaEdges={['left', 'right', 'bottom']}>
        <FlatList
          data={allContacts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ContactListItem
              contact={item}
              onPress={handlePress}
              onLongPress={handleLongPress}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Ionicons
                name="people-outline"
                size={48}
                color={colors.muted}
              />
              <Text tone="muted" style={styles.emptyText}>
                Belum ada kontak
              </Text>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null
          }
        />
      </Screen>

      <Pressable
        style={({ pressed }) => [
          styles.filterFab,
          {
            backgroundColor: activeFilterCount > 0 ? colors.warning : colors.surface,
            borderColor: colors.border,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
        onPress={handleOpenFilter}
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

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() => router.push('/personal-finance/contact/create' as any)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      <ContactFilterModal
        visible={isFilterVisible}
        draft={filterDraft}
        onChangeDraft={setFilterDraft}
        onClose={() => setIsFilterVisible(false)}
        onSubmit={handleSubmitFilter}
        onReset={handleResetFilter}
      />

      <Modal
        visible={deleteId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteId(null)}
      >
        <View style={styles.deleteConfirmOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setDeleteId(null)} />
          <View style={[styles.deleteConfirmDialog, { backgroundColor: colors.surface }]}>
            <Text variant="subtitle">Hapus Kontak</Text>
            <Text tone="muted" style={styles.deleteMessage}>
              Yakin ingin menghapus kontak &quot;{deleteContactItem?.name}&quot;?
            </Text>
            <View style={styles.deleteActions}>
              <Pressable
                onPress={() => setDeleteId(null)}
                style={[styles.deleteButton, { backgroundColor: colors.border }]}
              >
                <Text style={{ color: colors.text }}>Batal</Text>
              </Pressable>
              <Pressable
                onPress={handleDelete}
                style={[styles.deleteButton, { backgroundColor: colors.danger }]}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                  {deleteContact.isPending ? 'Menghapus...' : 'Hapus'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  skeletonList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl * 2,
    flexGrow: 1,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.sm,
    flex: 1,
  },
  emptyText: {
    marginTop: spacing.sm,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  footerLoader: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  filterFab: {
    position: 'absolute',
    bottom: spacing.lg * 2 + 66,
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
  deleteConfirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  deleteConfirmDialog: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
  },
  deleteMessage: {
    lineHeight: 20,
  },
  deleteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  deleteButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
});
