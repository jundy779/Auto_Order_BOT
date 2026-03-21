# Runbook (Setup, Operasional, Troubleshooting)

## Prasyarat

- Node.js (sesuai kebutuhan dependency di `package.json`)
- MongoDB (Atlas atau self-host)
- Token bot Telegram (BotFather)

## Konfigurasi `.env`

File `.env` dibaca oleh `dotenv` saat start.

Minimal wajib ada:

- `BOT_TOKEN` — token bot Telegram
- `MONGO_URI` — koneksi MongoDB
- `CHANNEL_ID` — channel untuk notifikasi (angka; bisa negatif untuk supergroup/channel)

Variabel lain yang umum:

- **Admin**: `ADMIN_IDS`
- **Port server**: `SERVER_PORT` atau `BOT_PORT` (default 3000)
- **Gateway config**: `PAKASIR_*`, `QIOSPAY_*`, `SANPAY_*`, `MIDTRANS_*`, `TRIPAY_*`, `VIOLETPAY_*`, `TOYYIBPAY_*`
- **Monitoring login**: `MONITOR_USERNAME`, `MONITOR_PASSWORD`
- **Exchange rate**: `EXCHANGE_RATE_IDR_MYR`, `EXCHANGE_RATE_API_KEY`
- **Web push**: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_CONTACT`

Catatan keamanan:

- Jangan pernah commit `.env` ke repository publik.
- Admin panel sudah melakukan masking untuk field sensitif pada endpoint tertentu.

## Cara menjalankan

```bash
npm install
npm run start
```

Saat start sukses, umumnya:

- MongoDB terhubung
- HTTP server listen pada port yang diset
- Bot Telegram masuk mode long polling
- Payment polling dimulai untuk gateway yang enabled

## Endpoint yang perlu diketahui untuk operasional

- Admin/monitor login: `/monitor/login`
- Admin panel: `/admin`
- Public API: `/api/*`
- Webhook: `/midtrans-webhook`, `/tripay-callback`, `/violetpay-callback`

## Troubleshooting

### 1) Bot tidak bisa start (env belum lengkap)

Gejala:

- Aplikasi exit dengan error tentang variabel environment.

Solusi:

- Pastikan minimal `BOT_TOKEN`, `MONGO_URI`, dan `CHANNEL_ID` terisi.

### 2) MongoDB gagal connect

Gejala:

- Log error koneksi MongoDB.

Solusi:

- Validasi format `MONGO_URI` (mongodb:// atau mongodb+srv://).
- Pastikan IP whitelist Atlas / kredensial benar.
- Coba endpoint admin test Mongo (jika admin panel sudah bisa diakses).

### 3) Port sudah dipakai (EADDRINUSE)

Gejala:

- Log menyebut port sudah digunakan.

Solusi:

- Matikan proses lama, atau ubah `SERVER_PORT`/`BOT_PORT`.

### 4) Pembayaran tidak terdeteksi (status tidak berubah dari PENDING)

Checklist:

- Gateway enabled dan config valid (lihat admin gateway config).
- Polling berjalan (ada log inisialisasi polling).
- Transaksi masih dalam time window polling (umumnya 1 jam terakhir untuk provider tertentu).
- Untuk gateway via webhook: pastikan callback URL benar dan signature sesuai.

### 5) Double finalize / dobel kirim

Sistem sudah punya mekanisme pencegahan berbasis `gatewayTransactionId` (untuk mutasi) dan status transaksi.

Jika masih terjadi:

- Audit log finalize dan pastikan finalize idempotent.
- Perketat “claim key” mutasi (mutasiKey) dan validasi amount/time window.

### 6) Admin tidak bisa login / 2FA bermasalah

- Pastikan cookie tidak diblokir browser.
- Jika 2FA Telegram OTP: pastikan telegramId tersimpan dan bot bisa mengirim pesan.
- Jika TOTP: sinkronisasi waktu server penting (timezone tidak kritikal, tapi jam harus akurat).

