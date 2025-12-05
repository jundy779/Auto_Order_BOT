# 📋 Panduan Setup OrderKuota untuk Bot Telegram

## 🔧 Konfigurasi .env

Tambahkan variabel berikut ke file `.env`:

```env
# OrderKuota Payment Gateway
ORDERKUOTA_BASE_QR_STRING=00020101021226690014ID.CO.QRIS.WWW01189360091311520010303120123456789040415ID10203040506070809051003UME51440014ID.CO.BANK90203123456303201234567890503...
ORDERKUOTA_AUTH_USERNAME=your_username
ORDERKUOTA_AUTH_TOKEN=your_auth_token
ORDERKUOTA_STORE_NAME=BOT AUTO ORDER
ORDERKUOTA_LOGO_PATH=./assets/logo.png
ORDERKUOTA_THEME=theme1
```

## 📝 Penjelasan Variabel

### 1. ORDERKUOTA_BASE_QR_STRING (WAJIB)
**Base QRIS string dari QRIS yang kamu miliki.**

**Cara mendapatkan:**
1. Siapkan gambar QRIS yang kamu miliki
2. Buka situs: https://www.imagetotext.info/qr-code-scanner
3. Upload gambar QRIS ke situs tersebut
4. Tunggu hingga proses scan selesai
5. Salin hasil **output QR string** yang muncul
6. Gunakan hasil tersebut sebagai nilai `ORDERKUOTA_BASE_QR_STRING`

**Contoh format:**
```
00020101021226690014ID.CO.QRIS.WWW01189360091311520010303120123456789040415ID10203040506070809051003UME51440014ID.CO.BANK90203123456303201234567890503...
```

### 2. ORDERKUOTA_AUTH_USERNAME (WAJIB)
**Username autentikasi untuk API OrderKuota.**

**Cara mendapatkan:**
1. Buka bot Telegram: @TokenOrkutBot
2. Login: `/login username password`
3. Verifikasi OTP: `/otp kode_otp`
4. Bot akan menampilkan `auth_username` setelah login berhasil

### 3. ORDERKUOTA_AUTH_TOKEN (WAJIB)
**Token autentikasi untuk API OrderKuota.**

**Cara mendapatkan:**
1. Buka bot Telegram: @TokenOrkutBot
2. Login: `/login username password`
3. Verifikasi OTP: `/otp kode_otp`
4. Bot akan menampilkan `auth_token` setelah login berhasil

> ⚠️ **Penting:** Token akan expired setelah 1 jam. Login ulang jika diperlukan.

### 4. ORDERKUOTA_STORE_NAME (OPSIONAL)
**Nama toko yang akan ditampilkan di QRIS dan receipt.**

Default: `BOT AUTO ORDER`

### 5. ORDERKUOTA_LOGO_PATH (OPSIONAL)
**Path ke file logo yang akan ditampilkan di tengah QR code.**

**Lokasi folder:**
- **Rekomendasi:** Buat folder `assets` di root project, lalu taruh logo di sana
- **Contoh path:** `./assets/logo.png` atau `./assets/logo.jpg`
- **Alternatif:** Bisa juga langsung di root: `./logo.png`

**Cara setup:**
1. Buat folder `assets` di root project (sama level dengan `bot.js`)
2. Taruh file logo di folder `assets` (contoh: `logo.png`)
3. Set di `.env`: `ORDERKUOTA_LOGO_PATH=./assets/logo.png`

**Struktur folder yang direkomendasikan:**
```
BOT-AUTO/
├── bot.js
├── assets/
│   └── logo.png          ← Taruh logo di sini
├── models/
├── package.json
└── .env
```

> 💡 **Tips:** 
> - Gunakan logo dengan ukuran kecil (max 200x200px) untuk hasil terbaik
> - Format yang didukung: PNG, JPG, JPEG
> - Jika tidak ada logo, kosongkan variabel ini atau tidak perlu set

### 6. ORDERKUOTA_THEME (OPSIONAL)
**Tema QRIS yang akan digunakan.**

Pilihan:
- `theme1` (Default) - QRIS dengan aksen warna biru
- `theme2` (Meta Style) - QRIS dengan aksen warna hijau

Default: `theme1`

## ✅ Fitur yang Sudah Ditambahkan

### 1. Generate QRIS OrderKuota
- Bot otomatis generate QRIS dengan nominal sesuai transaksi
- Support 2 tema (biru & hijau)
- Support custom logo di tengah QR
- Format QRIS standar Indonesia

### 2. Auto-Polling Status Check (REALTIME) ⚡
- **Bot otomatis cek status pembayaran setiap 30 detik**
- Cek transaksi yang masih PENDING (maksimal 1 jam terakhir)
- **Auto-finalisasi jika pembayaran terdeteksi**
- **Kirim notifikasi ke user otomatis** tanpa perlu klik tombol
- Backup mechanism jika manual check gagal

### 3. Manual Status Check
- Manual check via tombol "⏳ Cek Status"
- Real-time status checking menggunakan API OrderKuota
- Instant finalisasi jika pembayaran terdeteksi

### 4. Payment Integration
- Terintegrasi dengan sistem checkout bot
- Support untuk produk dan top-up saldo
- Auto-update status transaksi

