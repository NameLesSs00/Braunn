import { Package, Eye, ChevronLeft, ChevronRight, AlertTriangle, Layers } from 'lucide-react';
import type { PurchasingInventoryItem } from '../../../../../models/Purchasemodels/InventoryTransfer';

interface MainInventoryStockTableProps {
  items: PurchasingInventoryItem[];
  isLoading: boolean;
  onViewItem: (item: PurchasingInventoryItem) => void;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
}

export function MainInventoryStockTable({
  items,
  isLoading,
  onViewItem,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: MainInventoryStockTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
      const d = new Date(normalized);
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

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Item #</th>
              <th className="py-3 px-4">Material / SKU Name</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4 text-right">Stock On Hand</th>
              <th className="py-3 px-4 text-center">Unit</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4">Last Modified</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4"><div className="h-4 w-10 bg-slate-200 rounded-md" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-36 bg-slate-200 rounded-md" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-20 bg-slate-200 rounded-md" /></td>
                  <td className="py-4 px-4 text-right"><div className="h-4 w-16 bg-slate-200 rounded-md ml-auto" /></td>
                  <td className="py-4 px-4 text-center"><div className="h-4 w-12 bg-slate-200 rounded-md mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><div className="h-4 w-14 bg-slate-200 rounded-md mx-auto" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-24 bg-slate-200 rounded-md" /></td>
                  <td className="py-4 px-4 text-center"><div className="h-4 w-8 bg-slate-200 rounded-md mx-auto" /></td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="h-8 w-8 text-slate-300 stroke-[1.5]" />
                    <p className="font-semibold text-slate-600">No Inventory Stock Found</p>
                    <p className="text-xs text-slate-400">Try adjusting your filters or search terms.</p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isOutOfStock = Number(item.quantity) <= 0;
                const isLowStock = Number(item.quantity) > 0 && Number(item.quantity) <= 5;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Item ID / SKU */}
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-500 whitespace-nowrap">
                      #{item.id}
                    </td>

                    {/* Material Name */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onViewItem(item)}
                        className="font-bold text-slate-800 hover:text-[#0B4EA2] transition-colors flex items-center gap-2 cursor-pointer text-left"
                      >
                        <div className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-[#0B4EA2] group-hover:bg-[#0B4EA2] group-hover:text-white transition-colors shrink-0">
                          <Layers className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate max-w-[200px]">{item.itemName}</span>
                      </button>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {item.departmentType}
                      </span>
                    </td>

                    {/* Stock On Hand */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-600">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>0</span>
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>{item.quantity}</span>
                          </span>
                        ) : (
                          <span className="font-bold text-slate-900 text-sm">
                            {Number(item.quantity).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Unit */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                        {item.unitSymbol || item.unitName || 'Units'}
                      </span>
                    </td>

                    {/* Active Status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {item.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 border border-slate-200">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Last Modified */}
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(item.modifiedAt || item.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onViewItem(item)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-[#0B4EA2] hover:text-[#0B4EA2] transition-colors cursor-pointer shadow-2xs"
                        title="View Stock Ledger & Recent Movements"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Ledger</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 bg-white">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 outline-none cursor-pointer focus:border-[#0B4EA2]"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>per page</span>
          <span className="text-slate-300">|</span>
          <span>
            Showing <strong className="text-slate-700">{startItem}</strong> - <strong className="text-slate-700">{endItem}</strong> of <strong className="text-slate-700">{totalCount}</strong> items
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold text-slate-700 px-2">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
