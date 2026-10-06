import {
  BaseUnit,
  PurchaseUnit,
  Ingredient,
  Recipe,
  OrderItem,
  IngredientDeductionPreview,
  InventoryLedger,
  SalesTransaction,
} from '../types';

export function convertToBaseUnit(
  quantity: number,
  fromUnit: PurchaseUnit,
  targetBaseUnit: BaseUnit
): number {
  if (fromUnit === 'kg' && targetBaseUnit === 'gram') {
    return quantity * 1000;
  }
  if (fromUnit === 'liter' && targetBaseUnit === 'ml') {
    return quantity * 1000;
  }
  return quantity;
}

export function formatUnitDisplay(amount: number, unit: BaseUnit): string {
  if (unit === 'gram' && amount >= 1000) {
    const inKg = (amount / 1000).toLocaleString('id-ID', { maximumFractionDigits: 2 });
    return `${inKg} kg (${amount.toLocaleString('id-ID')} gr)`;
  }
  if (unit === 'ml' && amount >= 1000) {
    const inLiter = (amount / 1000).toLocaleString('id-ID', { maximumFractionDigits: 2 });
    return `${inLiter} liter (${amount.toLocaleString('id-ID')} ml)`;
  }
  return `${amount.toLocaleString('id-ID')} ${unit}`;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateOrderBOMPreview(
  orderItems: OrderItem[],
  recipes: Recipe[],
  ingredients: Ingredient[]
): IngredientDeductionPreview[] {
  const ingMap = new Map<string, Ingredient>();
  ingredients.forEach((ing) => ingMap.set(ing.id, ing));

  // Variant ID to active Recipe
  const recipeMap = new Map<string, Recipe>();
  recipes.forEach((r) => {
    if (r.active) {
      recipeMap.set(r.variant_id, r);
    }
  });

  const totals = new Map<string, number>();

  orderItems.forEach((item) => {
    const recipe = recipeMap.get(item.variant_id);
    if (!recipe) return;

    recipe.ingredients.forEach((recIng) => {
      const current = totals.get(recIng.ingredient_id) || 0;
      totals.set(
        recIng.ingredient_id,
        current + recIng.quantity * item.quantity
      );
    });
  });

  const previews: IngredientDeductionPreview[] = [];

  totals.forEach((requiredQty, ingId) => {
    const ingredient = ingMap.get(ingId);
    if (!ingredient) return;

    const remaining = ingredient.current_stock - requiredQty;
    previews.push({
      ingredient_id: ingId,
      ingredient_name: ingredient.name,
      required_quantity: requiredQty,
      base_unit: ingredient.base_unit,
      current_stock: ingredient.current_stock,
      remaining_stock: remaining,
      is_insufficient: remaining < 0,
    });
  });

  return previews;
}

export function generateLedgerFromSales(
  transaction: SalesTransaction,
  orderItems: OrderItem[],
  recipes: Recipe[],
  ingredients: Ingredient[],
  userId: string
): {
  updatedIngredients: Ingredient[];
  newLedgers: InventoryLedger[];
} {
  const previews = calculateOrderBOMPreview(orderItems, recipes, ingredients);
  const deductionMap = new Map<string, number>();
  previews.forEach((p) => deductionMap.set(p.ingredient_id, p.required_quantity));

  const updatedIngredients: Ingredient[] = [];
  const newLedgers: InventoryLedger[] = [];
  const now = new Date().toISOString();

  ingredients.forEach((ing) => {
    const deduction = deductionMap.get(ing.id);
    if (deduction && deduction > 0) {
      const newStock = ing.current_stock - deduction;
      updatedIngredients.push({
        ...ing,
        current_stock: newStock,
        updated_at: now,
      });

      // Construct detailed notes: e.g. "Penjualan: Es Kopi Susu Regular x 2"
      const itemSummaries = orderItems
        .map((i) => `${i.menu_name} (${i.variant_name}) × ${i.quantity}`)
        .join(', ');

      newLedgers.push({
        id: `LEDGER-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ingredient_id: ing.id,
        type: 'MENU_USAGE',
        quantity: -deduction,
        balance_after: newStock,
        reference_type: 'menu_out',
        reference_id: transaction.id,
        notes: `Penjualan ${transaction.id}: ${itemSummaries}`,
        user_id: userId,
        created_at: now,
      });
    } else {
      updatedIngredients.push(ing);
    }
  });

  return { updatedIngredients, newLedgers };
}
