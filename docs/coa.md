# Accounts API

API untuk mengelola akun keuangan milik member. Akun disimpan di tabel `accounts` dengan tipe seperti `asset`, `liability`, `equity`, `income`, dan `expense`.

Base URL: `https://api.gumarang.local/api/v1/member`

## Authentication

Semua endpoint memerlukan **Bearer Token** via Sanctum.

```text
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## 1. Get Account Tree

Mengembalikan daftar akun milik member dalam bentuk tree (parent dengan children-nya).

**Endpoint**

```text
GET /api/v1/member/accounts
```

### Query Parameters

| Parameter   | Tipe    | Default | Keterangan                                                                               |
| ----------- | ------- | ------- | ---------------------------------------------------------------------------------------- |
| `type`      | string  | —       | Filter berdasarkan tipe akun. Nilai: `asset`, `liability`, `equity`, `income`, `expense` |
| `is_active` | boolean | —       | Filter berdasarkan status aktif                                                          |
| `search`    | string  | —       | Pencarian berdasarkan `name` atau `no_ref` (LIKE)                                        |

### Response (200 OK)

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "accounts": [
      {
        "id": 1,
        "name": "Bank Mandiri",
        "type": "asset",
        "normal_balance": "debit",
        "icon": "bank",
        "color": "#3B82F6",
        "opening_balance": 0,
        "current_balance": 1000000,
        "is_default": false,
        "is_active": true,
        "parent_id": null,
        "children": [
          {
            "id": 5,
            "name": "Tabungan Mandiri",
            "type": "asset",
            "normal_balance": "debit",
            "icon": "wallet",
            "color": "#3B82F6",
            "opening_balance": 0,
            "current_balance": 500000,
            "is_default": false,
            "is_active": true,
            "parent_id": 1
          }
        ]
      }
    ]
  },
  "meta": {
    "total_records": 1,
    "total_top_level": 1
  }
}
```

### Contoh Request

```text
GET /api/v1/member/accounts
GET /api/v1/member/accounts?type=asset
GET /api/v1/member/accounts?search=bank
GET /api/v1/member/accounts?search=REF001
```

### Catatan

- Hanya akun milik member yang sedang login yang dikembalikan.
- Parameter `search` mencari berdasarkan `name` atau `no_ref`.

---

## 2. Get Selectable Accounts

Mengembalikan daftar akun aktif milik member yang dapat dipilih di form/formulir transaksi. Secara default hanya akun top-level (tidak memiliki parent) yang dikembalikan, kecuali parameter `has_parent=true` diberikan.

**Endpoint**

```text
GET /api/v1/member/accounts/selectable
```

### Query Parameters

