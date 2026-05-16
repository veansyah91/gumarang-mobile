# Mobile API Documentation

Base URL: `https://api.gumarang.local/api/v1/member`

## Authentication

Semua endpoint memerlukan **Bearer Token** via Sanctum.

```
Authorization: Bearer {token}
Content-Type: application/json
```

Token diperoleh setelah login melalui endpoint `/api/v1/auth/login`.

---

## Endpoints

### 1. Get Sale Invoices

Menampilkan daftar invoice penjualan milik user.

**Endpoint:**
```
GET /api/v1/member/sale-invoices
```

**Query Parameters:**
| Parameter | Type    | Required | Default | Keterangan |
|-----------|---------|----------|---------|-----------|
| `limit`   | integer | No       | 10      | Jumlah data per halaman |
| `page`    | integer | No       | 1       | Nomor halaman |
| `sort`    | string  | No       | `-created_at` | Sorting: `created_at`, `-created_at`, `total`, `-total` |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "invoice_number": "INV-2026-001",
      "total": 5000000,
      "total_weight": 10.5,
      "status": "paid",
      "created_at": "2026-05-14T10:30:00Z",
      "items": [
        {
          "product_name": "Gold Bar 1g",
          "quantity": 5,
          "weight": 5,
          "price": 1000000
        }
      ]
    }
  ],
  "pagination": {
    "total": 50,
    "per_page": 10,
    "current_page": 1,
    "last_page": 5
  }
}
```

---

### 2. Get Purchase Invoices

Menampilkan daftar invoice pembelian milik user.

**Endpoint:**
```
GET /api/v1/member/purchase-invoices
```

**Query Parameters:**
| Parameter | Type    | Required | Default | Keterangan |
|-----------|---------|----------|---------|-----------|
| `limit`   | integer | No       | 10      | Jumlah data per halaman |
| `page`    | integer | No       | 1       | Nomor halaman |
| `sort`    | string  | No       | `-created_at` | Sorting: `created_at`, `-created_at`, `total`, `-total` |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "invoice_number": "PUR-2026-001",
      "total": 4500000,
      "total_weight": 9.5,
      "status": "completed",
      "created_at": "2026-05-10T14:20:00Z",
      "items": [
        {
          "product_name": "Gold Bar 1g",
          "quantity": 5,
          "weight": 5,
          "price": 900000
        }
      ]
    }
  ],
  "pagination": {
    "total": 30,
    "per_page": 10,
    "current_page": 1,
    "last_page": 3
  }
}
```

---

### 3. Get Product Weight

Total berat produk yang dimiliki user saat ini.

**Endpoint:**
```
GET /api/v1/member/product-weight
```

**Response (200 OK):**
```json
{
  "data": {
    "total_weight": 45.75,
    "currency": "IDR",
    "breakdown": [
      {
        "product_name": "Gold Bar 1g",
        "quantity": 10,
        "weight_per_unit": 1.0,
        "total_weight": 10.0,
        "current_price_per_gram": 650000
      },
      {
        "product_name": "Gold Jewelry 5g",
        "quantity": 3,
        "weight_per_unit": 5.0,
        "total_weight": 15.0,
        "current_price_per_gram": 650000
      }
    ]
  }
}
```

---

### 4. Get Saving Weight

Total berat tabungan emas yang disimpan.

**Endpoint:**
```
GET /api/v1/member/saving-weight
```

**Response (200 OK):**
```json
{
  "data": {
    "total_weight": 25.5,
    "total_value_idr": 16575000,
    "current_price_per_gram": 650000,
    "last_updated": "2026-05-14T10:30:00Z"
  }
}
```

---

### 5. Get Deposits

Menampilkan riwayat setoran tabungan emas.

**Endpoint:**
```
GET /api/v1/member/deposits
```

