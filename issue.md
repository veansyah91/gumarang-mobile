# Issue: Input Nomor HP Tidak Bisa Diketik di Login & Register

## Deskripsi Bug

User tidak bisa mengetik nomor HP pada field input di halaman login dan register, namun field password bisa diketik dengan normal.

## Lokasi File

- `app/(auth)/login.tsx` — field "No. Handphone"
- `app/(auth)/register.tsx` — field "Nomor Telepon"
- `src/components/ui/input.tsx` — komponen `Input` yang digunakan

## Analisis Root Cause

Komponen `Input` membungkus `TextInput` di dalam `View` dengan `flexDirection: 'row'`. Perbedaan antara field phone dan password:

| Field    | `keyboardType` | `rightElement`     | `secureTextEntry` |
| -------- | -------------- | ------------------ | ----------------- |
| Phone    | `phone-pad`    | ❌ tidak ada       | ❌                |
| Password | default        | ✅ ada (Pressable) | ✅                |

Kemungkinan penyebab: `TextInput` tidak mendapatkan area sentuh yang cukup atau event touch terinterupsi, terutama karena tidak ada `rightElement` sehingga layout-nya berbeda.

## Tugas yang Perlu Diimplementasikan

1. **Periksa dan perbaiki komponen `Input`** (`src/components/ui/input.tsx`):
   - Pastikan `TextInput` bisa menerima sentuhan dan fokus dalam segala kondisi (ada/tidak ada `rightElement`)
   - Tambahkan `pointerEvents` yang tepat pada wrapper `View` jika diperlukan
   - Pertimbangkan membungkus `inputRow` dengan `Pressable` yang saat ditekan langsung mem-focus `TextInput` menggunakan `ref`

2. **Verifikasi di halaman Login** (`app/(auth)/login.tsx`):
   - Field "No. Handphone" harus bisa diketik angka dengan keyboard `phone-pad`

3. **Verifikasi di halaman Register** (`app/(auth)/register.tsx`):
   - Field "Nomor Telepon" harus bisa diketik angka dengan keyboard `phone-pad`

## Kriteria Selesai

- User bisa menekan field nomor HP dan langsung mengetik angka
- Keyboard phone-pad muncul saat field nomor HP difokuskan
- Behavior input nomor HP konsisten dengan input password
