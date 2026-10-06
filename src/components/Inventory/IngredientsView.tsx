import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Ingredient,
  BaseUnit,
  PurchaseUnit,
} from '../../types';
import {
  formatRupiah,
  formatUnitDisplay,
  convertToBaseUnit,
} from '../../services/bomEngine';
import {
  Plus,
  SlidersHorizontal,
  Edit2,
  Trash2,
  AlertTriangle,
  Scale,
  Search,
} from 'lucide-react';

export const IngredientsView: React.FC = () => {
  const {
    ingredients,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    recordManualAdjustment,
    userRole,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [adjustingIngredient, setAdjustingIngredient] = useState<Ingredient | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Ingredient['category']>('Coffee');
  const [baseUnit, setBaseUnit] = useState<BaseUnit>('gram');
  const [currentStock, setCurrentStock] = useState('0');
  const [minimumStock, setMinimumStock] = useState('0');
  const [purchaseUnit, setPurchaseUnit] = useState<PurchaseUnit>('kg');
  const [purchaseCost, setPurchaseCost] = useState('0');

  const categories = ['all', 'Coffee', 'Dairy', 'Sweetener', 'Packaging', 'Powder', 'Ice', 'Other'];

  const filtered = ingredients.filter((ing) => {
    const matchCat = selectedCategory === 'all' || ing.category === selectedCategory;
    const matchSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const resetForm = () => {
    setName('');
    setCategory('Coffee');
    setBaseUnit('gram');
    setCurrentStock('0');
    setMinimumStock('0');
    setPurchaseUnit('kg');
    setPurchaseCost('0');
    setEditingIngredient(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (ing: Ingredient) => {
    setEditingIngredient(ing);
    setName(ing.name);
    setCategory(ing.category);
    setBaseUnit(ing.base_unit);
    setCurrentStock(ing.current_stock.toString());
    setMinimumStock(ing.minimum_stock.toString());
    setPurchaseUnit(ing.purchase_unit);
    setPurchaseCost(ing.purchase_cost.toString());
    setIsAddModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const curStock = parseFloat(currentStock) || 0;
    const minStock = parseFloat(minimumStock) || 0;
    const pCost = parseFloat(purchaseCost) || 0;

    // Calculate cost per base unit
    let costPerBase = pCost;
    if (purchaseUnit === 'kg' && baseUnit === 'gram') {
      costPerBase = pCost / 1000;
    } else if (purchaseUnit === 'liter' && baseUnit === 'ml') {
      costPerBase = pCost / 1000;
    }

    if (editingIngredient) {
      await updateIngredient(editingIngredient.id, {
        name,
        category,
        base_unit: baseUnit,
        current_stock: curStock,
        minimum_stock: minStock,
        purchase_unit: purchaseUnit,
        purchase_cost: pCost,
        cost_per_base_unit: costPerBase,
      });
    } else {
      await addIngredient({
        outlet_id: 'OUTLET-01',
        name,
        category,
        base_unit: baseUnit,
        current_stock: curStock,
        minimum_stock: minStock,
        purchase_unit: purchaseUnit,
        purchase_cost: pCost,
        cost_per_base_unit: costPerBase,
        status: 'active',
      });
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingIngredient) return;
    const qty = parseFloat(adjustmentQty) || 0;
    if (qty === 0) return;

    await recordManualAdjustment(
      adjustingIngredient.id,
      qty,
      adjustmentReason || 'Penyesuaian manual'
    );
    setAdjustingIngredient(null);
    setAdjustmentQty('');
    setAdjustmentReason('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-mira-dark tracking-tight">
            Master Bahan Baku
          </h1>
          <p className="text-xs text-mira-muted mt-1">
            Kelola data bahan dasar, satuan konversi, harga beli, dan batas stok minimum.
          </p>
        </div>
        {userRole !== 'cashier' && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-mira-caramel hover:bg-mira-caramel-hover text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Bahan Baku</span>
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-mira-card border border-mira-border rounded-2xl p-4 shadow-tactile flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-mira-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari bahan baku..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-mira-canvas border border-mira-border focus:outline-none focus:border-mira-caramel text-mira-dark"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-mira-dark text-white font-semibold'
                  : 'bg-mira-canvas text-mira-muted hover:text-mira-dark border border-mira-border'
              }`}
            >
              {cat === 'all' ? 'Semua' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-mira-card border border-mira-border rounded-2xl shadow-tactile overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-mira-card-muted/60 border-b border-mira-border text-mira-muted font-mono font-medium">
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Nama Bahan</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Stok Aktual</th>
                <th className="py-3 px-4 text-right">Min. Stok</th>
                <th className="py-3 px-4 text-right">Harga Beli</th>
                <th className="py-3 px-4 text-right">Cost/Satuan</th>
                <th className="py-3 px-4 text-center">Status</th>
                {userRole !== 'cashier' && (
                  <th className="py-3 px-4 text-center">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-mira-border">
              {filtered.map((ing) => {
                const isLow = ing.current_stock <= ing.minimum_stock;
                return (
                  <tr key={ing.id} className="hover:bg-mira-canvas/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-mira-muted font-semibold">
                      {ing.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-mira-dark">
                      {ing.name}
                    </td>
                    <td className="py-3.5 px-4 text-mira-muted">
                      <span className="px-2 py-0.5 rounded bg-mira-subtle text-[11px] font-medium border border-mira-border">
                        {ing.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      <span className={isLow ? 'text-mira-brick' : 'text-mira-dark'}>
                        {formatUnitDisplay(ing.current_stock, ing.base_unit)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-mira-muted">
                      {formatUnitDisplay(ing.minimum_stock, ing.base_unit)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-mira-dark">
                      {formatRupiah(ing.purchase_cost)} / {ing.purchase_unit}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-mira-muted">
                      {formatRupiah(ing.cost_per_base_unit)} / {ing.base_unit}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                          isLow
                            ? 'bg-mira-brick-light text-mira-brick border border-mira-brick/30'
                            : 'bg-mira-olive-light text-mira-olive border border-mira-olive/30'
                        }`}
                      >
                        {isLow ? 'Kritis' : 'Normal'}
                      </span>
                    </td>
                    {userRole !== 'cashier' && (
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => setAdjustingIngredient(ing)}
                            className="p-1.5 rounded-lg text-mira-muted hover:text-mira-caramel hover:bg-mira-subtle"
                            title="Penyesuaian Stok Manual"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(ing)}
                            className="p-1.5 rounded-lg text-mira-muted hover:text-mira-dark hover:bg-mira-subtle"
                            title="Edit Bahan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Yakin hapus bahan ${ing.name}?`)) {
                                deleteIngredient(ing.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-mira-muted hover:text-mira-brick hover:bg-mira-brick-light"
                            title="Hapus Bahan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-mira-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-mira-card border border-mira-border rounded-2xl max-w-lg w-full p-6 shadow-elevated">
            <h3 className="font-display font-bold text-base text-mira-dark pb-3 border-b border-mira-border">
              {editingIngredient ? 'Edit Bahan Baku' : 'Tambah Bahan Baku Baru'}
            </h3>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-mira-muted font-medium mb-1">
                  Nama Bahan Baku *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Biji Kopi House Blend"
                  className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border focus:outline-none focus:border-mira-caramel"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-mira-muted font-medium mb-1">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border focus:outline-none focus:border-mira-caramel"
                  >
                    {categories.filter((c) => c !== 'all').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-mira-muted font-medium mb-1">
                    Satuan Dasar (Base Unit) *
                  </label>
                  <select
                    value={baseUnit}
                    onChange={(e) => setBaseUnit(e.target.value as BaseUnit)}
                    className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border focus:outline-none focus:border-mira-caramel font-mono"
                  >
                    <option value="gram">gram (gr) — untuk berat</option>
                    <option value="ml">ml — untuk cairan</option>
                    <option value="pcs">pcs — untuk cup & kemasan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-mira-muted font-medium mb-1">
                    Stok Saat Ini (dalam {baseUnit})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border font-mono focus:outline-none focus:border-mira-caramel"
                  />
                </div>

                <div>
                  <label className="block text-mira-muted font-medium mb-1">
                    Batas Minimum Stok (dalam {baseUnit})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={minimumStock}
                    onChange={(e) => setMinimumStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border font-mono focus:outline-none focus:border-mira-caramel"
                  />
                </div>
              </div>

              <div className="p-3 bg-mira-subtle/50 rounded-xl border border-mira-border space-y-2">
                <span className="font-semibold text-mira-dark block">
                  Informasi Pembelian Supplier
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-mira-muted font-medium mb-1">
                      Satuan Pembelian
                    </label>
                    <select
                      value={purchaseUnit}
                      onChange={(e) => setPurchaseUnit(e.target.value as PurchaseUnit)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-mira-border font-mono focus:outline-none"
                    >
                      <option value="kg">kilogram (kg)</option>
                      <option value="gram">gram (gr)</option>
                      <option value="liter">liter (ltr)</option>
                      <option value="ml">mililiter (ml)</option>
                      <option value="pcs">pcs</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-mira-muted font-medium mb-1">
                      Harga Beli per {purchaseUnit}
                    </label>
                    <input
                      type="number"
                      value={purchaseCost}
                      onChange={(e) => setPurchaseCost(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-mira-border font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-mira-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-mira-border text-mira-muted hover:bg-mira-subtle font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-mira-caramel hover:bg-mira-caramel-hover text-white font-bold"
                >
                  Simpan Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL ADJUSTMENT MODAL */}
      {adjustingIngredient && (
        <div className="fixed inset-0 z-50 bg-mira-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-mira-card border border-mira-border rounded-2xl max-w-md w-full p-6 shadow-elevated">
            <h3 className="font-display font-bold text-base text-mira-dark pb-2 border-b border-mira-border">
              Penyesuaian Manual: {adjustingIngredient.name}
            </h3>

            <form onSubmit={handleSaveAdjustment} className="mt-4 space-y-3.5 text-xs">
              <p className="text-mira-muted">
                Stok saat ini:{' '}
                <span className="font-mono font-bold text-mira-dark">
                  {formatUnitDisplay(
                    adjustingIngredient.current_stock,
                    adjustingIngredient.base_unit
                  )}
                </span>
              </p>

              <div>
                <label className="block text-mira-muted font-medium mb-1">
                  Jumlah Perubahan (contoh: +500 atau -200 {adjustingIngredient.base_unit}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(e.target.value)}
                  placeholder="Gunakan tanda minus (-) jika berkurang"
                  className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border font-mono font-bold focus:outline-none focus:border-mira-caramel"
                />
              </div>

              <div>
                <label className="block text-mira-muted font-medium mb-1">
                  Alasan Penyesuaian (Wajib tercatat di Ledger) *
                </label>
                <input
                  type="text"
                  required
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Contoh: Koreksi salah hitung kemarin"
                  className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border focus:outline-none focus:border-mira-caramel"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-mira-border">
                <button
                  type="button"
                  onClick={() => setAdjustingIngredient(null)}
                  className="px-4 py-2 rounded-xl border border-mira-border text-mira-muted hover:bg-mira-subtle font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-mira-dark text-white font-bold hover:bg-black"
                >
                  Simpan Koreksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
