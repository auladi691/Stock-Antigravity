import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  OrderItem,
  PaymentMethod,
  Menu,
  MenuVariant,
} from '../../types';
import {
  formatRupiah,
  calculateOrderBOMPreview,
} from '../../services/bomEngine';
import {
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Banknote,
  QrCode,
  Smartphone,
  Info,
  Clock,
  Layers,
} from 'lucide-react';

export const CashierView: React.FC = () => {
  const {
    menus,
    recipes,
    ingredients,
    recordSalesTransaction,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [noteDraftText, setNoteDraftText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successReceipt, setSuccessReceipt] = useState<{
    id: string;
    total: number;
    payment: PaymentMethod;
  } | null>(null);

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(menus.map((m) => m.category)))];

  const filteredMenus = selectedCategory === 'all'
    ? menus.filter((m) => m.status === 'active')
    : menus.filter((m) => m.status === 'active' && m.category === selectedCategory);

  const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  // Add menu variant to cart
  const handleAddToCart = (menu: Menu, variant: MenuVariant) => {
    // Business Rule 3: Menu Out wajib menggunakan recipe aktif
    const hasActiveRecipe = recipes.some(
      (r) => r.variant_id === variant.id && r.active && r.ingredients.length > 0
    );

    if (!hasActiveRecipe) {
      alert(`Menu "${menu.name} (${variant.name})" belum memiliki resep aktif (BOM belum lengkap). Tidak dapat ditambahkan ke transaksi.`);
      return;
    }

    setOrderItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.menu_id === menu.id && item.variant_id === variant.id
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + 1;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          subtotal: newQty * existing.unit_price,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            menu_id: menu.id,
            variant_id: variant.id,
            menu_name: menu.name,
            variant_name: variant.name,
            unit_price: variant.selling_price,
            quantity: 1,
            subtotal: variant.selling_price,
          },
        ];
      }
    });
  };

  const handleUpdateQty = (index: number, delta: number) => {
    setOrderItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const newQty = item.quantity + delta;

      if (newQty <= 0) {
        updated.splice(index, 1);
      } else {
        updated[index] = {
          ...item,
          quantity: newQty,
          subtotal: newQty * item.unit_price,
        };
      }
      return updated;
    });
  };

  const handleClearCart = () => {
    setOrderItems([]);
    setSuccessReceipt(null);
  };

  const bomPreviews = calculateOrderBOMPreview(orderItems, recipes, ingredients);
  const hasInsufficientStock = bomPreviews.some((p) => p.is_insufficient);

  const numCashAmount = parseFloat(cashAmount) || 0;
  const cashChange = numCashAmount - totalAmount;

  const handleCompleteOrder = async () => {
    if (orderItems.length === 0) return;
    setIsSubmitting(true);

    try {
      const result = await recordSalesTransaction(
        orderItems,
        selectedPaymentMethod,
        selectedPaymentMethod === 'cash' ? numCashAmount : totalAmount,
        selectedPaymentMethod === 'cash' ? Math.max(0, cashChange) : 0
      );

      if (result.success && result.transactionId) {
        setSuccessReceipt({
          id: result.transactionId,
          total: totalAmount,
          payment: selectedPaymentMethod,
        });
        setOrderItems([]);
        setShowPaymentModal(false);
        setShowPreviewModal(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden bg-mira-canvas">
      {/* LEFT SECTION: Menu Catalog & Categories */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-mira-border">
        {/* Category Pills Bar */}
        <div className="p-4 border-b border-mira-border bg-mira-card flex items-center space-x-2 overflow-x-auto shrink-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-mira-dark text-white shadow-sm'
                    : 'bg-mira-canvas text-mira-muted hover:text-mira-dark hover:bg-mira-subtle border border-mira-border'
                }`}
              >
                {cat === 'all' ? 'Semua Menu' : cat}
              </button>
            );
          })}
        </div>

        {/* Menu Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMenus.map((menu) => (
              <div
                key={menu.id}
                className="bg-mira-card border border-mira-border rounded-2xl overflow-hidden shadow-tactile flex flex-col justify-between hover:border-mira-sand transition-all group"
              >
                <div
                  onClick={() => {
                    const defaultVar = menu.variants.find((v) => v.is_default) || menu.variants[0];
                    if (defaultVar) handleAddToCart(menu, defaultVar);
                  }}
                  className="cursor-pointer"
                  title="Klik untuk tambah varian utama"
                >
                  <div className="relative aspect-square w-full bg-mira-subtle overflow-hidden">
                    <img
                      src={menu.image_url}
                      alt={menu.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 bg-mira-dark/80 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded-md uppercase">
                      {menu.category}
                    </div>
                  </div>

                  <div className="p-3.5 pb-0">
                    <h3 className="font-display font-bold text-sm text-mira-dark line-clamp-1 group-hover:text-mira-caramel transition-colors">
                      {menu.name}
                    </h3>
                  </div>
                </div>

                <div className="p-3.5 pt-0 flex flex-col justify-between flex-1">

                  {/* Variants List / Buttons */}
                  <div className="mt-3 space-y-1.5">
                    {menu.variants.map((variant) => {
                      const hasRecipe = recipes.some(
                        (r) => r.variant_id === variant.id && r.active && r.ingredients.length > 0
                      );
                      return (
                        <button
                          key={variant.id}
                          onClick={() => handleAddToCart(menu, variant)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors group/btn ${
                            hasRecipe
                              ? 'bg-mira-canvas hover:bg-mira-caramel hover:text-white border-mira-border text-mira-dark'
                              : 'bg-mira-subtle/50 text-mira-muted border-mira-border cursor-not-allowed opacity-75'
                          }`}
                          title={hasRecipe ? 'Tambah ke pesanan' : 'Resep belum lengkap (BOM Incomplete)'}
                        >
                          <div className="flex items-center space-x-1.5">
                            <span className="font-sans">{variant.name}</span>
                            {!hasRecipe && (
                              <span className="text-[10px] text-mira-amber font-mono font-normal">
                                [Resep Belum Ada]
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-semibold">
                            {formatRupiah(variant.selling_price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: Cart & Order Tray (Tablet Oriented) */}
      <div className="w-full lg:w-96 bg-mira-card flex flex-col justify-between shrink-0 h-[480px] lg:h-full border-t lg:border-t-0 shadow-sm">
        {/* Tray Header */}
        <div className="p-4 border-b border-mira-border flex items-center justify-between bg-mira-card-muted/50">
          <div>
            <h2 className="font-display font-bold text-base text-mira-dark">
              Pesanan Kasir
            </h2>
            <p className="text-xs text-mira-muted font-mono">
              {orderItems.length} item dipilih
            </p>
          </div>
          {orderItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-xs text-mira-brick hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan</span>
            </button>
          )}
        </div>

        {/* Order Items List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {orderItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-mira-muted">
              {successReceipt ? (
                <div className="bg-mira-olive-light/50 border border-mira-olive/30 rounded-2xl p-6 text-center w-full animate-fade-in">
                  <CheckCircle2 className="w-12 h-12 text-mira-olive mx-auto mb-2" />
                  <h4 className="font-display font-bold text-sm text-mira-dark">
                    Transaksi Sukses!
                  </h4>
                  <p className="text-xs font-mono text-mira-muted mt-1">
                    #{successReceipt.id}
                  </p>
                  <p className="text-sm font-mono font-bold text-mira-olive mt-2">
                    {formatRupiah(successReceipt.total)}
                  </p>
                  <div className="mt-3 text-[11px] text-mira-muted bg-white/70 py-1 rounded">
                    Bahan otomatis dipotong via resep
                  </div>
                </div>
              ) : (
                <>
                  <Layers className="w-10 h-10 mb-2 stroke-[1.5]" />
                  <p className="text-sm font-medium">Keranjang masih kosong</p>
                  <p className="text-xs mt-1">
                    Pilih menu dari katalog di sebelah kiri untuk memulai
                  </p>
                </>
              )}
            </div>
          ) : (
            orderItems.map((item, index) => (
              <div
                key={`${item.menu_id}-${item.variant_id}-${index}`}
                className="bg-mira-canvas border border-mira-border rounded-xl p-3 flex flex-col space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-mira-dark">
                      {item.menu_name}
                    </h4>
                    <span className="text-xs text-mira-caramel font-medium">
                      {item.variant_name}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-bold text-mira-dark">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>

                {/* Modifiers Notes Display / Input */}
                {item.notes ? (
                  <p className="text-[11px] text-mira-muted italic bg-white/60 px-2 py-0.5 rounded border border-mira-border">
                    Catatan: {item.notes}
                  </p>
                ) : null}

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      setEditingNoteIndex(index);
                      setNoteDraftText(item.notes || '');
                    }}
                    className="text-[11px] text-mira-muted hover:text-mira-caramel underline text-left"
                  >
                    {item.notes ? 'Ubah Catatan' : '+ Catatan Barista'}
                  </button>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2 bg-white rounded-lg border border-mira-border p-0.5">
                    <button
                      onClick={() => handleUpdateQty(index, -1)}
                      className="w-6 h-6 rounded flex items-center justify-center hover:bg-mira-subtle text-mira-dark"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs font-bold w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQty(index, 1)}
                      className="w-6 h-6 rounded flex items-center justify-center hover:bg-mira-subtle text-mira-dark"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tray Summary & Action Buttons */}
        {orderItems.length > 0 && (
          <div className="p-4 border-t border-mira-border bg-mira-card-muted/70 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-mira-muted font-medium uppercase tracking-wider">
                Total Tagihan
              </span>
              <span className="font-mono font-extrabold text-xl text-mira-dark">
                {formatRupiah(totalAmount)}
              </span>
            </div>

            {/* Quick Warning if low/negative stock */}
            {hasInsufficientStock && (
              <div className="p-2.5 rounded-lg bg-mira-brick-light text-mira-brick border border-mira-brick/30 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Peringatan: Stok bahan tidak mencukupi untuk pesanan ini.</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {/* Preview BOM Impact Button */}
              <button
                onClick={() => setShowPreviewModal(true)}
                className="w-full py-2.5 px-3 rounded-xl border border-mira-border bg-white text-xs font-semibold text-mira-dark hover:bg-mira-subtle flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Info className="w-3.5 h-3.5 text-mira-caramel" />
                <span>Preview Stok</span>
              </button>

              {/* Pay / Bayar Button */}
              <button
                onClick={() => {
                  setCashAmount(totalAmount.toString());
                  setShowPaymentModal(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-mira-caramel hover:bg-mira-caramel-hover text-white text-xs font-bold shadow-sm flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>Bayar</span>
                <span className="font-mono">({formatRupiah(totalAmount)})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PREVIEW BOM MODAL (Dampak Stok Berdasarkan Resep) */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-mira-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-mira-card border border-mira-border rounded-2xl max-w-lg w-full p-6 shadow-elevated animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-mira-border">
              <div>
                <h3 className="font-display font-bold text-base text-mira-dark">
                  Preview Pemakaian Bahan (BOM)
                </h3>
                <p className="text-xs text-mira-muted">
                  Bahan yang otomatis terpotong saat transaksi dikonfirmasi
                </p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-mira-muted hover:text-mira-dark text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto space-y-2">
              {bomPreviews.map((preview) => (
                <div
                  key={preview.ingredient_id}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    preview.is_insufficient
                      ? 'bg-mira-brick-light/50 border-mira-brick/40'
                      : 'bg-mira-canvas border-mira-border'
                  }`}
                >
                  <div>
                    <span className="font-semibold text-mira-dark block">
                      {preview.ingredient_name}
                    </span>
                    <span className="text-[11px] text-mira-muted font-mono">
                      Stok saat ini: {preview.current_stock.toLocaleString('id-ID')} {preview.base_unit}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-mira-brick block">
                      −{preview.required_quantity.toLocaleString('id-ID')} {preview.base_unit}
                    </span>
                    <span
                      className={`text-[11px] font-mono ${
                        preview.is_insufficient
                          ? 'text-mira-brick font-bold'
                          : 'text-mira-olive'
                      }`}
                    >
                      Sisa: {preview.remaining_stock.toLocaleString('id-ID')} {preview.base_unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end space-x-2 pt-3 border-t border-mira-border">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-xl border border-mira-border text-xs font-semibold text-mira-dark hover:bg-mira-subtle"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL (Pilihan Metode Bayar & Hitung Kembalian) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-mira-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-mira-card border border-mira-border rounded-2xl max-w-md w-full p-6 shadow-elevated">
            <div className="flex items-center justify-between pb-3 border-b border-mira-border">
              <div>
                <h3 className="font-display font-bold text-base text-mira-dark">
                  Penyelesaian Pembayaran
                </h3>
                <p className="text-xs text-mira-muted">Pilih metode pembayaran pelanggan</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-mira-muted hover:text-mira-dark text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Payment Methods Grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'cash', label: 'Tunai (Cash)', icon: Banknote },
                  { id: 'qris', label: 'QRIS', icon: QrCode },
                  { id: 'transfer', label: 'Transfer Bank', icon: CreditCard },
                  { id: 'ewallet', label: 'e-Wallet', icon: Smartphone },
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = selectedPaymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      onClick={() => setSelectedPaymentMethod(pm.id as PaymentMethod)}
                      className={`p-3 rounded-xl border flex items-center space-x-2.5 text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-mira-dark text-white border-mira-dark shadow-sm'
                          : 'bg-mira-canvas border-mira-border text-mira-dark hover:bg-mira-subtle'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Cash Input & Quick Change Calculation */}
              {selectedPaymentMethod === 'cash' && (
                <div className="p-3.5 rounded-xl bg-mira-canvas border border-mira-border space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-mira-muted font-medium">Uang Diterima:</span>
                    <input
                      type="number"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="w-36 px-2.5 py-1.5 rounded-lg border border-mira-border font-mono text-right font-bold text-sm bg-white focus:outline-none focus:border-mira-caramel"
                      placeholder="Nominal bayar"
                    />
                  </div>

                  {/* Quick Cash Buttons */}
                  <div className="flex space-x-1.5">
                    <button
                      onClick={() => setCashAmount(totalAmount.toString())}
                      className="flex-1 py-1 text-[11px] font-mono rounded bg-white border border-mira-border hover:bg-mira-subtle"
                    >
                      Uang Pas
                    </button>
                    <button
                      onClick={() => setCashAmount('50000')}
                      className="flex-1 py-1 text-[11px] font-mono rounded bg-white border border-mira-border hover:bg-mira-subtle"
                    >
                      50.000
                    </button>
                    <button
                      onClick={() => setCashAmount('100000')}
                      className="flex-1 py-1 text-[11px] font-mono rounded bg-white border border-mira-border hover:bg-mira-subtle"
                    >
                      100.000
                    </button>
                  </div>

                  {/* Change Calculation */}
                  <div className="flex justify-between items-center pt-2 border-t border-mira-border/70 text-xs">
                    <span className="text-mira-muted font-medium">Kembalian:</span>
                    <span
                      className={`font-mono font-bold text-sm ${
                        cashChange < 0 ? 'text-mira-brick' : 'text-mira-olive'
                      }`}
                    >
                      {cashChange < 0
                        ? `Kurang ${formatRupiah(Math.abs(cashChange))}`
                        : formatRupiah(cashChange)}
                    </span>
                  </div>
                </div>
              )}

              {/* QRIS / Transfer / eWallet Mock Notice */}
              {selectedPaymentMethod !== 'cash' && (
                <div className="p-3.5 rounded-xl bg-mira-subtle border border-mira-border text-xs text-mira-muted text-center space-y-1">
                  <p className="font-semibold text-mira-dark">
                    Konfirmasi {selectedPaymentMethod.toUpperCase()}
                  </p>
                  <p className="text-[11px]">
                    Pastikan pembayaran senilai {formatRupiah(totalAmount)} sudah berhasil masuk.
                  </p>
                </div>
              )}

              {/* Confirm Transaction Button */}
              <button
                disabled={isSubmitting || (selectedPaymentMethod === 'cash' && cashChange < 0)}
                onClick={handleCompleteOrder}
                className={`w-full py-3 rounded-xl font-display font-bold text-sm text-white transition-all shadow-sm ${
                  isSubmitting || (selectedPaymentMethod === 'cash' && cashChange < 0)
                    ? 'bg-mira-sand cursor-not-allowed'
                    : 'bg-mira-olive hover:bg-mira-olive/90'
                }`}
              >
                {isSubmitting ? 'Memproses BOM...' : 'Konfirmasi Transaksi & Potong Stok'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARISTA NOTE MODAL */}
      {editingNoteIndex !== null && orderItems[editingNoteIndex] && (
        <div className="fixed inset-0 z-50 bg-mira-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-mira-card border border-mira-border rounded-2xl max-w-sm w-full p-5 shadow-elevated animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-mira-border">
              <h3 className="font-display font-bold text-sm text-mira-dark">
                Catatan untuk Barista
              </h3>
              <button
                onClick={() => setEditingNoteIndex(null)}
                className="text-mira-muted hover:text-mira-dark text-xs"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-3">
              <p className="text-xs text-mira-muted">
                {orderItems[editingNoteIndex].menu_name} ({orderItems[editingNoteIndex].variant_name})
              </p>

              <textarea
                value={noteDraftText}
                onChange={(e) => setNoteDraftText(e.target.value)}
                placeholder="Contoh: Less Sugar, No Ice, Extra Shot..."
                rows={3}
                className="w-full p-2.5 rounded-xl bg-mira-canvas border border-mira-border text-xs focus:outline-none focus:border-mira-caramel resize-none"
              />

              {/* Quick Preset Modifier Chips */}
              <div className="flex flex-wrap gap-1.5">
                {['Less Sugar', 'No Sugar', 'Normal Ice', 'Less Ice', 'No Ice', 'Extra Hot', 'Bawa Pulang'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setNoteDraftText((prev) => (prev ? `${prev}, ${chip}` : chip));
                    }}
                    className="px-2 py-1 rounded-md bg-mira-subtle text-mira-dark border border-mira-border text-[11px] hover:bg-mira-sand transition-colors"
                  >
                    +{chip}
                  </button>
                ))}
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-mira-border">
                <button
                  type="button"
                  onClick={() => setEditingNoteIndex(null)}
                  className="px-3 py-1.5 rounded-lg border border-mira-border text-xs text-mira-muted hover:bg-mira-subtle"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrderItems((prev) => {
                      const updated = [...prev];
                      updated[editingNoteIndex] = {
                        ...updated[editingNoteIndex],
                        notes: noteDraftText.trim(),
                      };
                      return updated;
                    });
                    setEditingNoteIndex(null);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-mira-caramel hover:bg-mira-caramel-hover text-white text-xs font-bold"
                >
                  Simpan Catatan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
