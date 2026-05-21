# Issue: Push Notification - Evaluasi & Perbaikan

---

## Temuan Masalah

### 3.1 - Device Token Tidak Didaftarkan Saat Login

**Lokasi hook:** `src/hooks/use-push-notification.ts`
**Dipanggil di:** `app/(app)/_layout.tsx`

**Analisis:**
Hook `usePushNotification` sudah terpasang di layout `(app)` dan bereaksi terhadap perubahan `isAuthenticated`. Secara arsitektur alurnya sudah benar:

> Login -> `setSession` -> `isAuthenticated = true` -> `(app)/_layout` mount -> `useEffect` jalan -> daftar token

**Root cause yang paling mungkin:** Hook memiliki early exit di `use-push-notification.ts` baris 57:

```ts
if (Constants.appOwnership === 'expo') {
  return; // SKIP total saat testing di Expo Go
}
```

Sejak Expo SDK 53, **Expo Go tidak mendukung remote push notification Android**. Jika pengujian dilakukan via Expo Go, seluruh alur pendaftaran token dilewati tanpa error — sehingga API `POST /api/v1/member/device-token` tidak pernah dipanggil.

**Kemungkinan lain (perlu dikonfirmasi):**

- `hasAndroidFcmConfig === false` — meskipun `google-services.json` ada, perlu pastikan valid
- Token sudah di-cache sebelumnya di AsyncStorage (key: `push:device-token`) dan nilainya sama

---

## Rencana Perbaikan

### Langkah 1 - Konfirmasi Root Cause

Tambahkan log sementara di setiap titik early exit di `use-push-notification.ts` agar jelas guard mana yang aktif:

```
[push] SKIP: Expo Go
[push] SKIP: FCM not configured
[push] SKIP: token already cached
[push] Registering token...
```

Jalankan ulang login dan periksa console output.

---

### Langkah 2 - Gunakan Development Build

Untuk menguji push notification Android, **wajib development build** (bukan Expo Go):

```bash
npx expo run:android
# atau via EAS
eas build --profile development --platform android
```

Development build melewati guard `appOwnership === 'expo'` sehingga flow registrasi token berjalan normal.

---

### Langkah 3 - Paksa Re-registrasi Token (jika perlu debug)

Jika token pernah di-cache sebelumnya:

- Hapus key `push:device-token` dari AsyncStorage (via expo-dev-client DevMenu atau clear app data)
- Token baru akan dipaksa didaftarkan ulang ke backend

---

### Langkah 4 - Verifikasi FCM Setup

- Pastikan `google-services.json` valid (Firebase project aktif)
- Rebuild app setelah perubahan `google-services.json` (perubahan native, hot reload tidak cukup)

---

## Status Lanjutan (3.2 & 3.3)

### 3.2 - Listener Notifikasi

**Status: Sudah terimplementasi** di `use-push-notification.ts`:

- `addNotificationReceivedListener` — handle notifikasi saat app foreground
- `addNotificationResponseReceivedListener` — handle tap notifikasi

**Yang masih perlu dikerjakan (setelah 3.1 terverifikasi berjalan):**

- Hubungkan response listener ke navigasi menggunakan data payload notifikasi (`transactionType`, `referenceNumber`)
- Contoh: tap notifikasi transaksi buka halaman detail transaksi terkait

---

### 3.3 - Halaman Notifikasi & Mark-as-Read

**Status: API sudah tersedia** di `src/services/api/member.ts`:

- `memberApi.getNotifications()`
- `memberApi.markNotificationAsRead(id)`
- `memberApi.markAllNotificationsAsRead()`

Type `NotificationItem` sudah ada di `src/types/member.ts`.

**Yang perlu dibangun:**

1. Buat screen notifikasi: `app/(app)/notifications.tsx`
   - Fetch list dari `getNotifications()`
   - Tampilkan badge/indikator untuk item dengan `read_at === null`
   - Panggil `markAllNotificationsAsRead()` otomatis saat screen dibuka
2. Tambahkan ikon notifikasi di Header (`src/components/ui/header.tsx`) yang navigasi ke screen notifikasi
3. Hubungkan `addNotificationResponseReceivedListener` ke navigasi screen/transaksi terkait

---

## Urutan Pengerjaan yang Disarankan

```
[1] Tambah log konfirmasi -> jalankan dengan development build -> verifikasi device-token API terpanggil
[2] Buat screen notifikasi + integrasikan mark-as-read (3.3)
[3] Hubungkan tap notifikasi ke navigasi transaksi (3.2)
```

---

## Referensi File

| File                                 | Keterangan                                                         |
| ------------------------------------ | ------------------------------------------------------------------ |
| `src/hooks/use-push-notification.ts` | Logic pendaftaran token & listener (edit di sini)                  |
| `app/(app)/_layout.tsx`              | Tempat hook dipanggil                                              |
| `src/services/api/member.ts`         | API: registerDeviceToken, getNotifications, markNotificationAsRead |
| `src/types/member.ts`                | Type: NotificationItem, NotificationResponse                       |
| `src/state/auth-store.ts`            | Login flow, setSession                                             |
| `app.config.ts`                      | Konfigurasi FCM (hasAndroidFcmConfig)                              |
| `src/components/ui/header.tsx`       | Header - tambah ikon notifikasi di sini                            |
