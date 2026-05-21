# Gumarang Mobile

Modern React Native Expo foundation for the Gumarang Laravel API.

## Stack

- Expo + React Native + TypeScript
- Expo Router for nested auth/app flows
- Axios API client with auth/error interceptors
- Zustand for UI/auth state
- TanStack Query for server state
- SecureStore + AsyncStorage for session, settings, cache, and drafts

## Getting started

1. Copy `.env.example` to `.env` if you want local overrides.
2. Set `EXPO_PUBLIC_API_BASE_URL` to your Laravel API base URL.
3. Install dependencies with `npm install`.
4. Start the app with `npm run start` or `npm run web`.

## Android push notifications

Android remote push notifications need Firebase configured in the native app.

1. Download `google-services.json` from your Firebase project.
2. Place it in the project root, or point `EXPO_ANDROID_GOOGLE_SERVICES_FILE` to its path.
3. Build the app again so `expo.android.googleServicesFile` is applied.
4. Upload an FCM V1 service account key in EAS credentials for sending notifications.

## Production APK testing

1. Use `.env.production.example` as the reference for production values.
2. Build the internal APK with `eas build -p android --profile production-apk`.
3. Use the `production` profile for Play Store AAB submission.

## Available scripts

- `npm run lint`
- `npm run typecheck`
- `npm run build:web`
- `npm run build:android:apk`
- `npm run build:android:aab`

## Project structure

- `app/`: Expo Router screens and route groups
- `src/components/ui`: reusable design-system primitives
- `src/services/api`: centralized API modules and interceptors
- `src/services/sync`: offline sync services
- `src/state`: Zustand stores for auth and app settings
- `src/storage`: SecureStore/AsyncStorage helpers
- `src/hooks`: reusable hooks for auth, cache-first queries, and sync
- `src/theme`: design tokens and theming helpers
- `src/types`: shared TypeScript models
- `src/utils`: environment and error helpers

## Notes

- Tokens are stored in SecureStore and attached centrally by Axios.
- Cached API responses fall back to local storage when the network is unavailable.
- Draft transactions are saved locally first and can sync when the user is back online.
- Route groups cleanly separate authentication, main application, and settings/profile flows.
- OTA updates are currently disabled. If you later use EAS Update, add a proper `runtimeVersion` and `updates.url` before enabling it again.
- Production builds point to `https://tokomasgumarang.com`.
