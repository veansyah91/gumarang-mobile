import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactElement, ReactNode } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ListEmptyState } from '@/src/components/ui/personal-finance/list-empty-state';
import { ListFooterLoader } from '@/src/components/ui/personal-finance/list-footer-loader';
import { ListSkeleton } from '@/src/components/ui/personal-finance/list-skeleton';
import { PersonalFinanceSubHeader } from '@/src/components/ui/personal-finance-sub-header';
import { Screen } from '@/src/components/ui/screen';
import { Text } from '@/src/components/ui/text';
import { spacing } from '@/src/theme/tokens';

type Props<T> = {
  title: string;
  subtitle?: string;
  data: T[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  isFetching?: boolean;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  renderItem: (item: T) => ReactNode;
  keyExtractor: (item: T) => string;
  emptyIcon: React.ComponentProps<typeof Ionicons>['name'];
  emptyTitle: string;
  errorTitle?: string;
  skeletonCount?: number;
  skeletonHeight?: number;
  filterFab?: ReactElement;
  extraFab?: ReactElement;
  mainFab?: ReactElement;
  contentContainerStyle?: StyleProp<ViewStyle>;
  listHeader?: ReactElement;
};

export function PersonalFinanceListScreen<T>({
  title,
  subtitle,
  data,
  isLoading,
  isError,
  refetch,
  isFetching,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  renderItem,
  keyExtractor,
  emptyIcon,
  emptyTitle,
  errorTitle = 'Gagal memuat data',
  skeletonCount,
  skeletonHeight,
  filterFab,
  extraFab,
  mainFab,
  contentContainerStyle,
  listHeader,
}: Props<T>) {
  if (isLoading) {
    return (
      <>
        <PersonalFinanceSubHeader title={title} subtitle={subtitle} />
        <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
          <View style={styles.skeletonContainer}>
            <ListSkeleton count={skeletonCount} height={skeletonHeight} />
          </View>
        </Screen>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <PersonalFinanceSubHeader title={title} subtitle={subtitle} />
        <Screen scrollable safeAreaEdges={['left', 'right', 'bottom']}>
          <View style={styles.centerState}>
            <Text tone="danger">{errorTitle}</Text>
            <Pressable onPress={() => refetch()} style={styles.retryButton}>
              <Text tone="muted">Coba Lagi</Text>
            </Pressable>
          </View>
        </Screen>
      </>
    );
  }

  return (
    <>
      <PersonalFinanceSubHeader title={title} subtitle={subtitle} />
      <Screen safeAreaEdges={['left', 'right', 'bottom']}>
        <FlatList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={({ item }) => renderItem(item) as ReactElement}
          contentContainerStyle={[styles.list, contentContainerStyle]}
          refreshControl={
            <RefreshControl
              refreshing={isFetching ?? false}
              onRefresh={refetch}
            />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <ListEmptyState icon={emptyIcon} title={emptyTitle} />
          }
          ListFooterComponent={
            isFetchingNextPage ? <ListFooterLoader /> : null
          }
        />
      </Screen>

      {filterFab}
      {extraFab}
      {mainFab}
    </>
  );
}

const styles = StyleSheet.create({
  skeletonContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.sm,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl * 2,
    flexGrow: 1,
  },
});
