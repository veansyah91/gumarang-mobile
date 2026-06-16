import { memo, useMemo, useState } from 'react';
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
import { Catalog, Category } from '@/src/types/catalog';
import { CatalogImageModal } from './catalog-image-modal';
import { Badge } from './ui/badge';
import { Text } from './ui/text';

interface Props {
  catalogs: Catalog[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

function CatalogGridComponent({
  catalogs,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: Props) {
  const theme = useResolvedTheme();
  const colors = palette[theme];

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    catalog: Catalog | null;
  }>({
    isOpen: false,
    catalog: null,
  });

  const categories = useMemo(() => {
    const catMap = new Map<number, Category>();
    catalogs.forEach((c) => {
      c.products.forEach((p) => {
        if (p.category) {
          catMap.set(p.category.id, p.category);
        }
      });
    });
    return Array.from(catMap.values());
  }, [catalogs]);

  const filteredCatalogs = useMemo(() => {
    if (!selectedCategoryId) return catalogs;
    return catalogs.filter((c) =>
      c.products.some((p) => p.category?.id === selectedCategoryId),
    );
  }, [catalogs, selectedCategoryId]);

  const getTotalWeight = (catalog: Catalog): string => {
    const numericWeights = catalog.products
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

  const handleCatalogPress = async (catalog: Catalog) => {
    try {
      setLoadingId(catalog.id);
      const response = await catalogApi.getPrivateCatalogById(catalog.id);
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

  const renderCatalogItem = ({ item }: { item: Catalog }) => {
    const isItemLoading = loadingId === item.id;
    const catalogCategories = Array.from(
      new Map(
        item.products
          .filter((p) => p.category)
          .map((p) => [p.category!.id, p.category!]),
      ).values(),
    );

    return (
      <Pressable
        onPress={() => handleCatalogPress(item)}
        disabled={isItemLoading}
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          isItemLoading && styles.cardLoading,
        ]}
      >
        <View style={styles.imageContainer}>
          {item.primary_image?.url ? (
            <Image
              source={{ uri: item.primary_image.url }}
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

  const numColumns = 2;

  return (
    <View style={styles.container}>
      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <FlatList
          data={[{ id: null, name: 'Semua' } as any, ...categories]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) =>
            item.id === null ? 'all' : item.id.toString()
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedCategoryId(item.id)}
              style={[
                styles.filterButton,
                { borderColor: colors.border },
                selectedCategoryId === item.id && {
                  backgroundColor: '#D97706',
                  borderColor: '#D97706',
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      selectedCategoryId === item.id ? '#FFF' : colors.text,
                  },
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          )}
          contentContainerStyle={styles.filterContent}
        />
      </View>

      {/* Grid */}
      <FlatList
        data={filteredCatalogs}
        renderItem={renderCatalogItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text tone="muted">Tidak ada katalog yang tersedia</Text>
          </View>
        }
        contentContainerStyle={styles.gridContent}
      />

      {hasMore && (
        <Pressable
          onPress={onLoadMore}
          disabled={isLoadingMore}
          style={[styles.loadMoreButton, { borderColor: colors.border }]}
        >
          <Text style={{ color: '#D97706', fontWeight: '700' }}>
            {isLoadingMore ? 'Memuat...' : 'Tampilkan Lainnya'}
          </Text>
        </Pressable>
      )}

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
  },
  filterContainer: {
    paddingVertical: spacing.sm,
  },
  filterContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  gridContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.md,
    // When 2 columns, we need margin between them
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
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadMoreButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const CatalogGrid = memo(CatalogGridComponent);
