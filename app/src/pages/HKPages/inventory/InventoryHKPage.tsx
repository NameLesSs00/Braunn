import { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks';
import { fetchHkmInventoryItems, setItemsPage } from '../../../features/HKfeatures/hkmInventoryItems/hkmInventoryItemsSlice';
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
} from './mockData';

export function InventoryHKPage() {
  const [activeTab, setActiveTab] = useState<InventoryTab>('Stock Overview');
  const dispatch = useAppDispatch();
  const { items, totalCount, params } = useAppSelector((state) => state.hkmInventoryItems);

  useEffect(() => {
    dispatch(fetchHkmInventoryItems(params));
  }, [dispatch, params]);

  const handlePageChange = (page: number) => {
    dispatch(setItemsPage(page));
  };

  const lowStockItems = useMemo(() => {
    return items.filter(
      (item) => item.status === 'Low' || (item.minimumStock !== undefined && item.quantity < item.minimumStock)
    );
  }, [items]);

  function renderTabContent() {
    switch (activeTab) {
      case 'Stock Overview':
        return (
          <InventoryTable
            data={items}
            totalCount={totalCount}
            currentPage={params.PageNumber || 1}
            itemsPerPage={params.PageSize || 10}
            onPageChange={handlePageChange}
          />
        );
      case 'Withdraw Items':
        return <WithdrawItemsTable />;
      case 'Transactions':
        return <TransactionsTable />;
      case 'Low Stock':
        return <LowStockTab items={lowStockItems} />;
      case 'Purchase Requests':
        return <PurchaseRequestsTab />;
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
