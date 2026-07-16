# Changelog

Semua perubahan penting pada proyek ini didokumentasikan di file ini.

---

---

## [8.9.0] - 2026-07-13

### Telegram Bot API 10.2 — Rich Message receipt

- **Receipt produk + top-up aktif** — toggle Rich Messages kini benar-benar mencoba `sendRichMessage`; plain Markdown menjadi fallback aman pada seluruh error API tanpa mengulang finalisasi transaksi atau delivery.
- **Payload + data aman** — keyboard dan efek pesan ikut diteruskan, sedangkan credential stok dinamis di-escape sebelum dirender sebagai spoiler.
- **QR tidak berubah** — pembayaran QR tetap dikirim sebagai satu foto + caption sampai contract test Bot API 10.2 selesai.

### Telegram Bot API 10.2 — Rich Message receipt

- **Receipt produk + top-up aktif** — toggle Rich Messages kini benar-benar mencoba `sendRichMessage`; plain Markdown menjadi fallback aman pada seluruh error API tanpa mengulang finalisasi transaksi atau delivery.
- **Payload + data aman** — keyboard dan efek pesan ikut diteruskan, sedangkan credential stok dinamis di-escape sebelum dirender sebagai spoiler.
- **QR tidak berubah** — pembayaran QR tetap dikirim sebagai satu foto + caption sampai contract test Bot API 10.2 selesai.

### Dokumentasi promosi sewa

- **Halaman calon penyewa** — tambah `PROMOSI_SEWA_BOT.md` berisi manfaat, fitur, gateway, status layanan, paket harga, alur aktivasi, demo, dan kontak tanpa mengubah fungsi README sebagai overview/progress teknis.

### Rental — Bot expiry production-safe

- **Pterodactyl Client API source** — expiry instance dibaca dari Server Description memakai marker `Expired: YYYY-MM-DD`, ISO, atau legacy DD/MM; cache Setting dan `BOT_RENTAL_EXPIRES_AT` hanya fallback saat API gagal.
- **Admin + reminder** — status read-only tampil pada shared sidebar seluruh halaman; scheduler 6 jam mengirim milestone per-admin dengan dedupe persisten dan aman terhadap kegagalan parsial.
- **Enforcement aman** — status `INVALID`/`EXPIRED` memblokir kewajiban transaksi baru pada checkout retail/Stars/PPOB/reseller/panel/flash sale/web/WA/transfer, sedangkan webhook, polling, finalizer, delivery, refund, dan kredit deposit existing tetap berjalan.

### Docs — Reseller System production plan

- **Audit dan source of truth** — tambah `docs/RESELLER_SYSTEM_PLAN.md` untuk menyimpan hasil audit Reseller H2H existing, keputusan satu bot/dua role, satu saldo reseller, shared inventory untuk Telegram + API, desain `/admin/resellers`, target struktur service/feature agar `bot.js` tidak membengkak, security/database constraints, Phase 0–6, acceptance criteria, rollback, dan open decisions. Status masih DRAFT; belum mengklaim flow reseller production selesai.
- **Plan v0.2 security/global currency** — tambah aturan identitas Telegram hanya dari `ctx.from.id`, closed ledger anti-manipulasi saldo, Telegram/API idempotency, H2H credential/RBAC/rate-limit baseline, anomaly reconciliation, satu instance = satu currency = satu wallet reseller, integer minor-unit untuk IDR/MYR/INR/USD, snapshot deposit cross-currency, migrasi dual-read/write, dan security test matrix.
- **Plan v0.4 MongoDB/capacity** — freeze query budget per flow, cache matrix yang melarang saldo/stok/security-lock sebagai keputusan cached, index berbasis access pattern, cursor pagination dan larangan N+1, daily analytics rollup, reconciliation incremental, retention/TTL, connection-pool budget lintas instance, workload Pilot/Growth/Stretch, latency/reliability target, load/soak test, monitoring, dan rollout bertahap. Seluruh angka masih target validasi non-production, bukan klaim SLA.
- **Phase 0 baseline (kode aditif)** — tambah `utils/resellerMoney.js` (integer minor-unit IDR/MYR/USD/INR + currency invariant), `services/reseller/resellerApiMode.js` (mode `disabled|sandbox|production`, default `disabled`, backward-compatible dengan flag lama), dan `services/reseller/replicaSetPreflight.js` (deteksi replica set/mongos/standalone, dipasang log-only non-blocking di startup `bot.js`). Helper money/mode belum dipasang ke endpoint H2H sehingga API reseller tetap default nonaktif dan checkout retail tidak berubah. Audit index model reseller: `Reseller`/idempotency/nonce solid, `ResellerTransaction.orderId` belum unique (ditunda Phase 3). Test baru `tests/reseller/*` 24/24 pass.
- **Phase 1 extract domain (behavior-preserving)** — pindahkan seluruh handler Telegram reseller (registrasi OTP, api key, saldo, menu, docs, menu Reseller API) dari `bot.js` ke `features/reseller/registerResellerBotHandlers.js` (~488 baris keluar dari `bot.js`), dipanggil di posisi asli agar urutan `bot.on('text')` tidak berubah. Hapus endpoint inline `GET/POST /admin/reseller/settings` yang duplikat dengan `routes/admin/resellerSettings.js`; runtime flag `RESELLER_API_ENABLED` disinkron via callback, RBAC POST diperketat lewat role matrix. Tanpa perubahan UX/logika. Verifikasi: `jest tests/reseller tests/smoke` 28/28 pass.
- **Phase 2 account + approval** — lifecycle status reseller (`PENDING_REVIEW|APPROVED|ACTIVE|SUSPENDED|REJECTED`) via field `status` + `utils/resellerStatus.js` (state machine, `deriveStatus` backward-compatible). Registrasi kini masuk antrean approval (bukan auto-aktif via deposit); admin approve/reject/suspend/reactivate lewat web panel (`services/reseller/resellerAccountService.js`, endpoint `/admin/reseller/applications` + `/admin/reseller/:id/action`, RBAC `reseller.approve`) dengan notif Telegram ke reseller + audit `RESELLER_STATUS_CHANGE`. Reseller Hub bot adaptif ke status (helper `buildHubState`). `isActive` tetap sumber kebenaran order; SUSPENDED/REJECTED paksa nonaktif. i18n 5 bahasa bot + 4 bahasa admin (skrip idempotent). Backward-compatible untuk reseller lama. Verifikasi: `jest tests/reseller tests/smoke` 50/50 pass.
- **Phase 4A shared order service** — fondasi order reseller bersama supaya stok reseller & retail tidak terduplikasi. Tambah `resellerPrice` + `resellerEnabled` di `Product`; resolver memakai `resellerPrice ?? priceH2H` tanpa fallback `harga-2000`. Service order mengklaim stok retail yang sama, mendebit saldo, dan menulis ledger dalam MongoDB transaction. Jalur non-transaction kini ditolak; produk varian ditutup sementara.
- **Phase 3 deposit production-safe** — perbaiki flaw lama: deposit reseller dulu nyasar ke `User.saldo` (dompet retail), kini punya jalur resmi ke `Reseller.balance`. Field opsional `resellerDeposit { isDeposit, resellerId, creditedAt }` di `Transaction`; ditandai saat checkout via suffix param `topup:<amt>:rsl` (wrapper `createTransactionObject` di `processCheckout`, satu titik, tidak menyentuh ~15 jalur gateway; hanya reseller APPROVED/ACTIVE). Finalize TOPUP dicabang ke `services/reseller/resellerDepositService.js`: kredit `Reseller.balance` + ledger `ResellerTransaction(type='deposit')` + aktivasi (`activateIfEligible`) — semua **idempotent** via compare-and-set `resellerDeposit.creditedAt` (anti double-credit webhook+polling, rollback klaim bila gagal). Secret key ditampilkan **sekali** saat aktivasi (plaintext hanya di memori; persist hash+last4). Tombol Deposit di Hub (`reseller_deposit_start` → gateway → nominal `:rsl`) menggantikan tombol lama yang nyasar ke retail. Web admin: `GET /admin/reseller/deposits` + `/:id/ledger` (RBAC `reseller.approve`) + panel "Laporan Deposit Reseller" di admin panel. i18n bot 5 bahasa + admin 4 label (skrip idempotent). Backward-compatible (field opsional). Verifikasi: `jest tests/reseller tests/smoke` 57/57 pass.
- **Phase 4B code complete** — Telegram katalog dan H2H API memakai shared order service; harga reseller tersedia di admin produk. Order wajib MongoDB transaction dan idempotency Telegram/API dipersist dengan unique index. Telegram Hub kini punya riwayat 10 order serta ambil ulang data produk dengan ownership check. Produk varian ditutup sementara. Production sign-off masih menunggu concurrency/fault QA pada replica set nyata.
- **Phase 5A Reseller Center** — tambah halaman dedicated `/admin/resellers` dengan shell admin konsisten dan tab Applications, Wallet/Deposit, serta Settings. Halaman memakai endpoint/RBAC existing, menampilkan mode API fail-closed, dan menggantikan link reseller pada sidebar admin utama, gateway, dan bot appearance.
- **Phase 5B overview + directory** — Reseller Center kini menampilkan statistik database nyata, directory dengan pencarian, dan ledger read-only per reseller. Tidak ada balance editing langsung; endpoint dibatasi auth/RBAC dan projection.
- **Phase 5C orders admin** — tambah tab order reseller read-only dengan pencarian order ID/produk serta metadata reseller, qty, total, channel, dan waktu. Delivery credential, product data, idempotency key, dan API secret tidak dikirim ke browser.
- **Phase 5D reconciliation** — tambah laporan read-only yang membandingkan saldo reseller dengan saldo ledger terakhir dan menampilkan MATCH/MISMATCH/NO_LEDGER. Sistem tidak melakukan koreksi otomatis; hasil menjadi pagar sebelum adjustment saldo dibuka.
- **Phase 5E wallet adjustment** — kredit/debit saldo reseller kini hanya melalui service transaction-safe dengan alasan wajib, guard saldo non-negatif, immutable ledger before/after, RBAC khusus, admin audit, konfirmasi UI, dan notifikasi reseller.
- **Phase 5F credential security** — owner dapat generate/rotate/revoke credential API per reseller aktif. Secret hanya tampil sekali, disimpan sebagai hash+last4, status/API key di UI dimasking, dan revoke/rotate langsung menolak credential lama tanpa mengaktifkan H2H global.
- **Reseller Center Phase 5 complete** — akses view/approval/wallet/security kini dipisahkan per role, metadata credential hanya tersedia untuk owner, dan mismatch saldo otomatis memicu alert Telegram admin dengan dedupe.
- **Admin products cleanup** — halaman Produk duplikat dihapus; seluruh navigasi kembali ke section Produk bawaan `/admin`, sementara update overview tetap null-safe.
- **Reseller Center shell sync** — sidebar Reseller kini memuat navigasi admin lengkap, badge runtime, versi bot, serta header status DB/currency dan profil seperti dashboard utama.
- **Reseller global currency + i18n** — Reseller Center kini lengkap dalam bahasa id/en/ms/zh. Wallet dan ledger baru menyimpan currency tenant; deposit, order, adjustment, dan rekonsiliasi menolak currency kosong/berbeda sebelum mutasi finansial.
- **Unified admin shell** — Dashboard, Payment Gateway, Reseller Center, dan Tampilan Bot kini memakai satu renderer sidebar/header shared dengan menu, badge, status, profil, mobile navigation, serta deep-link section yang konsisten.
- **Reseller production hardening** — delivery data Telegram baru dilepas setelah commit; approval dan deposit kini konvergen; rekonsiliasi memakai anomaly cursor incremental; startup memverifikasi index kritis. H2H diperkeras dengan permanent request fingerprint, recovery idempotency, retry transient terbatas, bounded limiter, dan proteksi race credential.
- **Status QA reseller** — suite reseller + smoke **98/98 lulus dalam 16 suite**. Telegram reseller IDR dinilai code-ready/production-ready berdasarkan hardening dan bukti otomatis; smoke interaktif Telegram/admin belum dilakukan. H2H publik tetap `disabled`/internal dan belum production sampai HTTPS/public rollout serta minor-unit cross-currency selesai.
- **Dependency security** — `axios` diperbarui ke 1.18.1 dan `multer` ke 2.2.0. Audit masih menyisakan 2 high pada `tar` transitif melalui optional `canvas`, serta 4 moderate pada Jimp yang membutuhkan breaking upgrade; risiko ini belum dinyatakan selesai.

