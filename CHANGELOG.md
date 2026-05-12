# Changelog

Semua perubahan penting pada proyek ini didokumentasikan di file ini.

---

## [8.5.0] - 2026-05

### README.md — Engineering Deep-Dive + Performance Benchmarks + Roadmap (2026-05-12)

- **Konteks**: User minta README "biar cakep dan bagus" dengan arsitektur, userflow, dan diagram visual yang lebih kaya — sebagai trust-builder untuk buyer teknis & reseller H2H integrator. Dikerjakan satu paket dengan placement yang menjaga marketing flow tetap rapi (intro → fitur → engineering deep-dive → tech stack → harga → kontak).
- **Perubahan `README.md`**:
  - **Daftar Isi** — ditambah link ke section baru: Engineering Deep-Dive, Performance Benchmarks, Roadmap, Folder Structure, Dokumentasi Teknis.
  - **Section baru `## 🔬 Engineering Deep-Dive`** — kumpulan diagram visual (Mermaid) yang merefleksikan kode di repo, ditempatkan setelah "Fitur Lengkap" sebelum "Tech Stack":
    - **🏢 Multi-Tenant Architecture** — `flowchart TB` dengan 3 sub-graph (Customers / Bot Instances / Shared Infra + External Monitor). Menjelaskan kenapa 1 source code bisa jadi banyak instance tanpa konflik (cache per-process, DB_NAME unik, refId per-DB).
    - **🛤️ User Journey End-to-End** — `flowchart TD` lengkap dari `/start` → main menu → 6 cabang (Produk, Top-Up, Manual Order, Transfer, Riwayat, Panel Pterodactyl) → atomic deduct atau gateway pick → webhook → finalize → delivery. Termasuk cabang Manual Order (input data → admin channel → admin process / refund) & Transfer Saldo.
    - **🚦 State Machine Transaksi** — `stateDiagram-v2` dengan 9 state (`created` → `pending` → `paid` → `processing` → `delivered`/`failed`/`refunded`/`expired`/`cancelled`) + 2 catatan teknis (refId SHA-1 formula & atomic `User.updateOne($inc, $gte)`).
    - **🛡️ 3-Layer Anti Double-Order Idempotency** — `flowchart LR` visualisasi 5x klik bayar → 3 gate (App cache `checkoutInProgress` → DB unique `refId` index → atomic balance check). Plus tabel ringkasan Layer/Lokasi/Mekanisme/Yang dijaga.
    - **🌐 Webhook Callback Pipeline** — `sequenceDiagram` lengkap (Gateway → Webhook → Signature Verifier → Dedup Layer → Finalize → DB → User Telegram + Admin Channel) dengan handle case "Already finalized" (idempotent skip) & "Stock habis" (auto-refund). Plus sub-diagram `flowchart TD` Payment Gateway Decision Tree berdasarkan `BASE_CURRENCY`.
    - **🤝 Reseller H2H Request Lifecycle** — `sequenceDiagram` end-to-end POST `/api/v2/order` dengan verifikasi `X-Api-Key` + `X-Signature` HMAC + `X-Nonce` (TTL 5min) + `Idempotency-Key` cache (15min TTL). Cover semua error case: `409 replay_attack`, `409 idempotency_conflict`, `402 saldo_insufficient`, `409 stock_unavailable`.
    - **🗃️ Data Model (ER Diagram)** — `erDiagram` dengan 9 entity utama (User, Product, Transaction, Voucher, Reseller, ResellerIdempotency, ResellerRequestNonce, SecurityLog, AdminAuditLog) + relasi & atribut kunci. Link ke `docs/DATA_MODEL.md` untuk versi lengkap.
  - **Section baru `## 📈 Performance Benchmarks`** — tabel 8 metric (deteksi pembayaran, order→invoice, user cache hit rate, MongoDB round-trip per /start, concurrent users, H2H p95 latency, memory heap, idempotency reject rate) dengan baseline observed di VPS 2vCPU/2GB + MongoDB Atlas M0. Disclaimer eksplisit ini bukan SLA + cara verifikasi sendiri pakai `curl /admin/health`.
  - **Section baru `## 🗺️ Roadmap`** — `timeline` mermaid dengan 3 phase (✅ Released v8.0.0/v8.3.0/v8.5.0 · 🚧 In Progress v8.6.0 PPOB + v8.7.0 Native USD · 📋 Planned v9.0.0 WhatsApp+Discord + v9.x AI CS). Plus tabel ringkasan status/versi/highlight.
  - **Section baru `## 📁 Folder Structure`** — pohon direktori ASCII menyeluruh dengan komentar per folder (bot/, features/, services/, models/, routes/, public/, server/, monitor/, config/, utils/, docs/, tests/, assets/) + highlight ⭐ untuk file-file kritis (`transactionFinalize.js`, `resellerApi.js`).
- **Perubahan `package.json`**:
  - Tambah field `engines.node: ">=18"` agar npm install warn kalau Node terlalu lawas (sebelumnya cuma disebut di README).
- **Hasil**: README sekarang ~1500+ baris dengan 9 diagram Mermaid (1 lama + 8 baru), 3 tabel teknis baru, 1 ASCII tree. Marketing flow tetap di atas, engineering trust-builder di tengah, conversion section (harga + kontak) tetap di bawah.

### Opsional — GitHub Actions heartbeat commit (2026-05-11)

- **`.github/workflows/repository-heartbeat.yml`** — workflow terjadwal (default **setiap 15 menit** UTC) yang menulis ulang `.github/repo-heartbeat.json` lalu commit + push dengan pesan `[skip ci]` agar workflow lain yang dipicu `push` tidak loop boros.
- **`.github/repo-heartbeat.json`** — placeholder; nilai `lastHeartbeatUtc` diperbarui oleh Actions setelah di-push ke GitHub dan Actions diaktifkan.
- **Catatan:** ini **bukan strategi SEO** untuk peringkat #1 di Google; hanya menjaga repo “terlihat aktif” di GitHub. Lihat komentar di atas workflow untuk risiko (noise `git log`, menit Actions repo privat).

### Update Dokumentasi — README.md & package.json (2026-05-11)

- **Konteks**: User minta `README.md` di-refresh supaya merefleksikan semua fitur production yang sudah ditambahkan sejak versi sebelumnya (Instance Health, BI-Ready Export, Anti Double-Order Idempotency, Reseller API V2, Transfer Saldo antar User, Manual Order System, Multi-Currency Foundation, Localization MS "warranty"). User juga menegaskan: **PPOB Multi-Provider masih maintenance / belum siap release** → harus diberi label jelas di README.
- **Perubahan `package.json`**:
  - `description` diperbarui ke deskripsi multi-tenant + multi-gateway (Indonesia + Malaysia) + multi-currency (IDR/MYR/USD) + Pterodactyl + Reseller H2H V2.
  - `keywords` diperluas: `toyyibpay`, `billplz`, `duitnow`, `fpx`, `pterodactyl`, `reseller-api`, `multi-tenant`, `multi-currency`, `myr`, `idr`, `usd`.
