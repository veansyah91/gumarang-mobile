# Debt API

API untuk mengelola utang (`payable`) dan piutang (`receivable`) milik member. Setiap pembuatan debt akan otomatis membuat jurnal awal di `debt_entries`, `transactions`, dan `transaction_entries`, serta memperbarui `current_balance` akun COA terkait.

Base URL: `/api/v1/member/personal-finance`

## Authentication

Semua endpoint memerlukan **Bearer Token** via Sanctum.

```text
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## 1. List Debts

Mengembalikan daftar utang/piutang milik member yang sudah login.

**Endpoint**

```text
GET /personal-finance/debts
```

### Query Parameters

| Parameter    | Tipe    | Default | Keterangan                           |
| ------------ | ------- | ------- | ------------------------------------ |
| `query`      | string  | —       | Cari berdasarkan `name` (LIKE)       |
| `type`       | string  | —       | Filter: `payable` atau `receivable`  |
| `contact_id` | integer | —       | Filter by kontak                     |
| `status`     | string  | —       | Filter: `pending`, `partial`, `paid` |
| `perPage`    | integer | 15      | Jumlah item per halaman              |

### Response (200 OK)

```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "contact_id": 1,
      "contact_name": "Budi Santoso",
      "type": "payable",
      "normal_balance": "credit",
      "name": "Utang Budi",
      "amount": 1000000,
      "balance": 750000,
      "due_date": "2026-08-30",
      "status": "partial",
      "notes": "Utang sembako",
      "account_id": 12,
      "account_name": "Utang Supplier",
      "entries": [],
      "created_at": "2026-07-30T10:00:00.000000Z",
      "updated_at": "2026-07-30T10:00:00.000000Z"
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

Order: `desc` by `balance`

---

## 2. Search Debts (Unpaid)

Mengembalikan daftar utang/piutang milik member yang **belum lunas** (`status != 'paid'`). Data `contact` disajikan sebagai nested object.

**Endpoint**

```text
GET /personal-finance/debts/search
```

### Query Parameters

| Parameter | Tipe    | Default | Keterangan                          |
| --------- | ------- | ------- | ----------------------------------- |
| `query`   | string  | —       | Cari berdasarkan `name` (LIKE)      |
| `type`    | string  | —       | Filter: `payable` atau `receivable` |
| `perPage` | integer | 15      | Jumlah item per halaman             |

> **Catatan**: Filter `status != 'paid'` diterapkan secara otomatis. Hanya data dengan `status = 'pending'` atau `status = 'partial'` yang dikembalikan.

### Response (200 OK)

