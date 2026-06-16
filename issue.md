# Issue Planning: Fix Warnings & Errors

## Objective

Memperbaiki warning dan error yang ada di aplikasi untuk memastikan stabilitas dan penggunaan dependensi yang up-to-date.

## Tasks

### 1. Migrasi Video Component dari `expo-av` ke `expo-video`

**Error/Warning:** `⚠️ [expo-av]: Video component from expo-av is deprecated in favor of expo-video.`
**Instruksi High-Level:**

- Identifikasi semua komponen yang saat ini menggunakan `Video` dari `expo-av`.
- Ganti implementasi video dengan library terbaru yaitu `expo-video`.
- Sesuaikan properti dan method pemutar video mengikuti dokumentasi resmi: https://docs.expo.dev/versions/latest/sdk/video/
- Pastikan fitur video (seperti autoplay, control, styling) berjalan normal dengan API yang baru.

### 2. Memperbaiki State Update pada Unmounted Component

**Error/Warning:** `ERROR Can't perform a React state update on a component that hasn't mounted yet.`
**Instruksi High-Level:**

- Lakukan penelusuran untuk menemukan komponen yang melakukan perubahan state (_state update_) secara _asynchronous_ langsung di dalam fungsi render.
- Pindahkan logika yang memiliki _side-effect_ tersebut ke dalam _hook_ `useEffect`.
- Pastikan ada mekanisme pengecekan _mounted state_ atau _cleanup_ untuk memastikan update hanya terjadi jika komponen sedang aktif (mounted).

## Acceptance Criteria

- Warning depresiasi `expo-av` tidak lagi muncul di console.
- Error "state update on an unmounted component" tidak lagi terjadi selama interaksi atau navigasi aplikasi.
- Error TypeScript pada `VideoViewProps` (Task 3) telah diperbaiki di `src/components/catalog-image-modal.tsx`.

### 3. Perbaiki Error TypeScript pada Komponen VideoView [DONE]

**Target File:** `src/components/catalog-image-modal.tsx`
**Error:** `TypeScript Error TS2769: Property 'allowsFullscreen' does not exist on type 'VideoViewProps'.`

**Instruksi High-Level:**

- Periksa penggunaan komponen `VideoView` di dalam `src/components/catalog-image-modal.tsx`.
- Saat ini ada beberapa properti (`allowsFullscreen`, `allowsPictureInPicture`) yang di-pass ke komponen tersebut, namun ditolak oleh TypeScript karena tidak ada di dalam `VideoViewProps` (berkaitan dengan migrasi ke `expo-video`).
- Sesuaikan pemanggilan komponen `VideoView`. Hapus atau sesuaikan properti yang sudah tidak valid/didukung berdasarkan dokumentasi API dari library video yang baru.
- Pastikan bahwa error TypeScript hilang dan pemutar video tetap bisa ditampilkan dengan baik.
