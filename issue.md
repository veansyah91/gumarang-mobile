# Issue: Redesign Halaman Authentication

## Tujuan
Redesign semua halaman auth (login, register, forgot-password, verify-phone, new-password) agar tampilannya selaras dengan UI web di `C:\External\Projects\laragon\www\gumarang`.

---

## Task 1 – Ganti Asset Logo
- Ganti semua penggunaan asset gambar lama dengan `assets/images/logo.png` (atau `logo.jpg`)
- Hapus referensi ke asset lama yang tidak dipakai

---

## Task 2 – Redesign Layout Auth (semua halaman)
Ikuti pola `auth-simple-layout.tsx` dari web sebagai acuan:

```
[Layar penuh, konten di tengah vertikal]

  Logo (gambar, centered, ~80x80)
  Nama Toko / App Name (teks, centered)
  Subtitle / description (teks muted, centered)

  [Card / form area]
    ... field-field form ...
    [Tombol aksi utama, full width]
  [/Card]

  [Footer link (centered)]
```

- Gunakan `spacing.lg` (gap besar antar section) dan `spacing.md` (gap dalam form)
- Padding container menyesuaikan `p-6` (mobile) dari web → pakai `spacing.lg` horizontal
- Logo ditampilkan di atas form, bukan di dalam Card

---

## Task 3 – Sinkronisasi Field Login dengan Web
Sesuaikan halaman `login.tsx` agar fieldnya cocok dengan `web/pages/auth/login.tsx`:
- Field: Nomor Handphone + Sandi
- Toggle tampilkan/sembunyikan sandi
- Tombol "Masuk" (full width)
- Link "Lupa Sandi?" di samping label Sandi
- Link "Belum Punya Akun? → Daftar" di footer

---

## Task 4 – Konsistensi Halaman Auth Lainnya
Terapkan layout yang sama (logo + title + card + footer) ke halaman:
- `register.tsx`
- `forgot-password.tsx`
- `verify-phone.tsx`
- `new-password.tsx`

---

## Referensi
- Web login: `C:\External\Projects\laragon\www\gumarang\resources\js\pages\auth\login.tsx`
- Web layout: `C:\External\Projects\laragon\www\gumarang\resources\js\layouts\auth\auth-simple-layout.tsx`
- Mobile login saat ini: `app/(auth)/login.tsx`
- Asset logo: `assets/images/logo.png`, `assets/images/logo.jpg`
