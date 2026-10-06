# Product Requirements Document
## Coffee Shop Inventory & Recipe Management

## 1. Product Overview

Coffee Shop Inventory & Recipe Management adalah sistem inventory untuk kedai kopi yang membantu owner atau manager mencatat bahan baku, membuat menu, menentukan komposisi setiap menu, mencatat menu yang keluar/dibuat, dan otomatis mengurangi stok bahan berdasarkan resep.

Sistem ini **belum mencakup kasir/POS**.

Fokus utama MVP adalah:

**Menu → Recipe → Menu Out → Stock Deduction**

Contoh:

Menu:

**Es Kopi Susu**

Komposisi:

- Coffee Beans: 18 gram
- Fresh Milk: 120 ml
- Gula Aren: 20 ml
- Es Batu: 150 gram
- Cup 16oz: 1 pcs
- Lid: 1 pcs

Jika user mencatat:

**Es Kopi Susu × 3**

Maka sistem otomatis mengurangi:

- Coffee Beans: 54 gram
- Fresh Milk: 360 ml
- Gula Aren: 60 ml
- Es Batu: 450 gram
- Cup: 3 pcs
- Lid: 3 pcs

## 2. Problem Statement

Pemilik kedai sering mengetahui jumlah menu yang dibuat atau keluar, tetapi tidak memiliki pencatatan otomatis mengenai bahan yang terpakai.

Contoh:

Hari ini tercatat:

- Es Kopi Susu: 30 cup
- Americano: 12 cup
- Cafe Latte: 18 cup

Owner ingin langsung mengetahui:

- berapa gram kopi yang terpakai,
- berapa liter susu yang terpakai,
- berapa ml gula aren yang terpakai,
- berapa cup yang berkurang,
- stok tersisa,
- bahan apa yang hampir habis,
- penggunaan bahan berasal dari menu apa,
- berapa estimasi HPP setiap menu,
- apakah stok sistem sesuai stok fisik.

Tanpa sistem berbasis resep, semua hal tersebut harus dihitung manual.

## 3. Product Goal

Membuat sistem inventory yang:

1. menyimpan seluruh bahan baku,
2. menyimpan menu,
3. menyimpan komposisi/resep setiap menu,
4. mencatat jumlah menu yang keluar,
5. otomatis menghitung konsumsi bahan,
6. otomatis mengurangi stok,
7. menyimpan seluruh riwayat pergerakan stok,
8. membantu owner memonitor penggunaan bahan dan kebutuhan restock.

## 4. Non-Goals / Out of Scope MVP

MVP belum mencakup:

- POS / Kasir
- pembayaran
- QRIS
- cash management
- customer management
- invoice pelanggan
- receipt
- online ordering
- marketplace integration
- accounting
- payroll

Integrasi POS dapat dibuat pada fase berikutnya.

## 5. User Roles

### 5.1 Owner

Hak akses penuh.

Owner dapat:

- melihat dashboard,
- membuat dan mengedit bahan,
- membuat dan mengedit menu,
- membuat recipe,
- mencatat Menu Out,
- mencatat Stock In,
- mencatat Waste,
- melakukan Adjustment,
- melakukan Stock Opname,
- melihat inventory history,
- melihat laporan,
- melihat estimasi HPP.

### 5.2 Manager / Barista

Hak akses dapat dibatasi.

Dapat diberikan akses untuk:

- melihat stok,
- mencatat Menu Out,
- mencatat Stock In,
- mencatat Waste,
- melakukan Stock Opname.

Tidak harus memiliki akses untuk:

- mengubah HPP,
- mengubah harga bahan,
- mengubah recipe,
- mengubah setting sistem.

## 6. Core Product Concept

Struktur utama sistem:

**Ingredient**

↓

**Recipe**

↓

**Menu**

↓

**Menu Out**

↓

**Recipe Consumption**

↓

**Inventory Transaction**

↓

**Current Stock**

Hubungan utamanya:

`Menu → Recipe → Ingredients`

Saat Menu Out terjadi:

`Menu Out × Recipe Quantity = Ingredient Usage`

## 7. Module Overview

MVP memiliki modul utama:

1. Dashboard
2. Ingredients
3. Menu
4. Recipes
5. Menu Out
6. Stock In
7. Waste
8. Stock Adjustment
9. Stock Opname
10. Inventory History
11. Reports
12. Settings

## 8. Ingredient Management

Ingredient adalah seluruh bahan atau barang yang digunakan untuk membuat menu.

