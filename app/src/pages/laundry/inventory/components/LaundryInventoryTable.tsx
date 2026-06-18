import { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft } from 'react-icons/fi';
import { LaundryQuickWithdrawModal } from './modals/LaundryQuickWithdrawModal';
import { LaundryReorderRequestModal } from './modals/LaundryReorderRequestModal';
import type { LaundryInventoryItemReadDto, LaundryItemStatus, LaundryMaintenanceStatus } from '../../../../models/Laundrymodels/LaundryInventoryItem';

interface LaundryInventoryTableProps {
  data: LaundryInventoryItemReadDto[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

function StatusBadge({ status }: { status: LaundryItemStatus }) {
  const styles: Record<LaundryItemStatus, string> = {
    Low: 'bg-red-100 text-red-500',
    Normal: 'bg-blue-100 text-blue-500',
    High: 'bg-orange-100 text-orange-500',
  };
  return (
    <span className={`inline-flex items-center justify-center px-4 py-1 text-[12px] font-medium rounded-full ${styles[status] || styles.Normal}`}>
      {status}
    </span>
  );
}

function MaintenanceBadge({ status }: { status: LaundryMaintenanceStatus }) {
  const styles: Record<LaundryMaintenanceStatus, string> = {
    Available: 'bg-emerald-100 text-emerald-600',
    UnderMaintenance: 'bg-amber-100 text-amber-600',
  };
  return (
    <span className={`inline-flex items-center justify-center px-4 py-1 text-[12px] font-medium rounded-full ${styles[status] || 'bg-slate-100 text-slate-500'}`}>
      {status === 'UnderMaintenance' ? 'Under Maintenance' : status}
    </span>
  );
}

function StockCell({ item }: { item: LaundryInventoryItemReadDto }) {
  const max = item.maximumStock || 1;
  const percent = Math.min((item.quantity / max) * 100, 100);
  const isLow = item.status === 'Low';
  return (
    <div className="flex flex-col gap-1.5 min-w-[90px]">
      <span className="text-[14px] font-bold text-slate-800">
        {item.unitName.toLowerCase()}: {item.quantity}
      </span>
      <div className="h-1.5 w-full rounded-full bg-slate-100">
        <div
          className={`h-1.5 rounded-full ${isLow ? 'bg-red-500' : 'bg-[#0a4bbd]'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function LaundryInventoryTable({
  data,
  totalCount,
  currentPage,
  itemsPerPage,
  onPageChange,
}: LaundryInventoryTableProps) {
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [selectedItemForWithdraw, setSelectedItemForWithdraw] = useState<LaundryInventoryItemReadDto | undefined>(undefined);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [selectedItemForReorder, setSelectedItemForReorder] = useState<LaundryInventoryItemReadDto | undefined>(undefined);

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) onPageChange(page);
  };

  const pages: (number | '...')[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-200">
                {['Item', 'Category', 'Min / Max', 'Status', 'Maintenance', 'Current Stock', 'Actions'].map((col) => (
                  <th
                    key={col}
                    className={`px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wide ${col === 'Actions' ? 'text-center' : ''}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-[14px] text-slate-500">
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5 text-[14px] font-semibold text-slate-800">{item.name}</td>
                    <td className="px-6 py-5 text-[14px] text-slate-500">{item.categoryName}</td>
                    <td className="px-6 py-5 text-[14px] text-slate-500">
                      {item.minimumStock || 0} / {item.maximumStock || 0}
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-5">
                      <MaintenanceBadge status={item.maintenanceStatus} />
                    </td>
                    <td className="px-6 py-5">
                      <StockCell item={item} />
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedItemForWithdraw(item);
                            setWithdrawOpen(true);
                          }}
                          className="px-5 py-2 text-[12px] font-semibold text-white bg-[#0a4bbd] rounded-xl hover:bg-blue-800 transition-colors"
                        >
                          Withdraw
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItemForReorder(item);
                            setReorderOpen(true);
                          }}
                          className={`px-5 py-2 text-[12px] font-semibold text-white rounded-xl transition-colors ${
                            item.status === 'Low'
                              ? 'bg-[#d32f2f] hover:bg-red-700'
                              : 'bg-slate-200 cursor-not-allowed text-slate-400'
                          }`}
                          disabled={item.status !== 'Low'}
                        >
                          Order
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 px-6 py-4 bg-white">
          <span className="text-[13px] text-slate-500">
            Showing {totalCount === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalCount)} of {totalCount} items
          </span>
          <div className="flex items-center -space-x-px mt-4 sm:mt-0">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-slate-300 rounded-l-md bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-50"
            >
              {/* @ts-ignore */}
              <FiChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-slate-300 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-50"
            >
              {/* @ts-ignore */}
              <FiChevronLeft className="w-4 h-4" />
            </button>
            {pages.map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="px-3.5 py-1.5 border border-slate-300 bg-white text-slate-500 text-sm">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => handlePageChange(p as number)}
                  className={`px-3.5 py-1.5 border text-sm font-medium transition-colors ${
                    currentPage === p
                      ? 'border-[#0a4bbd] bg-blue-50 text-[#0a4bbd] z-10'
                      : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-slate-300 rounded-r-md bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50"
            >
              {/* @ts-ignore */}
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <LaundryQuickWithdrawModal
        isOpen={withdrawOpen}
        onClose={() => {
          setWithdrawOpen(false);
          setSelectedItemForWithdraw(undefined);
        }}
        initialItem={selectedItemForWithdraw}
      />
      <LaundryReorderRequestModal
        isOpen={reorderOpen}
        onClose={() => {
          setReorderOpen(false);
          setSelectedItemForReorder(undefined);
        }}
        initialItem={selectedItemForReorder}
      />
    </>
  );
}