### Admin — Bot Storefront Builder hardening

- **Rotasi Banner Welcome (Phase 4B)** — admin dapat mengelola maksimal 5 banner `/start` dengan status aktif, bobot pemilihan, target bahasa, dan jadwal mulai/selesai. Upload banner otomatis menambahkannya ke rotasi; bot memilih secara random berbobot dengan cache 60 detik. Banner web lama tidak otomatis masuk rotasi. Jika rotasi kosong/gagal, bot fallback ke `start_image_id` lama lalu welcome teks sehingga `/start` tetap aman.
- **Marketplace Theme JSON (Phase 4A)** — tema storefront kini dapat diekspor untuk backup/clone tenant dan diimpor ke bot lain sebagai draft. Export hanya membawa layout/copy/menu/inline per bahasa; status live, timestamp, dan media Telegram tidak disertakan. Import dibatasi 32 KB, memvalidasi format/version/config, menolak key prototype-pollution, mematikan media lintas-bot, dan tidak pernah publish otomatis.
- **Audit MVP** — welcome text/placeholder, foto-banner, stiker, inline button (aksi/URL/kategori), reply menu custom, bahasa ID/EN/MS/ZH, preview, serta alur draft/publish/reset telah diverifikasi terhubung ke runtime.
- **Live-config cache** — `/start`, resolver menu reply, dan inline target kini membaca konfigurasi storefront dari cache 60 detik, bukan query MongoDB pada setiap update. Publish dan Factory Reset langsung menginvalidasi cache sehingga perubahan live aktif tanpa restart.
- **Test** — regression test cache memastikan read berulang hanya melakukan satu query dan invalidasi memaksa reload konfigurasi.

### Payment — ShopeePay via AutoGoPay (checkout penuh)

- **Gateway ShopeePay baru** — QRIS dinamis ShopeePay via AutoGoPay (`v1-gateway.autogopay.site`) untuk checkout produk, top-up saldo, dan panel Pterodactyl. Tersedia di admin panel (tab ShopeePay: API key, QRIS statis, theme/shape/frame/warna, test koneksi, preview) dan menu bayar bot (`🧡 ShopeePay (QRIS)`). Target pasar IDR.
- **Deteksi pembayaran amount-match** — bot membuat nominal unik (nominal dasar + acak 1–99) lalu polling `/shopeepay/transactions` tiap 5 detik dan mencocokkan nominal + status `success` (mirip Orderkuota). Anti-bentrok nominal (retry 6x) + batas transaksi pending per user (`SHOPEEPAY_MAX_PENDING_PER_USER`, default 3) + auto-EXPIRED setelah 20 menit + klaim atomik `gatewayTransactionId` supaya tidak double-finalize.
- **Konfigurasi** — `SHOPEEPAY_API_KEY` (fallback ke `AUTOGOPAY_API_KEY` — satu akun AutoGoPay), `SHOPEEPAY_QR_STATIC`, dan opsi styling QR. Provider `SHOPEEPAY` ditambahkan ke `Transaction` + `PaymentManager` + monitor.
- **Catatan OVO** — endpoint OVO di AutoGoPay bersifat outbound (bayar ke pihak lain / transfer bank), bukan menerima pembayaran customer, sehingga belum dijadikan gateway checkout (perlu keputusan lanjut).
- **Fix deteksi sesi expired** — bila sesi merchant ShopeePay di AutoGoPay timeout (`token_valid: false` / balasan `login timeout, please login again`), QRIS tetap tergenerate tetapi polling transaksi gagal sehingga pembayaran sukses selamanya tampil PENDING. Polling kini mendeteksi kondisi ini dan mencetak log jelas (throttle 60 detik) yang mengarahkan admin login ulang di dashboard AutoGoPay; pesan `getConnectionStatus` juga diperjelas untuk test koneksi di admin panel.

