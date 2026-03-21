# 📊 Flowchart Auto Order Bot

Dokumen ini berisi flowchart lengkap alur kerja Bot Auto Order. Diagram menggunakan Mermaid dan dapat dirender di GitHub, VS Code, Cursor, dan viewer Markdown lainnya.

---

## 1. Main Menu & Entry Points

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER BUKA BOT                                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        MAIN KEYBOARD                                 │
├─────────────────────────────────────────────────────────────────────┤
│  📂 Beli Produk  │  💰 Top Up  │  🖥️ Panel Pterodactyl (jika aktif) │
│  🎫 Redeem Voucher │  📦 Stock Report │  🔥 Best Seller              │
│  💡 How to Order │  🧑‍💼 Support │  📦 Reseller API                   │
│  📂 Account Info │  🧮 Refund Calculator │  👑 Admin (jika admin)    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Flowchart: Beli Produk (Product Purchase)

```mermaid
flowchart TD
    Start([User: Beli Produk]) --> ListCat[Tampil List Kategori]
    ListCat --> SelectCat[User Pilih Kategori]
    SelectCat --> ListProd[Tampil Daftar Produk]
    ListProd --> SelectProd[User Pilih Produk]
    SelectProd --> Qty[Jumlah: tombol 1x/2x/... atau input manual]
    Qty --> Checkout[Tampil Checkout: produk, qty, total]
    Checkout --> Voucher{Apply Voucher?}
    Voucher -->|Ya| InputVoucher[Input Kode Voucher]
    InputVoucher --> Checkout
    Voucher -->|Tidak| PayMethod
    Checkout --> PayMethod[Pilih Metode Pembayaran]
    
    PayMethod --> Saldo{Saldo?}
    PayMethod --> Gateway{QRIS/Gateway?}
    
    Saldo -->|Cukup| DeductSaldo[Potong Saldo]
    DeductSaldo --> CreateTrxSaldo[Buat Transaction SUCCESS]
    CreateTrxSaldo --> FinalizeProd[finalizeTransaction: PRODUCT]
    FinalizeProd --> Deliver[Deliver Product / Manual Order]
    Deliver --> NotifUser[Notif ke User]
    NotifUser --> EndProd([Selesai])
    
    Gateway --> CreateTrxPending[Buat Transaction PENDING]
    CreateTrxPending --> SendQR[Kirim QR Code ke User]
    SendQR --> Polling{Polling / Webhook<br/>Deteksi Bayar?}
    Polling -->|Ya| FinalizeProd
    Polling -->|User klik Cek Status| CheckStatus[Cek Status ke Gateway]
    CheckStatus -->|Paid| FinalizeProd
    CheckStatus -->|Belum| Wait[User tunggu / coba lagi]
```

---

## 3. Flowchart: Top Up Saldo

```mermaid
flowchart TD
    StartTopup([User: Top Up]) --> Amount[Pilih Nominal / Custom Input]
    Amount --> CheckoutTopup[Checkout: jumlah, total]
    CheckoutTopup --> PayTopup[Pilih: Saldo / QRIS / FPX / dll]
    
    PayTopup --> SaldoTopup{Saldo?}
    PayTopup --> QRISTopup{QRIS/Gateway?}
    
    SaldoTopup -->|Tidak bisa| ErrorSaldo[Saldo tidak bisa topup diri sendiri]
    
    QRISTopup --> CreateTrxTopup[Buat Transaction PENDING]
    CreateTrxTopup --> SendQRTopup[Kirim QR]
    SendQRTopup --> PollTopup[Polling deteksi bayar]
    PollTopup --> FinalizeTopup[finalizeTransaction: TOPUP]
    FinalizeTopup --> AddSaldo[Saldo += amount]
    AddSaldo --> NotifTopup[Notif sukses ke User]
    NotifTopup --> EndTopup([Selesai])
```

---

## 4. Flowchart: Beli Panel Pterodactyl

