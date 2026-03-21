# Roadmap Refactor (Bertahap, Tanpa Ubah Behavior)

Tujuan roadmap ini: membuat codebase makin modular, minim duplikasi, lebih mudah dites, dan lebih aman dari bug double-finalize/double-delivery — tanpa mengubah perilaku produk yang sudah berjalan.

## Prinsip pelaksanaan

- Refactor per “slice” kecil, jangan big-bang.
- Setiap langkah harus bisa di-rollback.
- Fokus ke pengurangan risiko: pembayaran, transaksi, delivery, security.

## Milestone 0 — Baseline & Guardrail (1–2 hari)

- Tambahkan dokumentasi `docs/*` (sudah).
- Tambahkan aturan clean code repo `.cursor/rules/clean-code.md` (sudah).
- Tambahkan script sederhana untuk sanity-check (opsional):
  - cek env required sebelum start
  - cek duplikasi endpoint yang tidak sengaja

## Milestone 1 — Pecah `bot.js` menjadi modul (tanpa ubah output) (2–5 hari)

Target: `bot.js` jadi “wiring” saja.

- Ekstrak setup Express & middleware ke `server/httpServer.js` (atau `server/index.js`): ✅
  - rate limit, CORS, static assets, socket.io bootstrap, pemasangan router admin/public/webhook
- Ekstrak middleware Telegraf (anti-spam, callback wrapper) ke `bot/middlewares/*`. ✅
- Ekstrak template pesan Telegram ke `bot/messages/*` agar format konsisten dan tidak copy-paste. ✅

### Progres saat ini

- **HTTP server** (`app`, `server`, `io`) sudah dipisah ke `server/httpServer.js`.
- **Admin**: satu grup route kecil `/admin/reseller/settings` sudah diekstrak ke `routes/admin/resellerSettings.js`.
- **Helper state**: utility `setUserState/getUserState/clearUserState` & `setAdminState/getAdminState/clearAdminState` sudah ada di `bot/stateHelpers.js`.
- **Flow user yang sudah dipindah ke `features/user/*` dengan behaviour identik:**
  - `flowSupport` — flow bantuan user (`WAITING_SUPPORT_MESSAGE`, forward pesan & media ke admin).
  - `flowProducts` — flow browse & pilih produk (`🛍️ Lihat Produk`, pagination kategori & produk, `WAITING_CATEGORY_CHOICE`).
  - `flowTopup` — flow topup saldo (pilih gateway, nominal preset & custom, `WAITING_TOPUP_AMOUNT`).
  - `flowSaldo` — menu **💰 Saldo & Top Up** + riwayat topup.
  - `flowRefund` — kalkulator refund (`🧮 Kalkulator Refund`, `WAITING_SISA`, `refund_*` actions).
  - `flowHistory` — riwayat transaksi (`📜 Riwayat Transaksi` + detail tombol refund).
  - `flowAccount` — informasi akun pengguna (statistik transaksi, saldo, join date, dsb).
  - `flowSupport` — sudah menjadi modul terpisah dan digunakan oleh handler `Bantuan`.
  - `flowStockReport` — laporan stok per kategori (termasuk update stok & summary).
  - `flowBestSeller` — daftar produk terlaris (`🔥 Best Seller` / `🔥 Paling Laris`).

- **Template pesan Telegram yang sudah dipindah ke `bot/messages/*`:**
  - `categoryList.js` — `buildCategoryListMessage(t, lang, { categories, page, totalPages, stockMap })` untuk list kategori (box format + pagination).
  - `transaction.js` — pesan check status & cancel transaksi (checkStatusPaymentPaid, checkStatusPaymentProcessed, cancelTrxDone, cancelTrxAlreadyPaid, dll.); key i18n ditambah di `utils/i18n.js` (id/en/ms).
  - `index.js` — re-export categoryList & transaction. Dipakai oleh handler kategori dan action `check_status` / `cancel_trx` di `bot.js`.

- **Middleware Telegraf yang sudah dipindah ke `bot/middlewares/*`:**
  - `guards.js` — access control (`adminGuard`, `bannedGuard`, `isAdmin`).
  - `global.js` — global middleware (anti-spam protection, activity logging, bot status monitoring).
  - `callbackWrapper.js` — callback query error handler wrapper.

- **Admin commands yang sudah dipindah ke `features/admin/*`:**
  - `commandsSettings.js` — admin settings commands (`/setsticker`, `/setwelcomesticker`, `/setimage`).

- **Server lifecycle yang sudah dipindah ke `server/*`:**
  - `shutdownHandler.js` — penanganan SIGINT/SIGTERM (graceful exit).
  - `botLifecycle.js` — `createStartServer()`: bind server, launch bot, error handlers, polling, scheduler.

- **Checkout yang sudah dipindah ke `features/checkout/*`:**
  - `processCheckout.js` — logic checkout produk/topup/panel + semua payment gateway (saldo, pakasir, qiospay, midtrans, tripay, violetpay, sanpay, toyyibpay), ~993 baris pindah dari `bot.js`.
  - `paymentMessage.js` — helper pembayaran: `createPaymentKeyboard`, `sendQRPayment`, `storePaymentMessageRef`, `deletePaymentMessageRef`, `handlePaymentStatusCheck` (~150 baris). Dipakai oleh `processCheckout`, action `check_status` / `cancel_trx`, `transactionFinalize`, dan `botLifecycle` (polling).

