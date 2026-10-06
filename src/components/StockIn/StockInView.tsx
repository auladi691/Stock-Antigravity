import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  StockInItem,
  PurchaseUnit,
  Ingredient,
} from '../../types';
import {
  formatRupiah,
  convertToBaseUnit,
  formatUnitDisplay,
} from '../../services/bomEngine';
import {
  ArrowDownToLine,
  Plus,
  Trash2,
  Calendar,
  Building2,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export const StockInView: React.FC = () => {
  const {
    ingredients,
    suppliers,
    stockIns,
    recordStockIn,
    userRole,
  } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<
    {
      ingredient_id: string;
      quantity: number;
      input_unit: PurchaseUnit;
      purchase_cost: number;
    }[]
  >([]);

  const ingMap = new Map<string, Ingredient>();
  ingredients.forEach((ing) => ingMap.set(ing.id, ing));

  const handleAddItem = () => {
    const firstIng = ingredients[0];
    if (!firstIng) return;
    setItems([
      ...items,
      {
        ingredient_id: firstIng.id,
        quantity: 1,
        input_unit: firstIng.purchase_unit,
        purchase_cost: firstIng.purchase_cost,
      },
    ]);
  };

  const handleUpdateItem = (
    index: number,
    field: 'ingredient_id' | 'quantity' | 'input_unit' | 'purchase_cost',
    val: any
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      if (field === 'ingredient_id') {
        const ing = ingMap.get(val);
        updated[index] = {
          ...updated[index],
          ingredient_id: val,
          input_unit: ing ? ing.purchase_unit : 'kg',
          purchase_cost: ing ? ing.purchase_cost : 0,
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: val,
        };
      }
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Pilih minimal 1 bahan yang masuk.');
      return;
    }

    const convertedItems: StockInItem[] = items.map((it) => {
      const ing = ingMap.get(it.ingredient_id)!;
      const convertedQty = convertToBaseUnit(it.quantity, it.input_unit, ing.base_unit);
      return {
        ingredient_id: it.ingredient_id,
        quantity: it.quantity,
        input_unit: it.input_unit,
        converted_quantity: convertedQty,
        purchase_cost: it.purchase_cost,
      };
    });

    const totalAmount = items.reduce((sum, it) => sum + it.purchase_cost, 0);

    await recordStockIn({
      outlet_id: 'OUTLET-01',
      supplier_id: supplierId,
      invoice_no: invoiceNo || `INV-${Date.now().toString().slice(-4)}`,
      date,
      items: convertedItems,
      total_amount: totalAmount,
      notes,
      created_by: userRole.toUpperCase(),
    });

    setIsFormOpen(false);
    setInvoiceNo('');
    setNotes('');
    setItems([]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Record CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-mira-dark tracking-tight">
            Penerimaan Barang Masuk (Stock In)
          </h1>
          <p className="text-xs text-mira-muted mt-1">
            Catat penerimaan bahan dari supplier. Sistem otomatis mengkonversi satuan (misal 5 kg → 5.000 gram) dan menambah stok.
          </p>
        </div>
        <button
          onClick={() => {
            handleAddItem();
            setIsFormOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-mira-caramel hover:bg-mira-caramel-hover text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Input Penerimaan Baru</span>
        </button>
      </div>

      {/* FORM INPUT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-mira-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-mira-card border border-mira-border rounded-2xl max-w-2xl w-full p-6 shadow-elevated max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-bold text-base text-mira-dark pb-3 border-b border-mira-border flex items-center space-x-2">
              <ArrowDownToLine className="w-5 h-5 text-mira-caramel" />
              <span>Formulir Penerimaan Barang Masuk</span>
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-mira-muted font-medium mb-1">
                    Supplier
                  </label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-mira-muted font-medium mb-1">
                    No. Invoice / Surat Jalan
                  </label>
                  <input
                    type="text"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    placeholder="Contoh: INV-2026-0042"
                    className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border"
                  />
                </div>

                <div>
                  <label className="block text-mira-muted font-medium mb-1">
                    Tanggal Penerimaan
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border font-mono"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2 pt-2 border-t border-mira-border">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-mira-dark">
                    Daftar Bahan yang Diterima
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-mira-caramel hover:underline font-semibold"
                  >
                    + Tambah Baris
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => {
                    const ing = ingMap.get(item.ingredient_id);
                    const converted = ing
                      ? convertToBaseUnit(item.quantity, item.input_unit, ing.base_unit)
                      : 0;

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-mira-canvas border border-mira-border grid grid-cols-12 gap-2 items-center"
                      >
                        <div className="col-span-5">
                          <select
                            value={item.ingredient_id}
                            onChange={(e) =>
                              handleUpdateItem(idx, 'ingredient_id', e.target.value)
                            }
                            className="w-full px-2 py-1.5 rounded-lg border border-mira-border bg-white"
                          >
                            {ingredients.map((ing) => (
                              <option key={ing.id} value={ing.id}>
                                {ing.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-2">
                          <input
                            type="number"
                            step="any"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItem(
                                idx,
                                'quantity',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-2 py-1.5 rounded-lg border border-mira-border font-mono text-right bg-white"
                            placeholder="Qty"
                          />
                        </div>

                        <div className="col-span-2">
                          <select
                            value={item.input_unit}
                            onChange={(e) =>
                              handleUpdateItem(idx, 'input_unit', e.target.value)
                            }
                            className="w-full px-2 py-1.5 rounded-lg border border-mira-border font-mono bg-white"
                          >
                            <option value="kg">kg</option>
                            <option value="gram">gram</option>
                            <option value="liter">liter</option>
                            <option value="ml">ml</option>
                            <option value="pcs">pcs</option>
                          </select>
                        </div>

                        <div className="col-span-2 text-right">
                          <span className="font-mono text-mira-olive font-bold text-[11px] block">
                            +{converted.toLocaleString('id-ID')} {ing?.base_unit}
                          </span>
                        </div>

                        <div className="col-span-1 text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-mira-muted hover:text-mira-brick p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-mira-muted font-medium mb-1">
                  Catatan Tambahan
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Kondisi kemasan rapi, lolos QC barista"
                  className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-mira-border">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-mira-border text-mira-muted hover:bg-mira-subtle font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-mira-caramel hover:bg-mira-caramel-hover text-white font-bold"
                >
                  Konfirmasi Penerimaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History of Stock In */}
      <div className="bg-mira-card border border-mira-border rounded-2xl p-5 shadow-tactile space-y-4">
        <h2 className="font-display font-bold text-base text-mira-dark">
          Riwayat Penerimaan Bahan Masuk ({stockIns.length})
        </h2>

        {stockIns.length === 0 ? (
          <div className="p-8 text-center bg-mira-canvas rounded-xl text-xs text-mira-muted">
            Belum ada catatan barang masuk.
          </div>
        ) : (
          <div className="space-y-3">
            {stockIns.map((item) => {
              const supplier = suppliers.find((s) => s.id === item.supplier_id);
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-mira-canvas border border-mira-border space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-mira-dark">
                        #{item.invoice_no}
                      </span>
                      <span className="text-mira-muted">•</span>
                      <span className="font-semibold text-mira-caramel">
                        {supplier?.name || 'Supplier Umum'}
                      </span>
                    </div>
                    <span className="font-mono text-mira-muted text-[11px]">
                      {new Date(item.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-mira-border/50">
                    {item.items.map((sub, i) => {
                      const ing = ingMap.get(sub.ingredient_id);
                      return (
                        <div
                          key={i}
                          className="p-2 rounded bg-white border border-mira-border/70 text-xs flex justify-between"
                        >
                          <span className="text-mira-dark font-medium truncate max-w-[150px]">
                            {ing?.name}
                          </span>
                          <span className="font-mono font-bold text-mira-olive">
                            +{sub.converted_quantity.toLocaleString('id-ID')} {ing?.base_unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
