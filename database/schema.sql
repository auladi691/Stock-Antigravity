-- ========================================================
-- SCHEMA INVENTORY & RESEP (BOM) — MIRA COFFEE
-- PostgreSQL / Supabase Migration Script
-- ========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Outlets Table (Multi-Outlet Ready)
CREATE TABLE IF NOT EXISTS outlets (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  address TEXT,
  phone VARCHAR(30),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Brand Settings Table
CREATE TABLE IF NOT EXISTS brand_settings (
  outlet_id VARCHAR(50) PRIMARY KEY REFERENCES outlets(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL DEFAULT 'Mira Coffee',
  tagline VARCHAR(200) DEFAULT 'Artisan Roast & Eatery',
  logo_url TEXT,
  address TEXT DEFAULT 'Jl. Gandaria Tengah III No. 18, Jakarta Selatan',
  phone VARCHAR(30) DEFAULT '0812-3456-7890',
  primary_color VARCHAR(20) DEFAULT '#B36528',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Ingredients (Master Bahan Baku)
CREATE TABLE IF NOT EXISTS ingredients (
  id VARCHAR(50) PRIMARY KEY,
  outlet_id VARCHAR(50) REFERENCES outlets(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'Coffee', 'Dairy', 'Sweetener', 'Packaging', 'Powder', 'Ice'
  base_unit VARCHAR(20) NOT NULL, -- 'gram', 'ml', 'pcs'
  current_stock NUMERIC(12, 2) NOT NULL DEFAULT 0,
  minimum_stock NUMERIC(12, 2) NOT NULL DEFAULT 0,
  purchase_unit VARCHAR(20) NOT NULL, -- 'kg', 'liter', 'pcs', 'gram', 'ml'
  purchase_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  cost_per_base_unit NUMERIC(12, 4) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive'
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Master Menu
CREATE TABLE IF NOT EXISTS menus (
  id VARCHAR(50) PRIMARY KEY,
  outlet_id VARCHAR(50) REFERENCES outlets(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'Signature', 'Espresso Based', 'Non-Coffee', etc.
  image_url TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'recipe_incomplete'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Menu Variants
CREATE TABLE IF NOT EXISTS menu_variants (
  id VARCHAR(50) PRIMARY KEY,
  menu_id VARCHAR(50) REFERENCES menus(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- 'Regular 16oz', 'Large 20oz', etc.
  selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Recipes (BOM Header)
CREATE TABLE IF NOT EXISTS recipes (
  id VARCHAR(50) PRIMARY KEY,
  menu_id VARCHAR(50) REFERENCES menus(id) ON DELETE CASCADE,
  variant_id VARCHAR(50) REFERENCES menu_variants(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN DEFAULT TRUE,
  total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Recipe Ingredients (BOM Composition)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id VARCHAR(50) REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id VARCHAR(50) REFERENCES ingredients(id) ON DELETE RESTRICT,
  quantity NUMERIC(12, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  calculated_cost NUMERIC(12, 2) NOT NULL DEFAULT 0
);

-- 9. Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id VARCHAR(50) PRIMARY KEY,
  outlet_id VARCHAR(50) REFERENCES outlets(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  category VARCHAR(100),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Stock In (Barang Masuk)
CREATE TABLE IF NOT EXISTS stock_ins (
  id VARCHAR(50) PRIMARY KEY,
  outlet_id VARCHAR(50) REFERENCES outlets(id) ON DELETE CASCADE,
  supplier_id VARCHAR(50) REFERENCES suppliers(id) ON DELETE SET NULL,
  invoice_no VARCHAR(100),
  date DATE NOT NULL,
  total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_in_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_in_id VARCHAR(50) REFERENCES stock_ins(id) ON DELETE CASCADE,
  ingredient_id VARCHAR(50) REFERENCES ingredients(id) ON DELETE RESTRICT,
  quantity NUMERIC(12, 2) NOT NULL,
  input_unit VARCHAR(20) NOT NULL,
  converted_quantity NUMERIC(12, 2) NOT NULL,
  purchase_cost NUMERIC(14, 2) NOT NULL
);

-- 11. Waste Management
CREATE TABLE IF NOT EXISTS wastes (
  id VARCHAR(50) PRIMARY KEY,
  outlet_id VARCHAR(50) REFERENCES outlets(id) ON DELETE CASCADE,
  ingredient_id VARCHAR(50) REFERENCES ingredients(id) ON DELETE RESTRICT,
  quantity NUMERIC(12, 2) NOT NULL,
  cost NUMERIC(14, 2) NOT NULL,
  reason VARCHAR(50) NOT NULL, -- 'Expired', 'Spillage', 'Barista Error', 'Trial', 'Calibration', 'Damaged', 'Other'
  notes TEXT,
  user_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Stock Opname
CREATE TABLE IF NOT EXISTS stock_opnames (
  id VARCHAR(50) PRIMARY KEY,
  outlet_id VARCHAR(50) REFERENCES outlets(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL, -- 'spot_check', 'full'
  status VARCHAR(30) NOT NULL DEFAULT 'draft', -- 'draft', 'approved'
  notes TEXT,
  conducted_by VARCHAR(100) NOT NULL,
  approved_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_opname_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_opname_id VARCHAR(50) REFERENCES stock_opnames(id) ON DELETE CASCADE,
  ingredient_id VARCHAR(50) REFERENCES ingredients(id) ON DELETE RESTRICT,
  system_stock NUMERIC(12, 2) NOT NULL,
  physical_stock NUMERIC(12, 2) NOT NULL,
  difference NUMERIC(12, 2) NOT NULL,
  adjustment_cost NUMERIC(14, 2) NOT NULL DEFAULT 0
);

-- 13. Inventory Ledger (Jurnal Histori Lengkap Stok)
CREATE TABLE IF NOT EXISTS inventory_ledger (
  id VARCHAR(60) PRIMARY KEY,
  outlet_id VARCHAR(50) REFERENCES outlets(id) ON DELETE CASCADE,
  ingredient_id VARCHAR(50) REFERENCES ingredients(id) ON DELETE RESTRICT,
  type VARCHAR(40) NOT NULL, -- 'OPENING_STOCK', 'STOCK_IN', 'MENU_USAGE', 'WASTE', 'ADJUSTMENT', 'STOCK_OPNAME'
  quantity NUMERIC(12, 2) NOT NULL,
  balance_after NUMERIC(12, 2) NOT NULL,
  reference_type VARCHAR(40) NOT NULL, -- 'menu_out', 'stock_in', 'waste', 'opname', 'manual'
  reference_id VARCHAR(60) NOT NULL,
  notes TEXT,
  user_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Sales Transactions
CREATE TABLE IF NOT EXISTS sales_transactions (
  id VARCHAR(50) PRIMARY KEY,
  outlet_id VARCHAR(50) REFERENCES outlets(id) ON DELETE CASCADE,
  total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(30) NOT NULL, -- 'cash', 'qris', 'transfer', 'ewallet'
  cash_received NUMERIC(14, 2),
  cash_change NUMERIC(14, 2),
  status VARCHAR(30) NOT NULL DEFAULT 'completed',
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_transaction_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id VARCHAR(50) REFERENCES sales_transactions(id) ON DELETE CASCADE,
  menu_id VARCHAR(50) REFERENCES menus(id) ON DELETE RESTRICT,
  variant_id VARCHAR(50) REFERENCES menu_variants(id) ON DELETE RESTRICT,
  menu_name VARCHAR(150) NOT NULL,
  variant_name VARCHAR(100) NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  notes TEXT,
  subtotal NUMERIC(14, 2) NOT NULL
);

-- 15. Indexes for High-Performance Realtime Querying
CREATE INDEX IF NOT EXISTS idx_ledger_ingredient ON inventory_ledger(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_ledger_created ON inventory_ledger(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_created ON sales_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_variant ON recipes(variant_id);

-- 16. Enable Supabase Realtime Publication for Live Dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE ingredients, sales_transactions, inventory_ledger;
