## State Machine Telegram Bot

Dokumen ini merangkum cara `auto-order-payment-bot` mengelola alur percakapan Telegram menggunakan objek in-memory `userStates` dan `adminStates` di `bot.js`.

Tujuannya:
- Menjelaskan **step apa saja yang mungkin**, kapan di-set, kapan di-reset.
- Menjadi dasar refactor ke modul `features/*` tanpa mengubah perilaku bot.

---

## Konsep Umum

### userStates

- Bentuk: object di memory
  - Key: `userId` (Telegram user id).
  - Value: object state, minimal berisi field `step`, kadang ada context tambahan.
- Dipakai untuk melacak posisi **user biasa** dalam berbagai flow:
  - Browse & beli produk.
  - Manual order.
  - Voucher (global & per transaksi).
  - Support / bantuan.
  - Refund / kalkulator.
  - Topup saldo.
- Pola umum:
  - Masuk flow baru:
    - `userStates[userId] = { step: 'SOME_STEP', ...context }`.
  - Handler pesan/callback:
    - Membaca `userStates[userId]?.step` untuk menentukan logic.
  - Keluar flow (sukses / batal / error fatal):
    - `delete userStates[userId]`.

### adminStates

- Bentuk: object di memory
  - Key: `adminId` (Telegram user id admin).
  - Value: object state dengan field `step` dan context.
- Dipakai untuk melacak posisi **admin** dalam flow:
  - Broadcast.
  - Edit produk.
  - Tambah produk.
  - Isi stok konten.
- Pola umum identik dengan `userStates`.

---

## Daftar Step userStates

### MANUAL_ORDER_COLLECTING_DATA

- **Flow**: Manual order produk (`deliveryType: 'MANUAL'`).
- **Masuk ketika**:
  - Transaksi manual dibuat dan produk punya `requiredFields`.
  - Bot set:
    - `userStates[user.userId] = { step: 'MANUAL_ORDER_COLLECTING_DATA', transactionId, requiredFields, currentFieldIndex, collectedData, ... }`.
- **Tujuan**:
  - Bot mengumpulkan data tambahan user (misal email, username, dsb) satu per satu sesuai `requiredFields`.
- **Keluar ketika**:
  - Semua field sudah terisi, data tersimpan ke `Transaction.produkInfo.userInputData`.
  - Flow manual order diteruskan ke admin/panel.
  - State dibersihkan dengan `delete userStates[userId]`.

---

### WAITING_CATEGORY_CHOICE

- **Flow**: Browse & pilih produk.
- **Masuk ketika**:
  - User tekan tombol seperti "🛍️ Lihat Produk / Browse Products".
  - Handler `handleViewProducts`:
    - Reset state lama: `delete userStates[ctx.from.id]`.
    - Tampilkan daftar kategori.
    - Set: `userStates[ctx.from.id] = { step: 'WAITING_CATEGORY_CHOICE' }`.
- **Tujuan**:
  - Bot menunggu user memilih kategori via inline keyboard.
- **Keluar ketika**:
  - User pilih kategori → bot load & tampilkan list produk.
  - State di-update ke step lanjutan (mis. pilih produk, quantity) atau dihapus jika flow selesai/abort.

---

### WAITING_QUANTITY_INPUT / WAITING_QUANTITY

- **Flow**: Order dengan jumlah/qty khusus.
- **Masuk ketika**:
  - Produk yang dipilih membutuhkan input jumlah dari user (jumlah akun, unit, dsb.).
  - Bot set step ini dengan menyimpan context transaksi (produk, harga dasar, dsb.).
- **Tujuan**:
  - Bot menunggu user mengetik angka qty.
  - Melakukan validasi (angka valid, batas minimal/maksimal, stok cukup).
- **Keluar ketika**:
  - Qty valid:
    - Lanjut ke perhitungan harga & pilih gateway pembayaran.
  - Flow selesai atau dibatalkan:
    - `delete userStates[userId]`.

---

### WAITING_VOUCHER_CODE

- **Flow**: Penggunaan voucher **di dalam** flow pembelian (bukan redeem global).
- **Masuk ketika**:
  - Di tengah order, user memilih opsi untuk memasukkan kode voucher.
  - Bot set: `userStates[userId] = { step: 'WAITING_VOUCHER_CODE', ...contextTransaksi }`.
