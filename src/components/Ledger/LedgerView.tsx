import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InventoryTransactionType, Ingredient } from '../../types';
import { formatUnitDisplay } from '../../services/bomEngine';
import { History, Filter, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';

export const LedgerView: React.FC = () => {
  const { ledgers, ingredients } = useApp();

  const [selectedIngredient, setSelectedIngredient] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchNotes, setSearchNotes] = useState<string>('');

  const ingMap = new Map<string, Ingredient>();
  ingredients.forEach((ing) => ingMap.set(ing.id, ing));

  const filteredLedgers = ledgers.filter((item) => {
    const matchIng =
      selectedIngredient === 'all' || item.ingredient_id === selectedIngredient;
    const matchType = selectedType === 'all' || item.type === selectedType;
    const matchSearch =
      !searchNotes || item.notes.toLowerCase().includes(searchNotes.toLowerCase());
    return matchIng && matchType && matchSearch;
  });

  const getBadgeStyle = (type: InventoryTransactionType) => {
    switch (type) {
      case 'STOCK_IN':
        return 'bg-mira-olive-light text-mira-olive border-mira-olive/30';
      case 'MENU_USAGE':
        return 'bg-mira-subtle text-mira-dark border-mira-border';
      case 'WASTE':
        return 'bg-mira-brick-light text-mira-brick border-mira-brick/30';
      case 'STOCK_OPNAME':
        return 'bg-mira-amber-light text-mira-amber border-mira-amber/30';
      case 'ADJUSTMENT':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'OPENING_STOCK':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-mira-dark tracking-tight">
          Buku Jurnal Histori Stok (Inventory Ledger)
        </h1>
        <p className="text-xs text-mira-muted mt-1">
          Rekaman audit lengkap setiap gram dan mililiter bahan yang masuk atau keluar, dapat ditelusuri langsung ke menu penjualan atau invoice.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-mira-card border border-mira-border rounded-2xl p-4 shadow-tactile grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Ingredient Filter */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-mira-muted font-medium mb-1">
            Filter Bahan Baku
          </label>
          <select
            value={selectedIngredient}
            onChange={(e) => setSelectedIngredient(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border text-xs focus:outline-none"
          >
            <option value="all">Semua Bahan ({ingredients.length})</option>
            {ingredients.map((ing) => (
              <option key={ing.id} value={ing.id}>
                {ing.name}
              </option>
            ))}
          </select>
        </div>

        {/* Transaction Type Filter */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-mira-muted font-medium mb-1">
            Tipe Transaksi
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-mira-canvas border border-mira-border text-xs focus:outline-none"
          >
            <option value="all">Semua Tipe</option>
            <option value="MENU_USAGE">MENU_USAGE (Pemakaian Resep Penjualan)</option>
            <option value="STOCK_IN">STOCK_IN (Penerimaan Supplier)</option>
            <option value="WASTE">WASTE (Bahan Terbuang)</option>
            <option value="STOCK_OPNAME">STOCK_OPNAME (Penyesuaian Fisik)</option>
            <option value="ADJUSTMENT">ADJUSTMENT (Koreksi Manual)</option>
            <option value="OPENING_STOCK">OPENING_STOCK (Stok Awal)</option>
          </select>
        </div>

        {/* Search Notes */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-mira-muted font-medium mb-1">
            Cari Keterangan / Referensi
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-mira-muted absolute left-3 top-3" />
            <input
              type="text"
              value={searchNotes}
              onChange={(e) => setSearchNotes(e.target.value)}
              placeholder="Nomor order, invoice, alasan..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-mira-canvas border border-mira-border text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-mira-card border border-mira-border rounded-2xl shadow-tactile overflow-hidden">
        <div className="p-4 border-b border-mira-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-mira-muted" />
            <span className="font-display font-bold text-sm text-mira-dark">
              Catatan Jurnal Transaksi ({filteredLedgers.length})
            </span>
          </div>
        </div>

        {filteredLedgers.length === 0 ? (
          <div className="p-8 text-center bg-mira-canvas rounded-xl text-xs text-mira-muted">
            Tidak ada transaksi ledger yang cocok dengan filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-mira-card-muted/60 border-b border-mira-border text-mira-muted font-mono font-medium">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Bahan Baku</th>
                  <th className="py-3 px-4">Tipe Transaksi</th>
                  <th className="py-3 px-4 text-right">Perubahan Qty</th>
                  <th className="py-3 px-4 text-right">Saldo Sesudah</th>
                  <th className="py-3 px-4">Keterangan & Sumber</th>
                  <th className="py-3 px-4 text-center">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mira-border">
                {filteredLedgers.map((item) => {
                  const ing = ingMap.get(item.ingredient_id);
                  const isPositive = item.quantity > 0;
                  return (
                    <tr key={item.id} className="hover:bg-mira-canvas/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-mira-muted whitespace-nowrap">
                        {new Date(item.created_at).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-mira-dark">
                        {ing?.name || item.ingredient_id}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${getBadgeStyle(
                            item.type
                          )}`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span
                          className={isPositive ? 'text-mira-olive' : 'text-mira-brick'}
                        >
                          {isPositive ? `+${item.quantity.toLocaleString('id-ID')}` : item.quantity.toLocaleString('id-ID')}{' '}
                          {ing?.base_unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-mira-dark whitespace-nowrap">
                        {item.balance_after.toLocaleString('id-ID')} {ing?.base_unit}
                      </td>
                      <td className="py-3 px-4 text-mira-dark text-[11px] max-w-sm truncate">
                        {item.notes}
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
    </div>
  );
};
