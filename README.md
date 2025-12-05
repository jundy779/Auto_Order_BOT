# 🤖 Auto Order BOT

Bot Telegram otomatis untuk jualan produk digital dengan dukungan pembayaran QRIS (Pakasir, OrderKuota, Qiospay), sistem voucher, integrasi Pterodactyl Panel, notifikasi stok kritis, serta panel admin interaktif. Project ini dibangun menggunakan **Node.js + Telegraf + Express + MongoDB** sehingga mudah di-deploy di server sendiri maupun panel Pterodactyl.

---

## ✨ Fitur Utama

### 💳 Pembayaran
- **Checkout Produk & Top-up Saldo** langsung di Telegram.
- **Pembayaran QRIS Multi-Gateway**: Pakasir, OrderKuota, dan Qiospay dengan auto-polling.
- **Fee QRIS Otomatis**: Perhitungan fee persentase otomatis untuk semua gateway.
- **Saldo Internal**: Top-up dan pembayaran menggunakan saldo bot.

### 🎫 Voucher System
- **Voucher Diskon**: Percentage atau fixed amount dengan minimum purchase.
- **Voucher Redeem**: Tukar kode untuk saldo atau produk gratis.
- **Maximum Discount Control**: Batasi maksimal diskon untuk voucher percentage.
- **Usage Limits**: Batas penggunaan per user dan total usage.
- **Expiry Date**: Voucher dengan tanggal kedaluwarsa.
- **Analytics & Reporting**: Dashboard analytics untuk tracking penggunaan voucher.
- **Channel Notifications**: Notifikasi otomatis ke channel saat voucher digunakan.

### 🖥️ Pterodactyl Integration
- **Beli Panel Pterodactyl**: User bisa membeli server panel langsung dari bot.
- **Auto Create User & Server**: Otomatis membuat user dan server di Pterodactyl.
- **Panel Package Management**: Kelola paket panel via web admin.
- **Server Control**: Kontrol server (start/stop/restart) via bot.

### 📊 Admin & Monitoring
- **Panel Admin Telegram**: Kelola produk, saldo, transaksi, dan voucher via bot.
- **Web Admin Panel**: Interface web untuk kelola produk, panel packages, dan voucher.
- **Reminder Stok Kritis**: Notifikasi otomatis ke admin saat stok hampir habis.
- **Transaction History**: Riwayat transaksi lengkap dengan filter.
- **Payment Gateway Status**: Monitoring status payment gateway real-time.

### 📱 Notifikasi & Laporan
- **Channel Notifications**: Notifikasi pembelian, top-up, dan voucher ke channel Telegram.
- **Invoice Generation**: Generate invoice image dengan canvas (logo, banner, detail transaksi).
- **Large Product Delivery**: Auto kirim sebagai file .txt jika produk >15 item.
- **Transaction Details**: Info lengkap termasuk tanggal, user ID, dan ref ID.

### 🔧 Technical Features
- **Webhook Server**: Express server dengan webhook endpoint untuk payment gateway.
- **Auto-Polling Fallback**: Polling otomatis jika webhook down.
- **MongoDB Integration**: Database terpusat untuk semua data.
- **Error Handling**: Error handling dan logging yang robust.

---

## 🧱 Struktur Folder

```
BOT-AUTO/
├── bot.js                    # Entry point bot Telegram
├── models/                   # Skema Mongoose
│   ├── User.js              # Model user (saldo, redeemedVouchers)
│   ├── Product.js            # Model produk
│   ├── Transaction.js        # Model transaksi
│   ├── Setting.js            # Model settings
│   └── Voucher.js            # Model voucher (discount & redeem)
├── monitor/                  # Monitoring service
├── public/                   # Web admin panel
│   └── admin.html           # Interface admin web
├── assets/                   # Assets (logo, banner)
├── logs/                     # Log files
├── PAKASIR_SETUP.md          # Panduan integrasi Pakasir
├── ORDERKUOTA_SETUP.md      # Panduan integrasi OrderKuota
├── egg-node-j-s-auto-order-bot-improved.json  # Custom egg Pterodactyl
└── README.md                 # Dokumentasi utama
```

