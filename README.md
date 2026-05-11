<div align="center">

![Auto Order Bot Banner](https://capsule-render.vercel.app/api?type=waving&height=180&text=Auto%20Order%20Bot&fontSize=62&fontAlignY=35&color=gradient&customColorList=6,11,20&animation=twinkling&fontColor=ffffff)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Telegraf](https://img.shields.io/badge/Telegraf-Bot-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://telegraf.js.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Ready-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Telegram](https://img.shields.io/badge/Telegram-Bot_API-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://telegram.org/)
[![License](https://img.shields.io/badge/License-Premium-gold?style=for-the-badge)](.)
[![Version](https://img.shields.io/badge/Version-8.5.0-brightgreen?style=for-the-badge)](.)
[![GitHub Stars](https://img.shields.io/github/stars/jundy780/Auto_Order_BOT?style=for-the-badge&logo=github)](https://github.com/jundy779/Auto_Order_BOT)
[![GitHub Forks](https://img.shields.io/github/forks/jundy779/Auto_Order_BOT?style=for-the-badge&logo=github)](https://github.com/jundy779/Auto_Order_BOT)

**🎯 Jualan Autopilot 24/7 • 💳 12+ Payment Gateway • 🌏 Indonesia & Malaysia • 🖥️ Admin Panel Modern**

[Demo Bot](https://t.me/FusionTempest_bot) • [Order Sekarang](#-order-sekarang) • [Hubungi Saya](#-hubungi-saya)

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

</div>

---

## 📑 Daftar Isi

| | |
|:---|:---|
| [🏗️ Arsitektur](#-arsitektur-bot-auto-order) | [💳 Payment Gateway](#-payment-gateway-supported) |
| [🆕 Terbaru](#-terbaru) | [🖥️ Admin Panel](#️-admin-panel-preview) |
| [🚀 Kenapa Pilih Bot Ini](#-kenapa-pilih-bot-ini) | [🎯 Cocok Untuk Jualan](#-cocok-untuk-jualan) |
| [✨ Fitur Premium](#-fitur-premium) | [📦 Fitur Lengkap](#-fitur-lengkap) |
| [⚖️ Perbandingan](#️-perbandingan) | [🛠️ Tech Stack](#️-tech-stack) |
| [❓ FAQ](#-faq) | [🛒 Paket Harga](#-paket-harga) |
| | [📞 Hubungi Saya](#-hubungi-saya) |

---

## 🆕 Terbaru

- **🩺 Instance Health Dashboard** — Menu baru di **monitor panel** menampilkan status MongoDB, hit rate user cache (LRU + TTL), memory heap, dan PID/Node uptime per instance bot. Auto-refresh 10 detik + endpoint `GET /admin/health` (auth-protected) — **cocok untuk multi-tenant / multi-instance bot**.
- **⚡ Performance & Cache Layer** — User cache LRU + TTL untuk reduce MongoDB round-trip, fire-and-forget username update, dan auto-migration index startup. **16+ instance** bot bisa share satu MongoDB tanpa beban berlebih.
- **📊 BI-Ready CSV Export 3-mode** — Export analytics (`pretty` blok terbaca, `flat` single-sheet untuk Power BI/Tableau/Sheets, `timeseries` long-format per hari/minggu untuk chart tren). Export Laporan Overview juga dual-mode (pretty + flat 14-kolom RFC 4180).
- **🛡️ Anti Double-Order Idempotency** — RefId deterministik berbasis SHA-1 (userId+productKey+messageId+timeBucket) → klik berulang tombol bayar tidak akan pernah lagi menghasilkan transaksi ganda. Guarded di 3 lapisan: app cache + unique-index + atomic `$inc/$gte`.
- **💸 Transfer Saldo antar User** — User bisa kirim saldo ke sesama user (atomic, audit-log, limit configurable di admin).
- **📝 Manual Order System** — Untuk produk yang butuh data tambahan (username, email, server ID, dll.) — bot prompt user input → kirim ke channel admin → admin proses dari dashboard Pending Orders.
- **🌏 Localization MS** — Term "garansi" diganti **"warranty"** di Bahasa Melayu (lebih natural untuk customer Malaysia).
- **🇲🇾 Panel Pterodactyl & gateway Malaysia** — Pembelian & perpanjang panel memakai **urutan gateway yang sama** seperti checkout produk digital & top-up saldo (ToyyibPay, Billplz, CHIP, QRIS, dll. sesuai admin). Tombol metode bayar mengikuti `payment_gateway_order` / mode `BASE_CURRENCY=MYR`.
- **💱 Multi-Currency Foundation (IDR/MYR/USD)** — `BASE_CURRENCY` switch toko, currency-aware formatter, & Phase 1 USD display ready. Native USD gateway = Phase 3+ ([`docs/USD_INTEGRATION_PLAN.md`](docs/USD_INTEGRATION_PLAN.md)).
- **📱 PPOB Multi-Provider (Beta / In Development)** — Skeleton multi-provider PPOB (DigiFlazz, OkeConnect, SanPay, QiosPay) — adapter + admin sync + webhook **sudah dibuat tapi belum production-ready**, masih tahap hardening. Tidak default-on; dokumentasi lengkap di [`docs/PPOB_MULTI_PROVIDER_STRUCTURE.md`](docs/PPOB_MULTI_PROVIDER_STRUCTURE.md).
- **12+ Payment Gateway** — Pilih sesuai kebutuhan bisnis kamu (ID & MY) — `.env`-based instance, hot-reload via admin panel.

---

## 🏗️ Arsitektur Bot Auto Order

```mermaid
graph LR
    subgraph Input
        TG[📱 Telegram<br/><sub>User Input</sub>]
    end
    
    subgraph Bot[Auto Order Bot]
        TE[Telegraf<br/><sub>Handler</sub>]
        EX[Express<br/><sub>Web & API</sub>]
        SO[Socket.io<br/><sub>Real-time</sub>]
    end
    
    subgraph Payment[Payment Layer]
        PG[12+ Payment Gateway<br/><sub>QRIS / FPX / DuitNow</sub>]
    end
    
    subgraph Data
        DB[(MongoDB<br/><sub>Produk • User • Transaksi</sub>)]
    end
    
    subgraph Admin
        AP[🖥️ Admin Panel<br/><sub>Dashboard • Config</sub>]
    end
    
    TG -->|Commands & Callbacks| TE
    TE --> DB
    EX -->|Webhook Callback| PG
    PG -->|Payment Success| EX
    EX --> DB
    AP -->|Hot Reload| DB
    SO -->|Live Updates| AP
    
    style TG fill:#e3f2fd,stroke:#2196f3
    style TE fill:#e8f5e9,stroke:#4caf50
    style EX fill:#fff3e0,stroke:#ff9800
    style PG fill:#f3e5f5,stroke:#9c27b0
    style DB fill:#e0f2f1,stroke:#00695c
    style AP fill:#fce4ec,stroke:#e91e63
```

**✨ Key Features**

<table>
<tr>
<td align="center" width="33%">

**⚡ Performance**

<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/High%20Voltage.png" width="50" />

Deteksi bayar &lt;3 detik
<br>Webhook real-time
<br>12+ gateway paralel

</td>
<td align="center" width="33%">

**🎯 Architecture**

<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Gear.png" width="50" />

Express + Telegraf
<br>Modular payment services
<br>Admin panel terintegrasi

</td>
<td align="center" width="33%">

**💾 Database**

<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/File%20Folder.png" width="50" />

MongoDB NoSQL
<br>Produk • User • Transaksi
<br>Hot reload tanpa restart

</td>
</tr>
</table>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🚀 Kenapa Pilih Bot Ini?

<table>
<tr>
<td>

### 😴 Tidur Pulas, Orderan Jalan

Bayangkan bangun tidur dan lihat saldo bertambah otomatis. Customer bayar QRIS → Produk terkirim **dalam 3 detik** tanpa kamu sentuh HP!

</td>
<td>

### 💰 Hemat Biaya Admin

Tidak perlu hire admin untuk handle orderan. Bot ini bekerja **24 jam non-stop** tanpa gajian, tanpa cuti, tanpa drama!

</td>
</tr>
<tr>
<td>

### 🌏 Multi-Region & Multi-Bahasa

Support pembayaran **Indonesia (QRIS)** dan **Malaysia** (ToyyibPay, Billplz, CHIP — FPX / DuitNow / e-wallet). Bot tersedia dalam 3 bahasa: Indonesia, English, Melayu.

</td>
<td>

### 🔄 Hot Reload Tanpa Restart

Ganti setting payment gateway, promo, atau konfigurasi lainnya **langsung dari admin panel** — tanpa perlu restart bot!

</td>
</tr>
</table>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## ⚖️ Perbandingan

<div align="center">

| | Bot Auto Order | Jualan Manual | Bot Lain (Umum) |
|:---|:---:|:---:|:---:|
| **Order 24/7** | ✅ | ❌ | ✅ |
| **Auto kirim produk** | ✅ <3 detik | ❌ | Varies |
| **12+ Payment Gateway** | ✅ ID + MY | ❌ | Terbatas |
| **Admin panel modern** | ✅ Real-time | ❌ | Sederhana |
| **Hot reload config** | ✅ Tanpa restart | - | Jarang |
| **Pterodactyl integration** | ✅ Full | ❌ | Jarang |
| **Multi-bahasa (ID/EN/MS)** | ✅ | ❌ | Terbatas |
| **Multi-currency (IDR/MYR/USD)** | ✅ | ❌ | Jarang |
| **Reseller API (H2H) V2** | ✅ Signature+Nonce+Idempotency | ❌ | Jarang |
| **Anti double-order** | ✅ 3-layer guard | ❌ | ❌ |
| **Health monitoring** | ✅ Real-time per instance | ❌ | ❌ |
| **BI-ready CSV export** | ✅ 3 mode (pretty/flat/timeseries) | ❌ | ❌ |
| **Multi-tenant ready** | ✅ Cache + isolated config | ❌ | ❌ |

</div>

---

## ✨ Fitur Premium

<div align="center">

| 🔥 Auto Payment | 🎁 Promo System | 🖥️ Admin Panel | 🔒 Super Secure |
|:---:|:---:|:---:|:---:|
| Deteksi bayar <3 detik | Flash Sale & Diskon | Real-time Dashboard | 2FA + Encryption |
| 12+ Payment Gateway | Voucher & Kupon | Push Notifications | CSRF Protection |
| ID + MY support | Timer countdown | Hot Reload Config | Security Logging |

</div>

### ⚡ Yang Bikin Beda dari Bot Lain:

- ✅ **12+ Payment Gateway** — Pakasir, Qiospay, Sanpay, Midtrans, Tripay, Violetpay, iPaymu, GoPay Merchant, Orderkuota (ID); **ToyyibPay**, **Billplz** (FPX / e-wallet / DuitNow di halaman bayar), **CHIP** (DuitNow QR) untuk Malaysia
- ✅ **Promo Spesial / Flash Sale** — Bikin urgency dengan countdown timer
- ✅ **Logo di QRIS** — Branding profesional di setiap pembayaran
- ✅ **Pterodactyl Integration** — Jualan hosting panel full otomatis + auto delete expired
- ✅ **Hot Reload Config** — Ganti setting dari admin panel tanpa restart bot
- ✅ **Anti Duplicate Payment & Anti Double-Order** — 3-layer guard: app cache + unique-index DB + atomic `$inc/$gte` saldo (Mutation ID Tracking + RefId deterministik SHA-1)
- ✅ **Multi-bahasa** — Indonesia, English, Melayu (term "warranty" untuk MS)
- ✅ **Multi-currency** — IDR / MYR / USD (Phase 1 USD foundation siap, native USD gateway = Phase 3+)
- ✅ **Reseller API (H2H) V2** — Signature + Nonce replay-guard + `Idempotency-Key` + rate limit
- ✅ **Exchange Rate** — Otomatis convert harga untuk user internasional
- ✅ **Responsive Admin** — Kelola dari HP juga bisa!
- ✅ **🩺 Instance Health Monitor** — Endpoint `GET /admin/health` + UI dashboard (MongoDB status, User Cache hit rate, Memory heap, Uptime) — cocok multi-tenant
- ✅ **📊 BI-Ready Export** — CSV 3-mode (pretty / flat / timeseries) untuk Power BI, Tableau, Google Sheets — chart tren harian/mingguan siap pakai
- ✅ **💸 Transfer Saldo antar User** — Atomic transfer + audit-log + limit configurable
- ✅ **📝 Manual Order System** — Untuk produk butuh data tambahan (username, email, server ID)
- ✅ **⚡ Multi-Tenant Performance** — User cache LRU+TTL, fire-and-forget update, auto-migration index → 16+ instance bot share 1 MongoDB tanpa beban

**📊 Alur Order → Pembayaran → Pengiriman**

```mermaid
sequenceDiagram
    participant U as User
    participant B as Telegram Bot
    participant PG as Payment Gateway
    participant DB as Database

    U->>B: Pilih produk & metode bayar
    B->>PG: Create transaksi (QR/Link)
    B->>U: Kirim QR / Link pembayaran
    U->>PG: Bayar
    PG->>B: Webhook callback (sukses)
    B->>DB: Validasi & finalize
    B->>U: Kirim produk / top up saldo
```

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 💳 Payment Gateway Supported

<div align="center">

| Gateway | Region | Tipe | Auto Detect | Logo/QR |
|:---:|:---:|:---:|:---:|:---:|
| **Pakasir** | 🇮🇩 Indonesia | QRIS | ✅ 3 detik | ✅ |
| **Qiospay** | 🇮🇩 Indonesia | QRIS Dynamic | ✅ 3 detik | ✅ |
| **Sanpay** | 🇮🇩 Indonesia | QRIS | ✅ 3 detik | ✅ |
| **Midtrans** | 🇮🇩 Indonesia | QRIS | ✅ 3 detik | ✅ |
| **Tripay** | 🇮🇩 Indonesia | QRIS | ✅ 5 detik | ✅ |
| **Violetpay** | 🇮🇩 Indonesia | QRIS | ✅ Auto | ✅ |
| **iPaymu** | 🇮🇩 Indonesia | QRIS (Redirect) | ✅ Callback | ✅ |
| **ToyyibPay** | 🇲🇾 Malaysia | FPX / DuitNow | ✅ Auto Detect | - |
| **Billplz** | 🇲🇾 Malaysia | FPX / e-wallet / DuitNow (di halaman bill) | ✅ Callback (`x_signature`) | - |
| **CHIP** | 🇲🇾 Malaysia | DuitNow QR | ✅ Callback | - |
| **GOPAY MERCHANT** | 🇮🇩 Indonesia | QRIS (Mutation) | ✅ Auto Detect | ✅ |
| **Orderkuota** | 🇮🇩 Indonesia | QRIS Dynamic (mutasi) | ✅ Polling + cek status | ✅ |

> 💡 **Pro Tip:** Bisa aktifkan beberapa gateway sekaligus! Customer bebas pilih mau bayar lewat mana.  
> 🌏 **Malaysia Support:** ToyyibPay (FPX / DuitNow), Billplz (halaman bayar: FPX, e-wallet, DuitNow termasuk QR — bot kirim **link** bill), CHIP (DuitNow QR) — sama tersedia untuk **produk digital**, **top-up saldo**, dan **beli / perpanjang panel Pterodactyl** (sesuai gateway yang diaktifkan).

</div>

---

## 🖥️ Admin Panel Preview

<div align="center">

```
┌─────────────────────────────────────────────────────────────┐
│  📊 DASHBOARD                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   💰 Pendapatan Hari Ini     📦 Transaksi      👥 Users    │
│   ┌─────────────────┐       ┌─────────┐      ┌─────────┐   │
│   │   Rp 2.450.000  │       │   145   │      │   892   │   │
│   │     ↑ 23%       │       │  ↑ 12%  │      │  ↑ 5%   │   │
│   └─────────────────┘       └─────────┘      └─────────┘   │
│                                                             │
│   📈 Grafik Penjualan 7 Hari Terakhir                      │
│   ═══════════════════════════════════                      │
│        ▄▄      ▄▄                                          │
│     ▄▄ ██ ▄▄  ██ ▄▄                                        │
│   ▄▄██ ██ ██ ▄██ ██ ▄▄                                     │
│   ████ ██ ██ ███ ██ ██ ▄▄                                  │
│   ────────────────────────                                 │
│   Sen Sel Rab Kam Jum Sab Min                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Fitur Admin Panel:**
- 📊 Dashboard statistik real-time + Growth Analytics
- 📦 Kelola produk, kategori, stok (drag-drop, bulk upload)
- 💳 Payment gateway management (12+ gateway, hot reload)
- 🎫 Voucher management
- 🖥️ Panel package management (Pterodactyl)
- 📢 Broadcast ke semua user (filter, media, scheduled, poll)
- 🔔 Push notification ke browser (PWA-ready)
- 🔒 Security: 2FA (TOTP + Telegram OTP), audit log, CSRF, IP whitelist
- 🩺 **Instance Health** — MongoDB status, User Cache hit rate, Memory, Uptime per instance
- 💸 Transfer Saldo antar User (limit configurable)
- 📊 **BI Export** — Pretty / Flat / Time-series CSV untuk Power BI, Tableau, Sheets
- 🤝 Reseller API (H2H) management — API key, rate limit, audit
- 📱 Responsive — bisa dari HP!

</div>

---

## 📱 Bot Interface

<div align="center">

```
┌──────────────────────────────────┐
│  🤖 AUTO ORDER BOT               │
│  ════════════════════════════    │
│                                  │
│  Selamat datang, Jundy! 👋       │
│                                  │
│  ┌────────────────────────────┐  │
│  │  🎁 PROMO SPESIAL          │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌──────────┐ ┌──────────────┐   │
│  │🛍️ Produk │ │💰 Cek Saldo  │  │
│  └──────────┘ └──────────────┘   │
│  ┌──────────┐ ┌──────────────┐   │
│  │📜 Riwayat│ │🖥️ Beli Panel │  │
│  └──────────┘ └──────────────┘   │
│  ┌──────────┐ ┌──────────────┐   │
│  │📱 PPOB   │ │⚙️ Pengaturan │  │
│  └──────────┘ └──────────────┘   │
│                                  │
│  🌐 ID | EN | MS                 │
│                                  │
└──────────────────────────────────┘
```

</div>

---

## 🎯 Cocok Untuk Jualan:

<div align="center">

| 🎮 Akun Premium | 📱 Pulsa & Kuota | 🖥️ Panel Hosting | 🎫 Voucher & License |
|:---:|:---:|:---:|:---:|
| Netflix | All Operator | Pterodactyl | Game |
| Spotify | Paket Data | VPS | Streaming |
| VPN | Token Listrik | Shared Host | Software |
| Game | E-Wallet | Dedicated | License Key |

</div>

---

## 📦 Fitur Lengkap

<details>
<summary><b>🛍️ Manajemen Produk</b></summary>

- Unlimited produk & kategori
- Bulk upload stok via file/teks
- Auto expired stock
- Sistem garansi fleksibel (7 hari - Full garansi)
- Stok otomatis berkurang setelah pembelian
- Required fields untuk produk custom (email, username, dll)
- Pagination produk per kategori
- Best seller produk
- Critical stock alert
- Retrieve stock (download sisa stok)

</details>

<details>
<summary><b>🎁 Promo & Voucher</b></summary>

- **Flash Sale / Promo Spesial** dengan countdown timer
- Voucher diskon (persentase atau nominal)
- Voucher redeem saldo / produk
- Maximum discount control
- Batas penggunaan per user
- Tanggal expired otomatis
- Analytics penggunaan voucher
- Channel notifications untuk promo

</details>

<details>
<summary><b>🖥️ Pterodactyl Integration</b></summary>

- Jualan panel hosting langsung dari bot
- Auto create user di Pterodactyl
- Auto create server dengan spec sesuai paket
- **Auto delete server expired** + notifikasi
- Warning H-3 dan H-1 sebelum expired
- Kelola paket panel dari admin web
- **Metode pembayaran panel** mengikuti gateway yang sama dengan checkout lain (QRIS Indonesia, ToyyibPay / Billplz / CHIP untuk Malaysia, dll.) — bukan hanya satu atau dua gateway tetap

</details>

<details>
<summary><b>💳 Payment System</b></summary>

- **12+ payment gateway** terintegrasi
- **Indonesia (QRIS):** Pakasir, Qiospay, Sanpay, Midtrans, Tripay, Violetpay, iPaymu, GoPay Merchant, Orderkuota
- **Malaysia:** ToyyibPay (FPX / DuitNow), **Billplz** (FPX / e-wallet / DuitNow di halaman Billplz), CHIP (DuitNow QR)
- Auto detect pembayaran < 3 detik
- **Anti Duplicate Payment** — Sistem Mutation ID tracking
- **Anti Double-Order Idempotency (3-layer)** — App cache `checkoutInProgress` + Transaction `refId` unique-index (SHA-1 deterministik: userId+productKey+messageId+timeBucket) + atomic `User.updateOne($inc, $gte)` deduct saldo dengan rollback otomatis. Klik berulang tombol bayar → `refId` identik → save kedua ditolak `code: 11000` → balas `processing_already`.
- Hot reload config (ganti setting tanpa restart)
- Custom logo di QRIS
- QRIS fee otomatis (configurable)
- Webhook callback dengan validasi signature (HMAC / x_signature / Bearer / IP whitelist)
- Saldo internal + top up via QRIS / FPX
- Retry & polling otomatis (orderkuota mutasi, dll.)

</details>

<details>
<summary><b>🌐 Multi-Language & Multi-Region</b></summary>

- **3 Bahasa:** Indonesia (`id`), English (`en`), Bahasa Melayu (`ms`)
- **Indonesia:** Semua QRIS gateway (Pakasir, Qiospay, Sanpay, Midtrans, Tripay, Violetpay, iPaymu, GoPay Merchant, Orderkuota)
- **Malaysia:** ToyyibPay, Billplz, CHIP (urutan & aktif/nonaktif lewat admin; mode `MYR` memfilter ke gateway Malaysia)
- Exchange rate support untuk user internasional
- Keyboard & pesan otomatis sesuai bahasa user
- **Localization MS** — Term **"warranty"** (bukan "garansi") untuk customer Malaysia agar lebih natural

**Currency support (Phase 1 USD aktif untuk display)**

| `BASE_CURRENCY` | Locale default | Simbol | Desimal | Status                                                     |
| --------------- | -------------- | ------ | ------- | ---------------------------------------------------------- |
| `MYR`           | `ms-MY`        | `RM`   | 2       | Production (gateway: ToyyibPay, Billplz, CHIP)             |
| `IDR`           | `id-ID`        | `Rp`   | 0       | Production (gateway: Pakasir, Qiospay, Sanpay, dll.)       |
| `USD`           | `en-US`        | `$`    | 2       | **Phase 1**: display + config. Native gateway USD = Phase 3 (lihat [`docs/USD_INTEGRATION_PLAN.md`](docs/USD_INTEGRATION_PLAN.md)) |

</details>

<details>
<summary><b>🔗 Reseller API (H2H) — V2 Hardened</b></summary>

- **RESTful API V2** untuk reseller / Host-to-Host integrator
- **Endpoint:** order, cek status, cek saldo, list produk, callback
- **Authentication multi-layer:**
  - `X-Api-Key` per-reseller
  - `X-Signature` HMAC-SHA256 dari body + timestamp + nonce
  - `X-Nonce` replay-guard (Mongo TTL collection)
  - `Idempotency-Key` untuk safe retry — replay yang sama → response cache; key sama + body beda → `409 conflict`
- **Rate limiting** per-reseller (configurable di admin)
- **Audit log** tiap request (signature pass/fail, body hash, response code)
- **Atomic order processing** — anti partial-state (saldo deduct + stok claim + tx save dalam satu transaction)
- **Envelope error standar** RFC 7807-style
- Dokumentasi lengkap:
  - [`docs/RESELLER_H2H_API_V2_SPEC.md`](docs/RESELLER_H2H_API_V2_SPEC.md) — spesifikasi
  - [`docs/RESELLER_H2H_CONTRACT_QA_CHECKLIST.md`](docs/RESELLER_H2H_CONTRACT_QA_CHECKLIST.md) — checklist QA integrator siap pakai
- Cocok untuk supplier yang buka reseller / agregator

</details>

<details>
<summary><b>🩺 Instance Health & Performance Monitoring</b></summary>

- **Endpoint `GET /admin/health`** — JSON status: MongoDB connection, `userCache` (hits / misses / hitRate / TTL / size / evictions), `memory` (rss / heapUsed / heapTotal / external), `uptimeSeconds`, `pid`, `node`. HTTP `503` kalau MongoDB tidak `connected`. Diproteksi `monitorAuth`.
- **UI Dashboard Monitor** — Section `Instance Health` di `/monitor`:
  - 4 stat card (MongoDB pill, Cache Hit Rate %, Heap Used, Uptime)
  - 3 panel detail: User Cache (progress bar hit rate, size, TTL), Memory (progress bar heap), Instance info (PID, Node, Endpoint, Last update)
  - Auto-refresh 10 detik + tombol refresh manual
  - Mobile menu: quick stat MongoDB + Cache Hit Rate %
- **Multi-tenant aware** — Tiap instance bot punya cache & memori sendiri → cocok untuk monitor terpisah per `BOT_USERNAME`.
- **Performance optimization** — User cache LRU + TTL (reduce MongoDB round-trip), fire-and-forget username update, auto-migration index saat startup.

</details>

<details>
<summary><b>💸 Transfer Saldo antar User</b></summary>

- User bisa kirim saldo ke sesama user via username Telegram
- **Atomic transfer** (`User.updateOne` dengan `$inc` + `$gte` guard) — anti partial transfer
- **Audit-log** di MongoDB (siapa kirim, siapa terima, jumlah, timestamp, refId)
- **Limit configurable** di admin (per-transaksi, per-hari, total)
- **Anti double-transfer** idempotency layer
- Channel notification opsional untuk transfer
- Lihat: [`docs/TRANSFER_SALDO_PLAN.md`](docs/TRANSFER_SALDO_PLAN.md)

</details>

<details>
<summary><b>📝 Manual Order System</b></summary>

- Produk yang butuh **data tambahan** dari user (username, email, server ID, nomor HP, dll.) — bot prompt input sesuai field config produk
- Setelah user kirim semua data → notifikasi otomatis ke **admin channel** dengan ringkasan lengkap (user, produk, data, total, ref ID)
- Admin proses dari **Dashboard Pending Orders** — tombol Selesai / Tolak / Refund dalam 1 klik
- **Refund otomatis** kalau admin tolak (saldo dikembalikan + audit log)
- Cocok untuk: top-up game by-ID, jasa custom, voucher butuh email, dll.

</details>

<details>
<summary><b>📱 PPOB Multi-Provider — 🚧 Beta / In Development</b></summary>

> ⚠️ **Catatan**: PPOB (Payment Point Online Bank) **belum production-ready / belum di-release**. Adapter & skeleton sudah dibuat tapi masih tahap hardening & QA. Tidak default-on di production. Roadmap go-live: lihat [`docs/DIGIFLAZZ_GO_LIVE_CHECKLIST.md`](docs/DIGIFLAZZ_GO_LIVE_CHECKLIST.md).

**Yang sudah ada (skeleton/beta):**
- Multi-provider architecture (DigiFlazz, OkeConnect, SanPay, QiosPay) dengan interface unified — bisa switch provider tanpa ubah business logic
- Adapter DigiFlazz: client, signer (MD5), mapper status, transaction, status check, webhook callback
- Catalog sync (manual via admin `POST /admin/products/ppob/sync` + scheduled)
- Model `Product` punya field `ppobProvider`, `ppobProviderSku`, `ppobLastSyncedAt` (partial unique index untuk produk PPOB asli — non-PPOB tidak ikut)
- Webhook callback security (HMAC secret) + auto-refund saldo kalau status provider `FAILED`/`EXPIRED`
- Admin UX: dropdown pilih provider, tombol "Sync PPOB Now", badge "Last sync", endpoint monitoring

**Yang masih dalam pengembangan / belum siap release:**
- End-to-end hardening flow callback produksi
- QA penuh skenario multi-provider failover
- UI bot menu PPOB user-facing
- Reconciliation report (selisih provider vs internal)
- Pricing & margin auto-update dari provider

**Dokumentasi (untuk developer/early access):**
- [`docs/PPOB_MULTI_PROVIDER_STRUCTURE.md`](docs/PPOB_MULTI_PROVIDER_STRUCTURE.md) — arsitektur
- [`docs/DIGIFLAZZ_PPOB_PLAN.md`](docs/DIGIFLAZZ_PPOB_PLAN.md) — rencana implementasi DigiFlazz
- [`docs/DIGIFLAZZ_BOT_FEATURE_ROADMAP.md`](docs/DIGIFLAZZ_BOT_FEATURE_ROADMAP.md) — roadmap fitur
- [`docs/DIGIFLAZZ_USER_JOURNEY_AWAM.md`](docs/DIGIFLAZZ_USER_JOURNEY_AWAM.md) — user journey
- [`docs/PPOB_CODE_REVIEW_CHECKLIST.md`](docs/PPOB_CODE_REVIEW_CHECKLIST.md) — code review checklist

</details>

<details>
<summary><b>🔒 Security</b></summary>

- **Two-Factor Authentication (2FA)** — TOTP (Google Authenticator) + Telegram OTP
- **Role-Based Access Control (RBAC)** — Owner / Admin / Staff dengan menu visibility per-role
- **CSRF Protection** — Token per session, double-submit cookie
- **Rate Limiting** — Per IP, per endpoint, per admin
- **Security Audit Log** — Tiap aksi sensitif (login, gateway change, broadcast, refund) tercatat
- **Encrypted Sensitive Data** — Encryption-at-rest untuk API key gateway, password admin (bcrypt)
- **IP Whitelist** untuk callback webhook
- **Anti-Spam Bot** — Rate limit per-user, ban/unban, auto-detect bot/scraper (lihat [`docs/ANTI-SPAM-CONFIG.md`](docs/ANTI-SPAM-CONFIG.md))
- **Reset Password** flow dengan email + token expiry

</details>

<details>
<summary><b>📊 Analytics & Report — BI-Ready</b></summary>

- Dashboard statistik real-time
- **Growth Analytics**:
  - Funnel konversi (created → success / failed / pending)
  - Period summary (revenue, ARPU, paying buyer, transaction count)
  - Repeat purchase rate + revenue normalized ke `BASE_CURRENCY`
  - LTV per cohort
  - Cohort analysis (heatmap)
- Grafik penjualan harian/mingguan/bulanan
- Top produk terlaris
- User paling aktif (today & all-time)
- **Export CSV 3-mode (untuk BI tools)**:
  - **`pretty`** (default) — Blok bertitel (META / FUNNEL / PERIODE / REPEAT / LTV / COHORT / NOTE) dengan header `Metrik` / `Nilai`. Cocok untuk Excel viewer manusia.
  - **`flat`** — Single-sheet datar 9 kolom konsisten (`section, metric, dimension, value, unit, period, filter_start, filter_end, base_currency`). Cocok untuk **Power BI / Tableau / Sheets** — pivot/filter langsung tanpa post-processing.
  - **`timeseries`** — Long-format 9 kolom dengan `date` (`YYYY-MM-DD`) + granularitas `day` / `week`. 10 metrik per bucket waktu (`revenue_success`, `paying_buyers`, `arpu`, `tx_created`, `tx_success`, `tx_failed`, `tx_pending`, `conversion_pct`, `new_buyers`, `topup_revenue`). **Untuk chart tren** di Power BI.
- **Export Laporan Overview** juga dual-mode (`csv` pretty + `flat` 14-kolom RFC 4180)
- Endpoint preview: `GET /admin/analytics/timeseries.json?granularity=day|week`
- Push notification ke browser (PWA-ready) untuk transaksi sukses, low-stock alert, dll.

</details>

<details>
<summary><b>📄 Invoice & Notifikasi</b></summary>

- **Invoice generation** (Canvas-based PNG) — auto-render saat transaksi sukses
- Custom logo & banner invoice
- Large product delivery (`.txt` attachment kalau payload panjang)
- **Channel notifications** (pembelian, top-up, voucher claim, manual order, refund, stock broadcast)
- Invoice image ke channel
- Custom sticker / GIF notifikasi
- Custom welcome sticker `/start`
- Custom gambar `/start`
- **Markdown-safe** — semua dinamis content auto-escape (anti `can't parse entities` error)
- **Telegram retry & fallback** — kalau channel kirim gagal (mis. `chat not found`), bot lanjut jalan tanpa crash

</details>

<details>
<summary><b>⚙️ Fitur Tambahan</b></summary>

- Full warranty / garansi langganan
- Manual confirmation transaksi
- Order admin tanpa pay (sebagai owner)
- Support ticket system (CS handoff ke staff manual)
- Ban/unban user + banned list
- Broadcast message (filter user/region/lang, media support, scheduled, poll campaign)
- Cancel transaksi oleh user
- Cek status transaksi real-time
- **Banner dinamis** di main menu (rotating, scheduled)
- **Stock broadcast** otomatis saat restock
- **Best seller** auto-rank dari data transaksi
- **Critical stock alert** ke admin channel

</details>

---

## 🛠️ Tech Stack

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js_18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Telegraf](https://img.shields.io/badge/Telegraf.js-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

</div>

---

## 📋 Requirements

| Kebutuhan | Keterangan | Biaya |
|:---|:---|:---:|
| VPS / Panel | Minimal 2GB RAM, Node.js 18+ (LTS) | ~50rb/bulan (OPSIONAL)|
| MongoDB | MongoDB Atlas (cloud) | **GRATIS** |
| Bot Token | Dari @BotFather Telegram | **GRATIS** |
| Payment Gateway | Pilih salah satu atau lebih | Varies |

---

## ❓ FAQ

<details>
<summary><b>Apakah harus punya VPS?</b></summary>

Ya, bot perlu jalan 24/7. Minimal VPS 1GB RAM (~50rb/bulan) atau panel hosting yang support Node.js. Bisa juga pakai Railway, Render, atau VPS gratis (dengan batasan).
</details>

<details>
<summary><b>Bisa pakai hosting shared?</b></summary>

Tergantung. Hosting shared biasanya tidak allow long-running process. Lebih cocok pakai VPS, cloud (MongoDB Atlas gratis), atau panel yang support Node.js.
</details>

<details>
<summary><b>Bagaimana cara ganti payment gateway?</b></summary>

Lewat Admin Panel → Payment Gateway. Isi API key & config, lalu aktifkan. Bisa aktifkan beberapa gateway sekaligus — customer pilih sendiri. **Hot reload** = tidak perlu restart bot.
</details>

<details>
<summary><b>Support Pterodactyl versi berapa?</b></summary>

Kompatibel dengan Pterodactyl Panel 1.x. Untuk setup detail, lihat `docs/ARCHITECTURE.md` atau dokumentasi instalasi.
</details>

<details>
<summary><b>Apakah bisa jualan tanpa Pterodactyl?</b></summary>

Bisa! Pterodactyl hanya untuk yang jual hosting/panel. Untuk produk digital (akun, voucher, license key), tidak perlu Pterodactyl.
</details>

<details>
<summary><b>Customer Malaysia bisa bayar?</b></summary>

Ya! Untuk Malaysia: ToyyibPay (FPX / DuitNow), Billplz (link ke halaman bayar — biasanya FPX, e-wallet, DuitNow/QR), dan CHIP (DuitNow QR) — bisa dipakai untuk checkout produk, top-up saldo, dan panel Pterodactyl (yang diaktifkan). Bot juga support multi-bahasa (Melayu) dengan term lokal seperti "warranty" (bukan "garansi") supaya lebih natural.
</details>

<details>
<summary><b>Apakah bot ini siap multi-tenant (banyak bot 1 source code)?</b></summary>

Ya. Banyak user yang jalanin **5–20 instance bot sekaligus** dari source code yang sama, hanya beda `.env` (token, MongoDB DB, port). Tiap instance punya cache `userCache` (LRU + TTL) sendiri → tidak saling konflik. Untuk monitoring tiap instance, pakai endpoint `GET /admin/health` (JSON status MongoDB, cache hit rate, memory, uptime) atau lihat dashboard di `/monitor` → section **Instance Health**.
</details>

<details>
<summary><b>Bagaimana cara mencegah dobel order kalau user klik tombol bayar berkali-kali?</b></summary>

Sudah ada **3-layer idempotency**:
1. **App cache** `checkoutInProgress` per `userId+productKey` (in-memory, expire cepat)
2. **Database unique index** pada `Transaction.refId` (deterministik dari `SHA-1(userId,type,productKey,qty,amount,messageId,timeBucket)`)
3. **Atomic balance deduct** `User.updateOne($inc, $gte: amount)` — kalau saldo kurang, deduct gagal & order otomatis dibatalkan

Klik berulang → `refId` identik → save kedua ditolak `code: 11000` → bot balas "transaksi sedang diproses" → **tidak akan dobel debit / dobel kirim**.
</details>

<details>
<summary><b>Apakah PPOB (pulsa, paket data, PLN, dll.) sudah jalan?</b></summary>

🚧 **Belum.** Adapter PPOB multi-provider (DigiFlazz, OkeConnect, SanPay, QiosPay) sudah disiapkan secara struktur, tapi **masih dalam pengembangan & belum siap release**. Saat ini bot fokus ke produk digital (akun, voucher, license key, panel hosting). Roadmap & dokumentasi PPOB ada di [`docs/DIGIFLAZZ_GO_LIVE_CHECKLIST.md`](docs/DIGIFLAZZ_GO_LIVE_CHECKLIST.md).
</details>

<details>
<summary><b>Export laporan untuk Power BI / Tableau ada gak?</b></summary>

Ada — **3 mode** untuk export Growth Analytics:
- `?format=pretty` — Excel viewer manusia (blok bertitel)
- `?format=flat` — Power BI / Tableau / Sheets (single-sheet 9 kolom)
- `?format=timeseries` — chart tren waktu (day/week granularity, 10 metrik per bucket)

Export Laporan Overview juga punya `?format=flat` (14 kolom RFC 4180). Semua via tombol di Dashboard.
</details>

<details>
<summary><b>Reseller H2H aman dari replay attack & race condition?</b></summary>

Ya. Semua endpoint H2H V2 wajib `X-Api-Key` + `X-Signature` (HMAC-SHA256) + `X-Nonce` (replay-guard via Mongo TTL collection) + `Idempotency-Key`. Order processing atomic (saldo deduct + stok claim + tx save dalam 1 transaction). Audit log tiap request. Spesifikasi lengkap: [`docs/RESELLER_H2H_API_V2_SPEC.md`](docs/RESELLER_H2H_API_V2_SPEC.md).
</details>

---

## 🧭 Dokumentasi Teknis (Developer)

Dokumen ini membantu kamu (atau tim) memahami alur logic, struktur, API, data model, dan ops untuk maintenance/refactor ke depan:

### 📍 Navigasi cepat

- [`docs/INDEX.md`](docs/INDEX.md) — **indeks navigasi** semua dokumen di `docs/` (disarankan dibaca dulu)
- [`docs/PRD.md`](docs/PRD.md) — Product Requirement Documentation (source-of-truth requirement)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — arsitektur & alur order → payment → finalize → delivery
- [`docs/RUNBOOK.md`](docs/RUNBOOK.md) — setup/run & troubleshooting operasional
- [`CHANGELOG.md`](CHANGELOG.md) — riwayat perubahan per versi

### 🧱 Architecture & Data

- [`docs/FLOWCHART.md`](docs/FLOWCHART.md) — flowchart visual end-to-end (checkout, refund, webhook)
- [`docs/STATE_MACHINE.md`](docs/STATE_MACHINE.md) — state machine transaksi (`pending` → `success` / `failed` / `expired` / `refunded`)
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — ringkasan skema MongoDB (Mongoose)
- [`docs/RUNTIME_MAP.md`](docs/RUNTIME_MAP.md) — peta runtime (file → fungsi → tanggung jawab)
- [`docs/REFACTOR_ROADMAP.md`](docs/REFACTOR_ROADMAP.md) — rencana refactor bertahap (tanpa ubah behavior)
- [`docs/MENGURANGI-BARIS-BOT-JS.md`](docs/MENGURANGI-BARIS-BOT-JS.md) / [`docs/BOT_JS_REDUCTION_PLAN.md`](docs/BOT_JS_REDUCTION_PLAN.md) — panduan modularisasi `bot.js`
- [`docs/MULTI-PLATFORM-PLAN.md`](docs/MULTI-PLATFORM-PLAN.md) — rencana multi-platform (WA, Discord)
- [`docs/WHATSAPP_WA_AUTO_ORDER.md`](docs/WHATSAPP_WA_AUTO_ORDER.md) — rencana WhatsApp auto-order

### 🌐 API & Webhook

- [`docs/API.md`](docs/API.md) — ringkasan endpoint HTTP (public/admin/H2H/webhook)
- [`docs/RESELLER_H2H_API_V2_SPEC.md`](docs/RESELLER_H2H_API_V2_SPEC.md) — spesifikasi hardening H2H V2 (signature, nonce, idempotency, atomic)
- [`docs/RESELLER_H2H_CONTRACT_QA_CHECKLIST.md`](docs/RESELLER_H2H_CONTRACT_QA_CHECKLIST.md) — checklist QA kontrak endpoint H2H (siap pakai untuk integrator)
- [`docs/PAYMENT_CALLBACK_URL.md`](docs/PAYMENT_CALLBACK_URL.md) — URL callback webhook (termasuk Billplz & gateway lain)

### 💳 Payment

- [`docs/PAYMENT_DESIGN.md`](docs/PAYMENT_DESIGN.md) — arsitektur payment gateway
- [`docs/PAYMENT_GATEWAY_CANDIDATES.md`](docs/PAYMENT_GATEWAY_CANDIDATES.md) — analisis kandidat gateway
- [`docs/CHIP_INTEGRATION_PLAN.md`](docs/CHIP_INTEGRATION_PLAN.md) — integrasi CHIP (DuitNow QR Malaysia)
- [`docs/TOYYIBPAY_OFFICIAL_NOTES.md`](docs/TOYYIBPAY_OFFICIAL_NOTES.md) — catatan integrasi ToyyibPay
- [`docs/SANPAY_H2H_TRANSFER_BANK_PLAN.md`](docs/SANPAY_H2H_TRANSFER_BANK_PLAN.md) — rencana Sanpay H2H transfer bank
- [`docs/MALAYSIA_RELEASE_CHECKLIST.md`](docs/MALAYSIA_RELEASE_CHECKLIST.md) — checklist release Malaysia
- [`docs/FULL_MYR_MIGRATION_PLAN.md`](docs/FULL_MYR_MIGRATION_PLAN.md) — rencana migrasi `BASE_CURRENCY=MYR`
- [`docs/examples/payment-integration.example.js`](docs/examples/payment-integration.example.js) — contoh integrasi adapter payment baru

### 💵 Multi-Currency (USD)

- [`docs/USD_INTEGRATION_PLAN.md`](docs/USD_INTEGRATION_PLAN.md) — rencana dukungan USD 4 fase
- [`docs/USD_HYBRID_E2E_SMOKE_TEST.md`](docs/USD_HYBRID_E2E_SMOKE_TEST.md) — runbook smoke test USD hybrid (Phase 3)

### 🩺 Operations & Performance

- [`docs/ANTI-SPAM-CONFIG.md`](docs/ANTI-SPAM-CONFIG.md) — rate limit & anti-spam bot
- [`docs/OWNER_SECURITY_MITIGATION.md`](docs/OWNER_SECURITY_MITIGATION.md) — mitigasi owner-key admin panel
- [`docs/ROLE_BASED_ACCESS_PLAN.md`](docs/ROLE_BASED_ACCESS_PLAN.md) — RBAC admin panel (Owner/Admin/Staff dari env/Gmail)
- [`docs/I18N_PROGRESS.md`](docs/I18N_PROGRESS.md) — progress lokalisasi 3 bahasa
- [`docs/TEST_PLAN_MILESTONE_4.md`](docs/TEST_PLAN_MILESTONE_4.md) — test plan milestone

### 💸 Fitur Bisnis

- [`docs/TRANSFER_SALDO_PLAN.md`](docs/TRANSFER_SALDO_PLAN.md) — rencana transfer saldo antar user
- [`docs/FORMAT_DATA_SEWA_BOT.md`](docs/FORMAT_DATA_SEWA_BOT.md) — format data sewa bot

### 🤝 Customer Support (OpenClaw)

- [`docs/OPENCLAW_CS_FLOW.md`](docs/OPENCLAW_CS_FLOW.md) — flow CS handoff
- [`docs/OPENCLAW_HTTP_CONTRACT.md`](docs/OPENCLAW_HTTP_CONTRACT.md) — HTTP contract integrator

### 📱 PPOB (🚧 Beta / In Development)

> ⚠️ Belum production-ready / belum di-release. Dokumentasi disediakan untuk developer/early access saja.

- [`docs/PPOB_MULTI_PROVIDER_STRUCTURE.md`](docs/PPOB_MULTI_PROVIDER_STRUCTURE.md) — arsitektur multi-provider
- [`docs/DIGIFLAZZ_PPOB_PLAN.md`](docs/DIGIFLAZZ_PPOB_PLAN.md) — rencana implementasi DigiFlazz
- [`docs/DIGIFLAZZ_BOT_FEATURE_ROADMAP.md`](docs/DIGIFLAZZ_BOT_FEATURE_ROADMAP.md) — roadmap fitur PPOB
- [`docs/DIGIFLAZZ_USER_JOURNEY_AWAM.md`](docs/DIGIFLAZZ_USER_JOURNEY_AWAM.md) — user journey end-user
- [`docs/DIGIFLAZZ_GO_LIVE_CHECKLIST.md`](docs/DIGIFLAZZ_GO_LIVE_CHECKLIST.md) — checklist go-live
- [`docs/PPOB_CODE_REVIEW_CHECKLIST.md`](docs/PPOB_CODE_REVIEW_CHECKLIST.md) — checklist code review

## ▶️ Cara Menjalankan (Developer)

1. Salin `.env.example` → `.env`, lalu isi nilai sensitif (lihat juga [`docs/RUNBOOK.md`](docs/RUNBOOK.md)):
   - **Bot & DB**: `BOT_TOKEN`, `MONGO_URI`, `OWNER_ID`, `CHANNEL_ID`
   - **Payment umum**: `BASE_CURRENCY` (`IDR` / `MYR` / `USD`), `CURRENCY_LOCALE`, `SHOW_IDR_ESTIMATE`
   - **Gateway per-provider**: `PAKASIR_*`, `TOYYIBPAY_*`, `BILLPLZ_*`, `CHIP_*`, `ORDERKUOTA_*`, dll.
   - **Admin panel**: `ADMIN_SESSION_SECRET`, `ADMIN_OWNER_EMAILS` (opsional, untuk RBAC)
   - **Anti-spam**: lihat [`docs/ANTI-SPAM-CONFIG.md`](docs/ANTI-SPAM-CONFIG.md)
2. Install dependency:

```bash
npm install
```

3. Jalankan bot:

```bash
npm run start
# atau dev mode dengan auto-reload
npm run dev
```

4. Akses admin panel: `http://localhost:3000/admin` (default port `3000`).
5. **Multi-instance / multi-tenant** — Buat folder per bot dengan `.env` masing-masing, atau pakai script `restart-bot.bat` (Windows) untuk restart cepat tanpa kill port lain.

### 🩺 Health check & monitoring

- `GET /admin/health` — JSON status MongoDB / cache / memory / uptime (untuk uptime monitor eksternal seperti UptimeRobot, BetterStack)
- `/monitor` → section **Instance Health** untuk dashboard visual real-time

## 🔐 Catatan Keamanan

- **Jangan pernah** membagikan atau meng-commit `.env` (bot token, API key, private key, password admin, MongoDB URI).
- Pastikan file `storage/.encryption_key` dan `storage/.encryption_iv` **tidak ikut commit** (sudah di-`.gitignore`).
- Endpoint webhook harus selalu **memverifikasi signature** (HMAC / x_signature / Bearer / IP whitelist) untuk provider yang mendukung.
- Jika menambah fitur payment/delivery baru, pastikan flow finalisasi tetap **idempotent** (anti dobel-kirim/dobel-success) — pakai pattern `refId` deterministik + unique index seperti existing code.
- Untuk Reseller H2H integrator, **selalu** validasi `X-Signature`, `X-Nonce` (replay-guard), dan `Idempotency-Key`. Lihat [`docs/RESELLER_H2H_API_V2_SPEC.md`](docs/RESELLER_H2H_API_V2_SPEC.md).
- Aktifkan **2FA admin** (TOTP / Telegram OTP) untuk akun owner & admin di production.

<div align="center">

# 💎 ORDER SEKARANG

### Pilih Paket yang Cocok Buat Kamu

</div>

---

## 🛒 Paket Harga

<div align="center">

| | 🚀 INSTALASI | 🔄 PERPANJANGAN | 💎 BELI SC | ⚡ CUSTOM |
|:---|:---:|:---:|:---:|:---:|
| **Harga** | **Rp 40.000** | **Rp 25.000**/bulan | **Rp 2.675.000** | Nego |
| Keterangan | Bulan pertama | Bulan ke-2 dst | Lifetime | Request |
| Source Code | ❌ | ❌ | ✅ Full akses | ✅ |
| Free Update | ✅ | ✅ | ❌ | ❌ |
| Support | ✅ Full | ✅ Full | ✅ Full | ✅ Priority |
| Custom Fitur | ❌ | ❌ | 1x Gratis | Unlimited |

> 💡 **Instalasi Rp 40.000** sudah termasuk setup lengkap + 1 bulan pertama!  
> 🔄 **Perpanjangan hanya Rp 25.000/bulan** - Lebih hemat!

</div>

### ✅ Semua Paket Dapat:

- ✓ Bot fully functional & tested
- ✓ Admin panel lengkap (responsive)
- ✓ 12+ payment gateway siap pakai
- ✓ Multi-bahasa (ID/EN/MS)
- ✓ Panduan instalasi detail
- ✓ Bantuan setup awal
- ✓ Support via Telegram
- ✓ Akses grup diskusi

### 🎁 Bonus Pembelian:

- 🔥 Template produk siap pakai
- 📚 Group WhatsApp tutorial instalasi
- 💡 Tips & trick jualan online
- 🤝 Konsultasi bisnis digital

---

## 📞 Hubungi Saya

<div align="center">

[![Telegram](https://img.shields.io/badge/Telegram-@TempestVPNOfficial-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/TempestVPNOfficial)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-083111380628-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/6283111380628)

**⏰ Fast Response: 09:00 - 22:00 WIB**

---

### 🌟 Testimoni

> *"Bot nya keren, pembayaran langsung kedeteksi. Jualan jadi autopilot!"*  
> — **@user1** ⭐⭐⭐⭐⭐

> *"Admin panelnya lengkap banget, gampang dipake."*  
> — **@user2** ⭐⭐⭐⭐⭐

> *"Support nya fast respon, recommended!"*  
> — **@user3** ⭐⭐⭐⭐⭐

---

### 📈 Statistik

| 👥 User Terdaftar | 📦 Transaksi Diproses | ⭐ Rating | 💳 Gateway |
|:---:|:---:|:---:|:---:|
| **500+** | **10.000+** | **4.9/5** | **12+** |

---

[![Order Now](https://img.shields.io/badge/🛒_ORDER_SEKARANG-FF6B6B?style=for-the-badge&logoColor=white)](https://t.me/TempestVPNOfficial)

**💬 Chat langsung untuk konsultasi GRATIS!**

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer&text=Thank%20You!&fontSize=40&fontColor=ffffff&animation=twinkling&fontAlignY=75" width="100%" alt="Footer"/>

<sub>Made with ❤️ by **FusionTempest** • v8.5.0 • © 2024-2026</sub>

</div>
