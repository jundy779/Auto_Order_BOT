# Qrispy — Referensi API (Belum Diimplementasi)

Dokumen referensi untuk integrasi **Qrispy** (api.qrispy.id). Nanti tinggal implementasi mengikuti `services/payment/INTERFACE.md` dan pola adapter di `services/payment/*.js`.

**Aturan PG Indonesia di project ini:** Hanya QRIS; tampil QR langsung dari bot (tidak pakai payment link).

---

## Ringkasan

- **Generate QRIS** dinamis per transaksi; satu transaksi = satu `qris_id`.
- **Webhook** `payment.received` + verifikasi signature → cocok untuk auto-finalize & kirim produk.
- **Auth:** API Token (header). Webhook: Webhook Secret terpisah untuk HMAC-SHA256.
- **Check status:** GET by `qris_id` untuk polling / tombol Cek Status.

---

## Base URL

```
https://api.qrispy.id
```

---

## Autentikasi

| Jenis | Cara |
|--------|------|
| **API** | Header `X-API-Token: YOUR_API_TOKEN` |
| **Webhook** | Header `X-Qrispy-Signature` = HMAC-SHA256(raw body, Webhook Secret) |

- API Token dibuat di dashboard (API Tokens), **hanya ditampilkan sekali** — simpan aman.
- Webhook Secret di Settings (Webhook); dipakai untuk verifikasi bahwa request benar-benar dari Qrispy.

**Keamanan:** Jangan expose API Key / Webhook Secret di frontend atau commit ke repo publik. Pakai environment variables.

---

## Endpoint

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/payment/qris/generate` | Generate QRIS. Body: `amount`, `payment_reference` (opsional). |
| GET | `/api/payment/qris/{qrisId}/status` | Cek status pembayaran by `qris_id`. |
| GET | `/api/payment/transactions` | List transaksi. Query: `status`, `generated_via`, `start_date`, `end_date`, `limit`. |

---

## 1. Generate QRIS (untuk tampil di bot)

**Request:**
```http
POST https://api.qrispy.id/api/payment/qris/generate
X-API-Token: YOUR_API_TOKEN
Content-Type: application/json

{
  "amount": 50000,
  "payment_reference": "Order-123"
}
```

- `amount`: nominal (integer).
- `payment_reference`: opsional; **pakai refId kita** agar webhook & cek status bisa map ke transaksi.

**Response sukses:**
```json
{
  "status": "success",
  "data": {
    "qris_id": "abc-123",
    "qris_image_url": "https://api.qrispy.id/api/public/qris/abc-123/image",
    "qris_image_base64": "data:image/png;base64,iVBORw0KGgo...",
    "amount": 50000,
    "expired_at": "2026-01-11T20:15:00+07:00",
    "expires_in_seconds": 900,
    "payment_reference": "Order-123"
  }
}
```

**Yang kita simpan / pakai:**
- `qris_id` → simpan di `transaction.paymentReference` (untuk check status & webhook).
- `qris_image_url` atau `qris_image_base64` → tampilkan QR di bot (bisa download dari URL atau decode base64 ke buffer).
- `expired_at` / `expires_in_seconds` → tampilkan info kedaluwarsa ke user.

---

## 2. Cek Status (polling / tombol Cek Status)

**Request:**
```http
GET https://api.qrispy.id/api/payment/qris/{qrisId}/status
X-API-Token: YOUR_API_TOKEN
```

- `qrisId` = nilai yang kita simpan di `transaction.paymentReference` (dari response generate).

**Response:** (format pastikan dari doc resmi; umumnya ada field status seperti `pending` / `paid` / `expired`.)

- Jika status = paid → panggil `finalizeTransaction` + kirim produk.

---

## 3. Webhook (payment received)

**Konfigurasi di dashboard:**
- **Webhook URL:** Contoh `https://your-domain.com/qrispy-callback` (harus HTTPS).
- **Webhook Secret:** Dipakai untuk verifikasi signature; simpan di env (mis. `QRISPY_WEBHOOK_SECRET`).

**Request dari Qrispy ke server kita:**
- Method: POST
- Header: `X-Qrispy-Signature` = HMAC-SHA256(**raw body JSON**, Webhook Secret)
- Body (contoh event `payment.received`):

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

**Verifikasi signature (Node.js):**
- Baca raw body request (penting: harus raw body, bukan parsed object, agar signature match).
- Hitung: `expected = HMAC-SHA256(rawBody, webhookSecret)` (hex).
- Bandingkan dengan header `X-Qrispy-Signature` (pakai `crypto.timingSafeEqual`).
- Jika tidak valid → respond 401, jangan proses.

**Logic handler kita:**
1. Verifikasi `X-Qrispy-Signature`.
2. Jika `event !== 'payment.received'` → respond 200, selesai.
3. Ambil `payment_reference` (= refId kita) atau `qris_id` (= paymentReference).
4. Cari transaksi by refId atau paymentReference, provider QRISPY.
5. Validasi amount (bandingkan dengan `getCheckAmount(trx)`).
6. Jika transaksi masih PENDING → hapus pesan bayar (jika ada) → `finalizeTransaction` → kirim produk.
7. Respond 200 OK.

---

## 4. List Transaksi (opsional)

**Request:**
```http
GET https://api.qrispy.id/api/payment/transactions?status=paid&limit=20
X-API-Token: YOUR_API_TOKEN
```

- Query: `status`, `generated_via`, `start_date`, `end_date`, `limit`.
- Berguna untuk rekonsiliasi; tidak wajib untuk flow utama (generate + webhook + check status).

---

## Checklist implementasi nanti

- [ ] File adapter: `services/payment/qrispy.js`
  - Constructor: `apiToken`, `webhookSecret`, `baseUrl`
  - `createTransaction(refId, amount)` → POST generate, return `{ success, qrBuffer atau qrImageUrl, paymentReference: qris_id, expiredAt }`
  - `checkStatus(refId, amount)` → butuh akses ke paymentReference (qris_id); caller bisa pass `transaction.paymentReference` atau kita cari transaksi by refId dulu lalu ambil paymentReference → GET status by qris_id
- [ ] Webhook: `POST /qrispy-callback` di `routes/webhooks.js`
  - Validasi `X-Qrispy-Signature` (raw body + webhook secret)
  - Event `payment.received` → cari trx, validasi amount, finalize
- [ ] Config & env: `QRISPY_API_TOKEN`, `QRISPY_WEBHOOK_SECRET`, optional `QRISPY_BASE_URL`
- [ ] Daftar di `services/payment/index.js` (PaymentManager), `bot.js` (config, checkout, check_status, polling opsional), `features/checkout/processCheckout.js` (method qrispy), `models/Transaction.js` (paymentProvider QRISPY)
- [ ] Retry: pakai `withRetry` dari `./retry.js` untuk create dan check status
- [ ] INTERFACE.md: tambah baris Qrispy

---

## Catatan

- **Sandbox:** Cek di dashboard Qrispy apakah ada mode sandbox (URL / credential terpisah).
- **Reputasi & regulasi:** Sebelum production, cek perusahaan di balik qrispy.id, izin/BI jika ada, dan fee.
- **Raw body webhook:** Jika Express sudah parse body jadi `req.body`, signature harus pakai **raw buffer**; pertimbangkan middleware yang menyimpan raw body untuk route `/qrispy-callback` saja.

---

*Referensi: doc dari user (API generate, check status, webhook payment.received). Terakhir diperbarui: Feb 2025.*
