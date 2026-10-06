import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Ingredient,
  Menu,
  Recipe,
} from '../../types';
import {
  formatRupiah,
  formatUnitDisplay,
} from '../../services/bomEngine';
import {
  BarChart3,
  Calendar,
  Layers,
  TrendingUp,
  DollarSign,
  Download,
  Printer,
  ChevronRight,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    ingredients,
    menus,
    recipes,
    sales,
    wastes,
    ledgers,
    brandSetting,
  } = useApp();

  const [timeFilter, setTimeFilter] = useState<'today' | 'yesterday' | 'week' | 'month'>('today');
  const [activeReportTab, setActiveReportTab] = useState<'usage' | 'hpp' | 'waste' | 'sales'>('usage');
  const [selectedIngredientBreakdown, setSelectedIngredientBreakdown] = useState<string | null>(null);

  const ingMap = new Map<string, Ingredient>();
  ingredients.forEach((ing) => ingMap.set(ing.id, ing));

  // Filter dates
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const oneMonthAgo = new Date(now);
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

  const isDateInRange = (dateStr: string) => {
    const d = new Date(dateStr);
    if (timeFilter === 'today') return dateStr.startsWith(todayStr);
    if (timeFilter === 'yesterday') return dateStr.startsWith(yesterdayStr);
    if (timeFilter === 'week') return d >= oneWeekAgo;
    if (timeFilter === 'month') return d >= oneMonthAgo;
    return true;
  };

  const filteredSales = sales.filter((s) => isDateInRange(s.created_at));
  const filteredWastes = wastes.filter((w) => isDateInRange(w.created_at));
  const filteredLedgers = ledgers.filter((l) => isDateInRange(l.created_at));

  // 1. Calculate Usage per Ingredient
  const usageTotals = new Map<string, number>();
  // Breakdown: ingredientId -> map of menuName -> totalUsage
  const usageBreakdown = new Map<string, Map<string, number>>();

  filteredLedgers
    .filter((l) => l.type === 'MENU_USAGE')
    .forEach((l) => {
      const cur = usageTotals.get(l.ingredient_id) || 0;
      usageTotals.set(l.ingredient_id, cur + Math.abs(l.quantity));

      // Extract menu name from notes if possible
      const menuMatch = l.notes.replace(/^Penjualan ORD-\w+:\s*/, '');
      if (!usageBreakdown.has(l.ingredient_id)) {
        usageBreakdown.set(l.ingredient_id, new Map());
      }
      const bMap = usageBreakdown.get(l.ingredient_id)!;
      const bCur = bMap.get(menuMatch) || 0;
      bMap.set(menuMatch, bCur + Math.abs(l.quantity));
    });

  // 2. Calculate Menu Sales Summary
  const menuSalesMap = new Map<string, { qty: number; revenue: number }>();
  filteredSales.forEach((s) => {
    s.items.forEach((item) => {
      const key = `${item.menu_name} (${item.variant_name})`;
      const existing = menuSalesMap.get(key) || { qty: 0, revenue: 0 };
      menuSalesMap.set(key, {
        qty: existing.qty + item.quantity,
        revenue: existing.revenue + item.subtotal,
      });
    });
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-mira-dark tracking-tight">
            Laporan Bisnis & Analisis HPP
          </h1>
          <p className="text-xs text-mira-muted mt-1">
            Pantau konsumsi bahan baku teoritis, profit margin menu, dan histori kerugian waste.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Time Filter Pills */}
          <div className="flex items-center bg-mira-card border border-mira-border rounded-xl p-1 text-xs">
            {[
              { id: 'today', label: 'Hari Ini' },
              { id: 'yesterday', label: 'Kemarin' },
              { id: 'week', label: '7 Hari' },
              { id: 'month', label: '30 Hari' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTimeFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  timeFilter === f.id
                    ? 'bg-mira-dark text-white font-semibold'
                    : 'text-mira-muted hover:text-mira-dark'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrint}
            className="p-2.5 rounded-xl border border-mira-border bg-mira-card hover:bg-mira-subtle text-mira-dark"
            title="Cetak Laporan"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-mira-border space-x-6 text-xs font-semibold">
        {[
          { id: 'usage', label: '1. Pemakaian Bahan Baku (Usage)' },
          { id: 'hpp', label: '2. Analisis HPP & Margin Menu' },
          { id: 'sales', label: '3. Volume Penjualan Menu' },
          { id: 'waste', label: '4. Kerugian Waste Bahan' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveReportTab(tab.id as any);
              setSelectedIngredientBreakdown(null);
            }}
            className={`pb-3 border-b-2 transition-all ${
              activeReportTab === tab.id
                ? 'border-mira-caramel text-mira-caramel font-bold'
                : 'border-transparent text-mira-muted hover:text-mira-dark'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: INGREDIENT USAGE */}
      {activeReportTab === 'usage' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-mira-card border border-mira-border rounded-2xl p-5 shadow-tactile space-y-3">
            <h3 className="font-display font-bold text-sm text-mira-dark">
              Total Penggunaan Bahan dalam Periode Ini
            </h3>

            {usageTotals.size === 0 ? (
              <p className="p-8 text-center text-xs text-mira-muted bg-mira-canvas rounded-xl">
                Belum ada transaksi pemakaian bahan pada periode ini.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-mira-card-muted/60 border-b border-mira-border text-mira-muted font-mono font-medium">
                      <th className="py-2.5 px-3">Bahan Baku</th>
                      <th className="py-2.5 px-3 text-right">Total Terpakai</th>
                      <th className="py-2.5 px-3 text-right">Estimasi Biaya</th>
                      <th className="py-2.5 px-3 text-center">Rincian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mira-border">
                    {Array.from(usageTotals.entries()).map(([ingId, totalQty]) => {
                      const ing = ingMap.get(ingId);
                      const cost = ing ? totalQty * ing.cost_per_base_unit : 0;
                      const isSelected = selectedIngredientBreakdown === ingId;

                      return (
                        <tr
                          key={ingId}
                          onClick={() => setSelectedIngredientBreakdown(ingId)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-mira-subtle/80 font-bold' : 'hover:bg-mira-canvas/60'
                          }`}
                        >
                          <td className="py-3 px-3 font-semibold text-mira-dark">
                            {ing?.name || ingId}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-mira-dark">
                            {totalQty.toLocaleString('id-ID')} {ing?.base_unit}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-mira-caramel font-semibold">
                            {formatRupiah(cost)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <ChevronRight className="w-4 h-4 text-mira-muted mx-auto" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Breakdown Per Menu Drill-Down */}
          <div className="lg:col-span-5 bg-mira-card border border-mira-border rounded-2xl p-5 shadow-tactile space-y-3">
            <h3 className="font-display font-bold text-sm text-mira-dark">
              Breakdown Penggunaan per Menu
            </h3>
            {selectedIngredientBreakdown ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-mira-canvas border border-mira-border">
                  <span className="text-xs text-mira-muted block">Bahan Terpilih:</span>
                  <span className="font-display font-bold text-sm text-mira-dark">
                    {ingMap.get(selectedIngredientBreakdown)?.name}
                  </span>
                </div>

                <div className="space-y-2">
                  {Array.from(
                    (usageBreakdown.get(selectedIngredientBreakdown) || new Map()).entries()
                  ).map(([menuDesc, qty], idx) => {
                    const ing = ingMap.get(selectedIngredientBreakdown);
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-mira-canvas border border-mira-border flex justify-between items-center text-xs"
                      >
                        <span className="text-mira-dark font-medium">{menuDesc}</span>
                        <span className="font-mono font-bold text-mira-dark">
                          {qty.toLocaleString('id-ID')} {ing?.base_unit}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-mira-muted text-center py-12">
                Klik salah satu bahan di tabel sebelah kiri untuk melihat menu apa saja yang mengonsumsi bahan tersebut.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: HPP & MARGIN ANALYTICS */}
      {activeReportTab === 'hpp' && (
        <div className="bg-mira-card border border-mira-border rounded-2xl p-5 shadow-tactile space-y-4">
          <h3 className="font-display font-bold text-base text-mira-dark">
            Struktur Biaya HPP & Keuntungan per Menu
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-mira-card-muted/60 border-b border-mira-border text-mira-muted font-mono font-medium">
                  <th className="py-3 px-4">Menu & Varian</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-right">Harga Jual</th>
                  <th className="py-3 px-4 text-right">Estimasi HPP (BOM)</th>
                  <th className="py-3 px-4 text-right">Laba Kotor (Gross Profit)</th>
                  <th className="py-3 px-4 text-right">Gross Margin (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mira-border">
                {menus.flatMap((menu) =>
                  menu.variants.map((v) => {
                    const recipe = recipes.find(
                      (r) => r.variant_id === v.id && r.active
                    );
                    const hpp = recipe?.total_cost || 0;
                    const profit = v.selling_price - hpp;
                    const marginPct = v.selling_price > 0 ? (profit / v.selling_price) * 100 : 0;

                    return (
                      <tr key={v.id} className="hover:bg-mira-canvas/50">
                        <td className="py-3 px-4 font-semibold text-mira-dark">
                          {menu.name} <span className="text-mira-muted font-normal">({v.name})</span>
                        </td>
                        <td className="py-3 px-4 text-mira-muted">{menu.category}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-mira-dark">
                          {formatRupiah(v.selling_price)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-mira-caramel">
                          {formatRupiah(hpp)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-mira-olive">
                          {formatRupiah(profit)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              marginPct >= 65
                                ? 'bg-mira-olive-light text-mira-olive'
                                : 'bg-mira-amber-light text-mira-amber'
                            }`}
                          >
                            {marginPct.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: VOLUME PENJUALAN MENU */}
      {activeReportTab === 'sales' && (
        <div className="bg-mira-card border border-mira-border rounded-2xl p-5 shadow-tactile space-y-4">
          <h3 className="font-display font-bold text-base text-mira-dark">
            Volume Menu Out Terjual dalam Periode Ini
          </h3>

          {menuSalesMap.size === 0 ? (
            <p className="p-8 text-center text-xs text-mira-muted bg-mira-canvas rounded-xl">
              Belum ada penjualan tercatat pada periode ini.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-mira-card-muted/60 border-b border-mira-border text-mira-muted font-mono font-medium">
                    <th className="py-3 px-4">Menu & Varian</th>
                    <th className="py-3 px-4 text-right">Jumlah Terjual (Cup/Pcs)</th>
                    <th className="py-3 px-4 text-right">Total Pendapatan (Omzet)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mira-border">
                  {Array.from(menuSalesMap.entries()).map(([menuDesc, stats], idx) => (
                    <tr key={idx} className="hover:bg-mira-canvas/50">
                      <td className="py-3 px-4 font-semibold text-mira-dark">
                        {menuDesc}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-mira-dark">
                        {stats.qty} cup
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-mira-olive">
                        {formatRupiah(stats.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: WASTE REPORT */}
      {activeReportTab === 'waste' && (
        <div className="bg-mira-card border border-mira-border rounded-2xl p-5 shadow-tactile space-y-4">
          <h3 className="font-display font-bold text-base text-mira-dark">
            Ringkasan Kerugian Bahan Terbuang (Waste)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-mira-card-muted/60 border-b border-mira-border text-mira-muted font-mono font-medium">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Bahan Terbuang</th>
                  <th className="py-3 px-4">Alasan</th>
                  <th className="py-3 px-4 text-right">Kuantitas</th>
                  <th className="py-3 px-4 text-right">Nilai Kerugian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mira-border">
                {filteredWastes.map((w) => {
                  const ing = ingMap.get(w.ingredient_id);
                  return (
                    <tr key={w.id} className="hover:bg-mira-canvas/50">
                      <td className="py-3 px-4 font-mono text-mira-muted">
                        {new Date(w.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-mira-dark">
                        {ing?.name || w.ingredient_id}
                      </td>
                      <td className="py-3 px-4">{w.reason}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-mira-brick">
                        −{w.quantity} {ing?.base_unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-mira-dark">
                        {formatRupiah(w.cost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
