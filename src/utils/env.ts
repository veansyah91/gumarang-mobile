import Constants from 'expo-constants';

const productionApiBaseUrl = 'https://tokomasgumarang.com/api';
const localApiBaseUrl = 'http://localhost:8000/api';

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

  return appEnv === 'production' ? productionApiBaseUrl : localApiBaseUrl;
}
