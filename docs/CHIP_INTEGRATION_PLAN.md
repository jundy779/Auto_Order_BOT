# Rencana Integrasi CHIP + DuitNow QR

> Payment gateway Malaysia untuk DuitNow QR via [chip-in.asia](https://www.chip-in.asia/)

---

## 1. Ringkasan

| Aspek | Keterangan |
|-------|------------|
| **Provider** | CHIP (chip-in.asia) |
| **Metode** | DuitNow QR (bypass payment page) |
| **Mata uang** | MYR |
| **Dokumentasi** | [docs.chip-in.asia](https://docs.chip-in.asia/) |
| **API Base** | `https://gate.chip-in.asia/api/v1` |

---

## 2. Flow Pembayaran

```
1. User pilih "DuitNow QR (CHIP)" di checkout
2. Bot: convert IDR → MYR (exchange rate)
3. Bot: POST /purchases/ → dapat checkout_url
4. Bot: kirim link checkout_url + ?preferred=duitnow_qr
5. User buka link → langsung tampil DuitNow QR
6. User scan & bayar
7. CHIP POST ke webhook kita (success_callback atau webhook)
8. Bot: verifikasi signature RSA → finalize transaksi
```

---

## 3. File yang Diubah/Dibuat

| File | Aksi |
|------|------|
| `services/payment/chip.js` | **Buat baru** – service CHIP |
| `config/paymentGateways.js` | Tambah config `chip` |
| `services/payment/index.js` | Register ChipService, getService, isEnabled |
| `routes/webhooks.js` | Handler `/chip-callback` + verifikasi RSA |
| `features/checkout/processCheckout.js` | Case `method === 'chip'` |
| `bot.js` | Button, `CHIP_ENABLED`, check_status |
| `.env` | `CHIP_API_KEY`, `CHIP_BRAND_ID`, `CHIP_CALLBACK_URL`, `CHIP_IS_SANDBOX` |

---

## 4. Environment Variables

```env
# CHIP (Malaysia DuitNow QR)
CHIP_API_KEY=your_secret_key_from_portal
CHIP_BRAND_ID=uuid_from_portal
CHIP_CALLBACK_URL=https://yourdomain.com/chip-callback
CHIP_IS_SANDBOX=true
```

**Cara dapat:**
- API Key: [portal.chip-in.asia/collect/developers/api-keys](https://portal.chip-in.asia/collect/developers/api-keys)
- Brand ID: [portal.chip-in.asia/collect/developers/brands](https://portal.chip-in.asia/collect/developers/brands)

---

## 5. API CHIP yang Dipakai

### 5.1 Create Purchase

```
POST https://gate.chip-in.asia/api/v1/purchases/
Authorization: Bearer <CHIP_API_KEY>
Content-Type: application/json

{
  "brand_id": "<CHIP_BRAND_ID>",
  "client": {
    "email": "user@example.com",
    "full_name": "Customer"
  },
  "purchase": {
    "products": [{ "name": "Order PROD123", "price": 1000 }],
    "currency": "MYR",
    "total_override": 1000
  },
  "reference": "PROD1234567890",
  "success_callback": "https://yourdomain.com/webhooks/chip-callback",
  "success_redirect": "https://t.me/yourbot",
  "failure_redirect": "https://t.me/yourbot"
}
```

**Response:**
```json
{
  "id": "uuid-purchase-id",
  "checkout_url": "https://gate.chip-in.asia/p/xxx",
  "status": "created",
  ...
}
```

**DuitNow QR:** Tambah `?preferred=duitnow_qr` ke `checkout_url`.

### 5.2 Retrieve Purchase (Check Status)

```
GET https://gate.chip-in.asia/api/v1/purchases/{id}/
Authorization: Bearer <CHIP_API_KEY>
```

### 5.3 Verifikasi Callback (RSA Signature)

- Header: `X-Signature` = Base64(RSA-PKCS#1 v1.5 sign(SHA256(body)))
- Public key: `GET /public_key/`
- Verify: `crypto.verify('sha256', bodyBuffer, publicKey, signatureBuffer)`

---

## 6. Schema Transaksi

Untuk CHIP, simpan:

- `paymentProvider`: `'CHIP'`
- `refId`: reference/order kita (e.g. PROD123)
- `paymentReference`: CHIP purchase `id` (untuk check status)
- `externalPayAmount`: amount dalam MYR
- `totalBayar`: amount dalam IDR (original)

---

## 7. Checklist Implementasi

- [ ] `services/payment/chip.js` – createPurchase, checkStatus
- [ ] Config CHIP di `paymentGateways.js`
- [ ] PaymentManager register chip
- [ ] Webhook `/chip-callback` + RSA verification
- [ ] processCheckout case `chip`
- [ ] Bot: button, CHIP_ENABLED, check_status handler
- [ ] flowSaldo: opsi CHIP untuk topup
- [ ] Panel payment (jika ada)
- [ ] i18n: toyyibpay → chip keys (payment title, footer)

---

## 8. Catatan Keamanan

1. **Wajib** verifikasi `X-Signature` pada setiap callback.
2. Simpan public key CHIP (bisa cache), atau fetch saat startup.
3. Gunakan `crypto.timingSafeEqual` jika ada string comparison sensitif.
4. Validasi `amount` di callback harus cocok dengan transaksi di DB.

### Raw Body untuk Verifikasi Signature

CHIP menandatangani **raw request body** (bytes asli). Jika Express memakai `bodyParser.json()`, body sudah di-parse dan raw bytes hilang. Skeleton memakai fallback `JSON.stringify(req.body)`—bisa gagal jika urutan key JSON beda.

**Jika verifikasi signature gagal**, tambahkan middleware untuk menyimpan raw body sebelum parse:

```js
// Sebelum bodyParser.json() untuk route webhook CHIP
app.use('/webhooks/chip-callback', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body;
  next();
});
```

Atau gunakan `express.raw()` hanya untuk route tersebut dan handle body manual.

---

## 9. Testing

- Sandbox: `CHIP_IS_SANDBOX=true`
- Test card (jika pakai card): 4444 3333 2222 1111, CVC 123
- DuitNow QR: gunakan environment test CHIP

---

## 10. Referensi

- [CHIP Collect API](https://docs.chip-in.asia/chip-collect/overview/introduction)
- [DuitNow-QR Direct Post](https://docs.chip-in.asia/chip-collect/overview/direct-post/duitnow-qr)
- [Callbacks & Authentication](https://docs.chip-in.asia/chip-collect/overview/callbacks)
- [Create Purchase](https://docs.chip-in.asia/chip-collect/api-reference/purchases/create)