- **Perubahan `README.md`**:
  - Fix versi Node `21+` → `18+ (LTS)` di "Requirements".
  - Section **"🆕 Terbaru"** ditulis ulang dengan 10 fitur production-ready baru (Instance Health Dashboard, Performance & Cache Layer, BI-Ready CSV Export 3-mode, Anti Double-Order Idempotency 3-layer, Transfer Saldo antar User, Manual Order System, Localization MS "warranty", Multi-Currency Foundation USD Phase 1, Reseller API V2 Hardened, PPOB Multi-Provider Beta).
  - Tabel **"⚖️ Perbandingan"** ditambah 6 row baru: multi-currency, Reseller API V2, anti double-order idempotency, health monitoring, BI-ready CSV export, multi-tenant ready.
  - Section **"⚡ Yang Bikin Beda dari Bot Lain"** ditulis ulang dengan 8 differentiator: Anti Duplicate Payment + Anti Double-Order 3-layer, Multi-Currency, Reseller API H2H V2 Hardened, Instance Health Monitor, BI-Ready Export, Transfer Saldo antar User, Manual Order System, Multi-Tenant Performance (LRU + TTL cache).
  - **Admin Panel Preview**: bullet list diperluas untuk Growth Analytics, drag-drop product management, scheduled broadcasts + poll campaign, PWA push notifications, 2FA TOTP + Telegram OTP, IP whitelist, Instance Health menu, Transfer Saldo management, BI Export options, Reseller API management.
  - **`<details>` sections** dirombak/ditambah:
    - **💳 Payment System** — ditegaskan idempotency 3-layer detail (app cache + unique `refId` SHA-1 + atomic `User.updateOne($inc, $gte)`).
    - **🔗 Reseller API (H2H) — V2 Hardened** — ditulis ulang lengkap (X-Api-Key + X-Signature HMAC-SHA256 + X-Nonce TTL + Idempotency-Key, rate limiting, audit log, atomic processing, envelope error RFC 7807, link ke `RESELLER_H2H_API_V2_SPEC.md` & `RESELLER_H2H_CONTRACT_QA_CHECKLIST.md`).
    - **🩺 Instance Health & Performance Monitoring** — section baru detail endpoint `GET /admin/health`, dashboard UI, multi-tenant aware, optimization (LRU + TTL + fire-and-forget update).
    - **💸 Transfer Saldo antar User** — section baru detail atomic transfer, audit log, limit configurable, anti double-transfer, link ke `TRANSFER_SALDO_PLAN.md`.
    - **📝 Manual Order System** — section baru detail prompt input, notifikasi channel, dashboard Pending Orders, auto-refund.
    - **📱 PPOB Multi-Provider — 🚧 Beta / In Development** — section baru dengan **⚠️ warning eksplisit** bahwa PPOB belum production-ready / belum di-release. Listing apa yang sudah ada (skeleton: DigiFlazz/OkeConnect/SanPay/QiosPay, catalog sync, webhook + auto-refund, partial unique index) & apa yang belum (E2E hardening, QA failover, UI user-facing, reconciliation, pricing auto-update). Link ke 5 dokumen developer.
    - **🔒 Security** — diperluas dengan RBAC Owner/Admin/Staff, audit log, encryption-at-rest, anti-spam bot, reset password.
    - **📊 Analytics & Report** — di-rename "BI-Ready", detail 3-mode export (`pretty` + `flat` + `timeseries`), Export Overview dual-mode (`csv` + `flat` 14 kolom RFC 4180), endpoint `GET /admin/analytics/timeseries.json`.
    - **🌐 Multi-Language** — tambah catatan localization MS pakai term "warranty" (bukan "garansi").
    - **📄 Invoice & Notifikasi** — tambah Markdown-safe auto-escape & Telegram retry/fallback.
    - **⚙️ Fitur Tambahan** — refresh "warranty / garansi", banner dinamis, stock broadcast, best seller, critical stock alert.
  - **Cara Menjalankan (Developer)** — diperluas dengan env yang lebih lengkap, multi-instance/multi-tenant tip, health check endpoint, perintah `npm run dev`, akses admin panel.
  - **Catatan Keamanan** — diperluas: jangan commit `storage/.encryption_key`, verifikasi signature webhook, idempotency pattern wajib, validasi `X-Signature` + `X-Nonce` + `Idempotency-Key` untuk H2H, aktifkan 2FA admin.
  - **FAQ** — tambah 5 Q&A baru: multi-tenant readiness, anti double-order mechanism, PPOB status (eksplisit "belum jalan, masih dalam pengembangan"), Power BI / Tableau export, Reseller H2H security.
  - **🧭 Dokumentasi Teknis (Developer)** — ditulis ulang dengan sub-kategori jelas: Navigasi cepat, Architecture & Data, API & Webhook, Payment, Multi-Currency (USD), Operations & Performance, Fitur Bisnis, Customer Support (OpenClaw), PPOB (🚧 Beta dengan warning). Semua referensi `docs/*.md` dikonversi jadi proper Markdown link relatif.
- **Catatan PPOB** — sesuai permintaan user, **semua** menyebut PPOB di README sekarang punya tanda "🚧 Beta / In Development" + warning `⚠️ belum production-ready / belum di-release`. Dokumentasi PPOB tetap di-link untuk developer/early access tapi diberi disclaimer eksplisit. Bagian utama README (Hero, fitur unggulan, paket harga) tidak menonjolkan PPOB sebagai selling point.
- **Verifikasi** — `README.md` & `package.json` lint bersih; semua link relatif valid (file-file di `docs/` sudah ada di working tree).

### Bug Fix Kritis — `E11000 dup key ppobProvider_1_ppobProviderSku_1` saat tambah produk non-PPOB (2026-05-11)

- **Insiden**: User melaporkan gagal menambah produk via panel admin web (`Tambah Produk Baru` → kategori "NETFLIX PREMIUM 💯") dengan log:
  `❌ [ADMIN PRODUCTS] Gagal menambah produk: MongoServerError: E11000 duplicate key error collection: sewa_bot_cybertown.products index: ppobProvider_1_ppobProviderSku_1 dup key: { ppobProvider: null, ppobProviderSku: null }`. User curiga karena emoji di nama kategori — **bukan**.
- **Root cause** — **kombinasi dua bug** di `models/Product.js`:
  1. `ppobProvider` & `ppobProviderSku` di-set `default: null` → setiap produk non-PPOB tersimpan dengan nilai `null` eksplisit (bukan `undefined`).
  2. Compound unique index `(ppobProvider, ppobProviderSku)` memakai `sparse: true`. Di MongoDB **compound sparse index** hanya skip dokumen kalau **semua** field di index `missing`/`undefined`. Karena schema set `default: null`, field-nya **ada** dengan nilai `null` → tetap diindex dengan key `(null, null)`. MongoDB unique index menganggap `null == null` → dokumen pertama OK, dokumen kedua selalu E11000.
- **Fix** — di `models/Product.js`:
  - Hapus `default: null` di `ppobProvider` & `ppobProviderSku` (tetap optional, otomatis `undefined` kalau tidak diset).
  - Ganti `sparse: true` → `partialFilterExpression: { ppobProvider: { $type: 'string' }, ppobProviderSku: { $type: 'string' } }`. Index hanya berlaku untuk dokumen yang punya kedua field sebagai string (produk PPOB asli) — produk non-PPOB **tidak ikut diindex** sehingga tidak mungkin bentrok.
