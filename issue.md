# Fitur: Saving Detail Member (Riwayat Mutasi Simpanan)

## Tujuan
Menampilkan riwayat mutasi simpanan emas milik member, lengkap dengan filter tanggal, tipe transaksi, dan pilihan akun simpanan.

---

## Referensi Template UI
Gunakan `member-saving-detail-list.tsx` (pola `Subnav`, filter modal, pagination, search) sebagai referensi struktur komponen.

---

## 1. Type Definitions (`src/types/member.ts`)

Tambah tipe baru untuk fitur ini:

- **`SavingDetailItem`** — item per transaksi:
  - `id`, `no_ref`, `date`, `type` (`"debit" | "credit"`), `amount` (string), `balance` (string), `description`, `qty`
  - `user_saving`: `{ id, no_ref, weight, value, value_per_unit, product_category: { id, name } }`

- **`SavingDetailListFilters`** — parameter query:
  - `page`, `query`, `start_date`, `end_date`, `type` (`"debit" | "credit" | ""`), `userSaving` (id saving)

- **`SavingDetailListResponse`** — wrapper response pagination (gunakan pola `links` + `meta` yang sudah ada di codebase)

---

## 2. API Service (`src/services/api/member.ts`)

Tambah fungsi baru:

- **`getSavingDetails(filters: SavingDetailListFilters)`**
  - `GET /api/v1/member/saving-details`
  - Query params: `startDate`, `endDate`, `type`, `query`, `userSaving`, `page`

---

## 3. Komponen List (`src/components/member-saving-detail-list.tsx`)

Komponen utama halaman. Ikuti pola `member-saving-detail-list.tsx` yang sudah ada:

### Filter
- Filter modal berisi:
  - Input tanggal: `start_date` dan `end_date`
  - Select saving: list dari `memberApi.getSavingMembers()` → tampilkan `no_ref` + `product_category.name`
  - Select tipe: pilihan `Semua`, `Debit`, `Credit`
- Gunakan pola `filterDraft` (state sementara di modal, apply saat submit)

### Card Item
Tiap item tampil sebagai card dua baris:

```
| [tanggal + jam]              [amount] gram |
| [no_ref]                                   |
|         [DEBIT / CREDIT badge]             |
```

- Badge tipe: background **merah** untuk `debit`, **hijau** untuk `credit`, teks putih
- Format amount: angka desimal + " gram"
- Format tanggal: `DD MMM YYYY, HH:mm:ss`

### State & Fitur
- Search query (debounce 400ms)
- Pagination (page state, tampil di Subnav)
- Pull-to-refresh
- Loading skeleton, empty state, error state

---

## 4. Screen (`app/(app)/saving-detail-member.tsx`)

Screen wrapper sederhana, ikuti pola `saving-member.tsx`:
- Ambil `user` dari `useAuth()`
- Render `<MemberSavingDetailList />`

---

## 5. Testing

- Filter modal terbuka dan tertutup dengan benar
- Filter tanggal, tipe, dan saving bekerja (request API berubah sesuai filter)
- Badge warna tampil sesuai tipe transaksi
- Pagination berfungsi
- Pull-to-refresh berfungsi
- State loading/error/empty tampil dengan benar
