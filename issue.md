# Issue: Refaktor CertificateSubnav menjadi Subnav reusable

## Ringkasan

Komponen CertificateSubnav masih spesifik untuk halaman certificate. Targetnya adalah menjadikannya komponen Subnav yang reusable agar bisa dipakai di halaman lain tanpa duplikasi.

## Tujuan

- Subnav dapat digunakan lintas halaman dengan data menu berbeda.
- API props sederhana dan jelas untuk penggunaan ulang.
- Perilaku di halaman certificate tetap sama.

## Ruang lingkup

- Rename/ekstrak komponen menjadi Subnav generik.
- Pindahkan konfigurasi item menu ke level halaman.
- Perbarui import/export dan hapus referensi ke CertificateSubnav lama.

## Rencana tingkat tinggi

1. Audit penggunaan CertificateSubnav di halaman certificate.
2. Definisikan API Subnav generik (items, active/selected, handler).
3. Migrasikan halaman certificate memakai Subnav dengan data menu yang disuplai dari halaman.
4. Rapikan struktur file dan update semua referensi.

## Kriteria selesai

- Halaman certificate tidak berubah secara fungsional.
- Subnav bisa digunakan di halaman lain hanya dengan memberikan data item.
- Tidak ada referensi tersisa ke CertificateSubnav.
