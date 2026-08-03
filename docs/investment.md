# Investment Asset Member API

API untuk mengelola aset investasi milik member. Aset investasi disimpan di tabel `accounts` dengan `type = 'asset'` dan `asset_category = 'investment'`.

Fitur ini mendukung pembelian, penjualan, dan revaluasi aset investasi dengan sistem double-entry bookkeeping.

Base URL: `https://api.gumarang.local/api/v1/member`

## Authentication

Semua endpoint memerlukan **Bearer Token** via Sanctum.

```text
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## 1. List Investment Assets

Mengembalikan daftar aset investasi dalam bentuk tree (parent-children) berdasarkan kategori `investment`.

**Endpoint**

```text
GET /api/v1/member/investment-assets
```

**Response (200 OK)**

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "accounts": [
      {
        "id": 10,
        "name": "Emas",
        "type": "asset",
        "normal_balance": "debit",
        "asset_category": "investment",
        "icon": "coins",
        "color": "#FBBF24",
        "opening_balance": 0,
        "current_balance": 5000000,
        "is_default": true,
        "is_active": true,
        "parent_id": null,
        "acquisition_date": null,
        "children": [
          {
            "id": 11,
            "name": "LM 24K",
            "type": "asset",
            "normal_balance": "debit",
            "asset_category": "investment",
            "icon": "coins",
            "color": "#FBBF24",
            "opening_balance": 2500000,
            "current_balance": 2500000,
            "is_default": false,
            "is_active": true,
            "parent_id": 10,
            "acquisition_date": null
          }
        ]
      }
    ]
  },
  "meta": {
    "total_investment_value": 2500000
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
| `asset_category`   | string   | Selalu `"investment"`         |
| `icon`             | string?  | Nama icon Lucide              |
| `color`            | string?  | Warna hex (contoh: `#FBBF24`) |
| `opening_balance`  | integer  | Saldo awal                    |
| `current_balance`  | integer  | Saldo saat ini                |
| `is_default`       | boolean  | Aset default dari sistem      |
| `is_active`        | boolean  | Status aktif                  |
| `parent_id`        | integer? | ID parent (`null` jika root)  |
| `acquisition_date` | string?  | Tanggal perolehan (`Y-m-d`)   |
| `children`         | array    | Sub-aset (child accounts)     |

### Response Fields — `meta`

| Field                    | Type    | Keterangan                                             |
| ------------------------ | ------- | ------------------------------------------------------ |
| `total_investment_value` | integer | Total nilai seluruh aset investasi (parent + children) |

> **Catatan:** Endpoint ini hanya menampilkan tree akun berdasarkan kategori `investment`, tanpa detail unit/transaksi. Untuk data detail investasi (unit, market price, unrealized gain/loss, history), gunakan endpoint **Show** (`GET /investment-assets/{id}`).

---

## 2. Show Investment Asset Detail

Mengembalikan detail aset investasi beserta riwayat transaksi pembelian dan penjualan.

**Endpoint**

```text
GET /api/v1/member/investment-assets/{id}
```

**Path Params**

| Parameter | Type    | Required | Keterangan        |
| --------- | ------- | -------- | ----------------- |
| `id`      | integer | Yes      | ID aset investasi |

