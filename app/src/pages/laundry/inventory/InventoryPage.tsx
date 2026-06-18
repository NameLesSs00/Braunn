import { useState } from 'react';
import { InventoryHeader } from './components/InventoryHeader';
import { InventoryStats } from './components/InventoryStats';
import { InventoryTabs, InventoryTab } from './components/InventoryTabs';
import { InventoryTable } from './components/InventoryTable';
import { WithdrawItemsTable } from './components/WithdrawItemsTable';
import { TransactionsTable } from './components/TransactionsTable';
import { LowStockTab } from './components/LowStockTab';
import { PurchaseRequestsTab } from './components/PurchaseRequestsTab';
import {
  inventoryData,
  transactionsData,
  lowStockData,
  purchaseRequestsData,
} from './mockData';

export function InventoryPage() {
  const [activeTab, setActiveTab] = useState<InventoryTab>('Stock Overview');

  function renderTabContent() {
    switch (activeTab) {
      case 'Stock Overview':
        return <InventoryTable data={inventoryData} />;
      case 'Withdraw Items':
        return <WithdrawItemsTable data={inventoryData} />;
      case 'Transactions':
        return <TransactionsTable data={transactionsData} />;
      case 'Low Stock':
        return <LowStockTab items={lowStockData} />;
      case 'Purchase Requests':
        return <PurchaseRequestsTab requests={purchaseRequestsData} />;
      default:
        return null;
    }
  }

  return (
    <div className="py-6 space-y-6">
      <InventoryHeader />
      <InventoryStats />

      <div className="space-y-4">
        <InventoryTabs activeTab={activeTab} onTabChange={setActiveTab} />
        {renderTabContent()}
      </div>
    </div>
  );
}
