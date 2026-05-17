# Mobile API: Gold List Member

## Endpoint

`GET /api/v1/member/lists`

## Auth

Gunakan `Authorization: Bearer <token>` dengan token Sanctum milik member.

## Response sukses

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "member": {
      "id": 1,
      "name": "Member Name",
      "email": "member@example.com",
      "phone": "08123456789"
    },
    "products": [
      {
        "id": 10,
        "name": "Emas Batangan",
        "code": "PRD-0001",
        "unit": "gram",
        "weight": 1,
        "price": 2500000,
        "qty": 1,
        "amount": 2500000
      }
    ],
    "price_list": {
      "gram": {
        "purchaseValue": 2400000,
        "saleValue": 2500000
      },
      "miligram": {
        "purchaseValue": 2400,
        "saleValue": 2500
      }
    }
  }
}
```

## Catatan

- `products` mengikuti relasi emas milik member yang sama dengan halaman web `my-gold/lists`.
- Jika member belum punya produk, `products` akan berisi array kosong.
- Struktur response tetap memakai `success`, `message`, dan `data`.
