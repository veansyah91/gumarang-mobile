import { getJsonStorage, setJsonStorage } from './local-storage';

const DRAFTS_KEY = 'drafts:transactions';

export type DraftTransaction = {
  id: string;
  createdAt: string;
  syncedAt?: string;
  status: 'pending' | 'synced';
};

export async function getDraftTransactions() {
  return getJsonStorage<DraftTransaction[]>(DRAFTS_KEY, []);
}

export async function saveDraftTransactions(drafts: DraftTransaction[]) {
  await setJsonStorage(DRAFTS_KEY, drafts);
}
