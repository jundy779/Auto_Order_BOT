# Payment Gateway Kandidat (Belum Diimplementasi)

Dokumen referensi untuk gateway yang sudah didiskusikan. Nanti tinggal implementasi mengikuti `services/payment/INTERFACE.md` dan pola adapter yang ada.

**Aturan PG Indonesia di project ini:** Hanya QRIS; tampil QR langsung dari bot (tidak pakai payment link). Tidak VA/Retail.

---

## 1. Qrispy (api.qrispy.id)

**Status:** Kandidat — siap diimplementasi bila reputasi/regulasi sudah dicek.

### Ringkasan
- Generate QRIS dinamis per transaksi; satu transaksi = satu `qris_id`.
- Ada webhook `payment.received` + verifikasi signature → cocok untuk auto-finalize.
- Auth: API Token (header). Webhook: secret terpisah untuk HMAC.

### Base URL
- `https://api.qrispy.id`

### Autentikasi
- **API:** Header `X-API-Token: YOUR_API_TOKEN`
- Token dibuat di dashboard (API Tokens), hanya ditampilkan sekali.

### Endpoint

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/payment/qris/generate` | Generate QRIS. Body: `amount`, `payment_reference` (opsional). |
| GET | `/api/payment/qris/{qrisId}/status` | Cek status pembayaran by qris_id. |
| GET | `/api/payment/transactions` | List transaksi (pagination). Query: `status`, `generated_via`, `start_date`, `end_date`, `limit`. |

### Generate QRIS (untuk tampil di bot)

**Request:**
```http
POST https://api.qrispy.id/api/payment/qris/generate
X-API-Token: YOUR_API_TOKEN
Content-Type: application/json

{
  "amount": 50000,
  "payment_reference": "Order-123"   // opsional, pakai refId kita
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "qris_id": "abc-123",
    "qris_image_url": "https://api.qrispy.id/api/public/qris/abc-123/image",
    "qris_image_base64": "data:image/png;base64,...",
    "amount": 50000,
    "expired_at": "2026-01-11T20:15:00+07:00",
    "expires_in_seconds": 900,
    "payment_reference": "Order-123"
  }
}
```

- Simpan `qris_id` di `transaction.paymentReference` untuk check status & webhook.
- Tampilkan QR dari `qris_image_url` atau `qris_image_base64`.

### Webhook (payment received)

- **URL:** Dikonfigurasi di dashboard (Webhook URL). Contoh: `https://your-domain.com/qrispy-callback`.
- **Secret:** Webhook Secret di dashboard; dipakai untuk verifikasi header `X-Qrispy-Signature`.

**Header:**
- `X-Qrispy-Signature`: HMAC-SHA256(raw body JSON, Webhook Secret)

**Payload contoh (`payment.received`):**
```json
{
  "event": "payment.received",
  "data": {
    "qris_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "amount": 50000,
    "received_amount": 50000,
    "payment_reference": "Order-123",
    "paid_at": "2026-01-14T03:00:00+00:00",
    "unique_id": 123
  }
}
```

**Verifikasi (Node.js):**
- Raw body: HMAC-SHA256(payload, webhookSecret) → bandingkan dengan `X-Qrispy-Signature`.
- Jika pakai `express.json()`, perlu raw body untuk signature (atau cek apakah `JSON.stringify(req.body)` konsisten dengan yang dikirim).

**Handler kita:**
- Cari transaksi by `payment_reference` (= refId) atau by `qris_id` (= paymentReference).
- Validasi amount; jika `event === 'payment.received'` → finalize + kirim produk.

### Check Status (polling / tombol Cek Status)

- GET `/api/payment/qris/{qrisId}/status` dengan `qrisId` dari `transaction.paymentReference`.
- Jika status paid → finalize.

### Implementasi nanti
- File: `services/payment/qrispy.js`
- Config: `apiToken`, `webhookSecret`, `baseUrl` (default api.qrispy.id)
- Method: `createTransaction(refId, amount)` → POST generate, return qrBuffer + paymentReference (qris_id); `checkStatus(refId, amount)` → GET status by paymentReference (qris_id)
- Webhook route: `POST /qrispy-callback` di `routes/webhooks.js` (validasi signature, event payment.received)
- Polling: optional (bisa andalkan webhook); kalau ada polling, pakai checkStatus by qris_id
- Env: `QRISPY_API_TOKEN`, `QRISPY_WEBHOOK_SECRET`

### Catatan
- Belum ada sandbox di doc; cek di dashboard bila ada.
- Sebelum production: cek reputasi, regulasi (BI/izin), dan fee.

---

## 2. TemanQRIS (temanqris.com)

**Status:** Kandidat dengan batasan — konfirmasi manual di dashboard; tidak full-auto.