```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "contact_id": 1,
      "contact_name": "Budi Santoso",
      "contact": {
        "id": 1,
        "user_id": 1,
        "name": "Budi Santoso",
        "phone": "08123456789",
        "notes": "Teman kantor",
        "created_at": "2026-07-30T10:00:00.000000Z",
        "updated_at": "2026-07-30T10:00:00.000000Z"
      },
      "type": "payable",
      "normal_balance": "credit",
      "name": "Utang Budi",
      "amount": 1000000,
      "balance": 750000,
      "due_date": "2026-08-30",
      "status": "partial",
      "notes": "Utang sembako",
      "account_id": 12,
      "account_name": "Utang Supplier",
      "entries": [],
      "created_at": "2026-07-30T10:00:00.000000Z",
      "updated_at": "2026-07-30T10:00:00.000000Z"
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

Order: `desc` by `balance`

---

## 3. Create Debt

Membuat utang/piutang baru. Sistem akan otomatis mencatat jurnal awal dan memperbarui saldo akun.

**Endpoint**

```text
POST /personal-finance/debts
```

### Request Body

```json
{
  "contact_id": 1,
  "type": "payable",
  "name": "Utang Budi",
  "amount": 1000000,
  "due_date": "2026-08-30",
  "notes": "Utang sembako",
  "account_id": 12,
  "cash_account_id": 3
}
```

### Request Fields

| Field             | Type          | Required | Keterangan                                                                                |
| ----------------- | ------------- | -------- | ----------------------------------------------------------------------------------------- |
| `contact_id`      | integer       | Yes      | ID kontak                                                                                 |
| `type`            | string        | Yes      | `payable` (utang) / `receivable` (piutang)                                                |
| `name`            | string        | Yes      | Nama utang/piutang                                                                        |
| `amount`          | integer       | Yes      | Jumlah nominal                                                                            |
| `due_date`        | string (date) | No       | Tanggal jatuh tempo                                                                       |
| `notes`           | string        | No       | Catatan                                                                                   |
| `account_id`      | integer       | Yes      | ID akun COA untuk utang/piutang (akun Utang untuk payable, akun Piutang untuk receivable) |
| `cash_account_id` | integer       | Yes      | ID akun kas/bank yang digunakan                                                           |

### Catatan

- `normal_balance` diisi otomatis: `payable` → `credit`, `receivable` → `debit`
- `balance` awal sama dengan `amount`
- Jurnal otomatis dibuat di `debt_entries` (is_initial=true), `transactions`, dan `transaction_entries`
- Saldo akun COA diperbarui secara otomatis:
  - **Payable**: Debit akun kas, Credit akun utang
  - **Receivable**: Debit akun piutang, Credit akun kas

### Response (201 Created)

```json
{
  "success": true,
  "message": "Utang/piutang berhasil dibuat",
  "data": {
    "id": 1,
    "user_id": 1,
    "contact_id": 1,
    "contact_name": "Budi Santoso",
    "type": "payable",
    "normal_balance": "credit",
    "name": "Utang Budi",
    "amount": 1000000,
    "balance": 1000000,
    "due_date": "2026-08-30",
    "status": "pending",
    "notes": "Utang sembako",
    "account_id": 12,
    "account_name": "Utang Supplier",
    "created_at": "2026-07-30T10:00:00.000000Z",
    "updated_at": "2026-07-30T10:00:00.000000Z"
  }
}
```

---

## 4. Show Debt Detail

Menampilkan detail utang/piutang beserta entry-nya.

**Endpoint**

```text
GET /personal-finance/debts/{id}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
    "user_id": 1,
    "contact_id": 1,
    "contact_name": "Budi Santoso",
    "type": "payable",
    "normal_balance": "credit",
    "name": "Utang Budi",
    "amount": 1000000,
    "balance": 750000,
    "due_date": "2026-08-30",
    "status": "partial",
    "notes": "Utang sembako",
    "account_id": 12,
    "account_name": "Utang Supplier",
    "entries": [
      {
        "id": 2,
        "debt_id": 1,
        "no_ref": "DE-20260730-0001",
        "date": "2026-07-30",
        "amount": 250000,
        "type": "credit",
        "notes": "Pembayaran cicilan",
        "account_id": 3,
        "is_initial": false,
        "created_at": "2026-07-30T10:30:00.000000Z",
        "updated_at": "2026-07-30T10:30:00.000000Z"
      },
      {
        "id": 1,
        "debt_id": 1,
        "no_ref": "DE-20260730-0000",
        "date": "2026-07-30",
        "amount": 1000000,
        "type": "credit",
        "notes": null,
        "account_id": 3,
        "is_initial": true,
        "created_at": "2026-07-30T10:00:00.000000Z",
        "updated_at": "2026-07-30T10:00:00.000000Z"
      }
    ],
    "created_at": "2026-07-30T10:00:00.000000Z",
    "updated_at": "2026-07-30T10:30:00.000000Z"
  }
}
```

### Response (404 Not Found)

```json
{
  "success": false,
  "message": "Utang/piutang tidak ditemukan",
  "data": []
}
```

---

## 5. Update Debt

Memperbarui utang/piutang yang sudah ada. Jika `amount` diubah, jurnal awal akan di-reverse dan diterapkan ulang.

**Validasi**: Data tidak dapat diupdate jika `amount` baru lebih besar dari `balance` saat ini (artinya sudah terjadi pembayaran).

**Endpoint**

```text
PUT /personal-finance/debts/{id}
```

### Request Body

```json
{
  "name": "Utang Budi Updated",
  "amount": 1500000
}
```

### Request Fields

| Field             | Type          | Required       | Keterangan                                       |
| ----------------- | ------------- | -------------- | ------------------------------------------------ |
| `contact_id`      | integer       | No (sometimes) | ID kontak                                        |
| `name`            | string        | No (sometimes) | Nama utang/piutang                               |
| `amount`          | integer       | No (sometimes) | Jumlah nominal (memicu reverse/reapply jurnal)   |
| `due_date`        | string (date) | No             | Tanggal jatuh tempo                              |
| `notes`           | string        | No             | Catatan                                          |
| `account_id`      | integer       | No             | ID akun COA utang/piutang                        |
| `cash_account_id` | integer       | No             | ID akun kas/bank (digunakan jika amount berubah) |

### Response (200 OK)

```json
{
  "success": true,
  "message": "Utang/piutang berhasil diperbarui",
  "data": {
    "id": 1,
    "contact_id": 1,
    "contact_name": "Budi Santoso",
    "type": "payable",
    "name": "Utang Budi Updated",
    "amount": 1500000,
    "balance": 1250000,
    "status": "partial",
    "due_date": "2026-08-30",
    "notes": "Utang sembako"
  }
}
```

### Error Response (422) — Tidak bisa diupdate karena sudah ada pembayaran

```json
{
  "success": false,
  "message": "Jumlah tidak dapat diubah karena telah terjadi pembayaran",
  "data": []
}
```

---

## 6. Delete Debt

Menghapus utang/piutang (soft delete). Jurnal awal di-reverse, saldo akun dikembalikan.

**Validasi**: Data tidak dapat dihapus jika sudah terjadi pembayaran (`balance < amount`).

**Endpoint**

```text
DELETE /personal-finance/debts/{id}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Utang/piutang berhasil dihapus",
  "data": []
}
```

### Response (422) — Tidak bisa dihapus

```json
{
  "success": false,
  "message": "Utang/piutang tidak dapat dihapus karena telah terjadi pembayaran",
  "data": []
}
```

### Response (404 Not Found)

```json
{
  "success": false,
  "message": "Utang/piutang tidak ditemukan",
  "data": []
}
```

---

## Tabel Ringkasan Endpoint

| Method   | Endpoint        | Deskripsi                                                          | Auth         |
| -------- | --------------- | ------------------------------------------------------------------ | ------------ |
| `GET`    | `/debts`        | Daftar utang/piutang                                               | Bearer Token |
| `GET`    | `/debts/search` | Pencarian utang/piutang belum lunas (auto filter status != 'paid') | Bearer Token |
| `POST`   | `/debts`        | Buat utang/piutang baru + jurnal otomatis                          | Bearer Token |
| `GET`    | `/debts/{id}`   | Detail utang/piutang + entries                                     | Bearer Token |
| `PUT`    | `/debts/{id}`   | Update utang/piutang                                               | Bearer Token |
| `DELETE` | `/debts/{id}`   | Hapus utang/piutang + reverse jurnal                               | Bearer Token |

## Catatan Implementasi

- **normal_balance**: Diisi otomatis saat create. `payable` → `credit`, `receivable` → `debit`. Tidak bisa diubah manual.
- **Balance**: Nilai awal `balance` = `amount`. Berubah setiap kali entry (non-initial) dibuat/diubah/dihapus. Initial entry (`is_initial=true`) tidak mempengaruhi balance.
- **Status otomatis**: `balance <= 0` → `paid`, `balance >= amount` → `pending`, sisanya `partial`.
- **Jurnal otomatis**: Saat create, sistem mencatat debit/kredit di `transactions` dan `transaction_entries` dan memperbarui `current_balance` akun COA.
- **Validasi update/delete**: Tidak bisa mengubah amount jika sudah ada pembayaran. Tidak bisa menghapus jika sudah ada pembayaran.
- **Autorisasi**: User hanya bisa mengakses data miliknya sendiri. Endpoint mengembalikan `404` untuk data milik user lain.