- **Finalisasi transaksi yang sudah dipindah ke `services/*`:**
  - `transactionFinalize.js` — `createFinalizeTransaction(deps)`: finalisasi transaksi topup/panel/produk setelah pembayaran sukses (TOPUP, PANEL, PRODUCT, PRODUCT_MANUAL), ~420 baris pindah dari `bot.js`. Menerima `finalizePanelTransaction` dari `panelFinalize.js`.
  - `panelFinalize.js` — `createPanelFinalize(deps)`: finalisasi panel Pterodactyl (create user & server di panel, update user, kirim notif ke user & channel), ~210 baris pindah dari `bot.js`. Dipakai oleh `transactionFinalize` (tipe PANEL) dan handler bayar panel pakai saldo di `bot.js` (via `finalizePanelTransactionHolder`).

- **Delivery produk yang sudah dipindah ke `services/*`:**
  - `productDelivery.js` — `createProductDelivery(deps)`: `deliverProduct(userId, productId, quantity)` + `sendProductPurchaseResult(ctxOrUserId, product, deliveredContents, ...)`, ~150 baris pindah dari `bot.js`. Dipakai oleh `transactionFinalize`, `processCheckout`, dan handler redeem/voucher. `processCheckout` dibuat di mongoose.then() setelah productDelivery tersedia.

- **Notifikasi channel + invoice canvas yang sudah dipindah ke `services/*`:**
  - `channelNotification.js` — `createChannelNotification(deps)`: `sendChannelNotification(message, invoiceData)` (kirim teks atau foto invoice ke channel) + `generateInvoiceCanvas(transactionData)` (gambar receipt), ~320 baris pindah dari `bot.js`. Dipakai oleh `transactionFinalize`, `processCheckout`, dan handler admin (notif manual order / error). Dibuat di mongoose.then() bersama productDelivery.

- **Ukuran `bot.js`**:
  - Sebelum refactor: ~12.5k baris.
  - Setelah processCheckout: **~10.6k baris**.
  - Setelah finalizeTransaction: **~10.05k baris**.
  - Setelah productDelivery: **~9.9k baris**.
  - Setelah channelNotification: **~9.6k baris** (sendChannelNotification + generateInvoiceCanvas ~320 baris pindah ke `services/channelNotification.js`).
  - Setelah paymentMessage: **~9.45k baris** (payment message helpers ~150 baris pindah ke `features/checkout/paymentMessage.js`).
  - Setelah panelFinalize: **~9.24k baris** (finalizePanelTransaction ~210 baris pindah ke `services/panelFinalize.js`).
  - Setelah template pesan (`bot/messages`): **~9.2k baris** (format list kategori & pesan transaksi terpusat; pesan pakai i18n).

**Milestone 1 — selesai.** Semua poin (HTTP server, middleware, template pesan) sudah diekstrak; `bot.js` berfungsi sebagai wiring + dependency injection.

Output yang diharapkan:

- `bot.js` hanya mengurus wiring (registrasi command/hears/action) dan dependency injection.
- Lebih mudah mencari lokasi fitur dan memperkecil konflik saat kolaborasi.

## Milestone 2 — Standarisasi flow transaksi (3–6 hari)

Target: finalisasi transaksi makin aman dan idempotent.

- **Contract finalize (selesai):**
  - Input: `transaction`, `providerLabel`, `options = { source }`. Source untuk audit: `webhook_midtrans` | `webhook_tripay` | `webhook_violetpay` | `polling_qiospay` (dll.) | `manual_admin`.
  - Guard SUCCESS: jika `transaction.status === 'SUCCESS'` → return `{ alreadyProcessed: true }` (no-op, idempotent).
  - Audit: saat berhasil finalize, set `transaction.finalizedBy = { source, at }` lalu save (field di model `Transaction`).
- **Guard delivery (selesai):** Di finalize, untuk AUTO PRODUCT: jika `transaction.produkInfo.stokDikirim?.length > 0` → return `{ alreadyDelivered: true }`, set status SUCCESS & save (no-op, tidak panggil deliverProduct lagi). Setelah deliverProduct sukses, set `transaction.produkInfo.stokDikirim = deliveredContents` sebelum save agar panggilan berikutnya no-op.
- **getCheckAmount(transaction) (selesai):** helper di `services/transactionHelpers.js`; urutan: `externalPayAmount` → `totalPayment` → `totalBayar`. Dipakai di webhook Midtrans (validasi amount), `handlePaymentStatusCheck` (polling), dan API status order (`total_amount`).
- **buildGatewayTransactionKey(provider, mutasi) (selesai):** helper di `services/transactionHelpers.js`; format `PROVIDER:uniquekey` (QIOSPAY: ref_amount_date, SANPAY: transactionID_amount). Dipakai di polling QiosPay & Sanpay untuk set `transaction.gatewayTransactionId` sebelum finalize; cek existingTx by key untuk anti double-claim. Polling semua gateway pakai `getCheckAmount(transaction)` dan pass `source` (polling_pakasir, polling_qiospay, dll.) ke finalize.

