# Cash In API

API untuk mencatat pemasukan (cash in) ke dalam sistem akuntansi personal. Menggunakan sistem double-entry: mendebit akun kas/bank dan mengkredit akun pendapatan.

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

Mendapatkan nomor referensi baru untuk transaksi Cash In. Nomor referensi memiliki format `CI-YYYYMMDD-XXXX` (incremental per hari).

**Endpoint**

```text
GET /api/v1/member/cash-in/new-ref
```

**Response (200 OK)**

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "ref": "CI-20260728-0001"
  }
}
```

### Response Fields

| Field | Type   | Keterangan                                       |
| ----- | ------ | ------------------------------------------------ |
| `ref` | string | Nomor referensi baru, format: `CI-YYYYMMDD-XXXX` |

---

## 2. List Cash In

Mengembalikan daftar transaksi Cash In milik member yang sudah login.

**Endpoint**

```text
GET /api/v1/member/cash-in
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
      "id": 42,
      "user_id": 1,
      "reference": "CI-20260728-0001",
      "notes": "Gaji bulan Juli 2026",
      "total_amount": 5000000,
      "cash": "in",
      "created_at": "2026-07-28T10:30:00.000000Z",
      "updated_at": "2026-07-28T10:30:00.000000Z"
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

## 3. Get Cash In Detail

Menampilkan detail transaksi Cash In beserta entry debit/credit-nya.

**Endpoint**

```text
GET /api/v1/member/cash-in/{id}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "transaction": {
      "id": 42,
      "reference": "CI-20260728-0001",
      "total_amount": 5000000,
      "notes": "Gaji bulan Juli 2026",
      "created_at": "2026-07-28T10:30:00.000000Z",
      "entries": [
        {
          "id": 83,
          "account_id": 5,
          "account_name": "BCA",
          "entry_type": "debit",
          "amount": 5000000
        },
        {
          "id": 84,
          "account_id": 12,
          "account_name": "Gaji",
          "entry_type": "credit",
          "amount": 3000000
        },
        {
          "id": 85,
          "account_id": 15,
          "account_name": "Pendapatan Lainnya",
          "entry_type": "credit",
          "amount": 2000000
        }
      ]
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

## 4. Store Cash In

Mencatat transaksi pemasukan ke akun kas/bank, dengan satu atau lebih akun pendapatan sebagai kredit.

**Endpoint**

```text
POST /api/v1/member/cash-in
```

**Request Body**

```json
{
  "total_amount": 5000000,
  "notes": "Gaji bulan Juli 2026",
  "ref": "CI-20260728-0001",
  "details": [
    {
      "cash_account_id": 5,
      "amount": 5000000,
      "entry_type": "debit"
    },
    {
      "account_id": 12,
      "amount": 3000000,
      "entry_type": "credit"
    },
    {
      "account_id": 15,
      "amount": 2000000,
      "entry_type": "credit"
    }
  ]
}
```

### Request Fields

| Field          | Type    | Required | Validation                      | Keterangan                                         |
| -------------- | ------- | -------- | ------------------------------- | -------------------------------------------------- |
| `total_amount` | integer | Yes      | `min:1`                         | Jumlah total pemasukan (dalam rupiah)              |
| `ref`          | string  | Yes      | `unique:transactions,reference` | Nomor referensi (dapatkan dari `/cash-in/new-ref`) |
| `notes`        | string  | No       | nullable                        | Catatan transaksi                                  |
| `details`      | array   | Yes      | `min:1`                         | Array entry debit/credit                           |

### Detail Entry (`details[]`)

Setiap entry dalam array `details` harus memiliki field sesuai `entry_type`:

| Field             | Type    | Required                   | Validation           | Keterangan                                                |
| ----------------- | ------- | -------------------------- | -------------------- | --------------------------------------------------------- |
| `cash_account_id` | integer | **If** `entry_type=debit`  | `exists:accounts,id` | ID akun kas/bank yang menerima uang (asset, leaf account) |
| `account_id`      | integer | **If** `entry_type=credit` | `exists:accounts,id` | ID akun pendapatan (income, leaf account)                 |
| `amount`          | integer | Yes                        | `min:1`              | Jumlah entry                                              |
| `entry_type`      | string  | Yes                        | `in:debit,credit`    | Tipe entry                                                |

**Aturan Penting:**

1. **Balance check**: Total seluruh `amount` dengan `entry_type=debit` HARUS SAMA dengan total `amount` dengan `entry_type=credit`.
2. **Satu debit, banyak kredit**: Biasanya 1 entry debit (akun kas) dan 1+ entry kredit (akun pendapatan), misalnya untuk memecah gaji ke beberapa kategori.
3. **Akun harus leaf**: Akun yang digunakan tidak boleh memiliki sub-akun (child accounts).
4. **Akun harus milik user**: Semua akun harus terdaftar atas nama user yang sedang login.

### Response (201 Created)

```json
{
  "success": true,
  "message": "Cash In berhasil dicatat",
  "data": {
    "transaction": {
      "id": 42,
      "reference": "CI-20260728-0001",
      "total_amount": 5000000,
      "notes": "Gaji bulan Juli 2026",
      "created_at": "2026-07-28T10:30:00.000000Z",
      "entries": [
        {
          "id": 83,
          "account_id": 5,
          "account_name": "BCA",
          "entry_type": "debit",
          "amount": 5000000
        },
        {
          "id": 84,
          "account_id": 12,
          "account_name": "Gaji",
          "entry_type": "credit",
          "amount": 3000000
        },
        {
          "id": 85,
          "account_id": 15,
          "account_name": "Pendapatan Lainnya",
          "entry_type": "credit",
          "amount": 2000000
        }
      ]
    }
  }
}
```

### Response Fields — `data.transaction`

| Field          | Type    | Keterangan                |
| -------------- | ------- | ------------------------- |
| `id`           | integer | ID transaksi              |
| `reference`    | string  | Nomor referensi           |
| `total_amount` | integer | Total pemasukan (rupiah)  |
| `notes`        | string? | Catatan transaksi         |
| `created_at`   | string  | ISO 8601 timestamp        |
| `entries[]`    | array   | Detail entry debit/credit |

### Response Fields — `data.transaction.entries[]`

| Field          | Type    | Keterangan            |
| -------------- | ------- | --------------------- |
| `id`           | integer | ID entry              |
| `account_id`   | integer | ID akun               |
| `account_name` | string  | Nama akun             |
| `entry_type`   | string  | `debit` atau `credit` |
| `amount`       | integer | Jumlah (rupiah)       |

---

## 5. Update Cash In

Memperbarui transaksi Cash In yang sudah ada. Data yang bisa diubah: nomor referensi, catatan, total amount, dan detail entry debit/credit.

**Endpoint**

```text
PUT /api/v1/member/cash-in/{id}
```

**Request Body**

Sama dengan Store Cash In:

```json
{
  "total_amount": 6000000,
  "notes": "Gaji + bonus Juli 2026",
  "ref": "CI-20260728-0001",
  "details": [
    {
      "cash_account_id": 5,
      "amount": 6000000,
      "entry_type": "debit"
    },
    {
      "account_id": 12,
      "amount": 4000000,
      "entry_type": "credit"
    },
    {
      "account_id": 15,
      "amount": 2000000,
      "entry_type": "credit"
    }
  ]
}
```

### Request Fields

Sama seperti Store Cash In ([lihat tabel di atas](#4-store-cash-in)).

### Response (200 OK)

```json
{
  "success": true,
  "message": "Cash In berhasil diperbarui",
  "data": {
    "transaction": {
      "id": 42,
      "reference": "CI-20260728-0001",
      "total_amount": 6000000,
      "notes": "Gaji + bonus Juli 2026",
      "created_at": "2026-07-28T10:30:00.000000Z",
      "entries": [
        {
          "id": 86,
          "account_id": 5,
          "account_name": "BCA",
          "entry_type": "debit",
          "amount": 6000000
        },
        {
          "id": 87,
          "account_id": 12,
          "account_name": "Gaji",
          "entry_type": "credit",
          "amount": 4000000
        },
        {
          "id": 88,
          "account_id": 15,
          "account_name": "Pendapatan Lainnya",
          "entry_type": "credit",
          "amount": 2000000
        }
      ]
    }
  }
}
```

---

## 6. Delete Cash In

Menghapus transaksi Cash In. Saldo akun yang terlibat akan dikembalikan ke posisi sebelum transaksi.

**Endpoint**

```text
DELETE /api/v1/member/cash-in/{id}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Cash In berhasil dihapus",
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

