# Panduan Perbaikan Android NDK Build Error

## Masalah

Error pada saat build Android:

```
[CXX1101] NDK at C:\Users\User\AppData\Local\Android\Sdk\ndk\27.1.12297006 did not have a source.properties file
```

## Penyebab

- Instalasi Android NDK rusak atau tidak lengkap
- File `source.properties` hilang dari direktori NDK
- Versi NDK tidak kompatibel atau tidak dikonfigurasi dengan benar di project

---

## Solusi Perbaikan

### Step 1: Hapus NDK yang Rusak

Buka **Command Prompt** atau **PowerShell** dan jalankan:

```cmd
cd C:\Users\User\AppData\Local\Android\Sdk\ndk
rmdir /s /q 27.1.12297006
```

**Atau** gunakan **Android Studio**:

- Buka Android Studio
- Pergi ke: **Tools** → **SDK Manager**
- Tab: **SDK Tools**
- Cari: **NDK (Side by side)**
- Uninstall versi 27.1.12297006
- Install versi stabil: **27.0.12077973** (yang sudah dikonfigurasi di project)

### Step 2: Download NDK Stabil

Dalam **Android Studio SDK Manager**:

1. Pergi ke **Tools** → **SDK Manager**
2. Tab: **SDK Tools**
3. Cek: **NDK (Side by side)**
4. Pilih versi: **27.0.12077973**
5. Klik **OK** untuk download dan install

**Tunggu sampai instalasi selesai 100%**

### Step 3: Verifikasi Instalasi NDK

Pastikan folder NDK yang baru sudah ada dan berisi file `source.properties`:

```cmd
dir "C:\Users\User\AppData\Local\Android\Sdk\ndk"
dir "C:\Users\User\AppData\Local\Android\Sdk\ndk\27.0.12077973"
```

Anda harus melihat file `source.properties` di dalamnya.

### Step 4: Pembersihan Cache Build Lokal

Jalankan perintah berikut di folder project:

```cmd
cd c:\External\Projects\laragon\www\gumarang-mobile\android
gradlew clean
```

**Atau di Windows:**

```cmd
cd c:\External\Projects\laragon\www\gumarang-mobile\android
.\gradlew.bat clean
```

### Step 5: Rebuild Android

Kembali ke folder project utama:

```cmd
cd c:\External\Projects\laragon\www\gumarang-mobile
npm run android
```

**Atau gunakan EAS CLI untuk build production:**

```cmd
eas build -p android --profile production-apk
```

---

## Verifikasi Konfigurasi Project

Konfigurasi NDK telah diperbarui di `android/build.gradle`:

```gradle
ext {
  buildToolsVersion = "35.0.0"
  minSdkVersion = 24
  compileSdkVersion = 35
  targetSdkVersion = 35
  ndkVersion = "27.0.12077973"  // ← Versi NDK yang kompatibel
}
```

**Versi NDK yang dikonfigurasi:** `27.0.12077973`

---

## Checklist Perbaikan

- [ ] Hapus folder NDK yang rusak (`27.1.12297006`)
- [ ] Download NDK versi `27.0.12077973` melalui Android Studio SDK Manager
- [ ] Verifikasi file `source.properties` ada di folder NDK baru
- [ ] Jalankan `gradlew clean` di folder `android/`
- [ ] Jalankan `npm run android` untuk test build debug
- [ ] Jika berhasil, coba build production dengan `eas build -p android`

---

## Troubleshooting

### Error masih terjadi setelah step di atas?

**1. Bersihkan gradle cache completely:**

```cmd
cd c:\External\Projects\laragon\www\gumarang-mobile\android
rmdir /s /q .gradle
rmdir /s /q build
.\gradlew.bat clean
```

**2. Reset Android SDK (Nuclear Option):**

```cmd
rmdir /s /q "C:\Users\User\AppData\Local\Android\Sdk\ndk"
```

Lalu download ulang semua NDK melalui Android Studio SDK Manager.

**3. Pastikan environment variable:**

- `ANDROID_SDK_ROOT` or `ANDROID_HOME` = `C:\Users\User\AppData\Local\Android\Sdk`
- Bisa di-set melalui:
  - **Settings** → **Environment Variables** → **Edit system environment variables** → **New** →
  - Variable name: `ANDROID_HOME`
  - Variable value: `C:\Users\User\AppData\Local\Android\Sdk`

**4. Restart Android Studio dan IDE Anda**

---

## Syncing Firebase config for local builds

If you keep `google-services.json` in the project root, run the helper script before building locally to ensure the native Android project sees it:

```cmd
npm run sync:google-services
# or just
npm run android
```

---

## Informasi Versi Project

- **Expo Version:** 55.0.24
- **React Native:** 0.83.6
- **Build Tools:** 35.0.0
- **Compile SDK:** 35
- **Target SDK:** 35
- **Min SDK:** 24
- **NDK Version:** 27.0.12077973

---

## Referensi

- [React Native Android Build Setup](https://reactnative.dev/docs/environment-setup)
- [Expo Android Build Documentation](https://docs.expo.dev/build-reference/android/)
- [Android NDK Documentation](https://developer.android.com/ndk)