Contoh:

- Coffee Beans
- Fresh Milk
- Gula Aren
- Matcha Powder
- Chocolate Powder
- Syrup
- Es Batu
- Cup
- Lid
- Straw

### Required Fields

| Field | Example |
|---|---|
| Ingredient ID | ING-001 |
| Name | Coffee Beans |
| Category | Coffee |
| Base Unit | gram |
| Current Stock | 5.000 gram |
| Minimum Stock | 1.000 gram |
| Purchase Unit | kilogram |
| Purchase Cost | Rp180.000/kg |
| Cost per Base Unit | Rp180/gram |
| Status | Active |

## 9. Ingredient Unit

Sistem menggunakan **Base Unit** untuk perhitungan.

Supported base units:

- gram
- ml
- pcs

Supported purchase units:

- kilogram
- gram
- liter
- ml
- pcs

Contoh:

Coffee Beans:

Purchase:

5 kg

Base unit:

gram

Sistem mengkonversi:

5 kg = 5.000 gram

Fresh Milk:

Purchase:

12 liter

Base unit:

ml

Sistem mengkonversi:

12 liter = 12.000 ml

## 10. Menu Management

Menu adalah produk yang dibuat oleh kedai.

Contoh:

- Es Kopi Susu
- Americano
- Cafe Latte
- Cappuccino
- Matcha Latte

### Menu Fields

| Field | Example |
|---|---|
| Menu ID | MENU-001 |
| Name | Es Kopi Susu |
| Category | Coffee |
| Selling Price | Rp22.000 |
| Status | Active |
| Recipe Status | Complete |

Selling Price bersifat opsional untuk MVP tetapi berguna untuk perhitungan margin di masa depan.

## 11. Recipe Management

Setiap menu memiliki satu recipe aktif.

Recipe terdiri dari satu atau lebih ingredient.

Contoh:

### Es Kopi Susu

| Ingredient | Quantity | Unit |
|---|---:|---|
| Coffee Beans | 18 | gram |
| Fresh Milk | 120 | ml |
| Gula Aren | 20 | ml |
| Es Batu | 150 | gram |
| Cup 16oz | 1 | pcs |
| Lid | 1 | pcs |

User dapat:

- menambah ingredient,
- menghapus ingredient,
- mengubah quantity,
- melihat cost masing-masing ingredient,
- melihat total HPP menu.

## 12. Recipe Rules

Satu menu dapat memiliki banyak ingredient.

Satu ingredient dapat digunakan oleh banyak menu.

Contoh:

Coffee Beans digunakan oleh:

- Es Kopi Susu
- Americano
- Cafe Latte
- Cappuccino

Semua menu tersebut mengurangi stok Coffee Beans yang sama.

## 13. Recipe Cost Calculation

Cost menu dihitung berdasarkan recipe.

Formula:

**Ingredient Cost = Quantity Used × Cost per Base Unit**

Contoh:

Coffee Beans:

18 gram × Rp180 = Rp3.240

Fresh Milk:

120 ml × Rp22 = Rp2.640

Gula Aren:

20 ml × Rp25 = Rp500

Cup:

Rp800

Lid:

Rp300

Total HPP:

**Rp7.480**

## 14. Menu Out

Menu Out adalah fitur utama untuk mencatat menu yang dibuat atau keluar.

Ini bukan transaksi penjualan.

Menu Out hanya mencatat jumlah menu yang mengonsumsi bahan.

### Flow

User membuka:

**Menu Out**

↓

Pilih menu:

**Es Kopi Susu**

↓

Input Quantity:

**3**

↓

Sistem mengambil recipe

↓

Sistem menghitung kebutuhan ingredient

↓

User melihat preview

↓

User melakukan Confirm

↓

Stock ingredient otomatis berkurang

## 15. Menu Out Preview

Sebelum transaksi disimpan, sistem menampilkan impact ke inventory.

Contoh:

### Es Kopi Susu × 3

Coffee Beans

18g × 3

**-54g**

Fresh Milk

120ml × 3

**-360ml**

Gula Aren

20ml × 3

**-60ml**

Cup

1 × 3

**-3 pcs**

Setelah user menekan:

**Confirm Menu Out**

transaksi disimpan.

## 16. Menu Out Transaction Data

Setiap transaksi menyimpan:

- Transaction ID
- Date
- Time
- Menu
- Quantity
- Recipe Version
- User
- Notes
- Created At

Contoh:

Transaction ID:

MO-000142

