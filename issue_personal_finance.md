# Issue: Personal Finance — Update Debt & Debt Entry API Endpoints

## Ringkasan

Perbarui seluruh akses endpoint API untuk modul debt dan debt-entry di `src/services/api/debt.ts` agar sesuai dengan spesifikasi di `docs/debt.md` dan `docs/debt-entry.md`. Endpoint yang sebelumnya menggunakan prefix `/v1/member/debts` dan `/v1/member/debt-entries` harus dipindahkan ke prefix `/v1/member/personal-finance/debts` dan `/v1/member/personal-finance/debt-entries`.

Selain itu, tambahkan endpoint baru `GET /debts/search` yang belum ada di kode saat ini.

## File yang perlu diubah

### 1. `src/services/api/debt.ts` — Perbarui seluruh path endpoint

Ubah semua path endpoint dari prefix `/v1/member/` menjadi prefix `/v1/member/personal-finance/`.

**Debt CRUD** (5 endpoint):
| Metode | Path Lama | Path Baru |
|--------|-----------|-----------|
| GET | `/v1/member/debts` | `/v1/member/personal-finance/debts` |
| GET | `/v1/member/debts/{id}` | `/v1/member/personal-finance/debts/{id}` |
| POST | `/v1/member/debts` | `/v1/member/personal-finance/debts` |
| PUT | `/v1/member/debts/{id}` | `/v1/member/personal-finance/debts/{id}` |
| DELETE | `/v1/member/debts/{id}` | `/v1/member/personal-finance/debts/{id}` |

**Debt Entry CRUD** (5 endpoint):
| Metode | Path Lama | Path Baru |
|--------|-----------|-----------|
| GET | `/v1/member/debts/{debtId}/entries` | `/v1/member/personal-finance/debts/{debtId}/entries` |
| GET | `/v1/member/debts/{debtId}/entries/{id}` | `/v1/member/personal-finance/debts/{debtId}/entries/{id}` |
| POST | `/v1/member/debt-entries` | `/v1/member/personal-finance/debt-entries` |
| PUT | `/v1/member/debts/{debtId}/entries/{id}` | `/v1/member/personal-finance/debts/{debtId}/entries/{id}` |
| DELETE | `/v1/member/debts/{debtId}/entries/{id}` | `/v1/member/personal-finance/debts/{debtId}/entries/{id}` |

### 2. `src/services/api/debt.ts` — Tambah endpoint baru: searchDebts

Tambahkan fungsi baru `searchDebts` untuk endpoint `GET /v1/member/personal-finance/debts/search`.

**Endpoint** (dari `docs/debt.md` section 2):
```
GET /personal-finance/debts/search
```

**Query params:** `query`, `type`, `perPage`

**Catatan:** Endpoint ini otomatis memfilter `status != 'paid'` (hanya mengembalikan debt yang belum lunas). Response menyertakan nested `contact` object.

Tambahkan fungsi API yang mengkonsumsinya. (Nama bebas, misal: `searchDebts` atau `getUnpaidDebts`.)

### 3. `src/hooks/use-debt.ts` — Tambah hook untuk endpoint baru

Tambahkan React Query hook untuk endpoint search debts yang baru. Tambahkan juga query key baru untuk search debt.

### 4. `src/types/debt.ts` — Tambah tipe jika diperlukan

Tambahkan tipe TypeScript untuk response search debts (jika berbeda dari `DebtItem` — response search menyertakan nested `contact` object). Tambahkan params type untuk search.

## Detail Teknis

- Format request/response body untuk create, update, delete **tidak berubah** — hanya path endpoint yang berubah.
- API base URL sudah ditangani oleh `apiClient` (`src/services/api/client.ts`), jadi endpoint di kode menggunakan path relatif tanpa prefix `/api`.
- Tidak ada perubahan di file UI (`app/` dan `src/components/`), karena UI hanya memanggil hooks yang sudah ada.

## Verifikasi

Setelah perubahan, jalankan:
```
npm run typecheck
npm run lint
```