| Parameter        | Tipe    | Default | Keterangan                                                                                                                                        |
| ---------------- | ------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`           | string  | —       | Filter berdasarkan tipe akun. Nilai: `asset`, `liability`, `equity`, `income`, `expense`                                                          |
| `name`           | string  | —       | Pencarian nama akun (LIKE, case-insensitive)                                                                                                      |
| `asset_category` | string  | —       | Filter berdasarkan kategori aset. Nilai: `current`, `fixed`, `investment`, dll. Hanya relevan jika `type=asset`                                   |
| `has_parent`     | boolean | `false` | Jika `true`, hanya mengembalikan akun child (yang memiliki parent). Jika `false` (default), hanya akun top-level (tanpa parent)                   |
| `is_cash`        | boolean | —       | Filter berdasarkan kategori likuiditas. `true` → hanya akun dengan `asset_category=current`. `false` → hanya akun dengan `asset_category≠current` |

### Response (200 OK)

```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "name": "Bank Mandiri",
      "asset_category": "current",
      "group_label": null,
      "icon": "bank",
      "color": "#3B82F6",
      "current_balance": 1000000
    },
    {
      "id": 2,
      "name": "Cash",
      "asset_category": "current",
      "group_label": null,
      "icon": "cash",
      "color": "#10B981",
      "current_balance": 500000
    }
  ]
}
```

### Response Fields — `data[]`

| Field             | Tipe             | Keterangan                                                            |
| ----------------- | ---------------- | --------------------------------------------------------------------- |
| `id`              | integer          | ID akun                                                               |
| `name`            | string           | Nama akun                                                             |
| `asset_category`  | string atau null | Kategori aset (`current`, `fixed`, `investment`, atau `null`)         |
| `group_label`     | string atau null | Nama parent akun (terisi untuk child account, `null` untuk top-level) |
| `icon`            | string atau null | Nama ikon akun                                                        |
| `color`           | string atau null | Warna akun (hex)                                                      |
| `current_balance` | integer          | Saldo saat ini                                                        |

### Contoh Request

```text
GET /api/v1/member/accounts/selectable
GET /api/v1/member/accounts/selectable?type=asset
GET /api/v1/member/accounts/selectable?name=bank
GET /api/v1/member/accounts/selectable?has_parent=true
GET /api/v1/member/accounts/selectable?type=asset&name=cash&has_parent=false
GET /api/v1/member/accounts/selectable?is_cash=true
GET /api/v1/member/accounts/selectable?is_cash=false
```

### Catatan

- Hanya akun milik member yang sedang login yang dikembalikan.
- Akun dengan `is_active = false` tidak pernah dikembalikan.
- Secara default (`has_parent=false`), child account (yang memiliki `parent_id`) tidak ikut. Gunakan `has_parent=true` jika ingin mendapatkan child account saja.

---

## 3. Get Account History

Mengembalikan riwayat transaksi (buku besar) untuk satu akun tertentu. Data diambil dari `transaction_entries` yang terkait dengan akun.

**Endpoint**

```text
GET /api/v1/member/accounts/{id}/history
```

### Query Parameters

| Parameter   | Tipe          | Default | Keterangan                                    |
| ----------- | ------------- | ------- | --------------------------------------------- |
| `startDate` | string (date) | —       | Filter tanggal mulai (`Y-m-d`)                |
| `endDate`   | string (date) | —       | Filter tanggal akhir (`Y-m-d`)                |
| `perPage`   | integer       | `15`    | Jumlah data per halaman                       |
| `all`       | boolean       | `false` | Jika `true`, return semua data tanpa paginasi |

### Response (200 OK)

```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "transaction_id": 10,
      "transaction_reference": "CI-20260729-0001",
      "transaction_notes": "Setoran tunai",
      "transaction_date": "2026-07-29T10:00:00.000000Z",
      "entry_type": "debit",
      "amount": 500000,
      "account_id": 1,
      "account_name": "Bank Mandiri"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 1
  }
}
```

### Response Fields — `data[]`

| Field                   | Tipe              | Keterangan              |
| ----------------------- | ----------------- | ----------------------- |
| `id`                    | integer           | ID transaction entry    |
| `transaction_id`        | integer           | ID transaksi            |
| `transaction_reference` | string            | No. referensi transaksi |
| `transaction_notes`     | string atau null  | Catatan transaksi       |
| `transaction_date`      | string (datetime) | Tanggal transaksi       |
| `entry_type`            | string            | `debit` atau `credit`   |
| `amount`                | integer           | Jumlah                  |
| `account_id`            | integer           | ID akun                 |
| `account_name`          | string            | Nama akun               |

### Contoh Request

```text
GET /api/v1/member/accounts/1/history
GET /api/v1/member/accounts/1/history?startDate=2026-07-01&endDate=2026-07-31
GET /api/v1/member/accounts/1/history?all=true
GET /api/v1/member/accounts/1/history?perPage=50
```

### Catatan

- Hanya data milik member yang sedang login yang dikembalikan.
- Jika akun tidak ditemukan atau bukan milik member, response `404 Not Found`.
