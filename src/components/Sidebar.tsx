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
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ('owner' | 'cashier' | 'super_admin')[];
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    userRole,
    ingredients,
    isSidebarCollapsed,
    toggleSidebar,
  } = useApp();

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
    <aside
      className={`h-full bg-mira-card border-r border-mira-border flex flex-col justify-between shrink-0 select-none transition-all duration-200 ease-in-out ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header & Menu Items */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Sidebar Header with Minimize/Expand Toggle */}
        <div
          className={`h-12 border-b border-mira-border/70 flex items-center shrink-0 px-3 ${
            isSidebarCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!isSidebarCollapsed && (
            <span className="text-[11px] font-mono uppercase tracking-wider text-mira-muted font-semibold pl-1">
              Navigasi
            </span>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-mira-muted hover:text-mira-dark hover:bg-mira-subtle transition-colors focus:outline-none"
            title={isSidebarCollapsed ? 'Perluas Menu (Expand)' : 'Kecilkan Menu (Minimize)'}
          >
            {isSidebarCollapsed ? (
              <ChevronsRight className="w-4 h-4 text-mira-dark" />
            ) : (
              <ChevronsLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Item List */}
        <div className="p-2 space-y-1 overflow-y-auto flex-1 scrollbar-none">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={`w-full flex items-center rounded-xl text-sm font-medium transition-colors relative focus:outline-none ${
                  isSidebarCollapsed
                    ? 'justify-center p-3'
                    : 'justify-between px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-mira-dark text-white shadow-sm'
                    : 'text-mira-muted hover:text-mira-dark hover:bg-mira-subtle'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-mira-muted'
                    }`}
                  />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </div>

                {/* Badge count */}
                {item.badge !== undefined && (
                  <>
                    {!isSidebarCollapsed ? (
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-mira-amber text-white'
                            : 'bg-mira-amber-light text-mira-amber font-semibold'
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-mira-amber rounded-full border-2 border-white" />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-mira-border bg-mira-card-muted/50 text-xs text-mira-muted shrink-0">
        {!isSidebarCollapsed ? (
          <div className="space-y-1">
            <div className="flex justify-between font-mono">
              <span>Mode:</span>
              <span className="font-semibold text-mira-dark capitalize">{userRole}</span>
            </div>
            <div className="flex justify-between font-mono text-[11px]">
              <span>BOM Engine:</span>
              <span className="text-mira-olive font-semibold">Aktif</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title={`Mode: ${userRole}`}>
            <span className="w-7 h-7 rounded-lg bg-mira-subtle flex items-center justify-center font-mono font-bold text-[11px] text-mira-dark uppercase border border-mira-border">
              {userRole[0]}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
