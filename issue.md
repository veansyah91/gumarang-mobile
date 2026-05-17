# Perbaiki gap bawah di tab footer

**Ringkasan:** Ada jarak kecil antara konten halaman dan komponen tab menu di bagian bawah. Hilangkan gap tersebut tanpa merusak safe-area atau tampilan tab bar.

**Rencana tingkat tinggi**

1. Audit sumber padding/margin bawah pada layar tab (mis. `Screen`/`ScrollView`, safe area, dan `tabBarStyle`) serta layar yang menampilkan `Footer`.
2. Hilangkan penyebab gap (termasuk hack margin/padding negatif jika ada) dan rapikan pengaturan spacing bawah agar konten berhenti tepat di atas tab bar.
3. Cek ulang di beberapa tab yang menampilkan `Footer` untuk memastikan tidak ada jarak kosong dan tab bar tetap aman terhadap safe-area.

**Kriteria selesai**

1. Tidak ada gap kosong antara konten terakhir dan tab bar.
2. Tab bar tetap terlihat normal dan tidak overlap dengan konten.