**Milestone 2 — selesai.** Contract finalize, guard SUCCESS/delivery, audit `finalizedBy`, `getCheckAmount`, dan `buildGatewayTransactionKey` sudah dipakai seragam di webhook, polling, dan manual admin.

## Milestone 3 — Payment adapters lebih konsisten (3–7 hari)

Target: semua provider punya interface yang seragam.

- **Interface internal (selesai):** Konvensi didokumentasikan di `services/payment/INTERFACE.md`: `createTransaction(refId, amount)`, `checkStatus(refId, amount?)`, optional `getMutasi()`. Tabel ringkasan per provider (Pakasir, Qiospay, Sanpay, Midtrans, Tripay, Violetpay, ToyyibPay). README payment mengarah ke INTERFACE.md.
- **Parsing waktu mutasi (selesai):** Logic parsing tanggal dipindah ke fungsi per provider — `parseDate(dateStr)` di `qiospay.js` (format DD/MM/YYYY HH:mm dan YYYY-MM-DD HH:mm:ss) dan di `sanpay.js` (transactionDate). Dipakai di filter kandidat mutasi.
- **Retry/backoff (selesai):** Modul `services/payment/retry.js` dengan `withRetry(fn, options)` (default: 3 percobaan, delay 400 ms, backoff 1.5x). Dipakai di Qiospay getMutasi, Sanpay getMutasi, dan Pakasir createTransaction agar panggilan API gateway konsisten dan tidak spam.

**Milestone 3 — selesai.** Semua poin di atas sudah diimplementasikan.

## Milestone 4 — Testing minimal yang paling bernilai (2–5 hari)

Target: refactor aman dengan tes sederhana.

- **Fondasi testing:** Jest terpasang (`npm test`), unit test `getCheckAmount`, guard `finalizeTransaction` (alreadyProcessed, alreadyDelivered). Test plan di `docs/TEST_PLAN_MILESTONE_4.md`.
- **Tes prioritas (selesai):**
  - Unit test mapping status provider → internal: `tests/payment/statusMapping.test.js` (isPaidStatus per gateway).
  - Unit test `buildGatewayTransactionKey` & claim logic: `tests/transaction/buildGatewayTransactionKey.test.js`, `tests/transaction/gatewayTransactionIdClaim.test.js`.
  - Smoke test: `tests/smoke/webhookSignatureInvalid.test.js` (Midtrans & Tripay signature invalid → 401), `tests/smoke/checkoutCreatesPending.test.js` (kontrak response checkout).

**Milestone 4 — selesai.** Semua tes prioritas di atas sudah diimplementasikan (28 tests, 7 suites).

> Catatan: detail state machine Telegram (user & admin) sudah terdokumentasi di [`docs/STATE_MACHINE.md`](./STATE_MACHINE.md) dan menjadi rujukan saat memecah flow ke modul `features/*`.

## Milestone 5 — Observability & keamanan (2–4 hari)

Target: log aman (redaction) dan audit trail untuk aksi admin.

- **Redaction log (selesai):**
  - Modul `services/logger.js` dengan `sanitize()` untuk masking field sensitif (apiKey, secretKey, password, userSecretKey, passwordHash, dll).
  - Route admin (`routes/admin/users.js`, `transactions.js`, `gateways.js`) memakai `logger.error()` / `logger.warn()` / `logger.info()` di catch block agar error/payload tidak bocor ke log.
- **Audit log (selesai):**
  - Model `models/AdminAuditLog.js` — event: `USER_BANNED`, `USER_UNBANNED`, `TRX_MANUAL_CONFIRM`, `TRX_MANUAL_REJECT`, `GATEWAY_UPDATED`. Retensi 1 tahun (TTL index).
  - Service `services/adminAudit.js` — `createLogAdminAudit(AdminAuditLog, getCurrentAdmin)` mengembalikan fungsi `(eventType, details, req)` untuk inject ke routes.
  - Pencatatan: ban/unban di `users.js`, manual confirm/reject di `transactions.js`, simpan config gateway di `gateways.js`. Tiap entri menyimpan adminUsername, adminId, ipAddress, userAgent, details.
- Endpoint admin sensitif memakai `monitorAuth`; CSRF dipakai untuk form POST yang relevan.

**Milestone 5 — selesai.** Redaction log dan audit log aksi admin sudah diimplementasikan.

## “Nice to have” setelah stabil

- Pagination + filtering untuk endpoint admin list yang besar (users/transactions).
- ~~Queue background untuk broadcast (agar request tidak timeout pada userbase besar).~~ ✅ **Selesai (Mar 2026)** — Flow admin broadcast via Telegram (`flowBroadcast`, `flowStockBroadcast`) dan API web sama-sama memakai `broadcastQueue`. Pengiriman di background via queue FIFO; response admin langsung kembali.
- Pemisahan worker untuk polling jika traffic sangat tinggi.

