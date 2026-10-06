import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BookOpen,
  ArrowDownToLine,
  Trash2,
  ClipboardCheck,
  History,
  BarChart3,
  Settings,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ('owner' | 'cashier' | 'super_admin')[];
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, userRole, ingredients } = useApp();

  const lowStockCount = ingredients.filter(
    (ing) => ing.status === 'active' && ing.current_stock <= ing.minimum_stock
  ).length;

  const navItems: NavItem[] = [
    {
      id: 'pos',
      label: 'Kasir / Menu Out',
      icon: ShoppingCart,
      roles: ['owner', 'cashier', 'super_admin'],
    },
    {
      id: 'dashboard',
      label: 'Ringkasan Harian',
      icon: LayoutDashboard,
      roles: ['owner', 'super_admin'],
    },
    {
      id: 'inventory',
      label: 'Master Bahan Baku',
      icon: Package,
      roles: ['owner', 'super_admin'],
      badge: lowStockCount > 0 ? lowStockCount : undefined,
    },
    {
      id: 'recipes',
      label: 'Menu & Resep (BOM)',
      icon: BookOpen,
      roles: ['owner', 'super_admin'],
    },
    {
      id: 'stock_in',
      label: 'Barang Masuk',
      icon: ArrowDownToLine,
      roles: ['owner', 'cashier', 'super_admin'],
    },
    {
      id: 'waste',
      label: 'Waste / Terbuang',
      icon: Trash2,
      roles: ['owner', 'cashier', 'super_admin'],
    },
    {
      id: 'opname',
      label: 'Stock Opname',
      icon: ClipboardCheck,
      roles: ['owner', 'cashier', 'super_admin'],
    },
    {
      id: 'ledger',
      label: 'Histori Pergerakan',
      icon: History,
      roles: ['owner', 'super_admin'],
    },
    {
      id: 'reports',
      label: 'Laporan & HPP',
      icon: BarChart3,
      roles: ['owner', 'super_admin'],
    },
    {
      id: 'settings',
      label: 'Pengaturan & Brand',
      icon: Settings,
      roles: ['owner', 'super_admin'],
    },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-mira-card border-r border-mira-border flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-mira-muted font-semibold">
          Navigasi Utama
        </div>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-mira-dark text-white shadow-sm'
                  : 'text-mira-dark hover:bg-mira-subtle text-mira-muted hover:text-mira-dark'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : 'text-mira-muted'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-mira-amber text-white'
                      : 'bg-mira-amber-light text-mira-amber font-semibold'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-mira-border bg-mira-card-muted/50 text-xs text-mira-muted space-y-1">
        <div className="flex justify-between font-mono">
          <span>Mode:</span>
          <span className="font-semibold text-mira-dark capitalize">{userRole}</span>
        </div>
        <div className="flex justify-between font-mono">
          <span>BOM Engine:</span>
          <span className="text-mira-olive font-semibold">Otomatis Aktif</span>
        </div>
      </div>
    </aside>
  );
};
