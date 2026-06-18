import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { updateHkmInventoryItem } from '../../../../features/HKfeatures/hkmInventoryItems/hkmInventoryItemsSlice';
import { getHkmInventoryItemById } from '../../../../shared/HKshared/api/hkmInventoryItemsApi';
import type { HkmInventoryItemReadDto } from '../../../../models/HKmodels/HkmInventoryItem';
import { FiEdit2, FiX } from 'react-icons/fi';

interface EditItemModalProps {
  isOpen: boolean;
  item: HkmInventoryItemReadDto | null;
  onClose: () => void;
}

export function EditItemModal({ isOpen, item, onClose }: EditItemModalProps) {
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((s) => s.hkmInventoryCategories);
  const { units } = useAppSelector((s) => s.hkmInventoryUnits);

  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [unitId, setUnitId] = useState<number | ''>('');
  const [minStock, setMinStock] = useState<number | ''>('');
  const [maxStock, setMaxStock] = useState<number | ''>('');

  useEffect(() => {
    let active = true;

    if (isOpen && item) {
      // Set basic fields immediately from the list row
      setName(item.name);
      setCategoryId(item.categoryId);
      setUnitId(item.unitId);
      
      // Fetch the full details to guarantee we have minimumStock and maximumStock
      setIsFetching(true);
      getHkmInventoryItemById(item.id)
        .then((fullItem) => {
          if (!active) return;
          setName(fullItem.name);
          setCategoryId(fullItem.categoryId);
          setUnitId(fullItem.unitId);
          setMinStock(fullItem.minimumStock ?? '');
          setMaxStock(fullItem.maximumStock ?? '');
        })
        .catch((err) => {
          console.error('Failed to fetch full item details:', err);
          // If fetch fails, try falling back to what's in the list response if available
          if (!active) return;
          setMinStock(item.minimumStock ?? '');
          setMaxStock(item.maximumStock ?? '');
        })
        .finally(() => {
          if (active) setIsFetching(false);
        });
    }

    return () => {
      active = false;
    };
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || categoryId === '' || unitId === '' || minStock === '' || maxStock === '') return;

    setIsSaving(true);
    await dispatch(
      updateHkmInventoryItem({
        id: item.id,
        payload: {
          name: name.trim(),
          categoryId: Number(categoryId),
          unitId: Number(unitId),
          minimumStock: Number(minStock),
          maximumStock: Number(maxStock),
        },
      })
    );
    setIsSaving(false);
    onClose();
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
              <FiEdit2 className="w-5 h-5 text-[#0a4bbd]" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-slate-800">Edit Item</h2>
              <p className="text-[13px] text-slate-400">Update inventory item details</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            {/* @ts-ignore */}
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <form id="edit-item-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Item Name (Full Width) */}
              <div className="col-span-1 sm:col-span-2 flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-slate-800">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isFetching}
                  placeholder="e.g. Lavender Soap"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400 disabled:opacity-50"
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
                  disabled={isFetching}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] text-slate-700 bg-white disabled:opacity-50"
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
                  disabled={isFetching}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] text-slate-700 bg-white disabled:opacity-50"
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
                  disabled={isFetching}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400 disabled:opacity-50"
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
                  disabled={isFetching}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400 disabled:opacity-50"
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
            form="edit-item-form"
            type="submit"
            disabled={isSaving || isFetching || !isFormValid}
            className="px-6 py-2.5 rounded-xl bg-[#0a4bbd] text-[14px] font-semibold text-white hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving || isFetching ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {isFetching ? 'Loading...' : 'Saving...'}
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