### Ringkasan
- Upload QRIS statis **sekali** (bisa dari Dana / OVO / GoPay merchant) → lalu generate QRIS dinamis dengan nominal.
- **Plus:** Support QRIS Dana, OVO, GoPay merchant → dana masuk langsung ke e-wallet merchant.
- **Minus untuk bot full-auto:** Webhook & cek status dipakai untuk **payment link**. Untuk flow **POST /generate** saja, doc **tidak** menyebut webhook atau order_id/ref untuk deteksi “sudah bayar”. Konfirmasi “paid” juga butuh **approve manual** di dashboard (tombol hijau).

### Base URL
- `https://temanqris.com/api/qris`

### Autentikasi
- **API:** Header `X-API-Key: YOUR_API_KEY`
- API Key dari Dashboard → Settings.

### Endpoint relevan (untuk QRIS langsung di bot)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/my-qris` | Cek apakah sudah upload QRIS (sekali saja). |
| POST | `/upload` | Upload QRIS statis (image atau qris_string). Sekali saja; bisa lewat dashboard. |
| POST | `/generate` | Generate QRIS dinamis. Body: `amount`, optional `fee_type`, `fee_value`, `qris_id`. |
| GET | `/orders/:orderId` | Cek status order — di doc untuk **payment link** (order_id dari create payment-link). |
| GET | `/orders` | List order (filter status, limit, offset). |
| GET | `/usage` | Monitoring limit API (tier: free 50/hari, premium 1000/hari). |

### Upload QRIS (sekali saja)
- Bisa lewat **dashboard web** mereka; tidak wajib dari bot.
- Kalau dari API: GET `/my-qris` → jika `has_qris: false`, POST `/upload` (body `qris_string` atau form `qris_image`).

### Generate QRIS (untuk tampil di bot)

**Request:**
```http
POST https://temanqris.com/api/qris/generate
X-API-Key: YOUR_API_KEY
Content-Type: application/json

{
  "amount": 50000
}
```

**Response (dari doc):**
```json
{
  "success": true,
  "qris": "00020101021226...",
  "qr_image": "data:image/png;base64,...",
  "amount": 50000,
  "expires_at": "2025-12-25T10:00:00.000Z"
}
```

- **Tidak ada** `order_id` atau `transaction_id` di response doc → tidak ada identifier untuk polling/webhook untuk flow generate-only.
- Tampilkan QR dari `qr_image` (base64) atau render dari `qris` string.

### Payment Link (tidak dipakai di project)
- Aturan kita: PG Indonesia tidak pakai payment link; QRIS langsung dari bot.
- Doc webhook & “Cek Status Order” mengacu ke payment link (order_id, link_code). Webhook: `payment.awaiting_confirmation` (customer klik “Sudah Bayar”), `payment.confirmed` (setelah **merchant approve di dashboard**).
- Konfirmasi tetap **human**: merchant harus verifikasi manual lalu klik approve (tombol hijau) di dashboard.

### Webhook (hanya untuk payment link)
- Header: `X-TemanQRIS-Signature` = `sha256=` + HMAC-SHA256(JSON.stringify(payload), webhook secret).
- Event: `payment.awaiting_confirmation`, `payment.confirmed`.
- Untuk **generate-only** tidak ada webhook di doc.

### Implementasi nanti (jika tetap dipakai)
- Hanya layak jika: (1) TemanQRIS menambah webhook/endpoint cek status untuk transaksi **generate**, atau (2) dipakai dengan flow semi-manual (tampil QR, merchant approve manual di dashboard, lalu kita bisa pakai webhook `payment.confirmed` **hanya** jika pakai payment link — tapi itu melanggar aturan “no payment link”).
- Untuk **generate-only + full-auto**: tunggu konfirmasi dari TemanQRIS apakah ada order_id/ref dari generate atau webhook untuk generate.

### Catatan
- Rate limit: Free 50 req/hari, Premium 1000/hari.
- Plus: QRIS Dana/OVO/GoPay merchant, dana langsung ke e-wallet merchant.
- Minus: Konfirmasi manual; doc tidak mendukung auto-detect bayar untuk flow generate-only.

---

## Ringkasan perbandingan

| Aspek | Qrispy | TemanQRIS |
|--------|--------|-----------|
| Generate QRIS | ✅ POST /generate, dapat qris_id + image | ✅ POST /generate, dapat qris + qr_image |
| Tampil QR di bot | ✅ Langsung (qris_id + image) | ✅ Langsung (base64) |
| Deteksi “sudah bayar” | ✅ Webhook payment.received + GET status by qris_id | ❌ Doc tidak ada untuk generate-only; payment link butuh approve manual |
| Verifikasi webhook | ✅ HMAC-SHA256 (raw body, secret) | ✅ sha256= + HMAC-SHA256 (payload, secret) — untuk payment link |
| Cocok full-auto bot | ✅ Ya | ❌ Tidak (manual approve) |
| Plus lain | - | Support Dana/OVO/GoPay merchant |

---

*Terakhir diperbarui: Feb 2025. Sebelum implementasi, cek lagi doc resmi dan dashboard masing-masing provider.*
