import { Feather } from '@expo/vector-icons';
import { memo, useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/src/theme/tokens';
import { CatalogImage, CatalogVideo } from '@/src/types/catalog';
import { Text } from './ui/text';

interface Props {
  isOpen: boolean;
  images: CatalogImage[];
  videos?: CatalogVideo[];
  catalogName: string;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function CatalogImageModalComponent({
  isOpen,
  images,
  videos = [],
  catalogName,
  onClose,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const insets = useSafeAreaInsets();

  const totalMedia = [
    ...images.map((img) => ({ ...img, type: 'image' as const })),
    ...videos.map((vid) => ({ ...vid, type: 'video' as const })),
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    if (item.type === 'image') {
      return (
        <View style={styles.mediaContainer}>
          <Image
            source={{ uri: item.url }}
            style={styles.fullMedia}
            resizeMode="contain"
          />
        </View>
      );
    }

    return (
      <View style={styles.mediaContainer}>
        <View style={styles.videoPlaceholder}>
          <Feather name="play" size={48} color="#FFF" />
          <Text style={styles.videoText}>Video tidak dapat ditampilkan</Text>
          <Text style={styles.videoUrl}>{item.video_url}</Text>
        </View>
      </View>
    );
  }, []);

  const handleScroll = useCallback(
    (event: any) => {
      const slideSize = event.nativeEvent.layoutMeasurement.width;
      const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
      if (index !== currentIndex) {
        setCurrentIndex(index);
      }
    },
    [currentIndex],
  );

  return (
    <Modal
      visible={isOpen}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: '#000',
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {catalogName}
            </Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color="#FFF" />
          </Pressable>
        </View>

        {/* Media Slider */}
        <FlatList
          data={totalMedia}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
          style={styles.slider}
        />

        {/* Counter */}
        <View style={styles.counterContainer}>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {totalMedia.length > 0 ? currentIndex + 1 : 0} /{' '}
              {totalMedia.length}
            </Text>
          </View>
        </View>

        {/* Thumbnails */}
        {totalMedia.length > 1 && (
          <View style={styles.thumbnailStrip}>
            <FlatList
              data={totalMedia}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) =>
                `thumb-${item.type}-${item.id}-${index}`
              }
              renderItem={({ item, index }) => (
                <Pressable
                  onPress={() => {
                    // This is tricky with pagingEnabled FlatList, normally we'd use a ref to scrollTo
                  }}
                  style={[
                    styles.thumbnailItem,
                    index === currentIndex && styles.thumbnailActive,
                  ]}
                >
                  {item.type === 'image' ? (
                    <Image
                      source={{ uri: item.url }}
                      style={styles.thumbnailImage}
                    />
                  ) : (
                    <View style={styles.thumbnailVideoPlaceholder}>
                      <Feather name="play" size={12} color="#FFF" />
                    </View>
                  )}
                </Pressable>
              )}
              contentContainerStyle={styles.thumbnailContent}
            />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 56,
    zIndex: 10,
  },
  headerTitleContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slider: {
    flex: 1,
  },
  mediaContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200, // Adjust based on header/footer
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullMedia: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  videoText: {
    color: '#FFF',
    fontSize: 14,
    marginTop: spacing.md,
    fontWeight: '600',
  },
  videoUrl: {
    color: '#999',
    fontSize: 12,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  counterContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  counterBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  counterText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  thumbnailStrip: {
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: spacing.sm,
  },
  thumbnailContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  thumbnailItem: {
    width: 60,
    height: 60,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#F59E0B', // Amber 500
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailVideoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const CatalogImageModal = memo(CatalogImageModalComponent);
