# Debt Entry API

API untuk mengelola entry transaksi utang/piutang (pembayaran cicilan, penambahan saldo, dll). Setiap entry akan mempengaruhi `balance` pada debt terkait. Entry bertipe `is_initial = true` (dibuat otomatis saat debt dibuat) tidak mempengaruhi balance.

Base URL: `https://api.gumarang.local/api/v1/member/personal-finance`

## Authentication

Semua endpoint memerlukan **Bearer Token** via Sanctum.

```text
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## Aturan Debit/Credit

| Tipe Debt                | Entry `debit`                       | Entry `credit`                       |
| ------------------------ | ----------------------------------- | ------------------------------------ |
| **payable** (utang)      | Mengurangi saldo utang (pembayaran) | Menambah saldo utang                 |
| **receivable** (piutang) | Menambah saldo piutang              | Mengurangi saldo piutang (pelunasan) |

### Recalculate balance

```
receivable (normal_balance=debit): balance = amount + SUM(debit non-init) - SUM(credit non-init)
payable   (normal_balance=credit): balance = amount + SUM(credit non-init) - SUM(debit non-init)
```

Entry dengan `is_initial = true` (jurnal awal saat debt dibuat) tidak disertakan dalam perhitungan balance.

### Update status otomatis

Setelah setiap entry:

- `balance <= 0` → status = `paid`
- `balance >= amount` → status = `pending`
- selain itu → status = `partial`

---

## 1. List All Debt Entries

Mengembalikan daftar entry dari seluruh utang/piutang milik member. Endpoint ini dipakai frontend untuk mengakses entry dari dua jalur: fitur Utang (`type=payable`) dan fitur Piutang (`type=receivable`).

**Endpoint**

```text
GET /personal-finance/debt-entries
```

### Query Parameters

| Parameter    | Tipe           | Default | Keterangan                                                |
| ------------ | -------------- | ------- | --------------------------------------------------------- |
| `type`       | string         | —       | Filter berdasarkan tipe debt: `payable` atau `receivable` |
| `debt_id`    | integer        | —       | Filter berdasarkan ID utang/piutang spesifik              |
| `entry_type` | string         | —       | Filter berdasarkan tipe entry: `debit` atau `credit`      |
| `search`     | string         | —       | Cari berdasarkan `no_ref` (LIKE)                          |
| `startDate`  | string (Y-m-d) | —       | Filter dari tanggal transaksi                             |
| `endDate`    | string (Y-m-d) | —       | Filter sampai tanggal transaksi                           |
| `perPage`    | integer        | 15      | Jumlah item per halaman                                   |

### Response (200 OK)

```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "debt_id": 1,
      "no_ref": "DE-20260730-0001",
      "date": "2026-07-30",
      "amount": 250000,
      "type": "credit",
      "notes": "Pembayaran cicilan",
      "account_id": 3,
      "is_initial": false,
      "debt_name": "Utang Budi",
      "debt_type": "payable",
      "contact_name": "Budi Santoso",
      "created_at": "2026-07-30T10:30:00.000000Z",
      "updated_at": "2026-07-30T10:30:00.000000Z"
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

Order: `desc` by `date`, lalu `desc` by `created_at`

---

## 2. List Debt Entries

Mengembalikan daftar entry untuk satu utang/piutang tertentu.

**Endpoint**

```text
GET /personal-finance/debts/{debtId}/entries
```

### Query Parameters

| Parameter   | Tipe           | Default | Keterangan                       |
| ----------- | -------------- | ------- | -------------------------------- |
| `search`    | string         | —       | Cari berdasarkan `no_ref` (LIKE) |
| `startDate` | string (Y-m-d) | —       | Filter dari tanggal transaksi    |
| `endDate`   | string (Y-m-d) | —       | Filter sampai tanggal transaksi  |
| `perPage`   | integer        | 15      | Jumlah item per halaman          |

### Response (200 OK)

