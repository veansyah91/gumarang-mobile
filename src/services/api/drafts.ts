import type { DraftTransaction } from '@/src/storage/draft-storage';

import { apiClient } from './client';

export const draftsApi = {
  async syncDraft(draft: DraftTransaction) {
    await apiClient.post('/drafts/sync', draft);
  },
};
