import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  MenuVariant,
  Recipe,
  RecipeIngredient,
  Ingredient,
} from '../../types';
import { formatRupiah } from '../../services/bomEngine';
import {
  Plus,
  BookOpen,
  DollarSign,
  TrendingUp,
  Trash2,
  Edit3,
  Layers,
  Check,
  Percent,
} from 'lucide-react';

export const RecipesView: React.FC = () => {
  const {
    menus,
    recipes,
    ingredients,
    saveMenuAndVariants,
    saveRecipe,
    deleteMenu,
    userRole,
  } = useApp();

  const [selectedMenu, setSelectedMenu] = useState<Menu>(menus[0] || null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    menus[0]?.variants[0]?.id || ''
  );
  const [isEditingRecipe, setIsEditingRecipe] = useState<boolean>(false);
  const [recipeDraft, setRecipeDraft] = useState<RecipeIngredient[]>([]);

  // Add Menu Modal states
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuCategory, setNewMenuCategory] = useState('Signature');
  const [newMenuImageUrl, setNewMenuImageUrl] = useState('');
  const [newVariants, setNewVariants] = useState<
    { name: string; price: number; isDefault: boolean }[]
  >([
    { name: 'Regular 16oz', price: 25000, isDefault: true },
    { name: 'Large 20oz', price: 32000, isDefault: false },
  ]);

  const ingMap = new Map<string, Ingredient>();
  ingredients.forEach((ing) => ingMap.set(ing.id, ing));

  // Find active recipe for selected variant
  const activeRecipe = recipes.find(
    (r) => r.variant_id === selectedVariantId && r.active
  );

  const selectedVariant = selectedMenu?.variants.find(
    (v) => v.id === selectedVariantId
  );

  // Calculate live HPP and margin
  const sellingPrice = selectedVariant?.selling_price || 0;
  const currentTotalHPP = activeRecipe?.total_cost || 0;
  const grossProfit = sellingPrice - currentTotalHPP;
  const grossMarginPercent = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0;

  const handleStartEditRecipe = () => {
    if (!activeRecipe) {
      setRecipeDraft([]);
    } else {
      setRecipeDraft([...activeRecipe.ingredients]);
    }
    setIsEditingRecipe(true);
  };

  const handleAddIngredientToDraft = (ingredientId: string) => {
    const ing = ingMap.get(ingredientId);
    if (!ing) return;

    // Check if already in draft
    if (recipeDraft.some((r) => r.ingredient_id === ingredientId)) {
      alert('Bahan ini sudah ada di dalam resep');
      return;
    }

    const defaultQty = ing.base_unit === 'pcs' ? 1 : ing.base_unit === 'gram' ? 15 : 100;
    setRecipeDraft([
      ...recipeDraft,
      {
        ingredient_id: ingredientId,
        quantity: defaultQty,
        unit: ing.base_unit,
        calculated_cost: defaultQty * ing.cost_per_base_unit,
      },
    ]);
  };

  const handleUpdateDraftQty = (ingId: string, qty: number) => {
    const ing = ingMap.get(ingId);
    const costPerBase = ing ? ing.cost_per_base_unit : 0;

    setRecipeDraft((prev) =>
      prev.map((item) =>
        item.ingredient_id === ingId
          ? {
              ...item,
              quantity: qty,
              calculated_cost: qty * costPerBase,
            }
          : item
      )
    );
  };

  const handleRemoveDraftItem = (ingId: string) => {
    setRecipeDraft((prev) => prev.filter((item) => item.ingredient_id !== ingId));
  };

  const handleSaveRecipe = async () => {
    if (!selectedMenu || !selectedVariant) return;

    // PRD Business Rule 4: Recipe harus memiliki minimal satu ingredient
    if (recipeDraft.length === 0) {
      alert('Resep harus memiliki minimal satu bahan baku (ingredient)!');
      return;
    }

    // PRD Business Rule 5: Quantity ingredient harus lebih besar dari 0
    const hasZeroOrNegativeQty = recipeDraft.some((item) => item.quantity <= 0);
    if (hasZeroOrNegativeQty) {
      alert('Kuantitas setiap bahan baku di dalam resep harus lebih besar dari 0!');
      return;
    }

    const totalCost = recipeDraft.reduce((sum, item) => sum + item.calculated_cost, 0);
    const recipeId = activeRecipe ? activeRecipe.id : `REC-${selectedVariant.id}`;
    const nextVersion = activeRecipe ? activeRecipe.version + 1 : 1;

    const newRecipe: Recipe = {
      id: recipeId,
      menu_id: selectedMenu.id,
      variant_id: selectedVariant.id,
      version: nextVersion,
      active: true,
      ingredients: recipeDraft,
      total_cost: totalCost,
      updated_at: new Date().toISOString(),
    };

    await saveRecipe(newRecipe);
    setIsEditingRecipe(false);
  };

  const handleSaveNewMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName || !newMenuImageUrl) {
      alert('Nama menu dan foto menu wajib diisi sesuai brand guidelines!');
      return;
    }

    const menuId = `MENU-${Date.now().toString().slice(-4)}`;
    const variants: MenuVariant[] = newVariants.map((v, idx) => ({
      id: `VAR-${menuId}-${idx + 1}`,
      menu_id: menuId,
      name: v.name,
      selling_price: v.price,
      is_default: v.isDefault,
    }));

    const newMenu: Menu = {
      id: menuId,
      outlet_id: 'OUTLET-01',
      name: newMenuName,
      category: newMenuCategory,
      image_url: newMenuImageUrl,
      variants,
      status: 'active',
    };

    await saveMenuAndVariants(newMenu);
    setIsAddMenuModalOpen(false);
    setSelectedMenu(newMenu);
    setSelectedVariantId(variants[0].id);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & New Menu CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-mira-dark tracking-tight">
            Master Menu & Resep (BOM)
          </h1>
          <p className="text-xs text-mira-muted mt-1">
            Tentukan komposisi bahan (Bill of Materials) per varian untuk otomatisasi pemotongan stok & kalkulasi HPP.
          </p>
        </div>
        {userRole !== 'cashier' && (
          <button
            onClick={() => setIsAddMenuModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-mira-caramel hover:bg-mira-caramel-hover text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Menu Baru</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Menu List (5 cols) */}
        <div className="lg:col-span-5 bg-mira-card border border-mira-border rounded-2xl p-4 shadow-tactile space-y-3">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-mira-muted px-1">
            Daftar Menu ({menus.length})
          </div>

          <div className="space-y-2 max-h-[calc(100vh-18rem)] overflow-y-auto pr-1">
            {menus.map((menu) => {
              const isSelected = selectedMenu?.id === menu.id;
              return (
                <div
                  key={menu.id}
                  onClick={() => {
                    setSelectedMenu(menu);
                    setSelectedVariantId(menu.variants[0]?.id || '');
                    setIsEditingRecipe(false);
                  }}
                  className={`p-3 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-mira-subtle/70 border-mira-dark shadow-sm'
                      : 'bg-mira-canvas border-mira-border hover:bg-mira-subtle/40'
                  }`}
                >
                  <img
                    src={menu.image_url}
                    alt={menu.name}
                    className="w-14 h-14 rounded-lg object-cover bg-mira-border shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display font-bold text-sm text-mira-dark truncate">
                        {menu.name}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-mira-muted border border-mira-border uppercase">
                        {menu.category}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-2 text-xs text-mira-muted font-mono">
                      <span>{menu.variants.length} Varian</span>
                      <span>•</span>
                      <span>{formatRupiah(menu.variants[0]?.selling_price || 0)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Recipe Detail & BOM Editor (7 cols) */}
        <div className="lg:col-span-7 bg-mira-card border border-mira-border rounded-2xl p-6 shadow-tactile flex flex-col justify-between space-y-6">
          {selectedMenu ? (
            <div className="space-y-5">
              {/* Menu Header with Photo & Variant Tabs */}
              <div className="flex items-start justify-between pb-4 border-b border-mira-border">
                <div className="flex items-center space-x-3.5">
                  <img
                    src={selectedMenu.image_url}
                    alt={selectedMenu.name}
                    className="w-16 h-16 rounded-xl object-cover bg-mira-subtle shadow-sm"
                  />
                  <div>
                    <h2 className="font-display font-bold text-lg text-mira-dark">
                      {selectedMenu.name}
                    </h2>
                    <span className="text-xs font-mono text-mira-muted uppercase">
                      Kategori: {selectedMenu.category}
                    </span>
                  </div>
                </div>

                {userRole !== 'cashier' && (
                  <button
                    onClick={() => {
                      if (confirm(`Hapus menu ${selectedMenu.name}?`)) {
                        deleteMenu(selectedMenu.id);
                        setSelectedMenu(menus[0] || null);
                      }
                    }}
                    className="p-2 text-mira-muted hover:text-mira-brick hover:bg-mira-brick-light rounded-lg transition-colors"
                    title="Hapus Menu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Variant Selector Tabs */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-mira-muted font-medium">
                  Pilih Varian Menu:
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedMenu.variants.map((v) => {
                    const isSelected = selectedVariantId === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVariantId(v.id);
                          setIsEditingRecipe(false);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center space-x-2 transition-all ${
                          isSelected
                            ? 'bg-mira-dark text-white border-mira-dark shadow-sm'
                            : 'bg-mira-canvas border-mira-border text-mira-dark hover:bg-mira-subtle'
                        }`}
                      >
                        <span>{v.name}</span>
                        <span className="font-mono font-semibold">
                          ({formatRupiah(v.selling_price)})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* HPP & Margin Stats Box */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-mira-subtle/50 border border-mira-border">
                <div>
                  <span className="text-[11px] text-mira-muted font-medium block">
                    Harga Jual
                  </span>
                  <span className="font-mono font-bold text-sm text-mira-dark">
                    {formatRupiah(sellingPrice)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-mira-muted font-medium block">
                    Estimasi HPP (BOM)
                  </span>
                  <span className="font-mono font-bold text-sm text-mira-caramel">
                    {formatRupiah(isEditingRecipe ? recipeDraft.reduce((s, i) => s + i.calculated_cost, 0) : currentTotalHPP)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-mira-muted font-medium block">
                    Gross Margin
                  </span>
                  <span className="font-mono font-bold text-sm text-mira-olive">
                    {grossMarginPercent.toFixed(1)}% ({formatRupiah(grossProfit)})
                  </span>
                </div>
              </div>

              {/* BOM Composition Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-sm text-mira-dark">
                      Komposisi Bahan Resep
                    </h3>
                    <p className="text-[11px] text-mira-muted font-mono">
                      {activeRecipe ? `Versi ${activeRecipe.version}` : 'Belum ada resep aktif'}
                    </p>
                  </div>

                  {!isEditingRecipe && userRole !== 'cashier' && (
                    <button
                      onClick={handleStartEditRecipe}
                      className="px-3 py-1.5 rounded-lg border border-mira-border bg-white text-xs font-semibold text-mira-dark hover:bg-mira-subtle flex items-center space-x-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-mira-caramel" />
                      <span>{activeRecipe ? 'Ubah Komposisi' : 'Buat Resep'}</span>
                    </button>
                  )}
                </div>

                {/* If Editing Mode */}
                {isEditingRecipe ? (
                  <div className="space-y-3 border border-mira-caramel/40 bg-mira-canvas rounded-xl p-3.5">
                    <div className="flex items-center justify-between pb-2 border-b border-mira-border">
                      <span className="text-xs font-bold text-mira-caramel">
                        Mode Edit Komposisi
                      </span>
                      {/* Dropdown to add ingredient */}
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddIngredientToDraft(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg border border-mira-border bg-white text-mira-dark focus:outline-none"
                      >
                        <option value="">+ Tambah Bahan ke Resep...</option>
                        {ingredients
                          .filter((ing) => !recipeDraft.some((r) => r.ingredient_id === ing.id))
                          .map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} ({ing.base_unit})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {recipeDraft.map((item) => {
                        const ing = ingMap.get(item.ingredient_id);
                        if (!ing) return null;
                        return (
                          <div
                            key={item.ingredient_id}
                            className="flex items-center justify-between p-2 rounded-lg bg-white border border-mira-border text-xs"
                          >
                            <span className="font-semibold text-mira-dark truncate max-w-[180px]">
                              {ing.name}
                            </span>
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                step="any"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateDraftQty(
                                    item.ingredient_id,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-20 px-2 py-1 border border-mira-border rounded font-mono text-right text-xs"
                              />
                              <span className="font-mono text-mira-muted w-10">
                                {item.unit}
                              </span>
                              <span className="font-mono text-mira-dark w-20 text-right font-medium">
                                {formatRupiah(item.calculated_cost)}
                              </span>
                              <button
                                onClick={() => handleRemoveDraftItem(item.ingredient_id)}
                                className="text-mira-muted hover:text-mira-brick p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end space-x-2 pt-2 border-t border-mira-border">
                      <button
                        onClick={() => setIsEditingRecipe(false)}
                        className="px-3 py-1.5 rounded-lg border border-mira-border text-xs text-mira-muted hover:bg-mira-subtle"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleSaveRecipe}
                        className="px-4 py-1.5 rounded-lg bg-mira-caramel hover:bg-mira-caramel-hover text-white text-xs font-bold"
                      >
                        Simpan Resep Baru
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Read-Only Recipe Table */
                  <div className="border border-mira-border rounded-xl overflow-hidden bg-mira-canvas">
                    {!activeRecipe || activeRecipe.ingredients.length === 0 ? (
                      <div className="p-6 text-center text-xs text-mira-muted">
                        Belum ada komposisi resep untuk varian ini.
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-mira-card border-b border-mira-border text-mira-muted font-mono font-medium">
                            <th className="py-2.5 px-3">Bahan</th>
                            <th className="py-2.5 px-3 text-right">Pemakaian</th>
                            <th className="py-2.5 px-3 text-right">Cost Satuan</th>
                            <th className="py-2.5 px-3 text-right">Biaya/Cup</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-mira-border">
                          {activeRecipe.ingredients.map((item) => {
                            const ing = ingMap.get(item.ingredient_id);
                            return (
                              <tr key={item.ingredient_id} className="hover:bg-white/50">
                                <td className="py-2 px-3 font-semibold text-mira-dark">
                                  {ing?.name || item.ingredient_id}
                                </td>
                                <td className="py-2 px-3 text-right font-mono text-mira-dark">
                                  {item.quantity.toLocaleString('id-ID')} {item.unit}
                                </td>
                                <td className="py-2 px-3 text-right font-mono text-mira-muted">
                                  {formatRupiah(ing?.cost_per_base_unit || 0)}
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-mira-dark">
                                  {formatRupiah(item.calculated_cost)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-mira-card-muted/70 font-bold border-t border-mira-border">
                            <td className="py-2.5 px-3 text-mira-dark font-display" colSpan={3}>
                              Total Estimasi HPP per Cup:
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-mira-caramel">
                              {formatRupiah(activeRecipe.total_cost)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-mira-muted text-xs">
              Pilih menu di sebelah kiri untuk melihat resep.
            </div>
          )}
        </div>
      </div>

      {/* ADD MENU MODAL */}
      {isAddMenuModalOpen && (
        <div className="fixed inset-0 z-50 bg-mira-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-mira-card border border-mira-border rounded-2xl max-w-lg w-full p-6 shadow-elevated">
            <h3 className="font-display font-bold text-base text-mira-dark pb-3 border-b border-mira-border">
              Tambah Menu Baru
            </h3>

            <form onSubmit={handleSaveNewMenu} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-mira-muted font-medium mb-1">
                  Nama Menu *
                </label>
                <input
                  type="text"
                  required
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  placeholder="Contoh: Caramel Macchiato"
                  className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border focus:outline-none focus:border-mira-caramel"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-mira-muted font-medium mb-1">
                    Kategori
                  </label>
                  <select
                    value={newMenuCategory}
                    onChange={(e) => setNewMenuCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border focus:outline-none focus:border-mira-caramel"
                  >
                    <option value="Signature">Signature</option>
                    <option value="Espresso Based">Espresso Based</option>
                    <option value="Non-Coffee">Non-Coffee</option>
                    <option value="Pastry & Bakery">Pastry & Bakery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-mira-muted font-medium mb-1">
                    URL Foto Produk (Wajib) *
                  </label>
                  <input
                    type="url"
                    required
                    value={newMenuImageUrl}
                    onChange={(e) => setNewMenuImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border focus:outline-none focus:border-mira-caramel"
                  />
                </div>
              </div>

              {/* Variants Section */}
              <div className="space-y-2 pt-2 border-t border-mira-border">
                <label className="font-semibold text-mira-dark block">
                  Varian & Harga Jual
                </label>
                {newVariants.map((v, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => {
                        const updated = [...newVariants];
                        updated[idx].name = e.target.value;
                        setNewVariants(updated);
                      }}
                      placeholder="Nama Varian (cth: Regular 16oz)"
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-mira-border bg-mira-canvas"
                    />
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) => {
                        const updated = [...newVariants];
                        updated[idx].price = parseFloat(e.target.value) || 0;
                        setNewVariants(updated);
                      }}
                      placeholder="Harga Jual"
                      className="w-32 px-2.5 py-1.5 rounded-lg border border-mira-border font-mono bg-mira-canvas"
                    />
                    {newVariants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setNewVariants(newVariants.filter((_, i) => i !== idx))}
                        className="text-mira-muted hover:text-mira-brick p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setNewVariants([
                      ...newVariants,
                      { name: 'Ukuran Baru', price: 20000, isDefault: false },
                    ])
                  }
                  className="text-xs text-mira-caramel hover:underline font-medium"
                >
                  + Tambah Varian Lain
                </button>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-mira-border">
                <button
                  type="button"
                  onClick={() => setIsAddMenuModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-mira-border text-mira-muted hover:bg-mira-subtle font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-mira-caramel hover:bg-mira-caramel-hover text-white font-bold"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
