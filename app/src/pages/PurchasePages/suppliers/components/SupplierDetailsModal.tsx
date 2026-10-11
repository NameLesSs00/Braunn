import { X, Building2, Phone, Mail, MapPin, FileText, Calendar, UserCheck } from 'lucide-react';
import { Modal } from '../../../../shared/ui/Modal';
import type { Supplier } from '../../../../models/Purchasemodels/Supplier';
import { DepartmentBadge } from './departmentBadge';

interface SupplierDetailsModalProps {
  open: boolean;
  supplier: Supplier | null;
  onClose: () => void;
  onEdit: (supplier: Supplier) => void;
}

export function SupplierDetailsModal({
  open,
  supplier,
  onClose,
  onEdit,
}: SupplierDetailsModalProps) {
  if (!supplier) return null;

  const initial = supplier.name ? supplier.name.charAt(0).toUpperCase() : '?';

  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="w-[520px] max-w-[95vw] overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-[#0B4EA2] to-[#1e6cd4] p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/90 hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white text-2xl font-bold text-[#0B4EA2] shadow-md">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold truncate leading-tight">{supplier.name}</h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                    supplier.isActive
                      ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30'
                      : 'bg-white/20 text-white/80 border border-white/20'
                  }`}
                >
                  {supplier.isActive ? 'Active Supplier' : 'Inactive'}
                </span>
                <span className="text-[12px] text-white/80">ID: #{supplier.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Departments */}
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Supplied Departments
            </h3>
            <div className="flex flex-wrap gap-2">
              {supplier.departments && supplier.departments.length > 0 ? (
                supplier.departments.map((dept) => (
                  <DepartmentBadge key={dept} department={dept} />
                ))
              ) : (
                <span className="text-[13px] text-slate-400 italic">No departments assigned</span>
              )}
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-3">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
              Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 text-[13px] text-slate-700">
                <Phone className="h-4 w-4 text-[#0B4EA2] shrink-0" />
                <span className="truncate">{supplier.phone || 'N/A'}</span>
              </div>

              <div className="flex items-center gap-2.5 text-[13px] text-slate-700">
                <Mail className="h-4 w-4 text-[#0B4EA2] shrink-0" />
                <span className="truncate">{supplier.email || 'N/A'}</span>
              </div>

              <div className="flex items-center gap-2.5 text-[13px] text-slate-700 sm:col-span-2">
                <MapPin className="h-4 w-4 text-[#0B4EA2] shrink-0" />
                <span className="truncate">{supplier.address || 'N/A'}</span>
              </div>

              <div className="flex items-center gap-2.5 text-[13px] text-slate-700 sm:col-span-2">
                <Building2 className="h-4 w-4 text-[#0B4EA2] shrink-0" />
                <span>
                  Tax Number: <strong className="font-semibold text-slate-900">{supplier.taxNumber || 'N/A'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Notes
            </h3>
            <div className="rounded-xl border border-slate-100 bg-white p-3.5 text-[13px] leading-relaxed">
              {supplier.notes ? (
                <p className="text-slate-700 whitespace-pre-wrap">{supplier.notes}</p>
              ) : (
                <p className="text-slate-400 italic">No notes recorded for this supplier.</p>
              )}
            </div>
          </div>

          {/* Timestamps */}
          {(supplier.createdAt || supplier.createdBy) && (
            <div className="flex items-center justify-between text-[12px] text-slate-400 pt-3 border-t border-slate-100">
              {supplier.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Created: {supplier.createdAt}
                </span>
              )}
              {supplier.createdBy && (
                <span className="flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5" /> By: {supplier.createdBy.slice(0, 8)}...
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[14px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(supplier);
            }}
            className="rounded-xl bg-[#0B4EA2] px-5 py-2 text-[14px] font-semibold text-white hover:bg-[#093d80] transition-colors shadow-sm"
          >
            Edit Supplier
          </button>
        </div>
      </div>
    </Modal>
  );
}
