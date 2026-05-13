import { draftsApi } from '@/src/services/api/drafts';
import { getDraftTransactions, saveDraftTransactions } from '@/src/storage/draft-storage';

export async function syncDraftTransactions() {
  const drafts = await getDraftTransactions();
  const pendingDrafts = drafts.filter((draft) => draft.status === 'pending');

  if (!pendingDrafts.length) {
    return 0;
  }

  const results = await Promise.allSettled(
    pendingDrafts.map(async (draft) => {
      await draftsApi.syncDraft(draft);
      return draft.id;
    }),
  );

  const syncedIds = new Set(
    results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : [])),
  );

  await saveDraftTransactions(
    drafts.map((draft) =>
      syncedIds.has(draft.id)
        ? {
            ...draft,
            status: 'synced',
            syncedAt: new Date().toISOString(),
          }
        : draft,
    ),
  );

  return syncedIds.size;
}