### Payment — GoPay via AutoGoPay (webhook fix)

- **Header `X-Callback-Signature`** — handler `POST /autogopay-callback` kini menerima header `X-Callback-Signature` (dokumen AutoGoPay terbaru) selain `x-signature` legacy, sesuai spesifikasi webhook resmi. Secret HMAC-SHA256 memakai `autogopay.apiKey` dengan fallback `shopeepay.apiKey`, dan handler aktif bila salah satu gateway (GoPay/ShopeePay) enabled. Mencegah webhook GoPay ditolak `401` di produksi.
- **Docs** — `docs/AUTOGOPAY_API_REFERENCE.md` diperbarui: gap signature ditandai FIXED; README menyebut GoPay & ShopeePay sebagai gateway QRIS AutoGoPay (total gateway jadi 16).

### Admin — Category Appearance Builder (Phase 1–4)

- **Custom daftar kategori (runtime)** — service `services/telegramCategoryAppearance.js` memungkinkan tampilan layar "Lihat Produk" dikustom (judul, subtitle, teks halaman, format item, footer, style classic_box/clean/compact/premium, emoji per kategori, item per halaman 10/12/15/20). Placeholder didukung: `{number} {category} {stock} {emoji} {totalCategories} {page} {totalPages} {storeName} {date}`.
- **Admin UI** — tab "Daftar kategori" di halaman `/admin/bot-appearance`: toggle aktif, pilih gaya & item/halaman, edit semua teks, editor emoji per kategori (+ impor dari produk), preview teks real-time (pakai kategori real, fallback contoh bila produk kosong), simpan draft, publish live, reset, dan kirim test ke Telegram admin. Badge status Live/Belum dipublish.
- **API** — 6 endpoint `/admin/settings/category-appearance*` (get/draft/publish/reset/preview/test-preview), proteksi auth + privileged role, validasi placeholder/panjang/style.
- **Fail-safe** — `displayCategoryList()` memakai konfigurasi live (cache 60s) hanya bila `enabled`; error/off → otomatis fallback ke tampilan bawaan. Nomor kategori global, reply keyboard angka, query produk/stok, dan flow checkout **tidak diubah**. Nama kategori & nama toko di-escape Markdown legacy.
- **Tombol keyboard atas (Phase 5)** — admin memilih tombol yang muncul di baris atas keyboard daftar kategori (Best Seller, Saldo & Top Up, Promo Spesial, Bantuan, Cara Order) beserta urutannya. Label mengikuti bahasa bot sehingga tombol dijamin tetap berfungsi (handler match by teks i18n); off/error → default Best Seller + Top Up.
- **Test** — `tests/services/categoryAppearance.test.js` (22 test). i18n ID/EN/MS/ZH.

### Payment — ShopeePay via AutoGoPay (deteksi sesi expired)

- **Fix silent PENDING** — bila sesi merchant ShopeePay di AutoGoPay timeout (`token_valid:false` / respons `login timeout, please login again`), QRIS tetap tergenerate tetapi polling transaksi gagal sehingga pembayaran sukses tampil PENDING selamanya. Polling kini mendeteksi kondisi ini dan mencetak log jelas 🔒 (throttle 60 detik) yang mengarahkan admin login ulang di dashboard AutoGoPay; `getConnectionStatus()` juga diperjelas.

### Admin — QR Payment Appearance Builder (Phase 1–4)

- **Dynamic expiry metadata** — toggle batas waktu kini memakai `Transaction.waktuExpired` aktual dan dirender sebagai tanggal+jam WIB. Checkout Pakasir, Midtrans, dan Sanpay menyimpan expiry absolut dari provider; gateway tanpa timestamp valid tetap mengosongkan overlay agar tidak menampilkan waktu palsu.
- **QR dummy mask (Phase 4.2)** — background yang sudah memiliki QR placeholder/checkerboard dapat ditutup dengan mask independen (ukuran, posisi X/Y, warna, radius, shadow), lalu QR asli dirender di atasnya. Tombol align menyamakan mask dengan QR asli; warning muncul bila mask terlalu kecil.
- **Production hardening (Phase 4.1)** — upload background kini diverifikasi lewat magic byte PNG/JPEG/WebP (file palsu dihapus), Publish Live mewajibkan ukuran QR minimal 34% sementara draft tetap 28%, tersedia Preview Draft vs Live, Factory Reset draft+live, dan warning saat keluar dengan perubahan belum disimpan.
- **Preset & template JSON (Phase 4)** — tersedia 5 preset layout (Minimal Clean, Gaming Neon, Premium Store, PPOB Counter, Panel Hosting), plus Export/Import JSON antar-tenant. Preset/import hanya mengubah draft dan mempertahankan background lokal; export membuang path file, timestamp, serta status live. Import dibatasi 64 KB, wajib format/version valid, dan tidak pernah menerima path background dari JSON.
- **Text overlay poster (Phase 3)** — poster QR bisa menampilkan strip info di tepi (atas/bawah): nama toko (custom atau `STORE_NAME`), nominal (otomatis dari `Transaction.totalPayment`, format `formatMoney`), dan Ref ID. Warna teks light/dark dengan strip semi-transparan agar tetap terbaca; card putih tetap ON + warning otomatis bila QR ketiban strip. Render aman-fallback (font gagal → QR tetap terkirim). Editor + preview strip live + i18n `qrApText*` (id/en/ms/zh). File tambahan: `drawTextOverlay`/`buildQrPosterTextData`.
- **Custom background QR pembayaran** — admin bisa upload background poster, menggeser posisi QR (drag mouse/touch di preview), dan mengatur ukuran QR (28–70%) agar pas dengan desain background. Setting draft/live tersimpan di `Setting` (`payment_qr_appearance_*`).
- **Guardrail scanability** — card putih di belakang QR default ON (padding/radius/shadow), ukuran minimal dijaga, warning otomatis bila QR terlalu kecil atau card dimatikan.
- **Render aman-fallback** — `composeQrPoster` menempel QR ke background saat live aktif; error apa pun otomatis fallback ke QR asli sehingga checkout tidak pernah gagal karena fitur tampilan.
- **Preview final PNG** — tombol Preview di panel admin memanggil render server dengan QR dummy, jadi admin lihat hasil persis sebelum publish.
- **Phase 2 gateway coverage** — semua QR image gateway utama masuk lewat `sendQRPayment`, termasuk VioletPay yang sebelumnya bypass lewat `ctx.replyWithPhoto(targetUrl)`.
- **Hosted QR aman** — sumber QR URL diambil sebagai Buffer dengan timeout 8 detik, MIME PNG/JPEG/WebP, dan limit 5 MB sebelum dirender ke poster. Fetch/render gagal otomatis memakai source provider asli; hosted payment link tanpa QR tetap memakai fallback link existing.
- **UI/UX admin diselaraskan** — QR builder kini memakai struktur kartu admin yang konsisten, panel Pengaturan/Preview, label yang lebih jelas, preview responsif lebih besar, badge koordinat, focus state, dan seluruh key i18n `qrAp*` agar teks tidak tampil sebagai nama key mentah.
- File: `services/payment/qrAppearance.js`, `services/payment/qrStyleRenderer.js` (`composeQrPoster`), `routes/admin/settings.js` (API + upload + preview), `public/admin-gateways.html` + `public/js/admin-gateways.js`, `features/checkout/paymentMessage.js`, `tests/payment/qrAppearance.test.js`.

### Customer Support

- **Hermest Agent migration** — adapter CS legacy dicabut dari support flow; CS sekarang memakai adapter netral `aiSupportAdapter` dengan implementasi `hermestAgentAdapter` HTTP read-only, redaction context, timeout/retry terbatas, dan fallback lokal/admin handoff.

### Payment — OrderKuota QRIS

