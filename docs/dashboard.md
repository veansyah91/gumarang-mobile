# Personal Finance Dashboard API

API untuk mendapatkan ringkasan dashboard personal finance milik member. Data mencakup total aset, total utang, alert anggaran, arus kas masuk/keluar, serta piutang dan utang yang akan jatuh tempo dalam 3 hari ke depan.

Base URL: `https://api.gumarang.local/api/v1/member`

## Authentication

Semua endpoint memerlukan **Bearer Token** via Sanctum.

```text
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## 1. Get Dashboard Summary

Mengembalikan ringkasan dashboard personal finance untuk member yang sudah login.

**Endpoint**

```text
GET /api/v1/member/personal-finance/dashboard
```

### Query Parameters

| Parameter | Tipe | Default | Keterangan |
|-----------|------|---------|------------|
| `start_date` | string (YYYY-MM-DD) | Tanggal 1 bulan berjalan | Tanggal mulai periode filter |
| `end_date` | string (YYYY-MM-DD) | Tanggal akhir bulan berjalan | Tanggal akhir periode filter |

Jika `start_date` dan `end_date` tidak dikirim, otomatis menggunakan periode bulan berjalan (1–31 bulan saat ini).

### Response (200 OK)

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "total_assets": 50000000,
    "total_debt": 15000000,
    "budget_alerts": [
      {
        "id": 1,
        "name": "Budget Makanan Juli",
        "account_name": "Makanan",
        "amount": 1000000,
        "spent": 1200000,
        "remaining": 0,
        "percentage_used": 120,
        "alerts": [
          {
            "id": 2,
            "threshold_percentage": 100,
            "alert_type": "danger",
            "is_triggered": true,
            "triggered_at": "2026-07-20T14:00:00.000000Z"
          }
        ]
      }
    ],
    "cash_in": {
      "total": 25000000,
      "top_accounts": [
        {
          "account_id": 12,
          "account_name": "Gaji",
          "total_amount": 15000000
        },
        {
          "account_id": 15,
          "account_name": "Pendapatan Lainnya",
          "total_amount": 10000000
        }
      ]
    },
    "cash_out": {
      "total": 18000000,
      "top_accounts": [
        {
          "account_id": 5,
          "account_name": "Makanan",
          "total_amount": 5000000
        },
        {
          "account_id": 8,
          "account_name": "Transportasi",
          "total_amount": 3000000
        }
      ]
    },
    "due_receivables": [
      {
        "id": 3,
        "name": "Piutang Pak Budi",
        "contact_name": "Budi",
        "balance": 2000000,
        "due_date": "2026-08-06",
        "type": "receivable"
      }
    ],
    "due_payables": [
      {
        "id": 7,
        "name": "Utang Toko Emas",
        "contact_name": "Toko Emas Jaya",
        "balance": 5000000,
        "due_date": "2026-08-05",
        "type": "payable"
      }
    ]
  }
}
```

### Response Fields — `data`

| Field | Tipe | Keterangan |
|-------|------|------------|
| `total_assets` | integer | Total saldo akun bertipe asset (rupiah) |
| `total_debt` | integer | Total saldo utang payable (rupiah) |
| `budget_alerts` | array | Budget yang memiliki alert terpicu (warning/danger) |
| `cash_in.total` | integer | Total pemasukan dalam periode (rupiah) |
| `cash_in.top_accounts` | array | 5 akun income dengan total terbesar |
| `cash_out.total` | integer | Total pengeluaran dalam periode (rupiah) |
| `cash_out.top_accounts` | array | 5 akun expense dengan total terbesar |
| `due_receivables` | array | Piutang (receivable) yang akan jatuh tempo dalam 3 hari |
| `due_payables` | array | Utang (payable) yang akan jatuh tempo dalam 3 hari |

### Response Fields — `data.budget_alerts[]`

| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | integer | ID budget |
| `name` | string | Nama budget |
| `account_name` | string | Nama akun expense terkait |
| `amount` | integer | Limit anggaran (rupiah) |
| `spent` | integer | Total pengeluaran aktual (rupiah) |
| `remaining` | integer | Sisa anggaran (rupiah) |
| `percentage_used` | float | Persentase penggunaan anggaran |
| `alerts` | array | Daftar alert yang terpicu |

### Response Fields — `data.cash_in.top_accounts[]` dan `data.cash_out.top_accounts[]`

| Field | Tipe | Keterangan |
|-------|------|------------|
| `account_id` | integer | ID akun |
| `account_name` | string | Nama akun |
| `total_amount` | integer | Total amount untuk akun tersebut (rupiah) |

### Response Fields — `data.due_receivables[]` dan `data.due_payables[]`

| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | integer | ID debt |
| `name` | string | Nama utang/piutang |
| `contact_name` | string | Nama kontak terkait |
| `balance` | integer | Saldo belum lunas (rupiah) |
| `due_date` | string | Tanggal jatuh tempo (YYYY-MM-DD) |
| `type` | string | `receivable` atau `payable` |

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
  "message": "Tanggal akhir harus setelah atau sama dengan tanggal mulai",
  "errors": {
    "end_date": ["Tanggal akhir harus setelah atau sama dengan tanggal mulai"]
  }
}
```

---

## Tabel Ringkasan Endpoint

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `GET` | `/personal-finance/dashboard` | Ringkasan dashboard personal finance | Bearer Token |

---

## Catatan Implementasi

- **Total Aset**: Dihitung dari `current_balance` seluruh akun bertipe `asset` milik user.
- **Total Utang**: Dihitung dari `balance` seluruh debt bertipe `payable` milik user.
- **Budget Alert**: Menggunakan `BudgetService::summary()` untuk mendapatkan budget dengan alert terpicu.
- **Kas Masuk**: Total dari transaksi dengan `cash = 'in'` dalam periode. Top 5 akun dihitung dari `transaction_entries` yang berelasi dengan akun bertipe `income`.
- **Kas Keluar**: Total dari transaksi dengan `cash = 'out'` dalam periode. Top 5 akun dihitung dari `transaction_entries` yang berelasi dengan akun bertipe `expense`.
- **Piutang/Utang Jatuh Tempo**: Debt dengan `due_date` dalam 3 hari ke depan dan status bukan `paid`.
- **Caching**: Hasil dashboard di-cache per user + date range dengan TTL 5 menit. Cache di-flush secara otomatis saat data terkait (transaksi, budget, debt) dimodifikasi.
- **Integer Nominal**: Semua nominal disimpan dan dikembalikan sebagai integer (rupiah bulat).
