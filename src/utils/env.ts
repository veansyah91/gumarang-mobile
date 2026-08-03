import Constants from 'expo-constants';
import { Platform } from 'react-native';

const productionApiBaseUrl = 'https://tokomasgumarang.com/api';

function getDevelopmentApiBaseUrl(): string {
  const override = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;
  if (override) {
    return override;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api';
  }

  return 'http://127.0.0.1:8000/api';
}

export function getAppEnv() {
  return (
    (Constants.expoConfig?.extra?.appEnv as string | undefined) ?? 'development'
  );
}

export function getApiBaseUrl() {
  const appEnv = getAppEnv();
  const configuredBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl as
    | string
    | undefined;

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  return appEnv === 'production' ? productionApiBaseUrl : getDevelopmentApiBaseUrl();
}
