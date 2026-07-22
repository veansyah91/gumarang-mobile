import { useEffect, useRef, type PropsWithChildren } from 'react';

import { notificationService } from '@/src/services/notifications';

/**
 * NotificationProvider
 * Handles all notification setup, permissions, device token registration, and user interactions
 */
export function NotificationProvider({ children }: PropsWithChildren) {
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
            // Keep this lightweight; navigation is handled by usePushNotification.
          },
        );
        unsubscribeListeners.current.push(unsubscribeReceived);

        // Setup listener for notification responses (when user taps notification)
        const unsubscribeResponse = notificationService.onNotificationResponse(
          (response) => {
            const notification = response.notification;
            console.log(
              '[notifications] Notification tapped (no navigation here):',
              notification,
            );

            // Navigation for notification taps is handled by usePushNotification (expo-router).
            // Avoid performing navigation here to prevent duplicate/conflicting handlers.
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
  }, []);

  return <>{children}</>;
}