- **WORKER-ORKUT compatibility** — mutasi OrderKuota sekarang mengirim credential dengan format lama (`username`/`token`) dan format worker terbaru (`USER_ORKUT`/`TOKEN_ORKUT`), mengikuti update `https://github.com/arivpnstores/WORKER-ORKUT` yang memperbaiki reCAPTCHA.
- **Probe live** — `tools/probe-orkut-live.js` ikut memakai payload kompatibel agar test koneksi/mutasi sesuai worker terbaru.

### Docs

- **Category Appearance Plan** — tambah `docs/CATEGORY_APPEARANCE_PLAN.md` untuk roadmap custom tampilan daftar kategori produk Telegram.

### Admin — Broadcast

- **Stock broadcast** — fix endpoint kirim broadcast stok dengan override/template admin yang sebelumnya gagal `buildStockBroadcastMessageWithOverride is not defined`.

### Admin — Payment Gateway

- **Gateway order lengkap** — daftar **Urutan Prioritas Tampilan Gateway ke User** otomatis menambahkan provider baru yang belum ada di urutan tersimpan lama, termasuk Casaku, Billplz, UPIExpress, dan Cryptomus.
- **Save config guard** — save payment gateway sekarang tahan terhadap dokumen `Setting` lama yang `value`-nya kosong/null, memperbaiki error `Cannot set properties of undefined (setting 'enabled')` saat simpan Casaku dari web panel.
- **Casaku diagnostic** — field License Key/Webhook Secret yang tampil masked `***` sekarang diperlakukan sebagai placeholder dan fallback ke credential tersimpan/runtime, jadi test koneksi tidak false-fail setelah config disimpan.
- **Casaku webhook** — signature `X-Casaku-Signature` diverifikasi dari raw body `Buffer`, mengikuti docs Casaku v2.1.

### Admin — Bot Appearance Phase 1

- **`/admin/bot-appearance`** — tombol Simpan Draft / Publish live sudah tersambung ke DB (`Setting`: `bot_appearance_draft_v1`, `bot_appearance_live_v1`).
- **Tombol chat inline** — tab Tombol chat sekarang menjelaskan bahwa preview web hanya simulasi; tombol asli aktif di Telegram setelah **Publish ke live** dan user membuka `/start` lagi.
- **Inline URL support** — action `Link HTTPS` masuk katalog backend dan dibangun sebagai URL button Telegram.
- **Inline category shortcuts** — tombol chat bisa diarahkan langsung ke kategori produk tertentu dari `/start`, memakai callback pendek `ba_inline:N` dan dropdown kategori dari data produk admin.
- **`/start` custom live** — welcome text per bahasa, label menu utama, dan inline shortcut dipakai saat config live aktif; fallback otomatis ke welcome lama jika config kosong/error.
- **Media Phase 2** — upload banner foto + sticker WebP/GIF dari web panel ke Telegram untuk mendapatkan `file_id`; simpan ke `start_image_id` / `welcome_sticker_id` dan toggle media draft.
- **Reset pabrik** — tombol admin untuk mematikan live custom, reset draft default, dan clear media welcome sehingga `/start` kembali ke bawaan script.
- **Action catalog sync** — preview dan live custom menu sekarang mencakup semua tombol utama dari keyboard bawaan, termasuk **Reseller API** dan **Panel Pterodactyl**; action custom memanggil handler existing yang sama.
- **Preview welcome default** — template pabrik Bot Appearance disamakan dengan `/start` bawaan: greeting, tanggal, ID Telegram, username, transaksi, saldo, BOT stats, dan shortcuts.
- **Placeholder chips** — editor welcome sekarang menampilkan semua variabel yang didukung (`{userId}`, `{username}`, `{transactions}`, stats, tanggal, greeting, dll.) agar admin mudah sisipkan data dinamis.
- **Inline shortcut default OFF** — mode pabrik tidak lagi menampilkan tombol inline di bawah bubble welcome; tombol inline hanya muncul jika admin mengaktifkan toggle.
- **Inline button advanced** — tombol chat bisa tambah/hapus, pilih action internal lengkap, atau pilih `Link HTTPS` dengan validasi URL.
- **Test preview + validation** — tombol **Kirim test** mengirim draft ke Telegram admin sebelum publish; save/publish/test menolak placeholder typo, label kosong/duplikat, action tidak dikenal, dan layout tombol melewati batas.
- **Template preset** — dropdown template sekarang benar-benar mengubah komposisi menu: Default bot, Minimal, PPOB, Panel Ptero, dan Lengkap/Full.
- **Menu ordering controls** — editor menu punya tombol naik/turun dan pindah baris (`R−/R+`); urutan menu disimpan dan dipakai runtime.
- **Preview Telegram clearer** — preview membedakan area pesan `/start`, inline button di bawah pesan, dan reply keyboard bawah.
- **Production-safe scope** — tidak mengubah flow checkout/payment/stock/delivery, hanya label/tampilan, shortcut, dan media welcome existing.

---

## [8.8.2] - 2026-07-06

### Admin — Payment Gateway page polish

- **`/admin/gateways`** — sidebar + topbar selaras dashboard utama (`admin-shell.js`, CSS sidebar di `admin-shared.css`).
- **Static `/css`** — Express serve `public/css/` (perbaikan halaman PG logo besar / tanpa style).
- **Badge gateway** — total **15** provider (bukan hardcode 12/11); `getTotalProviderCount()` di PaymentManager.

### Bot UX

- **Welcome `/start`** — escape `_` di @username Telegram (`escapeMarkdown`) — fix parse error Markdown legacy.
- **Keyboard `/admin`** — layout grid 2 kolom (tombol panjang/destruktif full width).

### Docs

- **README** — tabel gateway + hitungan **15** provider; baris **Casaku**; bullet Terbaru diagnostik + polling 3 detik.
- **PROGRESS / task.md** — sinkron entri Casaku (diagnostik admin, 12 unit test).

## [8.8.1] - 2026-06-12

### Payment — gateway Casaku (QRIS Indonesia)

- **Adapter** — `services/payment/casaku.js`: API v2 generate QRIS, check-status (`paid`), webhook HMAC raw body (`sha256=` prefix), parser status defensif (`parseCasakuPaymentStatus`).
- **Bot** — checkout/top-up, polling **3 detik**, manual cek status (`paymentReference` = `transactionId` Casaku); urutan gateway default setelah Sanpay.
- **Admin** — tab Casaku (license key, QR ID, package IDs, webhook hint); **Diagnostik Casaku** (`POST /admin/payment-gateway/test-casaku`: profil → QRIS probe → check-status); test QRIS dari form tanpa wajib simpan dulu.
- **Webhook** — `POST /casaku-callback` dengan verifikasi `X-Casaku-Signature`; toleransi amount unique code.
- **Test** — `tests/payment/casaku.test.js` (12 skenario).

### Admin — Payment Gateway halaman terpisah

- **`/admin/gateways`** — halaman dedicated (15 gateway tabs); `public/admin-gateways.html` + `public/js/admin-gateways.js`.
- **`admin.html`** — ~3.1k baris PG dihapus; sidebar/mobile link ke halaman baru; badge gateway summary tetap di dashboard.

## [8.8.0] - 2026-06-12

### Admin — tab PPOB Provider (kredensial tanpa .env)

- **Panel PPOB Provider** — sidebar admin (IDR only): DigiFlazz form lengkap + placeholder Okeconnect/Sanpay/Qiospay; prioritas DB > `.env`.
- **API** — `GET/POST /admin/settings/ppob-providers`; refresh `PpobManager` setelah simpan.
- **Operasional** — markup, auto-sync, QRIS, saldo deposit, sync katalog di halaman yang sama.
- **Test** — `tests/services/ppobProviderSettings.test.js`.

### Docs — Bot Storefront Builder (DRAFT v0.3)

- **Plan** — [`docs/BOT_STOREFRONT_BUILDER_PLAN.md`](docs/BOT_STOREFRONT_BUILDER_PLAN.md) v0.3: §25 unifikasi `getKeyboard`, §26 registry handler, §27 menuRouter vs userStates, §28 upload/import hardening, §29 error runtime.

