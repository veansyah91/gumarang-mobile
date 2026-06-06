# Planning: Konfigurasi App Links

**Tujuan:**
Menambahkan dukungan deep linking/App Links agar aplikasi dapat langsung membuka tautan dari domain `tokomasgumarang.com`.

**Langkah Implementasi:**
1. Temukan file manifest aplikasi Android (`AndroidManifest.xml`).
2. Identifikasi Activity utama yang akan bertugas menangani tautan dari luar.
3. Tambahkan konfigurasi `<intent-filter>` berikut ke dalam tag `<activity>` tersebut untuk mendaftarkan domain `tokomasgumarang.com` dengan skema `http` dan `https`.

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />

    <data android:scheme="http" />
    <data android:scheme="https" />
    <data android:host="tokomasgumarang.com" />
</intent-filter>
```

Pastikan tag XML tertutup dengan benar dan tidak merusak konfigurasi yang sudah ada.