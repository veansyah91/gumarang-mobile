# Issue: Klik List Pembelian Emas Salah Arah ke "Data Emasku"

## Latar Belakang

Pada fitur member purchase, ketika pengguna menekan salah satu item di daftar
riwayat pembelian emas (`/(app)/purchase-member`), alur navigasi yang terjadi
saat ini salah:

- **Alur saat ini:** klik item → masuk ke halaman "Data Emasku" (`gold-list`).
- **Alur seharusnya:** klik item → masuk ke halaman "Detail Pembelian Emas"
  (`purchase-member/[id]`).

Penyebabnya diduga ada route dinamis ganda yang saling bentrok di folder
`app/(app)/purchase-member/`, yaitu `[id].tsx` (route yang benar, menuju detail
pembelian) dan `[gold-id].tsx` (route asing/duplikat yang justru me-redirect
ke `/(app)/gold-list`, halaman "Data Emasku"). Dua segment dinamis berbeda
nama dalam satu folder yang sama dapat membuat expo-router salah mencocokkan
route saat navigasi, sehingga user diarahkan ke tujuan yang salah.

## Tujuan

Pastikan menekan item apa pun di daftar riwayat pembelian emas selalu
mengarahkan pengguna ke halaman detail pembelian emas yang benar, tanpa ada
route yang bentrok atau ambigu di folder `purchase-member`.

## Instruksi Tingkat Tinggi

- Telusuri seluruh folder route `app/(app)/purchase-member/` dan pastikan
  hanya ada satu route dinamis (`[id].tsx`) yang menjadi tujuan navigasi
  detail pembelian emas.
- Hilangkan/rapikan route dinamis lain yang tidak seharusnya ada di folder
  tersebut (seperti file yang justru mengarah ke fitur "Data Emasku"), agar
  tidak terjadi konflik penamaan route dinamis dalam satu folder yang sama.
- Cek juga folder route serupa lain (misalnya `gold-list`, `sale-member`,
  `gold-convertion-member`, dll) untuk memastikan tidak ada pola route
  duplikat/ambigu yang sama, sebagai pencegahan bug serupa di kemudian hari.
- Pastikan komponen daftar transaksi pembelian
  (`src/components/member-purchase-transaction-list.tsx`) tetap melakukan
  navigasi ke path detail pembelian yang benar dan konsisten dengan struktur
  routing expo-router yang ada.
- Jangan mengubah tampilan/UI halaman daftar maupun halaman detail pembelian,
  fokus hanya pada perbaikan alur navigasinya.

## Yang Tidak Perlu Dilakukan

- Tidak perlu mengubah logic fitur "Data Emasku" (`gold-list`) itu sendiri,
  fitur tersebut tetap harus berfungsi normal saat diakses dari menunya
  sendiri.
- Tidak perlu menambahkan fitur baru pada halaman detail pembelian emas.
- Tidak perlu mengubah desain/komponen UI, cukup perbaiki routing yang salah.

## Definisi Selesai (Acceptance Criteria)

- Saat pengguna menekan item mana pun di daftar riwayat pembelian emas,
  pengguna diarahkan ke halaman "Detail Pembelian Emas" yang menampilkan data
  transaksi pembelian sesuai item yang diklik.
- Tidak ada lagi kasus klik item pembelian yang malah menampilkan halaman
  "Data Emasku".
- Tidak ada route dinamis yang saling bentrok/ambigu di folder
  `app/(app)/purchase-member/`.
- Fitur "Data Emasku" tetap berfungsi normal saat diakses melalui menunya
  sendiri (tidak ada regresi).
- Lint & type-check tetap bersih setelah perubahan.
