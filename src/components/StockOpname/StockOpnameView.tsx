import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Ingredient, StockOpname } from '../../types';
import { formatRupiah, formatUnitDisplay } from '../../services/bomEngine';
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Plus,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const StockOpnameView: React.FC = () => {
  const {
    ingredients,
    stockOpnames,
    recordStockOpname,
    approveStockOpname,
    userRole,
  } = useApp();

  const [opnameMode, setOpnameMode] = useState<'spot_check' | 'full'>('full');
  const [isOpnameSessionOpen, setIsOpnameSessionOpen] = useState(false);
  const [physicalCounts, setPhysicalCounts] = useState<Record<string, string>>({});
  const [selectedSpotIngs, setSelectedSpotIngs] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const ingMap = new Map<string, Ingredient>();
  ingredients.forEach((ing) => ingMap.set(ing.id, ing));

  // Determine which ingredients to count
  const targetIngredients =
    opnameMode === 'full'
      ? ingredients.filter((ing) => ing.status === 'active')
      : ingredients.filter((ing) => selectedSpotIngs.includes(ing.id));

  const handleStartSession = (mode: 'spot_check' | 'full') => {
    setOpnameMode(mode);
    const initialCounts: Record<string, string> = {};
    if (mode === 'full') {
      ingredients.forEach((ing) => {
        initialCounts[ing.id] = ing.current_stock.toString();
      });
    } else {
      // Default spot check: Coffee Beans, Milk, Cup
      const defaults = ingredients.slice(0, 3).map((i) => i.id);
      setSelectedSpotIngs(defaults);
      defaults.forEach((id) => {
        const ing = ingMap.get(id);
        if (ing) initialCounts[id] = ing.current_stock.toString();
      });
    }
    setPhysicalCounts(initialCounts);
    setIsOpnameSessionOpen(true);
  };

  const handleSubmitOpname = async () => {
    const items = targetIngredients.map((ing) => {
      const physical = parseFloat(physicalCounts[ing.id] ?? ing.current_stock.toString()) || 0;
      return {
        ingredient_id: ing.id,
        system_stock: ing.current_stock,
        physical_stock: physical,
      };
    });

    await recordStockOpname(opnameMode, items, notes);
    setIsOpnameSessionOpen(false);
    setNotes('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Mode Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-mira-dark tracking-tight">
            Stock Opname & Audit Fisik
          </h1>
          <p className="text-xs text-mira-muted mt-1">
            Bandingkan stok teoritis sistem dengan perhitungan fisik nyata di bar kedai kopi.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleStartSession('spot_check')}
            className="px-4 py-2.5 rounded-xl border border-mira-border bg-mira-card hover:bg-mira-subtle text-mira-dark text-xs font-semibold shadow-sm transition-colors"
          >
            + Spot Check Harian
          </button>
          <button
            onClick={() => handleStartSession('full')}
            className="px-4 py-2.5 rounded-xl bg-mira-caramel hover:bg-mira-caramel-hover text-white text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>+ Full Opname Mingguan</span>
          </button>
        </div>
      </div>

      {/* ACTIVE OPNAME COUNTING FORM */}
      {isOpnameSessionOpen && (
        <div className="bg-mira-card border-2 border-mira-caramel/40 rounded-2xl p-6 shadow-elevated space-y-5 animate-scale-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-mira-border gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-mira-caramel text-white">
                  {opnameMode === 'full' ? 'Full Opname' : 'Spot Check'}
                </span>
                <h3 className="font-display font-bold text-base text-mira-dark">
                  Sesi Penghitungan Fisik Berlangsung
                </h3>
              </div>
              <p className="text-xs text-mira-muted mt-0.5">
                {userRole === 'owner'
                  ? 'Sebagai Owner: Konfirmasi akan langsung menyinkronkan stok dan mencatat penyesuaian di ledger.'
                  : 'Sebagai Kasir: Hasil opname akan disimpan sebagai draft menunggu verifikasi Owner.'}
              </p>
            </div>

            <button
              onClick={() => setIsOpnameSessionOpen(false)}
              className="text-xs text-mira-muted hover:text-mira-dark underline"
            >
              Batalkan Sesi
            </button>
          </div>

          {/* If Spot Check: checkbox selector for ingredients */}
          {opnameMode === 'spot_check' && (
            <div className="p-3 bg-mira-canvas rounded-xl border border-mira-border space-y-2">
              <span className="text-xs font-semibold text-mira-dark block">
                Pilih Bahan yang Dicek (Spot Check):
              </span>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ing) => {
                  const isChecked = selectedSpotIngs.includes(ing.id);
                  return (
                    <button
                      key={ing.id}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setSelectedSpotIngs(selectedSpotIngs.filter((id) => id !== ing.id));
                        } else {
                          setSelectedSpotIngs([...selectedSpotIngs, ing.id]);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        isChecked
                          ? 'bg-mira-dark text-white border-mira-dark'
                          : 'bg-white border-mira-border text-mira-muted hover:text-mira-dark'
                      }`}
                    >
                      {ing.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Counting Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-mira-subtle/60 border-b border-mira-border text-mira-muted font-mono font-medium">
                  <th className="py-2.5 px-3">Bahan Baku</th>
                  <th className="py-2.5 px-3 text-right">Stok Sistem</th>
                  <th className="py-2.5 px-3 text-right">Hasil Hitung Fisik *</th>
                  <th className="py-2.5 px-3 text-right">Selisih (Variance)</th>
                  <th className="py-2.5 px-3 text-right">Nilai Selisih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mira-border">
                {targetIngredients.map((ing) => {
                  const physicalVal = parseFloat(physicalCounts[ing.id] ?? ing.current_stock.toString()) || 0;
                  const diff = physicalVal - ing.current_stock;
                  const varianceCost = Math.abs(diff) * ing.cost_per_base_unit;

                  return (
                    <tr key={ing.id} className="hover:bg-mira-canvas/40">
                      <td className="py-3 px-3 font-semibold text-mira-dark">
                        {ing.name}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-mira-muted">
                        {formatUnitDisplay(ing.current_stock, ing.base_unit)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <input
                            type="number"
                            step="any"
                            value={physicalCounts[ing.id] ?? ''}
                            onChange={(e) =>
                              setPhysicalCounts({
                                ...physicalCounts,
                                [ing.id]: e.target.value,
                              })
                            }
                            className="w-28 px-2.5 py-1 rounded-lg border border-mira-border font-mono font-bold text-right text-xs bg-white focus:outline-none focus:border-mira-caramel"
                          />
                          <span className="font-mono text-mira-muted w-8 text-left">
                            {ing.base_unit}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        <span
                          className={
                            diff === 0
                              ? 'text-mira-olive'
                              : diff < 0
                              ? 'text-mira-brick'
                              : 'text-mira-caramel'
                          }
                        >
                          {diff > 0 ? `+${diff}` : diff} {ing.base_unit}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-mira-muted">
                        {diff === 0 ? 'Rp 0' : formatRupiah(varianceCost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div>
            <label className="block text-xs text-mira-muted font-medium mb-1">
              Catatan Opname
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Opname rutin penutupan shift Minggu malam"
              className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border text-xs"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-mira-border">
            <button
              onClick={() => setIsOpnameSessionOpen(false)}
              className="px-4 py-2 rounded-xl border border-mira-border text-xs font-semibold text-mira-muted hover:bg-mira-subtle"
            >
              Batal
            </button>
            <button
              onClick={handleSubmitOpname}
              className="px-5 py-2 rounded-xl bg-mira-olive hover:bg-mira-olive/90 text-white text-xs font-bold shadow-sm"
            >
              {userRole === 'owner'
                ? 'Approve & Sesuaikan Stok Sistem Sekarang'
                : 'Simpan Draft Opname untuk Owner'}
            </button>
          </div>
        </div>
      )}

      {/* PAST OPNAME SESSIONS HISTORY */}
      <div className="bg-mira-card border border-mira-border rounded-2xl p-5 shadow-tactile space-y-4">
        <h2 className="font-display font-bold text-base text-mira-dark">
          Riwayat Sesi Stock Opname ({stockOpnames.length})
        </h2>

        {stockOpnames.length === 0 ? (
          <div className="p-8 text-center bg-mira-canvas rounded-xl text-xs text-mira-muted">
            Belum ada sesi stock opname yang tercatat.
          </div>
        ) : (
          <div className="space-y-4">
            {stockOpnames.map((opname) => {
              const isApproved = opname.status === 'approved';
              const totalItems = opname.items.length;
              const hasDifference = opname.items.some((it) => it.difference !== 0);

              return (
                <div
                  key={opname.id}
                  className="p-4 rounded-xl bg-mira-canvas border border-mira-border space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono font-bold text-mira-dark">
                        #{opname.id}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-white border border-mira-border">
                        {opname.type === 'full' ? 'Full Opname' : 'Spot Check'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                          isApproved
                            ? 'bg-mira-olive-light text-mira-olive border border-mira-olive/30'
                            : 'bg-mira-amber-light text-mira-amber border border-mira-amber/30'
                        }`}
                      >
                        {isApproved ? 'Approved & Adjusted' : 'Draft / Menunggu Approval'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-mira-muted font-mono text-[11px]">
                      <span>Oleh: {opname.conducted_by}</span>
                      <span>
                        {new Date(opname.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Items Variance Table Preview */}
                  <div className="bg-white rounded-lg border border-mira-border/80 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-mira-subtle/40 border-b border-mira-border text-mira-muted font-mono text-[11px]">
                          <th className="py-2 px-3">Bahan</th>
                          <th className="py-2 px-3 text-right">Stok Sistem</th>
                          <th className="py-2 px-3 text-right">Fisik Nyata</th>
                          <th className="py-2 px-3 text-right">Selisih</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-mira-border/60">
                        {opname.items.map((item, idx) => {
                          const ing = ingMap.get(item.ingredient_id);
                          return (
                            <tr key={idx}>
                              <td className="py-2 px-3 font-semibold text-mira-dark">
                                {ing?.name}
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-mira-muted">
                                {item.system_stock.toLocaleString('id-ID')} {ing?.base_unit}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-mira-dark">
                                {item.physical_stock.toLocaleString('id-ID')} {ing?.base_unit}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold">
                                <span
                                  className={
                                    item.difference === 0
                                      ? 'text-mira-olive'
                                      : item.difference < 0
                                      ? 'text-mira-brick'
                                      : 'text-mira-caramel'
                                  }
                                >
                                  {item.difference > 0 ? `+${item.difference}` : item.difference}{' '}
                                  {ing?.base_unit}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Owner Approval Button if Draft */}
                  {!isApproved && userRole === 'owner' && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => approveStockOpname(opname.id)}
                        className="px-4 py-1.5 rounded-lg bg-mira-olive hover:bg-mira-olive/90 text-white text-xs font-bold flex items-center space-x-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verifikasi & Setujui Adjustment Stok</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
