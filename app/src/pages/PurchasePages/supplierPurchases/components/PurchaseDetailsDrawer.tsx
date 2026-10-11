import { useEffect, useState, useMemo } from 'react';
import {
  X,
  Calendar,
  CheckCircle2,
  Search,
  Building2,
  Receipt,
  CreditCard,
  Layers,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchSupplierPurchaseDetails } from '../../../../features/Purchasefeatures/supplierPurchases/supplierPurchasesSlice';
import { fetchPurchasePaymentSummary } from '../../../../features/Purchasefeatures/supplierFinance/supplierFinanceSlice';
import { supplierFinanceApi } from '../../../../shared/Purchaseshared/api/supplierFinanceApi';
import type { SupplierPurchaseListItem } from '../../../../models/Purchasemodels/SupplierPurchase';
import type { FinanceTransactionListItem } from '../../../../models/Purchasemodels/SupplierFinance';
import { PurchaseStatusBadge, PaymentStatusBadge } from './PurchaseStatusBadge';
import { InstallmentStatusBadge } from '../../installments/components/InstallmentStatusBadge';
import { InstallmentPaymentHistoryModal } from '../../installments/components/InstallmentPaymentHistoryModal';

interface PurchaseDetailsDrawerProps {
  open: boolean;
  purchase: SupplierPurchaseListItem | null;
  onClose: () => void;
  onReceive: (purchase: SupplierPurchaseListItem) => void;
  onPay?: (purchase: SupplierPurchaseListItem) => void;
}

