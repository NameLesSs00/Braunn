import { useEffect, useState, useMemo } from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchTransactions } from '../../../features/Purchasefeatures/supplierFinance/supplierFinanceSlice';
import { fetchSuppliers } from '../../../features/Purchasefeatures/suppliers/suppliersSlice';
import { PurchaseLayout } from '../../../widgets/layout/PurchaseLayout/PurchaseLayout';
import type { SupplierPurchaseListItem } from '../../../models/Purchasemodels/SupplierPurchase';

import { PurchasingTransactionsHeader } from './components/PurchasingTransactionsHeader';
import { PurchasingTransactionsFilters } from './components/PurchasingTransactionsFilters';
import { PurchasingTransactionsTable } from './components/PurchasingTransactionsTable';
import { PurchaseDetailsDrawer } from '../supplierPurchases/components/PurchaseDetailsDrawer';

export function PurchasingTransactionsPage() {
  const dispatch = useAppDispatch();
  const { transactions, totalCount, totalPages, transactionsStatus, error } = useAppSelector(
    (state) => state.supplierFinance
  );
  const { suppliers } = useAppSelector((state) => state.suppliers);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | 'ALL'>('ALL');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('ALL');
  const [selectedTransactionType, setSelectedTransactionType] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Selected Invoice Drawer state
  const [inspectingPurchase, setInspectingPurchase] =
    useState<SupplierPurchaseListItem | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load suppliers for dropdown filter if not already loaded
  useEffect(() => {
    if (suppliers.length === 0) {
      dispatch(fetchSuppliers({ pageNumber: 1, pageSize: 100 }));
    }
  }, [dispatch, suppliers.length]);

  // Fetch transactions
  useEffect(() => {
    dispatch(
      fetchTransactions({
        pageNumber: page,
        pageSize,
        searchTerm: debouncedSearch || undefined,
        supplierId: selectedSupplierId === 'ALL' ? undefined : selectedSupplierId,
        paymentMethod: selectedPaymentMethod === 'ALL' ? undefined : selectedPaymentMethod,
        transactionType: selectedTransactionType === 'ALL' ? undefined : selectedTransactionType,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        amountFrom: minAmount ? parseFloat(minAmount) : undefined,
        amountTo: maxAmount ? parseFloat(maxAmount) : undefined,
      })
    );
  }, [
    dispatch,
    page,
    pageSize,
    debouncedSearch,
    selectedSupplierId,
    selectedPaymentMethod,
    selectedTransactionType,
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
    refreshKey,
  ]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedSupplierId('ALL');
    setSelectedPaymentMethod('ALL');
    setSelectedTransactionType('ALL');
    setDateFrom('');
    setDateTo('');
    setMinAmount('');
    setMaxAmount('');
    setPage(1);
  };

  const isFiltered = Boolean(
    searchTerm.trim() ||
      selectedSupplierId !== 'ALL' ||
      selectedPaymentMethod !== 'ALL' ||
      selectedTransactionType !== 'ALL' ||
      dateFrom ||
      dateTo ||
      minAmount ||
      maxAmount
  );

  // Volume calculations for current view
  const totalVolume = useMemo(() => {
    return transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const cashVolume = useMemo(() => {
    return transactions
      .filter((t) => (t.paymentMethod || '').toLowerCase().includes('cash'))
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const advanceVolume = useMemo(() => {
    return transactions
      .filter(
        (t) =>
          (t.paymentMethod || '').toLowerCase().includes('advance') ||
          (t.transactionType || '').toLowerCase().includes('advance')
      )
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  }, [transactions]);

  // Export CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = [
      'ID',
      'Transaction #',
      'Date',
      'Supplier',
      'Type',
      'Method',
      'PO #',
      'Plan #',
      'Amount',
      'Reference',
      'Notes',
    ];
    const rows = transactions.map((t) => [
      t.id,
      `"${t.transactionNumber || ''}"`,
      `"${t.transactionDate || ''}"`,
      `"${t.supplierName || ''}"`,
      `"${t.transactionType || ''}"`,
      `"${t.paymentMethod || ''}"`,
      t.supplierPurchaseId || '',
      t.installmentPlanId || '',
      t.amount,
      `"${t.referenceNumber || ''}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Inspect invoice
  const handleViewInvoice = (purchaseId: number) => {
    setInspectingPurchase({
      id: purchaseId,
      supplierId: 0,
      supplierName: 'Loading Purchase Order...',
      purchaseDate: '',
      totalAmount: 0,
      paidAmount: 0,
      remainingAmount: 0,
      purchaseStatus: 'Pending',
      paymentStatus: 'Pending',
      notes: '',
    });
  };

  return (
    <PurchaseLayout>
      <div className="space-y-6">
        {/* Header with Consistent KPIs */}
        <PurchasingTransactionsHeader
          totalCount={totalCount}
          totalVolume={totalVolume}
          cashVolume={cashVolume}
          advanceVolume={advanceVolume}
          isLoading={transactionsStatus === 'loading'}
          onRefresh={handleRefresh}
          onExport={handleExportCSV}
        />

        {/* Transient Network Error Banner (e.g. proxy timeout resilience) */}
        {transactionsStatus === 'failed' && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-rose-800">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>
                {error || 'Unable to retrieve transactions from server due to connection timeout.'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 active:scale-[0.98] transition-all self-start sm:self-auto"
            >
              <RotateCw className="h-3 w-3" />
              Retry Connection
            </button>
          </div>
        )}

        {/* Filter Toolbar */}
        <PurchasingTransactionsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          suppliers={suppliers}
          selectedSupplierId={selectedSupplierId}
          onSupplierChange={(id) => {
            setSelectedSupplierId(id);
            setPage(1);
          }}
          selectedPaymentMethod={selectedPaymentMethod}
          onPaymentMethodChange={(m) => {
            setSelectedPaymentMethod(m);
            setPage(1);
          }}
          selectedTransactionType={selectedTransactionType}
          onTransactionTypeChange={(t) => {
            setSelectedTransactionType(t);
            setPage(1);
          }}
          dateFrom={dateFrom}
          onDateFromChange={(d) => {
            setDateFrom(d);
            setPage(1);
          }}
          dateTo={dateTo}
          onDateToChange={(d) => {
            setDateTo(d);
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
          onReset={handleResetFilters}
          isFiltered={isFiltered}
        />

        {/* Transactions Table */}
        <PurchasingTransactionsTable
          transactions={transactions}
          totalCount={totalCount}
          totalPages={totalPages}
          pageNumber={page}
          pageSize={pageSize}
          isLoading={transactionsStatus === 'loading'}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          onViewInvoice={handleViewInvoice}
          isFiltered={isFiltered}
        />
      </div>

      {/* Purchase Details Drawer if user clicks linked PO */}
      <PurchaseDetailsDrawer
        open={Boolean(inspectingPurchase)}
        purchase={inspectingPurchase}
        onClose={() => setInspectingPurchase(null)}
        onReceive={() => {}}
      />
    </PurchaseLayout>
  );
}
export default PurchasingTransactionsPage;