**Response (200 OK)**

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
    "asset_name": "Emas Batangan 10gr",
    "investment_type": "gold",
    "unit_quantity": 5.5,
    "unit_cost_avg": 1500000,
    "last_market_price": 1600000,
    "last_valued_at": "2026-07-27",
    "current_balance": 8800000,
    "unrealized_gain_loss": 550000,
    "history": {
      "purchases": [
        {
          "id": 1,
          "unit_quantity": 3.0,
          "unit_price": 1450000,
          "total_amount": 4350000,
          "transaction_date": "2026-06-15"
        },
        {
          "id": 2,
          "unit_quantity": 2.5,
          "unit_price": 1550000,
          "total_amount": 3875000,
          "transaction_date": "2026-07-10"
        }
      ],
      "sales": [
        {
          "id": 3,
          "unit_quantity": 1.0,
          "unit_price": 1620000,
          "total_amount": 1620000,
          "realized_gain_loss": 170000,
          "transaction_date": "2026-07-20"
        }
      ]
    }
  }
}
```

### Response Fields

| Field                  | Type    | Keterangan                                                                 |
| ---------------------- | ------- | -------------------------------------------------------------------------- |
| `id`                   | integer | ID aset investasi                                                          |
| `asset_name`           | string  | Nama aset                                                                  |
| `investment_type`      | string  | Tipe investasi (`gold`, `mutual_fund`, `stock`, `crypto`, `bond`, `other`) |
| `unit_quantity`        | float   | Jumlah unit yang dimiliki                                                  |
| `unit_cost_avg`        | integer | Rata-rata harga beli per unit                                              |
| `last_market_price`    | integer | Harga pasar terakhir                                                       |
| `last_valued_at`       | string? | Tanggal penilaian terakhir (`Y-m-d`)                                       |
| `current_balance`      | integer | Nilai total saat ini = unit × market price                                 |
| `unrealized_gain_loss` | integer | Keuntungan/kerugian yang belum direalisasi                                 |
| `history.purchases[]`  | array   | Riwayat transaksi pembelian                                                |
| `history.sales[]`      | array   | Riwayat transaksi penjualan                                                |

---

## 3. Create Investment Asset

Membeli aset investasi baru (unit pertama). Transaksi akan mengurangi saldo akun sumber.

**Endpoint**

```text
POST /api/v1/member/investment-assets
```

**Request Body**

```json
{
  "asset_name": "Emas Batangan 10gr",
  "investment_type": "gold",
  "unit_quantity": 3.0,
  "unit_price": 1450000,
  "source_account_id": 2,
  "transaction_date": "2026-07-15",
  "icon": "coins",
  "color": "#FBBF24",
  "notes": "Pembelian awal"
}
```

### Request Fields

| Field               | Type          | Required | Validation                                    | Keterangan                                   |
| ------------------- | ------------- | -------- | --------------------------------------------- | -------------------------------------------- |
| `asset_name`        | string        | Yes      | max:255                                       | Nama aset investasi                          |
| `investment_type`   | string        | Yes      | `in:gold,mutual_fund,stock,crypto,bond,other` | Tipe investasi                               |
| `unit_quantity`     | numeric       | Yes      | `gt:0`                                        | Jumlah unit yang dibeli                      |
| `unit_price`        | integer       | Yes      | `min:1`                                       | Harga per unit (dalam rupiah)                |
| `source_account_id` | integer       | Yes      | `exists:accounts,id`                          | ID akun sumber (current asset, leaf account) |
| `transaction_date`  | string (date) | Yes      | `before_or_equal:today`                       | Tanggal transaksi                            |
| `icon`              | string        | No       | max:191, nullable                             | Nama icon Lucide                             |
| `color`             | string        | No       | max:7, nullable                               | Warna hex (`#RRGGBB`)                        |
| `notes`             | string        | No       | max:500, nullable                             | Catatan transaksi                            |

**Behavior:**

- Membuat akun baru di `accounts` dengan `type=asset`, `asset_category=investment`
- Membuat transaction (double-entry): debit ke akun investasi, credit ke akun sumber
- Mengurangi `current_balance` akun sumber sebesar total pembelian
- `unit_cost_avg` di-set sama dengan `unit_price` (pembelian pertama)
- `last_market_price` di-set sama dengan `unit_price`
- `current_balance` aset = `unit_quantity × unit_price`

**Response (201 Created)**

