# Issue: Fitur Sale Transaction Member (Riwayat Penjualan Emas)

## Overview

Tambahkan fitur **Riwayat Penjualan Emas** untuk member, mengikuti pola yang sudah ada di fitur `purchase-transaction-member`.

---

## 1. Type Definitions

Di `src/types/member.ts`, tambahkan tipe data untuk sale transaction:

- `SaleInvoice` — id, no_ref, user_id, value, date
- `SaleInvoiceDetail` — id, no_ref, date, value, products[]
- `SaleProduct` — id, name, code, unit, weight, qty, amount, price
- Response types untuk list (dengan pagination + total) dan detail

---

## 2. API Layer

Di `src/services/api/member.ts`, tambahkan dua fungsi:

- `getSaleTransactionMembers(filters)` → `GET /api/v1/member/sale-transaction-member`
  - Filter: `page`, `query`, `start_date`, `end_date`
- `getSaleTransactionMember(id)` → `GET /api/v1/member/sale-transaction-member/{id}`

---

## 3. Komponen UI

Buat dua komponen baru dengan menggunakan `member-purchase-transaction-list.tsx` dan `member-purchase-transaction-detail.tsx` sebagai template:

### `src/components/member-sale-transaction-list.tsx`

- Search input (debounce ~400ms) berdasarkan `no_ref` atau nama
- Filter tanggal (start_date / end_date) via modal
- List item menampilkan: `no_ref`, tanggal, nilai (Rp)
- Tap item navigasi ke `/(app)/sale-member/[id]`
- Pagination

### `src/components/member-sale-transaction-detail.tsx`

- Header: no invoice, tanggal, total nilai
- List produk: nama produk, berat, qty, nilai
- Handle error 403 (invoice tidak ditemukan / bukan milik user)

---

## 4. Halaman (Screens)

Buat dua screen mengikuti struktur `app/(app)/purchase-member`:

- `app/(app)/sale-member.tsx` — wrap list component
- `app/(app)/sale-member/[id].tsx` — wrap detail component, baca `id` dari `useLocalSearchParams()`

---

## 5. Router

Di `app/(app)/_layout.tsx`, daftarkan dua route baru pada Stack:

- `sale-member` → title: `"Riwayat Penjualan Emas"`
- `sale-member/[id]` → title: `"Detail Penjualan Emas"`

---

## 6. Navigasi / Entry Point

Tambahkan tombol / menu masuk ke halaman `sale-member` dari halaman member utama (sejajarkan dengan entri "Riwayat Pembelian Emas").

---

## 7. Testing

- Pastikan list tampil dan filter (query, tanggal) berjalan
- Pastikan navigasi ke detail berfungsi
- Pastikan data detail (produk, berat, qty, nilai) tampil benar
- Cek handling error 401 dan 403