### Docs — Bot Storefront Builder (DRAFT v0.2)

- **Plan** — [`docs/BOT_STOREFRONT_BUILDER_PLAN.md`](docs/BOT_STOREFRONT_BUILDER_PLAN.md) v0.2: tambah §18 migrasi `getMenuLabels`/`menuRouter`, §19 integrasi fitur existing (sticker, force join, telegramButtonSettings), §20 multi-bahasa, §21 edge cases runtime, §22 rate limit/export, §23 acceptance criteria, §24 template contoh; fix TOC monetisasi.

### Docs — Bot Storefront Builder (DRAFT v0.1)

- **Plan** — [`docs/BOT_STOREFRONT_BUILDER_PLAN.md`](docs/BOT_STOREFRONT_BUILDER_PLAN.md): kustom welcome + inline + reply menu lewat admin web + preview (Model A per instance); arsitektur, `actionId` catalog, security §11, optimasi §12, fase 0–5; monetisasi TBD.

### PPOB — saldo deposit, type menu, QRIS prepaid, riwayat interaktif

- **Saldo deposit DigiFlazz** — endpoint `/cek-saldo` (`cmd: deposit`); tombol di admin PPOB + command bot `/ppobsaldo` (admin).
- **Menu level 4 (type)** — submenu Umum/Transfer setelah pilih brand bila katalog punya lebih dari satu `type`.
- **QRIS checkout PPOB** — prepaid saja; toggle `ppob_qris_enabled` di admin; finalize gateway memicu `fulfillPpobAfterGatewayPayment`.
- **Riwayat PPOB** — daftar inline per transaksi, pagination, tombol **cek ulang** status.
- **i18n** — `ppob_choose_type`, `ppob_confirm_qris`, `ppob_deposit_balance`, dll. (5 bahasa).
- **Test** — `tests/services/digiflazzDeposit.test.js`; perluasan `ppobCatalogRead.test.js`.

---

## [8.7.9] - 2026-06-12

### PPOB prepaid — polling status, SN/token, sandbox

- **Fix polling** — cek status prepaid = re-topup ke `/transaction` dengan `ref_id`, `buyer_sku_code`, `customer_no` (bukan endpoint `cmd: status` yang tidak valid).
- **SN/token** — ekstrak `data.sn` dari response DigiFlazz; ditampilkan ke user saat transaksi sukses (`ppob_status_serial`) dan disimpan di `produkInfo`.
- **Sandbox** — `PPOB_DIGIFLAZZ_TESTING=true` mengirim `testing: true` pada top-up prepaid (selaras postpaid); polling re-topup ikut kirim flag yang sama.
- **Test** — `tests/services/digiflazzPrepaid.test.js`.
- **QA CLI** — `node tools/ppob-sandbox-smoke.js [sku] [nomor] [ref_id]` untuk uji create + poll tanpa bot.

---

## [8.7.8] - 2026-06-12

### PPOB — sync pasca + menu 3 level (kategori → brand → produk)

- **Fix katalog** — `price-list` pascabayar memakai `cmd: "pasca"` (bukan `postpaid`) agar tagihan PLN/PDAM ikut tersinkron.
- **Menu bot** — Pulsa, Data/Paket Data, Games, E-Money, dan Pascabayar: pilih kategori → pilih brand/operator → pilih produk.
- **i18n** — key `ppob_choose_brand`, `ppob_back_to_brands` (id/en/ms/zh/hi).
- **Test** — `tests/services/ppobCatalogRead.test.js`.

---

## [8.7.7] - 2026-06-12

### PPOB postpaid DigiFlazz (tagihan)

- **API** — inquiry (`inq-pasca`), bayar (`pay-pasca`), cek status (`status-pasca`) di adapter DigiFlazz.
- **Katalog** — sync produk postpaid bersama prepaid; harga ditentukan saat inquiry.
- **Bot** — alur: pilih produk tagihan → nomor pelanggan → cek tagihan → konfirmasi → potong saldo → bayar.
- **Sandbox** — `PPOB_DIGIFLAZZ_TESTING=true` mengirim flag `testing` ke API.

---

## [8.7.6] - 2026-06-12

### Refactor — flow PPOB keluar dari `bot.js`

- **`features/user/flowPpob.js`** — logic user PPOB (menu, search, checkout saldo, cek status, history).
- **`features/user/registerPpobBotHandlers.js`** — registrasi handler Telegraf PPOB (pola sama seperti Stars).
- **`services/ppob/ppobRuntime.js`** — singleton manager + flag menu PPOB.
- **`services/ppob/ppobCatalogRead.js`** — baca cache katalog DigiFlazz + helper pagination.
- **`bot.js`** — entrypoint lebih ringan; `getPpobBotDeps()` untuk injeksi dependency.

Tidak ada perubahan perilaku user-facing; fondasi untuk postpaid & test unit flow.

---

## [8.7.5] - 2026-06-12

### PPOB DigiFlazz — markup, auto-sync, admin UX

- **Markup harga** — `services/ppob/ppobPricing.js` + `ppobSettings.js`; harga jual = modal + % + biaya tetap (ceil); terapkan saat sync & checkout katalog live.
- **Auto-sync katalog** — `services/ppob/ppobJobs.js` di startup Mongo; interval & toggle **hanya** dari admin panel (Produk → Markup & auto-sync).
- **Sinkron terpusat** — `services/ppob/ppobCatalogSync.js` dipakai admin sync + auto-sync + cache Setting.
- **Admin** — `GET/POST /admin/settings/ppob`; panel Produk: markup/auto-sync (hanya `BASE_CURRENCY=IDR`).
- **UX bot** — hasil pencarian PPOB pakai `ppob_search_use_buttons` (bukan "coming soon").
- **Test:** `tests/services/ppobPricing.test.js`.

---

## [8.7.4] - 2026-06-12

### Flash Sale — broadcast notif ke semua user

- **Admin Promo** — checkbox *Kirim notifikasi Flash Sale* saat simpan/aktifkan promo; antrian `broadcastQueue`.
- **Pesan user** — ringkasan promo + tombol **Lihat Promo** (`goto_flash_sale`); teks per bahasa user.
- **Dedupe** — promo identik tidak di-broadcast ulang dalam 5 menit.
- **Refactor** — menu promo user dipindah ke `features/user/flowFlashSale.js`.
- **Test:** `tests/services/flashSaleNotify.test.js`.

---

## [8.7.3] - 2026-06-12

### Marketplace UX Sprint 2 — Watchlist stok + qty favorit

- **Watchlist (A1)** — subscribe per produk/varian; DM pribadi saat stok naik (paralel broadcast restock global).
- **Qty favorit (C2)** — simpan jumlah default; tombol ⭐ di layar qty; prompt setelah pilih jumlah.
- **Menu** — **🔔 Watchlist** di keyboard utama; kelola/hapus item + beli langsung jika stok ada.
- **Hook** — `onStockAdded` memanggil `watchlistNotifyService.notifyStockAvailable`.
- **Admin panel** — tab Broadcast → **Watchlist Stok**: on/off, cooldown (jam), max item/user (MongoDB, bukan .env).
- **Admin panel** — tab Broadcast → **Garansi & SLA Checkout**: jam batas refund (MongoDB, bukan `.env`).
- **i18n** — id + en (`watchlist_*`, `favorite_qty_*`, `menu_watchlist`).
- **Test:** `tests/services/marketplaceUxSprint2.test.js`.

---

## [8.7.2] - 2026-06-12

### Marketplace UX Sprint 1 — Beli lagi + SLA/bukti delivery

- **Beli lagi** — tombol `buy_again:{refId}` dari pesan sukses & riwayat pembelian; qty/varian dari transaksi SUCCESS.
- **SLA checkout** — blok garansi + refund + delivery di layar konfirmasi bayar (`formatCheckoutSlaBlock`).
- **Bukti delivery** — hash 8 char + timestamp di pesan sukses & riwayat; field `Transaction.deliveryProof`.
- **Saldo + gateway** — parity `deliveryProof` di checkout saldo AUTO dan `transactionFinalize`.
- **Admin panel** — Broadcast → Garansi & SLA Checkout (`trust_sla_refund_hours`, default 24 jam).
- **i18n** — id + en (`buy_again_*`, `checkout_sla_*`, `delivery_proof_*`).
- **Test:** `tests/services/deliveryProof.test.js`.

