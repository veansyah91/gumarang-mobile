# Contact API

API untuk mengelola kontak utang/piutang milik member.

Base URL: `https://api.gumarang.local/api/v1/member`

## Authentication

Semua endpoint memerlukan **Bearer Token** via Sanctum.

```text
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## 1. List Contacts

Mengembalikan daftar kontak milik member yang sudah login.

**Endpoint**

```text
GET /api/v1/member/contacts
```

### Query Parameters

| Parameter          | Tipe    | Default | Keterangan                                  |
| ------------------ | ------- | ------- | ------------------------------------------- |
| `query` / `search` | string  | —       | Cari berdasarkan `name` atau `phone` (LIKE) |
| `perPage`          | integer | 15      | Jumlah item per halaman                     |

### Response (200 OK)

```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "name": "Budi Santoso",
      "phone": "08123456789",
      "notes": "Teman kantor",
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

Order: `asc` by `name`

---

## 2. Create Contact

Membuat kontak baru.

**Endpoint**

```text
POST /api/v1/member/contacts
```

### Request Body

```json
{
  "name": "Budi Santoso",
  "phone": "08123456789",
  "notes": "Teman kantor"
}
```

### Request Fields

| Field   | Type   | Required | Keterangan    |
| ------- | ------ | -------- | ------------- |
| `name`  | string | Yes      | Nama kontak   |
| `phone` | string | No       | Nomor telepon |
| `notes` | string | No       | Catatan       |

### Response (201 Created)

```json
{
  "success": true,
  "message": "Kontak berhasil dibuat",
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "Budi Santoso",
    "phone": "08123456789",
    "notes": "Teman kantor",
    "created_at": "2026-07-30T10:00:00.000000Z",
    "updated_at": "2026-07-30T10:00:00.000000Z"
  }
}
```

---

## 3. Show Contact Detail

Menampilkan detail kontak.

**Endpoint**

```text
GET /api/v1/member/contacts/{id}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "Budi Santoso",
    "phone": "08123456789",
    "notes": "Teman kantor",
    "created_at": "2026-07-30T10:00:00.000000Z",
    "updated_at": "2026-07-30T10:00:00.000000Z"
  }
}
```

### Response (404 Not Found)

```json
{
  "success": false,
  "message": "Kontak tidak ditemukan",
  "data": []
}
```

---

## 4. Update Contact

Memperbarui kontak yang sudah ada.

**Endpoint**

```text
PUT /api/v1/member/contacts/{id}
```

### Request Body

```json
{
  "name": "Budi Santoso Update",
  "phone": "08123456780"
}
```

### Request Fields

| Field   | Type   | Required       | Keterangan    |
| ------- | ------ | -------------- | ------------- |
| `name`  | string | No (sometimes) | Nama kontak   |
| `phone` | string | No             | Nomor telepon |
| `notes` | string | No             | Catatan       |

### Response (200 OK)

```json
{
  "success": true,
  "message": "Kontak berhasil diperbarui",
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "Budi Santoso Update",
    "phone": "08123456780",
    "notes": "Teman kantor",
    "created_at": "2026-07-30T10:00:00.000000Z",
    "updated_at": "2026-07-30T11:00:00.000000Z"
  }
}
```

---

## 5. Delete Contact

Menghapus kontak.

**Endpoint**

```text
DELETE /api/v1/member/contacts/{id}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Kontak berhasil dihapus",
  "data": []
}
```

### Response (404 Not Found)

```json
{
  "success": false,
  "message": "Kontak tidak ditemukan",
  "data": []
}
```

---

## Tabel Ringkasan Endpoint

| Method   | Endpoint         | Deskripsi        | Auth         |
| -------- | ---------------- | ---------------- | ------------ |
| `GET`    | `/contacts`      | Daftar kontak    | Bearer Token |
| `POST`   | `/contacts`      | Buat kontak baru | Bearer Token |
| `GET`    | `/contacts/{id}` | Detail kontak    | Bearer Token |
| `PUT`    | `/contacts/{id}` | Update kontak    | Bearer Token |
| `DELETE` | `/contacts/{id}` | Hapus kontak     | Bearer Token |
