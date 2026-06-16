import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { CatalogGrid } from '@/src/components/catalog-grid';
import { Screen } from '@/src/components/ui/screen';
import { Text } from '@/src/components/ui/text';
import { useAuth } from '@/src/hooks/use-auth';
import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { catalogApi } from '@/src/services/api/catalog';
import { palette, spacing } from '@/src/theme/tokens';
import { Catalog } from '@/src/types/catalog';

export default function CatalogScreen() {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const { isAuthenticated } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);

  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchCatalogs(1);

    return () => {
      abortControllerRef.current?.abort();
      console.log('[CatalogScreen] Component unmounted, aborting requests');
    };
  }, []);

  const fetchCatalogs = async (page: number) => {
    try {
      console.log('[CatalogScreen] Fetching catalogs page:', page);
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const response = await catalogApi.getPrivateCatalogs(page);

      if (abortControllerRef.current?.signal.aborted) {
        console.log(
          '[CatalogScreen] Request aborted, skipping state update for page:',
          page,
        );
        return;
      }

      if (response.success && response.data) {
        console.log('[CatalogScreen] Catalogs fetched successfully for page:', {
          page,
          count: response.data.length,
          hasMore: response.meta?.has_more,
        });
        if (page === 1) {
          setCatalogs(response.data);
        } else {
          setCatalogs((prev) => [...prev, ...response.data]);
        }
        setCurrentPage(page);
        setHasMore(response.meta?.has_more || false);
      } else {
        console.warn('[CatalogScreen] Response not successful:', response);
      }
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        console.log(
          '[CatalogScreen] Request aborted during error handling for page:',
          page,
        );
        return;
      }
      if (page === 1) {
        setError('Gagal memuat katalog');
      }
      console.error('[CatalogScreen] Error fetching private catalogs:', err);
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        if (page === 1) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchCatalogs(currentPage + 1);
    }
  };

  if (!isAuthenticated) {
    return (
      <Screen contentContainerStyle={styles.centerContainer}>
        <Text variant="title">Katalog Perhiasan</Text>
        <Text style={[styles.text, { color: colors.text }]}>
          Silakan login untuk melihat katalog lengkap
        </Text>
      </Screen>
    );
  }

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color="#D97706" />
      </View>
    );
  }

  if (error && catalogs.length === 0) {
    return (
      <Screen contentContainerStyle={styles.centerContainer}>
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        <Pressable
          style={[styles.retryButton, { borderColor: colors.border }]}
          onPress={() => fetchCatalogs(1)}
        >
          <Text style={{ color: '#D97706', fontWeight: '700' }}>Coba Lagi</Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen
      scrollable
      contentContainerStyle={styles.content}
      safeAreaEdges={['top', 'left', 'right']}
    >
      <View style={styles.header}>
        <Text variant="title" style={{ fontSize: 20, fontWeight: '700' }}>
          Katalog Perhiasan
        </Text>
        <Text tone="muted" style={{ fontSize: 13 }}>
          Koleksi lengkap perhiasan kami
        </Text>
      </View>

      <CatalogGrid
        catalogs={catalogs}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
      />

      {isLoadingMore && (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color="#D97706" />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderRadius: 8,
  },
  loadingMoreContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