export function PurchaseDetailsDrawer({
  open,
  purchase,
  onClose,
  onReceive,
  onPay,
}: PurchaseDetailsDrawerProps) {
  const dispatch = useAppDispatch();
  const { selectedPurchaseDetails, detailsStatus } = useAppSelector(
    (state) => state.supplierPurchases
  );
  const { paymentSummariesByPurchaseId, summaryStatus } = useAppSelector(
    (state) => state.supplierFinance
  );

  const [activeTab, setActiveTab] = useState<'items' | 'finance'>('items');
  const [itemSearch, setItemSearch] = useState('');
  const [historyInstallmentId, setHistoryInstallmentId] = useState<number | null>(null);

  // Audit Journal state (on-demand)
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [auditTransactions, setAuditTransactions] = useState<FinanceTransactionListItem[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    if (open && purchase?.id) {
      dispatch(fetchSupplierPurchaseDetails(purchase.id));
      // Pre-warm payment summary cache with a single call (does not fetch if cached)
      dispatch(fetchPurchasePaymentSummary({ supplierPurchaseId: purchase.id }));
      setItemSearch('');
      setShowAuditLog(false);
      setAuditTransactions([]);
    }
  }, [open, purchase?.id, dispatch]);

  // Load audit transactions only when user clicks accordion
  const handleToggleAudit = async () => {
    if (!showAuditLog && purchase?.id && auditTransactions.length === 0) {
      setLoadingAudit(true);
      try {
        const res = await supplierFinanceApi.getTransactions({
          supplierPurchaseId: purchase.id,
          pageSize: 50,
        });
        setAuditTransactions(res.data || res.items || []);
      } catch (err) {
        console.error('Failed to load transaction audit log', err);
      } finally {
        setLoadingAudit(false);
      }
    }
    setShowAuditLog((prev) => !prev);
  };

  const handleRefreshSummary = () => {
    if (purchase?.id) {
      dispatch(fetchPurchasePaymentSummary({ supplierPurchaseId: purchase.id, forceRefresh: true }));
    }
  };

  const isReceived = purchase?.purchaseStatus?.toLowerCase() === 'received';
  const details = selectedPurchaseDetails?.id === purchase?.id ? selectedPurchaseDetails : null;
  const items = details?.items ?? [];
  const summary = purchase?.id ? paymentSummariesByPurchaseId[purchase.id] : undefined;

  // Filter items in the invoice (unconditional hook call)
  const filteredItems = useMemo(() => {
    if (!itemSearch.trim()) return items;
    const q = itemSearch.toLowerCase();
    return items.filter(
      (itm) =>
        itm.itemName?.toLowerCase().includes(q) ||
        itm.unit?.toLowerCase().includes(q) ||
        itm.notes?.toLowerCase().includes(q)
    );
  }, [items, itemSearch]);

  if (!open || !purchase) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Payment Breakdown Percentages
  const invTotal = summary ? summary.invoiceTotal : Number(purchase.totalAmount || 0);
  const advPaid = summary ? summary.advanceUsed : 0;
  const cshPaid = summary ? summary.cashPaid : 0;
  const instPaid = summary ? summary.installmentsPaid : 0;
  const remBalance = summary ? summary.remainingBalance : Number(purchase.remainingAmount || 0);

  const advPercent = invTotal > 0 ? (advPaid / invTotal) * 100 : 0;
  const cshPercent = invTotal > 0 ? (cshPaid / invTotal) * 100 : 0;
  const instPercent = invTotal > 0 ? (instPaid / invTotal) * 100 : 0;
  const remPercent = invTotal > 0 ? (remBalance / invTotal) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-over Container */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside className="flex w-screen max-w-3xl flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-white">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#EEF4FF] text-[#0B4EA2]">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-800">
                    Purchase Invoice #{purchase.id}
                  </h2>
                  <PurchaseStatusBadge status={purchase.purchaseStatus} />
                  <PaymentStatusBadge status={purchase.paymentStatus} />
                </div>
                <p className="text-xs text-slate-400">
                  Vendor: <span className="font-semibold text-slate-700">{purchase.supplierName}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/75 px-6">
            <button
              type="button"
              onClick={() => setActiveTab('items')}
              className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-bold transition-colors ${
                activeTab === 'items'
                  ? 'border-[#0B4EA2] text-[#0B4EA2]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Receipt className="h-4 w-4" />
              <span>Order Items ({items.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('finance')}
              className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-bold transition-colors ${
                activeTab === 'finance'
                  ? 'border-[#0B4EA2] text-[#0B4EA2]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Payment Breakdown & Financing</span>
              {summary && summary.installments && summary.installments.length > 0 && (
                <span className="rounded-full bg-[#EEF4FF] px-2 py-0.5 text-[10px] text-[#0B4EA2]">
                  {summary.paidInstallments}/{summary.totalInstallments} Inst.
                </span>
              )}
            </button>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Vendor & General Order Info */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Building2 className="h-4 w-4 text-[#0B4EA2]" />
                  <span>{purchase.supplierName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>{formatDate(purchase.purchaseDate)}</span>
                </div>
              </div>

              {purchase.notes && (
                <div className="pt-1 text-xs">
                  <span className="font-semibold text-slate-600 block mb-0.5">Order Notes:</span>
                  <p className="text-slate-500 whitespace-pre-wrap">{purchase.notes}</p>
                </div>
              )}
            </div>

            {/* TAB 1: ORDER ITEMS BREAKDOWN */}
            {activeTab === 'items' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                      Line Items Breakdown ({items.length})
                    </h3>
                    <p className="text-xs text-slate-400">
                      All restaurant inventory materials included in this purchase
                    </p>
                  </div>

                  {items.length > 2 && (
                    <div className="relative w-full sm:w-56">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                        placeholder="Filter items..."
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:border-[#0B4EA2] focus:bg-white focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {detailsStatus === 'loading' && items.length === 0 ? (
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#0B4EA2]/20 border-t-[#0B4EA2]"></div>
                  </div>
                ) : items.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                    No line items recorded for this purchase order.
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center text-xs text-slate-400">
                    No items matching &ldquo;{itemSearch}&rdquo;
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                        <tr>
                          <th className="px-4 py-3">#</th>
                          <th className="px-4 py-3">Material Name</th>
                          <th className="px-4 py-3">Unit</th>
                          <th className="px-4 py-3 text-right">Quantity</th>
                          <th className="px-4 py-3 text-right">Unit Price</th>
                          <th className="px-4 py-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredItems.map((itm, idx) => (
                          <tr key={itm.id || idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 text-slate-400">{idx + 1}</td>
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              <div>{itm.itemName}</div>
                              {itm.notes && (
                                <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                                  {itm.notes}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                {itm.unit}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-slate-700">
                              {itm.quantity}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-600">
                              ${Number(itm.unitPrice).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-slate-900">
                              ${Number(itm.totalPrice).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PAYMENT BREAKDOWN & FINANCING */}
            {activeTab === 'finance' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                      Unified Financial Breakdown
                    </h3>
                    <p className="text-xs text-slate-400">
                      Consolidated settlement across advance allocations, direct cash, and installment schedules
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRefreshSummary}
                    disabled={summaryStatus === 'loading'}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${summaryStatus === 'loading' ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {summaryStatus === 'loading' && !summary ? (
                  <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#0B4EA2]/20 border-t-[#0B4EA2]"></div>
                  </div>
                ) : (
                  <>
                    {/* Financial Metrics Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Invoice Total
                        </span>
                        <div className="text-base font-black text-slate-800 mt-1">
                          ${invTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-3.5">
                        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                          Advance Deducted
                        </span>
                        <div className="text-base font-black text-purple-700 mt-1">
                          ${advPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                          Direct Cash Paid
                        </span>
                        <div className="text-base font-black text-emerald-700 mt-1">
                          ${cshPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-3.5">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                          Installments Paid
                        </span>
                        <div className="text-base font-black text-blue-700 mt-1">
                          ${instPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    {/* Total Paid vs Balance Progress Bar */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">Settlement Progress</span>
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            ${(summary ? summary.totalPaid : Number(purchase.paidAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })} Paid
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400">Outstanding: </span>
                          <strong className="text-amber-700">
                            ${remBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </strong>
                        </div>
                      </div>

                      {/* Multi-segment Progress Bar */}
                      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 flex">
                        {advPercent > 0 && (
                          <div
                            style={{ width: `${advPercent}%` }}
                            className="bg-purple-500 transition-all duration-300"
                            title={`Advance: $${advPaid.toFixed(2)} (${advPercent.toFixed(1)}%)`}
                          />
                        )}
                        {cshPercent > 0 && (
                          <div
                            style={{ width: `${cshPercent}%` }}
                            className="bg-emerald-500 transition-all duration-300"
                            title={`Cash: $${cshPaid.toFixed(2)} (${cshPercent.toFixed(1)}%)`}
                          />
                        )}
                        {instPercent > 0 && (
                          <div
                            style={{ width: `${instPercent}%` }}
                            className="bg-blue-500 transition-all duration-300"
                            title={`Installments: $${instPaid.toFixed(2)} (${instPercent.toFixed(1)}%)`}
                          />
                        )}
                        {remPercent > 0 && (
                          <div
                            style={{ width: `${remPercent}%` }}
                            className="bg-slate-200 transition-all duration-300"
                            title={`Remaining: $${remBalance.toFixed(2)} (${remPercent.toFixed(1)}%)`}
                          />
                        )}
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                          <span>Advance ({advPercent.toFixed(1)}%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                          <span>Direct Cash ({cshPercent.toFixed(1)}%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                          <span>Installments ({instPercent.toFixed(1)}%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                          <span>Remaining ({remPercent.toFixed(1)}%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Embedded Installment Schedule (0 extra network calls!) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                          <Layers className="h-4 w-4 text-[#0B4EA2]" />
                          <span>Installment Financing Schedule</span>
                          {summary?.activeInstallmentPlanId && (
                            <span className="rounded bg-[#EEF4FF] px-2 py-0.5 text-[10px] font-mono text-[#0B4EA2]">
                              Plan #{summary.activeInstallmentPlanId}
                            </span>
                          )}
                        </h4>
                        {summary?.installments && summary.installments.length > 0 && (
                          <span className="text-xs text-slate-500">
                            {summary.paidInstallments} of {summary.totalInstallments} settled
                          </span>
                        )}
                      </div>

                      {!summary?.installments || summary.installments.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                          <Wallet className="h-7 w-7 mx-auto text-slate-300 mb-1.5" />
                          No active installment schedule for this purchase order.
                        </div>
                      ) : (
                        <div className="overflow-hidden rounded-2xl border border-slate-200">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                              <tr>
                                <th className="px-3.5 py-2.5">#</th>
                                <th className="px-3.5 py-2.5">Due Date</th>
                                <th className="px-3.5 py-2.5 text-right">Amount</th>
                                <th className="px-3.5 py-2.5 text-right">Paid</th>
                                <th className="px-3.5 py-2.5 text-right">Balance</th>
                                <th className="px-3.5 py-2.5 text-center">Status</th>
                                <th className="px-3.5 py-2.5 text-center">History</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {summary.installments.map((inst) => (
                                <tr key={inst.id} className="hover:bg-slate-50/50">
                                  <td className="px-3.5 py-2.5 font-mono font-semibold text-[#0B4EA2]">
                                    #{inst.installmentNumber}
                                  </td>
                                  <td className="px-3.5 py-2.5 text-slate-600">
                                    {formatDate(inst.dueDate)}
                                  </td>
                                  <td className="px-3.5 py-2.5 text-right font-bold text-slate-900">
                                    ${Number(inst.amount).toFixed(2)}
                                  </td>
                                  <td className="px-3.5 py-2.5 text-right font-medium text-emerald-700">
                                    ${Number(inst.paidAmount).toFixed(2)}
                                  </td>
                                  <td className="px-3.5 py-2.5 text-right font-bold text-[#0B4EA2]">
                                    ${Number(inst.remainingAmount).toFixed(2)}
                                  </td>
                                  <td className="px-3.5 py-2.5 text-center">
                                    <InstallmentStatusBadge
                                      status={inst.status}
                                      isOverdue={inst.isOverdue}
                                    />
                                  </td>
                                  <td className="px-3.5 py-2.5 text-center">
                                    {inst.paidAmount > 0 ? (
                                      <button
                                        type="button"
                                        onClick={() => setHistoryInstallmentId(inst.id)}
                                        title="View payment transactions"
                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                      >
                                        <Clock className="h-3 w-3 text-slate-400" />
                                        Audit
                                      </button>
                                    ) : (
                                      <span className="text-[10px] text-slate-300">—</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* On-Demand Transactions Audit Trail Accordion */}
                    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={handleToggleAudit}
                        className="w-full flex items-center justify-between p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-[#0B4EA2]" />
                          <span className="text-xs font-bold text-slate-800">
                            Invoice Transactions Audit Log
                          </span>
                          {auditTransactions.length > 0 && (
                            <span className="rounded-full bg-[#EEF4FF] px-2 py-0.5 text-[10px] font-bold text-[#0B4EA2]">
                              {auditTransactions.length}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <span className="text-[11px]">
                            {showAuditLog ? 'Collapse' : 'Expand'}
                          </span>
                          {showAuditLog ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </button>

                      {showAuditLog && (
                        <div className="p-4 border-t border-slate-200 space-y-3">
                          {loadingAudit ? (
                            <div className="py-6 text-center text-xs text-slate-400">
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0B4EA2]/20 border-t-[#0B4EA2] mx-auto mb-2" />
                              Loading transaction journal...
                            </div>
                          ) : auditTransactions.length === 0 ? (
                            <div className="py-4 text-center text-xs text-slate-400">
                              No financial transactions found for this invoice.
                            </div>
                          ) : (
                            <div className="overflow-hidden rounded-xl border border-slate-200">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                                  <tr>
                                    <th className="px-3 py-2">Txn #</th>
                                    <th className="px-3 py-2">Date</th>
                                    <th className="px-3 py-2">Method</th>
                                    <th className="px-3 py-2">Type</th>
                                    <th className="px-3 py-2 text-right">Amount</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {auditTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50/50">
                                      <td className="px-3 py-2 font-mono text-slate-700">
                                        #{tx.transactionNumber || tx.id}
                                      </td>
                                      <td className="px-3 py-2 text-slate-600">
                                        {formatDate(tx.transactionDate)}
                                      </td>
                                      <td className="px-3 py-2 text-slate-600">
                                        {tx.paymentMethod || '—'}
                                      </td>
                                      <td className="px-3 py-2">
                                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                                          {tx.transactionType || 'Payment'}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-right font-bold text-emerald-700">
                                        ${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Drawer Sticky Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4">
            <div className="text-xs text-slate-400">
              {purchase.createdAt && `Created: ${purchase.createdAt}`}
            </div>
            <div className="flex items-center gap-3">
              {onPay && remBalance > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onPay(purchase);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B4EA2] px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#093d80] active:scale-[0.98] transition-all"
                >
                  <CreditCard className="h-4 w-4" />
                  Pay Invoice
                </button>
              )}
              {!isReceived && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onReceive(purchase);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-[0.98] transition-all"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Received
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* On-demand Installment Payment History Modal */}
      <InstallmentPaymentHistoryModal
        installmentId={historyInstallmentId}
        onClose={() => setHistoryInstallmentId(null)}
      />
    </div>
  );
}
