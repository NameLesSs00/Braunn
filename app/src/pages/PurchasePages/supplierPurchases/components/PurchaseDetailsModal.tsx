import { useEffect } from 'react';
import { X, Calendar, FileText, CheckCircle2, Package } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchSupplierPurchaseDetails } from '../../../../features/Purchasefeatures/supplierPurchases/supplierPurchasesSlice';
import type { SupplierPurchaseListItem } from '../../../../models/Purchasemodels/SupplierPurchase';
import { PurchaseStatusBadge, PaymentStatusBadge } from './PurchaseStatusBadge';

interface PurchaseDetailsModalProps {
  open: boolean;
  purchase: SupplierPurchaseListItem | null;
  onClose: () => void;
  onReceive: (purchase: SupplierPurchaseListItem) => void;
}

export function PurchaseDetailsModal({
  open,
  purchase,
  onClose,
  onReceive,
}: PurchaseDetailsModalProps) {
  const dispatch = useAppDispatch();
  const { selectedPurchaseDetails, detailsStatus } = useAppSelector(
    (state) => state.supplierPurchases
  );

  useEffect(() => {
    if (open && purchase?.id) {
      dispatch(fetchSupplierPurchaseDetails(purchase.id));
    }
  }, [open, purchase?.id, dispatch]);

  if (!open || !purchase) return null;

  const isReceived = purchase.purchaseStatus?.toLowerCase() === 'received';
  const details = selectedPurchaseDetails?.id === purchase.id ? selectedPurchaseDetails : null;
  const items = details?.items ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EEF4FF] text-[#0B4EA2]">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-800">
                  Purchase Order #{purchase.id}
                </h3>
                <PurchaseStatusBadge status={purchase.purchaseStatus} />
                <PaymentStatusBadge status={purchase.paymentStatus} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Vendor: <span className="font-semibold text-slate-600">{purchase.supplierName}</span>
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Order Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Purchase Date
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-sm font-semibold text-slate-700">
                <Calendar className="h-4 w-4 text-[#0B4EA2]" />
                {purchase.purchaseDate || 'N/A'}
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Total Amount
              </span>
              <div className="text-base font-bold text-slate-800 mt-1">
                ${Number(purchase.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3.5">
              <span className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider block">
                Paid Amount
              </span>
              <div className="text-base font-bold text-emerald-700 mt-1">
                ${Number(purchase.paidAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-3.5">
              <span className="text-[11px] font-medium text-amber-600 uppercase tracking-wider block">
                Remaining Balance
              </span>
              <div className="text-base font-bold text-amber-700 mt-1">
                ${Number(purchase.remainingAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Notes Card */}
          {purchase.notes && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                <FileText className="h-3.5 w-3.5" /> Order Notes
              </span>
              <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{purchase.notes}</p>
            </div>
          )}

          {/* Items Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Order Line Items ({items.length})
              </h4>
              {detailsStatus === 'loading' && (
                <span className="text-xs text-slate-400 animate-pulse">Loading items...</span>
              )}
            </div>

            {detailsStatus === 'loading' && items.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-xl border border-slate-100 bg-slate-50">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0B4EA2]/20 border-t-[#0B4EA2]"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                No items recorded for this purchase order.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Item Name</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Unit</th>
                      <th className="px-4 py-3 text-right">Unit Price</th>
                      <th className="px-4 py-3 text-right">Total Price</th>
                      <th className="px-4 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-slate-400 text-xs">{idx + 1}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {item.itemName}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-md bg-[#EEF4FF] px-2 py-0.5 text-xs font-medium text-[#0B4EA2]">
                            {item.departmentType}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{item.unit}</td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          ${Number(item.unitPrice).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">
                          ${Number(item.totalPrice).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {item.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="text-xs text-slate-400">
            {purchase.createdAt && `Created: ${purchase.createdAt}`}
          </div>
          <div className="flex items-center gap-3">
            {!isReceived && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReceive(purchase);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-all active:scale-[0.98]"
              >
                <CheckCircle2 className="h-4 w-4" />
                Receive Order
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