```mermaid
flowchart TD
    StartPanel([User: Panel Pterodactyl]) --> HasPanel{Sudah punya<br/>panel aktif?}
    
    HasPanel -->|Ya| ShowPanel[Tampil: Lihat Panel / Perpanjang]
    HasPanel -->|Tidak| ListPkg[Tampil List Paket Panel]
    
    ShowPanel --> ViewOpt{Action?}
    ViewOpt -->|Lihat Panel| ViewMine[Tampil detail: Server ID, username, expired, dll]
    ViewOpt -->|Perpanjang| RenewFlow[Pilih paket renew]
    
    ListPkg --> SelectPkg[User Pilih Paket]
    SelectPkg --> InputUser[Input Username wajib min 3 char]
    InputUser --> CheckoutPanel[Checkout: paket, username, total]
    CheckoutPanel --> PayPanel[Pilih: Saldo / QRIS]
    
    PayPanel --> SaldoPanel{Saldo?}
    PayPanel --> QRISPanel{QRIS?}
    
    SaldoPanel -->|Cukup| DeductPanel[Potong Saldo]
    DeductPanel --> CreatePanelSaldo[Transaction SUCCESS]
    CreatePanelSaldo --> FinalizePanel[finalizePanelTransaction]
    
    QRISPanel --> CreatePanelPending[Transaction PENDING]
    CreatePanelPending --> SendQRPanel[Kirim QR]
    SendQRPanel --> PollPanel[Polling deteksi bayar]
    PollPanel --> FinalizePanel
    
    RenewFlow --> PayPanel
    
    FinalizePanel --> CreatePteroUser[createPteroUser di Panel]
    CreatePteroUser --> CreatePteroServer[createPteroServer di Panel]
    CreatePteroServer --> SaveUser[Simpan pteroUserId, pteroServerId,<br/>pteroServerDetails ke User]
    SaveUser --> NotifPanel[Kirim detail akun + link Login ke User]
    NotifPanel --> EndPanel([Selesai])
```

---

## 5. Flowchart: Finalize Transaction (Inti Logic)

```mermaid
flowchart TD
    FinalizeStart([finalizeTransaction dipanggil]) --> Guard1{status ===<br/>SUCCESS?}
    Guard1 -->|Ya| Already[Return: alreadyProcessed]
    Guard1 -->|Tidak| Atomic[Atomic Claim: PENDING → PROCESSING]
    Atomic --> GetUser[Ambil User dari DB]
    
    GetUser --> CheckType{produkInfo.type?}
    
    CheckType -->|TOPUP| TopupFlow[user.saldo += amount]
    TopupFlow --> NotifTopup[Notif topup ke User]
    NotifTopup --> SaveSuccess1[status=SUCCESS, save]
    
    CheckType -->|PANEL| PanelFlow{isRenew?}
    PanelFlow -->|Ya| ExtendPanel[extendPanelExpiry: tambah expiresAt]
    PanelFlow -->|Tidak| CreatePanel[finalizePanelTransaction:<br/>create user + server Pterodactyl]
    ExtendPanel --> SaveSuccess2[status=SUCCESS, save]
    CreatePanel --> SaveSuccess2
    
    CheckType -->|PRODUCT| ProdFlow{deliveryType?}
    ProdFlow -->|MANUAL| ManualOrder[Set manualProcessStatus, notif ke User]
    ProdFlow -->|AUTO| DeliverProd[deliverProduct: kirim stok]
    ManualOrder --> SaveSuccess3[status=SUCCESS, save]
    DeliverProd --> SaveSuccess3
    
    CheckType -->|PRODUCT_MANUAL| ManualFlow[Same as MANUAL product]
    ManualFlow --> SaveSuccess3
    
    SaveSuccess1 --> Channel[Notif ke Channel / Admin]
    SaveSuccess2 --> Channel
    SaveSuccess3 --> Channel
    Channel --> EndFinal([Selesai])
```

---

## 6. Flowchart: Payment Polling (Deteksi Bayar Otomatis)

```mermaid
flowchart TD
    subgraph Polling["Polling Manager (setiap 3–5 detik)"]
        StartPoll([Interval tick]) --> FindPending[Cari Transaction PENDING<br/>paymentProvider = PAKASIR/QIOSPAY/...]
        FindPending --> HasPending{Ada transaksi?}
        HasPending -->|Tidak| SleepPoll[Sleep, tunggu tick berikutnya]
        HasPending -->|Ya| CheckGateway{Cek status ke Gateway}
        CheckGateway --> GatewayResult{Status =<br/>paid/completed?}
        GatewayResult -->|Ya| CallFinalize[Panggil finalizeTransaction]
        GatewayResult -->|Tidak| SleepPoll
        CallFinalize --> SleepPoll
    end
```

---

## 7. Flowchart: Pterodactyl Expiry Scheduler