- **Auto-migration** — di `bot.js` (saat `MongoDB Connected`):
  1. Periksa index `ppobProvider_1_ppobProviderSku_1` di collection `products`. Kalau spec belum punya `partialFilterExpression` (artinya masih sparse versi lama) → `dropIndex(...)`.
  2. Normalisasi dokumen lama: `$unset` field `ppobProvider`/`ppobProviderSku` pada semua dokumen yang nilainya `null` (peninggalan `default: null` lama).
  3. `Product.syncIndexes()` → Mongoose otomatis create index baru dengan spec partial.
  4. Idempotent — aman dijalankan setiap startup; tidak melakukan apa-apa kalau index sudah benar.
- **Verifikasi** — Lint bersih pada `models/Product.js` & `bot.js`. Setelah restart, log startup baru akan menampilkan `🔧 [INDEX MIGRATION] Drop old ppobProvider index (sparse → partial)` (sekali) lalu `✅ [INDEX MIGRATION] Product indexes sinkron`. Tambah produk non-PPOB ke kategori apa pun (termasuk yang nama-nya memuat emoji) kini berhasil. Tidak ada dampak ke produk PPOB existing — uniqueness `(ppobProvider, ppobProviderSku)` tetap dijaga untuk produk yang memang punya mapping provider.

### Bug Fix — `goto_products` (tombol "🎁 Promo Spesial" → "Lihat Produk") tidak menampilkan list (2026-05-11)

- **Insiden**: User report `[14:01:55] mengirim: "🎁 Promo Spesial"` lalu `[14:01:58] menekan tombol: "goto_products"` → bot tidak menampilkan list produk apa pun.
- **Root cause**:
  1. Handler `bot.action('goto_products', …)` (`bot.js`) memanggil `ctx.deleteMessage()` (pesan promo dihapus) lalu `handleViewProducts(ctx, { forceSendNew: true })`.
  2. `flowProducts.startViewProducts` meneruskan ke `displayCategoryList(ctx, 0, { forceSendNew: true })`, tapi `ctx.callbackQuery` masih ada (karena ini callback action) → di `displayCategoryList`, sebenarnya branch `forceSendNew` sudah tepat (line 4769–4774), tapi **hanya mengirim pesan list kategori saja**, tanpa mengirim ulang **reply keyboard angka kategori**. Akibatnya pada beberapa kondisi (mis. user datang langsung dari main menu/pesan promo tanpa reply keyboard angka di chat), tampak seperti "tidak ada respon" karena tidak ada keyboard untuk memilih kategori.
  3. Lebih dalam: pada beberapa Telegram client, urutan delete pesan promo + send photo list dapat membuat list tidak ter-render rapi ketika reply keyboard tidak ikut dikirim.
- **Fix**:
  - **`features/user/flowProducts.js`** — `startViewProducts` kini menerima parameter ke-3 `options = {}` dan meneruskan `{ forceFullRender: true }` ke `displayCategoryList` jika dipanggil dengan opsi tersebut.
  - **`bot.js` (`handleViewProducts`)** — tambah parameter `options = {}` dan teruskan ke `flowProducts.startViewProducts`.
  - **`bot.js` (`bot.action('goto_products', …)`)** — kini panggil `handleViewProducts(ctx, { forceFullRender: true })` (sebelumnya `forceSendNew: true`).
  - **`bot.js` (`displayCategoryList`)** — tambah branch baru `if (options.forceFullRender) { … }` yang **mirror first-time path** (line 4834–4848): kirim ulang reply keyboard angka kategori dengan pesan `Done ✓`, lalu kirim pesan list kategori dengan inline pagination. Branch lama `forceSendNew` tetap dipertahankan untuk skenario "Kembali ke List Kategori" (di mana reply keyboard angka masih persistent di chat).
- **Verifikasi** — Lint bersih pada `bot.js` & `features/user/flowProducts.js`. Flow: klik pesan promo → tombol "goto_products" → pesan promo terhapus → reply keyboard angka muncul → list kategori (photo/text dengan inline pagination Prev/Next) muncul → user dapat ketik angka kategori untuk lanjut.

### Bug Fix Kritis — Double-order pada pembayaran Saldo Bot (2026-05-09)

- **Insiden**: User melaporkan `SALDO209341180700` (Rp 650, 12 BLN VIU) tersimpan **dua kali** dalam selisih 5 detik (15:15:30 dan 15:15:35) dari satu klik tombol "Bayar Saldo". Saldo dipotong 2x, stok produk terkonsumsi 2x, user dapat 2 produk identik. Penyebab: dua klik berurutan pada tombol yang sama → dua transaksi tersimpan.
- **Root cause**:
  1. **`features/checkout/processCheckout.js`** — seed idempotency `refId` menggunakan `ctx.callbackQuery.id`, padahal Telegram menerbitkan `callbackQuery.id` baru untuk **setiap klik tombol**. Hasilnya `refId` selalu unik per klik → unique-index `Transaction.refId` tidak terpicu, dua transaksi tersimpan terpisah.
  2. **`bot.js` (`panel_pay:saldo`)** — pakai `generateRefId()` (non-deterministik, `Math.random()`) untuk panel checkout via saldo. Vulnerable pada double-click yang sama.
  3. **`bot.js` (`flashsale_pay_saldo`)** — selain tidak deterministik, **`refId` malah tidak diset sama sekali** (schema `required: true, unique: true`) → `Transaction.save()` selalu gagal `ValidationError`. Tapi `user.saldo -= ...; user.save()` dieksekusi **DULU** → saldo hilang tanpa record. Bonus bug: `lang` direferensikan tapi belum dideklarasikan di scope itu, dan `Product.claimStock()` dipanggil sebelum guard idempotency (stok terbuang saat double-click).
- **Fix** — Idempotency seed deterministik berbasis identitas aksi (bukan identitas klik):
  - **`features/checkout/processCheckout.js`** — `refId` = `SALDO<userSuffix><sha1(userId,type,productKey,qty,amount,messageId,timeBucket)>` (timeBucket 60-detik dipakai hanya bila `message_id` tidak tersedia). Klik kedua pada **tombol yang sama** menghasilkan `refId` identik → unique-index menolak save kedua dengan `code: 11000` → balas `processing_already`.
  - **`bot.js` (`panel_pay:saldo`)** — pola sama (`PANEL<userSuffix><sha1>`). Ditambah refactor: SAVE Transaction dulu (sebelum potong saldo), deduksi saldo via atomic `User.updateOne($inc, $gte)`, rollback Transaction kalau saldo tidak cukup.
  - **`bot.js` (`flashsale_pay_saldo`)** — refactor menyeluruh dengan urutan aman: (a) generate `refId` deterministik `FLASH<userSuffix><sha1>`, (b) SAVE Transaction `PROCESSING` (guard double-click), (c) `claimStock` (rollback tx kalau sold-out), (d) atomic deduct saldo (rollback tx + push stock kembali kalau saldo tidak cukup), (e) update tx → `SUCCESS` + isi `itemDetail`. Sekaligus fix `refId` tidak diset, fix `lang` undefined, dan stok tidak lagi terbuang sebelum guard.
