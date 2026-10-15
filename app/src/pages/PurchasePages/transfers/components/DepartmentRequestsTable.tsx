import { useState, useMemo } from 'react';
import {
  Calendar,
  FileSearch,
  Loader2,
  Package,
  Search,
  ShoppingCart,
  ArrowRightLeft,
  Filter,
  X,
} from 'lucide-react';
import type { UnifiedDepartmentRequest } from '../../../../models/Purchasemodels/InventoryTransfer';

interface DepartmentRequestsTableProps {
  requests: UnifiedDepartmentRequest[];
  loading: boolean;
  onFulfillTransfer: (req: UnifiedDepartmentRequest) => void;
  onCreateSupplierPO?: (req: UnifiedDepartmentRequest) => void;
}

export function departmentBadgeClass(dept: string): { bg: string; text: string; border: string; dot: string } {
  switch (dept) {
    case 'Laundry':
      return {
        bg: 'bg-indigo-50',
        text: 'text-indigo-800',
        border: 'border-indigo-200',
        dot: 'bg-indigo-500',
      };
    case 'Housekeeping':
      return {
        bg: 'bg-sky-50',
        text: 'text-sky-800',
        border: 'border-sky-200',
        dot: 'bg-sky-500',
      };
    case 'Maintenance':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-800',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
      };
    case 'Restaurant':
    default:
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      };
  }
}

export function DepartmentRequestsTable({
  requests,
  loading,
  onFulfillTransfer,
  onCreateSupplierPO,
}: DepartmentRequestsTableProps) {
  const [deptFilter, setDeptFilter] = useState<'ALL' | 'Laundry' | 'Housekeeping' | 'Maintenance' | 'Restaurant'>('ALL');
  const [search, setSearch] = useState('');

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (deptFilter !== 'ALL' && r.department !== deptFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesCode = r.referenceCode.toLowerCase().includes(q);
        const matchesRequester = r.requesterName.toLowerCase().includes(q);
        const matchesItem = r.items.some((it) => it.itemName.toLowerCase().includes(q));
        return matchesCode || matchesRequester || matchesItem;
      }
      return true;
    });
  }, [requests, deptFilter, search]);

  return (
    <div className="space-y-4">
      {/* ── Filter Bar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by request #, department, or item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#0B4EA2] focus:bg-white focus:ring-2 focus:ring-[#0B4EA2]/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Department Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Department:
          </span>
          {(['ALL', 'Restaurant', 'Laundry', 'Housekeeping', 'Maintenance'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDeptFilter(d)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                deptFilter === d
                  ? 'bg-[#0B4EA2] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d === 'ALL' ? 'All Departments' : d}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[360px]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Requisition #</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Requester</th>
                <th className="px-5 py-3.5">Required Date</th>
                <th className="px-5 py-3.5">Requested Items</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Fulfillment Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-7 w-7 animate-spin text-[#0B4EA2]" />
                      <span className="text-sm font-semibold">Loading department requisitions...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileSearch className="h-9 w-9 text-slate-300" />
                      <span className="text-base font-bold text-slate-700">
                        No pending requisitions found
                      </span>
                      <span className="text-xs text-slate-400">
                        All department requests have been fulfilled or matched by active inventory transfers.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const badge = departmentBadgeClass(req.department);
                  const formattedDate = req.requiredDate
                    ? new Date(req.requiredDate).toLocaleDateString()
                    : 'Not specified';

                  return (
                    <tr
                      key={`${req.department}-${req.id}`}
                      className="transition-colors hover:bg-slate-50/70 group"
                    >
                      {/* Requisition # */}
                      <td className="px-5 py-4 font-mono font-bold text-slate-900 text-xs">
                        {req.referenceCode}
                      </td>

                      {/* Department */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
                          {req.department}
                        </span>
                      </td>

                      {/* Requester */}
                      <td className="px-5 py-4 text-xs font-medium text-slate-700">
                        {req.requesterName}
                      </td>

                      {/* Required Date */}
                      <td className="px-5 py-4 text-xs font-semibold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Requested Items */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-[#0B4EA2] border border-blue-100">
                            <Package className="h-3 w-3" />
                            <span>
                              {req.itemsCount} {req.itemsCount === 1 ? 'item' : 'items'}
                            </span>
                          </span>

                          {req.items.slice(0, 2).map((it, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-medium inline-flex items-center gap-1"
                            >
                              <span>{it.itemName}</span>
                              <span className="font-semibold text-slate-900">×{it.quantity}</span>
                            </span>
                          ))}

                          {req.items.length > 2 && (
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                              +{req.items.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {req.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onFulfillTransfer(req)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B4EA2] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#093d7e] transition cursor-pointer"
                            title="Dispatch from Central Storage to Department"
                          >
                            <ArrowRightLeft className="h-3.5 w-3.5" />
                            <span>Fulfill via Transfer</span>
                          </button>

                          {onCreateSupplierPO && (
                            <button
                              type="button"
                              onClick={() => onCreateSupplierPO(req)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                              title="Procure from external supplier"
                            >
                              <ShoppingCart className="h-3.5 w-3.5 text-slate-500" />
                              <span>Order from Supplier</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DepartmentRequestsTable;
