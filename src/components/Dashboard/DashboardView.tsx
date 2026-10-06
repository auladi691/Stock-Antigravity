import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatRupiah,
  formatUnitDisplay,
} from '../../services/bomEngine';
import {
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Trash2,
  Package,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    ingredients,
    sales,
    wastes,
    ledgers,
    setActiveTab,
  } = useApp();

  // 1. Calculate Current Inventory Asset Value
  const totalInventoryValue = ingredients.reduce(
    (sum, ing) => sum + Math.max(0, ing.current_stock) * ing.cost_per_base_unit,
    0
  );

  // 2. Calculate Usage Today (from today's ledgers)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLedgers = ledgers.filter(
    (l) => l.type === 'MENU_USAGE' && l.created_at.startsWith(todayStr)
  );

  const ingMap = new Map<string, (typeof ingredients)[0]>();
  ingredients.forEach((ing) => ingMap.set(ing.id, ing));

  const usageTodayCost = todayLedgers.reduce((sum, ldg) => {
    const ing = ingMap.get(ldg.ingredient_id);
    const costPerUnit = ing ? ing.cost_per_base_unit : 0;
    return sum + Math.abs(ldg.quantity) * costPerUnit;
  }, 0);

  // 3. Low Stock Items
  const lowStockItems = ingredients.filter(
    (ing) => ing.status === 'active' && ing.current_stock <= ing.minimum_stock
  );

  // 4. Waste Today
  const todayWastes = wastes.filter((w) => w.created_at.startsWith(todayStr));
  const totalWasteTodayCost = todayWastes.reduce((sum, w) => sum + w.cost, 0);

  // Recent Sales
  const recentSales = sales.slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-mira-dark tracking-tight">
          Ringkasan Operasional Hari Ini
        </h1>
        <p className="text-xs text-mira-muted mt-1">
          Pantau stok bahan, penggunaan resep harian, dan nilai inventaris real-time.
        </p>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Nilai Inventory */}
        <div className="bg-mira-card border border-mira-border rounded-2xl p-4 shadow-tactile flex flex-col justify-between">
          <div className="flex items-center justify-between text-mira-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Nilai Aset Stok
            </span>
            <div className="p-2 rounded-xl bg-mira-subtle text-mira-dark">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-display font-extrabold text-xl text-mira-dark">
              {formatRupiah(totalInventoryValue)}
            </div>
            <p className="text-[11px] text-mira-muted font-mono mt-1">
              Dari {ingredients.length} jenis bahan aktif
            </p>
          </div>
        </div>

        {/* KPI 2: Pemakaian Bahan Hari Ini */}
        <div className="bg-mira-card border border-mira-border rounded-2xl p-4 shadow-tactile flex flex-col justify-between">
          <div className="flex items-center justify-between text-mira-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Pemakaian Hari Ini
            </span>
            <div className="p-2 rounded-xl bg-mira-olive-light text-mira-olive">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-display font-extrabold text-xl text-mira-dark">
              {formatRupiah(usageTodayCost)}
            </div>
            <p className="text-[11px] text-mira-muted font-mono mt-1">
              {todayLedgers.length} pengeluaran via resep
            </p>
          </div>
        </div>

        {/* KPI 3: Bahan Kritis */}
        <div className="bg-mira-card border border-mira-border rounded-2xl p-4 shadow-tactile flex flex-col justify-between">
          <div className="flex items-center justify-between text-mira-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Stok Kritis / Kurang
            </span>
            <div className="p-2 rounded-xl bg-mira-amber-light text-mira-amber">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-display font-extrabold text-xl text-mira-dark">
              {lowStockItems.length}{' '}
              <span className="text-sm font-sans font-normal text-mira-muted">
                Bahan
              </span>
            </div>
            <p className="text-[11px] text-mira-amber font-mono font-medium mt-1">
              {lowStockItems.length > 0 ? 'Perlu segera restock' : 'Semua stok aman'}
            </p>
          </div>
        </div>

        {/* KPI 4: Waste Hari Ini */}
        <div className="bg-mira-card border border-mira-border rounded-2xl p-4 shadow-tactile flex flex-col justify-between">
          <div className="flex items-center justify-between text-mira-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Waste / Terbuang
            </span>
            <div className="p-2 rounded-xl bg-mira-brick-light text-mira-brick">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-display font-extrabold text-xl text-mira-dark">
              {formatRupiah(totalWasteTodayCost)}
            </div>
            <p className="text-[11px] text-mira-muted font-mono mt-1">
              {todayWastes.length} pencatatan hari ini
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CRITICAL STOCK ALERTS TABLE (2 Cols) */}
        <div className="lg:col-span-2 bg-mira-card border border-mira-border rounded-2xl p-5 shadow-tactile space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-mira-amber" />
              <h2 className="font-display font-bold text-base text-mira-dark">
                Peringatan Stok Bahan Kritis
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('stock_in')}
              className="text-xs font-semibold text-mira-caramel hover:underline flex items-center space-x-1"
            >
              <span>+ Input Barang Masuk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="p-8 text-center bg-mira-canvas rounded-xl border border-mira-border text-xs text-mira-muted">
              ✓ Seluruh bahan baku berada di atas batas stok minimum aman.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-mira-border text-mira-muted font-mono">
                    <th className="pb-2 font-medium">Bahan Baku</th>
                    <th className="pb-2 font-medium">Kategori</th>
                    <th className="pb-2 font-medium text-right">Stok Aktual</th>
                    <th className="pb-2 font-medium text-right">Batas Min</th>
                    <th className="pb-2 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mira-border">
                  {lowStockItems.map((item) => {
                    const isOutOfStock = item.current_stock <= 0;
                    return (
                      <tr key={item.id} className="hover:bg-mira-canvas/60">
                        <td className="py-3 font-semibold text-mira-dark">
                          {item.name}
                        </td>
                        <td className="py-3 text-mira-muted">{item.category}</td>
                        <td className="py-3 text-right font-mono font-bold text-mira-brick">
                          {formatUnitDisplay(item.current_stock, item.base_unit)}
                        </td>
                        <td className="py-3 text-right font-mono text-mira-muted">
                          {formatUnitDisplay(item.minimum_stock, item.base_unit)}
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                              isOutOfStock
                                ? 'bg-mira-brick text-white'
                                : 'bg-mira-amber-light text-mira-amber'
                            }`}
                          >
                            {isOutOfStock ? 'Habis' : 'Menipis'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RECENT SALES / MENU OUT (1 Col) */}
        <div className="bg-mira-card border border-mira-border rounded-2xl p-5 shadow-tactile space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-mira-muted" />
              <h2 className="font-display font-bold text-base text-mira-dark">
                Menu Out Terakhir
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('ledger')}
              className="text-xs text-mira-caramel hover:underline"
            >
              Lihat Ledger
            </button>
          </div>

          <div className="space-y-2.5">
            {recentSales.length === 0 ? (
              <p className="text-xs text-mira-muted text-center py-6">
                Belum ada transaksi penjualan hari ini.
              </p>
            ) : (
              recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-3 rounded-xl bg-mira-canvas border border-mira-border flex flex-col space-y-1.5"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-mira-dark">
                      #{sale.id}
                    </span>
                    <span className="font-mono font-bold text-mira-olive">
                      {formatRupiah(sale.total_amount)}
                    </span>
                  </div>
                  <div className="text-[11px] text-mira-muted line-clamp-1">
                    {sale.items
                      .map((i) => `${i.menu_name} (${i.variant_name}) × ${i.quantity}`)
                      .join(', ')}
                  </div>
                  <div className="flex justify-between text-[10px] text-mira-muted font-mono pt-1 border-t border-mira-border/50">
                    <span className="capitalize">{sale.payment_method}</span>
                    <span>
                      {new Date(sale.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
