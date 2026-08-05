# Issue: Hapus console.log sensitif di flow registrasi

## Deskripsi
Ada beberapa `console.log` di flow registrasi yang menampilkan data sensitif pengguna (password, phone, name) di konsol. Ini harus dihapus.

## Lokasi yang perlu diperbaiki
- `app/(auth)/register.tsx` — console.log dengan payload register (termasuk password)
- `src/services/api/auth.ts` — console.log request payload dan response di fungsi `register`

## Kriteria selesai
- Tidak ada lagi console.log yang memuat data sensitif di flow register
- `npm run lint` dan `npm run typecheck` lulus
