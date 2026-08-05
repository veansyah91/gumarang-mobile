## Issue: Hapus console.log / console.error pada Flow Register & Auth

### Deskripsi
Pada flow register dan autentikasi, terdapat `console.log` / `console.error` yang mencetak payload berisi data sensitif (password, nomor telepon, nama) serta detail response API ke console. Ini harus dihapus untuk mencegah kebocoran data.

### Task

1. **Hapus semua `console.error` di `src/services/api/auth.ts`**  
   Pada method `register` terdapat catch block yang berisi tiga `console.error` yang mencetak detail error termasuk `error.response?.data`. Hapus semua — biarkan `throw error` tetap ada.

2. **Hapus `console.warn` di `src/utils/errors.ts`**  
   Terdapat `console.warn('[API 422 validation]', ...)` yang mencetak detail response body. Hapus baris tersebut.

3. **Hapus `console.log` / `console.error` di `src/services/notifications.ts` dengan tag `[notifications]`**  
   Hapus semua logging terkait register/unregister device token — biarkan error handling tetap berjalan.

4. **Hapus `console.log` di `src/hooks/use-push-notification.ts` dengan tag `[push]`**  
   Hapus semua `console.log` terkait token registration/skipping.

### Catatan
- Biarkan `throw` dan logic error handling tetap berjalan — hanya hapus statement `console.*`.
- Tidak perlu menambah logging alternatif.