```json
{
  "success": true,
  "message": "Created",
  "data": {
    "id": 1,
    "asset_name": "Emas Batangan 10gr",
    "investment_type": "gold",
    "unit_quantity": 3.0,
    "unit_cost_avg": 1450000,
    "last_market_price": 1450000,
    "current_balance": 4350000,
    "source_account": {
      "id": 2,
      "name": "BCA",
      "balance_after": 5000000
    },
    "transaction_id": 10,
    "created_at": "2026-07-15T10:00:00.000000Z"
  }
}
```

---

## 4. Buy More Units

Menambah unit aset investasi yang sudah ada. Transaksi akan mengurangi saldo akun sumber.

**Endpoint**

```text
POST /api/v1/member/investment-assets/{id}/buy
```

**Path Params**

| Parameter | Type    | Required | Keterangan        |
| --------- | ------- | -------- | ----------------- |
| `id`      | integer | Yes      | ID aset investasi |

**Request Body**

```json
{
  "unit_quantity": 2.5,
  "unit_price": 1550000,
  "source_account_id": 2,
  "transaction_date": "2026-07-20"
}
```

### Request Fields

| Field               | Type          | Required | Validation              | Keterangan                                   |
| ------------------- | ------------- | -------- | ----------------------- | -------------------------------------------- |
| `unit_quantity`     | numeric       | Yes      | `gt:0`                  | Jumlah unit tambahan                         |
| `unit_price`        | integer       | Yes      | `min:1`                 | Harga per unit baru (dalam rupiah)           |
| `source_account_id` | integer       | Yes      | `exists:accounts,id`    | ID akun sumber (current asset, leaf account) |
| `transaction_date`  | string (date) | Yes      | `before_or_equal:today` | Tanggal transaksi                            |

**Behavior:**

- `unit_cost_avg` dihitung ulang dengan metode **average cost**: `((oldQty × oldAvg) + (newQty × newPrice)) / (oldQty + newQty)`
- `last_market_price` di-update ke harga pembelian terbaru
- `current_balance` = total unit × `last_market_price`
- Membuat double-entry transaction

**Response (200 OK)**

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
    "unit_quantity": 5.5,
    "unit_cost_avg": 1490909,
    "current_balance": 8199999,
    "transaction_id": 11
  }
}
```

> **Catatan:** `unit_cost_avg` adalah hasil pembulatan ke bawah (floor). Gunakan rumus yang sama di sisi mobile untuk verifikasi.

---

## 5. Sell Units

Menjual sebagian unit aset investasi. Transaksi akan menambah saldo akun tujuan.

**Endpoint**

```text
POST /api/v1/member/investment-assets/{id}/sell
```

**Path Params**

| Parameter | Type    | Required | Keterangan        |
| --------- | ------- | -------- | ----------------- |
| `id`      | integer | Yes      | ID aset investasi |

**Request Body**

```json
{
  "unit_quantity": 1.0,
  "unit_price": 1620000,
  "destination_account_id": 2,
  "transaction_date": "2026-07-20",
  "notes": "Jual 1gr untuk kebutuhan"
}
```

### Request Fields

| Field                    | Type          | Required | Validation              | Keterangan                                   |
| ------------------------ | ------------- | -------- | ----------------------- | -------------------------------------------- |
| `unit_quantity`          | numeric       | Yes      | `gt:0`                  | Jumlah unit yang dijual                      |
| `unit_price`             | integer       | Yes      | `min:1`                 | Harga jual per unit (dalam rupiah)           |
| `destination_account_id` | integer       | Yes      | `exists:accounts,id`    | ID akun tujuan (current asset, leaf account) |
| `transaction_date`       | string (date) | Yes      | `before_or_equal:today` | Tanggal transaksi                            |
| `notes`                  | string        | No       | max:500, nullable       | Catatan transaksi                            |

**Behavior:**

- Unit quantity aset investasi berkurang
- Akun tujuan mendapat debit sebesar total penjualan
- `current_balance` aset = sisa unit × `last_market_price`
- **Realized gain/loss** dihitung: `(sellPrice - avgCost) × unitSold`
- Jika ada realized gain/loss, dibuat transaksi terpisah ke akun `Investment Gain` (income) atau `Investment Loss` (expense)
- Akun `Investment Gain` / `Investment Loss` dibuat otomatis jika belum ada

**Response (200 OK)**

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "investment_asset": {
      "id": 1,
      "unit_quantity": 4.5,
      "unit_cost_avg": 1490909,
      "current_balance": 7290000
    },
    "sale": {
      "unit_quantity_sold": 1.0,
      "unit_price": 1620000,
      "total_proceeds": 1620000,
      "realized_gain_loss": 129091
    },
    "transaction_id": 12
  }
}
```

