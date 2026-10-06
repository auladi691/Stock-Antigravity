# Mira Coffee — Inventory & Recipe Management (BOM) & POS

Sistem manajemen inventaris kedai kopi berbasis resep (**Bill of Materials / BOM**) dan antarmuka kasir (POS) visual tablet-first. Dibangun sesuai panduan **PRD Coffee Shop Inventory & Recipe Management** dengan identitas visual **Mira Coffee Brand Guidelines** dan standar bebas AI-slop (**Anti-Slop**).

---

## ☕ Fitur Utama (Phase 1)

1. **Inventory Berbasis Resep (BOM Engine Otomatis):**
   - Penjualan menu tidak langsung mengurangi angka stok secara sembarangan, melainkan mengeksekusi resep (BOM) per varian.
   - Contoh: 1 cup *Es Kopi Susu Regular* otomatis mengurangi Biji Kopi −18g, Susu −120ml, Gula Aren −20ml, Es −150g, Cup −1 pcs, Tutup −1 pcs.
   - Preview pengurangan stok transparan sebelum konfirmasi pesanan.
2. **Katalog Kasir Visual (Tablet Android Optimized):**
   - Layout landscape responsif untuk tablet kasir.
   - Foto menu wajib dengan pilihan varian (Regular vs Large) dan catatan barista (*Less Sugar, No Ice*).
   - Metode pembayaran multi-channel: Tunai (hitung kembalian otomatis), QRIS, Transfer Bank, dan e-Wallet.
3. **Master Bahan Baku & Konversi Satuan Otomatis:**
   - Satuan dasar perhitungan (*gram, ml, pcs*).
   - Input pembelian supplier dalam satuan pasar (*kg, liter*) dengan auto-konversi harga satuan dasar.
4. **Penerimaan Barang Masuk (Stock In):**
   - Catat invoice penerimaan dari supplier, otomatis meningkatkan stok fisik dan membuat jurnal ledger.
5. **Pencatatan Waste & Kerugian Bahan:**
   - Kategori alasan standar: *Expired, Spillage, Barista Error, Trial, Calibration, Damaged, Other*.
6. **Stock Opname (Audit Fisik):**
   - Mode *Spot Check Harian* (bahan tertentu) dan *Full Opname Mingguan*.
   - Perhitungan selisih teoritis vs fisik dengan persetujuan Owner untuk auto-adjustment.
7. **Jurnal Histori Lengkap (Inventory Ledger):**
   - Audit trail setiap gram/ml bahan: `OPENING_STOCK`, `STOCK_IN`, `MENU_USAGE`, `WASTE`, `ADJUSTMENT`, `STOCK_OPNAME`.
8. **Analisis Bisnis & Laporan HPP:**
   - Estimasi HPP per cup dan Gross Margin (%) per menu.
   - Laporan pemakaian bahan dengan rincian *drill-down* per menu.
   - Total nilai valuasi aset inventaris terkini.
9. **Multi-Role User Simulation:**
   - **Kasir:** Akses operasional kasir, barang masuk, waste, spot opname.
   - **Owner:** Akses penuh seluruh master data, resep BOM, audit ledger, laporan bisnis & approval opname.
   - **Super Admin:** Konfigurasi brand dan global outlet.
10. **100% Offline-Capable (PWA + IndexedDB):**
    - Berjalan lancar saat koneksi internet mati. Data disimpan aman di IndexedDB perangkat tablet.

---

## 🛠️ Tech Stack (100% Free Tier Ready)

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
- **PWA Engine:** `vite-plugin-pwa` (Service Worker & Web Manifest)
- **Database Lokal / Offline:** IndexedDB via `idb`
- **Cloud Database (Opsional):** Supabase (PostgreSQL, Realtime, Auth)
- **Deployment:** Vercel (Gratis)

---

## 🚀 Cara Menjalankan Lokal

```bash
# 1. Clone repository
git clone https://github.com/auladi691/Stock-Antigravity.git
cd Stock-Antigravity

# 2. Install dependencies
npm install

# 3. Jalankan server lokal
npm run dev
```

Buka browser di `http://localhost:5173`.

---

## 📱 Panduan Pemasangan APK di Tablet Android (Gratis)

1. Deploy project ke Vercel (misal: `https://mira-coffee.vercel.app`).
2. Buka situs [PWABuilder.com](https://www.pwabuilder.com/).
3. Masukkan URL Vercel Anda, klik **Start** lalu pilih **Generate Android Package (APK)**.
4. Unduh file APK dan pasang langsung (*sideload*) ke Tablet Android kasir tanpa perlu mendaftar Google Play Developer!

---

## ☁️ Menghubungkan Supabase Cloud (Opsional)

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka menu **SQL Editor**, salin seluruh kode dari file `database/schema.sql` dan klik **Run**.
3. Buat file `.env` di direktori proyek:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Sistem akan otomatis menyinkronkan data lokal ke cloud Supabase!

---

## 📄 Lisensi & Standar
- PRD: Mengikuti `coffee-shop-inventory-recipe-prd.md`
- Visual: Mengikuti `DESIGN.md` (Mira Coffee Brand Identity)
- Standar Kualitas: Bebas AI-slop berdasarkan [anti-slop](https://github.com/miqdadbadjuber/anti-slop).
