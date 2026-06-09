import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import type { ConfigContext, ExpoConfig } from 'expo/config';

const appEnv = process.env.APP_ENV ?? 'development';
const isProduction = appEnv === 'production';

const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (isProduction
    ? 'https://tokomasgumarang.com/api'
    : 'http://localhost:8000/api');

const envPath = process.env.EXPO_ANDROID_GOOGLE_SERVICES_FILE;
const candidatePaths = [
  envPath,
  './google-services.json',
  './android/app/google-services.json',
].filter((p): p is string => Boolean(p));
const foundPath = candidatePaths.find((p) => existsSync(resolve(p)));
const androidGoogleServicesFile =
  foundPath ?? envPath ?? './google-services.json';
const hasAndroidFcmConfig = Boolean(foundPath);

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

  name: 'Toko Mas Gumarang',
  slug: 'gumarang-mobile',
  owner: 'veansyah91',

  scheme: 'gumarang-mobile',

  version: '1.0.2',

  orientation: 'portrait',

  icon: './assets/images/icon.png',

  userInterfaceStyle: 'automatic',

  jsEngine: 'hermes',

  assetBundlePatterns: ['**/*'],

  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#F8FAFC',
  },

  ios: {
    bundleIdentifier: 'com.gumarang.mobile',
    supportsTablet: true,

    associatedDomains: ['applinks:tokomasgumarang.com'],

    entitlements: {
      'aps-environment': isProduction ? 'production' : 'development',
    },

    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },

  android: {
    package: 'com.gumarang.mobile',

    ...(hasAndroidFcmConfig
      ? {
          googleServicesFile: androidGoogleServicesFile,
        }
      : {}),

    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#F8FAFC',
    },

    permissions: ['INTERNET', 'POST_NOTIFICATIONS'],

    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'https',
            host: 'tokomasgumarang.com',
            pathPrefix: '/',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },

  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },

  updates: {
    url: 'https://u.expo.dev/296271a2-3fa9-408e-b9ec-f2e953847d44',
  },

  runtimeVersion: {
    policy: 'appVersion',
  },

  plugins: [
    'expo-router',

    'expo-font',

    'expo-web-browser',

    [
      'expo-secure-store',
      {
        faceIDPermission:
          'Allow Gumarang Mobile to securely access your saved session.',
      },
    ],

    [
      'expo-notifications',
      {
        icon: './assets/images/icon.png',
        color: '#F8FAFC',
        androidMode: 'default',
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
  },

  extra: {
    appEnv,

    apiBaseUrl,

    hasAndroidFcmConfig,

    eas: {
      projectId: '296271a2-3fa9-408e-b9ec-f2e953847d44',
    },
  },
});
