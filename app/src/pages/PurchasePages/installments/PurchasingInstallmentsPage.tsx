import { useEffect, useState, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchPurchasingInstallments } from '../../../features/Purchasefeatures/purchasingInstallments/purchasingInstallmentsSlice';
import { fetchSuppliers } from '../../../features/Purchasefeatures/suppliers/suppliersSlice';
import type { PurchasingInstallmentListItem } from '../../../models/Purchasemodels/PurchasingInstallment';
import { PurchaseLayout } from '../../../widgets/layout/PurchaseLayout/PurchaseLayout';
import { ComingSoonPage } from '../../systems/components/ComingSoonPage';
import { features } from '../../../config/features';

import { PurchasingInstallmentsHeader } from './components/PurchasingInstallmentsHeader';
import { PurchasingInstallmentsFilters } from './components/PurchasingInstallmentsFilters';
import { PurchasingInstallmentsTable } from './components/PurchasingInstallmentsTable';
import { PayInstallmentModal } from './components/PayInstallmentModal';
import { InstallmentPlanDetailsDrawer } from './components/InstallmentPlanDetailsDrawer';
import { InstallmentPaymentHistoryModal } from './components/InstallmentPaymentHistoryModal';

export function PurchasingInstallmentsPage() {
  const dispatch = useAppDispatch();
  const { installments, totalCount, totalPages, fetchStatus } = useAppSelector(
    (state) => state.purchasingInstallments
  );
  const { suppliers } = useAppSelector((state) => state.suppliers);

  // Pagination & Filter States
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [dueFrom, setDueFrom] = useState('');
  const [dueTo, setDueTo] = useState('');
  const [showOnlyOverdue, setShowOnlyOverdue] = useState(false);
  const [showOnlyUnpaid, setShowOnlyUnpaid] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal & Drawer States
  const [payingInstallment, setPayingInstallment] =
    useState<PurchasingInstallmentListItem | null>(null);
  const [viewingPlanId, setViewingPlanId] = useState<number | null>(null);
  const [viewingHistoryInstallmentId, setViewingHistoryInstallmentId] = useState<number | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load suppliers if not loaded
  useEffect(() => {
    if (suppliers.length === 0) {
      dispatch(fetchSuppliers({ pageNumber: 1, pageSize: 100 }));
    }
  }, [dispatch, suppliers.length]);

  // Fetch installments
  useEffect(() => {
    dispatch(
      fetchPurchasingInstallments({
        pageNumber: page,
        pageSize: rowsPerPage,
        searchTerm: debouncedSearch || undefined,
        supplierId: selectedSupplierId === 'ALL' ? undefined : selectedSupplierId,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        dueFrom: dueFrom || undefined,
        dueTo: dueTo || undefined,
        showOnlyOverdue: showOnlyOverdue || undefined,
        showOnlyUnpaid: showOnlyUnpaid || undefined,
      })
    );
  }, [
    dispatch,
    page,
    rowsPerPage,
    debouncedSearch,
    selectedSupplierId,
    selectedStatus,
    dueFrom,
    dueTo,
    showOnlyOverdue,
    showOnlyUnpaid,
    refreshKey,
  ]);

  // Periodic polling & tab focus refresh
  useEffect(() => {
    const refreshData = () => {
      dispatch(
        fetchPurchasingInstallments({
          pageNumber: page,
          pageSize: rowsPerPage,
          searchTerm: debouncedSearch || undefined,
          supplierId: selectedSupplierId === 'ALL' ? undefined : selectedSupplierId,
          status: selectedStatus === 'ALL' ? undefined : selectedStatus,
          dueFrom: dueFrom || undefined,
          dueTo: dueTo || undefined,
          showOnlyOverdue: showOnlyOverdue || undefined,
          showOnlyUnpaid: showOnlyUnpaid || undefined,
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
    debouncedSearch,
    selectedSupplierId,
    selectedStatus,
    dueFrom,
    dueTo,
    showOnlyOverdue,
    showOnlyUnpaid,
  ]);

  // Calculated metrics
  const overdueCount = useMemo(() => {
    return installments.filter((i) => i.isOverdue && i.remainingAmount > 0).length;
  }, [installments]);

  const remainingAmountSum = useMemo(() => {
    return installments.reduce((acc, i) => acc + (Number(i.remainingAmount) || 0), 0);
  }, [installments]);

  const paidAmountSum = useMemo(() => {
    return installments.reduce((acc, i) => acc + (Number(i.paidAmount) || 0), 0);
  }, [installments]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedSupplierId('ALL');
    setSelectedStatus('ALL');
    setDueFrom('');
    setDueTo('');
    setShowOnlyOverdue(false);
    setShowOnlyUnpaid(false);
    setPage(1);
  };

  const isFiltered =
    !!searchTerm ||
    selectedSupplierId !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    !!dueFrom ||
    !!dueTo ||
    showOnlyOverdue ||
    showOnlyUnpaid;

  if (!features.enableNewModulesUI) {
    return (
      <ComingSoonPage
        moduleName="Purchase - Installments"
        icon={<Calendar />}
        accentColor="#0B4EA2"
      />
    );
  }

  return (
    <PurchaseLayout>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <PurchasingInstallmentsHeader
          totalCount={totalCount}
          overdueCount={overdueCount}
          remainingAmountSum={remainingAmountSum}
          paidAmountSum={paidAmountSum}
        />

        {/* Filters */}
        <PurchasingInstallmentsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSupplierId={selectedSupplierId}
          onSupplierChange={(id) => {
            setSelectedSupplierId(id);
            setPage(1);
          }}
          selectedStatus={selectedStatus}
          onStatusChange={(status) => {
            setSelectedStatus(status);
            setPage(1);
          }}
          dueFrom={dueFrom}
          onDueFromChange={(val) => {
            setDueFrom(val);
            setPage(1);
          }}
          dueTo={dueTo}
          onDueToChange={(val) => {
            setDueTo(val);
            setPage(1);
          }}
          showOnlyOverdue={showOnlyOverdue}
          onShowOnlyOverdueChange={(val) => {
            setShowOnlyOverdue(val);
            setPage(1);
          }}
          showOnlyUnpaid={showOnlyUnpaid}
          onShowOnlyUnpaidChange={(val) => {
            setShowOnlyUnpaid(val);
            setPage(1);
          }}
          suppliers={suppliers}
          onClearFilters={handleClearFilters}
          isFiltered={isFiltered}
        />

        {/* Table */}
        <PurchasingInstallmentsTable
          installments={installments}
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
          onPay={(inst) => setPayingInstallment(inst)}
          onViewPlan={(planId) => setViewingPlanId(planId)}
          onViewHistory={(id) => setViewingHistoryInstallmentId(id)}
          isFiltered={isFiltered}
        />
      </div>

      {/* Pay Installment Modal */}
      <PayInstallmentModal
        installment={payingInstallment}
        onClose={() => setPayingInstallment(null)}
        onSuccess={handleRefresh}
      />

      {/* Installment Plan Details Drawer */}
      <InstallmentPlanDetailsDrawer
        planId={viewingPlanId}
        onClose={() => setViewingPlanId(null)}
        onPayInstallment={(inst) => {
          setViewingPlanId(null);
          setPayingInstallment(inst);
        }}
      />

      {/* Installment Payment History Modal */}
      <InstallmentPaymentHistoryModal
        installmentId={viewingHistoryInstallmentId}
        onClose={() => setViewingHistoryInstallmentId(null)}
      />
    </PurchaseLayout>
  );
}
