# Cash Out API

API untuk mencatat pengeluaran (cash out) ke dalam sistem akuntansi personal. Menggunakan sistem double-entry: mengkredit akun kas/bank dan mendebit akun pengeluaran atau akun investasi.

**Fitur Tambahan:** Jika akun debit adalah akun investasi (`asset_category = 'investment'`), sistem akan menjalankan flow investment purchase — menghitung ulang unit, average cost, dan mencatat `InvestmentTransaction`.

Base URL: `https://api.gumarang.local/api/v1/member`

## Authentication

Semua endpoint memerlukan **Bearer Token** via Sanctum.

```text
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## 1. Get New Reference Number

Mendapatkan nomor referensi baru untuk transaksi Cash Out. Nomor referensi memiliki format `CO-YYYYMMDD-XXXX` (incremental per hari).

**Endpoint**

```text
GET /api/v1/member/cash-out/new-ref
```

**Response (200 OK)**

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "ref": "CO-20260728-0001"
  }
}
```

### Response Fields

| Field | Type   | Keterangan                                       |
| ----- | ------ | ------------------------------------------------ |
| `ref` | string | Nomor referensi baru, format: `CO-YYYYMMDD-XXXX` |

---

## 2. List Cash Out

Mengembalikan daftar transaksi Cash Out milik member yang sudah login.

**Endpoint**

```text
GET /api/v1/member/cash-out
```

### Query Parameters

| Parameter   | Tipe                | Default | Keterangan                                                                          |
| ----------- | ------------------- | ------- | ----------------------------------------------------------------------------------- |
| `search`    | string              | —       | Cari berdasarkan nomor referensi atau deskripsi (LIKE pada `reference` dan `notes`) |
| `startDate` | string (YYYY-MM-DD) | —       | Filter dari tanggal transaksi                                                       |
| `endDate`   | string (YYYY-MM-DD) | —       | Filter sampai tanggal transaksi                                                     |
| `perPage`   | integer             | 15      | Jumlah item per halaman                                                             |

### Response (200 OK)

```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 43,
      "user_id": 1,
      "reference": "CO-20260728-0001",
      "notes": "Beli makan siang",
      "total_amount": 50000,
      "cash": "out",
      "created_at": "2026-07-28T12:00:00.000000Z",
      "updated_at": "2026-07-28T12:00:00.000000Z"
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

---

## 3. Get Cash Out Detail

Menampilkan detail transaksi Cash Out beserta entry debit/credit-nya.

**Endpoint**

```text
GET /api/v1/member/cash-out/{id}
```

### Response (200 OK) — Reguler

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "transaction": {
      "id": 43,
      "reference": "CO-20260728-0001",
      "total_amount": 50000,
      "notes": "Beli makan siang",
      "created_at": "2026-07-28T12:00:00.000000Z",
      "entries": [
        {
          "id": 86,
          "account_id": 1,
          "account_name": "Cash",
          "entry_type": "credit",
          "amount": 50000
        },
        {
          "id": 87,
          "account_id": 10,
          "account_name": "Restoran",
          "entry_type": "debit",
          "amount": 30000
        },
        {
          "id": 88,
          "account_id": 11,
          "account_name": "Groceries",
          "entry_type": "debit",
          "amount": 20000
        }
      ]
    }
  }
}
```

### Response (200 OK) — Investment

