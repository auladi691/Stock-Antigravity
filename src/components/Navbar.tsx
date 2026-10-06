import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Wifi,
  WifiOff,
  AlertTriangle,
  UserCheck,
  Coffee,
} from 'lucide-react';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const {
    brandSetting,
    userRole,
    setUserRole,
    isOnline,
    ingredients,
    setActiveTab,
  } = useApp();

  // Count low stock items
  const lowStockCount = ingredients.filter(
    (ing) => ing.status === 'active' && ing.current_stock <= ing.minimum_stock
  ).length;

  return (
    <header className="bg-mira-card border-b border-mira-border sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logotype & Outlet */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-mira-dark text-mira-canvas flex items-center justify-center font-display font-extrabold text-lg tracking-wider shadow-sm">
            M
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-bold text-lg text-mira-dark tracking-tight">
                {brandSetting.name}
              </span>
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-mira-subtle text-mira-muted border border-mira-border">
                Outlet 01
              </span>
            </div>
            <p className="text-xs text-mira-muted hidden sm:block">
              {brandSetting.tagline}
            </p>
          </div>
        </div>

        {/* Status Indicators & Role Switcher */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Low stock alert badge */}
          {lowStockCount > 0 && (
            <button
              onClick={() => setActiveTab('inventory')}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-mira-amber-light text-mira-amber border border-mira-amber/30 text-xs font-medium hover:bg-mira-amber/20 transition-colors"
              title={`${lowStockCount} bahan di bawah stok minimum`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="font-mono">{lowStockCount} Kritis</span>
            </button>
          )}

          {/* Online/Offline PWA indicator */}
          <div
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
              isOnline
                ? 'bg-mira-olive-light text-mira-olive border-mira-olive/30'
                : 'bg-mira-brick-light text-mira-brick border-mira-brick/30'
            }`}
            title={isOnline ? 'Online (Real-time Aktif)' : 'Offline (Tersimpan Lokal)'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-mira-olive" />
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-mira-brick" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Role Switcher Pill */}
          <div className="flex items-center space-x-1 bg-mira-canvas border border-mira-border rounded-lg p-1 text-xs">
            <span className="text-mira-muted px-1.5 hidden md:inline text-[11px] font-medium">
              Role:
            </span>
            {(['owner', 'cashier', 'super_admin'] as UserRole[]).map((r) => {
              const isActive = userRole === r;
              const labels: Record<UserRole, string> = {
                owner: 'Owner',
                cashier: 'Kasir',
                super_admin: 'Super Admin',
              };
              return (
                <button
                  key={r}
                  onClick={() => setUserRole(r)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    isActive
                      ? 'bg-mira-dark text-white shadow-sm'
                      : 'text-mira-muted hover:text-mira-dark hover:bg-white/60'
                  }`}
                >
                  {labels[r]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