**Query Parameters:**
| Parameter | Type    | Required | Default | Keterangan |
|-----------|---------|----------|---------|-----------|
| `limit`   | integer | No       | 10      | Jumlah data per halaman |
| `page`    | integer | No       | 1       | Nomor halaman |
| `sort`    | string  | No       | `-created_at` | Sorting: `created_at`, `-created_at` |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "reference_number": "DEP-2026-001",
      "weight": 5.0,
      "value_idr": 3250000,
      "description": "Tabungan emas harian",
      "created_at": "2026-05-14T08:00:00Z"
    },
    {
      "id": 2,
      "reference_number": "DEP-2026-002",
      "weight": 2.5,
      "value_idr": 1625000,
      "description": "Tabungan emas dari penjualan",
      "created_at": "2026-05-13T15:30:00Z"
    }
  ],
  "pagination": {
    "total": 120,
    "per_page": 10,
    "current_page": 1,
    "last_page": 12
  }
}
```

---

### 6. Get Withdraws

Menampilkan riwayat penarikan tabungan emas.

**Endpoint:**
```
GET /api/v1/member/withdraws
```

**Query Parameters:**
| Parameter | Type    | Required | Default | Keterangan |
|-----------|---------|----------|---------|-----------|
| `limit`   | integer | No       | 10      | Jumlah data per halaman |
| `page`    | integer | No       | 1       | Nomor halaman |
| `sort`    | string  | No       | `-created_at` | Sorting: `created_at`, `-created_at` |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "reference_number": "WD-2026-001",
      "weight": 1.5,
      "value_idr": 975000,
      "reason": "Kebutuhan mendesak",
      "status": "completed",
      "created_at": "2026-05-12T10:00:00Z"
    },
    {
      "id": 2,
      "reference_number": "WD-2026-002",
      "weight": 0.5,
      "value_idr": 325000,
      "reason": "Konversi ke emas batangan",
      "status": "completed",
      "created_at": "2026-05-10T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "per_page": 10,
    "current_page": 1,
    "last_page": 5
  }
}
```

---

### 7. Get Profit

Menampilkan profit/keuntungan user dan riwayatnya.

**Endpoint:**
```
GET /api/v1/member/profit
```

**Query Parameters:**
| Parameter  | Type    | Required | Default | Keterangan |
|-----------|---------|----------|---------|-----------|
| `limit`   | integer | No       | 10      | Jumlah riwayat per halaman |
| `page`    | integer | No       | 1       | Nomor halaman |

**Response (200 OK):**
```json
{
  "data": {
    "total_profit": 5250000,
    "total_profit_weight": 8.08,
    "currency": "IDR",
    "summary": {
      "from_sale": 3000000,
      "from_conversion": 2250000
    },
    "history": [
      {
        "id": 1,
        "type": "sale",
        "amount": 1500000,
        "weight": 2.31,
        "description": "Keuntungan dari penjualan emas",
        "reference": "INV-2026-050",
        "created_at": "2026-05-14T09:00:00Z"
      },
      {
        "id": 2,
        "type": "conversion",
        "amount": 750000,
        "weight": 1.15,
        "description": "Keuntungan dari konversi emas",
        "reference": "CONV-2026-001",
        "created_at": "2026-05-13T11:30:00Z"
      }
    ],
    "pagination": {
      "total": 85,
      "per_page": 10,
      "current_page": 1,
      "last_page": 9
    }
  }
}
```

---

## Error Response

### 400 Bad Request
```json
{
  "message": "Validation failed",
  "errors": {
    "limit": ["The limit field must be a number."]
  }
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthenticated."
}
```

### 403 Forbidden
```json
{
  "message": "Unauthorized access"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "message": "Too many requests. Please slow down."
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | OK - Request berhasil |
| 400  | Bad Request - Input tidak valid |
| 401  | Unauthorized - Token tidak valid/expired |
| 403  | Forbidden - Akses ditolak |
| 404  | Not Found - Resource tidak ditemukan |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error - Error server |

---

## Common Headers

**Request:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

**Response:**
```
Content-Type: application/json
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1631622000
```

---

## Example Usage (cURL)

### Get Sale Invoices
```bash
curl -X GET "https://api.gumarang.local/api/v1/member/sale-invoices?limit=10&page=1" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json"
```

### Get Product Weight
```bash
curl -X GET "https://api.gumarang.local/api/v1/member/product-weight" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json"
```

### Get Deposits with Pagination
```bash
curl -X GET "https://api.gumarang.local/api/v1/member/deposits?limit=5&page=2&sort=-created_at" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json"
```

---

## Notes

- Semua response berupa JSON
- Waktu menggunakan format ISO 8601 (UTC)
- Nilai mata uang dalam **IDR** (Rupiah Indonesia)
- Berat dalam **gram**
- Rate limit: 60 requests per menit per user
- Cache TTL: 5-15 menit untuk data statis