---

## 6. Revalue (Market Price Update)

Memperbarui harga pasar aset investasi. Tidak membuat transaksi — hanya update nilai book value.

**Endpoint**

```text
POST /api/v1/member/investment-assets/{id}/revalue
```

**Path Params**

| Parameter | Type    | Required | Keterangan        |
| --------- | ------- | -------- | ----------------- |
| `id`      | integer | Yes      | ID aset investasi |

**Request Body**

```json
{
  "market_price": 1650000,
  "valued_at": "2026-07-27"
}
```

### Request Fields

| Field          | Type          | Required | Validation                        | Keterangan                                  |
| -------------- | ------------- | -------- | --------------------------------- | ------------------------------------------- |
| `market_price` | integer       | Yes      | `min:1`                           | Harga pasar terbaru per unit (dalam rupiah) |
| `valued_at`    | string (date) | No       | `before_or_equal:today`, nullable | Tanggal penilaian (default: sekarang)       |

**Behavior:**

- `last_market_price` dan `last_valued_at` di-update
- `current_balance` dihitung ulang: `unit_quantity × market_price`
- `unrealized_gain_loss` = `(marketPrice - avgCost) × unitQuantity`

**Response (200 OK)**

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
    "asset_name": "Emas Batangan 10gr",
    "unit_quantity": 5.5,
    "unit_cost_avg": 1490909,
    "last_market_price": 1650000,
    "last_valued_at": "2026-07-27",
    "current_balance": 9075000,
    "unrealized_gain_loss": 876500
  }
}
```

---

## 7. Update Investment Asset

Mengubah nama, icon, atau warna aset investasi. Tidak mengubah data transaksi/unit.

**Endpoint**

```text
PUT /api/v1/member/investment-assets/{id}
```

**Path Params**

| Parameter | Type    | Required | Keterangan        |
| --------- | ------- | -------- | ----------------- |
| `id`      | integer | Yes      | ID aset investasi |

**Request Body**

```json
{
  "asset_name": "Emas 24K 10gr",
  "icon": "coins",
  "color": "#FFD700"
}
```

### Request Fields

| Field        | Type    | Required       | Validation        | Keterangan            |
| ------------ | ------- | -------------- | ----------------- | --------------------- |
| `asset_name` | string  | No (sometimes) | max:255           | Nama aset             |
| `icon`       | string? | No             | max:191, nullable | Nama icon Lucide      |
| `color`      | string? | No             | max:7, nullable   | Warna hex (`#RRGGBB`) |

> **Catatan:** Semua field bersifat optional. Jika tidak ada data yang dikirim, akan mengembalikan error 422 `"No data to update"`.

**Response (200 OK)**

```json
{
  "success": true,
  "message": "Updated",
  "data": {
    "id": 1,
    "asset_name": "Emas 24K 10gr",
    "icon": "coins",
    "color": "#FFD700"
  }
}
```

---

## 8. Delete Investment Asset

Menghapus aset investasi (soft delete).

**Syarat hapus:**

- `unit_quantity` harus **0** (tidak memiliki unit)
- `current_balance` harus **0** (tidak memiliki saldo)

Jika syarat tidak terpenuhi, akan mengembalikan error 422.

