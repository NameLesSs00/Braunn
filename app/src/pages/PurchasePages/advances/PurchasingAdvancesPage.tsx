import { useEffect, useState, useMemo } from 'react';
import { Wallet } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchPurchasingAdvances } from '../../../features/Purchasefeatures/purchasingAdvances/purchasingAdvancesSlice';
import { fetchSuppliers } from '../../../features/Purchasefeatures/suppliers/suppliersSlice';
import type { PurchasingAdvance } from '../../../models/Purchasemodels/PurchasingAdvance';
import { PurchaseLayout } from '../../../widgets/layout/PurchaseLayout/PurchaseLayout';
import { ComingSoonPage } from '../../systems/components/ComingSoonPage';
import { features } from '../../../config/features';

import { PurchasingAdvancesHeader } from './components/PurchasingAdvancesHeader';
import {
  PurchasingAdvancesFilters,
  type StatusFilterOption,
} from './components/PurchasingAdvancesFilters';
import { PurchasingAdvancesTable } from './components/PurchasingAdvancesTable';
import { CreatePurchasingAdvanceDrawer } from './components/CreatePurchasingAdvanceDrawer';
import { EditPurchasingAdvanceModal } from './components/EditPurchasingAdvanceModal';
import { AdvanceDetailsDrawer } from './components/AdvanceDetailsDrawer';
import { CancelAdvanceModal } from './components/CancelAdvanceModal';
import { DeleteAdvanceModal } from './components/DeleteAdvanceModal';