---

## [8.7.1] - 2026-06-12

### Seller analytics actionable (tenant)

- **Endpoint** `GET /admin/analytics/seller-insights.json` — abandon produk/varian (drop bayar + qty pending), jam puncak restock vs konversi (WIB), saran stok otomatis.
- **`StockRestockLog`** — log penambahan stok via hook `onStockAdded` (admin web + Telegram).
- **Admin UI** — section "Insight Seller" di tab Pertumbuhan & Analitik (kartu saran + tabel + chart).
- **Test:** `tests/services/sellerInsights.test.js`.

---

## [8.7.0] - 2026-06-12

### Cryptomus — pembayaran kripto (USDT)

- **Gateway baru `cryptomus`:** invoice USD via Cryptomus API; default payout USDT / network TRON.
- **Checkout produk + top-up saldo** — konversi otomatis dari IDR/MYR/INR ke USD.
- **Webhook** `POST /cryptomus` — verifikasi signature MD5, finalize `paid` / `paid_over`.
- **Admin panel** — tab Cryptomus (merchant UUID, payment API key, koin/network, lifetime).
- **USD native** — masuk `USD_NATIVE_GATEWAYS` (toko USD tanpa hybrid local gateway).
- **Test:** `tests/payment/cryptomus.test.js`.

### Restock notify otomatis (per varian + Buy now)

- **`services/restockNotify.js`** — broadcast otomatis saat stok ditambah (admin bot, admin web, bulk CSV, update varian).
- Satu pesan per varian: Added + Current stock + inline **Beli sekarang** → pilih jumlah → bayar.
- Pengaturan on/off + minimum stok **hanya Admin → Broadcast → Notifikasi Restock** (MongoDB Setting, bukan `.env`).
- **Test:** `tests/services/restockNotify.test.js`.

---

## [8.6.16] - 2026-06-12

### Bot API UX hotfix — Desktop compat, QR, salin stok

- **sendRichMessage + Telegram Desktop:** fallback otomatis ke plain Markdown bila ada `plainText` (hindari placeholder "perbarui Telegram").
- **QRIS checkout/top-up:** caption tagihan kembali **satu pesan** (foto QR + detail lengkap + tombol inline).
- **Expired QR:** `formatQrisExpiryLabel` — tampil tanggal + jam WIB (`13 Jun 2026, 00:08 WIB`); parse `expiresAt` gateway lebih defensif.
- **Salin stok multi-qty:** tombol `copy_text` salin **semua** baris stok (join `\n`), bukan hanya item pertama (batas API 256 char).
- **Test:** compat rich + multi-baris `buildSuccessCopyKeyboard`.

---

## [8.6.15] - 2026-06-12

### Admin panel — profil bot i18n (tanpa wajib .env)

- **Admin → Tombol Telegram → Profil bot per bahasa:** toggle sync, edit nama/deskripsi per id/en/ms/zh/hi, tombol **Simpan & sinkron ke Telegram**.
- **API:** `GET /admin/settings/bot-profile.json`.
- `.env` `TELEGRAM_BOT_PROFILE_SYNC` opsional (CI/deploy); pengguna panel cukup centang di web.

### Bot API UX — datetime rich, copy sukses, profil i18n

- **date_time di riwayat + invoice:** rich markdown `tg://time?unix=…` di semua builder relevan; riwayat plain pakai entity `date_time` saat toggle ON.
- **Checkout QR:** caption rich pending menyertakan `expiredAt` (Pakasir/Sanpay).
- **copy_text + efek sukses:** `buildSuccessCopyKeyboard` — salin Ref ID + opsional baris stok pertama; `message_effect` celebrate di delivery & top-up sukses.
- **Profil bot per bahasa:** `telegramBotProfile.js` sync `setMyName`/`setMyDescription` untuk id/en/ms/zh/hi; override per bahasa via Setting; `TELEGRAM_BOT_PROFILE_SYNC` di `.env`.
- **Admin API:** `POST /admin/settings/bot-profile/sync`.
- **Test:** coverage `formatRichDateTimeMarkdown`, `composeMessageWithSegments`, `buildSuccessCopyKeyboard`, history `dateAt`.

---

## [8.6.14] - 2026-06-12

### Bot API P1 lanjutan — Rich Messages, reaksi, poll link, date_time

- **Rich Messages (10.1) diperluas:** top-up sukses (`transactionFinalize`), riwayat pembelian/deposit (`flowHistory`), QR pending — foto pendek + detail rich terpisah (`paymentMessage` / `processCheckout`).
- **Copy ref checkout:** tombol `copy_text` Ref ID (sudah ada di `paymentMessage.js`).
- **Tombol inline modern (9.4):** `smartCallback` / styled URL di poll link (tanpa ubah pola existing).
- **Poll link incremental:** `PollCampaign.linkUrl` / `linkLabel`, wizard `POLL_WAITING_LINK`, tombol `styledUrl` di keyboard vote; i18n `tools/patch-poll-phase5-link-i18n.js`.
- **setMessageReaction (7.0):** `trySetMessageReaction` / `tryReactToCallbackMessage` di `telegramUx.js` — 🎉 sebelum hapus QR & saat cek status/delivery; toggle admin default OFF.
- **Entity date_time (9.5):** `utils/telegramDateTime.js` + toggle admin; helper `sendTextWithOptionalDateTime` + test; riwayat pakai `formatDateLabel` (Markdown legacy).
- **Admin:** checkbox reaksi + date_time di tab Tombol Telegram; i18n id/en/ms/zh.
- **Test:** `telegramRichMessage`, `telegramUx`, `telegramDateTime`, `pollRichMedia` (7 test).

---

## [8.6.13] - 2026-06-12

### Poll broadcast P2 quick win — foto header + deskripsi

- **Model:** `PollCampaign.description`, `PollCampaign.headerPhotoFileId` (opsional, backward compatible).
- **Admin flow `/polling`:** langkah deskripsi + upload foto header sebelum konfirmasi; skip dengan `-` / `lewati`.
- **Kirim:** foto + caption + inline keyboard (vote tetap custom, bukan native `sendPoll`).
- **Live vote / tutup poll:** `editMessageCaption` otomatis jika ada foto; caption dipotong aman ≤1024 karakter.
- **i18n:** `node tools/patch-poll-phase4-media-i18n.js` (id/en/ms/zh/hi).
- **Test:** `tests/poll/pollRichMedia.test.js`.

---

## [8.6.12] - 2026-06-12

### Rich Messages (Bot API 10.1 P1) — invoice pembelian

- **Helper:** `utils/telegramRichMessage.js` — `sendRichMessage` via `callApi`, fallback otomatis ke `sendMessage` Markdown legacy.
- **Flow:** pesan sukses pembelian (≤15 item) pakai tabel ringkasan + stok per baris dalam spoiler `||...||`.
- **Setting:** `telegram_rich_messages_enabled` (default OFF) di `services/telegramButtonSettings.js`.
- **Admin:** toggle di tab **Tombol Telegram** + i18n id/en/ms/zh.
- **Test:** `tests/utils/telegramRichMessage.test.js`.

**Catatan:** butuh client Telegram yang mendukung Rich Messages; jika API/client lama, bot otomatis kirim format Markdown seperti sebelumnya.

---

## [8.6.11] - 2026-06-12

### Force join: auto-approve join request + Mini App (Bot API 10.1 P3)

