import { useState, useEffect, useMemo } from 'react';
import { FiCalendar } from 'react-icons/fi';
import { Modal } from '../../../../HKPages/inventory/components/modals/Modal';
import { useAppDispatch, useAppSelector } from '../../../../../shared/apis/hooks';
import { fetchLaundryInventoryItems } from '../../../../../features/Laundryfeatures/laundryInventoryItems/laundryInventoryItemsSlice';
import { createLaundryIssue } from '../../../../../features/Laundryfeatures/laundryIssues/laundryIssuesSlice';
import type { LaundryInventoryItemReadDto } from '../../../../../models/Laundrymodels/LaundryInventoryItem';

interface LaundryQuickWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: LaundryInventoryItemReadDto;
}

export function LaundryQuickWithdrawModal({ isOpen, onClose, initialItem }: LaundryQuickWithdrawModalProps) {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.laundryInventoryItems);
  const { status: issueStatus } = useAppSelector((state) => state.laundryIssues);

  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Fetch full items list so the dropdown is populated
      dispatch(fetchLaundryInventoryItems({ PageSize: 1000 }));

      if (initialItem) {
        setSelectedItemId(String(initialItem.id));
      } else if (items.length > 0) {
        setSelectedItemId(String(items[0].id));
      }
      setQuantity('');
      setReason('');
      setErrorMsg('');
    }
  }, [isOpen, initialItem]);

  const selectedItem = useMemo(
    () => items.find((i) => String(i.id) === selectedItemId),
    [items, selectedItemId]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedItem) {
      setErrorMsg('Please select an item.');
      return;
    }
    if (!quantity || quantity <= 0) {
      setErrorMsg('Quantity must be greater than 0.');
      return;
    }
    if (quantity > selectedItem.quantity) {
      setErrorMsg(`Cannot withdraw more than current stock (${selectedItem.quantity}).`);
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Reason is required.');
      return;
    }

    try {
      await dispatch(
        createLaundryIssue({
          itemId: selectedItem.id,
          quantity: Number(quantity),
          reason: reason.trim(),
        })
      ).unwrap();

      // Refresh stock so the UI reflects the change
      dispatch(fetchLaundryInventoryItems());
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create withdrawal.');
    }
  };

  const isSubmitting = issueStatus === 'loading';
  const currentDate = new Date().toLocaleString();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Withdraw" maxWidth="max-w-2xl">
      <div className="p-8">
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-[14px]">
            {errorMsg}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Item Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-slate-800">
              Item Name <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] text-slate-700 bg-white"
            >
              <option value="" disabled>Select item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            {selectedItem && (
              <p className="text-[13px] text-slate-500 mt-1">
                Current Stock:{' '}
                <span className="font-bold text-slate-700">
                  {selectedItem.quantity} {selectedItem.unitName?.toLowerCase()}
                </span>
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-slate-800">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max={selectedItem?.quantity || 1}
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Enter quantity"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400 text-slate-700"
            />
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-slate-800">Reason <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Purpose of withdrawal..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400 text-slate-700 resize-none"
            />
          </div>

          {/* Date & Time (read-only) */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 mt-2">
            {/* @ts-ignore */}
            <FiCalendar className="w-4 h-4 text-slate-500" />
            <span className="text-[14px] text-slate-500 font-medium">{currentDate}</span>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl border border-slate-300 text-[15px] font-bold text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-[#0a4bbd] text-[15px] font-bold text-white hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Withdrawing...' : 'Confirm Withdraw'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