**Endpoint**

```text
DELETE /api/v1/member/investment-assets/{id}
```

**Path Params**

| Parameter | Type    | Required | Keterangan        |
| --------- | ------- | -------- | ----------------- |
| `id`      | integer | Yes      | ID aset investasi |

**Response (200 OK)**

```json
{
  "success": true,
  "message": "Deleted",
  "data": []
}
```

---

## 9. Edit Purchase Transaction

Mengubah data transaksi pembelian yang sudah ada. Mempengaruhi saldo akun sumber, jumlah unit, dan average cost.

**Endpoint**

```text
PUT /api/v1/member/investment-assets/{id}/buy/{transactionId}
```

**Path Params**

| Parameter       | Type    | Required | Keterangan                                                             |
| --------------- | ------- | -------- | ---------------------------------------------------------------------- |
| `id`            | integer | Yes      | ID aset investasi                                                      |
| `transactionId` | integer | Yes      | ID transaksi pembelian (dari `investment_transactions.transaction_id`) |

**Request Body**

```json
{
  "unit_quantity": 2.5,
  "unit_price": 1550000,
  "source_account_id": 2,
  "transaction_date": "2026-07-20",
  "notes": "Edit pembelian"
}
```

### Request Fields

| Field               | Type          | Required | Validation                     | Keterangan                                                         |
| ------------------- | ------------- | -------- | ------------------------------ | ------------------------------------------------------------------ |
| `unit_quantity`     | numeric       | Yes      | `gt:0`                         | Jumlah unit baru                                                   |
| `unit_price`        | integer       | Yes      | `min:1`                        | Harga per unit baru                                                |
| `source_account_id` | integer       | No       | `exists:accounts,id`, nullable | ID akun sumber baru (jika tidak diisi, akun sumber lama digunakan) |
| `transaction_date`  | string (date) | Yes      | `before_or_equal:today`        | Tanggal transaksi                                                  |
| `notes`             | string        | No       | max:500, nullable              | Catatan transaksi                                                  |

**Behavior:**

- `unit_cost_avg` dihitung ulang dari **seluruh** purchase history menggunakan weighted average: `sum(qty × price) / sum(qty)`
- Saldo akun sumber disesuaikan dengan delta total pembelian baru vs lama
- `current_balance` akun investasi dan parent diupdate

**Response (200 OK)**

```json
{
  "success": true,
  "message": "Updated",
  "data": {
    "account": {
      "id": 1,
      "unit_quantity": 5.5,
      "unit_cost_avg": 1490909,
      "current_balance": 8199999
    },
    "transaction_id": 11
  }
}
```

---

## 10. Delete Purchase Transaction

Menghapus transaksi pembelian aset investasi. Membalikkan seluruh dampak transaksi: saldo akun sumber dikembalikan, unit quantity dikurangi, average cost dihitung ulang.

**Endpoint**

```text
DELETE /api/v1/member/investment-assets/{id}/buy/{transactionId}
```

**Path Params**

| Parameter       | Type    | Required | Keterangan             |
| --------------- | ------- | -------- | ---------------------- |
| `id`            | integer | Yes      | ID aset investasi      |
| `transactionId` | integer | Yes      | ID transaksi pembelian |

**Response (200 OK)**

```json
{
  "success": true,
  "message": "Deleted",
  "data": {
    "account": {
      "id": 1,
      "unit_quantity": 3.0,
      "unit_cost_avg": 1450000,
      "current_balance": 4350000
    }
  }
}
```

---

## 11. Edit Sale Transaction

Mengubah data transaksi penjualan yang sudah ada. Mempengaruhi saldo akun tujuan, jumlah unit, dan realized gain/loss.

**Endpoint**

```text
PUT /api/v1/member/investment-assets/{id}/sell/{transactionId}
```

**Path Params**

