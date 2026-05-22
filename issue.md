# Issue: Investigate Android build warnings and Android NDK failure

## Background

- Android debug build currently fails on Windows host during `app:assembleDebug`.
- Expo CLI reports that Firebase/FCM configuration is skipped (`expo.android.googleServicesFile` not detected) even though `google-services.json` exists in the repository root.
- Gradle aborts while applying `com.facebook.react.rootproject` because the installed Android NDK (`C:\Users\User\AppData\Local\Android\Sdk\ndk\27.1.12297006`) is incomplete and lacks `source.properties`.

## Objectives

1. Restore a clean Android debug build without blocking warnings.
2. Ensure Firebase Cloud Messaging is correctly configured and recognized by Expo during native build steps.
3. Provide environment setup guidance so future builds on Windows succeed consistently.

## High-level Investigation & Action Plan

### A. Validate FCM configuration detection

- Review `app.config.ts` logic for `android.googleServicesFile` and confirm `hasAndroidFcmConfig` resolves to `true` when running locally.
- Verify that the path exposed through `EXPO_ANDROID_GOOGLE_SERVICES_FILE` (or the default `./google-services.json`) matches the location used during native builds and is available when Gradle runs.
- Confirm that the committed `google-services.json` matches the Firebase project used in production and that the package name (`com.gumarang.mobile`) is aligned.

### B. Align Expo and native Android project settings

- Use Expo config introspection to confirm the generated Android manifest includes Firebase services and notification permissions defined in `app.config.ts`.
- If `expo prebuild` artifacts are tracked, ensure `android/app/google-services.json` is synchronized with the root file or adjust build scripts to copy it during native builds.
- Document the expected environment variables so CI or other developers do not miss the FCM configuration step.

### C. Resolve Android NDK tooling error

- Audit the local Android SDK installation: confirm the NDK version installed through Android Studio or `sdkmanager` is complete and includes `source.properties`.
- Decide whether to reinstall the same NDK version or pin to an Expo-supported version (e.g., 26.x) and update any local environment variables (`ANDROID_NDK_HOME`, `ANDROID_HOME`) accordingly.
- After fixing the NDK installation, clear Gradle caches for the project to ensure the corrected toolchain is used.

### D. Regression checks & documentation

- Re-run the Android debug build (`app:assembleDebug`) after addressing FCM recognition and NDK installation to ensure the warning and failure are resolved.
- Capture updated setup notes in project documentation (e.g., `README.md` or `ANDROID_BUILD_FIX.md`) to guide other developers through the required Android tooling and Firebase configuration.

## Deliverables

- Summary of findings for each investigation area (FCM detection, Expo config alignment, NDK setup).
- Updated project documentation covering Android prerequisites and Firebase configuration expectations.
- Confirmation that the Android debug build succeeds without the reported warning and NDK error.

## Resources & References

- Expo Notifications & FCM configuration guide: https://docs.expo.dev/push-notifications/using-fcm/
- Expo Android build troubleshooting: https://docs.expo.dev/build-reference/android-builds/
- Android NDK setup instructions: https://developer.android.com/ndk/guides
- React Native Android build environment setup (Expo): https://docs.expo.dev/workflow/android-studio-emulator/