Menu:

Es Kopi Susu

Qty:

3

User:

Manager

## 17. Automatic Stock Deduction

Setelah Menu Out dikonfirmasi, sistem membuat inventory transaction per ingredient.

Contoh:

Menu Out:

Es Kopi Susu ×3

Sistem membuat:

Coffee Beans

-54g

Fresh Milk

-360ml

Gula Aren

-60ml

Es Batu

-450g

Cup

-3 pcs

Lid

-3 pcs

## 18. Inventory Transaction Ledger

Semua perubahan inventory harus masuk ke ledger.

Transaction Types:

- OPENING STOCK
- STOCK IN
- MENU USAGE
- WASTE
- ADJUSTMENT
- STOCK OPNAME

Contoh:

| Time | Ingredient | Type | Qty | Source |
|---|---|---|---:|---|
| 08:00 | Coffee Beans | Stock In | +5.000g | Purchase |
| 09:15 | Coffee Beans | Menu Usage | -54g | Es Kopi Susu ×3 |
| 09:15 | Fresh Milk | Menu Usage | -360ml | Es Kopi Susu ×3 |
| 10:40 | Fresh Milk | Waste | -500ml | Expired |

## 19. Stock Calculation

Formula:

**Current Stock = Opening Stock + Stock In − Menu Usage − Waste ± Adjustment**

## 20. Stock In

Stock In digunakan saat bahan baru masuk.

Input:

- Ingredient
- Quantity
- Unit
- Purchase Cost
- Supplier
- Date
- Invoice / Reference
- Notes

Contoh:

Coffee Beans

5 kg

Purchase Cost:

Rp900.000

System conversion:

5 kg → 5.000 gram

Inventory:

+5.000 gram

## 21. Waste Management

Waste digunakan untuk bahan yang hilang atau tidak dapat digunakan.

Contoh:

Fresh Milk

500 ml

Reason:

Expired

System:

-500 ml

Waste Reasons:

- Expired
- Spillage
- Barista Error
- Trial
- Calibration
- Damaged
- Other

## 22. Stock Adjustment

Adjustment digunakan untuk koreksi manual yang memiliki alasan jelas.

Contoh:

Current system stock:

3.000 gram

Correction:

-50 gram

Reason:

Recording Error

Final:

2.950 gram

Semua adjustment wajib mempunyai:

- quantity,
- reason,
- user,
- date,
- notes.

## 23. Stock Opname

Stock Opname digunakan untuk membandingkan stok sistem dengan stok fisik.

Contoh:

Coffee Beans

System Stock:

2.500 gram

Physical Stock:

2.420 gram

Difference:

-80 gram

Sistem membuat:

**Stock Opname Adjustment -80g**

## 24. Low Stock

Setiap ingredient mempunyai:

**Minimum Stock**

Contoh:

Coffee Beans

Current:

800g

Minimum:

1.000g

Status:

**Low Stock**

Sistem harus dapat memberikan status:

- Normal
- Low
- Out of Stock

## 25. Negative Stock Handling

Jika stock tidak cukup:

Coffee Beans tersedia:

10g

Menu membutuhkan:

18g

Sistem menampilkan:

**Insufficient Stock**

Available:

10g

Required:

18g

Shortage:

8g

Untuk MVP:

User masih dapat melanjutkan transaksi, tetapi harus menerima warning.

Tujuannya agar operasional tidak berhenti hanya karena pencatatan stock belum sinkron.

## 26. Inventory History

User dapat melihat seluruh perubahan stok.

Filter:

- Date
- Ingredient
- Transaction Type
- User
- Menu
- Category

Contoh:

| Date | Item | Transaction | Qty | Balance |
|---|---|---|---:|---:|
| 03 Oct | Coffee Beans | Stock In | +5.000g | 8.000g |
| 03 Oct | Coffee Beans | Menu Usage | -54g | 7.946g |
| 03 Oct | Coffee Beans | Waste | -20g | 7.926g |

## 27. Dashboard

Dashboard harus membantu owner memahami kondisi operasional dengan cepat.

Primary KPIs:

### Current Inventory Value

Total nilai inventory saat ini.

### Ingredient Usage Today

Total cost bahan yang digunakan hari ini.

### Low Stock Ingredients

Jumlah ingredient yang berada di bawah minimum stock.

### Waste Today

Total waste hari ini.

## 28. Dashboard — Inventory Overview

Tampilkan ingredient penting.

Contoh:

Coffee Beans

8.2 kg

