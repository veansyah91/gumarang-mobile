# Issue: Gambar Katalog Tidak Tampil di Aplikasi

## Problem

Gambar catalog tidak dimuat karena field name tidak sesuai antara response backend dan kode frontend.

Backend mengembalikan `primary_image.url` dan `image_path`, tetapi tipe data dan komponen frontend menggunakan `image_url`.

## Root Cause

Mismatch field name:

- Backend kirim: `primary_image.url`
- Frontend pakai: `primary_image.image_url`

## Files yang Perlu Dimodifikasi

### 1. `src/types/catalog.ts`

- Update interface `CatalogImage`: ganti field `image_url` → `url`, tambah `image_path` dan `is_primary`
- Update tipe `primary_image` di dalam `Catalog`: ganti `image_url` → `url`, tambah `image_path` dan `is_primary`

### 2. `src/components/catalog-grid.tsx`

- Ganti semua referensi `primary_image?.image_url` → `primary_image?.url`

### 3. `src/components/public-catalog.tsx`

- Ganti semua referensi `primary_image?.image_url` → `primary_image?.url`

### 4. `src/components/catalog-image-modal.tsx`

- Ganti referensi `item.image_url` → `item.url` untuk render gambar di slider dan thumbnail

### 5. `src/services/api/catalog.ts`

- Update log debug: ganti `c.primary_image?.image_url` → `c.primary_image?.url`

## Backend Response Reference

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "GELANG PANDORA 0,25",
      "description": null,
      "is_active": true,
      "primary_image": {
        "id": 1,
        "catalog_id": 1,
        "image_path": "catalogs/xxx.png",
        "is_primary": true,
        "url": "https://dns.tokomasgumarang.com/catalogs/xxx.png"
      }
    }
  ]
}
```

## Acceptance Criteria

- Gambar catalog tampil di `PublicCatalog` dan `CatalogGrid`
- Modal `CatalogImageModal` menampilkan gambar dengan benar di slider dan thumbnail
- Tidak ada TypeScript type error