## 🧪 Testing

### Test Generate QRIS
1. Buat transaksi produk atau top-up
2. Pilih metode pembayaran "💳 QRIS Payment (OrderKuota)"
3. Bot akan mengirim QRIS image
4. Scan QRIS dengan aplikasi e-wallet

### Test Auto-Polling (Realtime)
1. Buat transaksi OrderKuota
2. Jangan bayar dulu
3. Tunggu maksimal 30 detik
4. Bayar transaksi
5. **Bot akan otomatis detect pembayaran dalam 30 detik** (tanpa perlu klik tombol)
6. User akan otomatis menerima produk

### Test Manual Status Check
1. Buat transaksi OrderKuota
2. Jangan bayar dulu
3. Klik tombol "⏳ Cek Status"
4. Bayar transaksi
5. Klik lagi "⏳ Cek Status"
6. Bot harus otomatis finalisasi dan kirim produk

## ⚠️ Troubleshooting

### Problem: OrderKuota tidak muncul di opsi pembayaran
**Solusi:**
1. Pastikan semua variabel wajib sudah di-set di `.env`
2. Pastikan `ORDERKUOTA_BASE_QR_STRING`, `ORDERKUOTA_AUTH_USERNAME`, dan `ORDERKUOTA_AUTH_TOKEN` sudah benar
3. Restart bot
4. Cek log bot - harus muncul: `✅ OrderKuota payment gateway enabled`

### Problem: Error saat generate QRIS
**Solusi:**
1. Pastikan `ORDERKUOTA_BASE_QR_STRING` valid (bisa di-test di https://www.imagetotext.info/qr-code-scanner)
2. Pastikan format QR string sesuai standar QRIS Indonesia
3. Cek log bot untuk detail error

### Problem: Status check tidak update
**Solusi:**
1. **Auto-polling akan cek otomatis setiap 30 detik** - tunggu maksimal 30 detik setelah bayar
2. Pastikan `ORDERKUOTA_AUTH_TOKEN` masih valid (tidak expired)
3. Token expired setelah 1 jam - login ulang di @TokenOrkutBot
4. Atau klik manual "⏳ Cek Status" untuk instant check
5. Cek log bot untuk error messages - harus muncul: `🔍 [ORDERKUOTA POLLING] ...`

### Problem: Logo tidak muncul di QR
**Solusi:**
1. Pastikan `ORDERKUOTA_LOGO_PATH` benar dan file ada
2. Pastikan path relatif dari root project (contoh: `./assets/logo.png`)
3. Pastikan folder `assets` sudah dibuat dan logo ada di dalamnya
4. Gunakan format gambar yang didukung (PNG, JPG, JPEG)
5. Ukuran logo max 200x200px untuk hasil terbaik
6. Jika tidak perlu logo, bisa kosongkan variabel ini atau tidak perlu set

## 📝 Catatan Penting

1. **Auto-Polling Realtime:**
   - Bot otomatis cek pembayaran setiap 30 detik
   - Cek transaksi PENDING maksimal 1 jam terakhir
   - Auto-finalisasi jika pembayaran terdeteksi
   - User tidak perlu klik tombol "Cek Status" - bot akan otomatis detect
   - Log akan menampilkan: `🔍 [ORDERKUOTA POLLING] ...` setiap polling

2. **Token Expired:**
   - Token OrderKuota expired setelah 1 jam
   - Jika bot error "unauthorized", login ulang di @TokenOrkutBot
   - Ambil token baru dan update di `.env`
   - Auto-polling akan berhenti jika token invalid

3. **Base QR String:**
   - Base QR string harus dari QRIS yang valid
   - Format harus sesuai standar QRIS Indonesia
   - Bisa di-test di scanner online sebelum digunakan

4. **Theme Selection:**
   - Theme 1: Biru (default, lebih standar)
   - Theme 2: Hijau (Meta style, lebih modern)
   - Bisa diubah kapan saja di `.env`

5. **Logo Support:**
   - Logo akan muncul di tengah QR code
   - Ukuran optimal: 200x200px
   - Format: PNG atau JPG
   - Jika tidak ada logo, QR tetap berfungsi normal

## 🚀 Quick Start

1. Dapatkan `ORDERKUOTA_BASE_QR_STRING` dari QRIS scanner
2. Login di @TokenOrkutBot untuk dapatkan `auth_username` dan `auth_token`
3. Set semua variabel di `.env`
4. (Opsional) Tambahkan logo jika ingin
5. Restart bot
6. Test dengan transaksi kecil
7. Monitor log untuk debugging

## 📚 Dokumentasi Lengkap

Untuk dokumentasi lengkap package `autoft-qris`, kunjungi:
- GitHub: https://github.com/AutoFTbot/Qris-OrderKuota
- NPM: https://www.npmjs.com/package/autoft-qris

## 💬 Support

Jika ada pertanyaan atau masalah:
- Buka issue di GitHub repository bot
- Hubungi @AutoFtBot69 untuk kredensial API OrderKuota
- Cek log bot untuk detail error messages

---

**Need Help?** Cek log bot untuk detail error messages. 🚀

