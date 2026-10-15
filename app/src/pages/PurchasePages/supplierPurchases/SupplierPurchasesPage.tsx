import { useEffect, useState, useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchSupplierPurchases } from '../../../features/Purchasefeatures/supplierPurchases/supplierPurchasesSlice';
import { fetchSuppliers } from '../../../features/Purchasefeatures/suppliers/suppliersSlice';
import { fetchRestaurantMaterials } from '../../../features/restaurant/restaurantMaterialsSlice';
import { fetchRestaurantUnits } from '../../../features/restaurant/restaurantUnitsSlice';
import type { SupplierPurchaseListItem } from '../../../models/Purchasemodels/SupplierPurchase';
import { PurchaseLayout } from '../../../widgets/layout/PurchaseLayout/PurchaseLayout';
import { ComingSoonPage } from '../../systems/components/ComingSoonPage';
import { features } from '../../../config/features';

import { SupplierPurchasesHeader } from './components/SupplierPurchasesHeader';
import {
  SupplierPurchasesFilters,
  type StatusFilterOption,
} from './components/SupplierPurchasesFilters';
import { SupplierPurchasesTable } from './components/SupplierPurchasesTable';
import { CreatePurchaseOrderDrawer } from './components/CreatePurchaseOrderDrawer';
import { PurchaseDetailsDrawer } from './components/PurchaseDetailsDrawer';
import { ReceiveOrderModal } from './components/ReceiveOrderModal';
import { DeletePurchaseModal } from './components/DeletePurchaseModal';
import { PayPurchaseInvoiceDrawer } from './components/PayPurchaseInvoiceDrawer';

