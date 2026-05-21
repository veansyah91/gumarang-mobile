import { useCallback, useEffect, useRef, useState } from 'react';

import { syncDraftTransactions } from '@/src/services/sync/draft-sync';
import { useAppStore } from '@/src/state/app-store';
import { useAuthStore } from '@/src/state/auth-store';

export function useDraftSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const syncingRef = useRef(false);
  const isOnline = useAppStore((state) => state.networkOnline);
  const offlineSyncEnabled = useAppStore(
    (state) => state.settings.offlineSyncEnabled,
  );
  const pendingDrafts = useAppStore((state) => state.pendingDrafts);
  const refreshDrafts = useAppStore((state) => state.refreshDrafts);
  const isAuthenticated = useAuthStore(
    (state) => state.status === 'authenticated',
  );

  const syncDrafts = useCallback(async () => {
    if (
      !isOnline ||
      !offlineSyncEnabled ||
      !isAuthenticated ||
      !pendingDrafts ||
      syncingRef.current
    ) {
      return;
    }

    syncingRef.current = true;
    setIsSyncing(true);

    try {
      await syncDraftTransactions();
    } finally {
      await refreshDrafts();
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, [
    isAuthenticated,
    isOnline,
    offlineSyncEnabled,
    pendingDrafts,
    refreshDrafts,
  ]);

  useEffect(() => {
    let mounted = true;

    const runSync = async () => {
      if (mounted) {
        await syncDrafts();
      }
    };

    void runSync();

    return () => {
      mounted = false;
    };
  }, [syncDrafts]);

  return {
    isSyncing,
    syncDrafts,
  };
}
