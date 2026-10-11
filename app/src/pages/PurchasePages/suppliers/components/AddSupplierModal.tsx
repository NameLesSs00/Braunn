import { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../../../shared/ui/Modal';
import { useAppDispatch } from '../../../../store/hooks';
import { createSupplier } from '../../../../features/Purchasefeatures/suppliers/suppliersSlice';
import {
  PURCHASING_DEPARTMENTS,
  type PurchasingDepartment,
  type CreateSupplierDto,
} from '../../../../models/Purchasemodels/Supplier';
import { DEPARTMENT_STYLES } from './departmentBadge';

interface AddSupplierModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddSupplierModal({ open, onClose, onSuccess }: AddSupplierModalProps) {
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState<CreateSupplierDto>({
    name: '',
    phone: '',
    email: '',
    address: '',
    taxNumber: '',
    isActive: true,
    notes: '',
    departments: ['Restaurant'],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleDepartment = (dept: PurchasingDepartment) => {
    setFormData((prev) => {
      const exists = prev.departments.includes(dept);
      if (exists) {
        if (prev.departments.length === 1) {
          toast.warning('Supplier must belong to at least one department');
          return prev;
        }
        return {
          ...prev,
          departments: prev.departments.filter((d) => d !== dept),
        };
      }
      return {
        ...prev,
        departments: [...prev.departments, dept],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic validation
    if (!formData.name.trim()) {
      setErrorMessage('Supplier name is required');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Phone number is required');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage('Email address is required');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMessage('Address is required');
      return;
    }
    if (!formData.taxNumber.trim()) {
      setErrorMessage('Tax number is required');
      return;
    }
    if (formData.departments.length === 0) {
      setErrorMessage('Please select at least one department');
      return;
    }

    try {
      setIsSubmitting(true);
      const action = await dispatch(
        createSupplier({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          taxNumber: formData.taxNumber.trim(),
          isActive: formData.isActive,
          notes: formData.notes?.trim() || '',
          departments: formData.departments,
        })
      );

      if (createSupplier.fulfilled.match(action)) {
        toast.success(`Supplier "${formData.name.trim()}" created successfully!`);
        onSuccess();
        onClose();
      } else {
        const error = (action.payload as string) || 'Failed to create supplier';
        setErrorMessage(error);
        toast.error(error);
      }
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="w-[540px] max-w-[95vw] overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EEF4FF] text-[#0B4EA2]">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-slate-800">Add New Supplier</h2>
              <p className="text-[12px] text-slate-400">Fill in supplier details and department access</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-[13px] font-medium text-red-600 border border-red-100">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Supplier Name */}
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1">
              Supplier Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Acme Hotel Supplies Ltd"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-[14px] text-slate-800 transition-colors focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#EEF4FF]"
            />
          </div>

          {/* Phone & Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +1 555-0192"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-[14px] text-slate-800 transition-colors focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#EEF4FF]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. orders@acme.com"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-[14px] text-slate-800 transition-colors focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#EEF4FF]"
              />
            </div>
          </div>

          {/* Address & Tax Number Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. 124 Main Street, City"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-[14px] text-slate-800 transition-colors focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#EEF4FF]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1">
                Tax Number / VAT <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                placeholder="e.g. TX-98745612"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-[14px] text-slate-800 transition-colors focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#EEF4FF]"
              />
            </div>
          </div>

          {/* Departments Multi-Select */}
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
              Assigned Departments <span className="text-red-500">*</span>
            </label>
            <p className="text-[12px] text-slate-400 mb-2">Click to toggle departments supplied by this vendor:</p>
            <div className="flex flex-wrap gap-2">
              {PURCHASING_DEPARTMENTS.map((dept) => {
                const selected = formData.departments.includes(dept);
                const info = DEPARTMENT_STYLES[dept];
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => toggleDepartment(dept)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-medium border transition-all ${
                      selected
                        ? `${info.badgeClass} ring-2 ring-[#0B4EA2]/20 font-semibold shadow-xs`
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        selected ? info.dotClass : 'bg-slate-300'
                      }`}
                    />
                    {dept}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Is Active Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
            <div>
              <div className="text-[13px] font-semibold text-slate-700">Supplier Status</div>
              <div className="text-[12px] text-slate-400">Enable or disable this supplier for purchase orders</div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#0B4EA2] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes or supplier instructions..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-[14px] text-slate-800 transition-colors focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#EEF4FF]"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[14px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-6 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-[#093d80] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Supplier</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
