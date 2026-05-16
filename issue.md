# Issue: Navigasi Awal dan Setelah Logout

## Masalah

1. **App buka → langsung ke login**: Saat pertama kali dibuka, app mengarahkan pengguna ke halaman login, padahal seharusnya ke halaman home.
2. **Logout → langsung ke login**: Setelah logout, app mengarahkan ke login, padahal seharusnya kembali ke home.

## Root Cause

`app/(app)/_layout.tsx` melakukan redirect ke `/(auth)/login` jika status auth bukan `'authenticated'`. Ini menyebabkan halaman home tidak bisa diakses oleh pengguna yang belum login.

## Rencana Perbaikan

### 1. Jadikan halaman home dapat diakses tanpa login

Hapus atau ubah guard di `app/(app)/_layout.tsx` agar tidak redirect ke login secara global. Halaman home (tabs index) harus bisa diakses oleh semua pengguna, baik yang sudah login maupun belum.

### 2. Pindahkan guard auth ke tab/halaman yang memerlukan login

Tab seperti **Profil**, **Emasku**, dan **Tabunganku** harus tetap terlindungi. Tambahkan redirect ke login hanya di dalam halaman-halaman tersebut, bukan di level layout `(app)`.

### 3. Sembunyikan tab bar untuk pengguna yang belum login

Tab bar sudah dikondisikan dengan `user` di `app/(app)/(tabs)/_layout.tsx`. Pastikan perilaku ini tetap berjalan setelah perubahan guard.

## Hasil yang Diharapkan

- App dibuka → masuk ke halaman home (tanpa perlu login)
- Logout → kembali ke halaman home (bukan login)
- Mengakses tab Profil/Emasku/Tabunganku tanpa login → redirect ke login
