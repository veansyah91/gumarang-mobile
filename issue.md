# Add "Tambah akun baru" in account search dropdown when no results found

## Summary

Pada semua form yang menggunakan pencarian akun (kas/non-kas), ketika hasil pencarian kosong, tampilkan link/button "Tambah akun baru" di dalam dropdown. Link ini membuka modal `CoaFormModal` untuk membuat akun baru. Setelah akun berhasil dibuat, otomatis isi field pencarian dan pilih akun yang baru dibuat.

## Fitur yang perlu dimodifikasi (9 form)

| # | Fitur | File Form |
|---|-------|-----------|
| 1 | Aset Tetap | `src/components/fixed-asset-form-modal.tsx` |
| 2 | Investasi | `src/components/investment-form-modal.tsx` |
| 3 | Kas Masuk | `app/(app)/personal-finance/cash-in/create.tsx` |
| 4 | Kas Masuk (detail rows) | `src/components/cash-in-form.tsx` |
| 5 | Kas Keluar | `app/(app)/personal-finance/cash-out/create.tsx` |
| 6 | Kas Keluar (detail rows) | `src/components/cash-out-form.tsx` |
| 7 | Budget | `src/components/budget-form.tsx` |
| 8 | Daftar Utang | `app/(app)/personal-finance/debt/payable/create.tsx` |
| 9 | Daftar Utang (edit) | `app/(app)/personal-finance/debt/payable/[id]/edit.tsx` |
| 10 | Pembayaran Utang | `app/(app)/personal-finance/debt/payable-entry/index.tsx` |
| 11 | Daftar Piutang | `app/(app)/personal-finance/debt/receivable/create.tsx` |
| 12 | Daftar Piutang (edit) | `app/(app)/personal-finance/debt/receivable/[id]/edit.tsx` |
| 13 | Pembayaran Piutang | `app/(app)/personal-finance/debt/receivable-entry/index.tsx` |

## Approach

### Buat komponen baru: `account-search-select.tsx`

Buat file `src/components/ui/account-search-select.tsx` sebagai wrapper di atas `SearchableSelect` + `CoaFormModal`.

Komponen ini menerima props:
- Semua props yang diperlukan `SearchableSelect` (label, value, onChange, options, searchText, onSearchChange, loading)
- Props untuk filter akun: `type`, `assetCategory`, `hasParent`, `isCash` (parameter yang diteruskan ke `useSelectableAccounts`)
- Props untuk filter default `CoaFormModal`: `defaultAccountType`, `defaultAssetType` (opsional, agar form create akun sudah terisi type yang sesuai)

Perilaku:
- Render `SearchableSelect` seperti biasa
- Saat `options.length === 0 && searchText.length > 0 && !loading`, tampilkan tambahan di bawah teks "Tidak ada hasil" berupa:
  ```
  Tidak ada hasil
  [+ Tambah akun baru]   <-- Pressable, membuka CoaFormModal
  ```
- Saat `CoaFormModal` di-submit, panggil `mutateAsync`, lalu:
  - Invalidate query `useSelectableAccounts` (gunakan `queryClient.invalidateQueries`) 
  - Set `searchText` ke nama akun baru
  - Set `value` ke ID akun baru
  - Tutup modal

### Modifikasi tiap form

Di setiap form yang disebutkan di atas, ganti pemakaian `SearchableSelect` untuk pencarian akun dengan `AccountSearchSelect`. Pindahkan logic debounce, `useSelectableAccounts`, dan mapping `accounts → SelectOption[]` ke dalam komponen baru.

Contoh transformasi di form:

**Before:**
```tsx
const [searchText, setSearchText] = useState('');
const debouncedSearch = useDebouncedValue(searchText, 400);
const { data: accounts, isFetching } = useSelectableAccounts('asset', debouncedSearch, 'current', true, true);
const options = accounts?.map(a => ({ label: a.name, value: a.id })) ?? [];

<SearchableSelect label="Kas" value={cashAccountId} options={options} onChange={setCashAccountId} searchText={searchText} onSearchChange={setSearchText} loading={isFetching} />
```

**After:**
```tsx
<AccountSearchSelect label="Kas" value={cashAccountId} onChange={setCashAccountId} type="asset" assetCategory="current" hasParent={true} isCash={true} defaultAccountType="asset" defaultAssetType="current" />
```

### Available types untuk mapping

- **Cash account (Kas):** type=`asset`, assetCategory=`current`, hasParent=`true`, isCash=`true`
- **Non-cash account (detail rows):** type=undefined/`expense`/`liability`/`asset`, assetCategory=undefined, hasParent=`true`, isCash=`false`
- Tergantung konteks form, parameter disesuaikan
- `defaultAccountType` dan `defaultAssetType` diisi sesuai filter yang dipakai (agar `CoaFormModal` langsung terisi type yang masuk akal)

## UI mock

```
┌─────────────────────────┐
│ Kas                     │
│ [xxx____________]       │  <-- user mengetik
├─────────────────────────┤
│ Tidak ada hasil         │
│ [+ Tambah akun baru]    │  <-- link Pressable
└─────────────────────────┘
```

## Catatan

- Gunakan `queryClient` dari `@tanstack/react-query` untuk invalidate query setelah create akun sukses
- Gunakan `toAppError` untuk error handling di submit handler
- Pastikan `SearchableSelect` tetap berfungsi normal untuk penggunaan non-akun (jika ada)
- Style link "Tambah akun baru" gunakan `colors.primary`, padding standar `spacing.sm`/`spacing.md`
