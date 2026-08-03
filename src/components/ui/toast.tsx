import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { useResolvedTheme } from '@/src/hooks/use-resolved-theme';
import { useToastStore } from '@/src/state/toast-store';
import { palette, radius, spacing } from '@/src/theme/tokens';

import { Text } from './text';

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </View>
  );
}

function ToastItem({ toast }: { toast: { id: string; message: string; type: string } }) {
  const hideToast = useToastStore((state) => state.hideToast);
  const opacity = useRef(new Animated.Value(0)).current;
  const theme = useResolvedTheme();
  const colors = palette[theme];

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  const bgColor =
    toast.type === 'danger'
      ? colors.danger
      : toast.type === 'success'
        ? colors.success
        : colors.primary;

  return (
    <Animated.View style={[styles.wrapper, { opacity }]}>
      <Pressable
        onPress={() => hideToast(toast.id)}
        style={[styles.toast, { backgroundColor: bgColor }]}
      >
        <Text style={styles.text}>{toast.message}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl * 2,
  },
  wrapper: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  toast: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