- **Verifikasi** — Simulasi node menunjukkan dua klik pada `message_id` yang sama menghasilkan `refId` identik (dedupe), klik pada `message_id` berbeda menghasilkan `refId` berbeda (allow legitimate new tx). Lint & syntax bersih.
- **Audit lain** — Voucher redeem (`bot.js:7090`) berbasis input **text** (bukan callback button) + `validateVoucher` cek limit per-user → tidak applicable. `services/balanceTransfer.js`, `services/transactionFinalize.js`, `routes/admin/users.js`: sudah pakai pola transaction/atomic update yang aman.

### Admin UX — Export CSV Growth / BI lebih terbaca + mode datar Power BI (2026-05-10)

- **`GET /admin/analytics/growth-export.csv` mode `pretty` (default)** — Format dirombak dari baris “flat” generik `section,key,value,value2` menjadi **blok bertitel** (META, FUNNEL ringkasan + per status, PERIODE, REPEAT, LTV), baris kosong antar blok, header **`Metrik` / `Nilai`** konsisten, kohort sebagai **tabel 3 kolom** dengan header eksplisit, bagian **CATATAN** dari `growth.json`. Ditambah **`repeat.revenueNormalized`** di bagian REPEAT.
- **`GET /admin/analytics/growth-export.csv?format=flat`** — Mode baru: **single sheet datar** dengan 9 kolom konsisten setiap baris (`section,metric,dimension,value,unit,period,filter_start,filter_end,base_currency`). Section `META | FUNNEL | FUNNEL_STATUS | PERIOD | REPEAT | LTV | COHORT | NOTE`. Cocok untuk **Power BI / Sheets / Tableau** — tinggal pivot/filter pakai kolom `section`+`metric` tanpa post-processing. Filename otomatis menyertakan varian (`growth-pretty-…` / `growth-flat-…`).
- **UI Admin** — Link kedua **“Export Flat (Power BI)”** ditambahkan di samping link “Export CSV (BI)” pada section Growth Analytics (`public/admin.html`, `public/js/admin-analytics.js`). Key i18n `growthExportCsvFlat` ditambahkan untuk **id / en / ms** (`public/js/admin-i18n.js`). Dokumentasi di `docs/API.md`.

### Admin UX — Mode `flat` untuk Export Laporan overview (Power BI) (2026-05-11)

- **`GET /admin/overview/export?format=flat`** — Mode baru di sisi handler `bot.js`. Mengembalikan **single sheet datar tanpa BOM dan tanpa blok ringkasan**, dengan 14 kolom konsisten: `ref_id, created_at, user_id, telegram_username, product_name, type, quantity, total_amount, currency, status, payment_method, period, filter_start, filter_end`. Timestamp **ISO 8601** (`createdAt`), kode mata uang dinormalkan **uppercase**, nilai numerik mentah (`Number`), kolom meta `period/filter_start/filter_end` dibawa di setiap row → tinggal pivot/filter di Power BI / Sheets / Tableau tanpa post-processing.
- **Backwards compatible** — Default `format=csv` (atau tanpa parameter) tetap menghasilkan format **pretty** lama (UTF-8 BOM + blok ringkasan judul/periode/total + tabel detail) → tombol "Export Laporan" lama tidak berubah perilakunya.
- **UI Admin** — Tombol kedua **"Export Flat (BI)"** ditambahkan di samping "Export Laporan" pada section overview (`public/admin.html`). `public/js/admin-dashboard.js` menyetel `href` kedua tombol setiap filter periode diterapkan + refresh href tepat sebelum klik (jaga-jaga user ubah tanggal tanpa klik Terapkan). Key i18n `exportReportFlat` ditambahkan untuk **id / en / ms** (`public/js/admin-i18n.js`).
- **Verifikasi** — Smoke test: 14 kolom konsisten di setiap baris (rectangular), tanpa BOM, ISO timestamp lengkap, currency `myr` ter-normalize jadi `MYR`, koma & kutip dalam nama produk ter-escape sesuai RFC 4180.

### Admin UX — Time-Series CSV untuk chart tren (Power BI) (2026-05-11)

- **`services/adminAnalytics.js#buildTimeSeriesReport()`** — Fungsi baru: agregasi per bucket waktu (**hari** atau **minggu**) memakai `$dateTrunc` (Mongo 5+). Empat aggregation pipeline ringan digabung jadi peta per-tanggal: SUCCESS PRODUCT (pendapatan + pembeli unik + count, per currency), PRODUCT created (count per status untuk funnel harian), pembelian pertama per user (cohort signal harian/mingguan), SUCCESS TOPUP. Output `timeseries[]` berisi 10 metrik per bucket: `revenue_success`, `paying_buyers`, `arpu`, `tx_created`, `tx_success`, `tx_failed`, `tx_pending`, `conversion_pct`, `new_buyers`, `topup_revenue` — pendapatan dinormalisasi ke `baseCurrency` toko.
- **`GET /admin/analytics/timeseries.json`** — Endpoint baru untuk preview JSON (chart dashboard / debugging). Query: `period`, `start`, `end`, `granularity=day|week` (default `day`).
- **`GET /admin/analytics/growth-export.csv?format=timeseries`** — Mode export ketiga: **long format** 9 kolom konsisten (`date,metric,value,unit,granularity,period,filter_start,filter_end,base_currency`). Setiap tanggal memunculkan 10 baris (1 per metrik) dengan urutan deterministik. Kolom `date` berformat `YYYY-MM-DD` agar otomatis dikenali sebagai sumbu waktu di Power BI / Sheets / Tableau. Filename: `growth-timeseries-day-…` atau `growth-timeseries-week-…`.
- **UI Admin** — Link **“Export Time Series”** + selector granularitas **`Per hari | Per minggu`** ditambahkan di section Growth Analytics (`public/admin.html`). Wiring di `public/js/admin-analytics.js` (event `change` granularity langsung update href, plus update saat refresh & klik). Key i18n baru `growthExportCsvTimeseries`, `tsGranularityDay`, `tsGranularityWeek` untuk **id / en / ms** (`public/js/admin-i18n.js`).
- **Verifikasi** — Smoke test menunjukkan output rectangular (selalu 9 kolom), header benar, 10 metrik hadir per bucket dengan urutan deterministik (`revenue_success → topup_revenue`).
- **Dokumentasi** — `docs/API.md` diperbarui dengan tiga mode export + endpoint `timeseries.json`; `task.md` diperbarui ke status selesai.

### Observability & multi-instance

- **`GET /admin/health`** (auth monitor, sama seperti `/admin/overview.json`) — JSON untuk ops: status MongoDB, **`userCache`** (hits/misses/hitRate, TTL, ukuran cache), `memory` proses Node, uptime. Respons HTTP **503** jika MongoDB tidak connected. Dokumentasi di `docs/API.md`; runbook USD hybrid menautkan endpoint ini untuk pantau beban cache saat smoke test.
- **Section UI `Instance Health`** di **monitor dashboard** (`public/monitor.html`) — visualisasi langsung dari `/admin/health`: badge status (Healthy/Connecting/Degraded), 4 stat card ringkas (MongoDB, Cache Hit Rate, Heap Used, Uptime), dan 3 panel detail (User Cache lengkap dengan progress bar hit rate, Memory dengan progress bar heap, Instance info: PID/Node/Uptime/Endpoint). Auto-refresh 10 detik + tombol refresh manual. Mobile menu juga dapat quick stat baru (MongoDB pill + Cache Hit Rate %), tersinkron otomatis. Cocok untuk monitor terpisah per instance bot (multi-tenant).

