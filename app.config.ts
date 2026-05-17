import type { ConfigContext, ExpoConfig } from 'expo/config';

const appEnv = process.env.APP_ENV ?? 'development';
const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Toko Mas Gumarang',
  slug: 'gumarang-mobile',
  owner: 'veansyah91',
  scheme: 'gumarang-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#F8FAFC',
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#F8FAFC',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  updates: {
    enabled: false,
  },
  plugins: [
    'expo-router',
    [
      'expo-secure-store',
      {
        faceIDPermission:
          'Allow Gumarang Mobile to securely access your saved session.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    appEnv,
    apiBaseUrl,
    eas: {
      projectId: 'ec4809fc-4ed9-43cd-8cce-cc01f2779590',
    },
  },
});