---

## 🚀 Instalasi Lokal / VPS

1. **Clone repo**
   ```bash
   git clone https://github.com/jundy779/Auto_Order_BOT.git
   cd Auto_Order_BOT
   ```
2. **Instal dependensi**
   ```bash
   npm install
   ```
3. **Salin contoh `.env`**
   ```bash
   cp .env.example .env   # atau buat manual
   ```
4. **Isi variabel penting di `.env`**
   ```env
   # Wajib
   BOT_TOKEN=your_telegram_bot_token
   MONGO_URI=your_mongodb_connection_string
   ADMIN_IDS=123456789,987654321
   CHANNEL_ID=@your_channel
   SERVER_BASE_URL=https://your-domain.com
   
   # Payment Gateway (pilih salah satu atau semua)
   # Pakasir
   PAKASIR_PROJECT_SLUG=your_slug
   PAKASIR_API_KEY=your_api_key
   
   # OrderKuota
   ORDERKUOTA_BASE_QR_STRING=your_qr_string
   ORDERKUOTA_AUTH_USERNAME=your_username
   ORDERKUOTA_AUTH_TOKEN=your_token
   
   # Qiospay
   QIOSPAY_MERCHANT_CODE=your_code
   QIOSPAY_API_KEY=your_api_key
   QIOSPAY_QR_STATIC=your_qr_static
   
   # Pterodactyl (opsional)
   PTERO_PANEL_URL=https://panel.domain.com
   PTERO_APP_API_KEY=your_app_api_key
   PTERO_NEST_ID=1
   PTERO_EGG_ID_PANEL=1
   PTERO_LOCATION_ID=1
   
   # Lainnya
   QRIS_FEE_PERCENTAGE=0.8
   REVIEW_PENDING_MINUTES=30
   INVOICE_BANNER_PATH=assets/banner.png
   ```
   - Ikuti panduan detail: `PAKASIR_SETUP.md` & `ORDERKUOTA_SETUP.md`
5. **Jalankan bot**
   ```bash
   node bot.js
   ```
6. **(Opsional) Gunakan PM2**
   ```bash
   npm install -g pm2
   pm2 start bot.js --name auto-order-bot
   ```

---

## 🖥️ Deploy via Pterodactyl

1. **Import Egg**
   - Buka panel → **Nests → Eggs** → *Import Egg*
   - Upload `egg-node-j-s-auto-order-bot-improved.json`

2. **Buat Server Baru**
   - Pilih egg yang baru diimport
   - Set resource limits (RAM, CPU, Disk)
   - Allocate port untuk Express server

3. **Konfigurasi Environment Variables**
   - Masuk tab **Variables**
   - Isi semua variabel yang diperlukan:
     - **Wajib**: `BOT_TOKEN`, `MONGO_URI`, `SERVER_BASE_URL`, `ADMIN_IDS`, `CHANNEL_ID`
     - **Payment Gateway**: Sesuai gateway yang digunakan
     - **Pterodactyl**: Jika ingin integrasi panel
     - **Lainnya**: `QRIS_FEE_PERCENTAGE`, `REVIEW_PENDING_MINUTES`, dll
   - Gunakan `{{SERVER_PORT}}` untuk `BOT_PORT` agar otomatis mengikuti port allocation

4. **Upload Source Code**
   - Via Git Clone: Set `GIT_ADDRESS` di variables
   - Via SFTP: Upload files ke `/home/container`

5. **Start Server**
   - Klik **Start**
   - Lihat log hingga muncul `🚀 Bot Auto Payment telah berjalan!`
   - Pastikan tidak ada error di console

> **Tips**: Gunakan egg yang sudah diperbaiki (`egg-node-j-s-auto-order-bot-improved.json`) karena sudah include semua environment variables terbaru.

---

## 🌐 Integrasi Pembayaran

