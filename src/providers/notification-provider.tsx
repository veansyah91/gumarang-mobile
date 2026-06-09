import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, type PropsWithChildren } from 'react';

import { notificationService } from '@/src/services/notifications';

type RootStackParamList = Record<string, object | undefined>;
type NavigationType = NavigationProp<RootStackParamList>;

/**
 * NotificationProvider
 * Handles all notification setup, permissions, device token registration, and user interactions
 */
export function NotificationProvider({ children }: PropsWithChildren) {
  const navigation = useNavigation<NavigationType>();
  const unsubscribeListeners = useRef<(() => void)[]>([]);

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Initialize notification system
        await notificationService.initialize();

        // Setup listener for notifications received while app is in foreground
        const unsubscribeReceived = notificationService.onNotificationReceived(
          (notification) => {
            console.log('[notifications] Notification received:', notification);

            // The notification is already shown by the system due to setNotificationHandler config
            // You can use this to trigger additional actions (e.g., refresh data, log analytics)
          },
        );
        unsubscribeListeners.current.push(unsubscribeReceived);

        // Setup listener for notification responses (when user taps notification)
        const unsubscribeResponse = notificationService.onNotificationResponse(
          (response) => {
            const notification = response.notification;
            console.log('[notifications] Notification tapped:', notification);

            // Handle notification tap action
            handleNotificationTap(notification, navigation);
          },
        );
        unsubscribeListeners.current.push(unsubscribeResponse);

        // Cleanup: remove listeners on unmount
        return () => {
          unsubscribeListeners.current.forEach((unsubscribe) => {
            try {
              unsubscribe();
            } catch (error) {
              console.error('[notifications] Error during cleanup:', error);
            }
          });
        };
      } catch (error) {
        console.error('[notifications] Failed to setup notifications:', error);
      }
    };

    void setupNotifications();
  }, [navigation]);

  return <>{children}</>;
}

/**
 * Handle notification tap action
 * Navigates user to appropriate screen based on notification data
 */
function handleNotificationTap(
  notification: Notifications.Notification,
  navigation: NavigationType,
): void {
  try {
    const data = notification.request.content.data;
    console.log('[notifications] Handling notification tap with data:', data);

    // Extract action from notification data
    const action = (data?.action as string) || null;
    const referenceNumber = (data?.referenceNumber as string) || null;
    const transactionType = (data?.transactionType as string) || null;

    // Navigate based on notification data
    if (action === 'open_notifications') {
      navigation.navigate('notifications' as never);
    } else if (transactionType && referenceNumber) {
      // Navigate to specific transaction based on type
      handleTransactionNavigation(navigation, transactionType, referenceNumber);
    } else {
      // Default: navigate to notifications list
      navigation.navigate('notifications' as never);
    }
  } catch (error) {
    console.error('[notifications] Error handling notification tap:', error);
  }
}

/**
 * Navigate to appropriate transaction screen based on type
 */
function handleTransactionNavigation(
  navigation: NavigationType,
  transactionType: string,
  referenceNumber: string,
): void {
  const navigationMap: Record<string, string> = {
    purchase: 'purchase-member',
    sale: 'sale-member',
    deposit: 'certificate',
    withdrawal: 'my-gold',
    saving: 'saving',
    'gold-conversion': 'gold-convertion-member',
  };

  const screenName = navigationMap[transactionType.toLowerCase()];

  if (screenName) {
    navigation.navigate(screenName as never);
  } else {
    // Default to notifications list if transaction type is unknown
    navigation.navigate('notifications' as never);
  }
}
