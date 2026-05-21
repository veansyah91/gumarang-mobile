# Planning: Fix Android Build Error (NDK source.properties missing)

## Latar Belakang
Saat menjalankan proses build Android, terjadi kegagalan dengan pesan error:
`[CXX1101] NDK at C:\Users\User\AppData\Local\Android\Sdk\ndk\27.1.12297006 did not have a source.properties file`

Error ini menandakan bahwa instalasi Android NDK pada direktori tersebut rusak (kehilangan file `source.properties`) atau versi NDK yang digunakan tidak dikonfigurasi dengan benar di dalam proyek React Native / Expo.

## Tujuan
Memperbaiki konfigurasi proyek agar merujuk ke versi NDK yang valid dan kompatibel, sehingga build Android dapat berjalan dengan sukses.

## Rencana Tindakan (High-Level)

1. **Analisa Versi yang Digunakan**
   - Periksa versi React Native / Expo di dalam `package.json` untuk mengetahui versi Android NDK yang paling direkomendasikan atau kompatibel.

2. **Penyesuaian Konfigurasi Build**
   - Periksa file `android/build.gradle` atau konfigurasi NDK di tingkat aplikasi/Expo (misalnya `app.json` / `build.gradle`).
   - Pastikan versi NDK (properti `ndkVersion`) diset ke versi yang didukung dan stabil secara eksplisit.

3. **Panduan Perbaikan Environment (Untuk User)**
   - Buat instruksi yang menjelaskan cara memastikan NDK diunduh secara penuh melalui Android Studio SDK Manager. Jika versi `27.1.12297006` rusak, minta user untuk menghapus folder NDK tersebut dan mengunduh ulang.

4. **Pembersihan Cache dan Rebuild**
   - Tambahkan instruksi untuk melakukan pembersihan build cache (misalnya menjalankan `gradlew clean` di folder `android`).
   - Lakukan pengujian build ulang.

## Catatan untuk Implementasi AI Selanjutnya
Dokumen ini bersifat panduan tingkat atas (high-level). Implementasikan perbaikan terutama pada bagian konfigurasi di *project level* dan berikan ringkasan perintah/langkah yang harus dijalankan untuk memulihkan *environment* lokal (SDK/NDK).