Normal

Fresh Milk

4.2 liter

Low

Gula Aren

6.4 liter

Normal

Cup 16oz

28 pcs

Low

## 29. Dashboard — Recent Menu Out

Contoh:

09:45

Es Kopi Susu ×3

09:38

Americano ×2

09:30

Cafe Latte ×1

## 30. Dashboard — Low Stock

Contoh:

| Ingredient | Current | Minimum |
|---|---:|---:|
| Coffee Beans | 800g | 1.000g |
| Fresh Milk | 2L | 5L |
| Cup 16oz | 24 pcs | 50 pcs |

## 31. Reports — Ingredient Usage

User dapat melihat jumlah bahan yang terpakai.

Filter:

- Today
- Yesterday
- This Week
- This Month
- Custom Date

Contoh:

Coffee Beans

2.450g

Fresh Milk

8.200ml

Gula Aren

1.850ml

Cup

84 pcs

## 32. Ingredient Usage Breakdown

User dapat membuka ingredient tertentu.

Contoh:

### Coffee Beans

Total Usage:

2.450 gram

Breakdown:

Es Kopi Susu

1.350g

Americano

600g

Cafe Latte

500g

## 33. Menu Usage Report

Sistem juga mencatat jumlah menu yang dibuat.

Contoh:

Today:

Es Kopi Susu

75 cups

Americano

22 cups

Cafe Latte

18 cups

Data ini tidak berarti transaksi pembayaran.

Hanya mencerminkan Menu Out.

## 34. Waste Report

Report menampilkan:

- total waste,
- ingredient,
- cost,
- reason,
- user,
- period.

Contoh:

Fresh Milk

2.500ml

Cost:

Rp55.000

Main reason:

Expired

## 35. HPP Report

User dapat melihat estimasi HPP per menu.

Contoh:

| Menu | HPP |
|---|---:|
| Es Kopi Susu | Rp7.480 |
| Americano | Rp4.100 |
| Cafe Latte | Rp8.250 |

Jika selling price tersedia, sistem dapat juga menghitung estimasi:

Gross Profit

dan

Gross Margin

## 36. Recipe Versioning

Recipe dapat berubah.

Contoh:

Version 1:

Coffee:

18g

Milk:

120ml

Version 2:

Coffee:

16g

Milk:

130ml

Rule:

Transaksi lama tetap menggunakan recipe version yang aktif saat transaksi dibuat.

Transaksi baru menggunakan versi terbaru.

## 37. Menu Variant

Sistem dapat mendukung variant.

Contoh:

Es Kopi Susu

- Small
- Regular
- Large

Setiap variant dapat memiliki recipe berbeda.

Contoh:

Small:

Coffee 16g

Milk 100ml

Large:

Coffee 20g

Milk 160ml

## 38. Menu Status

Menu memiliki status:

- Active
- Inactive
- Recipe Incomplete

Menu dengan Recipe Incomplete tidak boleh digunakan pada Menu Out.

## 39. Ingredient Status

Ingredient memiliki status:

- Active
- Inactive

Ingredient inactive tidak dapat digunakan untuk recipe baru.

Historical transactions tetap tersimpan.

## 40. Suggested Navigation

Sidebar:

### Dashboard

### Menu Out

### Menu

### Recipes

### Inventory

- Ingredients
- Stock In
- Waste
- Adjustment
- Stock Opname
- History

### Reports

- Ingredient Usage
- Menu Usage
- Waste
- HPP
- Inventory Value

### Settings

## 41. Primary User Flow — Setup

Untuk user baru:

**Create Ingredient**

↓

Input Opening Stock

↓

Create Menu

↓

Create Recipe

↓

Menu Ready

↓

Record Menu Out

↓

Stock automatically decreases

## 42. Primary User Flow — Daily Operation

Operasional harian:

**Dashboard**

↓

**Menu Out**

↓

Select Menu

↓

Input Quantity

↓

Review Ingredient Usage

↓

Confirm

↓

Stock Updated

↓

History Created

## 43. Example End-to-End Scenario

Opening Stock:

Coffee Beans:

10.000g

Fresh Milk:

15.000ml

Gula Aren:

5.000ml

Cup:

200 pcs

Recipe:

Es Kopi Susu

Coffee:

18g

Milk:

120ml

Sugar:

20ml

Cup:

1 pcs

Menu Out:

50 cups

System usage:

Coffee:

900g

Milk:

6.000ml

Sugar:

1.000ml

Cup:

