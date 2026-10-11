import { useState, useEffect } from 'react';
import {
  X,
  Layers,
  Calendar,
  CreditCard,
  PieChart,
  CheckCircle2,
  Receipt,
  Clock,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchInstallmentPlanById } from '../../../../features/Purchasefeatures/purchasingInstallments/purchasingInstallmentsSlice';
import type {
  InstallmentScheduleItem,
  PurchasingInstallmentListItem,
} from '../../../../models/Purchasemodels/PurchasingInstallment';
import { InstallmentStatusBadge } from './InstallmentStatusBadge';
import { InstallmentPaymentHistoryModal } from './InstallmentPaymentHistoryModal';

interface InstallmentPlanDetailsDrawerProps {
  planId: number | null;
  onClose: () => void;
  onPayInstallment: (installment: PurchasingInstallmentListItem) => void;
}

export function InstallmentPlanDetailsDrawer({
  planId,
  onClose,
  onPayInstallment,
}: InstallmentPlanDetailsDrawerProps) {
  const dispatch = useAppDispatch();
  const { selectedPlan, planStatus } = useAppSelector(
    (state) => state.purchasingInstallments
  );

  const [historyInstallmentId, setHistoryInstallmentId] = useState<number | null>(null);

  useEffect(() => {
    if (planId) {
      dispatch(fetchInstallmentPlanById(planId));
    }
  }, [planId, dispatch]);

  if (!planId) return null;

  const plan = selectedPlan?.planId === planId ? selectedPlan : null;

  const formatDate = (dateStr: string) => {
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

  const totalAmount = plan?.totalAmount || 0;
  const totalPaid = plan?.totalPaid || 0;
  const percentPaid = totalAmount > 0 ? Math.min(100, Math.max(0, (totalPaid / totalAmount) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#0B4EA2]">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    Installment Plan #PLAN-{planId}
                  </h2>
                  {plan && <InstallmentStatusBadge status={plan.status} />}
                </div>
                <p className="text-xs text-slate-500">
                  Vendor: <span className="font-semibold text-slate-800">{plan?.supplierName || 'Loading...'}</span>
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

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {planStatus === 'loading' && !plan ? (
              <div className="py-20 text-center text-xs text-slate-400">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0B4EA2]/20 border-t-[#0B4EA2] mx-auto mb-3" />
                Loading installment plan details...
              </div>
            ) : !plan ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Plan details not found.
              </div>
            ) : (
              <>
                {/* Financial Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">
                      Plan Total
                    </span>
                    <span className="text-base font-black text-slate-900">
                      ${plan.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-3.5">
                    <span className="block text-[10px] font-bold text-[#0B4EA2] uppercase">
                      Down Payment
                    </span>
                    <span className="text-base font-black text-[#0B4EA2]">
                      ${plan.downPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5">
                    <span className="block text-[10px] font-bold text-emerald-600 uppercase">
                      Total Paid
                    </span>
                    <span className="text-base font-black text-emerald-700">
                      ${plan.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-3.5">
                    <span className="block text-[10px] font-bold text-amber-600 uppercase">
                      Remaining
                    </span>
                    <span className="text-base font-black text-amber-700">
                      ${plan.remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <PieChart className="h-4 w-4 text-[#0B4EA2]" />
                      Overall Plan Progress
                    </span>
                    <span className="font-mono font-bold text-[#0B4EA2]">
                      {percentPaid.toFixed(0)}% Settled
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0B4EA2] rounded-full transition-all duration-500"
                      style={{ width: `${percentPaid}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>
                      Settled Installments: <strong>{plan.paidInstallments}</strong>
                    </span>
                    <span>
                      Pending Dues: <strong>{plan.pendingInstallments}</strong>
                    </span>
                  </div>
                </div>

                {/* Plan Meta Information */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-xs space-y-2 shadow-2xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5" />
                      Invoice / Purchase ID:
                    </span>
                    <span className="font-semibold text-slate-800">
                      #{plan.supplierPurchaseId}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Plan Duration:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatDate(plan.startDate)} &mdash; {formatDate(plan.endDate)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Total Installments:</span>
                    <span className="font-semibold text-slate-800">
                      {plan.installments.length} Installments
                    </span>
                  </div>
                </div>

                {/* Schedule Table */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Installment Schedule Breakdown ({plan.installments.length})
                  </h3>

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                        <tr>
                          <th className="px-4 py-3">#</th>
                          <th className="px-4 py-3">Due Date</th>
                          <th className="px-4 py-3 text-right">Amount</th>
                          <th className="px-4 py-3 text-right">Paid</th>
                          <th className="px-4 py-3 text-right">Remaining</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {plan.installments.map((inst: InstallmentScheduleItem) => {
                          const isUnpaid = inst.remainingAmount > 0;
                          return (
                            <tr key={inst.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-mono font-semibold text-[#0B4EA2]">
                                #{inst.installmentNumber}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-slate-700 whitespace-nowrap">
                                {formatDate(inst.dueDate)}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-slate-900">
                                ${inst.amount.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-right font-medium text-emerald-700">
                                ${inst.paidAmount.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-[#0B4EA2]">
                                ${inst.remainingAmount.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <InstallmentStatusBadge status={inst.status} />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="inline-flex items-center justify-center gap-1.5">
                                  {isUnpaid ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onPayInstallment({
                                          id: inst.id,
                                          installmentPlanId: plan.planId,
                                          supplierId: plan.supplierId,
                                          supplierName: plan.supplierName,
                                          installmentNumber: inst.installmentNumber,
                                          dueDate: inst.dueDate,
                                          amount: inst.amount,
                                          paidAmount: inst.paidAmount,
                                          remainingAmount: inst.remainingAmount,
                                          status: inst.status,
                                          isOverdue: false,
                                        })
                                      }
                                      className="inline-flex items-center gap-1 rounded-lg bg-[#EEF4FF] px-2.5 py-1 text-[11px] font-semibold text-[#0B4EA2] hover:bg-[#0B4EA2] hover:text-white transition-colors"
                                    >
                                      <CreditCard className="h-3 w-3" />
                                      Pay
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center justify-center gap-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Settled
                                    </span>
                                  )}

                                  {inst.paidAmount > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => setHistoryInstallmentId(inst.id)}
                                      title="View payment history"
                                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                    >
                                      <Clock className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end border-t border-slate-100 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </aside>
      </div>

      <InstallmentPaymentHistoryModal
        installmentId={historyInstallmentId}
        onClose={() => setHistoryInstallmentId(null)}
      />
    </div>
  );
}