| Pesan                                                   | Penyebab                                        |
| ------------------------------------------------------- | ----------------------------------------------- |
| `Jumlah total wajib diisi`                              | `total_amount` tidak diisi                      |
| `Jumlah total harus berupa angka`                       | `total_amount` bukan integer                    |
| `Jumlah total minimal 1`                                | `total_amount` < 1                              |
| `Nomor referensi wajib diisi`                           | `ref` tidak diisi                               |
| `Nomor referensi sudah digunakan`                       | `ref` sudah dipakai transaksi lain              |
| `Detail transaksi wajib diisi`                          | `details` tidak diisi atau kosong               |
| `Akun kas wajib diisi untuk entry debit`                | `cash_account_id` tidak diisi untuk entry debit |
| `Akun wajib diisi untuk entry credit`                   | `account_id` tidak diisi untuk entry credit     |
| `Jumlah wajib diisi`                                    | `amount` tidak diisi di detail                  |
| `Jumlah minimal 1`                                      | `amount` < 1 di detail                          |
| `Jumlah debit dan credit harus sama`                    | Total debit ≠ total credit                      |
| `Akun tidak ditemukan`                                  | Akun tidak valid atau bukan milik user          |
| `Akun {name} harus akun leaf (tidak memiliki sub-akun)` | Akun yang dipilih memiliki child accounts       |

---

## Tabel Ringkasan Endpoint

| Method   | Endpoint           | Deskripsi                     | Auth         |
| -------- | ------------------ | ----------------------------- | ------------ |
| `GET`    | `/cash-in`         | Daftar transaksi cash in      | Bearer Token |
| `GET`    | `/cash-in/new-ref` | Generate nomor referensi baru | Bearer Token |
| `GET`    | `/cash-in/{id}`    | Detail transaksi cash in      | Bearer Token |
| `POST`   | `/cash-in`         | Catat transaksi cash in       | Bearer Token |
| `PUT`    | `/cash-in/{id}`    | Perbarui transaksi cash in    | Bearer Token |
| `DELETE` | `/cash-in/{id}`    | Hapus transaksi cash in       | Bearer Token |

---

## Catatan Implementasi

- Transaksi dicatat menggunakan double-entry bookkeeping di tabel `transactions` (header) dan `transaction_entries` (detail debit/credit)
- `current_balance` pada setiap akun yang terlibat akan di-update secara otomatis:
  - Akun debit (kas/bank): saldo bertambah
  - Akun kredit (pendapatan): saldo bertambah
- Jika akun memiliki parent, `current_balance` parent akan dihitung ulang berdasarkan total saldo seluruh child accounts
- Selalu panggil `/cash-in/new-ref` terlebih dahulu untuk mendapatkan nomor referensi sebelum melakukan transaksi
- Nomor referensi `ref` harus unik — tidak boleh ada duplikasi
