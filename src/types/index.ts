export type BaseUnit = 'gram' | 'ml' | 'pcs';
export type PurchaseUnit = 'kg' | 'gram' | 'liter' | 'ml' | 'pcs';

export type UserRole = 'super_admin' | 'owner' | 'cashier';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  outlet_id: string;
}

export interface Ingredient {
  id: string;
  outlet_id: string;
  name: string;
  category: 'Coffee' | 'Dairy' | 'Sweetener' | 'Packaging' | 'Powder' | 'Ice' | 'Other';
  base_unit: BaseUnit;
  current_stock: number;
  minimum_stock: number;
  purchase_unit: PurchaseUnit;
  purchase_cost: number; // e.g. Rp 180.000 per kg
  cost_per_base_unit: number; // e.g. Rp 180 per gram
  status: 'active' | 'inactive';
  updated_at: string;
}

export interface RecipeIngredient {
  ingredient_id: string;
  quantity: number; // in base_unit
  unit: BaseUnit;
  calculated_cost: number;
}

export interface Recipe {
  id: string;
  menu_id: string;
  variant_id: string;
  version: number;
  active: boolean;
  ingredients: RecipeIngredient[];
  total_cost: number;
  notes?: string;
  updated_at: string;
}

export interface MenuVariant {
  id: string;
  menu_id: string;
  name: string; // e.g. 'Regular', 'Large', 'Hot', 'Iced'
  selling_price: number;
  recipe_id?: string;
  is_default: boolean;
}

export interface Menu {
  id: string;
  outlet_id: string;
  name: string;
  category: string;
  image_url: string; // Photo is required per brand guidelines
  variants: MenuVariant[];
  status: 'active' | 'inactive' | 'recipe_incomplete';
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  category: string;
  address?: string;
}

export interface StockInItem {
  ingredient_id: string;
  quantity: number;
  input_unit: PurchaseUnit;
  converted_quantity: number; // in base_unit
  purchase_cost: number; // cost for this item
}

export interface StockIn {
  id: string;
  outlet_id: string;
  supplier_id: string;
  invoice_no: string;
  date: string;
  items: StockInItem[];
  total_amount: number;
  notes?: string;
  created_by: string;
}

export type WasteReason =
  | 'Expired'
  | 'Spillage'
  | 'Barista Error'
  | 'Trial'
  | 'Calibration'
  | 'Damaged'
  | 'Other';

export interface Waste {
  id: string;
  outlet_id: string;
  ingredient_id: string;
  quantity: number; // in base_unit
  cost: number;
  reason: WasteReason;
  notes?: string;
  user_id: string;
  created_at: string;
}

export type StockOpnameType = 'spot_check' | 'full';
export type StockOpnameStatus = 'draft' | 'approved';

export interface StockOpnameItem {
  ingredient_id: string;
  system_stock: number;
  physical_stock: number;
  difference: number;
  adjustment_cost: number;
}

export interface StockOpname {
  id: string;
  outlet_id: string;
  type: StockOpnameType;
  status: StockOpnameStatus;
  items: StockOpnameItem[];
  notes?: string;
  conducted_by: string;
  approved_by?: string;
  created_at: string;
}

export type InventoryTransactionType =
  | 'OPENING_STOCK'
  | 'STOCK_IN'
  | 'MENU_USAGE'
  | 'WASTE'
  | 'ADJUSTMENT'
  | 'STOCK_OPNAME';

export interface InventoryLedger {
  id: string;
  ingredient_id: string;
  type: InventoryTransactionType;
  quantity: number; // positive or negative in base_unit
  balance_after: number;
  reference_type: 'menu_out' | 'stock_in' | 'waste' | 'opname' | 'manual';
  reference_id: string;
  notes: string;
  user_id: string;
  created_at: string;
}

export interface OrderItem {
  menu_id: string;
  variant_id: string;
  menu_name: string;
  variant_name: string;
  unit_price: number;
  quantity: number;
  notes?: string; // Informational modifier notes (e.g. 'Less Sugar', 'No Ice')
  subtotal: number;
}

export type PaymentMethod = 'cash' | 'qris' | 'transfer' | 'ewallet';

export interface SalesTransaction {
  id: string;
  outlet_id: string;
  items: OrderItem[];
  total_amount: number;
  payment_method: PaymentMethod;
  cash_received?: number;
  cash_change?: number;
  status: 'completed' | 'cancelled';
  synced: boolean;
  created_by: string;
  created_at: string;
}

export interface BrandSetting {
  name: string;
  tagline: string;
  logo_url: string;
  address: string;
  phone: string;
  primary_color: string;
}

export interface IngredientDeductionPreview {
  ingredient_id: string;
  ingredient_name: string;
  required_quantity: number;
  base_unit: BaseUnit;
  current_stock: number;
  remaining_stock: number;
  is_insufficient: boolean;
}
