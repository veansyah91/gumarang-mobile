# Planning Resolusi Error

Terdapat dua error utama yang perlu diperbaiki. Berikut adalah panduan *high-level* untuk menyelesaikan masing-masing error:

## 1. React State Update Error
**Error:** Can't perform a React state update on a component that hasn't mounted yet...

**Instruksi:**
- Lakukan inspeksi pada komponen-komponen React, terutama yang melakukan *fetching* data atau operasi asinkron saat inisialisasi (misalnya terkait notifikasi atau autentikasi).
- Pastikan semua operasi asinkron (pemanggilan API, *timeout*, dsb) yang memicu perubahan *state* secara eksplisit dipanggil melalui *hook* useEffect, bukan diletakkan langsung pada *render function* komponen.
- Terapkan mekanisme *cleanup* atau pengecekan status *mount* komponen untuk mencegah *state update* yang tidak perlu.

## 2. Notification Device Token Error
**Error:** [notifications] Failed to register device token: [AppError: Request failed with status code 404]

**Instruksi:**
- Periksa modul, *hook*, atau fungsi di dalam aplikasi yang bertugas mendaftarkan *push notification device token* ke server.
- Kode error 404 menandakan bahwa URL *endpoint* API yang dituju tidak tersedia di *backend*.
- Lakukan verifikasi URL *endpoint*, *path API*, dan *HTTP method* yang digunakan pada *request*. Pastikan formatnya sudah persis sesuai dengan *route* yang terdaftar di *backend*.
- Pastikan juga konfigurasi *base URL* API untuk *environment* saat ini sudah mengarah ke server yang benar.