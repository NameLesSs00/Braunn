import { Eye, Trash2, PackageCheck, Plus, ShoppingCart, CreditCard, Calendar } from 'lucide-react';
import type { SupplierPurchaseListItem } from '../../../../models/Purchasemodels/SupplierPurchase';
import { PurchaseStatusBadge, PaymentStatusBadge } from './PurchaseStatusBadge';
import { PurchasePagination } from '../../../../shared/Purchaseshared/ui/PurchasePagination';

interface SupplierPurchasesTableProps {
  purchases: SupplierPurchaseListItem[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onView: (purchase: SupplierPurchaseListItem) => void;
  onReceive: (purchase: SupplierPurchaseListItem) => void;
  onPay?: (purchase: SupplierPurchaseListItem) => void;
  onDelete: (purchase: SupplierPurchaseListItem) => void;
  onCreateClick: () => void;
  isFiltered: boolean;
}

export function SupplierPurchasesTable({
  purchases,
  totalCount,
  totalPages,
  pageNumber,
  pageSize,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onView,
  onReceive,
  onPay,
  onDelete,
  onCreateClick,
  isFiltered,
}: SupplierPurchasesTableProps) {
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

  // First load full spinner
  if (isLoading && purchases.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B4EA2]/20 border-t-[#0B4EA2]"></div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Top Loading Bar indicator */}
      {isLoading && (
        <div className="absolute inset-x-0 top-0 z-10 h-[3px] overflow-hidden bg-[#0B4EA2]/10">
          <div className="h-full w-1/3 animate-[purchase-loading-bar_1s_ease-in-out_infinite] bg-[#0B4EA2]" />
          <style>{`@keyframes purchase-loading-bar { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
        </div>
      )}

      {/* Table container */}
      <div
        className={`overflow-x-auto transition-opacity duration-200 ${
          isLoading ? 'opacity-60 pointer-events-none' : 'opacity-100'
        }`}
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-slate-500">
                Order #
              </th>
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-slate-500">
                Supplier
              </th>
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-slate-500">
                Purchase Date
              </th>
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-slate-500">
                Payment
              </th>
              <th className="px-6 py-4 text-right text-[12px] font-bold uppercase tracking-wider text-slate-500">
                Total Amount
              </th>
              <th className="px-6 py-4 text-right text-[12px] font-bold uppercase tracking-wider text-slate-500">
                Remaining
              </th>
              <th className="px-6 py-4 text-right text-[12px] font-bold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {purchases.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                    <div className="text-[15px] font-bold text-slate-700">No purchases found</div>
                    <p className="mt-1 text-[13px] text-slate-400">
                      {isFiltered
                        ? 'Try adjusting your search criteria or clearing filters.'
                        : 'Start by creating your first purchase order for restaurant materials.'}
                    </p>
                    {!isFiltered && (
                      <button
                        type="button"
                        onClick={onCreateClick}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#093d80] transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Create Purchase Order
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              purchases.map((purchase) => {
                const isReceived = purchase.purchaseStatus?.toLowerCase() === 'received';
                return (
                  <tr
                    key={purchase.id}
                    className="hover:bg-slate-50/70 transition-colors group text-sm"
                  >
                    {/* Order # */}
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => onView(purchase)}
                        className="font-bold text-[#0B4EA2] hover:underline"
                      >
                        #{purchase.id}
                      </button>
                    </td>

                    {/* Supplier */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-slate-500 shrink-0 text-xs font-bold">
                          {purchase.supplierName?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <span className="font-semibold text-slate-800">
                          {purchase.supplierName || `Supplier #${purchase.supplierId}`}
                        </span>
                      </div>
                    </td>

                    {/* Purchase Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{formatDate(purchase.purchaseDate)}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <PurchaseStatusBadge status={purchase.purchaseStatus} />
                    </td>

                    {/* Payment Status */}
                    <td className="px-6 py-4">
                      <PaymentStatusBadge status={purchase.paymentStatus} />
                    </td>

                    {/* Total Amount */}
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      ${Number(purchase.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    {/* Remaining */}
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`font-semibold ${
                          purchase.remainingAmount > 0
                            ? 'text-amber-600'
                            : 'text-slate-400'
                        }`}
                      >
                        ${Number(purchase.remainingAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => onView(purchase)}
                          title="View order details"
                          className="rounded-lg p-2 text-slate-400 hover:bg-[#EEF4FF] hover:text-[#0B4EA2] transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Pay Invoice */}
                        {onPay && purchase.remainingAmount > 0 && (
                          <button
                            type="button"
                            onClick={() => onPay(purchase)}
                            title="Pay Invoice"
                            className="rounded-lg p-2 text-[#0B4EA2] hover:bg-[#EEF4FF] transition-colors"
                          >
                            <CreditCard className="h-4 w-4" />
                          </button>
                        )}

                        {/* Receive Order */}
                        <button
                          type="button"
                          onClick={() => onReceive(purchase)}
                          disabled={isReceived}
                          title={isReceived ? 'Already received' : 'Receive order'}
                          className={`rounded-lg p-2 transition-colors ${
                            isReceived
                              ? 'text-emerald-500 opacity-40 cursor-not-allowed'
                              : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                          }`}
                        >
                          <PackageCheck className="h-4 w-4" />
                        </button>

                        {/* Delete Order */}
                        <button
                          type="button"
                          onClick={() => onDelete(purchase)}
                          title="Delete purchase order"
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {purchases.length > 0 && (
        <PurchasePagination
          page={pageNumber}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          label="purchases"
          disabled={isLoading}
        />
      )}
    </div>
  );
}