### Versi & UX

- **Bump** — Nomor versi proyek **8.5.0** di `package.json`, `package-lock.json`, fallback `BOT_VERSION` di `bot.js`, `routes/admin/settings.js`, `.env.example`, placeholder panel admin, `README.md`, `task.md`, dan referensi ringan di dokumentasi.
- **`/versibot`** — Tampilan diperbarui: format <b>HTML</b> (teks tebal/jelas di Telegram), blok ringkas (versi, Node.js, mata uang toko), daftar gateway per baris, status Pterodactyl / PPOB / Reseller API, ringkasan fitur lebih padat dan mudah dibaca di HP.

### PPOB H2H DigiFlazz (hardening + operasional admin)

- **Hardening adapter DigiFlazz** — Parser transaksi/status diperketat agar response provider yang tidak valid tidak dianggap sukses; mapping status distandarkan melalui `services/ppob/providers/digiflazz/mapper.js`, dipakai oleh `transaction.js` dan `status.js`.
- **Webhook callback end-to-end (belum go-live produksi)** — Alur callback `POST /digiflazz-callback` sudah disiapkan untuk update status PPOB real-time, termasuk auto-refund saldo ketika status provider `FAILED`/`EXPIRED` (`routes/webhooks.js`, wiring `bot.js`), namun masih tahap pengembangan/hardening lanjutan sebelum diaktifkan penuh.
- **Callback security** — Validasi secret callback DigiFlazz di adapter webhook (`services/ppob/providers/digiflazz/webhook.js`) + dokumentasi env `PPOB_DIGIFLAZZ_CALLBACK_SECRET` / `PPOB_DIGIFLAZZ_CALLBACK_URL` di `.env.example`.
- **Sinkron katalog PPOB** — Tambah endpoint admin manual sync `POST /admin/products/ppob/sync` (upsert berbasis `ppobProvider + ppobProviderSku`) dan field model `ppobProvider`, `ppobProviderSku`, `ppobLastSyncedAt` + unique sparse index di `models/Product.js`.
- **UX admin untuk operasional PPOB** — Panel Produk sekarang punya tombol **Sync PPOB Now**, dropdown pemilih provider (Digiflazz/Okeconnect/Sanpay/Qiospay), badge **Last sync**, dan endpoint `GET /admin/products/ppob/last-sync` untuk monitoring sinkronisasi.

### Dokumentasi & Kontrak API

- **Sinkron kontrak FE/BE H2H** — `docs/API.md` diperbarui agar selaras dengan implementasi Reseller H2H saat ini: header signature v2, aturan `Idempotency-Key`, formula signing, contoh response sukses, dan envelope error standar.
- **Release docs alignment** — `docs/RESELLER_H2H_API_V2_SPEC.md` dirapikan: checklist implementasi ditandai sesuai status aktual (yang sudah aktif vs yang masih backlog), serta catatan status fase v2 diperjelas.
- **Checklist integrator siap pakai** — ditambahkan `docs/RESELLER_H2H_CONTRACT_QA_CHECKLIST.md` untuk verifikasi kontrak endpoint H2H per endpoint (happy path, error path, idempotency replay/conflict, nonce replay), lalu diindeks di `docs/INDEX.md` dan ditautkan dari `README.md`.

### Multi-currency USD (Phase 1 — Foundation USD)

- **Plan dokumen** — Ditambahkan `docs/USD_INTEGRATION_PLAN.md` (4 fase: Foundation USD → Multi-pair exchange rate → Native USD gateway → Multi-currency per produk + Reseller USD). Diindeks di `docs/INDEX.md`, ditautkan di `README.md` dan `task.md`.
- **`utils/currency.js`** — Tambah cabang `USD`: locale `en-US`, simbol `$`, helper `getFractionDigits` (USD/MYR = 2 desimal, IDR = 0). Tambah konstanta dan getter `EXCHANGE_RATE_USD_IDR`, `EXCHANGE_RATE_USD_MYR`, fungsi konversi `convertUSDtoIDR`/`convertIDRtoUSD`/`convertUSDtoMYR`/`convertMYRtoUSD`, dan formatter `formatDualFromUSD` untuk display dual-currency.
- **`utils/i18n.js`** — `normalizeCurrencyCopy` sekarang juga menangani `BASE_CURRENCY=USD`: otomatis menormalkan teks `Rp`/`Rupiah`/`RM`/`Ringgit` → `$`/`USD` agar copy konsisten saat mode USD aktif (tanpa menyentuh kode produk seperti `RM10`).
- **Admin Env Config** — Dropdown `BASE_CURRENCY` dan `CURRENCY_LOCALE` di `public/admin.html` ditambah opsi `USD` / `en-US (US)`, plus helper text yang menjelaskan Phase 1. Validasi front-end (`public/admin.html`) dan back-end (`routes/admin/settings.js`) memperluas allowlist menjadi `MYR|IDR|USD`.
- **Helper format admin** — `public/js/admin-currency.js`, `public/js/admin-shared.js`, dan `public/js/admin-core.js` sekarang sadar USD (default locale `en-US`, 2 desimal, simbol `$`).
- **Konfigurasi & dokumentasi** — `.env.example` menambahkan komentar mode USD untuk `BASE_CURRENCY` dan kunci baru `EXCHANGE_RATE_USD_IDR`, `EXCHANGE_RATE_USD_MYR`. `docs/DATA_MODEL.md` memperluas enum `currency` dan `paymentCountry` (USD = `GLOBAL`, dengan catatan native gateway = Phase 3). `README.md` menambahkan tabel ringkas currency support (MYR/IDR/USD).
- **Catatan status** — Phase 1 hanya menyelesaikan **display + config**. Konversi otomatis pada checkout, gateway native USD, dan Reseller H2H multi-currency masih terkunci pada Phase 2–4 (lihat `docs/USD_INTEGRATION_PLAN.md`).

### Multi-currency USD (Phase 2 — Multi-Pair Exchange Rate + Hybrid Mode)