50 pcs

New Stock:

Coffee:

9.100g

Milk:

9.000ml

Sugar:

4.000ml

Cup:

150 pcs

Kemudian terdapat waste:

Milk:

500ml

Final Milk Stock:

8.500ml

## 44. Core Data Model

### Ingredient

- id
- name
- category
- base_unit
- current_stock
- minimum_stock
- cost_per_unit
- status

### Menu

- id
- name
- category
- selling_price
- status

### Recipe

- id
- menu_id
- version
- active

### Recipe Ingredient

- recipe_id
- ingredient_id
- quantity
- unit

### Menu Out

- id
- menu_id
- quantity
- recipe_version
- user_id
- created_at

### Inventory Transaction

- id
- ingredient_id
- type
- quantity
- reference_type
- reference_id
- user_id
- created_at

### Waste

- id
- ingredient_id
- quantity
- reason
- user_id

### Stock Opname

- id
- ingredient_id
- system_stock
- physical_stock
- difference
- user_id

## 45. Business Rules

1. Current Stock tidak boleh diedit langsung tanpa transaction.
2. Setiap perubahan stock wajib memiliki reference.
3. Menu Out wajib menggunakan recipe aktif.
4. Recipe harus memiliki minimal satu ingredient.
5. Quantity ingredient harus lebih besar dari 0.
6. Quantity Menu Out harus lebih besar dari 0.
7. Recipe historical tidak boleh berubah setelah digunakan oleh transaksi.
8. Stock Opname harus menghasilkan adjustment jika terdapat selisih.
9. Ingredient Usage harus dapat ditelusuri kembali ke Menu Out.
10. Semua transaksi harus memiliki timestamp dan user.

## 46. MVP Acceptance Criteria

MVP dianggap selesai jika:

1. User dapat membuat ingredient.
2. User dapat menginput opening stock.
3. User dapat menentukan base unit.
4. User dapat membuat menu.
5. User dapat membuat recipe.
6. Satu recipe dapat memiliki banyak ingredient.
7. Satu ingredient dapat digunakan banyak menu.
8. User dapat melakukan Menu Out.
9. Quantity Menu Out otomatis dikalikan dengan recipe.
10. Semua ingredient terkait otomatis berkurang.
11. Menu Out membuat inventory transaction.
12. Stock In otomatis menambah stock.
13. Waste otomatis mengurangi stock.
14. Adjustment dapat dilakukan dengan reason.
15. Stock Opname dapat membuat adjustment.
16. User dapat melihat current stock.
17. User dapat melihat low stock.
18. User dapat melihat inventory history.
19. User dapat melihat ingredient usage.
20. User dapat melihat menu usage.
21. User dapat melihat HPP menu.
22. User dapat melihat waste.
23. Unit conversion kg/gram dan liter/ml berjalan.
24. Sistem memberi warning untuk insufficient stock.
25. Semua perubahan stock dapat diaudit.

## 47. Future Scope

Setelah MVP stabil, sistem dapat dikembangkan dengan:

- POS integration
- automated Menu Out dari transaksi kasir
- purchase order
- supplier management
- multi outlet
- transfer stock antar outlet
- forecasting kebutuhan bahan
- automatic reorder recommendation
- menu profitability
- production planning
- batch tracking
- expiry tracking
- barcode / QR ingredient
- mobile app

## 48. Product Principle

Prinsip utama produk:

**Menu tidak mengurangi stok secara langsung.**

Menu memiliki recipe.

Menu Out membaca recipe.

Recipe menghasilkan ingredient consumption.

Ingredient consumption menghasilkan inventory transaction.

Inventory transaction menentukan current stock.

Dengan struktur ini, semua perubahan inventory dapat dijelaskan dan diaudit.

## 49. Success Criteria

Owner harus dapat membuka sistem dan menjawab pertanyaan berikut tanpa perhitungan manual:

- Berapa stok kopi sekarang?
- Hari ini kopi keluar berapa gram?
- Susu paling banyak dipakai untuk menu apa?
- Berapa Es Kopi Susu yang dibuat hari ini?
- Berapa bahan yang terbuang?
- Kenapa stok berkurang?
- Bahan apa yang perlu direstock?
- Berapa HPP setiap menu?
- Berapa selisih stok sistem dan stok fisik?
- Transaksi apa yang menyebabkan perubahan stok?

Jika seluruh pertanyaan tersebut dapat dijawab dari sistem, maka core product telah memenuhi tujuan MVP.
