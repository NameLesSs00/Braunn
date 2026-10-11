import { Eye, Edit2, Trash2, Phone, Mail, MapPin, Building2, Plus } from 'lucide-react';
import type { Supplier } from '../../../../models/Purchasemodels/Supplier';
import { DepartmentBadge } from './departmentBadge';
import { PurchasePagination } from '../../../../shared/Purchaseshared/ui/PurchasePagination';

interface SuppliersTableProps {
  suppliers: Supplier[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onAddClick: () => void;
  isFiltered: boolean;
}

export function SuppliersTable({
  suppliers,
  totalCount,
  totalPages,
  pageNumber,
  pageSize,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onView,
  onEdit,
  onDelete,
  onAddClick,
  isFiltered,
}: SuppliersTableProps) {
  // First load full spinner
  if (isLoading && suppliers.length === 0) {
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
                Supplier
              </th>
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-slate-500">
                Contact
              </th>
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-slate-500">
                Address
              </th>
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-slate-500">
                Tax Number
              </th>
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-slate-500">
                Departments
              </th>
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-6 py-4 text-right text-[12px] font-bold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="text-[15px] font-bold text-slate-700">No suppliers found</div>
                    <p className="mt-1 text-[13px] text-slate-400">
                      {isFiltered
                        ? 'Try clearing or adjusting your search filters to find what you are looking for.'
                        : 'Get started by creating your first supplier for purchasing orders.'}
                    </p>
                    {!isFiltered && (
                      <button
                        type="button"
                        onClick={onAddClick}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#093d80] transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Supplier</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => {
                return (
                  <tr
                    key={supplier.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Supplier Name */}
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => onView(supplier)}
                        className="text-[14px] font-bold text-slate-800 hover:text-[#0B4EA2] transition-colors text-left"
                      >
                        {supplier.name}
                      </button>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4 text-[13px] text-slate-600">
                      <div className="space-y-1">
                        {supplier.phone && (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{supplier.phone}</span>
                          </div>
                        )}
                        {supplier.email && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{supplier.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Address */}
                    <td className="px-6 py-4 text-[13px] text-slate-600 max-w-[180px]">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="truncate" title={supplier.address}>
                          {supplier.address || '—'}
                        </span>
                      </div>
                    </td>

                    {/* Tax Number */}
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-[12px] font-mono font-medium text-slate-700 border border-slate-200">
                        {supplier.taxNumber || '—'}
                      </span>
                    </td>

                    {/* Departments */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[260px]">
                        {supplier.departments && supplier.departments.length > 0 ? (
                          supplier.departments.map((dept) => (
                            <DepartmentBadge key={dept} department={dept} />
                          ))
                        ) : (
                          <span className="text-[12px] text-slate-400 italic">None</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${
                          supplier.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            supplier.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        {supplier.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onView(supplier)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-[#EEF4FF] hover:text-[#0B4EA2] transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(supplier)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title="Edit Supplier"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(supplier)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete Supplier"
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
      {totalCount > 0 && (
        <PurchasePagination
          page={pageNumber}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          label="suppliers"
          disabled={isLoading}
        />
      )}
    </div>
  );
}