- **`services/exchangeRate.js`** — Refactor besar (backward-compatible) menjadi service generic multi-pair: `getRate(from, to)` dan `convert(amount, from, to)` mendukung pasangan `IDR↔MYR`, `USD↔IDR`, `USD↔MYR` dengan cache per pair (TTL 1 jam) dan fallback rate dari env (`EXCHANGE_RATE_IDR_MYR`, `EXCHANGE_RATE_USD_IDR`, `EXCHANGE_RATE_USD_MYR`).
- **`utils/currency.js`** — Tambah `convert(amount, from, to)` (sync, pakai env rate, rounding per currency) dan `formatDual(amount, from, to)` untuk caption seperti `"$ 1.99 (~Rp 31.420)"`.
- **`utils/i18n.js`** — Tambah helper `isUsdHybridMode()` (true bila `BASE_CURRENCY=USD` + `ALLOW_LOCAL_GATEWAYS_IN_USD=true`), `isUsdNativeMode()`, dan `formatUsdHybridCaption(amountUsd)` — output dual-currency mengikuti `CURRENCY_LOCALE` (`id-ID` → `~Rp ...`, lainnya `~RM ...`).
- **`bot.js`** — `getOrderedEnabledGateways()` mengenal mode USD: hybrid (semua gateway lokal IDR/MYR yang aktif terpakai) atau native (hanya `USD_NATIVE_GATEWAYS`, masih kosong sampai Phase 3). `logPaymentConfigStatus()` menambahkan warning operasional untuk USD mode tanpa gateway aktif.
- **Admin Env Config** — `routes/admin/settings.js` memvalidasi env baru (`ALLOW_LOCAL_GATEWAYS_IN_USD`, `EXCHANGE_RATE_USD_IDR`, `EXCHANGE_RATE_USD_MYR`) di tahap save, dan menyajikannya kembali ke admin UI saat read. `public/admin.html` menambahkan toggle `ALLOW_LOCAL_GATEWAYS_IN_USD`, input rate manual USD↔IDR/MYR, helper text dinamis (mode USD-native vs hybrid), serta validasi frontend.
- **`.env.example`** — Tambah blok dokumentasi USD HYBRID MODE: penjelasan flag `ALLOW_LOCAL_GATEWAYS_IN_USD` (default `false`) lengkap dengan dampak ke selektor gateway dan caption dual-currency.
- **Dokumen & checklist** — `docs/USD_INTEGRATION_PLAN.md` di-bump ke v1.2: Phase 2 ditandai ✅ selesai, scope/file/acceptance criteria diperinci, roadmap sprint diperbarui dengan kolom Status, master checklist Phase 1 & 2 ditick.
- **Catatan status** — Phase 2 melengkapi konversi rate + selektor gateway + helper i18n. Caption dual-currency akan dipasang di template pesan (checkout, top-up, riwayat) bersamaan dengan rilis gateway USD-native pertama di **Phase 3**. Mode lama (`BASE_CURRENCY=IDR` dan `MYR`) tidak berubah perilaku (regression aman).

### Multi-currency USD (Phase 3 — Hybrid Production Wiring)

> Catatan: Phase 3 di-pivot menjadi **Hybrid Production Wiring** (USD shop
> memakai gateway lokal IDR/MYR, dual-currency caption + audit trail end-to-end).
> Gateway **USD-native** (Stripe/Cryptomus/PayPal) di-rename ke **Phase 4** di
> `docs/USD_INTEGRATION_PLAN.md` v1.3.

- **Schema audit trail** — `models/Transaction.js`: `currency` enum sekarang
  menerima `USD`, ditambah field optional `originalCurrency`, `displayAmount`,
  `appliedRate` untuk merekam transaksi hybrid (USD ditampilkan, dibayar via
  gateway lokal). Schema lama tetap valid (semua field optional).
- **Konversi & caption checkout** — `features/checkout/processCheckout.js`
  memakai helper baru `applyHybridAuditFields(...)` untuk populate audit trail
  saat USD → IDR/MYR. Konversi nominal pakai `convert()` dari
  `utils/currency.js` (single source of truth). Caption dual-currency
  `$ X.YY ≈ Rp/RM Z` dipasang di seluruh template payment (checkout produk,
  top-up, panel) untuk gateway lokal: Pakasir, Qiospay, AutoGoPay,
  Orderkuota, Midtrans, Tripay, iPaymu, VioletPay, Sanpay, ToyyibPay, Chip,
  Billplz.
- **Top-up dynamic per currency** — `features/user/flowTopup.js` minimum
  amount, preset, hint, dan contoh nominal sekarang dinamis mengikuti
  `BASE_CURRENCY`. Mode USD parser pakai `parseFloat` (input desimal seperti
  `$ 1.99`), IDR/MYR tetap integer.
- **Riwayat transaksi user** — `features/user/flowHistory.js`: tabel
  pembelian dan deposit menampilkan `$ 1.99 ≈ Rp 31.420` saat transaksi
  hybrid (auto-detect dari `originalCurrency` + `appliedRate`).
- **Admin panel dual-currency** — Backend (`routes/admin/transactions.js` —
  manual review queue + pending orders, `routes/admin/users.js` — modal user
  detail, dan `bot.js` — overview `recentTransactions`) sekarang mengirim
  field hybrid audit (`displayCurrency`, `displayAmount`, `gatewayCurrency`,
  `gatewayAmount`, `appliedRate`, `isHybrid`). Frontend
  (`public/js/admin-currency.js`) menambahkan helper baru
  `formatHybridAmount(trx, fallback)` yang mengembalikan
  `$ 1.99 ≈ Rp 31.442` saat `isHybrid` dan fallback ke `formatAdminCurrency`
  saat tidak. `public/admin.html` dipakai di recent transactions, manual
  review queue, pending orders, dan modal transaksi user.
- **Dokumentasi & roadmap** — `docs/USD_INTEGRATION_PLAN.md` di-bump ke v1.3:
  Phase 3 diberi label **USD Hybrid Production Wiring 🟢 SELESAI**, scope/file
  list/acceptance criteria diperinci, roadmap sprint diperbarui menjadi 5
  sprint, master checklist Phase 3 ditick. Phase 3 lama (USD-native gateway)
  di-rename ke Phase 4, Phase 4 lama (multi-currency per produk + reseller)
  ke Phase 5.
- **Catatan status** — Phase 3 menutup gap "shop USD siap produksi" tanpa
  butuh gateway USD-native baru: USD ditampilkan ke user, gateway IDR/MYR
  memproses pembayaran, dan tiap transaksi mencatat audit trail (original
  USD + applied rate + nominal lokal). Mode `BASE_CURRENCY=IDR` /
  `BASE_CURRENCY=MYR` tidak berubah perilaku — fallback ke single-currency
  saat `originalCurrency` tidak ada (regression aman). Gateway USD-native
  (Stripe / Cryptomus / PayPal) menyusul di **Phase 4**.

---

## [7.5.0] - 2026-04

### 📦 Versi

- **Bump major** — Nomor versi proyek diseragamkan ke **7.5.0** di `package.json`, `package-lock.json`, `bot.js` (`BOT_VERSION`), `.env.example`, panel admin (placeholder env), `README.md`, dan dokumentasi terkait.

### 💳 Billplz (Malaysia) & selaras checkout

- **Billplz** — Gateway MYR (halaman bill: FPX / e-wallet / DuitNow termasuk QR sesuai koleksi; bot kirim link): `services/payment/billplz.js`, `config/paymentGateways.js`, webhook `POST /billplz-callback` di `routes/webhooks.js`, admin `routes/admin/gateways.js` + UI `public/admin.html`, alur `processCheckout` / top-up / saldo (`features/checkout/processCheckout.js`, `flowSaldo`, `flowTopup`), env `BILLPLZ_*` di `.env.example`.
- **Panel Pterodactyl** — `processPanelCheckout` di `bot.js` menampilkan tombol gateway dari **`getOrderedEnabledGateways()`** (filter ke gateway yang punya handler `panel:`), sejajar dengan checkout produk & top-up. Di `features/checkout/processCheckout.js`, transaksi `panel:` mendukung **ToyyibPay**, **CHIP**, **Billplz**; nominal dari **`transaction.totalBayar`**; cabang **Tripay** panel diperbaiki (pakai transaksi panel & `panelDesc`, tidak membuat transaksi produk baru).

### 📚 Dokumentasi