- **Tujuan**:
  - Menunggu input kode voucher yang akan diaplikasikan ke transaksi yang sedang berjalan.
  - Validasi ke koleksi `Voucher` dan aturan (produk yang diizinkan, masa berlaku, kuota).
- **Keluar ketika**:
  - Voucher berhasil diterapkan atau dinyatakan tidak valid.
  - Flow dilanjutkan ke tahap checkout/pembayaran.
  - State dibersihkan.

---

### WAITING_REDEEM_VOUCHER

- **Flow**: Redeem voucher global (contoh: menambah saldo atau benefit lain).
- **Masuk ketika**:
  - User masuk menu khusus redeem voucher.
  - Bot set: `userStates[ctx.from.id] = { step: 'WAITING_REDEEM_VOUCHER' }`.
- **Tujuan**:
  - Menunggu user mengirim kode voucher yang mengubah status global (mis. saldo, bonus).
- **Keluar ketika**:
  - Voucher sukses/gagal diproses, hasil diinformasikan ke user.
  - `delete userStates[ctx.from.id]`.

---

### WAITING_SUPPORT_MESSAGE

- **Flow**: Kirim pesan ke support / CS.
- **Masuk ketika**:
  - User pilih menu bantuan / kontak admin.
  - Bot set: `userStates[userId] = { step: 'WAITING_SUPPORT_MESSAGE' }`.
- **Tujuan**:
  - Menunggu kalimat pesan dari user yang akan diteruskan atau dilog ke admin.
- **Keluar ketika**:
  - Pesan sudah diforward/dicatat.
  - State dihapus.

---

### WAITING_SISA

- **Flow**: Refund / kalkulator refund.
- **Masuk ketika**:
  - User membuka menu refund atau kalkulator refund, lalu memilih salah satu transaksi.
  - Bot set step ini sebagai bagian dari proses hitung.
- **Tujuan**:
  - Menunggu input "sisa" atau nilai lain yang dibutuhkan untuk menghitung jumlah refund.
- **Keluar ketika**:
  - Bot mengirim hasil perhitungan refund ke user.
  - State dihapus.

---

### WAITING_TOPUP_AMOUNT

- **Flow**: Topup saldo.
- **Masuk ketika**:
  - User memilih menu topup dan memilih gateway pembayaran.
  - Bot set:
    - `userStates[userId] = { step: 'WAITING_TOPUP_AMOUNT', gateway }`.
- **Tujuan**:
  - Menunggu user memasukkan nominal topup.
  - Validasi nominal (angka, batas minimal/maksimal, kelipatan).
- **Keluar ketika**:
  - Nominal valid → dibuat `Transaction` tipe TOPUP dan instruksi pembayaran dikirim.
  - Flow dianggap selesai/batal → state dihapus.

---

## Daftar Step adminStates

### BROADCAST_WAITING_MESSAGE

- **Flow**: Broadcast admin.
- **Masuk ketika**:
  - Admin memulai perintah broadcast (misal `startBroadcast`).
  - Bot set:
    - `adminStates[adminId] = { step: 'BROADCAST_WAITING_MESSAGE' }`.
- **Tujuan**:
  - Menunggu admin mengirim konten broadcast:
    - Teks.
    - Foto + caption.
    - Animasi + caption.
    - Dokumen + caption.
- **Keluar ketika**:
  - Payload pesan sudah terbentuk → flow lanjut ke `BROADCAST_WAITING_CONFIRMATION`.

---

### BROADCAST_WAITING_CONFIRMATION

- **Flow**: Konfirmasi broadcast.
- **Masuk ketika**:
  - Payload broadcast (text/photo/animation/document) sudah diterima.
  - Bot menghitung target user (mis. `User.countDocuments()`).
  - Bot set:
    - `adminStates[adminId] = { step: 'BROADCAST_WAITING_CONFIRMATION', payload }`.
- **Tujuan**:
  - Menunggu konfirmasi admin (ya/tidak) sebelum mengirim pesan ke semua user.
- **Keluar ketika**:
  - Admin mengkonfirmasi atau membatalkan broadcast.
  - Setelah aksi selesai → state dihapus.

