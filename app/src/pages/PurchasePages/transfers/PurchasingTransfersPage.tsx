import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RotateCw, Package, ArrowRightLeft, Inbox } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchTransfers,
  fetchMainInventory,
  fetchMainInventoryItemById,
  fetchPurchasingInventory,
  fetchRestaurantMaterialRequests,
  fetchRestaurantWarehouses,
  fetchDepartmentRequests,
  createRestaurantTransfer,
  createAdHocTransfer,
  confirmTransfer,
  cancelTransfer,
  clearSelectedTransfer,
  clearSelectedInventoryItem,
  setActiveTab,
} from '../../../features/Purchasefeatures/inventoryTransfers/inventoryTransfersSlice';
import { updateDepartmentRequisitionStatus } from '../../../shared/Purchaseshared/api/inventoryTransfersApi';
import { PurchaseLayout } from '../../../widgets/layout/PurchaseLayout/PurchaseLayout';
import type {
  InventoryTransfer,
  PurchasingInventoryItem,
  CreateRestaurantTransferRequest,
  CreateAdHocTransferRequest,
  UnifiedDepartmentRequest,
} from '../../../models/Purchasemodels/InventoryTransfer';

// Transfers Tab Components
import { PurchasingTransfersHeader } from './components/PurchasingTransfersHeader';
import { PurchasingTransfersFilters, StatusFilterOption } from './components/PurchasingTransfersFilters';
import { PurchasingTransfersTable } from './components/PurchasingTransfersTable';
import { TransferDetailsDrawer } from './components/TransferDetailsDrawer';
import { CreateTransferModal } from './components/CreateTransferModal';
import { CancelTransferModal } from './components/CancelTransferModal';
import { ConfirmTransferModal } from './components/ConfirmTransferModal';

// Stock Tab Components
import { MainInventoryStockHeader } from './components/stock/MainInventoryStockHeader';
import { MainInventoryStockFilters } from './components/stock/MainInventoryStockFilters';
import { MainInventoryStockTable } from './components/stock/MainInventoryStockTable';
import { InventoryItemDetailsDrawer } from './components/stock/InventoryItemDetailsDrawer';

// Department Requisitions Tab Component
import { DepartmentRequestsTable } from './components/DepartmentRequestsTable';

import { toast } from 'sonner';