- **docs/INDEX.md** — Indeks navigasi ke seluruh file `.md` di `docs/` + pointer ke `task.md`, `README`, layer payment.
- **Dokumentasi payment** — Hapus `docs/PAYMENT_QRISPY.md` (tidak dipakai). `services/payment/README.md`: **Violet Pay (Violet Media Pay)** status ✅ Ready (selaras `violetpay.js` + webhook/polling). `docs/PAYMENT_GATEWAY_CANDIDATES.md`: hapus bagian Qrispy.
- **Sinkron dok** — `docs/API.md` + `docs/PAYMENT_CALLBACK_URL.md`: daftar webhook lengkap (Qiospay, Billplz, dll.); perbaiki bagian yang menyatakan QIOSPAY hanya polling. `services/payment/INTERFACE.md` (Qiospay: webhook + mutasi). `services/payment/index.js` (JSDoc), `docs/PAYMENT_DESIGN.md` (daftar gateway ID), tabel nama **Violet Pay** di `services/payment/README.md`.
- **README.md** — Penyebutan **12+** gateway; tabel & teks untuk **Billplz**; Malaysia support untuk produk, top-up, dan **beli/perpanjang panel**; FAQ & multi-region; link `docs/PAYMENT_CALLBACK_URL.md`.

---

## Rilis 2026-03 — Pterodactyl, CHIP & produksi

### ✨ Fitur Baru

- **Pterodactyl Panel – Fitur Lengkap**
  - **Renew/Extend** — User perpanjang server dari bot sebelum expired (saldo & QRIS)
  - **Link langsung ke server** — Tombol Login mengarah ke `panel.url/server/{serverId}`
  - **Manual Extend/Suspend dari Admin** — Admin bisa extend (tambah hari), suspend, unsuspend server user dari Daftar User Panel
  - **Uji Koneksi** — Tombol "Uji Koneksi" di Panel Packages untuk cek koneksi ke Pterodactyl
  - **Fetch & Isi Otomatis** — Nest, Egg, Location, Node terisi dari panel (sudah ada, diperkuat)

- **Production Readiness**
  - **Health Check** — Endpoint `GET /health` (MongoDB status, uptime) untuk monitoring/load balancer
  - **Graceful Shutdown** — Tangkap SIGINT/SIGTERM: stop bot → tunggu proses aktif → tutup HTTP server → tutup MongoDB
  - **.env.example** — Template lengkap untuk setup baru

### 🔧 Perbaikan & Keamanan

- **Security**
  - API key Pterodactyl (PTERO_API_KEY, PTERO_APP_API_KEY) di-masking di env-config (tidak dikirim ke frontend)
  - Hapus `rawContent` dari response env-config (cegah bocor isi .env)
  - `.env` dan `.env.*` ditambahkan ke `.gitignore` (`.env.example` tetap di-track)

- **Bug**
  - Fix redeclare `expiresAt` di handler `panel_view_mine`

### 📦 Teknis

- **Backend**
  - `server/shutdownHandler.js` — graceful shutdown dengan urutan: bot.stop → wait → server.close → mongoose.close
  - `features/pterodactyl.js` — endpoint `extend-user`, `suspend-user`, `unsuspend-user`; response panel-users tambah `serverLink`
  - `services/panelFinalize.js` — link langsung ke server di notifikasi pembelian & renew
  - `bot.js` — endpoint `/health`; link langsung di panel_view_mine

- **Frontend**
  - Daftar User Panel — tombol Server, Extend, Suspend, Unsuspend
  - Panel Packages — tombol Uji Koneksi

- **Versi**
  - Sinkron penomoran versi di artefak proyek (`package.json`, `.env.example`, `bot.js`)

### 📚 Dokumentasi

- **README.md** — Gateway **Orderkuota** (tabel, Terbaru, detail payment/multi-region); FAQ setup `ORDERKUOTA_*` & `ORDERKUOTA_DEBUG`; langkah run memakai `.env.example` + `BASE_CURRENCY` / locale; badge & footer versi di README; penyebutan **11+** payment gateway.

### 🧹 Pembersihan repo (root)

- **Dokumentasi** — `ANTI-SPAM-CONFIG.md`, `MENGURANGI-BARIS-BOT-JS.md`, `MULTI-PLATFORM-PLAN.md` dipindah ke folder `docs/`.
- **Dihapus (tidak dipakai runtime):** `append_env.js` (kosong), `patch_admin.js` (skrip patch sekali pakai), `_buildFinalize.js` + `_finalizeBody.txt` (generator refactor lama), `pnpm-lock.yaml` (proyek memakai **npm** / `package-lock.json`), backup `2603.zip`, log `crash.log` / `error.log`.
- **`.gitignore`** — pola `*.log` agar log lokal tidak ter-commit.

---

## [5.3.1] - 2026-03

### 🔧 Perbaikan

- **Multi-language Bot & Web Panel (Lengkap)**  
  - **Bot**: Pesan OTP 2FA, forgot password, reset password ke Telegram admin sekarang memakai `t(lang, 'key')` dari `utils/i18n.js` (ID/EN/MS). Mengikuti `admin.language` atau `getReqLang(req)`.
  - **Web Panel UI**:  
    - `admin-core.js`, `admin-shared.js`, `admin-products.js` — semua string (toast, loading, error, empty, timeAgo, confirm) pakai `tt()` (i18n).  
    - `monitor-login.html`, `forgot-password.html`, `reset-password.html` — i18n.js dimuat, `data-i18n` untuk teks statis, JS inline pakai `tt()` untuk error/success.  
    - `index.html` — i18n.js, `data-i18n` untuk navbar, hero, section headers.  
  - **Pemilihan bahasa**: URL param `?lang=en` atau `?lang=ms` untuk override di halaman login/forgot/reset.
  - Dokumentasi progress: `docs/I18N_PROGRESS.md` diperbarui dengan status Bot 100%, Web Panel API 100%, Web Panel UI ~95%. Monitor dashboard sengaja di-keep (tidak prioritas).

---

## [5.3.0] - 2026

### ✨ Fitur Baru

- **Balance Audit**  
  - Service `services/balanceAudit.js` untuk menghitung **real balance** dari transaksi (Total Deposit − Total Spending).  
  - Validasi sebelum pembayaran saldo untuk deteksi manipulasi/penipuan.  
  - Tampilan di Admin Panel (User Detail): Real Balance, Total Deposit, Total Spending, Abuse logs.

- **Logo Toko → QRIS**  
  - Logo Toko (Admin Panel) disinkronkan ke gateway QRIS (Qiospay, Sanpay, Midtrans).  
  - Saat logo diupload atau disimpan, semua gateway yang mendukung logo diperbarui otomatis.  
  - Fallback: jika gateway belum punya `logoPath`, sistem memakai Logo Toko dari Setting `store_logo`.  
  - Channel notification juga memakai Logo Toko sebagai fallback.

- **Refactor Checkout & Finalize**  
  - Logika checkout dipindah ke `features/checkout/processCheckout.js` dan `features/checkout/paymentMessage.js`.  
  - Logika finalisasi transaksi dipindah ke `services/transactionFinalize.js` dengan dependency injection.

