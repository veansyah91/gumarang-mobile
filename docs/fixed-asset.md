# Fixed Asset Member API

CRUD aset tetap (fixed asset) milik member. Aset tetap disimpan di tabel `accounts` dengan `type = 'asset'` dan `asset_category = 'fixed'`.

Base URL: `/api/v1/member`

## Authentication

Semua endpoint memerlukan **Bearer Token** via Sanctum.

```text
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## 1. List Fixed Assets

Mengembalikan daftar aset tetap dalam bentuk tree (parent-children) berdasarkan kategori `fixed`.

**Endpoint**

```text
GET /api/v1/member/fixed-assets
```

**Response (200 OK)**

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "accounts": [
      {
        "id": 1,
        "name": "Kendaraan",
        "type": "asset",
        "normal_balance": "debit",
        "asset_category": "fixed",
        "icon": "truck",
        "color": "#F97316",
        "opening_balance": 30000000,
        "current_balance": 30000000,
        "is_default": true,
        "is_active": true,
        "parent_id": null,
        "acquisition_date": "2024-01-15",
        "children": [
          {
            "id": 2,
            "name": "Sepeda Motor",
            "type": "asset",
            "normal_balance": "debit",
            "asset_category": "fixed",
            "icon": "bike",
            "color": "#F97316",
            "opening_balance": 25000000,
            "current_balance": 25000000,
            "is_default": false,
            "is_active": true,
            "parent_id": 1,
            "acquisition_date": "2024-01-15"
          }
        ]
      },
      {
        "id": 3,
        "name": "Elektronik",
        "type": "asset",
        "normal_balance": "debit",
        "asset_category": "fixed",
        "icon": "tv",
        "color": "#6366F1",
        "opening_balance": 5000000,
        "current_balance": 5000000,
        "is_default": true,
        "is_active": true,
        "parent_id": null,
        "acquisition_date": "2024-06-01",
        "children": [
          {
            "id": 4,
            "name": "TV LCD",
            "type": "asset",
            "normal_balance": "debit",
            "asset_category": "fixed",
            "icon": "tv",
            "color": "#6366F1",
            "opening_balance": 5000000,
            "current_balance": 5000000,
            "is_default": false,
            "is_active": true,
            "parent_id": 3,
            "acquisition_date": "2024-06-01"
          }
        ]
      }
    ]
  },
  "meta": {
    "total_fixed_asset_value": 35000000
  }
}
```

### Response Fields — `data.accounts[]`

| Field              | Type     | Keterangan                    |
| ------------------ | -------- | ----------------------------- |
| `id`               | integer  | ID akun                       |
| `name`             | string   | Nama aset                     |
| `type`             | string   | Selalu `"asset"`              |
| `normal_balance`   | string   | Selalu `"debit"`              |
| `asset_category`   | string   | Selalu `"fixed"`              |
| `icon`             | string?  | Nama icon Lucide              |
| `color`            | string?  | Warna hex (contoh: `#F97316`) |
| `opening_balance`  | integer  | Saldo awal                    |
| `current_balance`  | integer  | Saldo saat ini                |
| `is_default`       | boolean  | Aset default dari sistem      |
| `is_active`        | boolean  | Status aktif                  |
| `parent_id`        | integer? | ID parent (`null` jika root)  |
| `acquisition_date` | string?  | Tanggal perolehan (`Y-m-d`)   |
| `children`         | array    | Sub-aset (child accounts)     |

### Response Fields — `meta`

| Field                     | Type    | Keterangan                                         |
| ------------------------- | ------- | -------------------------------------------------- |
| `total_fixed_asset_value` | integer | Total nilai seluruh aset tetap (parent + children) |

---

## 2. Show Fixed Asset Detail

**Endpoint**

```text
GET /api/v1/member/fixed-assets/{id}
```

**Path Params**

| Parameter | Type    | Required | Keterangan    |
| --------- | ------- | -------- | ------------- |
| `id`      | integer | Yes      | ID aset tetap |

