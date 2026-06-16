import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { catalogApi } from '@/src/services/api/catalog';
import { palette, radius, spacing } from '@/src/theme/tokens';
import { Catalog } from '@/src/types/catalog';
import { CatalogImageModal } from './catalog-image-modal';
import { Badge } from './ui/badge';
import { Text } from './ui/text';

function PublicCatalogComponent() {
  const { width } = useWindowDimensions();
  const theme = useResolvedTheme();
  const colors = palette[theme];
  const abortControllerRef = useRef<AbortController | null>(null);

  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    catalog: Catalog | null;
  }>({
    isOpen: false,
    catalog: null,
  });

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchPublicCatalogs();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const fetchPublicCatalogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('[PublicCatalog] Fetching catalogs...');
      const response = await catalogApi.getPublicCatalogs();

      if (abortControllerRef.current?.signal.aborted) {
        console.log('[PublicCatalog] Request aborted, skipping state update');
        return;
      }

      if (response.success && response.data) {
        console.log('[PublicCatalog] Catalogs fetched successfully:', {
          count: response.data.length,
          catalogs: response.data.map((c) => ({
            id: c.id,
            name: c.name,
            hasPrimaryImage: !!c.primary_image,
             imageUrl: c.primary_image?.url,
          })),
        });
        setCatalogs(response.data);
      } else {
        console.warn('[PublicCatalog] Response not successful:', response);
        setError('Gagal memuat katalog');
      }
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        console.log('[PublicCatalog] Request aborted during error handling');
        return;
      }
      setError('Gagal memuat katalog');
      console.error('[PublicCatalog] Error fetching public catalogs:', err);
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
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

  const renderCatalogItem = ({ item }: { item: Catalog }) => {
    const catalogCategories = Array.from(
      new Map(
        (item.products ?? [])
          .filter((p) => p.category)
          .map((p) => [p.category!.id, p.category!]),
      ).values(),
    );

    const handleImageLoad = () => {
      console.log('[PublicCatalog] Image loaded successfully:', {
        catalogId: item.id,
        catalogName: item.name,
        imageUrl: item.primary_image?.url,
      });
    };

    const handleImageError = (error: any) => {
      console.error('[PublicCatalog] Image failed to load:', {
        catalogId: item.id,
        catalogName: item.name,
        imageUrl: item.primary_image?.url,
        error: error.nativeEvent?.error,
      });
    };

    return (
      <Pressable
        onPress={() => setModalState({ isOpen: true, catalog: item })}
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.imageContainer}>
          {item.primary_image?.url ? (
            <Image
              source={{ uri: item.primary_image.url }}
              style={styles.image}
              resizeMode="cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <View style={[styles.noImage, { backgroundColor: colors.border }]}>
              <Text tone="muted" style={{ fontSize: 12 }}>
                Tidak ada gambar
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text variant="subtitle" numberOfLines={2} style={styles.title}>
            {item.name}
          </Text>

          {catalogCategories.length > 0 && (
            <View style={styles.badgeContainer}>
              {catalogCategories.map((cat) => (
                <Badge key={cat.id} label={cat.name} variant="secondary" />
              ))}
            </View>
          )}

          <View style={styles.weightContainer}>
            <Text style={styles.weightLabel}>Berat: </Text>
            <Text style={styles.weightValue}>{getTotalWeight(item)}</Text>
          </View>

          {item.description && (
            <Text
              variant="body"
              tone="muted"
              numberOfLines={2}
              style={styles.description}
            >
              {item.description}
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

  if (error || catalogs.length === 0) {
    return null;
  }

  const numColumns = width > 600 ? 2 : 1;

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
        data={catalogs}
        renderItem={renderCatalogItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        key={numColumns}
        scrollEnabled={false}
        contentContainerStyle={styles.gridContent}
      />

      {modalState.catalog && (
        <CatalogImageModal
          isOpen={modalState.isOpen}
          catalogName={modalState.catalog.name}
          images={modalState.catalog.images || []}
          videos={modalState.catalog.videos || []}
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
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.md,
    marginHorizontal: 2,
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
});

export const PublicCatalog = PublicCatalogComponent;