- **Join request:** handler `chat_join_request` — auto-approve ke channel/grup private dengan "Approve new members".
- **Admin panel:** checkbox auto-approve + field URL Mini App HTTPS (opsional) di tab Force Join.
- **API:** `GET/POST /admin/settings/force-join` field `joinRequestAutoApprove`, `joinRequestWebAppUrl`.
- **Service:** `services/forceJoinService.js` — settings cache, `answerChatJoinRequestQuery` / `sendChatJoinRequestWebApp`, fallback `approveChatJoinRequest`.
- **UX:** setelah join via force join check, hapus prompt + tampilkan welcome `/start`; coba approve pending saat user klik "Sudah join".
- **i18n:** admin id/en/ms/zh + bot id/en/ms/zh untuk validasi URL/target.
- **Test:** `tests/services/forceJoinService.test.js`.

**Catatan deploy:** bot harus **admin** di target + hak **invite users**. URL Mini App hanya membuka WebApp; approve final setelah validasi butuh backend Mini App tenant sendiri.

---

## [8.6.10] - 2026-06-08

### copy_text button + message effect (Bot API 9.x–10.0)

- **Salin Ref ID:** tombol `copy_text` (CopyTextButton) di pesan pembayaran — user tap untuk salin Ref ID, tidak salah ketik.
- **Efek confetti:** `message_effect_id` 🎉 pada pesan sukses delivery (private chat); fail-safe auto kirim ulang tanpa effect jika ID invalid.
- **Helper:** `copyTextButton()` (`telegramButtons.js`), `MESSAGE_EFFECTS`/`withMessageEffect`/`sendWithEffectFallback` (`telegramUx.js`).
- **i18n:** `copy_ref_id_button` id/en/ms/zh/hi.
- **Test:** perluasan `telegramButtons.test.js` + `telegramUx.test.js`.

---

## [8.6.9] - 2026-06-08

### Tampilan produk: katalog tombol nomor (gaya ringkas)

- **Daftar varian** diformat rapi di body: `1. Nama` + baris `💵 harga · ✅ N stok` / `❌ Habis`.
- **Tombol nomor** (1-N, 5 per baris) menggantikan tombol nama panjang — lebih ringkas & rapi.
- **Ketik manual nomor**: state `WAITING_PRODUCT_NUMBER` — user bisa ketik angka untuk pilih produk.
- **i18n** id/en/ms/zh/hi: `user_stock_available`, `user_pick_product_hint`, `user_pick_product_invalid`; `user_variations_title` disederhanakan.

---

## [8.6.8] - 2026-06-03

### Telegram API quick wins

- **UX:** `pulseChatAction` (typing / upload_photo) di checkout, QR payment, dan invoice Stars.
- **Link preview:** `link_preview_options.is_disabled` otomatis pada pesan/caption berisi URL (gateway, broadcast).
- **Admin Stars:** `GET /admin/settings/telegram-stars/balance.json` — `getMyStarBalance` + `getStarTransactions`; kartu saldo di panel Telegram Stars.
- **Rekonsiliasi:** `reconcileStarTransactions` + `GET .../reconcile.json` — cocokkan `getStarTransactions` (charge id) vs MongoDB; tombol **Periksa** menampilkan pembayaran masuk yang belum ter-record.
- **Tombol berwarna 100%:** sisa tombol mentah (check_status/cancel gateway non-QR, force_join, manual_done, panel renew/cancel/back) dimigrasi ke `smartCallback`; `inferButtonOpts` diperluas.
- **Konsistensi warna (belum merata fix):** navigasi/refresh/bahasa (`refresh_prod`, `goto_products`, `List Kategori`, `lang_set`, `show_checkout_options`) kini selalu **primary** (biru); produk tidak lagi salah dapat emoji "back".
- **Panduan emoji:** `SLOT_RECOMMENDATIONS` (emoji unicode + warna per slot) + tabel rekomendasi di admin panel (slot → warna → emoji → fungsi).
- **Test:** `telegramUx.test.js`, `telegramStarsBalance.test.js`, perluasan `telegramFormat.test.js` + `telegramButtons.test.js`.

---

## [8.6.7] - 2026-06-03

### smartCallback — tombol berwarna/emoji di seluruh bot

- **Helper:** `inferButtonOpts()` + `smartCallback()` — drop-in pengganti `Markup.button.callback` dengan style/emoji otomatis dari pola `callback_data`.
- **Migrasi:** `bot.js` + flow saldo/topup/history/refund/transfer/checkout/stars/poll (~170 tombol).
- **Override:** `styledCallback` eksplisit tetap dipakai di checkout payment, broadcast konfirmasi, admin delete/stock.
- **Test:** perluasan `telegramButtons.test.js`.
- **Default panel:** tombol berwarna **OFF**, emoji premium **ON** (instance baru / belum ada row `Setting`).

---

## [8.6.6] - 2026-06-03

### Tombol Telegram — toolkit emoji + pesan biasa

- **Admin panel:** panduan operator (collapsible), tempel ID + **Validasi** (`getCustomEmojiStickers`), **Kirim preview** ke Telegram admin.
- **API:** `POST /admin/settings/telegram-buttons/validate-emoji`, `POST .../test-preview`.
- **Service:** `services/telegramCustomEmoji.js` — parse ID, validasi, preview pesan HTML + tombol inline.
- **Pesan biasa:** `broadcastQueue.sendPayloadToUser` auto-`enrichPayloadWithHtml` (custom emoji di teks/caption non-broadcast juga).
- **Helper:** `prepareSendMessageOpts`, `buildHtmlMessageWithEmoji` di `utils/telegramFormat.js`.
- **Test:** `tests/services/telegramCustomEmoji.test.js`, perluasan `telegramFormat.test.js`.
- **Simpan:** verifikasi ID via `getCustomEmojiStickers` saat emoji premium aktif + ID terisi (bot harus online).
- **UI:** tombol **Isi ke slot emoji** setelah validasi berhasil; auto-fill preview ID pertama.
- **i18n bot:** key `telegram_buttons_*` di `utils/i18n/lang/id.js` & `en.js`.

---

## [8.6.5] - 2026-06-03

### Telegram Bot API 9.4+ — tombol berwarna & emoji premium

- **Helper:** `utils/telegramButtons.js` — `styledCallback()` dengan `style` (primary/success/danger) + `icon_custom_emoji_id` via env.
- **HTML broadcast:** `utils/telegramFormat.js` — konversi entities → HTML (`<tg-emoji>`) untuk custom emoji di broadcast teks/media.
- **UX:** checkout payment, QR cancel/check, varian picker, PPOB confirm, admin delete/stock confirm, stock broadcast, broadcast konfirmasi (tombol YA/BATAL + tetap ketik YA).
- **Admin panel:** Settings → **Tombol Telegram** — toggle warna & emoji premium + ID per slot; disimpan di MongoDB `Setting` (tanpa variabel `.env`).
- **Service:** `services/telegramButtonSettings.js` — cache startup + API `GET/POST /admin/settings/telegram-buttons`.
- **Test:** `tests/utils/telegramButtons.test.js`, `tests/services/telegramButtonSettings.test.js`, `tests/utils/telegramFormat.test.js`, perluasan `flowBroadcast.test.js`.

---

## [8.6.4] - 2026-06-03

### P2 — Multi-varian produk (harga & stok per varian)

- **Schema:** `Product.variants[]` (label, harga, stok, priceStars, isActive); parent `harga`/`stok` disinkron dari varian aktif.
- **Checkout bot:** pilih varian → qty → payment; backward compatible jika `variants` kosong.
- **Stok:** `claimStockVariant`, reserve/release P0/P1 per `variantIndex`; deliver AUTO/MANUAL aware varian.
- **Admin:** POST/PUT/GET produk + textarea JSON varian di halaman admin products.
- **i18n:** key varian di 5 bahasa bot.
- **Test:** `tests/product/productVariants.test.js`.

---

## [8.6.3] - 2026-06-03

### P1 — Reserve stok saat checkout gateway masih PENDING

- **Service:** `services/pendingCheckoutStock.js` — MANUAL potong `stok`/`totalTerjual`; AUTO `Product.claimStock()` → `pendingClaimedItems`.
- **Checkout:** `saveGatewayProductTransaction()` di `features/checkout/processCheckout.js` (semua gateway produk); Stars product di `flowTelegramStars.js`.
- **Finalize:** `transactionFinalize.js` — tidak double-reserve; AUTO deliver dari pre-claim.
- **Release (P0):** `manualStockRelease.js` — restore item AUTO ke `kontenProduk` saat cancel/expired/refund.
- **Test:** `tests/transaction/pendingCheckoutStock.test.js`.

