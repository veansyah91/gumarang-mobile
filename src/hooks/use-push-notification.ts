import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

import { memberApi } from '@/src/services/api/member';
import { getJsonStorage, setJsonStorage } from '@/src/storage/local-storage';
import { useAuth } from './use-auth';

const DEVICE_TOKEN_STORAGE_KEY = 'push:device-token';
const ANDROID_FCM_SETUP_WARNING =
  'Android push notification setup skipped: Firebase/FCM is not configured yet. Add google-services.json, expose it through expo.android.googleServicesFile, then rebuild the app.';

function getExpoProjectId() {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId
  );
}

export function usePushNotification() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[push] Notification received in foreground:', notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('[push] Notification tapped:', response);
        const data = response.notification.request.content.data;

        if (data && typeof data === 'object') {
          const transactionType = (data as Record<string, any>).transactionType;
          const referenceNumber = (data as Record<string, any>).referenceNumber;

          if (transactionType && referenceNumber) {
            console.log(`[push] Navigating to ${transactionType} detail: ${referenceNumber}`);

            switch (transactionType) {
              case 'purchase':
                router.push({
                  pathname: '/(app)/purchase-member/[id]',
                  params: { id: String(referenceNumber) },
                });
                break;
              case 'sale':
                router.push({
                  pathname: '/(app)/sale-member/[id]',
                  params: { id: String(referenceNumber) },
                });
                break;
              case 'gold_convertion':
                router.push({
                  pathname: '/(app)/gold-convertion-member/[id]',
                  params: { id: String(referenceNumber) },
                });
                break;
              default:
                console.log(`[push] Unknown transaction type: ${transactionType}`);
                router.push('/notifications');
                break;
            }
          } else {
            router.push('/notifications');
          }
        } else {
          router.push('/notifications');
        }
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let mounted = true;

    const setupPushNotification = async () => {
      // Skip for web platform
      if (Platform.OS === 'web') {
        console.log('[push] SKIP: Web platform not supported');
        return;
      }

      // Skip in Expo Go — Android remote push notifications removed from Expo Go since SDK 53
      // Use a development build for push notification support
      if (Constants.appOwnership === 'expo') {
        console.warn(
          '[push] SKIP: Expo Go detected. Remote push notifications not supported. Use development build: npx expo run:android',
        );
        return;
      }

      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
          });

          const hasAndroidFcmConfig =
            Constants.expoConfig?.extra?.hasAndroidFcmConfig;

          if (hasAndroidFcmConfig === false) {
            console.warn(
              '[push] SKIP: FCM not configured',
              ANDROID_FCM_SETUP_WARNING,
            );
            return;
          }
        }

        const permissions = await Notifications.getPermissionsAsync();
        let granted =
          (permissions as any).status === 'granted' ||
          (permissions as any).granted === true;

        if (!granted) {
          const req = await Notifications.requestPermissionsAsync();
          granted =
            (req as any).status === 'granted' || (req as any).granted === true;
        }

        if (!granted) {
          console.warn('[push] SKIP: Notification permission denied');
          return;
        }

        // Get project ID from expo config
        const projectId = getExpoProjectId();
        if (!projectId) {
          console.warn('[push] SKIP: Project ID not found in expo config');
          return;
        }

        const { data: token } = await Notifications.getExpoPushTokenAsync({
          projectId,
        });

        if (!mounted) return;

        const trimmedToken = token.trim();
        if (!trimmedToken) {
          throw new Error('Push token is empty.');
        }

        // Check if token already registered
        const cachedToken = await getJsonStorage<string>(
          DEVICE_TOKEN_STORAGE_KEY,
          '',
        );

        if (!mounted) return;

        if (cachedToken === trimmedToken) {
          console.log('[push] Token already registered, skipping');
          return;
        }

        const payload = {
          token: trimmedToken,
          platform: 'expo' as const,
          device_type:
            Platform.OS === 'ios' ? ('ios' as const) : ('android' as const),
        };

        console.log(
          '[push] Registering token payload:',
          JSON.stringify(payload),
        );

        await memberApi.registerDeviceToken(payload);

        if (!mounted) return;

        console.log('[push] Token registered successfully');

        await setJsonStorage(DEVICE_TOKEN_STORAGE_KEY, trimmedToken);
      } catch (error) {
        if (
          Platform.OS === 'android' &&
          error instanceof Error &&
          error.message.includes('Default FirebaseApp is not initialized')
        ) {
          console.warn(ANDROID_FCM_SETUP_WARNING);
          return;
        }

        // Log error but don't crash app - this is a non-critical background feature
        console.error('Failed to register push notification token:', error);
      }
    };

    void setupPushNotification();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);
}
