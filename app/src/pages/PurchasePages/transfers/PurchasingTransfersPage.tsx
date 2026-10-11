import { useEffect, useState, useMemo } from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchTransfers,
  fetchPurchasingInventory,
  fetchRestaurantMaterialRequests,
  fetchRestaurantWarehouses,
  createRestaurantTransfer,
  confirmTransfer,
  cancelTransfer,
  clearSelectedTransfer,
} from '../../../features/Purchasefeatures/inventoryTransfers/inventoryTransfersSlice';
import { PurchaseLayout } from '../../../widgets/layout/PurchaseLayout/PurchaseLayout';
import type {
  InventoryTransfer,
  CreateRestaurantTransferRequest,
} from '../../../models/Purchasemodels/InventoryTransfer';

import { PurchasingTransfersHeader } from './components/PurchasingTransfersHeader';
import { PurchasingTransfersFilters, StatusFilterOption } from './components/PurchasingTransfersFilters';
import { PurchasingTransfersTable } from './components/PurchasingTransfersTable';
import { TransferDetailsDrawer } from './components/TransferDetailsDrawer';
import { CreateTransferModal } from './components/CreateTransferModal';
import { CancelTransferModal } from './components/CancelTransferModal';

export function PurchasingTransfersPage() {
  const dispatch = useAppDispatch();
  const {
    transfers,
    totalCount,
    totalPages,
    status,
    actionStatus,
    purchasingInventory,
    materialRequests,
    warehouses,
    error,
  } = useAppSelector((state) => state.inventoryTransfers);

  // Pagination & Filters State
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilterOption>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modals & Drawers State
  const [activeTransfer, setActiveTransfer] = useState<InventoryTransfer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<InventoryTransfer | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load Lookups on mount
  useEffect(() => {
    dispatch(fetchPurchasingInventory());
    dispatch(fetchRestaurantMaterialRequests());
    dispatch(fetchRestaurantWarehouses());
  }, [dispatch]);

  // Fetch Transfers when params change
  useEffect(() => {
    dispatch(
      fetchTransfers({
        pageNumber: page,
        pageSize,
        departmentType: selectedDepartment !== 'ALL' ? selectedDepartment : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
    );
  }, [dispatch, page, pageSize, selectedDepartment, dateFrom, dateTo]);

  // Compute KPI counts
  const confirmedCount = useMemo(
    () => transfers.filter((t) => t.status?.toLowerCase() === 'confirmed').length,
    [transfers]
  );
  const pendingCount = useMemo(
    () => transfers.filter((t) => t.status?.toLowerCase() === 'pending').length,
    [transfers]
  );
  const cancelledCount = useMemo(
    () => transfers.filter((t) => t.status?.toLowerCase() === 'cancelled').length,
    [transfers]
  );

  // Client-side text & status filter for active page items
  const filteredTransfers = useMemo(() => {
    let list = transfers;

    if (selectedStatus !== 'ALL') {
      list = list.filter(
        (t) => t.status?.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((t) => {
        const idMatch = String(t.id).includes(q);
        const whMatch = t.destinationWarehouseName?.toLowerCase().includes(q);
        const resMatch = t.restaurantName?.toLowerCase().includes(q);
        const notesMatch = t.notes?.toLowerCase().includes(q);
        const itemsMatch = t.items?.some((it) => it.materialName?.toLowerCase().includes(q));
        return idMatch || whMatch || resMatch || notesMatch || itemsMatch;
      });
    }

    return list;
  }, [transfers, selectedStatus, debouncedSearch]);

  const isFiltered = Boolean(
    searchTerm ||
    selectedDepartment !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    dateFrom ||
    dateTo
  );

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedDepartment('ALL');
    setSelectedStatus('ALL');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const handleRefresh = () => {
    dispatch(
      fetchTransfers({
        pageNumber: page,
        pageSize,
        departmentType: selectedDepartment !== 'ALL' ? selectedDepartment : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
    );
  };

  const handleOpenDetails = (transfer: InventoryTransfer) => {
    setActiveTransfer(transfer);
    setIsDrawerOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDrawerOpen(false);
    setActiveTransfer(null);
    dispatch(clearSelectedTransfer());
  };

  const handleConfirmTransfer = async (transfer: InventoryTransfer) => {
    if (window.confirm(`Confirm delivery for transfer #TR-${transfer.id}?`)) {
      await dispatch(confirmTransfer(transfer.id));
      handleRefresh();
      if (activeTransfer && activeTransfer.id === transfer.id) {
        setActiveTransfer({ ...activeTransfer, status: 'Confirmed', confirmedAt: new Date().toISOString() });
      }
    }
  };

  const handleOpenCancel = (transfer: InventoryTransfer) => {
    setCancelTarget(transfer);
  };

  const handleConfirmCancel = async (id: number, reason: string) => {
    await dispatch(cancelTransfer({ id, reason }));
    handleRefresh();
    if (activeTransfer && activeTransfer.id === id) {
      setActiveTransfer({ ...activeTransfer, status: 'Cancelled' });
    }
  };

  const handleCreateSubmit = async (payload: CreateRestaurantTransferRequest) => {
    await dispatch(createRestaurantTransfer(payload)).unwrap();
    handleRefresh();
  };

  return (
    <PurchaseLayout>
      <div className="space-y-6 pb-12">
        {/* Error Alert Banner if connection failed */}
        {error && status === 'failed' && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800 shadow-2xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold">Failed to connect to Inventory API</p>
                <p className="text-xs text-rose-600">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 border border-rose-200 shadow-2xs hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {/* Page Header & Stats Cards */}
        <PurchasingTransfersHeader
          totalCount={totalCount}
          confirmedCount={confirmedCount}
          pendingCount={pendingCount}
          cancelledCount={cancelledCount}
          isLoading={status === 'loading'}
          onRefresh={handleRefresh}
          onCreateTransfer={() => setIsCreateOpen(true)}
        />

        {/* Filters Toolbar */}
        <PurchasingTransfersFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={(dept) => {
            setSelectedDepartment(dept);
            setPage(1);
          }}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
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
          onClearFilters={handleClearFilters}
          isFiltered={isFiltered}
        />

        {/* Transfers Table */}
        <PurchasingTransfersTable
          transfers={filteredTransfers}
          isLoading={status === 'loading'}
          page={page}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={setPage}
          onViewDetails={handleOpenDetails}
          onConfirm={handleConfirmTransfer}
          onCancel={handleOpenCancel}
          onCreateClick={() => setIsCreateOpen(true)}
          isFiltered={isFiltered}
        />

        {/* Drawer for Details */}
        <TransferDetailsDrawer
          open={isDrawerOpen}
          transfer={activeTransfer}
          onClose={handleCloseDetails}
          onConfirm={handleConfirmTransfer}
          onCancel={handleOpenCancel}
        />

        {/* Modal for Creating Transfers */}
        <CreateTransferModal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSubmit}
          purchasingInventory={purchasingInventory}
          materialRequests={materialRequests}
          warehouses={warehouses}
          isSubmitting={actionStatus === 'loading'}
        />

        {/* Modal for Cancelling Transfer */}
        <CancelTransferModal
          open={Boolean(cancelTarget)}
          transfer={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirmCancel={handleConfirmCancel}
          isCancelling={actionStatus === 'loading'}
        />
      </div>
    </PurchaseLayout>
  );
}
