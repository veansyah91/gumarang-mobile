import { useRouter } from 'expo-router';
import { useState } from 'react';

import { ContactFilterModal, createEmptyContactFilterDraft, type ContactFilterDraft } from '@/src/components/contact-filter-modal';
import { ContactListItem } from '@/src/components/contact-list-item';
import { ConfirmDeleteModal } from '@/src/components/ui/confirm-delete-modal';
import {
  FilterFab,
  ListFab,
  PersonalFinanceListScreen,
} from '@/src/components/ui/personal-finance';
import { useContacts, useDeleteContact } from '@/src/hooks/use-contact';
import { pfRoutes } from '@/src/navigation/personal-finance-routes';
import { useToastStore } from '@/src/state/toast-store';
import { toAppError } from '@/src/utils/errors';

export default function ContactListPage() {
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
    router.push(pfRoutes.contactDetail(id));
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

  return (
    <>
      <PersonalFinanceListScreen
        title="Kontak"
        subtitle={String(total)}
        data={allContacts}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        isFetching={isFetching}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        renderItem={(item) => (
          <ContactListItem
            contact={item}
            onPress={handlePress}
            onLongPress={handleLongPress}
          />
        )}
        keyExtractor={(item) => String(item.id)}
        emptyIcon="people-outline"
        emptyTitle="Belum ada kontak"
        errorTitle="Gagal memuat kontak"
        skeletonHeight={72}
        filterFab={
          <FilterFab
            onPress={handleOpenFilter}
            active={activeFilterCount > 0}
            badgeCount={activeFilterCount}
          />
        }
        mainFab={
          <ListFab onPress={() => router.push(pfRoutes.contactCreate())} />
        }
      />

      <ContactFilterModal
        visible={isFilterVisible}
        draft={filterDraft}
        onChangeDraft={setFilterDraft}
        onClose={() => setIsFilterVisible(false)}
        onSubmit={handleSubmitFilter}
        onReset={handleResetFilter}
      />

      <ConfirmDeleteModal
        visible={deleteId !== null}
        title="Hapus Kontak"
        message={`Yakin ingin menghapus kontak "${deleteContactItem?.name}"?`}
        isDeleting={deleteContact.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
