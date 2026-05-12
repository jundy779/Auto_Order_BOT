# Indeks Dokumentasi — BOT AUTO ORDER

Peta navigasi dokumentasi teknis di folder `docs/`. Versi ini berisi dokumen referensi **public** yang aman dibaca oleh integrator, reseller, dan calon buyer.

> 📌 Beberapa dokumen internal (roadmap fitur masa depan, business plan, mitigasi keamanan, vendor-specific integration plan, dll.) **tidak dipublish** di repo public ini. Hubungi owner untuk akses jika dibutuhkan untuk kerja sama / integrasi tertentu.

---

## 📖 Dokumen Public (Repo Ini)

| Prioritas | File | Isi |
|-----------|------|-----|
| 1 | [`PRD.md`](./PRD.md) | Product Requirement — scope, persona pengguna, fitur utama |
| 2 | [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Komponen sistem & alur transaksi end-to-end |
| 3 | [`RUNTIME_MAP.md`](./RUNTIME_MAP.md) | Peta runtime: startup → checkout → webhook / polling → finalize |
| 4 | [`DATA_MODEL.md`](./DATA_MODEL.md) | Skema MongoDB / Mongoose (User, Product, Transaction, Voucher, Reseller, dll.) |
| 5 | [`STATE_MACHINE.md`](./STATE_MACHINE.md) | State machine transaksi (`pending` → `paid` → `delivered` / `refunded` / `expired`) |
| 6 | [`FLOWCHART.md`](./FLOWCHART.md) | Flowchart visual end-to-end (Mermaid) — checkout, refund, webhook, top-up |
| 7 | [`RUNBOOK.md`](./RUNBOOK.md) | Setup env, menjalankan bot, troubleshooting umum |

---

## 📁 Di Luar `docs/` (Root Repo)

| File | Isi |
|------|-----|
| [`../README.md`](../README.md) | Overview produk, fitur, FAQ, kontak |
| [`../CHANGELOG.md`](../CHANGELOG.md) | Riwayat rilis & perubahan besar |

---

## 🔒 Tidak Dipublish di Repo Ini

Beberapa dokumen bersifat **internal / private** dan **tidak ada di repo public**:

- Roadmap fitur masa depan (WhatsApp / Discord, PPOB native, USD native, AI CS handoff)
- Business plan & vendor-specific integration plans
- Mitigasi keamanan owner, konfigurasi anti-spam, RBAC detail
- Internal refactor roadmap & checklist QA milestone
- Vendor-specific notes (CHIP, Sanpay, Qrispy, ToyyibPay internal, dll.)

Buyer aktif / integrator yang butuh akses dokumen tertentu silakan hubungi owner via kontak di [`README.md`](../README.md#-hubungi-saya).

---

*Indeks ini disusun untuk navigasi cepat. Versi internal lebih lengkap tersedia secara private.*