### Pakasir
- **Webhook Endpoint**: `/pakasir-webhook`
- **Auto-Polling**: Fallback polling setiap 30 detik jika webhook down
- **Setup**: Ikuti `PAKASIR_SETUP.md` untuk detail konfigurasi

### OrderKuota
- **Package**: Menggunakan `autoft-qris`
- **Auto-Polling**: Polling setiap 5 menit untuk cek pembayaran
- **Setup**: Ikuti `ORDERKUOTA_SETUP.md` untuk detail konfigurasi

### Qiospay
- **Auto-Polling**: Polling setiap 5 detik untuk cek mutasi
- **QR Static/Dynamic**: Support kedua mode
- **Setup**: Isi `QIOSPAY_MERCHANT_CODE`, `QIOSPAY_API_KEY`, `QIOSPAY_QR_STATIC`

### Fee QRIS
- Semua payment gateway otomatis menambahkan fee QRIS
- Default: 0.8% (dapat diubah via `QRIS_FEE_PERCENTAGE`)
- Fee ditambahkan ke total pembayaran sebelum generate QR

---

## 🎫 Sistem Voucher

### Voucher Diskon
- **Percentage**: Diskon persentase dengan optional max discount amount
- **Fixed**: Diskon nominal tetap
- **Minimum Purchase**: Set minimum pembelian untuk menggunakan voucher
- **Usage Limits**: Batas penggunaan per user dan total

### Voucher Redeem
- **Saldo**: Tukar kode untuk saldo
- **Produk**: Tukar kode untuk produk gratis
- **Usage Tracking**: Tracking penggunaan per user

### Cara Membuat Voucher

**Via Telegram Command:**
```bash
# Voucher Diskon Percentage
/createvoucher DISKON20 PERCENTAGE 20 100000 1 2025-12-31

# Voucher Diskon Fixed
/createvoucher FIXED10K FIXED 10000 50000 1

# Voucher Redeem Saldo
/createvoucher BONUS50K REDEEM SALDO 50000 1

# Voucher Redeem Produk
/createvoucher FREEPROD REDEEM PRODUCT product_id 1
```

**Via Web Admin:**
1. Buka web admin → Tab "Vouchers"
2. Klik "Tambah Voucher"
3. Isi form sesuai kebutuhan
4. Simpan

### Command Admin Voucher
- `/createvoucher` - Buat voucher baru
- `/listvouchers` - List semua voucher
- `/deletevoucher [code]` - Hapus voucher

---

## 🧪 Pengujian Cepat

### Test Pembayaran
1. Jalankan bot & login sebagai admin
2. Buat transaksi dummy → pilih metode pembayaran
3. **Pakasir**: Bayar dan pastikan log `[PAKASIR CALLBACK]` muncul
4. **OrderKuota**: Bayar → log `[ORDERKUOTA POLLING]` akan detect dalam 5 menit
5. **Qiospay**: Bayar → log `[QIOSPAY POLLING]` akan detect dalam 5 detik
6. Cek Telegram user & channel mendapatkan notifikasi sukses

### Test Voucher
1. Buat voucher via `/createvoucher` atau web admin
2. User gunakan voucher saat checkout
3. Pastikan diskon terhitung dengan benar
4. Cek channel notification untuk voucher usage

### Test Pterodactyl Integration
1. Setup Pterodactyl variables di `.env`
2. User beli panel via bot
3. Cek panel Pterodactyl → user & server terbuat otomatis

---

## 📋 Command Admin

### Produk
- `/addproduct [nama] [harga] [stok] [kategori]` - Tambah produk
- `/editproduct [id] [field] [value]` - Edit produk
- `/deleteproduct [id]` - Hapus produk
- `/stock [id] [jumlah]` - Update stok

### Transaksi & Saldo
- `/setbalance [user_id] [jumlah]` - Set saldo user
- `/transactions` - List transaksi
- `/review [ref_id]` - Review transaksi pending

### Voucher
- `/createvoucher [code] [type] [params...]` - Buat voucher
- `/listvouchers` - List semua voucher
- `/deletevoucher [code]` - Hapus voucher