- **Broadcast Queue (Flow Telegram)**  
  - Flow admin broadcast via Telegram (`flowBroadcast`, `flowStockBroadcast`) sekarang memakai `broadcastQueue` yang sama dengan API web.  
  - Menggantikan `setImmediate` loop: response admin langsung kembali, pengiriman di background via queue FIFO.  
  - `services/broadcastQueue.js` diperluas: dukungan payload Telegram (fileId, copyMessage), `adminChatId` untuk notifikasi selesai, `completionMessage` opsional.  
  - Trigger proses segera saat job baru ditambahkan (tanpa menunggu interval 2 detik jika worker idle).

### 🔧 Perbaikan

- **Proteksi XSS (Admin Panel)**  
  - Helper `safeEsc()` dan `escapeHtml()` di `public/admin.html` untuk escape data user sebelum di-render ke DOM.  
  - Mencegah injection script pada nama user, produk, transaksi, pending orders, abuse logs, dan elemen dinamis lain.

- **Bug "Kembali ke List Kategori"**  
  - Tombol kembali ke list kategori sekarang menampilkan daftar kategori kembali dengan benar.  
  - `displayCategoryList` pakai `forceSendNew`, simpan `lastCategoryListMessageId` di user state; `handleListKategoriAction` di `flowProducts.js` diperbaiki.

- **Pakasir – Double Pembelian**  
  - Atomic claim di `finalizeTransaction`: `findOneAndUpdate` mengubah status PENDING → PROCESSING sehingga hanya satu proses yang finalize.  
  - Model `Transaction`: status `PROCESSING` ditambah.  
  - Validasi minimum Rp 500 sebelum panggil API Pakasir (checkout produk & panel).  
  - Perbaikan logging error callback Pakasir di `routes/webhooks.js`.  
  - Pakasir: tambah `cancelTransaction()`, `simulatePayment()`, update dokumentasi di `services/payment/pakasir.js`.

- **Format Timestamp Log**  
  - Milidetik dihapus dari format jam: `[HH:mm:ss]` (sebelumnya `[HH:mm:ss.SSS]`).

- **Multi-language Checkout & Pembayaran (Tahap 1)**  
  - Semua pesan error dan notifikasi di `processCheckout.js` dan `paymentMessage.js` sekarang pakai `t(lang, key)` (id/en/ms).  
  - Key baru: `checkout_*`, `payment_*`. User EN/MS melihat pesan checkout dalam bahasa yang sesuai.

- **Multi-language User Flows (Tahap 2)**  
  - `flowSupport.js`: pesan sukses/gagal terkirim ke admin (text & media) pakai `support_message_success`, `support_message_failed`, `support_media_success`, `support_media_failed`.  
  - `flowRefund.js`: error transaksi tidak ditemukan, tidak ada garansi, error ambil transaksi pakai `refund_trx_not_found`, `refund_no_warranty`, `refund_fetch_error`.  
  - `flowStockReport.js`: error laporan stok pakai `stock_report_error`.

- **Multi-language Admin Telegram (Tahap 3)**  
  - `flowStockBroadcast.js`: preview, tombol LANJUTKAN/BATAL, pesan mulai/dibatalkan/selesai pakai `stock_broadcast_*`.  
  - `commandsSettings.js`: `/setsticker`, `/setwelcomesticker`, `/setimage` — semua pesan pakai `admin_setsticker_*`, `admin_welcomesticker_*`, `admin_setimage_*`.

- **Multi-language Middleware (Tahap 4)**  
  - `bot/middlewares/global.js`: pesan anti-spam pakai `antispam_wait` (placeholder `{seconds}`).

### 📦 Teknis

- **Backend**  
  - `services/balanceAudit.js`: `getTotalDeposit`, `getTotalSpending`, `getRealBalance`, `validateBalanceBeforePayment`.  
  - `routes/admin/settings.js`: sync Logo Toko ke gateway Qiospay, Sanpay, Midtrans saat save/upload.  
  - `routes/admin/gateways.js`: fallback Logo Toko untuk QRIS jika `logoPath` gateway kosong.  
  - `bot.js`: inject store_logo sebagai fallback saat build config checkout.  
  - `services/broadcastQueue.js`: `sendPayloadToUser()`, dukungan job `{ payload, adminChatId, completionMessage }`, trigger segera pada `addJob`.  
  - `features/admin/flowBroadcast.js`, `flowStockBroadcast.js`: pakai `broadcastQueue.addJob()` menggantikan `setImmediate`.  
  - `services/transactionFinalize.js`: atomic claim PENDING→PROCESSING, `models/Transaction.js` status PROCESSING.  
  - `services/payment/pakasir.js`: `cancelTransaction()`, `simulatePayment()`, validasi min Rp 500.  
  - `bot.js`: `getTimestamp()` tanpa milidetik, helper `sendCategoryList` untuk display kategori.

---

## [5.2.0] - 2024

### ✨ Fitur Baru

- **Payment Gateway iPaymu (QRIS)**  
  - Integrasi iPaymu untuk pembayaran QRIS via payment page redirect.  
  - User dapat memilih metode bayar (QRIS, dll.) di halaman iPaymu.  
  - Konfigurasi dari Admin Panel: VA, API Key, Notify URL, Sandbox.  
  - Hot reload: simpan config dari panel tanpa restart bot.  
  - Fallback: jika iPaymu belum aktif dari env, config di-load dari database (Setting) saat checkout.  
  - Webhook callback dengan validasi signature (HMAC-SHA256).

- **Dokumentasi**  
  - **OPTIMASI-TELEGRAM-BOT.md** — panduan mengurangi penggunaan Telegram Bot API (pesan, gambar, broadcast) untuk efisiensi biaya/quota.  
  - **`docs/MENGURANGI-BARIS-BOT-JS.md`** — panduan refactor & modularisasi untuk mengurangi jumlah baris di `bot.js` (pindah ke `features/`, `bot/`, `server/`).

### 🔧 Perbaikan

- **ToyyibPay**  
  - Tombol "Cek Status" menggunakan callback `check_status:${refId}` (handler yang benar).

- **Admin Panel – Payment Gateway**  
  - Tab dan form iPaymu (VA, API Key, Notify URL, Sandbox, Aktifkan).  
  - API Key tidak ditimpa jika field dikosongkan saat edit (sesuai hint "Kosongkan jika tidak ingin mengubah").  
  - Preview QR untuk iPaymu dinonaktifkan dengan penjelasan (payment page redirect).

- **Checkout**  
  - Fallback iPaymu di `processCheckout`: load config dari Setting dan panggil `reconfigure` jika gateway belum aktif.

### 📦 Teknis

- **Backend**  
  - `routes/admin/gateways.js`: GET/POST support untuk gateway `ipaymu`.  
  - `services/payment/ipaymu.js`: service create payment (redirect URL).  
  - `services/payment/index.js`: registrasi dan reconfigure iPaymu.  
  - `routes/webhooks.js`: route `POST /ipaymu-callback` dan validasi signature.

- **Versi**  
  - Versi bot dinaikkan ke **5.2.0** (`package.json`, `.env` BOT_VERSION, fallback di `bot.js`).

### 📌 Catatan

- iPaymu tidak mengembalikan raw QRIS string; hanya URL payment page. User buka link lalu pilih QRIS di halaman iPaymu.  
- Callback iPaymu memakai VA sebagai secret untuk validasi signature.

---

## [4.5.0] dan sebelumnya

Perubahan untuk versi 4.5.0 dan sebelumnya tidak didokumentasikan di sini. Riwayat lengkap ada di commit Git.
