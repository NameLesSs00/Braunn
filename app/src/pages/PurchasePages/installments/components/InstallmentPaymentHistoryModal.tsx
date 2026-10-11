import { useEffect } from 'react';
import { X, Receipt, Calendar, CreditCard, Clock, Hash, FileText } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchInstallmentWithPayments } from '../../../../features/Purchasefeatures/supplierFinance/supplierFinanceSlice';
import { InstallmentStatusBadge } from './InstallmentStatusBadge';

interface InstallmentPaymentHistoryModalProps {
  installmentId: number | null;
  onClose: () => void;
}

export function InstallmentPaymentHistoryModal({
  installmentId,
  onClose,
}: InstallmentPaymentHistoryModalProps) {
  const dispatch = useAppDispatch();
  const { installmentPaymentsById, installmentDetailsStatus } = useAppSelector(
    (state) => state.supplierFinance
  );

  useEffect(() => {
    if (installmentId) {
      dispatch(fetchInstallmentWithPayments({ id: installmentId }));
    }
  }, [installmentId, dispatch]);

  if (!installmentId) return null;

  const installmentData = installmentPaymentsById[installmentId];
  const isLoading = installmentDetailsStatus === 'loading' && !installmentData;

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

  const getMethodBadgeClass = (method: string) => {
    const m = (method || '').toLowerCase();
    if (m.includes('cash')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (m.includes('bank') || m.includes('transfer')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (m.includes('advance')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (m.includes('check') || m.includes('cheque')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EEF4FF] text-[#0B4EA2]">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>
                    Installment #{installmentData?.planInstallmentNumber ?? installmentData?.installmentNumber ?? installmentId} Payment History
                  </span>
                  {installmentData && <InstallmentStatusBadge status={installmentData.status} />}
                </h3>
                <p className="text-xs text-slate-500">
                  Detailed audit of transactions applied toward this installment
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto space-y-5">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#0B4EA2]/20 border-t-[#0B4EA2] mx-auto mb-2.5" />
                Retrieving installment payment breakdown...
              </div>
            ) : !installmentData ? (
              <div className="py-10 text-center text-xs text-slate-400">
                Failed to load installment payment data.
              </div>
            ) : (
              <>
                {/* Metrics Banner */}
                <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Total Amount
                    </span>
                    <span className="text-sm font-black text-slate-800">
                      ${Number(installmentData.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                      Paid
                    </span>
                    <span className="text-sm font-black text-emerald-700">
                      ${Number(installmentData.paidAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B4EA2] block">
                      Remaining
                    </span>
                    <span className="text-sm font-black text-[#0B4EA2]">
                      ${Number(installmentData.remainingAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Due Date & Notes */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Due Date: <strong>{formatDate(installmentData.dueDate)}</strong></span>
                  </div>
                  {installmentData.notes && (
                    <div className="flex items-center gap-1 text-slate-500 italic">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      <span>{installmentData.notes}</span>
                    </div>
                  )}
                </div>

                {/* Payment Transactions Table */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span>Payment Transactions ({installmentData.payments?.length || 0})</span>
                  </h4>

                  {!installmentData.payments || installmentData.payments.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                      <Receipt className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                      No payments recorded yet for this installment.
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                          <tr>
                            <th className="px-3.5 py-2.5">Txn #</th>
                            <th className="px-3.5 py-2.5">Date</th>
                            <th className="px-3.5 py-2.5">Method</th>
                            <th className="px-3.5 py-2.5">Reference</th>
                            <th className="px-3.5 py-2.5 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {installmentData.payments.map((pmt, idx) => {
                            const pmtId = pmt.transactionId ?? pmt.id ?? idx + 1;
                            const pmtDate = pmt.transactionDate ?? pmt.paymentDate;
                            return (
                              <tr key={pmtId} className="hover:bg-slate-50/50">
                                <td className="px-3.5 py-2.5 font-mono font-medium text-slate-700">
                                  <div className="flex items-center gap-1">
                                    <Hash className="h-3 w-3 text-slate-400" />
                                    <span>{pmt.transactionNumber || `#${pmtId}`}</span>
                                  </div>
                                </td>
                                <td className="px-3.5 py-2.5 text-sm font-medium text-slate-700 whitespace-nowrap">
                                  {formatDate(pmtDate)}
                                </td>
                                <td className="px-3.5 py-2.5">
                                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border ${getMethodBadgeClass(pmt.paymentMethod)}`}>
                                    <CreditCard className="h-2.5 w-2.5" />
                                    {pmt.paymentMethod || 'Unknown'}
                                  </span>
                                </td>
                                <td className="px-3.5 py-2.5 text-slate-500 font-mono text-[11px]">
                                  {pmt.referenceNumber || '—'}
                                </td>
                                <td className="px-3.5 py-2.5 text-right font-bold text-emerald-700">
                                  +${Number(pmt.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/40 px-6 py-3.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