| Parameter       | Type    | Required | Keterangan             |
| --------------- | ------- | -------- | ---------------------- |
| `id`            | integer | Yes      | ID aset investasi      |
| `transactionId` | integer | Yes      | ID transaksi penjualan |

**Request Body**

```json
{
  "unit_quantity": 1.5,
  "unit_price": 1650000,
  "destination_account_id": 2,
  "transaction_date": "2026-07-20",
  "notes": "Edit penjualan"
}
```

### Request Fields

| Field                    | Type          | Required | Validation              | Keterangan              |
| ------------------------ | ------------- | -------- | ----------------------- | ----------------------- |
| `unit_quantity`          | numeric       | Yes      | `gt:0`                  | Jumlah unit yang dijual |
| `unit_price`             | integer       | Yes      | `min:1`                 | Harga jual per unit     |
| `destination_account_id` | integer       | Yes      | `exists:accounts,id`    | ID akun tujuan          |
| `transaction_date`       | string (date) | Yes      | `before_or_equal:today` | Tanggal transaksi       |
| `notes`                  | string        | No       | max:500, nullable       | Catatan transaksi       |

**Behavior:**

- Saldo akun tujuan disesuaikan dengan delta
- Realized gain/loss dihitung ulang: `(sellPrice - avgCost) × unitSold`
- Transaksi realized gain/loss sebelumnya dihapus dan dibuat ulang jika ada perubahan
- `current_balance` akun investasi dan parent diupdate

**Response (200 OK)**

```json
{
  "success": true,
  "message": "Updated",
  "data": {
    "investment_account": {
      "id": 1,
      "unit_quantity": 4.0,
      "unit_cost_avg": 1490909,
      "current_balance": 6600000
    },
    "sale": {
      "unit_quantity_sold": 1.5,
      "unit_price": 1650000,
      "total_proceeds": 2475000,
      "realized_gain_loss": 239864
    },
    "transaction_id": 12
  }
}
```

---

## 12. Delete Sale Transaction

Menghapus transaksi penjualan aset investasi. Membalikkan seluruh dampak: saldo akun tujuan dikembalikan, unit quantity dikembalikan, realized gain/loss dihapus.

**Endpoint**

```text
DELETE /api/v1/member/investment-assets/{id}/sell/{transactionId}
```

**Path Params**

| Parameter       | Type    | Required | Keterangan             |
| --------------- | ------- | -------- | ---------------------- |
| `id`            | integer | Yes      | ID aset investasi      |
| `transactionId` | integer | Yes      | ID transaksi penjualan |

**Response (200 OK)**