---

## [8.6.2] - 2026-06-03

### P0 — Auto-release stok manual (cancel / expired / refund)

- **Service:** `services/manualStockRelease.js` — lepas flag `manualStockReserved` secara atomik, kembalikan `stok` + kurangi `totalTerjual`, catat audit `MANUAL_STOCK_RELEASED`.
- **Trigger:** cancel transaksi user (`cancel_` / `cancel_trx:`), AutoGoPay polling `FAILED`, admin reject review, Stars expire/cancel batch, pre-checkout Stars expired, refund approve (bot + admin web).
- **Test:** `tests/transaction/manualStockRelease.test.js`.

### Polling / vote broadcast (bot + admin web)

- **Poll campaign:** choice & rating (skala 1–5/1–10, numeric/stars); broadcast ke target user; tutup otomatis (scheduler) + manual (`/pollclose` / admin web).
- **Vote UX:** inline `poll_vote:<pollId>:<optionId>`; live hitungan di pesan yang di-vote; tidak ada reply spam setelah vote; banned user ditolak.
- **i18n:** pesan poll/hasil mengikuti `messageLang` campaign; key live stats & export di 5 bahasa bot.
- **Export suara:** `/pollexport` (bot) + **`GET /admin/broadcast/polls/:id/export`** + tombol **Export CSV** di panel hasil polling admin web (kolom: userId, username, optionId, optionLabel, votedAt).
- **Partisipasi:** baris `votes/targets (pct%)` di hasil poll, footer live, dan panel admin.
- **Keyboard saat tutup:** tombol vote dicabut dari pesan sumber broadcast; klik pada poll tertutup juga menghapus keyboard di chat user tersebut.
- **File utama:** `services/pollBroadcastService.js`, `features/admin/flowPollBroadcast.js`, `models/PollCampaign.js`, `models/PollVote.js`, `routes/admin/broadcast.js`, `public/admin.html`, `public/js/admin-i18n.js`.

---

## [8.6.1] - 2026-05-27

### P1 audit refund + P2a session Mongo TTL

- **Audit log refund (Telegram):** approve/reject refund menulis `REFUND_REQUEST_APPROVED` / `REFUND_REQUEST_REJECTED` ke `AdminAuditLog` (`logTelegramAdminAudit`).
- **Session persist:** `models/BotSession.js` + `services/botSessionStore.js` — `userStates`, `adminStates`, `refundSessions` survive restart (hydrate on startup, TTL index).
- **Enum audit:** tambah `STARS_REFUND`, `REFUND_REQUEST_*`.

### I18N Hindi (bot) — penuh untuk scope Telegram

- **1017/1017** key `t()` yang dipakai di `bot.js` / `features` / `services` ada di `tools/hi-user-texts.js` (dulu ~268, ~23%).
- Skrip baru: `tools/generate-hi-user-texts.js`, audit `tools/list-hi-missing-bot-keys.js`.
- Regen: `node tools/generate-hi-user-texts.js && node tools/gen-hi-lang.js`.

### Refund Requests di Admin Web Panel

- Endpoint baru: `GET /admin/refund-requests.json`, `POST /admin/refund-requests/:id/approve`, `POST /admin/refund-requests/:id/reject`.
- UI baru di `public/admin.html`: sidebar **Refund Requests**, badge pending, filter status, daftar request, aksi approve/reject.
- Approve dari web panel tetap atomik (status request + kredit saldo user) + kirim notifikasi ke user Telegram + audit log admin.
- **Manual order stock reserve:** stok manual sekarang di-reserve saat order masuk (saldo + finalize gateway) dengan guard `$gte`, sehingga stok 0 langsung tidak bisa lanjut checkout/order manual.
- **Backward compatibility:** transaksi manual lama (yang belum reserve) tetap aman karena masih fallback potong stok saat `complete`.
- **Admin bot UX:** notifikasi order manual ke admin kini punya tombol inline **Confirm Selesai** (`manual_done:<trxId>`) untuk proses langsung dari Telegram admin (status COMPLETED + potong stok + notif user/admin/channel).
- **Manual order idempotency:** aksi complete dari admin web & tombol bot sekarang atomic/idempotent (klik ganda/admin ganda tidak trigger completion ganda).
- **Manual order audit trail:** log detail disimpan di transaksi (`manualAuditLogs`) berisi actor, source, channel, status dari→ke, note, timestamp untuk kebutuhan dispute/refund.
- **Manual input validator:** `requiredFields` kini validasi format email/username/phone/username|id sebelum order masuk queue admin.
- **Admin Pending Orders UX:** badge `Reserved` + qty reserve tampil per order; aksi complete support catatan admin (opsional) yang ikut masuk audit trail.
- **Manual order SLA reminder:** scheduler baru mengingatkan admin saat order manual `WAITING` melewati SLA, anti-spam cooldown per order, optional kirim ke channel, dan tercatat di audit log (`MANUAL_SLA_REMINDER_SENT`).

---

## [8.6.0] - 2026-05-27

### Refund calculator, pengajuan refund, garansi admin, hardening P0/P1

- **Kalkulator refund (user):** sisa hari garansi dihitung otomatis dari tanggal beli (tanpa step input manual); disclaimer & notifikasi ke admin setelah hitung; status garansi (aktif/habis/none) di riwayat pembelian (`features/user/flowRefund.js`, `features/user/flowHistory.js`, i18n 5 bahasa).
- **Pengajuan refund:** model `RefundRequest`; tombol ajuan setelah estimasi; admin approve/reject via inline keyboard; kredit saldo atomik (`session.withTransaction`); pesan admin dihapus setelah aksi; unique partial index cegah double refund per `userId+refId`.
- **Garansi admin (bot):** konfigurasi hari/fee per tipe garansi disimpan di `Setting`; menu **Garansi Refund** + command `/garansiset`.
- **Hardening P0:** `monitorAuth` fail-closed di `NODE_ENV=production`; `bannedGuard` fail-closed on error; anti double refund submit.
- **Hardening P1:** unique partial index `gatewayTransactionId` pada `Transaction`; polling Qiospay/Sanpay/AutoGoPay pakai atomic claim; Tripay webhook `source: webhook_tripay`.
- **File utama:** `models/RefundRequest.js`, `models/Transaction.js`, `bot.js`, `bot/middlewares/guards.js`, `services/payment/polling.js`, `routes/webhooks.js`.

---

## [8.5.0] - 2026-05

### Auto Recap Scheduler — Harian/Mingguan/Bulanan (2026-05-25)

- **Fitur baru**: Bot otomatis mengirim ringkasan penjualan ke admin (dan opsional ke channel) secara terjadwal.
- **3 jenis recap**:
  - **Harian** — revenue, top-up, refund, user baru/aktif, gateway breakdown, top 3 produk, stok menipis.
  - **Mingguan** — semua di atas + perbandingan vs minggu lalu (growth %), top 5 produk.
  - **Bulanan** — semua di atas + total user, rata-rata revenue per hari, growth vs bulan lalu.
- **Admin panel button**: Tombol "📊 Recap" di menu `/admin` → sub-menu pilih Harian/Mingguan/Bulanan.
- **Zero config**: Tidak butuh ENV tambahan — langsung jalan dengan default (harian 23:55, mingguan Senin 08:00, bulanan tanggal 1 08:00).
- **File baru**: `services/recapScheduler.js`
- **File diubah**: `bot.js` (startup scheduler + admin panel button + action handlers)

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
  - **🧭 Dokumentasi Teknis (Developer)** — ditulis ulang dengan sub-kategori jelas: Navigasi cepat, Architecture & Data, API & Webhook, Payment, Multi-Currency (USD), Operations & Performance, Fitur Bisnis, Customer Support, PPOB (🚧 Beta dengan warning). Semua referensi `docs/*.md` dikonversi jadi proper Markdown link relatif.
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
