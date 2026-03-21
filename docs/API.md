# API (HTTP) — Ringkasan Endpoint

Dokumen ini merangkum endpoint yang ada di aplikasi saat ini. Semua endpoint berjalan pada server Express yang sama dengan bot.

## Konvensi umum

- **Auth admin/monitor**: menggunakan cookie HttpOnly (mis. `monitor_auth`) yang diset saat login.
- **Rate limit**:
  - `app.use('/api/', generalLimiter)` dan `app.use('/admin/', generalLimiter)`
  - login endpoint memakai limiter khusus.
- **Webhook**: signature wajib diverifikasi (lihat `routes/webhooks.js`).

## Public API (`/api/*`)

> Ditujukan untuk web store / integrasi ringan (tanpa admin auth).

- **GET** `/api/metrics/summary`  
  Ringkasan metrik publik (jumlah transaksi, jumlah produk aktif, uptime dummy).

- **GET** `/api/products`  
  List produk aktif. Query: `category`, `search`, `limit`.

- **GET** `/api/products/:id`  
  Detail produk.

- **GET** `/api/categories`  
  List kategori.

- **GET** `/api/transactions/recent`  
  Daftar transaksi terbaru (untuk web UI).

- **POST** `/api/checkout`  
  Membuat transaksi checkout (PENDING) dan mengembalikan instruksi pembayaran/QR.

- **GET** `/api/orders/:refId/status`  
  Cek status order berdasarkan `refId`.

## H2H Reseller API (`/api/h2h/*`)

Auth via header:

- `x-api-key`
- `x-secret-key`

Rate limit internal per API key (default 60 req/menit).

Endpoint:

- **GET** `/api/h2h/balance`
- **GET** `/api/h2h/products`
- **GET** `/api/h2h/products/:code`
- **POST** `/api/h2h/order`
- **GET** `/api/h2h/order/:id`
- **GET** `/api/h2h/history`

Catatan penting:

- H2H hanya mengizinkan produk `deliveryType=AUTO` dan `h2hEnabled != false`.
- H2H memakai saldo reseller dan langsung mengurangi stok/konten produk.

## Webhook endpoints (root `/`)

Router webhook dipasang dengan `app.use('/', webhookRouter)`, sehingga endpoint berikut aktif di root:

- **POST** `/midtrans-webhook`
- **POST** `/tripay-callback`
- **POST** `/violetpay-callback`

## Monitor UI & JSON (`/monitor/*`)

- **GET** `/monitor/login`
- **POST** `/monitor/login`
- **GET** `/monitor/forgot-password`
- **GET** `/monitor/reset-password`
- **GET** `/monitor/logout`
- **GET** `/monitor` (butuh auth)
- **GET** `/monitor/bot-status.json` (butuh auth)
- **GET** `/monitor/process-stats.json` (butuh auth)

Static:

- **GET** `/monitor-assets/*` (serve file dari `public/`)

## Admin UI & JSON (`/admin/*`)

### JSON dan utilitas umum (di `bot.js`)

- **GET** `/admin/profile.json` (auth)
- **POST** `/admin/profile` (auth + CSRF)
- **POST** `/admin/profile/reset-password` (auth + CSRF)
- **GET** `/admin/security-logs.json` (auth)
- **GET** `/admin/overview.json` (auth)
- **GET** `/admin/payment-stats.json` (auth)

Promo & voucher:

- **GET** `/admin/promo.json` (auth)
- **GET** `/admin/products-for-promo.json` (auth)
- **POST** `/admin/promo` (auth)
- **POST** `/admin/promo/toggle` (auth)
- **GET** `/admin/vouchers.json` (auth)
- **GET** `/admin/vouchers/:id` (auth)
- **POST** `/admin/vouchers` (auth)
- **PUT** `/admin/vouchers/:id` (auth)
- **DELETE** `/admin/vouchers/:id` (auth)
- **GET** `/admin/vouchers-analytics.json` (auth)

Admin management:

- **POST** `/admin/admins` (auth)
- **DELETE** `/admin/admins/:id` (auth)

Push notification:

- **GET** `/admin/push/vapid-key`
- **POST** `/admin/push/subscribe`
- **POST** `/admin/push/unsubscribe`
- **POST** `/admin/push/test`

Reseller settings:

- **GET** `/admin/reseller/settings`
- **POST** `/admin/reseller/settings`

2FA (di `bot.js` + router security):

- **GET** `/admin/2fa/status` (auth)
- **POST** `/admin/2fa/setup/totp` (auth)
- **POST** `/admin/2fa/setup/telegram` (auth)
- **POST** `/admin/2fa/enable` (auth)
- **POST** `/admin/2fa/disable` (auth)
- **POST** `/admin/2fa/send-otp`
- **POST** `/admin/2fa/verify`
- **POST** `/admin/2fa/backup-codes` (auth)

### Router admin terpisah (`routes/admin/*`)

> Semua router ini dipasang via `app.use('/admin', <router>)`, jadi path final tetap berawalan `/admin`.

Produk (`routes/admin/products.js`):

- **GET** `/admin/products.json`
- **POST** `/admin/products`
- **PUT** `/admin/products/:id`
- **DELETE** `/admin/products/:id`
- **POST** `/admin/products/:id/toggle-active`
- **GET** `/admin/products/:id/stock.json`
- **GET** `/admin/products/:id/stock.txt`
- **PUT** `/admin/products/:id/stock`
- **POST** `/admin/products/bulk-stock`

Transaksi & manual order (`routes/admin/transactions.js`):

- **GET** `/admin/manual-review.json`
- **POST** `/admin/transactions/:id/review`
- **GET** `/admin/pending-orders.json`
- **POST** `/admin/pending-orders/:id/complete`

Users (`routes/admin/users.js`):

- **GET** `/admin/users.json`
- **POST** `/admin/users/:id/ban`
- **POST** `/admin/users/:id/unban`
- **GET** `/admin/users/:id/detail.json`

Payment gateway (`routes/admin/gateways.js`):

- **GET** `/admin/payment-gateway.json`
- **POST** `/admin/payment-gateway`
- **POST** `/admin/payment-gateway/preview-qr`
- **POST** `/admin/sanpay-create-qris`

Settings (`routes/admin/settings.js`):

- **GET** `/admin/exchange-rate.json`
- **POST** `/admin/exchange-rate`
- **GET** `/admin/notifications.json`
- **POST** `/admin/notifications/mark-read`
- **GET** `/admin/env-config.json`
- **POST** `/admin/env-config`
- **POST** `/admin/env-config/test-bot-token`
- **POST** `/admin/env-config/test-mongo-uri`
- (Tambahan) **GET** `/admin/admins.json`
- (Stub) **POST** `/admin/admins` -> Not implemented di module ini

Security/2FA helper (`routes/admin/security.js`):

- **POST** `/admin/2fa/verify`
- **POST** `/admin/2fa/send-otp`
- **GET** `/admin/2fa/setup`
- **POST** `/admin/2fa/enable`
- **POST** `/admin/2fa/disable`

Broadcast (`routes/admin/broadcast.js`):

- **POST** `/admin/broadcast` (multipart, optional file)

## Misc

- **GET** `/success` (landing sederhana setelah pembayaran sukses)