```mermaid
flowchart TD
    subgraph Scheduler["Scheduler (setiap 1 jam)"]
        Tick([Interval 1 jam]) --> FindUsers[Cari User dengan<br/>pteroServerId + expiresAt]
        FindUsers --> Loop[Untuk setiap user]
        Loop --> CheckExpiry{expiresAt <= now?}
        CheckExpiry -->|Ya| NotifExpired[Notif ke User: server expired]
        NotifExpired --> DeleteServer[deletePteroServer di Panel]
        DeleteServer --> ClearUser[Reset pteroUserId, pteroServerId,<br/>pteroServerDetails = null]
        ClearUser --> SaveUser[user.save]
        CheckExpiry -->|Tidak| CheckWarn{H-1 atau H-3?}
        CheckWarn -->|H-1| Warn1[Kirim warning H-1]
        CheckWarn -->|H-3| Warn3[Kirim warning H-3]
        Warn1 --> Next[User berikutnya]
        Warn3 --> Next
        SaveUser --> Next
        Loop --> Next
    end
```

---

## 8. Flowchart: Admin Panel (Ringkas)

```mermaid
flowchart TD
    Admin([Admin: /admin]) --> Dashboard[Dashboard]
    Dashboard --> Menu{Menu}
    
    Menu -->|Produk| ProdukCRUD[Add / Edit / Delete Produk, Stok]
    Menu -->|Transaksi| TrxList[Lihat Transaksi, Manual Confirm]
    Menu -->|User| UserList[List User, Ban/Unban, Set Balance]
    Menu -->|Voucher| VoucherCRUD[Create / List / Delete Voucher]
    Menu -->|Panel Packages| PteroPkg[Kelola Paket Pterodactyl,<br/>Daftar User Panel, Extend/Suspend]
    Menu -->|Payment| PaymentConfig[Config Gateway QRIS, urutan]
    Menu -->|Broadcast| Broadcast[Kirim broadcast ke user]
    Menu -->|Settings| Settings[Logo, Welcome, Sticker, dll]
```

---

## 9. Diagram Ringkas: Arus Data

```mermaid
flowchart LR
    subgraph User
        TG[📱 Telegram User]
    end
    
    subgraph Bot
        Telegraf[Telegraf Handler]
        ProcessCheckout[processCheckout]
        Finalize[finalizeTransaction]
        PanelFinalize[panelFinalize]
        Polling[Polling Manager]
    end
    
    subgraph External
        Gateway[Payment Gateway<br/>Pakasir, Qiospay, dll]
        Ptero[Pterodactyl Panel API]
    end
    
    subgraph Data
        MongoDB[(MongoDB)]
    end
    
    TG -->|Klik / Input| Telegraf
    Telegraf --> ProcessCheckout
    ProcessCheckout -->|Buat Transaksi| MongoDB
    ProcessCheckout -->|Minta QR| Gateway
    Gateway -->|Webhook / Polling| Polling
    Polling --> Finalize
    Telegraf -->|Bayar Saldo| Finalize
    Finalize -->|type=PANEL| PanelFinalize
    PanelFinalize -->|Create User/Server| Ptero
    Finalize -->|type=TOPUP/PRODUCT| MongoDB
    Finalize -->|Notif| TG
    Telegraf --> MongoDB
```

---

## 10. Tabel Ringkasan Trigger → Action

| Trigger User | Handler | Output |
|--------------|---------|--------|
| 📂 Beli Produk | `flowProducts` | List kategori → produk → checkout |
| 💰 Top Up | `flowTopup` | Nominal → checkout → QR/saldo |
| 🖥️ Panel Pterodactyl | `bot.hears` + `panel_select` | Paket → username → checkout |
| Bayar pakai Saldo | `handlePanelPayment` / `processCheckout` | Langsung finalize |
| Bayar pakai QRIS | `processCheckout` | Transaction PENDING + kirim QR |
| Polling deteksi bayar | `polling.js` | `finalizeTransaction` |
| Klik Cek Status | `check_status` action | `handlePaymentStatusCheck` → finalize |
| Webhook gateway | Route `/pakasir-callback`, dll | `finalizeTransaction` |

---

*Dokumen ini menggambarkan arsitektur Bot Auto Order v6.5.0. Untuk detail implementasi, lihat kode di `bot.js`, `features/`, `services/`.*
