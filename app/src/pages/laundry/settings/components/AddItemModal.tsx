import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { createLaundryInventoryItem } from '../../../../features/Laundryfeatures/laundryInventoryItems/laundryInventoryItemsSlice';
import { FiPlus, FiX } from 'react-icons/fi';
import { appAlert } from '../../../../shared/ui/AppAlert';

const showSuccess = (title: string) =>
  appAlert.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    icon: 'success',
    title,
  });

const showError = (title: string) =>
  appAlert.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    icon: 'error',
    title,
  });

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddItemModal({ isOpen, onClose }: AddItemModalProps) {
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((s) => s.laundryInventoryCategories);
  const { units } = useAppSelector((s) => s.laundryInventoryUnits);

  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [unitId, setUnitId] = useState<number | ''>('');
  const [minStock, setMinStock] = useState<number | ''>('');
  const [maxStock, setMaxStock] = useState<number | ''>('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setCategoryId('');
      setUnitId('');
      setMinStock('');
      setMaxStock('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || categoryId === '' || unitId === '' || minStock === '' || maxStock === '') return;

    setIsSaving(true);
    const result = await dispatch(
      createLaundryInventoryItem({
        name: name.trim(),
        categoryId: Number(categoryId),
        unitId: Number(unitId),
        minimumStock: Number(minStock),
        maximumStock: Number(maxStock),
      })
    );
    setIsSaving(false);
    onClose();
    if (createLaundryInventoryItem.fulfilled.match(result)) {
      showSuccess('Item created successfully');
    } else {
      showError((result.payload as string) || 'Failed to create item');
    }
  };

  const isFormValid = name.trim() && categoryId !== '' && unitId !== '' && minStock !== '' && maxStock !== '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] flex items-center justify-center">
              {/* @ts-ignore */}
              <FiPlus className="w-5 h-5 text-[#0a4bbd]" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-slate-800">Add New Item</h2>
              <p className="text-[13px] text-slate-400">Create a new laundry inventory item</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            {/* @ts-ignore */}
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <form id="laundry-add-item-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Item Name */}
              <div className="col-span-1 sm:col-span-2 flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-slate-800">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Detergent Powder"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400"
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-slate-800">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] text-slate-700 bg-white"
                >
                  <option value="" disabled hidden>Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Unit */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-slate-800">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] text-slate-700 bg-white"
                >
                  <option value="" disabled hidden>Select Unit</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              {/* Min Stock */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-slate-800">
                  Minimum Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value ? Number(e.target.value) : '')}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400"
                />
              </div>

              {/* Max Stock */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-slate-800">
                  Maximum Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={maxStock}
                  onChange={(e) => setMaxStock(e.target.value ? Number(e.target.value) : '')}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-slate-100 bg-[#f8fafc] flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-[14px] font-semibold text-slate-700 hover:bg-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            form="laundry-add-item-form"
            type="submit"
            disabled={isSaving || !isFormValid}
            className="px-6 py-2.5 rounded-xl bg-[#0a4bbd] text-[14px] font-semibold text-white hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving…
              </>
            ) : (
              'Add Item'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
