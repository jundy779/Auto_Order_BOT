# 📋 Panduan Setup Pakasir untuk Pterodactyl Panel

## 🔧 Konfigurasi .env

Tambahkan variabel berikut ke file `.env` (atau panel env hosting pilihanmu):

```env
# Pakasir Payment Gateway
PAKASIR_PROJECT_SLUG=fusionify
PAKASIR_API_KEY=isi-dari-dashboard-pakasir
PAKASIR_REDIRECT_URL=http(s)://domain-atau-ip:port/success
PAKASIR_QRIS_ONLY=1
PAKASIR_WEBHOOK_URL=http(s)://domain-atau-ip:port/pakasir-webhook
SERVER_BASE_URL=http(s)://domain-atau-ip:port
```

### Penempatan Variabel

- **Cloud / VPS Standalone**  
  Simpan di file `.env` yang dibaca oleh proses Node.js (misal lewat `dotenv`). Pastikan file tidak dipublikasikan ke repo publik.

- **Panel Pterodactyl**  
  Masuk tab **Variables** → tambahkan setiap key di atas. Nilai port bisa menggunakan `{{SERVER_PORT}}` supaya otomatis mengikuti allocation panel.

## 🌐 Cara Menentukan URL (Cloud VPS vs Pterodactyl)

### 1. PAKASIR_REDIRECT_URL
**Ini adalah URL yang akan dibuka user setelah pembayaran sukses di browser.**

Format:
```
http(s)://domain-atau-ip:port/success
```

**Cara dapatkan:**
- Jika ada reverse proxy/SSL: `https://yourdomain.com/success`
- Jika pakai IP atau port langsung: `http://ip-kamu:PORT/success`
- Alternatif: `https://t.me/your_bot_username`

**Contoh Cloud / VPS (reverse proxy aktif):**
```
PAKASIR_REDIRECT_URL=https://bot.mydomain.com/success
```

**Contoh Panel Pterodactyl (akses port langsung):**
```
PAKASIR_REDIRECT_URL=http://yourdomain.com:{{SERVER_PORT}}/success
```

### 2. PAKASIR_WEBHOOK_URL (PENTING!)
**Ini adalah URL endpoint untuk menerima callback dari Pakasir saat pembayaran sukses.**

Format:
```
http(s)://domain-atau-ip:port/pakasir-webhook
```

**Cara dapatkan:**
1. Pastikan bot sudah running dan accessible dari internet
2. Gunakan domain atau IP public yang bisa diakses Pakasir
3. Endpoint sudah tersedia di: `/pakasir-webhook`

**Contoh Cloud / VPS (reverse proxy aktif):**
```
PAKASIR_WEBHOOK_URL=https://bot.mydomain.com/pakasir-webhook
```

**Contoh Panel Pterodactyl (akses port langsung):**
```
PAKASIR_WEBHOOK_URL=http://yourdomain.com:{{SERVER_PORT}}/pakasir-webhook
```

### 3. SERVER_BASE_URL
**Base URL server bot (wajib untuk webhook)**

Format:
```
http(s)://domain-atau-ip:port
```

**Contoh Cloud / VPS (reverse proxy aktif):**
```
SERVER_BASE_URL=https://bot.mydomain.com
```

**Contoh Panel Pterodactyl (akses port langsung):**
```
SERVER_BASE_URL=http://yourdomain.com:{{SERVER_PORT}}
```

## 🔐 Setup Webhook di Dashboard Pakasir

1. Login ke dashboard Pakasir: https://app.pakasir.com
2. Masuk ke Settings → Webhooks
3. Set Webhook URL ke URL milikmu (contoh: `https://bot.mydomain.com/pakasir-webhook` atau `http://domainmu:PORT/pakasir-webhook`)
4. Save settings

**PENTING:** Webhook harus accessible dari internet! Pakasir tidak bisa akses localhost.

## ✅ Fitur yang Sudah Ditambahkan

### 1. Auto-Polling Status Check
- Bot otomatis cek status pembayaran setiap 30 detik
- Cek transaksi yang masih PENDING (maksimal 1 jam terakhir)
- Auto-finalisasi jika pembayaran terdeteksi
- Kirim notifikasi ke user otomatis

### 2. Webhook Handler yang Diperbaiki
- Support berbagai format status dari Pakasir
- Validasi webhook payload
- Handle duplicate callback
- Logging lebih detail

### 3. Status Check yang Diperbaiki
- Support PakasirClient dan fallback method
- Mapping status yang lebih akurat
- Logging untuk debugging

## 🧪 Testing

### Test Webhook
1. Buat transaksi Pakasir
2. Bayar transaksi
3. Cek log bot - harus muncul realtime:
   ```
   📥 [PAKASIR CALLBACK] ...
   ✅ [PAKASIR CALLBACK] Transaksi ... berhasil difinalisasi
   ```

### Test Auto-Polling
1. Buat transaksi Pakasir
2. Jangan bayar dulu
3. Tunggu maksimal 30 detik
4. Bayar transaksi
5. Cek log bot - harus muncul (fallback jika webhook terlambat):
   ```
   🔍 [PAKASIR POLLING] Mengecek ... transaksi pending...
   ✅ [PAKASIR POLLING] Transaksi ... berhasil terdeteksi!
   ```

### Test Manual Status Check
1. Buat transaksi Pakasir
2. Klik tombol "⏳ Cek Status"
3. Harus muncul status terbaru

## ⚠️ Troubleshooting

### Problem: Webhook tidak ter-trigger
**Solusi:**
1. Pastikan `PAKASIR_WEBHOOK_URL` sudah di-set di `.env`
2. Pastikan webhook URL accessible dari internet (test dengan browser)
3. Pastikan webhook sudah dikonfigurasi di dashboard Pakasir
4. Cek firewall/port forwarding

### Problem: Status check tidak update
**Solusi:**
1. Auto-polling akan cek setiap 30 detik
2. Atau klik manual "⏳ Cek Status"
3. Cek log untuk error messages

### Problem: Redirect URL tidak bekerja
**Solusi:**
1. Pastikan `PAKASIR_REDIRECT_URL` sudah benar
2. URL harus accessible dari browser user
3. Bisa pakai URL Telegram bot sebagai alternatif

## 📝 Catatan Penting

1. **Webhook vs Redirect:**
   - **Webhook** = untuk bot (otomatis update status)
   - **Redirect** = untuk user (halaman setelah bayar)

2. **Auto-Polling:**
   - Backup jika webhook gagal
   - Cek setiap 30 detik
   - Maksimal 1 jam setelah transaksi dibuat

3. **Security:**
   - Jangan share API key
   - Gunakan HTTPS untuk production
   - Validasi webhook payload (sudah otomatis)

## 🚀 Quick Start

1. Set `.env` dengan URL yang benar
2. Restart bot
3. Test dengan transaksi kecil
4. Monitor log untuk debugging

---

**Need Help?** Cek log bot untuk detail error messages.