export function PurchasingAdvancesPage() {
  const dispatch = useAppDispatch();
  const { advances, totalCount, totalPages, fetchStatus } = useAppSelector(
    (state) => state.purchasingAdvances
  );
  const { suppliers } = useAppSelector((state) => state.suppliers);

  // Pagination & Filter States
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilterOption>('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal & Drawer States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingAdvance, setViewingAdvance] = useState<PurchasingAdvance | null>(null);
  const [editingAdvance, setEditingAdvance] = useState<PurchasingAdvance | null>(null);
  const [cancellingAdvance, setCancellingAdvance] = useState<PurchasingAdvance | null>(null);
  const [deletingAdvance, setDeletingAdvance] = useState<PurchasingAdvance | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Initial load of suppliers
  useEffect(() => {
    if (suppliers.length === 0) {
      dispatch(fetchSuppliers({ pageNumber: 1, pageSize: 100 }));
    }
  }, [dispatch, suppliers.length]);

  // Primary data fetch effect
  useEffect(() => {
    dispatch(
      fetchPurchasingAdvances({
        pageNumber: page,
        pageSize: rowsPerPage,
        supplierId: selectedSupplierId === 'ALL' ? undefined : selectedSupplierId,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
        search: debouncedSearch || undefined,
      })
    );
  }, [
    dispatch,
    page,
    rowsPerPage,
    selectedSupplierId,
    selectedStatus,
    fromDate,
    toDate,
    minAmount,
    maxAmount,
    debouncedSearch,
    refreshKey,
  ]);

  // Periodic polling & tab focus refresh
  useEffect(() => {
    const refreshData = () => {
      dispatch(
        fetchPurchasingAdvances({
          pageNumber: page,
          pageSize: rowsPerPage,
          supplierId: selectedSupplierId === 'ALL' ? undefined : selectedSupplierId,
          status: selectedStatus === 'ALL' ? undefined : selectedStatus,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          minAmount: minAmount ? parseFloat(minAmount) : undefined,
          maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
          search: debouncedSearch || undefined,
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
  }, [
    dispatch,
    page,
    rowsPerPage,
    selectedSupplierId,
    selectedStatus,
    fromDate,
    toDate,
    minAmount,
    maxAmount,
    debouncedSearch,
  ]);

  // Client search filter on items if API search isn't backend-wide
  const displayAdvances = useMemo(() => {
    if (!debouncedSearch) return advances;

    return advances.filter((a) => {
      const idMatch = String(a?.id ?? '').includes(debouncedSearch);
      const supplierMatch = a.supplierName?.toLowerCase().includes(debouncedSearch);
      const notesMatch = a.notes?.toLowerCase().includes(debouncedSearch);
      return idMatch || supplierMatch || notesMatch;
    });
  }, [advances, debouncedSearch]);

  // Calculated metrics
  const activeCount = useMemo(() => {
    return advances.filter((a) => a.status?.toLowerCase() === 'active').length;
  }, [advances]);

  const totalAmountSum = useMemo(() => {
    return advances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  }, [advances]);

  const remainingAmountSum = useMemo(() => {
    return advances.reduce((sum, a) => sum + (Number(a.remainingAmount) || 0), 0);
  }, [advances]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedSupplierId('ALL');
    setSelectedStatus('ALL');
    setFromDate('');
    setToDate('');
    setMinAmount('');
    setMaxAmount('');
    setPage(1);
  };

  const isFiltered =
    !!searchTerm ||
    selectedSupplierId !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    !!fromDate ||
    !!toDate ||
    !!minAmount ||
    !!maxAmount;

  if (!features.enableNewModulesUI) {
    return (
      <ComingSoonPage
        moduleName="Purchase - Advances"
        icon={<Wallet />}
        accentColor="#0B4EA2"
      />
    );
  }

  return (
    <PurchaseLayout>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header with Title, counters & New Advance CTA */}
        <PurchasingAdvancesHeader
          totalCount={totalCount}
          activeCount={activeCount}
          totalAmountSum={totalAmountSum}
          remainingAmountSum={remainingAmountSum}
          onAddClick={() => setIsCreateOpen(true)}
        />

        {/* Filter Toolbar */}
        <PurchasingAdvancesFilters
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
          fromDate={fromDate}
          onFromDateChange={(val) => {
            setFromDate(val);
            setPage(1);
          }}
          toDate={toDate}
          onToDateChange={(val) => {
            setToDate(val);
            setPage(1);
          }}
          minAmount={minAmount}
          onMinAmountChange={(val) => {
            setMinAmount(val);
            setPage(1);
          }}
          maxAmount={maxAmount}
          onMaxAmountChange={(val) => {
            setMaxAmount(val);
            setPage(1);
          }}
          suppliers={suppliers}
          onClearFilters={handleClearFilters}
          isFiltered={isFiltered}
        />

        {/* Advances Table */}
        <PurchasingAdvancesTable
          advances={displayAdvances}
          totalCount={totalCount}
          totalPages={totalPages}
          pageNumber={page}
          pageSize={rowsPerPage}
          isLoading={fetchStatus === 'loading'}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setRowsPerPage(newSize);
            setPage(1);
          }}
          onView={(advance) => setViewingAdvance(advance)}
          onEdit={(advance) => setEditingAdvance(advance)}
          onCancel={(advance) => setCancellingAdvance(advance)}
          onDelete={(advance) => setDeletingAdvance(advance)}
          onCreateClick={() => setIsCreateOpen(true)}
          isFiltered={isFiltered}
        />
      </div>

      {/* Slide-over Drawers & Modals */}
      <CreatePurchasingAdvanceDrawer
        open={isCreateOpen}
        suppliers={suppliers}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleRefresh}
      />

      <AdvanceDetailsDrawer
        advance={viewingAdvance}
        onClose={() => setViewingAdvance(null)}
        onEdit={(advance) => {
          setViewingAdvance(null);
          setEditingAdvance(advance);
        }}
        onCancel={(advance) => {
          setViewingAdvance(null);
          setCancellingAdvance(advance);
        }}
        onDelete={(advance) => {
          setViewingAdvance(null);
          setDeletingAdvance(advance);
        }}
      />

      <EditPurchasingAdvanceModal
        advance={editingAdvance}
        onClose={() => setEditingAdvance(null)}
        onSuccess={handleRefresh}
      />

      <CancelAdvanceModal
        advance={cancellingAdvance}
        onClose={() => setCancellingAdvance(null)}
        onSuccess={handleRefresh}
      />

      <DeleteAdvanceModal
        advance={deletingAdvance}
        onClose={() => setDeletingAdvance(null)}
        onSuccess={handleRefresh}
      />
    </PurchaseLayout>
  );
}
