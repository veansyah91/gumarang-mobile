import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { memberApi } from './api/member';

type NotificationListener = (notification: Notifications.Notification) => void;
type NotificationResponseListener = (
  response: Notifications.NotificationResponse,
) => void;

let notificationListeners: NotificationListener[] = [];
let responseListener: Notifications.EventSubscription | null = null;

export const notificationService = {
  /**
   * Request notification permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Only ask if permissions have not already been determined
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.error('[notifications] Failed to request permissions:', error);
      return false;
    }
  },

  /**
   * Get device token for push notifications
   */
  async getDeviceToken(): Promise<string | null> {
    try {
      // Get Expo push token
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.easConfig?.projectId;

      if (!projectId) {
        console.warn('[notifications] No EAS project ID found');
        return null;
      }

      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      return token;
    } catch (error) {
      console.error('[notifications] Failed to get device token:', error);
      return null;
    }
  },

  /**
   * Register device token with backend
   */
  async registerDeviceToken(): Promise<boolean> {
    try {
      // Request permissions first
      const hasPermission = await notificationService.requestPermissions();
      if (!hasPermission) {
        console.warn('[notifications] Notification permissions not granted');
        return false;
      }

      // Get device token
      const token = await notificationService.getDeviceToken();
      if (!token) {
        console.warn('[notifications] Could not get device token');
        return false;
      }

      // Determine platform and device type
      const deviceType = Platform.OS as 'android' | 'ios' | 'web';

      // Register with backend
      await memberApi.registerDeviceToken({
        token,
        platform: 'expo',
        device_type: deviceType,
      });

      console.log('[notifications] Device token registered successfully');
      return true;
    } catch (error) {
      console.error('[notifications] Failed to register device token:', error);
      return false;
    }
  },

  /**
   * Setup listener for notifications received while app is in foreground
   */
  onNotificationReceived(callback: NotificationListener): () => void {
    notificationListeners.push(callback);

    // Return unsubscribe function
    return () => {
      notificationListeners = notificationListeners.filter(
        (listener) => listener !== callback,
      );
    };
  },

  /**
   * Setup listener for notification responses (when user taps notification)
   */
  onNotificationResponse(callback: NotificationResponseListener): () => void {
    // Remove previous listener if exists
    if (responseListener) {
      responseListener.remove();
    }

    // Set up new listener
    responseListener =
      Notifications.addNotificationResponseReceivedListener(callback);

    // Return unsubscribe function
    return () => {
      if (responseListener) {
        responseListener.remove();
        responseListener = null;
      }
    };
  },

  /**
   * Initialize notification listeners
   * Should be called once during app startup
   */
  async initialize(): Promise<(() => void) | undefined> {
    try {
      // Setup notification handler for when app is in foreground
      const notificationListener =
        Notifications.addNotificationReceivedListener((notification) => {
          // Call all registered listeners
          notificationListeners.forEach((listener) => {
            try {
              listener(notification);
            } catch (error) {
              console.error('[notifications] Error in listener:', error);
            }
          });
        });

      return () => notificationListener.remove();
    } catch (error) {
      console.error(
        '[notifications] Failed to initialize notification listeners:',
        error,
      );
    }
  },

  /**
   * Show a local notification (for testing or fallback)
   */
  async showLocalNotification(title: string, body: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          badge: 1,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error(
        '[notifications] Failed to show local notification:',
        error,
      );
    }
  },

  /**
   * Clear notification badge count
   */
  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('[notifications] Failed to clear badge:', error);
    }
  },
};
