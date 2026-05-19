# Issue: Setup APK Production Testing

## Tujuan

Menyediakan konfigurasi dan dokumen yang memungkinkan build **APK produksi untuk pengujian internal** sebelum upload ke Play Store, dengan **endpoint produksi**: https://tokomasgumarang.com/

## Ruang Lingkup

1. Konfigurasi environment produksi untuk aplikasi (APP_ENV dan API base URL).
2. Profil build produksi untuk menghasilkan APK testing (bukan submit Play Store).
3. Kesiapan file standar produksi (ikon/splash/adaptive icon, versioning, identitas aplikasi, dan kebutuhan signing via EAS).
4. Dokumentasi ringkas alur build dan QA.

## Rencana High-Level

1. Tinjau konfigurasi Expo/EAS dan env yang ada, lalu tetapkan perubahan agar build produksi memakai environment produksi.
2. Siapkan konfigurasi environment produksi dan pastikan terpakai saat build APK.
3. Lengkapi/rapikan file standar produksi (aset visual, identitas aplikasi, dan metadata rilis) agar sesuai standar rilis Play Store.
4. Siapkan profil build **production APK testing** untuk distribusi internal.
5. Dokumentasikan langkah build dan validasi QA (tanpa detail teknis berlebihan).

## Output yang Diharapkan

1. APK produksi untuk pengujian internal berhasil dibuat.
2. Aplikasi menggunakan endpoint produksi.
3. File standar produksi tersedia dan terkonfigurasi.
4. Dokumen ringkas yang bisa dipakai untuk implementasi/QA.
