import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../shared/apis/hooks';
import {
  fetchHkmPurchases,
  markHkmPurchaseAsReceived,
  setPurchasesPage,
} from '../../../../features/HKfeatures/hkmPurchases/hkmPurchasesSlice';
import type { HkmPurchaseReadDto } from '../../../../models/HKmodels/HkmPurchase';

// ─── Status helpers ──────────────────────────────────────────────────────────

type DisplayStatus = 'In Transit' | 'Received' | 'Pending' | 'Cancelled';

function normalizeStatus(raw?: string): DisplayStatus {
  switch ((raw ?? '').toLowerCase()) {
    case 'intransit':
    case 'in transit':
      return 'In Transit';
    case 'received':
    case 'receved': // Backend typo support
      return 'Received';
    case 'cancelled':
    case 'canceled':
      return 'Cancelled';
    case 'pending':
      return 'Pending';
    default:
      return 'Pending';
  }
}

const statusStyles: Record<DisplayStatus, string> = {
  'In Transit': 'bg-amber-100 text-amber-700 border border-amber-200',
  Pending:      'bg-blue-100 text-blue-700 border border-blue-200',
  Received:     'bg-emerald-100 text-emerald-700 border border-emerald-200',
  Cancelled:    'bg-slate-100 text-slate-500 border border-slate-200',
};

function StatusBadge({ raw }: { raw?: string }) {
  const label = normalizeStatus(raw);
  return (
    <span className={`inline-flex items-center px-3 py-0.5 text-[12px] font-semibold rounded-full ${statusStyles[label]}`}>
      {label}
    </span>
  );
}

// ─── Purchase Card ────────────────────────────────────────────────────────────

interface PurchaseCardProps {
  purchase: HkmPurchaseReadDto;
  onMarkReceived: (id: number) => void;
  isUpdating: boolean;
}

function PurchaseCard({ purchase, onMarkReceived, isUpdating }: PurchaseCardProps) {
  const status = normalizeStatus(purchase.status);
  const canReceive = status === 'In Transit' || status === 'Pending';

  const itemSummary = purchase.purchaseItems
    .map((i) => `${i.itemName ?? `Item #${i.itemId}`} ×${i.quantity}`)
    .join(', ');

  const formattedDate = purchase.date
    ? new Date(purchase.date).toLocaleDateString()
    : purchase.createdAt
    ? new Date(purchase.createdAt).toLocaleDateString()
    : '—';

  return (
    <div className="bg-white rounded-xl border border-slate-200 px-6 py-5 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      {/* Left content */}
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[15px] font-bold text-slate-800">
            {purchase.supplierName}
          </span>
          <StatusBadge raw={purchase.status} />
        </div>

        {/* Items */}
        {itemSummary && (
          <p className="text-[13px] text-slate-500 truncate" title={itemSummary}>
            {itemSummary}
          </p>
        )}

        {/* Metadata row */}
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <p className="text-[12px] text-slate-400 mb-0.5">Items Count</p>
            <p className="text-[13px] font-bold text-slate-700">{purchase.purchaseItems.length}</p>
          </div>
          <div>
            <p className="text-[12px] text-slate-400 mb-0.5">Created By</p>
            <p className="text-[13px] font-bold text-slate-700">{purchase.createdBy || '—'}</p>
          </div>
          <div>
            <p className="text-[12px] text-slate-400 mb-0.5">Date</p>
            <p className="text-[13px] font-bold text-slate-700">{formattedDate}</p>
          </div>
          {purchase.notes && (
            <div>
              <p className="text-[12px] text-slate-400 mb-0.5">Notes</p>
              <p className="text-[13px] font-bold text-slate-700">{purchase.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA Button */}
      {canReceive && (
        <div className="flex-shrink-0 self-center">
          <button
            disabled={isUpdating}
            onClick={() => onMarkReceived(purchase.id)}
            className="px-5 py-2.5 text-[13px] font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Mark as Received'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export function PurchaseRequestsTab() {
  const dispatch = useAppDispatch();
  const { items, totalCount, status, params } = useAppSelector((state) => state.hkmPurchases);

  useEffect(() => {
    dispatch(fetchHkmPurchases(params));
  }, [dispatch, params]);

  const handleMarkReceived = (id: number) => {
    dispatch(markHkmPurchaseAsReceived(id));
  };

  const handlePageChange = (page: number) => {
    dispatch(setPurchasesPage(page));
  };

  const isLoading = status === 'loading';
  const totalPages = Math.ceil(totalCount / (params.PageSize ?? 10));
  const currentPage = params.PageNumber ?? 1;

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <h2 className="text-[16px] font-bold text-[#0B4EA2]">Purchase Requests</h2>

      {isLoading && items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-400 text-[14px]">
          Loading purchase requests...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-400 text-[14px]">
          No purchase requests found.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((purchase) => (
            <PurchaseCard
              key={purchase.id}
              purchase={purchase}
              onMarkReceived={handleMarkReceived}
              isUpdating={isLoading}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-4 py-2 text-[13px] font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-[13px] text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-4 py-2 text-[13px] font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