```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 1,
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

Order: `desc` by `date`, lalu `desc` by `created_at`

### Response (404 Not Found)

Jika debt tidak ditemukan atau bukan milik user:

```json
{
  "success": false,
  "message": "Utang/piutang tidak ditemukan",
  "data": []
}
```

---

## 3. Create Debt Entry

Menambahkan entry baru ke utang/piutang. Debt harus sudah ada sebelumnya.

**Endpoint**

```text
POST /personal-finance/debt-entries
```

### Request Body

```json
{
  "debt_id": 1,
  "entry_type": "credit",
  "date": "2026-07-30",
  "amount": 250000,
  "account_id": 3,
  "notes": "Pembayaran cicilan"
}
```

### Request Fields

| Field        | Type          | Required | Keterangan                                                |
| ------------ | ------------- | -------- | --------------------------------------------------------- |
| `debt_id`    | integer       | Yes      | ID utang/piutang                                          |
| `entry_type` | string        | Yes      | `debit` (tambah saldo) / `credit` (kurangi saldo / bayar) |
| `date`       | string (date) | Yes      | Tanggal transaksi                                         |
| `amount`     | integer       | Yes      | Jumlah nominal                                            |
| `account_id` | integer       | No       | ID akun kas/bank yang digunakan                           |
| `notes`      | string        | No       | Catatan transaksi                                         |

### Alur

1. Debt wajib sudah ada dan milik user
2. Validasi balance tidak negatif untuk entry yang mengurangi saldo
3. Generate `no_ref` (format `DE-YYYYMMDD-XXXX`)
4. Buat entry dan recalibrate balance debt

### Response (201 Created)

```json
{
  "success": true,
  "message": "Entry berhasil ditambahkan",
  "data": {
    "id": 1,
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
  }
}
```

### Error Response (422)

```json
{
  "success": false,
  "message": "Utang/piutang tidak ditemukan",
  "data": []
}
```

atau jika balance tidak mencukupi:

```json
{
  "success": false,
  "message": "Saldo tidak mencukupi",
  "data": []
}
```

---

## 4. Show Debt Entry Detail

Menampilkan detail entry.

**Endpoint**

```text
GET /personal-finance/debts/{debtId}/entries/{entryId}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
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
  }
}
```

### Response (404 Not Found)

```json
{
  "success": false,
  "message": "Entry tidak ditemukan",
  "data": []
}
```

---

## 5. Update Debt Entry

Memperbarui entry yang sudah ada. **Hanya entry terakhir** yang dapat diperbarui. Balance debt akan dihitung ulang.

Jika entry bertipe yang mengurangi saldo, sistem akan memvalidasi bahwa jumlah tidak melebihi sisa utang/piutang.

**Endpoint**

```text
PUT /personal-finance/debts/{debtId}/entries/{entryId}
```

### Request Body

```json
{
  "amount": 300000,
  "notes": "Pembayaran cicilan updated"
}
```

### Request Fields

| Field        | Type          | Required       | Keterangan         |
| ------------ | ------------- | -------------- | ------------------ |
| `date`       | string (date) | No (sometimes) | Tanggal transaksi  |
| `amount`     | integer       | No (sometimes) | Jumlah nominal     |
| `entry_type` | string        | No (sometimes) | `debit` / `credit` |
| `notes`      | string        | No             | Catatan transaksi  |

### Response (200 OK)

```json
{
  "success": true,
  "message": "Entry berhasil diperbarui",
  "data": {
    "id": 1,
    "debt_id": 1,
    "no_ref": "DE-20260730-0001",
    "date": "2026-07-30",
    "amount": 300000,
    "type": "credit",
    "notes": "Pembayaran cicilan updated",
    "account_id": 3,
    "is_initial": false,
    "created_at": "2026-07-30T10:30:00.000000Z",
    "updated_at": "2026-07-30T11:00:00.000000Z"
  }
}
```

### Error Response (422) — Melebihi sisa balance

```json
{
  "success": false,
  "message": "Jumlah pembayaran melebihi sisa utang/piutang",
  "data": []
}
```

### Error Response (422) — Bukan entry terakhir

```json
{
  "success": false,
  "message": "Hanya entry terakhir yang dapat diperbarui",
  "data": []
}
```

---

## 6. Delete Debt Entry

Menghapus entry. Hanya entry **paling akhir (terbaru)** yang dapat dihapus.

Balance debt akan dihitung ulang.

**Endpoint**

```text
DELETE /personal-finance/debts/{debtId}/entries/{entryId}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Entry berhasil dihapus",
  "data": []
}
```

### Response (422) — Bukan entry terakhir

```json
{
  "success": false,
  "message": "Hanya entry terakhir yang dapat dihapus",
  "data": []
}
```

### Response (404 Not Found)

```json
{
  "success": false,
  "message": "Entry tidak ditemukan",
  "data": []
}
```

---

## Tabel Ringkasan Endpoint

| Method   | Endpoint                            | Deskripsi                                          | Auth         |
| -------- | ----------------------------------- | -------------------------------------------------- | ------------ |
| `GET`    | `/debt-entries`                     | Daftar entry seluruh utang/piutang (filter `type`) | Bearer Token |
| `GET`    | `/debts/{debtId}/entries`           | Daftar entry utang/piutang tertentu                | Bearer Token |
| `POST`   | `/debt-entries`                     | Tambah entry baru ke debt yang sudah ada           | Bearer Token |
| `GET`    | `/debts/{debtId}/entries/{entryId}` | Detail entry                                       | Bearer Token |
| `PUT`    | `/debts/{debtId}/entries/{entryId}` | Update entry (hanya yang terakhir)                 | Bearer Token |
| `DELETE` | `/debts/{debtId}/entries/{entryId}` | Hapus entry (hanya yang terakhir)                  | Bearer Token |

## Catatan Implementasi

- **no_ref**: Digenerate otomatis saat store menggunakan format `DE-YYYYMMDD-XXXX`. Tidak bisa diisi manual.
- **Debt wajib ada**: Saat create entry, `debt_id` wajib disertakan dan debt harus sudah ada. Tidak ada lagi auto find-or-create.
- **Balance recalibrate**: Setiap create/update/delete entry akan menghitung ulang `balance` debt dan memperbarui `status` secara otomatis.
- **Cegah balance negatif**: Entry yang mengurangi saldo (pembayaran) tidak boleh menyebabkan balance menjadi negatif, baik saat create maupun update. Akan return 422 dengan pesan "Saldo tidak mencukupi".
- **Hanya entry terakhir**: Update dan delete hanya diperbolehkan untuk entry yang paling terakhir dibuat (`created_at` terbaru).
- **Autorisasi**: User hanya bisa mengakses entry dari debt miliknya sendiri. Endpoint mengembalikan `404` untuk data milik user lain.