**Response (200 OK)**

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
    "name": "Kendaraan",
    "type": "asset",
    "normal_balance": "debit",
    "icon": "truck",
    "color": "#F97316",
    "opening_balance": 30000000,
    "current_balance": 30000000,
    "is_default": true,
    "is_active": true,
    "parent_id": null,
    "children": [
      {
        "id": 2,
        "name": "Sepeda Motor",
        "type": "asset",
        "normal_balance": "debit",
        "icon": "bike",
        "color": "#F97316",
        "opening_balance": 25000000,
        "current_balance": 25000000,
        "is_default": false,
        "is_active": true,
        "parent_id": 1
      }
    ]
  }
}
```

> **Catatan:** Response `show` tidak menyertakan `asset_category` dan `acquisition_date` di level data maupun children (berbeda dengan `index`). Field `children` hanya ada jika aset memiliki sub-aset.

---

## 3. Create Fixed Asset

Membuat aset tetap baru. Data disimpan ke tabel `accounts` dengan `type='asset'` dan `asset_category='fixed'`.

**Endpoint**

```text
POST /api/v1/member/fixed-assets
```

**Request Body**

```json
{
  "asset_name": "Kulkas 2 Pintu",
  "icon": "refrigerator",
  "color": "#2196F3",
  "opening_balance": 4500000,
  "acquisition_date": "2026-07-20",
  "is_active": true,
  "parent_id": null
}
```

### Request Fields

| Field              | Type          | Required | Validation                     | Keterangan                            |
| ------------------ | ------------- | -------- | ------------------------------ | ------------------------------------- |
| `asset_name`       | string        | Yes      | max:191                        | Nama aset tetap                       |
| `icon`             | string        | No       | max:191, nullable              | Nama icon Lucide                      |
| `color`            | string        | No       | max:7, nullable                | Warna hex (`#RRGGBB`)                 |
| `opening_balance`  | integer       | No       | nullable                       | Nilai perolehan (default: `0`)        |
| `acquisition_date` | string (date) | No       | date format `Y-m-d`, nullable  | Tanggal perolehan (default: hari ini) |
| `is_active`        | boolean       | No       | nullable                       | Status aktif (default: `true`)        |
| `parent_id`        | integer       | No       | `exists:accounts,id`, nullable | ID parent akun (untuk hierarki)       |

**Behavior:**

- `type` di-set otomatis ke `'asset'`
- `asset_category` di-set otomatis ke `'fixed'`
- `normal_balance` di-set otomatis ke `'debit'`
- `type_code` di-set otomatis ke `0`
- Jika `parent_id` diberikan, saldo parent akan di-increment sebesar `opening_balance`
- Jika `acquisition_date` tidak diisi, default ke tanggal hari ini

**Response (201 Created)**

```json
{
  "success": true,
  "message": "Created",
  "data": {
    "id": 5,
    "name": "Kulkas 2 Pintu",
    "type": "asset",
    "asset_category": "fixed",
    "icon": "refrigerator",
    "color": "#2196F3",
    "opening_balance": 4500000,
    "current_balance": 4500000,
    "acquisition_date": "2026-07-20",
    "is_active": true,
    "parent_id": null,
    "created_at": "2026-07-24T10:00:00.000000Z"
  }
}
```

---

## 4. Update Fixed Asset

**Endpoint**

```text
PUT /api/v1/member/fixed-assets/{id}
```

**Path Params**

| Parameter | Type    | Required | Keterangan    |
| --------- | ------- | -------- | ------------- |
| `id`      | integer | Yes      | ID aset tetap |

**Request Body**

```json
{
  "asset_name": "Kulkas 3 Pintu",
  "icon": "refrigerator",
  "color": "#4CAF50",
  "opening_balance": 5000000,
  "acquisition_date": "2026-07-21",
  "asset_category": "fixed",
  "is_active": true,
  "parent_id": null
}
```

### Request Fields