export function PurchasingTransfersPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    activeTab,
    // Central stock state
    inventoryItems,
    inventoryTotalCount,
    inventoryStatus,
    selectedInventoryItem,
    inventoryDetailStatus,
    // Transfers state
    transfers,
    totalCount,
    totalPages,
    status,
    actionStatus,
    // Lookups
    purchasingInventory,
    materialRequests,
    warehouses,
    departmentRequests,
    departmentRequestsStatus,
    error,
  } = useAppSelector((state) => state.inventoryTransfers);

  // ==========================================
  // STOCK TAB STATE
  // ==========================================
  const [stockPage, setStockPage] = useState(1);
  const [stockPageSize, setStockPageSize] = useState(20);
  const [stockSearch, setStockSearch] = useState('');
  const [debouncedStockSearch, setDebouncedStockSearch] = useState('');
  const [stockPurchaseType, setStockPurchaseType] = useState('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const [selectedStockItem, setSelectedStockItem] = useState<PurchasingInventoryItem | null>(null);
  const [isStockDrawerOpen, setIsStockDrawerOpen] = useState(false);

  // Debounce stock search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedStockSearch(stockSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [stockSearch]);

  // Fetch Main Inventory Stock ONLY when activeTab === 'stock'
  useEffect(() => {
    if (activeTab !== 'stock') return;

    dispatch(
      fetchMainInventory({
        pageNumber: stockPage,
        pageSize: stockPageSize,
        purchaseType: stockPurchaseType !== 'ALL' ? stockPurchaseType : undefined,
        isActive: activeFilter === 'ALL' ? undefined : activeFilter === 'ACTIVE',
        lowStockOnly: lowStockOnly || undefined,
        search: debouncedStockSearch || undefined,
      })
    );
  }, [
    dispatch,
    activeTab,
    stockPage,
    stockPageSize,
    stockPurchaseType,
    activeFilter,
    lowStockOnly,
    debouncedStockSearch,
  ]);

  // Stock KPI counts
  const activeStockCount = useMemo(
    () => inventoryItems.filter((i) => i.isActive).length,
    [inventoryItems]
  );
  const lowStockCount = useMemo(
    () => inventoryItems.filter((i) => Number(i.quantity) <= 5).length,
    [inventoryItems]
  );

  const isStockFiltered = Boolean(
    stockSearch ||
    stockPurchaseType !== 'ALL' ||
    lowStockOnly ||
    activeFilter !== 'ALL'
  );

  const handleResetStockFilters = () => {
    setStockSearch('');
    setDebouncedStockSearch('');
    setStockPurchaseType('ALL');
    setLowStockOnly(false);
    setActiveFilter('ALL');
    setStockPage(1);
  };

  const handleOpenStockDetails = (item: PurchasingInventoryItem) => {
    setSelectedStockItem(item);
    setIsStockDrawerOpen(true);
    dispatch(fetchMainInventoryItemById(item.id));
  };

  const handleCloseStockDetails = () => {
    setIsStockDrawerOpen(false);
    setSelectedStockItem(null);
    dispatch(clearSelectedInventoryItem());
  };

  // ==========================================
  // TRANSFERS TAB STATE
  // ==========================================
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
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
  const [selectedDeptRequest, setSelectedDeptRequest] = useState<UnifiedDepartmentRequest | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<InventoryTransfer | null>(null);
  const [cancelTarget, setCancelTarget] = useState<InventoryTransfer | null>(null);

  // Debounce transfer search
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
    dispatch(fetchRestaurantMaterialRequests({ status: 'Pending' }));
    dispatch(fetchRestaurantWarehouses());
    dispatch(fetchDepartmentRequests());
  }, [dispatch]);

  // Fetch Transfers when on transfers tab or filter changes
  useEffect(() => {
    if (activeTab !== 'transfers') return;
    dispatch(
      fetchTransfers({
        pageNumber: page,
        pageSize,
        departmentType: selectedDepartment !== 'ALL' ? selectedDepartment : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
    );
  }, [dispatch, activeTab, page, pageSize, selectedDepartment, dateFrom, dateTo]);

  // Compute KPI counts for Transfers
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

  // Track material requests that have already been fulfilled by active transfers
  const fulfilledRequestIds = useMemo(() => {
    return new Set(
      transfers
        .filter((t) => t.materialRequestId && t.status?.toLowerCase() !== 'cancelled')
        .map((t) => t.materialRequestId as number)
    );
  }, [transfers]);

  // Open create modal with fresh data
  const handleOpenCreateModal = () => {
    setSelectedDeptRequest(null);
    dispatch(fetchRestaurantMaterialRequests({ status: 'Pending' }));
    dispatch(fetchDepartmentRequests());
    dispatch(fetchPurchasingInventory());
    setIsCreateOpen(true);
  };

  const handleFulfillDeptRequest = (req: UnifiedDepartmentRequest) => {
    setSelectedDeptRequest(req);
    dispatch(fetchPurchasingInventory());
    setIsCreateOpen(true);
  };

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
        const idMatch = String(t?.id ?? '').includes(q);
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

  const handleRefreshTransfers = () => {
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

  const handleOpenConfirm = (transfer: InventoryTransfer) => {
    setConfirmTarget(transfer);
  };

  const handleConfirmTransfer = async (transfer: InventoryTransfer) => {
    try {
      await dispatch(confirmTransfer(transfer.id)).unwrap();
      toast.success(`Transfer #TR-${String(transfer.id).padStart(4, '0')} confirmed successfully!`);
      handleRefreshTransfers();
      dispatch(fetchPurchasingInventory());
      dispatch(fetchDepartmentRequests());
      dispatch(fetchRestaurantMaterialRequests({ status: 'Pending' }));
      if (activeTab === 'stock') {
        dispatch(
          fetchMainInventory({
            pageNumber: stockPage,
            pageSize: stockPageSize,
            purchaseType: stockPurchaseType !== 'ALL' ? stockPurchaseType : undefined,
            isActive: activeFilter === 'ALL' ? undefined : activeFilter === 'ACTIVE',
            lowStockOnly: lowStockOnly || undefined,
            search: debouncedStockSearch || undefined,
          })
        );
      }
      if (activeTransfer && activeTransfer.id === transfer.id) {
        setActiveTransfer({
          ...activeTransfer,
          status: 'Confirmed',
          confirmedAt: new Date().toISOString(),
          confirmedByName: activeTransfer.confirmedByName || 'Current User',
        });
      }
      setConfirmTarget(null);
    } catch (err: any) {
      toast.error(err || 'Failed to confirm transfer delivery');
      throw err;
    }
  };

  const handleOpenCancel = (transfer: InventoryTransfer) => {
    setCancelTarget(transfer);
  };

  const handleConfirmCancel = async (id: number, reason: string) => {
    try {
      await dispatch(cancelTransfer({ id, reason })).unwrap();
      toast.success(`Transfer #TR-${String(id).padStart(4, '0')} cancelled successfully`);
      handleRefreshTransfers();
      dispatch(fetchPurchasingInventory());
      dispatch(fetchDepartmentRequests());
      dispatch(fetchRestaurantMaterialRequests({ status: 'Pending' }));
      if (activeTab === 'stock') {
        dispatch(
          fetchMainInventory({
            pageNumber: stockPage,
            pageSize: stockPageSize,
            purchaseType: stockPurchaseType !== 'ALL' ? stockPurchaseType : undefined,
            isActive: activeFilter === 'ALL' ? undefined : activeFilter === 'ACTIVE',
            lowStockOnly: lowStockOnly || undefined,
            search: debouncedStockSearch || undefined,
          })
        );
      }
      if (activeTransfer && activeTransfer.id === id) {
        setActiveTransfer({ ...activeTransfer, status: 'Cancelled' });
      }
      setCancelTarget(null);
    } catch (err: any) {
      toast.error(err || 'Failed to cancel transfer');
      throw err;
    }
  };

  const handleCreateRestaurantSubmit = async (payload: CreateRestaurantTransferRequest) => {
    try {
      await dispatch(createRestaurantTransfer(payload)).unwrap();
      toast.success('Restaurant inventory transfer created successfully!');
      handleRefreshTransfers();
      dispatch(fetchRestaurantMaterialRequests({ status: 'Pending' }));
      dispatch(fetchDepartmentRequests());
      dispatch(fetchPurchasingInventory());
      if (activeTab === 'stock') {
        dispatch(
          fetchMainInventory({
            pageNumber: stockPage,
            pageSize: stockPageSize,
            purchaseType: stockPurchaseType !== 'ALL' ? stockPurchaseType : undefined,
            isActive: activeFilter === 'ALL' ? undefined : activeFilter === 'ACTIVE',
            lowStockOnly: lowStockOnly || undefined,
            search: debouncedStockSearch || undefined,
          })
        );
      }
      setIsCreateOpen(false);
      setSelectedDeptRequest(null);
    } catch (err: any) {
      toast.error(err || 'Failed to create restaurant transfer');
      throw err;
    }
  };

  const handleCreateAdHocSubmit = async (
    payloads: CreateAdHocTransferRequest[],
    fulfilledRequisition?: { department: string; id: number; referenceCode?: string }
  ) => {
    try {
      for (const payload of payloads) {
        await dispatch(createAdHocTransfer(payload)).unwrap();
      }

      if (fulfilledRequisition) {
        try {
          await updateDepartmentRequisitionStatus(
            fulfilledRequisition.department,
            fulfilledRequisition.id,
            'view'
          );
        } catch (statusErr) {
          console.error('Failed to update requisition status to Viewed:', statusErr);
        }
      }

      toast.success(
        fulfilledRequisition
          ? `Dispatched transfer and marked ${fulfilledRequisition.referenceCode || 'requisition'} as Viewed!`
          : `${payloads.length} material${payloads.length === 1 ? '' : 's'} dispatched to ${
              payloads[0]?.departmentType || 'department'
            } successfully!`
      );
      handleRefreshTransfers();
      dispatch(fetchPurchasingInventory());
      dispatch(fetchDepartmentRequests());
      if (activeTab === 'stock') {
        dispatch(
          fetchMainInventory({
            pageNumber: stockPage,
            pageSize: stockPageSize,
            purchaseType: stockPurchaseType !== 'ALL' ? stockPurchaseType : undefined,
            isActive: activeFilter === 'ALL' ? undefined : activeFilter === 'ACTIVE',
            lowStockOnly: lowStockOnly || undefined,
            search: debouncedStockSearch || undefined,
          })
        );
      }
      setIsCreateOpen(false);
      setSelectedDeptRequest(null);
    } catch (err: any) {
      toast.error(err || 'Failed to create department transfer');
      throw err;
    }
  };

  return (
    <PurchaseLayout>
      <div className="space-y-6 pb-12">
        {/* Navigation Tab Selector */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => dispatch(setActiveTab('stock'))}
            className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'stock'
                ? 'border-[#0B4EA2] text-[#0B4EA2]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Central Stock & Catalog</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                activeTab === 'stock'
                  ? 'bg-blue-100 text-[#0B4EA2]'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {inventoryTotalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => dispatch(setActiveTab('requests'))}
            className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'requests'
                ? 'border-[#0B4EA2] text-[#0B4EA2]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Inbox className="h-4 w-4" />
            <span>Department Requisitions</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                activeTab === 'requests'
                  ? 'bg-blue-100 text-[#0B4EA2]'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {departmentRequests.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => dispatch(setActiveTab('transfers'))}
            className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'transfers'
                ? 'border-[#0B4EA2] text-[#0B4EA2]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>Inventory Transfers Log</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                activeTab === 'transfers'
                  ? 'bg-blue-100 text-[#0B4EA2]'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {totalCount}
            </span>
          </button>
        </div>

        {/* Error Alert Banner if connection failed */}
        {error && (status === 'failed' || inventoryStatus === 'failed') && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800 shadow-2xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold">Inventory API Error</p>
                <p className="text-xs text-rose-600">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={activeTab === 'stock' ? handleResetStockFilters : handleRefreshTransfers}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 border border-rose-200 shadow-2xs hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* ========================================== */}
        {/* VIEW 1: CENTRAL STOCK & CATALOG */}
        {/* ========================================== */}
        {activeTab === 'stock' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Stats Cards */}
            <MainInventoryStockHeader
              totalCount={inventoryTotalCount}
              activeCount={activeStockCount}
              lowStockCount={lowStockCount}
            />

            {/* Filters */}
            <MainInventoryStockFilters
              searchTerm={stockSearch}
              onSearchChange={setStockSearch}
              selectedPurchaseType={stockPurchaseType}
              onPurchaseTypeChange={(val) => {
                setStockPurchaseType(val);
                setStockPage(1);
              }}
              lowStockOnly={lowStockOnly}
              onLowStockToggle={() => {
                setLowStockOnly((prev) => !prev);
                setStockPage(1);
              }}
              activeFilter={activeFilter}
              onActiveFilterChange={(val) => {
                setActiveFilter(val);
                setStockPage(1);
              }}
              onReset={handleResetStockFilters}
              isFiltered={isStockFiltered}
            />

            {/* Stock Items Table */}
            <MainInventoryStockTable
              items={inventoryItems}
              isLoading={inventoryStatus === 'loading'}
              onViewItem={handleOpenStockDetails}
              page={stockPage}
              pageSize={stockPageSize}
              totalCount={inventoryTotalCount}
              onPageChange={setStockPage}
              onPageSizeChange={(newSize) => {
                setStockPageSize(newSize);
                setStockPage(1);
              }}
            />

            {/* Item Details & Stock Movement Ledger Drawer */}
            <InventoryItemDetailsDrawer
              open={isStockDrawerOpen}
              item={selectedStockItem}
              detail={selectedInventoryItem}
              isLoading={inventoryDetailStatus === 'loading'}
              onClose={handleCloseStockDetails}
            />
          </div>
        )}

        {/* ========================================== */}
        {/* VIEW 2: DEPARTMENT REQUISITIONS */}
        {/* ========================================== */}
        {activeTab === 'requests' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <DepartmentRequestsTable
              requests={departmentRequests}
              loading={departmentRequestsStatus === 'loading'}
              onFulfillTransfer={handleFulfillDeptRequest}
              onCreateSupplierPO={() => navigate('/purchasing/supplier-purchases')}
            />
          </div>
        )}

        {/* ========================================== */}
        {/* VIEW 3: INVENTORY TRANSFERS */}
        {/* ========================================== */}
        {activeTab === 'transfers' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Page Header & Stats Cards */}
            <PurchasingTransfersHeader
              totalCount={totalCount}
              confirmedCount={confirmedCount}
              pendingCount={pendingCount}
              cancelledCount={cancelledCount}
              onCreateTransfer={handleOpenCreateModal}
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
              pageSize={pageSize}
              totalCount={totalCount}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
              onViewDetails={handleOpenDetails}
              onConfirm={handleOpenConfirm}
              onCancel={handleOpenCancel}
              onCreateClick={handleOpenCreateModal}
              isFiltered={isFiltered}
            />

            {/* Drawer for Details */}
            <TransferDetailsDrawer
              open={isDrawerOpen}
              transfer={activeTransfer}
              onClose={handleCloseDetails}
              onConfirm={handleOpenConfirm}
              onCancel={handleOpenCancel}
            />

            {/* Modal for Confirming Transfer Delivery */}
            <ConfirmTransferModal
              open={Boolean(confirmTarget)}
              transfer={confirmTarget}
              onClose={() => setConfirmTarget(null)}
              onConfirm={handleConfirmTransfer}
              isConfirming={actionStatus === 'loading'}
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
        )}

        {/* Modal for Creating Transfers - available across all tabs */}
        <CreateTransferModal
          open={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            setSelectedDeptRequest(null);
          }}
          onSubmitRestaurant={handleCreateRestaurantSubmit}
          onSubmitAdHoc={handleCreateAdHocSubmit}
          purchasingInventory={purchasingInventory}
          materialRequests={materialRequests}
          departmentRequests={departmentRequests}
          initialSelectedRequest={selectedDeptRequest}
          warehouses={warehouses}
          isSubmitting={actionStatus === 'loading'}
          fulfilledRequestIds={fulfilledRequestIds}
        />
      </div>
    </PurchaseLayout>
  );
}
