# 🤖 Auto Order BOT

Bot Telegram otomatis untuk jualan produk digital dengan dukungan pembayaran QRIS (Pakasir & OrderKuota), notifikasi stok kritis, serta panel admin interaktif. Project ini dibangun menggunakan **Node.js + Telegraf + Express + MongoDB** sehingga mudah di-deploy di server sendiri maupun panel Pterodactyl.

---

## ✨ Fitur Utama

- **Checkout Produk & Top-up Saldo** langsung di Telegram.
- **Pembayaran QRIS Pakasir dan OrderKuota**: realtime lewat webhook (Pakasir) + auto-polling fallback.
- **Reminder Stok Kritis** otomatis kirim ke seluruh admin begitu stok produk hampir habis.
- **Panel Admin Telegram** untuk kelola produk, saldo, dan log transaksi.
- **Webhook server bawaan** (`Express`) + fallback polling supaya tetap aman saat webhook down.

---

## 🧱 Struktur Folder

```
BOT-AUTO/
├── bot.js
├── models/
├── PAKASIR_SETUP.md
├── ORDERKUOTA_SETUP.md
├── egg-node-j-s-auto-order-bot.json
└── README.md
```

- `bot.js` : entry point bot Telegram.
- `models/` : skema Mongoose (User, Product, Transaction, dst).
- `PAKASIR_SETUP.md` : panduan lengkap integrasi Pakasir (webhook + env).
- `ORDERKUOTA_SETUP.md` : panduan lengkap integrasi OrderKuota.
- `egg-node-j-s-auto-order-bot.json` : custom egg Pterodactyl siap impor.

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
4. **Isi variabel penting**
   - `BOT_TOKEN`, `MONGO_URI`, `ADMIN_IDS`
   - `PAKASIR_*` → ikuti `PAKASIR_SETUP.md`
   - `ORDERKUOTA_*` → ikuti `ORDERKUOTA_SETUP.md`
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

1. Buka panel → **Nests → Eggs** → *Import Egg*.
2. Upload `egg-node-j-s-auto-order-bot.json`.
3. Buat server baru pakai egg tersebut.
4. Masuk tab **Variables** dan isi seluruh env:
   - Gunakan `{{SERVER_PORT}}` pada `BOT_PORT`, `PAKASIR_REDIRECT_URL`, `PAKASIR_WEBHOOK_URL`, `SERVER_BASE_URL`, dll supaya otomatis mengikuti port allocation.
5. Upload source code atau git pull di container.
6. Klik **Start** → lihat log hingga muncul `🚀 Bot Auto Payment telah berjalan!`.

> Penjelasan lengkap pengisian variabel dan contoh URL ada pada `PAKASIR_SETUP.md` & `ORDERKUOTA_SETUP.md`.

---

## 🌐 Integrasi Pembayaran

- **Pakasir**
  - Webhook endpoint tersedia di `/pakasir-webhook`.
  - Ikuti langkah detail pada `PAKASIR_SETUP.md` (env, DNS/port, testing webhook, troubleshooting).

- **OrderKuota**
  - Menggunakan paket `autoft-qris` dengan base QR string + auth token.
  - Panduan lengkap ada di `ORDERKUOTA_SETUP.md` (cara ambil QR string, auth token, logo QR, testing auto-polling).

---

## 🧪 Pengujian Cepat

1. Jalankan bot & login sebagai admin.
2. Buat transaksi dummy → pilih metode Pakasir / OrderKuota.
3. Untuk Pakasir: bayar dan pastikan log `[PAKASIR CALLBACK]` muncul.
4. Untuk OrderKuota: bayar dalam ≤30 detik → log `[ORDERKUOTA POLLING]` harus mendeteksi otomatis.
5. Cek Telegram user & admin mendapatkan notifikasi sukses dan produk.

---

## 🛠️ Kontribusi

1. Fork repo ini.
2. Buat branch baru: `git checkout -b feature/nama-fitur`.
3. Commit perubahan dan buat pull request.

---

## 📄 Lisensi

Project ini dirilis bebas untuk kebutuhan personal / komersial. Tetap cantumkan kredit jika melakukan publikasi ulang.

---

🎯 **Referensi penting**  
- [PAKASIR_SETUP.md](./PAKASIR_SETUP.md)  
- [ORDERKUOTA_SETUP.md](./ORDERKUOTA_SETUP.md)  
- [egg-node-j-s-auto-order-bot.json](./egg-node-j-s-auto-order-bot.json)


