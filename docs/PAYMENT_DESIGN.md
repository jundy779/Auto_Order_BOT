# Desain Payment Gateway & Mata Uang (Auto-Order Bot)

Dokumen ini merangkum keputusan desain untuk semua payment gateway + aturan mata uang, supaya konsisten saat menambah/merapikan fitur baru.

Lihat juga:
- `services/payment/INTERFACE.md` – detail interface adapter per provider.
- `docs/PAYMENT_QRISPY.md` & `docs/PAYMENT_GATEWAY_CANDIDATES.md` – kandidat gateway baru.

---

## 1. Prinsip Utama

1. **Safety dulu, baru fitur**
   - Semua pembayaran harus idempotent: tidak ada double-finalize / double-delivery.
   - Webhook wajib divalidasi (signature + amount).
   - Polling + tombol \"Cek Status\" sebagai backup jika webhook gagal.

2. **Gateway Indonesia = QRIS saja**
   - Tidak pakai VA, Retail (Alfamart/Indomaret), dsb.
   - User selalu lihat QRIS langsung di bot, bukan payment link.

3. **Satu bot = satu cluster negara**
   - Instance bot bisa fokus ke market tertentu:
     - Indonesia → gateway QRIS Indo (Pakasir, Qiospay, Sanpay, Midtrans, Tripay, Violetpay), harga tampil Rp.
     - Malaysia → ToyyibPay (FPX) / DuitNow, harga tampil RM.
     - Singapura (future) → PayNow, harga tampil SGD.

4. **List produk pakai base currency, checkout ikut negara gateway**
   - Harga di katalog/daftar produk pakai satu mata uang dasar (mis. Rp untuk bot Indo, RM untuk bot MY).
   - Saat checkout:
     - Gateway lokal → pakai mata uang base apa adanya.
     - Gateway negara lain → tampilkan lokal currency + estimasi base currency, contoh:  
       `RM 15.00 (≈ Rp 50.000)` atau `S$ 5.00 (≈ Rp 60.000)`.

---

## 2. Gateway yang Sudah Terintegrasi

### 2.1 Indonesia — QRIS

Semua hanya menggunakan QRIS, terhubung di `services/payment/*.js` dan `routes/webhooks.js` / `services/payment/polling.js`.

- **Pakasir**
  - Create: `POST /api/transactioncreate/qris` (project, order_id, amount, api_key).
  - Pay URL: `/pay/{slug}/{amount}?order_id=...&qris_only=1&redirect=...`.
  - Detail: `GET /api/transactiondetail?project&amount&order_id&api_key`.
  - Webhook: `POST /pakasir-callback` → body `amount`, `order_id`, `status: \"completed\"` → finalize.
  - Tidak ada mutasi; polling manual via `checkStatus`.

- **Qiospay**
  - Hanya Get Mutasi: `GET /api/mutasi/qris/{merchant_code}/{api_key}`.
  - Response: `status`, `data[]` (date, amount, type CR/DB, issuer_reff, buyer_reff, qris, balance).
  - Tidak ada webhook → deteksi bayar via polling `getMutasi` (3s).

- **Sanpay**
  - Generate QRIS: `POST /api/v1/topup_qris` (amount, partnerReferenceNo, expirySeconds).
  - Callback: `POST /sanpay-callback` – header `X-Merchant-Code` + `X-Signature` (HMAC-SHA256 body, apiKey); body berisi `referenceNo`/`partnerReferenceNo`, `amount`, dsb.
  - Mutasi: `GET /api/v1/get_mutasi?apikey=&merchant_code=`.
  - Polling 3s + webhook (keduanya dipakai).

- **Midtrans**
  - Create QRIS via Midtrans API (charge).
  - Webhook: `POST /midtrans-webhook` – validate signature & amount, status `settlement`/`capture` → finalize.
  - Tidak pakai mutasi biasa.

- **Tripay**
  - Create QRIS via Tripay API (reference).
  - Webhook: `POST /tripay-callback` – header signature HMAC-SHA256(rawBody, privateKey).
  - Polling 5s (optional backup).

- **Violetpay (Violet Media Pay)**
  - Create QRIS: `POST /create` (api_key, secret_key, channel_payment=QRIS, ref_kode, nominal, signature, url_callback, dst.).
  - Webhook: `POST /violetpay-callback` – signature di body/header, diverifikasi dengan `callbackSignatureFor`/`signatureFor`.
  - Tidak pakai mutasi.

### 2.2 Malaysia — ToyyibPay (FPX)

- Create Bill: `POST /index.php/api/createBill`
  - `userSecretKey`, `categoryCode`, `billName`, `billDescription`, `billPriceSetting`, `billAmount` (sen), `billReturnUrl`, `billCallbackUrl`, `billExternalReferenceNo`, dll.
  - Adapter: `services/payment/toyyibpay.js` (pakai `withRetry` di createBill & checkStatus).
- Check Status: `POST /index.php/api/getBillTransactions` (`billCode`, `billpaymentStatus=1`).
- Callback: `POST /toyyibpay-callback`
  - Body: `refno`, `status` (1=success, 2=pending, 3=fail), `billcode`, `order_id`, `amount`, `transaction_time`.
  - Handler: cari Transaction by `order_id` atau `billCode` (paymentReference), validasi amount, finalize.
- Di checkout (Telegram):
  - Caption: `RM {amountMYR.toFixed(2)} (Rp {formatNumberID(amountIDR)})`.

---

## 3. Gateway Kandidat (Belum Diintegrasikan)

Detail teknis ada di:
- `docs/PAYMENT_QRISPY.md`
- `docs/PAYMENT_GATEWAY_CANDIDATES.md`

---

## 4. Rencana Pengembangan: Multi-Currency per Negara

Target: user tiap negara melihat harga dalam mata uang mereka, tanpa pusing konversi manual.

### 4.1 Struktur harga per produk (rencana)

Tambahkan field di `Product` (konsep):

```js
prices: {
  IDR: Number,   // harga untuk payment Indo (QRIS)
  MYR: Number,   // harga untuk payment Malay (ToyyibPay / DuitNow)
  SGD: Number    // harga untuk payment Singapura (PayNow) — future
}
```

- **Wajib isi**: minimal satu harga (sesuai market bot itu, mis. IDR untuk bot Indo atau MYR untuk bot Malay).
- **Opsional**: isi harga negara lain jika ingin beda angka (tidak bergantung konversi otomatis).

### 4.2 Menentukan mata uang tampilan

Aturan calon implementasi:

- Jika hanya gateway **Indo** yang aktif → base currency tampilan = **IDR**, pakai `prices.IDR`.
- Jika hanya gateway **Malay** yang aktif → base currency tampilan = **MYR**, pakai `prices.MYR`.
- Jika hanya gateway **SG** yang aktif → base currency tampilan = **SGD`, pakai `prices.SGD`.
- Jika campuran (multi-negara) di satu bot:
  - Tampilkan katalog dengan satu base currency (mis. IDR).
  - Saat checkout:
    - Gateway Indo → pakai harga base (IDR).
    - Gateway Malay → pakai `prices.MYR` (jika ada) atau konversi dari base; caption: `RM X.XX (≈ Rp Y)`.
    - Gateway SG → pakai `prices.SGD` (jika ada) atau konversi dari base; caption: `S$ Z.ZZ (≈ Rp Y)`.

Implementasi ini akan di-detailkan nanti di `DATA_MODEL.md` dan modul checkout ketika multi‑negara benar‑benar dibutuhkan.

