# Data Model (MongoDB / Mongoose)

Dokumen ini merangkum koleksi utama dan perannya. Detail field lengkap dapat dilihat di folder `models/`.

## Prinsip umum

- **Transaction** adalah sumber kebenaran status pembayaran & delivery.
- **Product** menyimpan stok/konten produk (untuk auto-delivery) dan konfigurasi manual order.
- **Setting** menyimpan konfigurasi dinamis (gateway config, 2FA, exchange rate, dll).

## Koleksi inti

### `User` (`models/User.js`)

Tujuan: menyimpan profil user Telegram dan saldo internal bot.

Field penting:

- `userId` (unik)
- `username`
- `language` (`id|en|ms`)
- `saldo`
- `totalTransaksi`
- `banned`, `banReason`, `bannedAt`, `bannedBy`
- (opsional) info Pterodactyl: `pteroUserId`, `pteroServerId`, `pteroServerDetails`
- `redeemedVouchers[]` untuk tracking voucher redeem

### `Product` (`models/Product.js`)

Tujuan: katalog produk digital, stok, dan aturan delivery.

Field penting:

- `kategori`, `namaProduk` (unik)
- `harga`
- `stok`, `kontenProduk[]`, `totalTerjual`
- `isActive`
- Garansi: `garansiType`, `garansiDurationDays`
- Expired: `expiredDays`, `expiredAt`
- Manual order:
  - `deliveryType` (`AUTO|MANUAL`)
  - `requiredFields[]` (mis. email/username/phone/other)
  - `adminInstructions`
- H2H reseller:
  - `h2hEnabled`
  - `priceH2H` (jika null, default dapat dihitung dari harga retail)

### `Transaction` (`models/Transaction.js`)

Tujuan: state machine transaksi dari checkout → payment → success/delivery → refund/cancel.

Konsep penting:

- Status: `PENDING|SUCCESS|FAILED|EXPIRED|REFUNDED|CANCELLED`
- Produk/topup/panel dibedakan via `produkInfo.type` (`PRODUCT|TOPUP|PANEL`)
- Payment layer:
  - `paymentProvider` (mis. `PAKASIR|QIOSPAY|SANPAY|MIDTRANS|TRIPAY|VIOLETPAY|TOYYIBPAY|...`)
  - `paymentMethod` (`QRIS|DUITNOW|PAYNOW|BALANCE`)
  - `paymentCountry` (`ID|MY|SG`) dan `currency` (`IDR|MYR|SGD`)
  - `externalPayAmount` bila nominal yang harus dicek berbeda dari `totalBayar`
- Review/manual:
  - `needReview`, `reviewReason`, `reviewBy`, `reviewAt`
  - `confirmedManually`
- Delivery:
  - `produkInfo.isManualOrder`, `produkInfo.manualProcessStatus`
  - `produkInfo.stokDikirim[]` (konten yang terkirim)
- Referensi payment:
  - `paymentReference`, `gatewayTransactionId`, `gatewayResponse`
  - `paymentMessageId`, `paymentMessageChatId` (untuk hapus pesan QR)

Catatan idempotency:

- `gatewayTransactionId` dipakai untuk mencegah “mutasi yang sama” dipakai oleh 2 transaksi.

## Koleksi admin/ops

### `Admin` (`models/Admin.js`)

Tujuan: akun admin untuk login ke panel/monitor.

Field penting:

- `username` (unik, lowercase)
- `passwordHash` (bcrypt, ada fallback SHA256 legacy)
- `isOwner` (privilege)
- `language`
- Session: `sessionToken`
- Reset password: `resetPasswordToken`, `resetPasswordExpires`
- 2FA fields (tambahan di model ini): `twoFactorEnabled`, `twoFactorMethod`, `twoFactorSecret`, `backupCodes`, `telegramUserId`

### `Setting` (`models/Setting.js`)

Tujuan: key-value store fleksibel.

Contoh key:

- `payment_gateway_<gateway>` untuk konfigurasi gateway (hot reload)
- `exchange_rate_idr_myr`
- `admin_2fa_<username>`

### `Voucher` (`models/Voucher.js`)

Tujuan: diskon dan redeem reward.

Tipe:

- `DISCOUNT` (percentage/fixed, min purchase, max discount)
- `REDEEM` (reward saldo atau product)

### `SecurityLog` (`models/SecurityLog.js`)

Tujuan: audit log security (login, 2FA, reset password, IP baru, dll).

Catatan:

- TTL index menghapus log lebih dari 90 hari.

### `PushSubscription` (`models/PushSubscription.js`)

Tujuan: menyimpan web push subscription admin.

Field penting:

- `adminId`
- `subscription.endpoint` (unik)
- `isActive`, `lastUsedAt`

## Koleksi reseller

### `Reseller` (`models/Reseller.js`)

Tujuan: identitas reseller H2H + balance + API key/secret.

Field penting:

- `apiKey`, `secretKey`
- `balance`, `minDeposit`, `isActive`, `isVerified`
- OTP: `otp.code`, `otp.expiresAt`

### `ResellerTransaction` (`models/ResellerTransaction.js`)

Tujuan: ledger transaksi reseller (deposit/order/refund/adjustment).

Field penting:

- `type`, `amount`, `balanceBefore`, `balanceAfter`
- `orderId`, `productId`, `productName`, `productData`
- `ipAddress`, `createdAt`

