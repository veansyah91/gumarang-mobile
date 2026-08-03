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

| Tipe Debt                | Entry `debit`          | Entry `credit`                                |
| ------------------------ | ---------------------- | --------------------------------------------- |
| **payable** (utang)      | Menambah saldo utang   | Mengurangi saldo utang (pembayaran/cicilan)   |
| **receivable** (piutang) | Menambah saldo piutang | Mengurangi saldo piutang (pelunasan diterima) |

### Recalculate balance

```
balance = amount + SUM(debit WHERE is_initial=false) - SUM(credit WHERE is_initial=false)
```

Entry dengan `is_initial = true` (jurnal awal saat debt dibuat) tidak disertakan dalam perhitungan balance.

### Update status otomatis

Setelah setiap entry:

- `balance <= 0` → status = `paid`
- `balance >= amount` → status = `pending`
- selain itu → status = `partial`

---

## 1. List Debt Entries

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

## 2. Create Debt Entry

Menambahkan entry baru ke utang/piutang. Jika belum ada debt dengan `contact_id` dan `type` yang sama, sistem akan membuat debt baru secara otomatis.

**Endpoint**

```text
POST /personal-finance/debt-entries
```

### Request Body

```json
{
  "contact_id": 1,
  "type": "payable",
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
| `contact_id` | integer       | Yes      | ID kontak                                                 |
| `type`       | string        | Yes      | Tipe debt: `payable` (utang) / `receivable` (piutang)     |
| `entry_type` | string        | Yes      | `debit` (tambah saldo) / `credit` (kurangi saldo / bayar) |
| `date`       | string (date) | Yes      | Tanggal transaksi                                         |
| `amount`     | integer       | Yes      | Jumlah nominal                                            |
| `account_id` | integer       | No       | ID akun kas/bank yang digunakan                           |
| `notes`      | string        | No       | Catatan transaksi                                         |

### Alur

1. Cari debt milik user dengan `contact_id` dan `type` yang sesuai
2. Jika tidak ditemukan → buat debt baru secara otomatis (name digenerate dari nama kontak + tipe)
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
  "message": "Kontak tidak ditemukan",
  "data": []
}
```

---

## 3. Show Debt Entry Detail

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

## 4. Update Debt Entry

Memperbarui entry yang sudah ada. Balance debt akan dihitung ulang.

Jika entry bertipe `credit`, sistem akan memvalidasi bahwa jumlah pembayaran tidak melebihi sisa utang/piutang.

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

---

## 5. Delete Debt Entry

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

| Method   | Endpoint                            | Deskripsi                                    | Auth         |
| -------- | ----------------------------------- | -------------------------------------------- | ------------ |
| `GET`    | `/debts/{debtId}/entries`           | Daftar entry utang/piutang                   | Bearer Token |
| `POST`   | `/debt-entries`                     | Tambah entry baru (auto find-or-create debt) | Bearer Token |
| `GET`    | `/debts/{debtId}/entries/{entryId}` | Detail entry                                 | Bearer Token |
| `PUT`    | `/debts/{debtId}/entries/{entryId}` | Update entry                                 | Bearer Token |
| `DELETE` | `/debts/{debtId}/entries/{entryId}` | Hapus entry (hanya yang terakhir)            | Bearer Token |

## Catatan Implementasi

- **no_ref**: Digenerate otomatis saat store menggunakan format `DE-YYYYMMDD-XXXX`. Tidak bisa diisi manual.
- **Auto find-or-create debt**: Saat create entry, jika belum ada debt dengan `contact_id` + `type` yang sama, sistem membuat debt baru otomatis.
- **Balance recalibrate**: Setiap create/update/delete entry akan menghitung ulang `balance` debt dan memperbarui `status` secara otomatis.
- **Cegah balance negatif**: Entry `credit` (pembayaran) tidak boleh melebihi sisa saldo debt saat update.
- **Hanya entry terakhir**: Delete hanya diperbolehkan untuk entry yang paling terakhir dibuat (`created_at` terbaru).
- **Autorisasi**: User hanya bisa mengakses entry dari debt miliknya sendiri. Endpoint mengembalikan `404` untuk data milik user lain.
