import { draftsApi } from '@/src/services/api/drafts';
import { getDraftTransactions, saveDraftTransactions } from '@/src/storage/draft-storage';

export async function syncDraftTransactions() {
  const drafts = await getDraftTransactions();
  const pendingDrafts = drafts.filter((draft) => draft.status === 'pending');

  if (!pendingDrafts.length) {
    return 0;
  }

  const syncedIds = new Set<string>();

  for (const draft of pendingDrafts) {
    await draftsApi.syncDraft(draft);
    syncedIds.add(draft.id);
  }

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
