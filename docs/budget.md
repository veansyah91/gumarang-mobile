# Budget API

API untuk mengelola anggaran (budget) pengeluaran milik member. Budget diikat ke satu akun bertipe `expense` (leaf account — tidak memiliki sub-akun). Sistem menghitung total pengeluaran aktual dari `transaction_entries` secara real-time setiap kali endpoint diakses.

## Authentication

Semua endpoint memerlukan **Bearer Token** via Sanctum.

```text
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## 1. List Budgets

Mengembalikan daftar budget milik member yang sudah login. Setiap item menyertakan field `spent`, `remaining`, dan `percentage_used` yang dihitung real-time.

**Endpoint**

```text
GET /api/v1/member/budgets
```

### Query Parameters

| Parameter     | Tipe                            | Default | Keterangan                                            |
| ------------- | ------------------------------- | ------- | ----------------------------------------------------- |
| `query`       | string                          | —       | Cari berdasarkan nama budget (LIKE)                   |
| `period_type` | `monthly` / `yearly` / `custom` | —       | Filter tipe periode                                   |
| `is_active`   | boolean                         | —       | Filter status aktif                                   |
| `perPage`     | integer                         | 10      | Jumlah item per halaman                               |
| `all`         | boolean                         | false   | Jika `true`, kembalikan seluruh data tanpa pagination |

### Response (200 OK) — Paginated

```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "account_id": 5,
      "account_name": "Makanan",
      "name": "Budget Makanan Juli",
      "amount": 1000000,
      "period_type": "monthly",
      "start_date": "2026-07-01",
      "end_date": "2026-07-31",
      "repeat": true,
      "is_active": true,
      "spent": 300000,
      "remaining": 700000,
      "percentage_used": 30,
      "alerts": [],
      "created_at": "2026-07-01T00:00:00.000000Z",
      "updated_at": "2026-07-01T00:00:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 10,
    "total": 25
  }
}
```

### Response (200 OK) — All (tanpa pagination)

Dengan `?all=true`, `meta` tidak disertakan dan `data` berupa array langsung.

---

## 2. Create Budget

Membuat budget baru. Budget hanya bisa dibuat untuk akun expense yang tidak memiliki sub-akun (leaf account).

**Endpoint**

```text
POST /api/v1/member/budgets
```

### Request Body

```json
{
  "account_id": 5,
  "name": "Budget Makanan Juli",
  "amount": 1000000,
  "period_type": "monthly",
  "start_date": "2026-07-01",
  "end_date": "2026-07-31",
  "repeat": true
}
```

### Request Fields

| Field         | Type          | Required | Validation                 | Keterangan                                                  |
| ------------- | ------------- | -------- | -------------------------- | ----------------------------------------------------------- |
| `account_id`  | integer       | Yes      | `exists:accounts,id`       | ID akun expense (harus leaf account — tidak memiliki child) |
| `name`        | string        | Yes      | `max:255`                  | Nama budget                                                 |
| `amount`      | integer       | Yes      | `min:1`                    | Limit anggaran (rupiah bulat)                               |
| `period_type` | string        | Yes      | `in:monthly,yearly,custom` | Tipe periode                                                |
| `start_date`  | string (date) | Yes      | format `Y-m-d`             | Tanggal mulai periode                                       |
| `end_date`    | string (date) | Yes      | `after:start_date`         | Tanggal akhir periode                                       |
| `repeat`      | boolean       | No       | nullable                   | Default `true`. Dipaksa `false` jika `period_type=custom`   |

### Response (201 Created)

```json
{
  "success": true,
  "message": "Budget berhasil dibuat",
  "data": {
    "id": 1,
    "user_id": 1,
    "account_id": 5,
    "account_name": "Makanan",
    "name": "Budget Makanan Juli",
    "amount": 1000000,
    "period_type": "monthly",
    "start_date": "2026-07-01",
    "end_date": "2026-07-31",
    "repeat": true,
    "is_active": true,
    "spent": 0,
    "remaining": 1000000,
    "percentage_used": 0,
    "alerts": [],
    "created_at": "2026-07-01T00:00:00.000000Z",
    "updated_at": "2026-07-01T00:00:00.000000Z"
  }
}
```

---

## 3. Show Budget Detail

Menampilkan detail budget beserta riwayat `alerts` dan kalkulasi `spent` real-time.

**Endpoint**

```text
GET /api/v1/member/budgets/{id}
```

### Path Params

| Parameter | Type    | Required | Keterangan |
| --------- | ------- | -------- | ---------- |
| `id`      | integer | Yes      | ID budget  |

### Response (200 OK)

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
    "user_id": 1,
    "account_id": 5,
    "account_name": "Makanan",
    "name": "Budget Makanan Juli",
    "amount": 1000000,
    "period_type": "monthly",
    "start_date": "2026-07-01",
    "end_date": "2026-07-31",
    "repeat": true,
    "is_active": true,
    "spent": 900000,
    "remaining": 100000,
    "percentage_used": 90,
    "alerts": [
      {
        "id": 1,
        "budget_id": 1,
        "threshold_percentage": 80,
        "alert_type": "warning",
        "is_triggered": true,
        "is_read": false,
        "triggered_at": "2026-07-15T10:30:00.000000Z",
        "created_at": "2026-07-15T10:30:00.000000Z"
      }
    ],
    "created_at": "2026-07-01T00:00:00.000000Z",
    "updated_at": "2026-07-01T00:00:00.000000Z"
  }
}
```

