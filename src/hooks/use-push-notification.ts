import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { memberApi } from '@/src/services/api/member';
import { getJsonStorage, setJsonStorage } from '@/src/storage/local-storage';
import { useAuth } from './use-auth';

const DEVICE_TOKEN_STORAGE_KEY = 'push:device-token';

export function usePushNotification() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const setupPushNotification = async () => {
      // Skip for web platform
      if (Platform.OS === 'web') {
        return;
      }

      // Skip in Expo Go — Android remote push notifications removed from Expo Go since SDK 53
      // Use a development build for push notification support
      if (Constants.appOwnership === 'expo') {
        return;
      }

      try {
        // Request permission. We continue only if token retrieval succeeds.
        await Notifications.requestPermissionsAsync();

        // Get project ID from expo config
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) {
          console.warn('Project ID not found in expo config');
          return;
        }

        // Get Expo push token
        const { data: token } = await Notifications.getExpoPushTokenAsync({
          projectId,
        });

        // Check if token already registered
        const cachedToken = await getJsonStorage<string>(
          DEVICE_TOKEN_STORAGE_KEY,
          '',
        );

        if (cachedToken === token) {
          // Token hasn't changed, skip API call
          return;
        }

        // Register token with backend
        await memberApi.registerDeviceToken({
          token,
          token_type: 'expo',
          platform: Platform.OS as 'ios' | 'android',
        });

        // Cache the token
        await setJsonStorage(DEVICE_TOKEN_STORAGE_KEY, token);
      } catch (error) {
        // Log error but don't crash app - this is a non-critical background feature
        console.error('Failed to register push notification token:', error);
      }
    };

    void setupPushNotification();
  }, [isAuthenticated]);
}
