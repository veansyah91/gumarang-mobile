import Constants from 'expo-constants';

export function getAppEnv() {
  return (Constants.expoConfig?.extra?.appEnv as string | undefined) ?? 'development';
}

export function getApiBaseUrl() {
  return (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ?? 'http://localhost:8000/api';
}
