# PRD — Auto Order Payment Bot

## Ringkasan produk

Bot Telegram yang mengotomasi penjualan produk digital, menerima pembayaran QR, mengelola stok/konten produk, serta menyediakan web admin panel untuk operasional (produk, transaksi, voucher, broadcast) dan monitor dashboard untuk kesehatan sistem.

## Masalah yang diselesaikan

- **Pembayaran**: verifikasi pembayaran QR secara otomatis (polling dan/atau webhook) agar admin tidak perlu cek manual satu per satu.
- **Pengiriman**: produk digital (konten/stok) dikirim otomatis setelah pembayaran sukses.
- **Operasional**: admin panel untuk manajemen produk, stok, user, transaksi, voucher, gateway config, broadcast.
- **Skalabilitas channel**: H2H reseller API agar pihak ketiga bisa konsumsi produk auto-delivery dengan saldo reseller.

## Target pengguna

- **Pembeli (end user)**: beli produk via bot Telegram, bayar, terima konten.
- **Admin/Owner**: setup gateway, mengelola katalog/stok, memantau transaksi, menangani manual order & review.
- **Reseller (H2H)**: akses API untuk list produk dan membuat order memakai saldo reseller.

## Ruang lingkup (in-scope)

### Fitur bot Telegram

- **Katalog produk**: list produk, kategori, detail produk.
- **Checkout**: membuat order dan transaksi, menentukan metode/provider pembayaran.
- **Pembayaran QR**:
  - Status pembayaran dipastikan via **polling** dan/atau **webhook**.
  - Setelah sukses, transaksi difinalisasi (status, timestamp, dan deliver).
- **Voucher**: diskon/redeem (sesuai model Voucher).
- **Garansi**: opsi garansi per produk (tipe & durasi).
- **Manual order**:
  - Produk bertipe `MANUAL` membutuhkan input tambahan dari user.
  - Admin menyelesaikan order via panel dan user menerima notifikasi.
- **Anti-spam**: throttling command untuk mencegah abuse.

### Fitur web (HTTP)

- **Public API (web store)**: list produk/kategori, checkout via HTTP, status order, ringkasan metrik.
- **Admin panel**: CRUD produk, stok, users, transaksi, voucher/promo, payment gateway config, env config, broadcast, 2FA.
- **Monitoring**: status bot, sistem (CPU/RAM/disk), transaksi, log ringkas.
- **Push notification**: subscribe/unsubscribe admin (web push).
- **H2H Reseller API**: balance, list produk, order, order status, history.

## Out of scope (untuk sekarang)

- Migrasi ke microservices atau pemisahan database.
- Multi-tenant penuh (banyak store dalam 1 instance) tanpa perubahan data model.
- Payment provider di luar yang sudah ada modulnya.

## Requirement fungsional (high level)

1. **Transaksi**
   - Sistem membuat transaksi `PENDING` saat checkout.
   - Transaksi berubah ke `SUCCESS` hanya lewat mekanisme finalize yang terkontrol (polling/webhook/manual confirm).
2. **Pengiriman**
   - Untuk produk `AUTO`: stok/konten diambil dari `Product.kontenProduk` secara aman (tidak dobel-kirim).
   - Untuk produk `MANUAL`: transaksi sukses masuk antrian admin sampai `manualProcessStatus=COMPLETED`.
3. **Pembayaran**
   - Setiap provider memiliki adapter/service terpisah.
   - Polling berjalan periodik untuk provider yang aktif.
   - Webhook memverifikasi signature (untuk provider tertentu) sebelum finalize.
4. **Operasional admin**
   - Admin dapat melihat queue review & pending manual orders.
   - Admin dapat mengubah konfigurasi gateway tanpa restart (hot reload).
5. **Keamanan**
   - Rate limit untuk endpoint sensitif (login, API).
   - 2FA (TOTP atau OTP Telegram) untuk akun admin/monitor.
   - Jangan pernah mengekspos secret di UI/JSON response (gunakan masking).

## Requirement non-fungsional

- **Stabilitas**: bot tetap berjalan walau ada error sporadis (uncaught/unhandled ditangani sebagai log).
- **Konsistensi data**: finalize harus idempotent (hindari double-finalize dan double-delivery).
- **Kinerja**: polling membatasi batch transaksi dan menghindari overlap (mutex flag per provider).
- **Security**: webhook signature wajib diverifikasi; session admin/monitor berbasis cookie HttpOnly.
- **Observability**: monitor snapshot + ring buffer log untuk debug cepat.
- **Maintainability**: modul payment & routes dipisah; standar clean code wajib dipatuhi (lihat aturan repo).

## Metrik keberhasilan

- **Success rate pembayaran** per provider dan total.
- **Waktu rata-rata** dari checkout → sukses → deliver.
- **Jumlah transaksi pending stale** yang butuh review manual.
- **Error rate** webhook/polling/finalize.
- **Uptime proses** (monitor snapshot).

