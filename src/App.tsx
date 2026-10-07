import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CashierView } from './components/Cashier/CashierView';
import { DashboardView } from './components/Dashboard/DashboardView';
import { IngredientsView } from './components/Inventory/IngredientsView';
import { RecipesView } from './components/Recipes/RecipesView';
import { StockInView } from './components/StockIn/StockInView';
import { WasteView } from './components/Waste/WasteView';
import { StockOpnameView } from './components/StockOpname/StockOpnameView';
import { LedgerView } from './components/Ledger/LedgerView';
import { ReportsView } from './components/Reports/ReportsView';
import { SettingsView } from './components/Settings/SettingsView';

const MainContent: React.FC = () => {
  const { activeTab, userRole } = useApp();

  // Guard for cashier role
  const isCashier = userRole === 'cashier';
  const allowedForCashier = ['pos', 'stock_in', 'waste', 'opname'];
  const currentTab = isCashier && !allowedForCashier.includes(activeTab) ? 'pos' : activeTab;

  return (
    <main className="flex-1 h-full overflow-y-auto bg-mira-canvas">
      {currentTab === 'pos' && <CashierView />}
      {currentTab === 'dashboard' && <DashboardView />}
      {currentTab === 'inventory' && <IngredientsView />}
      {currentTab === 'recipes' && <RecipesView />}
      {currentTab === 'stock_in' && <StockInView />}
      {currentTab === 'waste' && <WasteView />}
      {currentTab === 'opname' && <StockOpnameView />}
      {currentTab === 'ledger' && <LedgerView />}
      {currentTab === 'reports' && <ReportsView />}
      {currentTab === 'settings' && <SettingsView />}
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="h-screen w-screen overflow-hidden bg-mira-canvas flex flex-col font-sans text-mira-dark">
        <Navbar />
        <div className="flex-1 flex overflow-hidden w-full relative">
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </AppProvider>
  );
};

export default App;