### Lainnya
- `/broadcast [message]` - Broadcast ke semua user
- `/stats` - Statistik bot
- `/logs` - Lihat log terbaru

---

## 🌐 Web Admin Panel

Akses web admin panel di: `http://your-domain/admin`

**Fitur:**
- ✅ Kelola Produk (CRUD)
- ✅ Kelola Panel Packages (Pterodactyl)
- ✅ Kelola Voucher (CRUD + Analytics)
- ✅ Monitoring Payment Gateway Status
- ✅ View Logs & Statistics

**Authentication:**
- Username & Password via environment variables
- `MONITOR_USERNAME` dan `MONITOR_PASSWORD`

---

## 🔧 Environment Variables

### Wajib
- `BOT_TOKEN` - Token Telegram bot
- `MONGO_URI` - MongoDB connection string
- `ADMIN_IDS` - Comma-separated admin user IDs
- `CHANNEL_ID` - Channel ID untuk notifikasi

### Payment Gateway
- `PAKASIR_PROJECT_SLUG`, `PAKASIR_API_KEY`
- `ORDERKUOTA_BASE_QR_STRING`, `ORDERKUOTA_AUTH_USERNAME`, `ORDERKUOTA_AUTH_TOKEN`
- `QIOSPAY_MERCHANT_CODE`, `QIOSPAY_API_KEY`, `QIOSPAY_QR_STATIC`

### Pterodactyl (Opsional)
- `PTERO_PANEL_URL`, `PTERO_APP_API_KEY`
- `PTERO_NEST_ID`, `PTERO_EGG_ID_PANEL`, `PTERO_LOCATION_ID`
- `PTERO_EMAIL_DOMAIN`, `PTERO_PANEL_DESCRIPTION`

### Lainnya
- `QRIS_FEE_PERCENTAGE` - Fee QRIS (default: 0.8)
- `REVIEW_PENDING_MINUTES` - Menit sebelum pending di-flag (default: 30)
- `INVOICE_BANNER_PATH` - Path banner untuk invoice
- `STORE_NAME` - Nama toko
- `SERVER_BASE_URL` - URL publik bot

> **Lengkap**: Lihat `egg-node-j-s-auto-order-bot-improved.json` untuk semua variables.

---

## 🛠️ Kontribusi

1. Fork repo ini
2. Buat branch baru: `git checkout -b feature/nama-fitur`
3. Commit perubahan: `git commit -m "Add: fitur baru"`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Buat Pull Request

---

## 📄 Lisensi

Project ini dirilis bebas untuk kebutuhan personal / komersial. Tetap cantumkan kredit jika melakukan publikasi ulang.

---

## 🎯 Referensi Penting

- 📘 [PAKASIR_SETUP.md](./PAKASIR_SETUP.md) - Panduan integrasi Pakasir
- 📘 [ORDERKUOTA_SETUP.md](./ORDERKUOTA_SETUP.md) - Panduan integrasi OrderKuota
- 📘 [egg-node-j-s-auto-order-bot-improved.json](./egg-node-j-s-auto-order-bot-improved.json) - Custom egg Pterodactyl

---

## 📝 Changelog

### v2.0.0 (Latest)
- ✨ Added Voucher System (Discount & Redeem)
- ✨ Added Qiospay Payment Gateway
- ✨ Added Pterodactyl Panel Integration
- ✨ Added Invoice Generation with Canvas
- ✨ Added Voucher Analytics & Reporting
- ✨ Added Channel Notifications for Vouchers
- ✨ Added Maximum Discount Amount Control
- ✨ Added Large Product Delivery (.txt file)
- 🔧 Improved Payment Gateway Status Checks
- 🔧 Optimized Code & Removed Duplicates
- 🐛 Fixed QRIS Fee Calculation Issues

### v1.0.0
- ✅ Basic Auto Order Bot
- ✅ Pakasir & OrderKuota Integration
- ✅ Admin Panel & Web Interface
- ✅ Stock Management


