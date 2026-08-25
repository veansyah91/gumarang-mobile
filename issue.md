# Planning: Harga Jual dan Harga Buyback

## Tujuan

Menyesuaikan informasi harga pada komponen list harga berdasarkan status autentikasi pengguna.

## Rencana Implementasi

- Tinjau komponen list harga dan sumber data harga yang saat ini digunakan.
- Untuk pengguna yang belum login, tampilkan hanya harga jual.
- Untuk pengguna yang sudah login, tampilkan harga buyback sebagai harga utama atau harga yang relevan bagi pengguna tersebut.
- Pastikan perubahan mengikuti sumber status autentikasi dan pola komponen yang sudah ada.
- Pertahankan tampilan yang konsisten serta pastikan kondisi loading dan data harga yang tidak tersedia tetap ditangani dengan baik.
- Verifikasi perilaku pada kondisi pengguna belum login dan sudah login.

## Kriteria Selesai

- Pengguna anonim hanya melihat harga jual.
- Pengguna yang sudah login melihat harga buyback.
- Tidak ada perubahan yang mengganggu tampilan atau alur komponen list harga lainnya.