Jika transaksi Cash Out melibatkan pembelian investasi, response akan menyertakan field `investment`:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "transaction": {
      "id": 44,
      "reference": "CO-20260728-0002",
      "total_amount": 1550000,
      "notes": "Beli emas 1 gram",
      "created_at": "2026-07-28T12:00:00.000000Z",
      "entries": [
        {
          "id": 89,
          "account_id": 1,
          "account_name": "Cash",
          "entry_type": "credit",
          "amount": 1550000
        },
        {
          "id": 90,
          "account_id": 11,
          "account_name": "Emas Batangan",
          "entry_type": "debit",
          "amount": 1550000
        }
      ],
      "investment": {
        "account_id": 11,
        "account_name": "Emas Batangan",
        "unit_quantity": 2.0,
        "unit_cost_avg": 1525000,
        "unit_price": 1550000,
        "investment_transaction_id": 5
      }
    }
  }
}
```

### Response (404 Not Found)

```json
{
  "success": false,
  "message": "Transaksi tidak ditemukan",
  "data": []
}
```

---

## 4. Store Cash Out

Mencatat transaksi pengeluaran dari akun kas/bank ke akun pengeluaran (expense) atau akun investasi.

### Skenario 1: Pengeluaran Reguler (Expense)

Biasanya digunakan untuk mencatat pengeluaran sehari-hari ke akun expense.

**Endpoint**

```text
POST /api/v1/member/cash-out
```

**Request Body**

```json
{
  "total_amount": 50000,
  "notes": "Beli makan siang",
  "ref": "CO-20260728-0001",
  "details": [
    {
      "cash_account_id": 1,
      "amount": 50000,
      "entry_type": "credit"
    },
    {
      "account_id": 10,
      "amount": 30000,
      "entry_type": "debit"
    },
    {
      "account_id": 11,
      "amount": 20000,
      "entry_type": "debit"
    }
  ]
}
```

### Skenario 2: Pembelian Investasi

Ketika `account_id` pada entry debit adalah akun investasi (`asset_category = 'investment'`), tambahkan field `unit_quantity` dan `unit_price`.

**Request Body**

```json
{
  "total_amount": 1550000,
  "notes": "Beli emas 1 gram",
  "ref": "CO-20260728-0002",
  "details": [
    {
      "cash_account_id": 1,
      "amount": 1550000,
      "entry_type": "credit"
    },
    {
      "account_id": 11,
      "amount": 1550000,
      "entry_type": "debit",
      "unit_quantity": 1.0,
      "unit_price": 1550000
    }
  ]
}
```

### Request Fields

| Field          | Type    | Required | Validation                      | Keterangan                                          |
| -------------- | ------- | -------- | ------------------------------- | --------------------------------------------------- |
| `total_amount` | integer | Yes      | `min:1`                         | Jumlah total pengeluaran (dalam rupiah)             |
| `ref`          | string  | Yes      | `unique:transactions,reference` | Nomor referensi (dapatkan dari `/cash-out/new-ref`) |
| `notes`        | string  | No       | nullable                        | Catatan transaksi                                   |
| `details`      | array   | Yes      | `min:1`                         | Array entry debit/credit                            |

### Detail Entry (`details[]`)

Setiap entry dalam array `details` harus memiliki field sesuai `entry_type`:

| Field             | Type    | Required                            | Validation           | Keterangan                                                    |
| ----------------- | ------- | ----------------------------------- | -------------------- | ------------------------------------------------------------- |
| `cash_account_id` | integer | **If** `entry_type=credit`          | `exists:accounts,id` | ID akun kas/bank yang mengeluarkan uang (asset, leaf account) |
| `account_id`      | integer | **If** `entry_type=debit`           | `exists:accounts,id` | ID akun tujuan: expense atau investment (leaf account)        |
| `amount`          | integer | Yes                                 | `min:1`              | Jumlah entry                                                  |
| `entry_type`      | string  | Yes                                 | `in:debit,credit`    | Tipe entry                                                    |
| `unit_quantity`   | float   | **If** akun debit adalah investment | `gt:0`               | Jumlah unit yang dibeli                                       |
| `unit_price`      | integer | **If** akun debit adalah investment | `min:1`              | Harga per unit (rupiah)                                       |

**Aturan Penting:**

1. **Balance check**: Total seluruh `amount` dengan `entry_type=debit` HARUS SAMA dengan total `amount` dengan `entry_type=credit`.
2. **Satu kredit, banyak debit**: Biasanya 1 entry kredit (akun kas) dan 1+ entry debit.
3. **Akun harus leaf**: Akun yang digunakan tidak boleh memiliki sub-akun (child accounts).
4. **Akun harus milik user**: Semua akun harus terdaftar atas nama user yang sedang login.
5. **Akun investasi**: `amount` pada entry debit HARUS sama dengan `round(unit_quantity × unit_price)`.
6. **Campuran**: Boleh mencampur debit ke expense dan debit ke investment dalam satu transaksi.

### Response (201 Created) — Reguler

```json
{
  "success": true,
  "message": "Cash Out berhasil dicatat",
  "data": {
    "transaction": {
      "id": 43,
      "reference": "CO-20260728-0001",
      "total_amount": 50000,
      "notes": "Beli makan siang",
      "created_at": "2026-07-28T12:00:00.000000Z",
      "entries": [
        {
          "id": 86,
          "account_id": 1,
          "account_name": "Cash",
          "entry_type": "credit",
          "amount": 50000
        },
        {
          "id": 87,
          "account_id": 10,
          "account_name": "Restoran",
          "entry_type": "debit",
          "amount": 30000
        },
        {
          "id": 88,
          "account_id": 11,
          "account_name": "Groceries",
          "entry_type": "debit",
          "amount": 20000
        }
      ]
    }
  }
}
```

### Response (201 Created) — Investment

```json
{
  "success": true,
  "message": "Cash Out berhasil dicatat",
  "data": {
    "transaction": {
      "id": 44,
      "reference": "CO-20260728-0002",
      "total_amount": 1550000,
      "notes": "Beli emas 1 gram",
      "created_at": "2026-07-28T12:00:00.000000Z",
      "entries": [
        {
          "id": 89,
          "account_id": 1,
          "account_name": "Cash",
          "entry_type": "credit",
          "amount": 1550000
        },
        {
          "id": 90,
          "account_id": 11,
          "account_name": "Emas Batangan",
          "entry_type": "debit",
          "amount": 1550000
        }
      ],
      "investment": {
        "account_id": 11,
        "account_name": "Emas Batangan",
        "unit_quantity": 2.0,
        "unit_cost_avg": 1525000,
        "unit_price": 1550000,
        "investment_transaction_id": 5
      }
    }
  }
}
```

### Response Fields — `data.transaction`

| Field          | Type    | Keterangan                                 |
| -------------- | ------- | ------------------------------------------ |
| `id`           | integer | ID transaksi                               |
| `reference`    | string  | Nomor referensi                            |
| `total_amount` | integer | Total pengeluaran (rupiah)                 |
| `notes`        | string? | Catatan transaksi                          |
| `created_at`   | string  | ISO 8601 timestamp                         |
| `entries[]`    | array   | Detail entry debit/credit                  |
| `investment`   | object? | Ada jika ada entry debit ke akun investasi |

### Response Fields — `data.transaction.entries[]`

| Field          | Type    | Keterangan            |
| -------------- | ------- | --------------------- |
| `id`           | integer | ID entry              |
| `account_id`   | integer | ID akun               |
| `account_name` | string  | Nama akun             |
| `entry_type`   | string  | `debit` atau `credit` |
| `amount`       | integer | Jumlah (rupiah)       |

### Response Fields — `data.transaction.investment`

| Field                       | Type    | Keterangan                              |
| --------------------------- | ------- | --------------------------------------- |
| `account_id`                | integer | ID akun investasi                       |
| `account_name`              | string  | Nama akun investasi                     |
| `unit_quantity`             | float   | Total unit setelah pembelian            |
| `unit_cost_avg`             | integer | Rata-rata harga beli (weighted average) |
| `unit_price`                | integer | Harga per unit pembelian ini            |
| `investment_transaction_id` | integer | ID di tabel `investment_transactions`   |

> **Catatan:** `unit_cost_avg` adalah hasil pembulatan ke bawah (floor). Gunakan rumus yang sama di sisi mobile untuk verifikasi: `((oldQty × oldAvg) + (newQty × newPrice)) / (oldQty + newQty)`.

---

## 5. Update Cash Out

Memperbarui transaksi Cash Out yang sudah ada. Data yang bisa diubah: nomor referensi, catatan, total amount, dan detail entry debit/credit.

**Endpoint**

```text
PUT /api/v1/member/cash-out/{id}
```

**Request Body**

Sama dengan Store Cash Out ([lihat request body di atas](#4-store-cash-out)).

### Response (200 OK) — Reguler

```json
{
  "success": true,
  "message": "Cash Out berhasil diperbarui",
  "data": {
    "transaction": {
      "id": 43,
      "reference": "CO-20260728-0001",
      "total_amount": 60000,
      "notes": "Beli makan siang + minum",
      "created_at": "2026-07-28T12:00:00.000000Z",
      "entries": [
        {
          "id": 91,
          "account_id": 1,
          "account_name": "Cash",
          "entry_type": "credit",
          "amount": 60000
        },
        {
          "id": 92,
          "account_id": 10,
          "account_name": "Restoran",
          "entry_type": "debit",
          "amount": 35000
        },
        {
          "id": 93,
          "account_id": 11,
          "account_name": "Groceries",
          "entry_type": "debit",
          "amount": 25000
        }
      ]
    }
  }
}
```

---

## 6. Delete Cash Out

Menghapus transaksi Cash Out. Saldo akun yang terlibat akan dikembalikan ke posisi sebelum transaksi. Untuk transaksi yang melibatkan akun investasi, unit dan average cost juga akan dikembalikan.

**Endpoint**

```text
DELETE /api/v1/member/cash-out/{id}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Cash Out berhasil dihapus",
  "data": []
}
```

### Response (422 Unprocessable)

```json
{
  "success": false,
  "message": "Transaksi tidak ditemukan",
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

### 422 Validation Error

```json
{
  "success": false,
  "message": "Jumlah debit dan credit tidak seimbang",
  "errors": {
    "details": ["Jumlah debit dan credit harus sama"]
  }
}
```

Pesan error yang mungkin muncul:

| Pesan                                                               | Penyebab                                         |
| ------------------------------------------------------------------- | ------------------------------------------------ |
| `Jumlah total wajib diisi`                                          | `total_amount` tidak diisi                       |
| `Jumlah total harus berupa angka`                                   | `total_amount` bukan integer                     |
| `Jumlah total minimal 1`                                            | `total_amount` < 1                               |
| `Nomor referensi wajib diisi`                                       | `ref` tidak diisi                                |
| `Nomor referensi sudah digunakan`                                   | `ref` sudah dipakai transaksi lain               |
| `Detail transaksi wajib diisi`                                      | `details` tidak diisi atau kosong                |
| `Akun kas wajib diisi untuk entry credit`                           | `cash_account_id` tidak diisi untuk entry credit |
| `Akun wajib diisi untuk entry debit`                                | `account_id` tidak diisi untuk entry debit       |
| `Jumlah wajib diisi`                                                | `amount` tidak diisi di detail                   |
| `Jumlah minimal 1`                                                  | `amount` < 1 di detail                           |
| `Jumlah debit dan credit harus sama`                                | Total debit ≠ total credit                       |
| `Jumlah unit wajib diisi untuk akun investasi`                      | `unit_quantity` kosong di entry debit investment |
| `Harga per unit wajib diisi untuk akun investasi`                   | `unit_price` kosong di entry debit investment    |
| `Jumlah entry debit tidak sesuai dengan unit_quantity × unit_price` | `amount` ≠ `round(qty × price)`                  |
| `Jumlah unit harus berupa angka`                                    | `unit_quantity` bukan angka                      |
| `Jumlah unit harus lebih dari 0`                                    | `unit_quantity` ≤ 0                              |
| `Harga per unit harus berupa angka bulat`                           | `unit_price` bukan integer                       |
| `Harga per unit tidak boleh kurang dari 1`                          | `unit_price` < 1                                 |
| `Akun tidak ditemukan`                                              | Akun tidak valid atau bukan milik user           |
| `Akun {name} harus akun leaf (tidak memiliki sub-akun)`             | Akun yang dipilih memiliki child accounts        |

---

## Tabel Ringkasan Endpoint

| Method   | Endpoint            | Deskripsi                     | Auth         |
| -------- | ------------------- | ----------------------------- | ------------ |
| `GET`    | `/cash-out`         | Daftar transaksi cash out     | Bearer Token |
| `GET`    | `/cash-out/new-ref` | Generate nomor referensi baru | Bearer Token |
| `GET`    | `/cash-out/{id}`    | Detail transaksi cash out     | Bearer Token |
| `POST`   | `/cash-out`         | Catat transaksi cash out      | Bearer Token |
| `PUT`    | `/cash-out/{id}`    | Perbarui transaksi cash out   | Bearer Token |
| `DELETE` | `/cash-out/{id}`    | Hapus transaksi cash out      | Bearer Token |

---

## Catatan Implementasi

- Transaksi dicatat menggunakan double-entry bookkeeping di tabel `transactions` (header) dan `transaction_entries` (detail debit/credit)
- `current_balance` pada setiap akun yang terlibat akan di-update secara otomatis:
  - Akun kredit (kas/bank): saldo berkurang
  - Akun debit (expense): saldo bertambah (increment)
  - Akun debit (investment): `current_balance` di-set ulang = `unit_quantity × last_market_price` (bukan increment)
- Jika akun memiliki parent, `current_balance` parent akan dihitung ulang berdasarkan total saldo seluruh child accounts
- Selalu panggil `/cash-out/new-ref` terlebih dahulu untuk mendapatkan nomor referensi sebelum melakukan transaksi
- Nomor referensi `ref` harus unik — tidak boleh ada duplikasi

### Khusus Akun Investment

- Saat debit ke akun investment, sistem menjalankan flow yang sama dengan `POST /investment-assets/{id}/buy`
- `unit_cost_avg` dihitung ulang dengan metode **weighted average**: `((oldQty × oldAvg) + (newQty × newPrice)) / (oldQty + newQty)`, dibulatkan ke bawah (floor)
- `last_market_price` di-set sama dengan `unit_price` pembelian ini
- Catatan `InvestmentTransaction` dengan `kind = 'purchase'` dibuat otomatis
- Saat update/delete transaksi yang melibatkan investment, unit dan average cost pada akun investment akan dikembalikan (reverse) dan `InvestmentTransaction` terkait akan dihapus