### Response (200 OK) — Budget with Danger Alert

Jika pengeluaran melebihi limit budget (`percentage_used >= 100`), alert dengan `alert_type: "danger"` akan muncul:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
    "name": "Budget Makanan Juli",
    "amount": 1000000,
    "spent": 1500000,
    "remaining": 0,
    "percentage_used": 150,
    "alerts": [
      {
        "id": 1,
        "budget_id": 1,
        "threshold_percentage": 80,
        "alert_type": "warning",
        "is_triggered": true,
        "is_read": false,
        "triggered_at": "2026-07-15T10:30:00.000000Z",
        "created_at": "2026-07-15T10:30:00.000000Z"
      },
      {
        "id": 2,
        "budget_id": 1,
        "threshold_percentage": 100,
        "alert_type": "danger",
        "is_triggered": true,
        "is_read": false,
        "triggered_at": "2026-07-20T14:00:00.000000Z",
        "created_at": "2026-07-20T14:00:00.000000Z"
      }
    ]
  }
}
```

### Response (404 Not Found)

```json
{
  "success": false,
  "message": "Budget tidak ditemukan",
  "data": []
}
```

---

## 4. Update Budget

Memperbarui budget yang sudah ada. Semua field bersifat opsional (partial update).

**Endpoint**

```text
PUT /api/v1/member/budgets/{id}
```

### Path Params

| Parameter | Type    | Required | Keterangan |
| --------- | ------- | -------- | ---------- |
| `id`      | integer | Yes      | ID budget  |

### Request Body

```json
{
  "name": "Budget Makanan Agustus",
  "amount": 1500000,
  "is_active": true
}
```

### Request Fields

| Field         | Type          | Required       | Validation                 | Keterangan                         |
| ------------- | ------------- | -------------- | -------------------------- | ---------------------------------- |
| `account_id`  | integer       | No (sometimes) | `exists:accounts,id`       | Ganti akun (harus expense leaf)    |
| `name`        | string        | No (sometimes) | `max:255`                  | Nama budget                        |
| `amount`      | integer       | No (sometimes) | `min:1`                    | Limit anggaran                     |
| `period_type` | string        | No (sometimes) | `in:monthly,yearly,custom` | Tipe periode                       |
| `start_date`  | string (date) | No (sometimes) | format `Y-m-d`             | Tanggal mulai                      |
| `end_date`    | string (date) | No (sometimes) | `after:start_date`         | Tanggal akhir                      |
| `repeat`      | boolean       | No             | nullable                   | Auto-rollover                      |
| `is_active`   | boolean       | No             | nullable                   | Nonaktifkan budget tanpa menghapus |

### Response (200 OK)

```json
{
  "success": true,
  "message": "Budget berhasil diperbarui",
  "data": {
    "id": 1,
    "name": "Budget Makanan Agustus",
    "amount": 1500000,
    "spent": 300000,
    "remaining": 1200000,
    "percentage_used": 20,
    "alerts": [],
    "is_active": true
  }
}
```

---

## 5. Delete Budget

Menghapus budget. `budget_alerts` terkait akan ikut terhapus (cascade).

**Endpoint**

```text
DELETE /api/v1/member/budgets/{id}
```

### Path Params

| Parameter | Type    | Required | Keterangan |
| --------- | ------- | -------- | ---------- |
| `id`      | integer | Yes      | ID budget  |

### Response (200 OK)

```json
{
  "success": true,
  "message": "Budget berhasil dihapus",
  "data": []
}
```

### Response (404 Not Found)

```json
{
  "success": false,
  "message": "Budget tidak ditemukan",
  "data": []
}
```

---

## 6. Get Budget Summary

Ringkasan seluruh budget aktif milik member.

**Endpoint**

```text
GET /api/v1/member/budgets/summary
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "total_budget": 5000000,
    "total_spent": 3200000,
    "total_remaining": 1800000,
    "overall_percentage": 64,
    "alert_budgets": [
      {
        "id": 1,
        "name": "Budget Makanan Juli",
        "amount": 1000000,
        "spent": 1500000,
        "remaining": 0,
        "percentage_used": 150,
        "alerts": [
          {
            "id": 2,
            "threshold_percentage": 100,
            "alert_type": "danger",
            "is_triggered": true
          }
        ]
      }
    ]
  }
}
```

### Response Fields — `data`

| Field                | Type    | Keterangan                                          |
| -------------------- | ------- | --------------------------------------------------- |
| `total_budget`       | integer | Jumlah limit seluruh budget aktif                   |
| `total_spent`        | integer | Total pengeluaran seluruh budget aktif              |
| `total_remaining`    | integer | `total_budget - total_spent`                        |
| `overall_percentage` | float   | Persentase keseluruhan (0–100)                      |
| `alert_budgets`      | array   | Budget yang memiliki alert terpicu (warning/danger) |

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
  "message": "Budget tidak ditemukan",
  "data": []
}
```