export function SupplierPurchasesPage() {
  const dispatch = useAppDispatch();
  const { purchases, totalCount, totalPages, status } = useAppSelector(
    (state) => state.supplierPurchases
  );
  const { suppliers } = useAppSelector((state) => state.suppliers);

  // Pagination & Filter States
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilterOption>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<SupplierPurchaseListItem | null>(null);
  const [receivingPurchase, setReceivingPurchase] = useState<SupplierPurchaseListItem | null>(null);
  const [payingPurchase, setPayingPurchase] = useState<SupplierPurchaseListItem | null>(null);
  const [deletingPurchase, setDeletingPurchase] = useState<SupplierPurchaseListItem | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Initial load of suppliers & restaurant resources for orders
  useEffect(() => {
    if (suppliers.length === 0) {
      dispatch(fetchSuppliers({ pageNumber: 1, pageSize: 100 }));
    }
    dispatch(fetchRestaurantMaterials());
    dispatch(fetchRestaurantUnits());
  }, [dispatch, suppliers.length]);

  // Primary data fetch effect
  useEffect(() => {
    dispatch(
      fetchSupplierPurchases({
        pageNumber: page,
        pageSize: rowsPerPage,
        supplierId: selectedSupplierId === 'ALL' ? undefined : selectedSupplierId,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
    );
  }, [dispatch, page, rowsPerPage, selectedSupplierId, selectedStatus, dateFrom, dateTo, refreshKey]);

  // Periodic polling & tab focus refresh
  useEffect(() => {
    const refreshData = () => {
      dispatch(
        fetchSupplierPurchases({
          pageNumber: page,
          pageSize: rowsPerPage,
          supplierId: selectedSupplierId === 'ALL' ? undefined : selectedSupplierId,
          status: selectedStatus === 'ALL' ? undefined : selectedStatus,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        })
      );
    };

    const interval = setInterval(refreshData, 25000);
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [dispatch, page, rowsPerPage, selectedSupplierId, selectedStatus, dateFrom, dateTo]);

  // Client search filter on the current page items
  const displayPurchases = useMemo(() => {
    if (!debouncedSearch) return purchases;

    return purchases.filter((p) => {
      const idMatch = String(p?.id ?? '').includes(debouncedSearch);
      const supplierMatch = p.supplierName?.toLowerCase().includes(debouncedSearch);
      const notesMatch = p.notes?.toLowerCase().includes(debouncedSearch);
      return idMatch || supplierMatch || notesMatch;
    });
  }, [purchases, debouncedSearch]);

  const receivedCount = useMemo(() => {
    return purchases.filter((p) => p.purchaseStatus?.toLowerCase() === 'received').length;
  }, [purchases]);

  const pendingCount = useMemo(() => {
    return purchases.filter((p) => p.purchaseStatus?.toLowerCase() === 'pending').length;
  }, [purchases]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedSupplierId('ALL');
    setSelectedStatus('ALL');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const isFiltered =
    !!searchTerm ||
    selectedSupplierId !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    !!dateFrom ||
    !!dateTo;

  if (!features.enableNewModulesUI) {
    return (
      <ComingSoonPage
        moduleName="Purchase - Supplier Purchases"
        icon={<ShoppingCart />}
        accentColor="#0B4EA2"
      />
    );
  }

  return (
    <PurchaseLayout>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header with Title, counters & Create CTA */}
        <SupplierPurchasesHeader
          totalCount={totalCount}
          receivedCount={receivedCount}
          pendingCount={pendingCount}
          onCreateClick={() => setIsCreateOpen(true)}
        />

        {/* Filter Toolbar */}
        <SupplierPurchasesFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSupplierId={selectedSupplierId}
          onSupplierChange={(id) => {
            setSelectedSupplierId(id);
            setPage(1);
          }}
          selectedStatus={selectedStatus}
          onStatusChange={(statusOption) => {
            setSelectedStatus(statusOption);
            setPage(1);
          }}
          dateFrom={dateFrom}
          onDateFromChange={(val) => {
            setDateFrom(val);
            setPage(1);
          }}
          dateTo={dateTo}
          onDateToChange={(val) => {
            setDateTo(val);
            setPage(1);
          }}
          suppliers={suppliers}
          onClearFilters={handleClearFilters}
          isFiltered={isFiltered}
        />

        {/* Supplier Purchases Table */}
        <SupplierPurchasesTable
          purchases={displayPurchases}
          totalCount={totalCount}
          totalPages={totalPages}
          pageNumber={page}
          pageSize={rowsPerPage}
          isLoading={status === 'loading'}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setRowsPerPage(newSize);
            setPage(1);
          }}
          onView={(purchase) => setViewingPurchase(purchase)}
          onReceive={(purchase) => setReceivingPurchase(purchase)}
          onPay={(purchase) => setPayingPurchase(purchase)}
          onDelete={(purchase) => setDeletingPurchase(purchase)}
          onCreateClick={() => setIsCreateOpen(true)}
          isFiltered={isFiltered}
        />
      </div>

      {/* Drawers & Modals */}
      <CreatePurchaseOrderDrawer
        open={isCreateOpen}
        suppliers={suppliers}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleRefresh}
      />

      <PurchaseDetailsDrawer
        open={!!viewingPurchase}
        purchase={viewingPurchase}
        onClose={() => setViewingPurchase(null)}
        onReceive={(purchase) => setReceivingPurchase(purchase)}
        onPay={(purchase) => setPayingPurchase(purchase)}
      />

      <PayPurchaseInvoiceDrawer
        open={!!payingPurchase}
        purchase={payingPurchase}
        onClose={() => setPayingPurchase(null)}
        onSuccess={handleRefresh}
      />

      <ReceiveOrderModal
        open={!!receivingPurchase}
        purchase={receivingPurchase}
        onClose={() => setReceivingPurchase(null)}
        onSuccess={handleRefresh}
      />

      <DeletePurchaseModal
        open={!!deletingPurchase}
        purchase={deletingPurchase}
        onClose={() => setDeletingPurchase(null)}
        onSuccess={handleRefresh}
      />
    </PurchaseLayout>
  );
}
