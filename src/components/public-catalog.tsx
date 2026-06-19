import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { catalogApi } from '@/src/services/api/catalog';
import { palette, radius, spacing } from '@/src/theme/tokens';
import { Catalog } from '@/src/types/catalog';
import { CatalogImageModal } from './catalog-image-modal';
import { Badge } from './ui/badge';
import { Text } from './ui/text';

type ViewAllItem = { type: 'viewAll' };
type ListItem = Catalog | ViewAllItem;

const isViewAllItem = (item: ListItem): item is ViewAllItem => {
  return 'type' in item && item.type === 'viewAll';
};

function PublicCatalogComponent() {
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    catalog: Catalog | null;
  }>({
    isOpen: false,
    catalog: null,
  });

  useEffect(() => {
    isMountedRef.current = true;
    abortControllerRef.current = new AbortController();
    fetchPublicCatalogs();

    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const fetchPublicCatalogs = async () => {
    try {
      if (!isMountedRef.current) return;
      setIsLoading(true);
      setError(null);
      const response = await catalogApi.getPublicCatalogs();

      if (abortControllerRef.current?.signal.aborted || !isMountedRef.current)
        return;

      if (response.success && response.data) {
        if (isMountedRef.current) setCatalogs(response.data);
      } else {
        if (isMountedRef.current) setError('Gagal memuat katalog');
      }
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted || !isMountedRef.current)
        return;
      if (isMountedRef.current) {
        setError('Gagal memuat katalog');
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted && isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleCatalogPress = async (catalog: Catalog) => {
    try {
      setLoadingId(catalog.id);
      const response = await catalogApi.getPublicCatalogById(catalog.id);
      if (response.success && response.data) {
        setModalState({ isOpen: true, catalog: response.data });
      } else {
        setModalState({ isOpen: true, catalog });
      }
    } catch {
      setModalState({ isOpen: true, catalog });
    } finally {
      setLoadingId(null);
    }
  };

  const getTotalWeight = (catalog: Catalog): string => {
    const numericWeights = (catalog.products ?? [])
      .map((p) => {
        const b = p.pivot.berat;
        if (b === null || b === undefined || b === '') return null;
        return typeof b === 'string' ? parseFloat(b) : b;
      })
      .filter((n): n is number => n !== null && n !== undefined && !isNaN(n));

    if (numericWeights.length === 0) return '-';
    const total = numericWeights.reduce((sum, n) => sum + n, 0);
    return total > 0 ? `${total.toFixed(2)} g` : '-';
  };

  const renderItem = ({ item }: { item: ListItem }) => {
    if (isViewAllItem(item)) {
      return (
        <View
          style={[styles.viewAllGridItem, { flex: 1, marginHorizontal: 2 }]}
        >
          <Pressable onPress={handleViewAll} style={styles.viewAllContent}>
            <View style={styles.viewAllCircle}>
              <Feather name="chevron-right" size={28} color="#FFF" />
            </View>
            <Text style={styles.viewAllText} tone="muted">
              Lihat Lainnya
            </Text>
          </Pressable>
        </View>
      );
    }

    const cat = item as Catalog;
    const isItemLoading = loadingId === cat.id;
    const catalogCategories = Array.from(
      new Map(
        (cat.products ?? [])
          .filter((p) => p.category)
          .map((p) => [p.category!.id, p.category!]),
      ).values(),
    );

    return (
      <Pressable
        onPress={() => handleCatalogPress(cat)}
        disabled={isItemLoading}
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          isItemLoading && styles.cardLoading,
        ]}
      >
        <View style={styles.imageContainer}>
          {cat.primary_image?.url ? (
            <Image
              source={{ uri: cat.primary_image.url }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.noImage, { backgroundColor: colors.border }]}>
              <Text tone="muted" style={{ fontSize: 12 }}>
                Tidak ada gambar
              </Text>
            </View>
          )}
          {isItemLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="#FFF" />
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text variant="subtitle" numberOfLines={2} style={styles.title}>
            {cat.name}
          </Text>

          {catalogCategories.length > 0 && (
            <View style={styles.badgeContainer}>
              {catalogCategories.map((c) => (
                <Badge key={c.id} label={c.name} variant="secondary" />
              ))}
            </View>
          )}

          {cat.description && (
            <Text
              variant="body"
              tone="muted"
              numberOfLines={2}
              style={styles.description}
            >
              {cat.description}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <ActivityIndicator size="large" color="#D97706" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.errorContainer}>
          <Text tone="muted" style={styles.errorText}>
            Gagal memuat katalog
          </Text>
          <Pressable
            onPress={() => fetchPublicCatalogs()}
            style={[styles.retryButton, { borderColor: colors.border }]}
          >
            <Text style={{ color: '#D97706', fontWeight: '600', fontSize: 13 }}>
              Coba Lagi
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (catalogs.length === 0) {
    return null;
  }

  const listData: ListItem[] = [...catalogs.slice(0, 3), { type: 'viewAll' }];

  const handleViewAll = () => {
    router.push('/(auth)/login?redirect=/(app)/(tabs)/catalog');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="title" style={{ fontSize: 18, fontWeight: '700' }}>
          Katalog Perhiasan
        </Text>
        <Text tone="muted" style={{ fontSize: 12 }}>
          Pratinjau koleksi kami yang tersedia
        </Text>
      </View>

      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          isViewAllItem(item) ? 'viewAll' : item.id.toString()
        }
        numColumns={2}
        scrollEnabled={false}
        contentContainerStyle={styles.gridContent}
      />

      {modalState.catalog && (
        <CatalogImageModal
          isOpen={modalState.isOpen}
          catalogName={modalState.catalog.name}
          images={modalState.catalog.images || []}
          videos={modalState.catalog.video ? [modalState.catalog.video] : []}
          onClose={() => setModalState({ isOpen: false, catalog: null })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  gridContent: {
    gap: spacing.md,
  },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.md,
    marginHorizontal: 2,
  },
  cardLoading: {
    opacity: 0.7,
  },
  imageContainer: {
    width: '100%',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
    fontSize: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: spacing.sm,
  },
  weightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  weightLabel: {
    fontSize: 13,
    color: '#666',
  },
  weightValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  navigateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    paddingVertical: spacing.xl,
  },
  navigateCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigateText: {
    marginTop: spacing.sm,
    fontSize: 13,
    fontWeight: '600',
  },
  viewAllGridItem: {
    marginHorizontal: 2,
    marginBottom: spacing.md,
  },
  viewAllContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  viewAllCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  errorText: {
    fontSize: 14,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderRadius: 6,
  },
});

export const PublicCatalog = PublicCatalogComponent;