---

### EDIT_MODE_WAITING_FIELD

- **Flow**: Edit produk.
- **Masuk ketika**:
  - Admin memilih satu produk di mode edit.
  - Bot set:
    - `adminStates[adminId] = { step: 'EDIT_MODE_WAITING_FIELD', productId }`.
- **Tujuan**:
  - Menunggu admin memilih field produk yang ingin diubah:
    - Kategori.
    - Nama produk.
    - Harga.
    - Deskripsi.
    - Jenis garansi & durasi.
    - Syarat ketentuan.
    - Expired.
    - Delivery type, dsb.
- **Keluar ketika**:
  - Field dipilih dan proses edit field berjalan di handler lain.
  - Setelah selesai atau batal → state dihapus.

---

### WAITING_KATEGORI

- **Flow**: Tambah produk baru.
- **Masuk ketika**:
  - Admin menjalankan `startAddProduk`.
  - Bot set:
    - `adminStates[adminId] = { step: 'WAITING_KATEGORI', data: { garansiType, garansiDurationDays, deliveryType } }`.
- **Tujuan**:
  - Menunggu admin memasukkan kategori produk (contoh: "CANVA PRO").
  - Setelah kategori diterima, flow lanjut meminta field-field produk berikutnya (nama, harga, dsb.).
- **Keluar ketika**:
  - Proses tambah produk tuntas atau dibatalkan.
  - State dihapus.

---

### STOK_WAITING_CONTENT

- **Flow**: Isi stok konten produk (AUTO delivery).
- **Masuk ketika**:
  - Admin memilih produk pada menu isi stok.
  - Bot set:
    - `adminStates[adminId] = { step: 'STOK_WAITING_CONTENT', productId }`.
- **Tujuan**:
  - Menunggu admin mengirim teks berisi list konten stok (satu item per baris).
- **Keluar ketika**:
  - Konten stok berhasil diproses dan ditambahkan ke produk.
  - State dihapus.

---

## Pola Reset State

### User

- **Reset di awal flow**:
  - Banyak handler utama menghapus state lama terlebih dahulu, contoh:
    - `delete userStates[ctx.from.id];`
  - Tujuannya mencegah state flow sebelumnya mengganggu flow baru.

- **Reset di akhir flow**:
  - Setelah operasi utama selesai (checkout, manual order, redeem voucher, support, refund, topup), state user dibersihkan.

### Admin

- **Reset di akhir/batal**:
  - Setelah broadcast sukses/gagal, edit/tambah produk selesai, atau stok di-update, state admin dihapus:
    - `delete adminStates[adminId]`.

---

## Guideline Refactor Berdasarkan State Machine

- **Pisahkan per flow ke modul features**:
  - User:
    - `features/user/flowProducts.js` → `WAITING_CATEGORY_CHOICE`, quantity, `WAITING_VOUCHER_CODE`.
    - `features/user/flowManualOrder.js` → `MANUAL_ORDER_COLLECTING_DATA`.
    - `features/user/flowVoucherGlobal.js` → `WAITING_REDEEM_VOUCHER`.
    - `features/user/flowSupport.js` → `WAITING_SUPPORT_MESSAGE`.
    - `features/user/flowRefund.js` → `WAITING_SISA`.
    - `features/user/flowTopup.js` → `WAITING_TOPUP_AMOUNT`.
  - Admin:
    - `features/admin/flowBroadcast.js` → dua step broadcast.
    - `features/admin/flowEditProduct.js` → `EDIT_MODE_WAITING_FIELD`.
    - `features/admin/flowAddProduct.js` → `WAITING_KATEGORI`.
    - `features/admin/flowStock.js` → `STOK_WAITING_CONTENT`.

- **Gunakan helper untuk akses state**:
  - Contoh desain:
    - `setUserState(userId, step, data)`.
    - `getUserState(userId)`.
    - `clearUserState(userId)`.
  - Begitu juga untuk admin:
    - `setAdminState(adminId, step, data)`, dll.
  - Tujuan:
    - Mengurangi duplikasi penulisan `userStates[...]` dan `delete userStates[...]`.
    - Memudahkan migrasi ke pola state machine lain di masa depan kalau dibutuhkan.

