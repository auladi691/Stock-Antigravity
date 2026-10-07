import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  UserRole,
  OrderItem,
  PaymentMethod,
} from '../types';
import {
  getDB,
  initializeLocalDB,
  SEED_BRAND_SETTING,
} from '../services/db';
import { generateLedgerFromSales } from '../services/bomEngine';

interface AppContextType {
  ingredients: Ingredient[];
  menus: Menu[];
  recipes: Recipe[];
  suppliers: Supplier[];
  stockIns: StockIn[];
  wastes: Waste[];
  stockOpnames: StockOpname[];
  ledgers: InventoryLedger[];
  sales: SalesTransaction[];
  brandSetting: BrandSetting;
  userRole: UserRole;
  isOnline: boolean;
  activeTab: string;
  isSidebarCollapsed: boolean;
  setActiveTab: (tab: string) => void;
  setUserRole: (role: UserRole) => void;
  toggleSidebar: () => void;
  updateBrandSetting: (setting: BrandSetting) => Promise<void>;
  addIngredient: (ing: Omit<Ingredient, 'id' | 'updated_at'>) => Promise<void>;
  updateIngredient: (id: string, ing: Partial<Ingredient>) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;
  saveMenuAndVariants: (menu: Menu, recipesForVariants?: Recipe[]) => Promise<void>;
  deleteMenu: (id: string) => Promise<void>;
  saveRecipe: (recipe: Recipe) => Promise<void>;
  recordSalesTransaction: (
    items: OrderItem[],
    paymentMethod: PaymentMethod,
    cashReceived?: number,
    cashChange?: number
  ) => Promise<{ success: boolean; transactionId?: string; error?: string }>;
  recordStockIn: (stockIn: Omit<StockIn, 'id'>) => Promise<void>;
  recordWaste: (waste: Omit<Waste, 'id' | 'created_at'>) => Promise<void>;
  recordManualAdjustment: (
    ingredientId: string,
    adjustedQty: number,
    reason: string
  ) => Promise<void>;
  recordStockOpname: (
    type: 'spot_check' | 'full',
    items: {
      ingredient_id: string;
      system_stock: number;
      physical_stock: number;
    }[],
    notes?: string
  ) => Promise<void>;
  approveStockOpname: (opnameId: string) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  refreshAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stockIns, setStockIns] = useState<StockIn[]>([]);
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [stockOpnames, setStockOpnames] = useState<StockOpname[]>([]);
  const [ledgers, setLedgers] = useState<InventoryLedger[]>([]);
  const [sales, setSales] = useState<SalesTransaction[]>([]);
  const [brandSetting, setBrandSetting] = useState<BrandSetting>(SEED_BRAND_SETTING);
  const [userRole, setUserRole] = useState<UserRole>('owner');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [activeTab, setActiveTab] = useState<string>('pos');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mira_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('mira_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize DB and load state
  useEffect(() => {
    async function loadData() {
      await initializeLocalDB();
      await refreshAllData();
    }
    loadData();
  }, []);

  const refreshAllData = async () => {
    const db = await getDB();
    const allIngs = await db.getAll('ingredients');
    const allMenus = await db.getAll('menus');
    const allRecipes = await db.getAll('recipes');
    const allSuppliers = await db.getAll('suppliers');
    const allStockIns = await db.getAll('stock_ins');
    const allWastes = await db.getAll('wastes');
    const allOpnames = await db.getAll('stock_opnames');
    const allLedger = await db.getAll('ledger');
    const allSales = await db.getAll('sales');
    const savedSetting = await db.get('settings', 'main');

    setIngredients(allIngs);
    setMenus(allMenus);
    setRecipes(allRecipes);
    setSuppliers(allSuppliers);
    setStockIns(allStockIns.sort((a, b) => (b.date > a.date ? 1 : -1)));
    setWastes(allWastes.sort((a, b) => (b.created_at > a.created_at ? 1 : -1)));
    setStockOpnames(allOpnames.sort((a, b) => (b.created_at > a.created_at ? 1 : -1)));
    setLedgers(allLedger.sort((a, b) => (b.created_at > a.created_at ? 1 : -1)));
    setSales(allSales.sort((a, b) => (b.created_at > a.created_at ? 1 : -1)));

    if (savedSetting) {
      setBrandSetting(savedSetting);
    }
  };

  const updateBrandSetting = async (setting: BrandSetting) => {
    const db = await getDB();
    await db.put('settings', setting, 'main');
    setBrandSetting(setting);
  };

  const addIngredient = async (ing: Omit<Ingredient, 'id' | 'updated_at'>) => {
    const db = await getDB();
    const id = `ING-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();
    const newIng: Ingredient = {
      ...ing,
      id,
      updated_at: now,
    };
    await db.put('ingredients', newIng);

    // Initial opening stock transaction in ledger if > 0
    if (newIng.current_stock > 0) {
      const ledgerEntry: InventoryLedger = {
        id: `LEDGER-OPENING-${id}-${Date.now()}`,
        ingredient_id: id,
        type: 'OPENING_STOCK',
        quantity: newIng.current_stock,
        balance_after: newIng.current_stock,
        reference_type: 'manual',
        reference_id: id,
        notes: `Opening stock awal: ${newIng.name}`,
        user_id: userRole.toUpperCase(),
        created_at: now,
      };
      await db.put('ledger', ledgerEntry);
    }

    await refreshAllData();
  };

  const updateIngredient = async (id: string, partial: Partial<Ingredient>) => {
    const db = await getDB();
    const existing = await db.get('ingredients', id);
    if (!existing) return;

    const updated: Ingredient = {
      ...existing,
      ...partial,
      updated_at: new Date().toISOString(),
    };
    await db.put('ingredients', updated);
    await refreshAllData();
  };

  const deleteIngredient = async (id: string) => {
    const db = await getDB();
    await db.delete('ingredients', id);
    await refreshAllData();
  };

  const saveMenuAndVariants = async (menu: Menu, recipesForVariants?: Recipe[]) => {
    const db = await getDB();
    const tx = db.transaction(['menus', 'recipes'], 'readwrite');
    await tx.objectStore('menus').put(menu);

    if (recipesForVariants) {
      for (const recipe of recipesForVariants) {
        await tx.objectStore('recipes').put(recipe);
      }
    }
    await tx.done;
    await refreshAllData();
  };

  const deleteMenu = async (id: string) => {
    const db = await getDB();
    await db.delete('menus', id);
    await refreshAllData();
  };

  const saveRecipe = async (recipe: Recipe) => {
    const db = await getDB();
    await db.put('recipes', recipe);
    await refreshAllData();
  };

  const recordSalesTransaction = async (
    items: OrderItem[],
    paymentMethod: PaymentMethod,
    cashReceived?: number,
    cashChange?: number
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
    if (items.length === 0) {
      return { success: false, error: 'Keranjang kosong' };
    }

    const txId = `ORD-${Date.now().toString().slice(-6)}`;
    const totalAmount = items.reduce((acc, curr) => acc + curr.subtotal, 0);
    const now = new Date().toISOString();

    const transaction: SalesTransaction = {
      id: txId,
      outlet_id: 'OUTLET-01',
      items,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      cash_received: cashReceived,
      cash_change: cashChange,
      status: 'completed',
      synced: isOnline,
      created_by: userRole.toUpperCase(),
      created_at: now,
    };

    // Calculate BOM deductions & ledgers
    const { updatedIngredients, newLedgers } = generateLedgerFromSales(
      transaction,
      items,
      recipes,
      ingredients,
      userRole.toUpperCase()
    );

    const db = await getDB();
    const tx = db.transaction(['sales', 'ingredients', 'ledger'], 'readwrite');

    await tx.objectStore('sales').put(transaction);

    for (const ing of updatedIngredients) {
      await tx.objectStore('ingredients').put(ing);
    }

    for (const ldg of newLedgers) {
      await tx.objectStore('ledger').put(ldg);
    }

    await tx.done;
    await refreshAllData();

    return { success: true, transactionId: txId };
  };

  const recordStockIn = async (stockInInput: Omit<StockIn, 'id'>) => {
    const id = `IN-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const newStockIn: StockIn = {
      ...stockInInput,
      id,
    };

    const db = await getDB();
    const tx = db.transaction(['stock_ins', 'ingredients', 'ledger'], 'readwrite');

    await tx.objectStore('stock_ins').put(newStockIn);

    for (const item of newStockIn.items) {
      const ing = await tx.objectStore('ingredients').get(item.ingredient_id);
      if (ing) {
        const newStock = ing.current_stock + item.converted_quantity;
        const updatedIng: Ingredient = {
          ...ing,
          current_stock: newStock,
          updated_at: now,
        };
        await tx.objectStore('ingredients').put(updatedIng);

        // Record in ledger
        const ldg: InventoryLedger = {
          id: `LEDGER-IN-${id}-${item.ingredient_id}`,
          ingredient_id: ing.id,
          type: 'STOCK_IN',
          quantity: item.converted_quantity,
          balance_after: newStock,
          reference_type: 'stock_in',
          reference_id: id,
          notes: `Stock in Invoice #${newStockIn.invoice_no}: +${item.quantity} ${item.input_unit}`,
          user_id: userRole.toUpperCase(),
          created_at: now,
        };
        await tx.objectStore('ledger').put(ldg);
      }
    }

    await tx.done;
    await refreshAllData();
  };

  const recordWaste = async (wasteInput: Omit<Waste, 'id' | 'created_at'>) => {
    const id = `WST-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const newWaste: Waste = {
      ...wasteInput,
      id,
      created_at: now,
    };

    const db = await getDB();
    const tx = db.transaction(['wastes', 'ingredients', 'ledger'], 'readwrite');

    await tx.objectStore('wastes').put(newWaste);

    const ing = await tx.objectStore('ingredients').get(newWaste.ingredient_id);
    if (ing) {
      const newStock = ing.current_stock - newWaste.quantity;
      await tx.objectStore('ingredients').put({
        ...ing,
        current_stock: newStock,
        updated_at: now,
      });

      const ldg: InventoryLedger = {
        id: `LEDGER-WST-${id}`,
        ingredient_id: ing.id,
        type: 'WASTE',
        quantity: -newWaste.quantity,
        balance_after: newStock,
        reference_type: 'waste',
        reference_id: id,
        notes: `Waste (${newWaste.reason}): ${newWaste.notes || 'Bahan terbuang'}`,
        user_id: userRole.toUpperCase(),
        created_at: now,
      };
      await tx.objectStore('ledger').put(ldg);
    }

    await tx.done;
    await refreshAllData();
  };

  const recordManualAdjustment = async (
    ingredientId: string,
    adjustedQty: number,
    reason: string
  ) => {
    const db = await getDB();
    const ing = await db.get('ingredients', ingredientId);
    if (!ing) return;

    const now = new Date().toISOString();
    const newStock = ing.current_stock + adjustedQty;

    const tx = db.transaction(['ingredients', 'ledger'], 'readwrite');
    await tx.objectStore('ingredients').put({
      ...ing,
      current_stock: newStock,
      updated_at: now,
    });

    const ldg: InventoryLedger = {
      id: `LEDGER-ADJ-${Date.now()}`,
      ingredient_id: ing.id,
      type: 'ADJUSTMENT',
      quantity: adjustedQty,
      balance_after: newStock,
      reference_type: 'manual',
      reference_id: 'ADJ',
      notes: `Adjustment Manual: ${reason}`,
      user_id: userRole.toUpperCase(),
      created_at: now,
    };
    await tx.objectStore('ledger').put(ldg);
    await tx.done;
    await refreshAllData();
  };

  const recordStockOpname = async (
    type: 'spot_check' | 'full',
    items: {
      ingredient_id: string;
      system_stock: number;
      physical_stock: number;
    }[],
    notes?: string
  ) => {
    const id = `OPN-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const ingMap = new Map<string, Ingredient>();
    ingredients.forEach((ing) => ingMap.set(ing.id, ing));

    const opnameItems = items.map((it) => {
      const ing = ingMap.get(it.ingredient_id);
      const diff = it.physical_stock - it.system_stock;
      const unitCost = ing ? ing.cost_per_base_unit : 0;
      return {
        ingredient_id: it.ingredient_id,
        system_stock: it.system_stock,
        physical_stock: it.physical_stock,
        difference: diff,
        adjustment_cost: Math.abs(diff) * unitCost,
      };
    });

    const opnameRecord: StockOpname = {
      id,
      outlet_id: 'OUTLET-01',
      type,
      status: userRole === 'owner' ? 'approved' : 'draft', // Owner immediately approves, cashier creates draft
      items: opnameItems,
      notes,
      conducted_by: userRole.toUpperCase(),
      approved_by: userRole === 'owner' ? userRole.toUpperCase() : undefined,
      created_at: now,
    };

    const db = await getDB();
    const tx = db.transaction(['stock_opnames', 'ingredients', 'ledger'], 'readwrite');
    await tx.objectStore('stock_opnames').put(opnameRecord);

    // If owner executes opname, immediately adjust stock & write ledger!
    if (userRole === 'owner') {
      for (const item of opnameItems) {
        if (item.difference !== 0) {
          const ing = await tx.objectStore('ingredients').get(item.ingredient_id);
          if (ing) {
            await tx.objectStore('ingredients').put({
              ...ing,
              current_stock: item.physical_stock,
              updated_at: now,
            });

            await tx.objectStore('ledger').put({
              id: `LEDGER-OPN-${id}-${item.ingredient_id}`,
              ingredient_id: ing.id,
              type: 'STOCK_OPNAME',
              quantity: item.difference,
              balance_after: item.physical_stock,
              reference_type: 'opname',
              reference_id: id,
              notes: `Stock Opname (${type}): Selisih fisik ${item.difference > 0 ? '+' : ''}${item.difference} ${ing.base_unit}`,
              user_id: userRole.toUpperCase(),
              created_at: now,
            });
          }
        }
      }
    }

    await tx.done;
    await refreshAllData();
  };

  const approveStockOpname = async (opnameId: string) => {
    const db = await getDB();
    const opname = await db.get('stock_opnames', opnameId);
    if (!opname || opname.status === 'approved') return;

    const now = new Date().toISOString();
    const tx = db.transaction(['stock_opnames', 'ingredients', 'ledger'], 'readwrite');

    const updatedOpname: StockOpname = {
      ...opname,
      status: 'approved',
      approved_by: userRole.toUpperCase(),
    };
    await tx.objectStore('stock_opnames').put(updatedOpname);

    for (const item of opname.items) {
      if (item.difference !== 0) {
        const ing = await tx.objectStore('ingredients').get(item.ingredient_id);
        if (ing) {
          await tx.objectStore('ingredients').put({
            ...ing,
            current_stock: item.physical_stock,
            updated_at: now,
          });

          await tx.objectStore('ledger').put({
            id: `LEDGER-OPN-${opnameId}-${item.ingredient_id}`,
            ingredient_id: ing.id,
            type: 'STOCK_OPNAME',
            quantity: item.difference,
            balance_after: item.physical_stock,
            reference_type: 'opname',
            reference_id: opnameId,
            notes: `Stock Opname Approval: Fisik diset ke ${item.physical_stock} ${ing.base_unit} (selisih: ${item.difference})`,
            user_id: userRole.toUpperCase(),
            created_at: now,
          });
        }
      }
    }

    await tx.done;
    await refreshAllData();
  };

  const addSupplier = async (supplierInput: Omit<Supplier, 'id'>) => {
    const db = await getDB();
    const id = `SUP-${Date.now().toString().slice(-4)}`;
    await db.put('suppliers', { ...supplierInput, id });
    await refreshAllData();
  };

  return (
    <AppContext.Provider
      value={{
        ingredients,
        menus,
        recipes,
        suppliers,
        stockIns,
        wastes,
        stockOpnames,
        ledgers,
        sales,
        brandSetting,
        userRole,
        isOnline,
        activeTab,
        isSidebarCollapsed,
        setActiveTab,
        setUserRole,
        toggleSidebar,
        updateBrandSetting,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        saveMenuAndVariants,
        deleteMenu,
        saveRecipe,
        recordSalesTransaction,
        recordStockIn,
        recordWaste,
        recordManualAdjustment,
        recordStockOpname,
        approveStockOpname,
        addSupplier,
        refreshAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