| Field              | Type           | Required       | Validation                              | Keterangan                     |
| ------------------ | -------------- | -------------- | --------------------------------------- | ------------------------------ |
| `asset_name`       | string         | No (sometimes) | max:191                                 | Nama aset tetap                |
| `icon`             | string?        | No             | max:191, nullable                       | Kirim `null` untuk hapus icon  |
| `color`            | string?        | No             | max:7, nullable                         | Kirim `null` untuk hapus warna |
| `opening_balance`  | integer?       | No             | nullable                                | Nilai perolehan                |
| `acquisition_date` | string? (date) | No             | date format `Y-m-d`, nullable           | Tanggal perolehan              |
| `asset_category`   | string         | No             | `in:current,fixed,investment`, nullable | Ubah kategori aset             |
| `is_active`        | boolean?       | No             | nullable                                | Status aktif                   |
| `parent_id`        | integer?       | No             | `exists:accounts,id`, nullable          | ID parent akun                 |

> **Catatan:** Semua field bersifat optional. Jika tidak ada data yang dikirim, akan mengembalikan error 422 `"No data to update"`.

**Response (200 OK)**

```json
{
  "success": true,
  "message": "Updated",
  "data": {
    "id": 5,
    "name": "Kulkas 3 Pintu",
    "type": "asset",
    "asset_category": "fixed",
    "icon": "refrigerator",
    "color": "#4CAF50",
    "current_balance": 5000000,
    "acquisition_date": "2026-07-21",
    "is_active": true,
    "parent_id": null
  }
}
```

---

## 5. Delete Fixed Asset

Melakukan soft-delete aset tetap. Aset akan tetap ada di database dengan kolom `deleted_at` terisi.

**Syarat hapus:**

- Aset tidak boleh memiliki children (sub-aset)
- Saldo aset (`current_balance`) harus `0`

Jika syarat tidak terpenuhi, akan mengembalikan error 422.

**Endpoint**

```text
DELETE /api/v1/member/fixed-assets/{id}
```

**Path Params**

| Parameter | Type    | Required | Keterangan    |
| --------- | ------- | -------- | ------------- |
| `id`      | integer | Yes      | ID aset tetap |

**Response (200 OK)**

```json
{
  "success": true,
  "message": "Deleted",
  "data": []
}
```

---

## Error Responses

### 401 Unauthorized

```json
{
  "message": "Unauthenticated."
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Not found or access denied",
  "data": []
}
```

### 422 Validation Error

```json
{
  "success": false,
  "message": "Nama aset wajib diisi",
  "errors": {
    "asset_name": ["Nama aset wajib diisi"]
  }
}
```

Pesan error yang mungkin muncul:

| Pesan                                                  | Penyebab                                |
| ------------------------------------------------------ | --------------------------------------- |
| `Nama aset wajib diisi`                                | `asset_name` tidak diisi saat store     |
| `No data to update`                                    | Tidak ada data yang dikirim saat update |
| `Account has children`                                 | Hapus aset yang masih memiliki sub-aset |
| `Account has non-zero balance or related transactions` | Hapus aset yang masih memiliki saldo    |

---

## Tabel Ringkasan Endpoint

| Method   | Endpoint             | Deskripsi                      | Auth         |
| -------- | -------------------- | ------------------------------ | ------------ |
| `GET`    | `/fixed-assets`      | List semua aset tetap (tree)   | Bearer Token |
| `GET`    | `/fixed-assets/{id}` | Detail aset tetap              | Bearer Token |
| `POST`   | `/fixed-assets`      | Buat aset tetap baru           | Bearer Token |
| `PUT`    | `/fixed-assets/{id}` | Update aset tetap              | Bearer Token |
| `DELETE` | `/fixed-assets/{id}` | Hapus aset tetap (soft-delete) | Bearer Token |

## Catatan Implementasi

- Aset tetap disimpan di tabel `accounts` dengan `type = 'asset'` dan `asset_category = 'fixed'`.
- Tidak ada tabel khusus untuk fixed asset — semua CRUD menggunakan generic account system.
- `FixedAssetService` sudah **deprecated**. Semua operasi CRUD didelegasikan ke `AccountMemberService`.
- Hierarki parent-children didukung: parent mewakili kategori/kelompok aset, children mewakili aset individu.
- `opening_balance` pada parent adalah total seluruh child aset di bawahnya.
- Tidak ada double-entry transaction yang dibuat saat create/delete fixed asset. Saldo murni dikelola oleh `current_balance` pada model `Account`.
- Soft-delete: `deleted_at` terisi, data tetap di database.
