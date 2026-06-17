# Issue: Modifikasi Halaman /catalog

## Deskripsi Task

Tambahkan komponen pricelist pada halaman `/catalog`. Komponen ini akan menampilkan daftar harga perhiasan beserta tren perubahan harganya.

Gunakan komponen **price card** yang sudah ada di project (atau struktur serupa) sebagai template UI utama untuk menampilkan masing-masing harga.

## High-Level Implementation Steps

1. **Fetch Data:** Ambil data pricelist dari endpoint API yang disediakan.
2. **Buat Komponen Pricelist:** Buat komponen pembungkus (misal: `PricelistSection` atau `PricelistCard`) yang me-render struktur "price card".
3. **Mapping Data:** Petakan data response API ke dalam price card. Pastikan untuk menampilkan:
   - Harga jual (`saleValue`) dan harga beli (`purchaseValue`) dari data `current`.
   - Informasi tren pergerakan harga (`trend`) dan selisihnya (`difference`).
4. **Integrasi ke Halaman:** Pasang komponen pricelist tersebut pada halaman utama `/catalog`.

## Data Source

**Endpoint:**
`GET /api/v1/jewelry-price-list`

**Contoh Response:**

```json
{
  "mayam": {
    "current": {
      "date": "2026-05-12",
      "price": {
        "purchaseValue": 7837000,
        "saleValue": 8250000
      }
    },
    "previous": {
      "date": "2026-04-30",
      "price": {
        "purchaseValue": 779000,
        "saleValue": 820000
      }
    },
    "difference": 7430000,
    "trend": "up"
  }
}
```

_Catatan Implementasi: Gunakan standar state management / data fetching yang ada di project, buat sekecil/sesimpel mungkin sesuai komponen UI card yang re-usable, lalu injek pada parent page._
