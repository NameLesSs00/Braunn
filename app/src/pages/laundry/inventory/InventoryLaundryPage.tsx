import { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchLaundryInventoryItems, setItemsPage } from '../../../features/Laundryfeatures/laundryInventoryItems/laundryInventoryItemsSlice';
import { LaundryInventoryHeader } from './components/LaundryInventoryHeader';
import { LaundryInventoryStats } from './components/LaundryInventoryStats';
import { LaundryInventoryTabs, type LaundryInventoryTab } from './components/LaundryInventoryTabs';
import { LaundryInventoryTable } from './components/LaundryInventoryTable';
import { LaundryLowStockTab } from './components/LaundryLowStockTab';
import { LaundryWithdrawItemsTable } from './components/LaundryWithdrawItemsTable';
import { LaundryPurchaseRequestsTab } from './components/LaundryPurchaseRequestsTab';
import { LaundryTransactionsTable } from './components/LaundryTransactionsTable';

export function InventoryLaundryPage() {
  const [activeTab, setActiveTab] = useState<LaundryInventoryTab>('Stock Overview');
  const dispatch = useAppDispatch();
  const { items, totalCount, params } = useAppSelector((state) => state.laundryInventoryItems);

  useEffect(() => {
    dispatch(fetchLaundryInventoryItems(params));
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
          <LaundryInventoryTable
            data={items}
            totalCount={totalCount}
            currentPage={params.PageNumber || 1}
            itemsPerPage={params.PageSize || 10}
            onPageChange={handlePageChange}
          />
        );
      case 'Withdraw Items':
        return <LaundryWithdrawItemsTable />;
      case 'Transactions':
        return <LaundryTransactionsTable />;
      case 'Low Stock':
        return <LaundryLowStockTab items={lowStockItems} />;
      case 'Purchase Requests':
        return <LaundryPurchaseRequestsTab />;
      default:
        return null;
    }
  }

  return (
    <div className="py-6 space-y-6">
      <LaundryInventoryHeader />
      <LaundryInventoryStats />

      <div className="space-y-4">
        <LaundryInventoryTabs activeTab={activeTab} onTabChange={setActiveTab} />
        {renderTabContent()}
      </div>
    </div>
  );
}