```json
{
  "success": true,
  "message": "Deleted",
  "data": {
    "account": {
      "id": 1,
      "unit_quantity": 5.5,
      "unit_cost_avg": 1490909,
      "current_balance": 9075000
    }
  }
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

| Pesan                                               | Penyebab                                           |
| --------------------------------------------------- | -------------------------------------------------- |
| `Nama aset wajib diisi`                             | `asset_name` tidak diisi saat store                |
| `Jumlah unit wajib diisi`                           | `unit_quantity` tidak diisi                        |
| `Harga per unit wajib diisi`                        | `unit_price` tidak diisi                           |
| `Akun sumber wajib dipilih`                         | `source_account_id` tidak diisi                    |
| `Akun tujuan wajib dipilih`                         | `destination_account_id` tidak diisi saat sell     |
| `Harga pasar wajib diisi`                           | `market_price` tidak diisi saat revalue            |
| `No data to update`                                 | Tidak ada data yang dikirim saat update            |
| `Saldo akun sumber tidak mencukupi`                 | Saldo akun sumber kurang dari total pembelian      |
| `Akun sumber harus akun leaf`                       | Akun sumber memiliki sub-akun                      |
| `Jumlah unit tidak mencukupi untuk dijual`          | Unit tersedia kurang dari yang ingin dijual        |
| `Aset investasi masih memiliki unit`                | Hapus aset yang masih memiliki unit                |
| `Aset investasi masih memiliki saldo`               | Hapus aset yang masih memiliki saldo               |
| `Transaksi pembelian tidak ditemukan`               | Edit/hapus purchase dengan ID tidak valid          |
| `Transaksi penjualan tidak ditemukan`               | Edit/hapus sale dengan ID tidak valid              |
| `Akun sumber baru tidak ditemukan atau tidak valid` | Edit purchase dengan source_account_id tidak valid |
| `Jumlah unit tidak mencukupi setelah perubahan`     | Edit sale dengan qty melebihi unit tersedia        |

---

## Tabel Ringkasan Endpoint

| Method   | Endpoint                                       | Deskripsi                          | Auth         |
| -------- | ---------------------------------------------- | ---------------------------------- | ------------ |
| `GET`    | `/investment-assets`                           | List semua aset investasi (tree)   | Bearer Token |
| `GET`    | `/investment-assets/{id}`                      | Detail aset investasi + riwayat    | Bearer Token |
| `POST`   | `/investment-assets`                           | Beli aset investasi baru           | Bearer Token |
| `POST`   | `/investment-assets/{id}/buy`                  | Tambah unit aset yang sudah ada    | Bearer Token |
| `POST`   | `/investment-assets/{id}/sell`                 | Jual sebagian unit                 | Bearer Token |
| `POST`   | `/investment-assets/{id}/revalue`              | Update harga pasar                 | Bearer Token |
| `PUT`    | `/investment-assets/{id}`                      | Update nama/icon/warna aset        | Bearer Token |
| `DELETE` | `/investment-assets/{id}`                      | Hapus aset investasi (soft delete) | Bearer Token |
| `PUT`    | `/investment-assets/{id}/buy/{transactionId}`  | Edit transaksi pembelian           | Bearer Token |
| `DELETE` | `/investment-assets/{id}/buy/{transactionId}`  | Hapus transaksi pembelian          | Bearer Token |
| `PUT`    | `/investment-assets/{id}/sell/{transactionId}` | Edit transaksi penjualan           | Bearer Token |
| `DELETE` | `/investment-assets/{id}/sell/{transactionId}` | Hapus transaksi penjualan          | Bearer Token |

---

## Catatan Implementasi

- Aset investasi disimpan di tabel `accounts` dengan `type = 'asset'`, `asset_category = 'investment'`, dan field tambahan: `investment_type`, `unit_quantity`, `unit_cost_avg`, `last_market_price`, `last_valued_at`
- Transaksi pembelian/penjualan menggunakan double-entry bookkeeping di tabel `transactions` dan `transaction_entries`
- Riwayat transaksi investasi disimpan di tabel `investment_transactions`
- `unit_cost_avg` dihitung dengan metode **average cost** (weighted average)
- **Realized gain/loss** dihitung otomatis saat penjualan, dicatat ke akun `Investment Gain` (income) atau `Investment Loss` (expense)
- **Unrealized gain/loss** tidak dicatat sebagai transaksi, hanya ditampilkan di response `show` dan `revalue`
- Endpoint `index` (`GET /investment-assets`) menggunakan `AccountMemberService` untuk menampilkan tree akun — tidak termasuk data unit/transaksi
- Soft-delete: `deleted_at` terisi, data tetap di database
- **Edit/delete purchase**: `unit_cost_avg` dihitung ulang dari **seluruh** purchase history menggunakan weighted average untuk menghindari drift akibat pembulatan floor
- **Edit/delete sale**: realized gain/loss dihitung ulang; transaksi gain/loss sebelumnya dihapus dan dibuat ulang jika perlu
- **Parent propagation**: `current_balance` akun parent otomatis ter-update saat terjadi perubahan saldo akun child (buy, sell, revalue, edit, delete) — menggunakan selisih `current_balance` sebelum dan sesudah operasi
