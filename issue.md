# Perbarui Template Personal Finance

## Latar Belakang

Halaman Personal Finance (`app/(app)/personal-finance/`) saat ini menampilkan
dua header sekaligus saat dibuka:

1. Header default dari root stack (`app/(app)/_layout.tsx`) yang menampilkan
   tombol back beserta judul otomatis dari nama route, contohnya
   `<- personal-finance`. Header ini tidak diinginkan.
2. Header custom (`src/components/ui/header.tsx`) yang dipakai oleh
   `app/(app)/personal-finance/_layout.tsx` untuk seluruh screen di folder
   Personal Finance.

## Tujuan

Sederhanakan tampilan header khusus untuk area Personal Finance.

## Task

### 1. Hapus header default paling atas

Hilangkan header bawaan `<- personal-finance` yang muncul di atas halaman
Personal Finance. Cari konfigurasi route Personal Finance di root stack
(`app/(app)/_layout.tsx`) dan pastikan header default tersebut tidak lagi
tampil untuk route ini (misalnya dengan mematikan header bawaan khusus untuk
route Personal Finance, mengikuti pola yang sudah dipakai route lain seperti
`(tabs)`).

### 2. Buat header baru khusus Personal Finance

Ganti/sesuaikan header yang dipakai di `app/(app)/personal-finance/_layout.tsx`
sehingga menampilkan susunan komponen berikut dalam satu baris:

```
[Ikon]  Label                              (Tombol Home)
```

Detail komponen:

- **Ikon**: ikon yang merepresentasikan Personal Finance/keuangan (boleh pilih
  ikon dari library ikon yang sudah dipakai di proyek, mis. Ionicons).
- **Label**: teks statis `"Atur Uang"`, ditempatkan di sebelah kanan ikon.
- **Tombol Home**: tombol di ujung kanan header. Saat ditekan, navigasikan
  pengguna ke halaman utama aplikasi (dashboard/tab utama, bukan halaman
  Personal Finance).

Header ini bisa dibuat sebagai komponen baru (mis. di
`src/components/ui/`) atau menjadi header khusus yang didefinisikan langsung
di `app/(app)/personal-finance/_layout.tsx`. Sesuaikan gaya (warna, spacing,
font) agar konsisten dengan tema aplikasi yang sudah ada (lihat
`src/theme/tokens.ts` dan komponen `Header` yang sudah ada sebagai referensi
gaya).

## Catatan

- Fokus hanya pada perubahan header di area Personal Finance. Jangan mengubah
  header di halaman lain.
- Pastikan navigasi "Tombol Home" menuju halaman utama aplikasi (dashboard)
  yang sudah ada, gunakan mekanisme navigasi (expo-router) yang sudah dipakai
  di proyek.
- Tidak perlu menambahkan fitur baru selain yang dijelaskan di atas.