### 422 Validation Error

```json
{
  "success": false,
  "message": "Akun harus bertipe pengeluaran (expense)",
  "errors": {
    "account_id": ["Akun harus bertipe pengeluaran (expense)"]
  }
}
```

Pesan error yang mungkin muncul:

| Pesan                                                                 | Penyebab                                                |
| --------------------------------------------------------------------- | ------------------------------------------------------- |
| `Akun wajib dipilih`                                                  | `account_id` tidak diisi saat create                    |
| `Akun tidak ditemukan`                                                | `account_id` tidak valid                                |
| `Akun harus bertipe pengeluaran (expense)`                            | `account_id` bukan akun expense                         |
| `Akun "{name}" memiliki sub-akun. Pilih sub-akun yang lebih spesifik` | `account_id` adalah parent account (punya children)     |
| `Nama budget wajib diisi`                                             | `name` tidak diisi                                      |
| `Nama budget maksimal 255 karakter`                                   | `name` lebih dari 255 karakter                          |
| `Jumlah anggaran wajib diisi`                                         | `amount` tidak diisi                                    |
| `Jumlah anggaran harus berupa angka`                                  | `amount` bukan integer                                  |
| `Jumlah anggaran minimal 1`                                           | `amount` < 1                                            |
| `Tipe periode wajib dipilih`                                          | `period_type` tidak diisi                               |
| `Tipe periode harus monthly, yearly, atau custom`                     | `period_type` tidak valid                               |
| `Tanggal mulai wajib diisi`                                           | `start_date` tidak diisi                                |
| `Tanggal mulai tidak valid`                                           | `start_date` bukan tanggal valid                        |
| `Tanggal akhir wajib diisi`                                           | `end_date` tidak diisi                                  |
| `Tanggal akhir tidak valid`                                           | `end_date` bukan tanggal valid                          |
| `Tanggal akhir harus setelah tanggal mulai`                           | `end_date` ≤ `start_date`                               |
| `Sudah ada budget aktif untuk akun ini pada periode yang beririsan`   | Periode overlap dengan budget lain untuk akun yang sama |
| `Ulangi harus berupa boolean`                                         | `repeat` bukan boolean                                  |

---

## Tabel Ringkasan Endpoint

| Method   | Endpoint           | Deskripsi                    | Auth         |
| -------- | ------------------ | ---------------------------- | ------------ |
| `GET`    | `/budgets`         | Daftar budget                | Bearer Token |
| `POST`   | `/budgets`         | Buat budget baru             | Bearer Token |
| `GET`    | `/budgets/{id}`    | Detail budget                | Bearer Token |
| `PUT`    | `/budgets/{id}`    | Update budget                | Bearer Token |
| `DELETE` | `/budgets/{id}`    | Hapus budget                 | Bearer Token |
| `GET`    | `/budgets/summary` | Ringkasan semua budget aktif | Bearer Token |

---

## Catatan Implementasi

- **Leaf Account**: Budget hanya bisa dibuat untuk akun expense leaf (tanpa child). Akun parent (yang memiliki sub-akun) ditolak. Arahkan user memilih sub-akun spesifik, misal "Bensin" bukan "Transportasi".
- **Overlap Periode**: Tidak boleh ada dua budget aktif untuk akun yang sama pada periode yang beririsan. Cek overlap dilakukan saat create dan update.
- **Spent Real-time**: Nilai `spent` dihitung setiap kali endpoint diakses dari `transaction_entries` pada akun & periode budget — tidak ada kolom cache.
- **Alert Threshold**: Sistem memeriksa dua threshold:
  - ≥80% → `budget_alerts` dengan `alert_type = "warning"`
  - ≥100% → `budget_alerts` dengan `alert_type = "danger"`
- **Anti-duplikasi Alert**: Jika sudah ada alert dengan `threshold_percentage` dan `alert_type` yang sama pada budget yang sama yang masih terpicu (`is_triggered = true`), tidak dibuat duplikat.
- **Rollover Otomatis**: Budget dengan `repeat = true` akan otomatis membuat record baru untuk periode berikutnya ketika `end_date` sudah lewat. Tidak berlaku untuk `period_type = custom`.
- **Integer Nominal**: Semua nominal (`amount`, `spent`, `remaining`) disimpan dan dikembalikan sebagai integer (rupiah bulat). Tidak menggunakan float/decimal.
- **Autorisasi**: User hanya bisa mengakses budget miliknya sendiri. Endpoint mengembalikan `404` (bukan `403`) untuk budget milik user lain, untuk menghindari informasi ID yang valid.
