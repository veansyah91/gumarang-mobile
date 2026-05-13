import { create } from 'zustand';

import { getDraftTransactions, saveDraftTransactions, type DraftTransaction } from '@/src/storage/draft-storage';
import { getJsonStorage, setJsonStorage } from '@/src/storage/local-storage';
import type { AppSettings } from '@/src/types/settings';
import { getApiBaseUrl, getAppEnv } from '@/src/utils/env';

const SETTINGS_KEY = 'app:settings';

const defaultSettings: AppSettings = {
  themePreference: 'system',
  offlineSyncEnabled: true,
  skeletonEnabled: true,
};

type AppState = {
  apiBaseUrl: string;
  appEnv: string;
  isBootstrapped: boolean;
  networkOnline: boolean;
  pendingDrafts: number;
  settings: AppSettings;
  bootstrap: () => Promise<void>;
  setNetworkOnline: (online: boolean) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  createDraft: () => Promise<void>;
  refreshDrafts: () => Promise<void>;
};

export const useAppStore = create<AppState>((set, get) => ({
  apiBaseUrl: getApiBaseUrl(),
  appEnv: getAppEnv(),
  isBootstrapped: false,
  networkOnline: true,
  pendingDrafts: 0,
  settings: defaultSettings,
  bootstrap: async () => {
    const [settings, drafts] = await Promise.all([
      getJsonStorage<AppSettings>(SETTINGS_KEY, defaultSettings),
      getDraftTransactions(),
    ]);

    set({
      isBootstrapped: true,
      pendingDrafts: drafts.filter((draft) => draft.status === 'pending').length,
      settings,
    });
  },
  setNetworkOnline: (networkOnline) => set({ networkOnline }),
  updateSettings: (settings) => {
    const nextSettings = { ...get().settings, ...settings };
    set({ settings: nextSettings });
    void setJsonStorage(SETTINGS_KEY, nextSettings);
  },
  createDraft: async () => {
    const drafts = await getDraftTransactions();
    const draft: DraftTransaction = {
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    await saveDraftTransactions([draft, ...drafts]);
    set({ pendingDrafts: drafts.filter((item) => item.status === 'pending').length + 1 });
  },
  refreshDrafts: async () => {
    const drafts = await getDraftTransactions();
    set({ pendingDrafts: drafts.filter((draft) => draft.status === 'pending').length });
  },
}));
