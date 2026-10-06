import { openDB, DBSchema, IDBPDatabase } from 'idb';
import {
  Ingredient,
  Menu,
  Recipe,
  Supplier,
  StockIn,
  Waste,
  StockOpname,
  InventoryLedger,
  SalesTransaction,
  BrandSetting,
} from '../types';

interface MiraDB extends DBSchema {
  ingredients: {
    key: string;
    value: Ingredient;
  };
  menus: {
    key: string;
    value: Menu;
  };
  recipes: {
    key: string;
    value: Recipe;
  };
  suppliers: {
    key: string;
    value: Supplier;
  };
  stock_ins: {
    key: string;
    value: StockIn;
  };
  wastes: {
    key: string;
    value: Waste;
  };
  stock_opnames: {
    key: string;
    value: StockOpname;
  };
  ledger: {
    key: string;
    value: InventoryLedger;
    indexes: { 'by-ingredient': string; 'by-created': string };
  };
  sales: {
    key: string;
    value: SalesTransaction;
    indexes: { 'by-created': string; 'by-synced': number };
  };
  settings: {
    key: string;
    value: BrandSetting;
  };
}

const DB_NAME = 'mira_coffee_inventory_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MiraDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<MiraDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MiraDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('ingredients')) {
          db.createObjectStore('ingredients', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('menus')) {
          db.createObjectStore('menus', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('recipes')) {
          db.createObjectStore('recipes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('suppliers')) {
          db.createObjectStore('suppliers', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('stock_ins')) {
          db.createObjectStore('stock_ins', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('wastes')) {
          db.createObjectStore('wastes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('stock_opnames')) {
          db.createObjectStore('stock_opnames', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('ledger')) {
          const ledgerStore = db.createObjectStore('ledger', { keyPath: 'id' });
          ledgerStore.createIndex('by-ingredient', 'ingredient_id');
          ledgerStore.createIndex('by-created', 'created_at');
        }
        if (!db.objectStoreNames.contains('sales')) {
          const salesStore = db.createObjectStore('sales', { keyPath: 'id' });
          salesStore.createIndex('by-created', 'created_at');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
}

export const SEED_INGREDIENTS: Ingredient[] = [
  {
    id: 'ING-01',
    outlet_id: 'OUTLET-01',
    name: 'Biji Kopi House Blend (Arabica-Robusta 70:30)',
    category: 'Coffee',
    base_unit: 'gram',
    current_stock: 5000,
    minimum_stock: 1200,
    purchase_unit: 'kg',
    purchase_cost: 180000,
    cost_per_base_unit: 180,
    status: 'active',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ING-02',
    outlet_id: 'OUTLET-01',
    name: 'Susu Fresh Milk Pasteurisasi',
    category: 'Dairy',
    base_unit: 'ml',
    current_stock: 12000,
    minimum_stock: 3000,
    purchase_unit: 'liter',
    purchase_cost: 24000,
    cost_per_base_unit: 24,
    status: 'active',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ING-03',
    outlet_id: 'OUTLET-01',
    name: 'Sirup Gula Aren Organik Cair',
    category: 'Sweetener',
    base_unit: 'ml',
    current_stock: 4000,
    minimum_stock: 1000,
    purchase_unit: 'liter',
    purchase_cost: 28000,
    cost_per_base_unit: 28,
    status: 'active',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ING-04',
    outlet_id: 'OUTLET-01',
    name: 'Es Batu Tube Kristal Food Grade',
    category: 'Ice',
    base_unit: 'gram',
    current_stock: 20000,
    minimum_stock: 5000,
    purchase_unit: 'kg',
    purchase_cost: 1500,
    cost_per_base_unit: 1.5,
    status: 'active',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ING-05',
    outlet_id: 'OUTLET-01',
    name: 'Cup PET 16oz Custom Print Mira',
    category: 'Packaging',
    base_unit: 'pcs',
    current_stock: 250,
    minimum_stock: 60,
    purchase_unit: 'pcs',
    purchase_cost: 850,
    cost_per_base_unit: 850,
    status: 'active',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ING-06',
    outlet_id: 'OUTLET-01',
    name: 'Tutup Cup PET Dome / Flat',
    category: 'Packaging',
    base_unit: 'pcs',
    current_stock: 250,
    minimum_stock: 60,
    purchase_unit: 'pcs',
    purchase_cost: 350,
    cost_per_base_unit: 350,
    status: 'active',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ING-07',
    outlet_id: 'OUTLET-01',
    name: 'Sedotan Ramah Lingkungan PLA',
    category: 'Packaging',
    base_unit: 'pcs',
    current_stock: 300,
    minimum_stock: 50,
    purchase_unit: 'pcs',
    purchase_cost: 150,
    cost_per_base_unit: 150,
    status: 'active',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ING-08',
    outlet_id: 'OUTLET-01',
    name: 'Cup PET 20oz Custom Print Mira',
    category: 'Packaging',
    base_unit: 'pcs',
    current_stock: 180,
    minimum_stock: 40,
    purchase_unit: 'pcs',
    purchase_cost: 1100,
    cost_per_base_unit: 1100,
    status: 'active',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ING-09',
    outlet_id: 'OUTLET-01',
    name: 'Bubuk Pure Matcha Uji Premium',
    category: 'Powder',
    base_unit: 'gram',
    current_stock: 1500,
    minimum_stock: 300,
    purchase_unit: 'kg',
    purchase_cost: 360000,
    cost_per_base_unit: 360,
    status: 'active',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ING-10',
    outlet_id: 'OUTLET-01',
    name: 'Hot Paper Cup 8oz Double Wall',
    category: 'Packaging',
    base_unit: 'pcs',
    current_stock: 120,
    minimum_stock: 30,
    purchase_unit: 'pcs',
    purchase_cost: 750,
    cost_per_base_unit: 750,
    status: 'active',
    updated_at: new Date().toISOString(),
  },
];

export const SEED_MENUS: Menu[] = [
  {
    id: 'MENU-01',
    outlet_id: 'OUTLET-01',
    name: 'Es Kopi Susu Mira',
    category: 'Signature',
    image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
    status: 'active',
    variants: [
      {
        id: 'VAR-01-REG',
        menu_id: 'MENU-01',
        name: 'Regular 16oz',
        selling_price: 25000,
        recipe_id: 'REC-01-REG',
        is_default: true,
      },
      {
        id: 'VAR-01-LRG',
        menu_id: 'MENU-01',
        name: 'Large 20oz',
        selling_price: 32000,
        recipe_id: 'REC-01-LRG',
        is_default: false,
      },
    ],
  },
  {
    id: 'MENU-02',
    outlet_id: 'OUTLET-01',
    name: 'Americano Klasik',
    category: 'Espresso Based',
    image_url: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=500&auto=format&fit=crop&q=80',
    status: 'active',
    variants: [
      {
        id: 'VAR-02-ICE',
        menu_id: 'MENU-02',
        name: 'Iced 16oz',
        selling_price: 20000,
        recipe_id: 'REC-02-ICE',
        is_default: true,
      },
      {
        id: 'VAR-02-HOT',
        menu_id: 'MENU-02',
        name: 'Hot 8oz',
        selling_price: 18000,
        recipe_id: 'REC-02-HOT',
        is_default: false,
      },
    ],
  },
  {
    id: 'MENU-03',
    outlet_id: 'OUTLET-01',
    name: 'Cafe Latte Artisanal',
    category: 'Espresso Based',
    image_url: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=500&auto=format&fit=crop&q=80',
    status: 'active',
    variants: [
      {
        id: 'VAR-03-ICE',
        menu_id: 'MENU-03',
        name: 'Iced 16oz',
        selling_price: 26000,
        recipe_id: 'REC-03-ICE',
        is_default: true,
      },
      {
        id: 'VAR-03-HOT',
        menu_id: 'MENU-03',
        name: 'Hot 8oz',
        selling_price: 24000,
        recipe_id: 'REC-03-HOT',
        is_default: false,
      },
    ],
  },
  {
    id: 'MENU-04',
    outlet_id: 'OUTLET-01',
    name: 'Matcha Latte Uji',
    category: 'Non-Coffee',
    image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80',
    status: 'active',
    variants: [
      {
        id: 'VAR-04-ICE',
        menu_id: 'MENU-04',
        name: 'Iced 16oz',
        selling_price: 28000,
        recipe_id: 'REC-04-ICE',
        is_default: true,
      },
    ],
  },
  {
    id: 'MENU-05',
    outlet_id: 'OUTLET-01',
    name: 'Single Espresso Solo',
    category: 'Espresso Based',
    image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&auto=format&fit=crop&q=80',
    status: 'active',
    variants: [
      {
        id: 'VAR-05-SGL',
        menu_id: 'MENU-05',
        name: 'Single Shot',
        selling_price: 15000,
        recipe_id: 'REC-05-SGL',
        is_default: true,
      },
    ],
  },
];

export const SEED_RECIPES: Recipe[] = [
  // Es Kopi Susu Regular
  {
    id: 'REC-01-REG',
    menu_id: 'MENU-01',
    variant_id: 'VAR-01-REG',
    version: 1,
    active: true,
    total_cost: 18 * 180 + 120 * 24 + 20 * 28 + 150 * 1.5 + 850 + 350 + 150, // 3240 + 2880 + 560 + 225 + 850 + 350 + 150 = 8255
    ingredients: [
      { ingredient_id: 'ING-01', quantity: 18, unit: 'gram', calculated_cost: 3240 },
      { ingredient_id: 'ING-02', quantity: 120, unit: 'ml', calculated_cost: 2880 },
      { ingredient_id: 'ING-03', quantity: 20, unit: 'ml', calculated_cost: 560 },
      { ingredient_id: 'ING-04', quantity: 150, unit: 'gram', calculated_cost: 225 },
      { ingredient_id: 'ING-05', quantity: 1, unit: 'pcs', calculated_cost: 850 },
      { ingredient_id: 'ING-06', quantity: 1, unit: 'pcs', calculated_cost: 350 },
      { ingredient_id: 'ING-07', quantity: 1, unit: 'pcs', calculated_cost: 150 },
    ],
    notes: 'Resep standar Es Kopi Susu 16oz',
    updated_at: new Date().toISOString(),
  },
  // Es Kopi Susu Large
  {
    id: 'REC-01-LRG',
    menu_id: 'MENU-01',
    variant_id: 'VAR-01-LRG',
    version: 1,
    active: true,
    total_cost: 24 * 180 + 160 * 24 + 28 * 28 + 200 * 1.5 + 1100 + 350 + 150,
    ingredients: [
      { ingredient_id: 'ING-01', quantity: 24, unit: 'gram', calculated_cost: 4320 },
      { ingredient_id: 'ING-02', quantity: 160, unit: 'ml', calculated_cost: 3840 },
      { ingredient_id: 'ING-03', quantity: 28, unit: 'ml', calculated_cost: 784 },
      { ingredient_id: 'ING-04', quantity: 200, unit: 'gram', calculated_cost: 300 },
      { ingredient_id: 'ING-08', quantity: 1, unit: 'pcs', calculated_cost: 1100 },
      { ingredient_id: 'ING-06', quantity: 1, unit: 'pcs', calculated_cost: 350 },
      { ingredient_id: 'ING-07', quantity: 1, unit: 'pcs', calculated_cost: 150 },
    ],
    notes: 'Resep ukuran besar 20oz',
    updated_at: new Date().toISOString(),
  },
  // Americano Iced
  {
    id: 'REC-02-ICE',
    menu_id: 'MENU-02',
    variant_id: 'VAR-02-ICE',
    version: 1,
    active: true,
    total_cost: 18 * 180 + 160 * 1.5 + 850 + 350 + 150, // 3240 + 240 + 850 + 350 + 150 = 4830
    ingredients: [
      { ingredient_id: 'ING-01', quantity: 18, unit: 'gram', calculated_cost: 3240 },
      { ingredient_id: 'ING-04', quantity: 160, unit: 'gram', calculated_cost: 240 },
      { ingredient_id: 'ING-05', quantity: 1, unit: 'pcs', calculated_cost: 850 },
      { ingredient_id: 'ING-06', quantity: 1, unit: 'pcs', calculated_cost: 350 },
      { ingredient_id: 'ING-07', quantity: 1, unit: 'pcs', calculated_cost: 150 },
    ],
    notes: 'Double shot espresso + air mineral + es',
    updated_at: new Date().toISOString(),
  },
  // Americano Hot
  {
    id: 'REC-02-HOT',
    menu_id: 'MENU-02',
    variant_id: 'VAR-02-HOT',
    version: 1,
    active: true,
    total_cost: 18 * 180 + 750, // 3240 + 750 = 3990
    ingredients: [
      { ingredient_id: 'ING-01', quantity: 18, unit: 'gram', calculated_cost: 3240 },
      { ingredient_id: 'ING-10', quantity: 1, unit: 'pcs', calculated_cost: 750 },
    ],
    notes: 'Double shot espresso + hot water di paper cup 8oz',
    updated_at: new Date().toISOString(),
  },
  // Cafe Latte Iced
  {
    id: 'REC-03-ICE',
    menu_id: 'MENU-03',
    variant_id: 'VAR-03-ICE',
    version: 1,
    active: true,
    total_cost: 18 * 180 + 150 * 24 + 140 * 1.5 + 850 + 350 + 150,
    ingredients: [
      { ingredient_id: 'ING-01', quantity: 18, unit: 'gram', calculated_cost: 3240 },
      { ingredient_id: 'ING-02', quantity: 150, unit: 'ml', calculated_cost: 3600 },
      { ingredient_id: 'ING-04', quantity: 140, unit: 'gram', calculated_cost: 210 },
      { ingredient_id: 'ING-05', quantity: 1, unit: 'pcs', calculated_cost: 850 },
      { ingredient_id: 'ING-06', quantity: 1, unit: 'pcs', calculated_cost: 350 },
      { ingredient_id: 'ING-07', quantity: 1, unit: 'pcs', calculated_cost: 150 },
    ],
    notes: 'Creamy latte dingin',
    updated_at: new Date().toISOString(),
  },
  // Cafe Latte Hot
  {
    id: 'REC-03-HOT',
    menu_id: 'MENU-03',
    variant_id: 'VAR-03-HOT',
    version: 1,
    active: true,
    total_cost: 18 * 180 + 180 * 24 + 750,
    ingredients: [
      { ingredient_id: 'ING-01', quantity: 18, unit: 'gram', calculated_cost: 3240 },
      { ingredient_id: 'ING-02', quantity: 180, unit: 'ml', calculated_cost: 4320 },
      { ingredient_id: 'ING-10', quantity: 1, unit: 'pcs', calculated_cost: 750 },
    ],
    notes: 'Steamed milk + double shot espresso',
    updated_at: new Date().toISOString(),
  },
  // Matcha Latte Iced
  {
    id: 'REC-04-ICE',
    menu_id: 'MENU-04',
    variant_id: 'VAR-04-ICE',
    version: 1,
    active: true,
    total_cost: 15 * 360 + 140 * 24 + 15 * 28 + 150 * 1.5 + 850 + 350 + 150,
    ingredients: [
      { ingredient_id: 'ING-09', quantity: 15, unit: 'gram', calculated_cost: 5400 },
      { ingredient_id: 'ING-02', quantity: 140, unit: 'ml', calculated_cost: 3360 },
      { ingredient_id: 'ING-03', quantity: 15, unit: 'ml', calculated_cost: 420 },
      { ingredient_id: 'ING-04', quantity: 150, unit: 'gram', calculated_cost: 225 },
      { ingredient_id: 'ING-05', quantity: 1, unit: 'pcs', calculated_cost: 850 },
      { ingredient_id: 'ING-06', quantity: 1, unit: 'pcs', calculated_cost: 350 },
      { ingredient_id: 'ING-07', quantity: 1, unit: 'pcs', calculated_cost: 150 },
    ],
    notes: 'Uji matcha whisked with fresh milk and aren',
    updated_at: new Date().toISOString(),
  },
  // Single Espresso
  {
    id: 'REC-05-SGL',
    menu_id: 'MENU-05',
    variant_id: 'VAR-05-SGL',
    version: 1,
    active: true,
    total_cost: 10 * 180,
    ingredients: [
      { ingredient_id: 'ING-01', quantity: 10, unit: 'gram', calculated_cost: 1800 },
    ],
    notes: 'Single shot extraction 30ml',
    updated_at: new Date().toISOString(),
  },
];

export const SEED_SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-01',
    name: 'PT Roaster Kopi Nusantara',
    phone: '0811-2233-4455',
    category: 'Coffee Beans',
    address: 'Bandung, Jawa Barat',
  },
  {
    id: 'SUP-02',
    name: 'Distributor Susu Segar Sejahtera',
    phone: '0812-9988-7766',
    category: 'Dairy Products',
    address: 'Ciputat, Tangerang Selatan',
  },
  {
    id: 'SUP-03',
    name: 'CV Kemasan Indah Pratama',
    phone: '0813-5544-3322',
    category: 'Packaging & Cups',
    address: 'Cengkareng, Jakarta Barat',
  },
  {
    id: 'SUP-04',
    name: 'Gula Aren Parahyangan Alami',
    phone: '0857-1122-3344',
    category: 'Sweetener & Syrup',
    address: 'Sukabumi, Jawa Barat',
  },
];

export const SEED_BRAND_SETTING: BrandSetting = {
  name: 'Mira Coffee',
  tagline: 'Artisan Roast & Eatery',
  logo_url: '',
  address: 'Jl. Gandaria Tengah III No. 18, Jakarta Selatan',
  phone: '0812-3456-7890',
  primary_color: '#B36528',
};

export async function initializeLocalDB(): Promise<void> {
  const db = await getDB();
  const count = await db.count('ingredients');

  if (count === 0) {
    const tx = db.transaction(
      ['ingredients', 'menus', 'recipes', 'suppliers', 'settings', 'ledger'],
      'readwrite'
    );

    for (const ing of SEED_INGREDIENTS) {
      await tx.objectStore('ingredients').put(ing);
      // Record initial opening stock in ledger
      await tx.objectStore('ledger').put({
        id: `LEDGER-INIT-${ing.id}`,
        ingredient_id: ing.id,
        type: 'OPENING_STOCK',
        quantity: ing.current_stock,
        balance_after: ing.current_stock,
        reference_type: 'manual',
        reference_id: 'INIT',
        notes: `Opening stock awal: ${ing.name}`,
        user_id: 'SYSTEM',
        created_at: new Date().toISOString(),
      });
    }

    for (const menu of SEED_MENUS) {
      await tx.objectStore('menus').put(menu);
    }

    for (const recipe of SEED_RECIPES) {
      await tx.objectStore('recipes').put(recipe);
    }

    for (const supplier of SEED_SUPPLIERS) {
      await tx.objectStore('suppliers').put(supplier);
    }

    await tx.objectStore('settings').put(SEED_BRAND_SETTING, 'main');
    await tx.done;
  }
}
