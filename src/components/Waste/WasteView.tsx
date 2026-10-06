import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WasteReason, Ingredient } from '../../types';
import { formatRupiah, formatUnitDisplay } from '../../services/bomEngine';
import {
  Trash2,
  Plus,
  AlertOctagon,
  Calendar,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export const WasteView: React.FC = () => {
  const {
    ingredients,
    wastes,
    recordWaste,
    userRole,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ingredientId, setIngredientId] = useState(ingredients[0]?.id || '');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState<WasteReason>('Spillage');
  const [notes, setNotes] = useState('');

  const ingMap = new Map<string, Ingredient>();
  ingredients.forEach((ing) => ingMap.set(ing.id, ing));

  const selectedIng = ingMap.get(ingredientId);
  const numQty = parseFloat(quantity) || 0;
  const estimatedWasteCost = selectedIng ? numQty * selectedIng.cost_per_base_unit : 0;

  const totalWasteAllCost = wastes.reduce((sum, w) => sum + w.cost, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIng || numQty <= 0) {
      alert('Masukkan kuantitas waste yang valid.');
      return;
    }

    await recordWaste({
      outlet_id: 'OUTLET-01',
      ingredient_id: ingredientId,
      quantity: numQty,
      cost: estimatedWasteCost,
      reason,
      notes,
      user_id: userRole.toUpperCase(),
    });

    setIsModalOpen(false);
    setQuantity('');
    setNotes('');
  };

  const wasteReasons: { value: WasteReason; label: string }[] = [
    { value: 'Spillage', label: 'Tumpah saat pembuatan' },
    { value: 'Expired', label: 'Kedaluwarsa / Basi' },
    { value: 'Barista Error', label: 'Kesalahan Barista (Salah Resep)' },
    { value: 'Calibration', label: 'Kalibrasi Grinder / Mesin Kopi' },
    { value: 'Trial', label: 'Trial / Eksperimen Menu' },
    { value: 'Damaged', label: 'Kemasan / Barang Rusak' },
    { value: 'Other', label: 'Lainnya' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-mira-dark tracking-tight">
            Pencatatan Waste & Bahan Terbuang
          </h1>
          <p className="text-xs text-mira-muted mt-1">
            Pantau dan catat bahan yang rusak, tumpah, atau dipakai untuk kalibrasi grinder agar stok sistem tetap akurat.
          </p>
        </div>
        <button
          onClick={() => {
            if (ingredients.length > 0) setIngredientId(ingredients[0].id);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-mira-brick hover:bg-mira-brick/90 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Catat Bahan Terbuang</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-mira-card border border-mira-border shadow-tactile flex items-center justify-between">
          <div>
            <span className="text-xs text-mira-muted font-medium uppercase tracking-wider block">
              Total Kerugian Waste
            </span>
            <span className="font-display font-extrabold text-xl text-mira-brick">
              {formatRupiah(totalWasteAllCost)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-mira-brick-light text-mira-brick">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-mira-card border border-mira-border shadow-tactile flex items-center justify-between">
          <div>
            <span className="text-xs text-mira-muted font-medium uppercase tracking-wider block">
              Jumlah Kejadian
            </span>
            <span className="font-display font-extrabold text-xl text-mira-dark">
              {wastes.length}{' '}
              <span className="text-sm font-sans font-normal text-mira-muted">
                kali tercatat
              </span>
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-mira-subtle text-mira-muted">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-mira-card border border-mira-border shadow-tactile flex items-center justify-between">
          <div>
            <span className="text-xs text-mira-muted font-medium uppercase tracking-wider block">
              Alasan Terbanyak
            </span>
            <span className="font-display font-bold text-sm text-mira-dark">
              Kalibrasi & Spillage
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-mira-amber-light text-mira-amber">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Waste Records Table */}
      <div className="bg-mira-card border border-mira-border rounded-2xl shadow-tactile overflow-hidden">
        <div className="p-4 border-b border-mira-border flex items-center justify-between">
          <h2 className="font-display font-bold text-sm text-mira-dark">
            Log Riwayat Waste ({wastes.length})
          </h2>
        </div>

        {wastes.length === 0 ? (
          <div className="p-8 text-center text-xs text-mira-muted">
            Belum ada catatan waste bahan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-mira-card-muted/60 border-b border-mira-border text-mira-muted font-mono font-medium">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Bahan Terbuang</th>
                  <th className="py-3 px-4">Alasan</th>
                  <th className="py-3 px-4 text-right">Kuantitas</th>
                  <th className="py-3 px-4 text-right">Estimasi Biaya</th>
                  <th className="py-3 px-4">Catatan</th>
                  <th className="py-3 px-4 text-center">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mira-border">
                {wastes.map((item) => {
                  const ing = ingMap.get(item.ingredient_id);
                  return (
                    <tr key={item.id} className="hover:bg-mira-canvas/50">
                      <td className="py-3 px-4 font-mono text-mira-muted">
                        {new Date(item.created_at).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-mira-dark">
                        {ing?.name || item.ingredient_id}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-mira-brick-light text-mira-brick border border-mira-brick/20">
                          {item.reason}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-mira-brick">
                        −{item.quantity.toLocaleString('id-ID')} {ing?.base_unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-mira-dark">
                        {formatRupiah(item.cost)}
                      </td>
                      <td className="py-3 px-4 text-mira-muted text-[11px] max-w-xs truncate">
                        {item.notes || '—'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[11px] text-mira-muted">
                        {item.user_id}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL INPUT WASTE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-mira-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-mira-card border border-mira-border rounded-2xl max-w-md w-full p-6 shadow-elevated">
            <h3 className="font-display font-bold text-base text-mira-dark pb-3 border-b border-mira-border flex items-center space-x-2">
              <Trash2 className="w-5 h-5 text-mira-brick" />
              <span>Pencatatan Bahan Terbuang (Waste)</span>
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-mira-muted font-medium mb-1">
                  Pilih Bahan Baku *
                </label>
                <select
                  value={ingredientId}
                  onChange={(e) => setIngredientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border focus:outline-none"
                >
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} (Stok: {ing.current_stock} {ing.base_unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-mira-muted font-medium mb-1">
                  Jumlah Terbuang (dalam {selectedIng?.base_unit}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={`Contoh: 50 ${selectedIng?.base_unit}`}
                  className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border font-mono font-bold focus:outline-none focus:border-mira-brick"
                />
              </div>

              <div>
                <label className="block text-mira-muted font-medium mb-1">
                  Alasan Waste *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as WasteReason)}
                  className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border focus:outline-none"
                >
                  {wasteReasons.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-mira-muted font-medium mb-1">
                  Keterangan / Kronologi
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Grinder terlalu kasar saat dial-in pagi"
                  className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border"
                />
              </div>

              {/* Cost estimate notice */}
              <div className="p-3 rounded-xl bg-mira-subtle/70 border border-mira-border flex justify-between items-center">
                <span className="text-mira-muted">Estimasi Biaya Waste:</span>
                <span className="font-mono font-bold text-sm text-mira-brick">
                  {formatRupiah(estimatedWasteCost)}
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-mira-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-mira-border text-mira-muted hover:bg-mira-subtle font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-mira-brick hover:bg-mira-brick/90 text-white font-bold"
                >
                  Simpan Waste & Potong Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
