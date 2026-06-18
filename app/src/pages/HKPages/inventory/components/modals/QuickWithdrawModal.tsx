import { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import { FiCalendar } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../../../../shared/apis/hooks';
import { HkmInventoryItemReadDto } from '../../../../../models/HKmodels/HkmInventoryItem';
import { createHkmIssue } from '../../../../../features/HKfeatures/hkmIssues/hkmIssuesSlice';
import { fetchHkmInventoryItems } from '../../../../../features/HKfeatures/hkmInventoryItems/hkmInventoryItemsSlice';
import { getRooms } from '../../../../../shared/apis/roomsApi';
import type { Room } from '../../../../../models/Room';

interface QuickWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: HkmInventoryItemReadDto;
}

export function QuickWithdrawModal({ isOpen, onClose, initialItem }: QuickWithdrawModalProps) {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.hkmInventoryItems);
  const { status: issueStatus } = useAppSelector((state) => state.hkmIssues);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch dirty rooms on mount
  useEffect(() => {
    if (isOpen) {
      getRooms()
        .then((data) => {
          // The mock response returns strings for status, though Room type says number.
          // We filter by "Dirty" (case-insensitive).
          const dirtyRooms = data.filter(
            (r) => String(r.status).toLowerCase() === 'dirty'
          );
          setRooms(dirtyRooms);
        })
        .catch((err) => console.error('Failed to fetch rooms:', err));
    }
  }, [isOpen]);

  // Set initial selected item when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialItem) {
        setSelectedItemId(String(initialItem.id));
      } else if (items.length > 0) {
        setSelectedItemId(String(items[0].id));
      }
      setQuantity('');
      setReason('');
      setSelectedRoomId('');
      setErrorMsg('');
    }
  }, [isOpen, initialItem, items]);

  const selectedItem = useMemo(
    () => items.find((i) => String(i.id) === selectedItemId),
    [items, selectedItemId]
  );

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId),
    [rooms, selectedRoomId]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedItem) {
      setErrorMsg('Please select an item.');
      return;
    }
    if (!selectedRoom) {
      setErrorMsg('Please select a room.');
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

    try {
      await dispatch(
        createHkmIssue({
          itemId: selectedItem.id,
          quantity: Number(quantity),
          roomId: selectedRoom.id,
          reason,
        })
      ).unwrap();

      // Refresh inventory so the stock updates
      dispatch(fetchHkmInventoryItems());
      
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create withdrawal issue.');
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
          {/* Item Selection & Stock Info */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-slate-800">
              Item Name <span className="text-slate-800">*</span>
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] text-slate-700 bg-white"
            >
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
              Quantity <span className="text-slate-800">*</span>
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

          {/* Room Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-slate-800">
                Room <span className="text-slate-800">*</span>
              </label>
              <select
                required
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] text-slate-700 bg-white"
              >
                <option value="" disabled>
                  Select dirty room
                </option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    Room {room.roomNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-slate-800">Floor</label>
              <input
                type="text"
                readOnly
                value={selectedRoom?.floor ?? ''}
                placeholder="Auto-filled"
                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-[14px] text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-slate-800">Reason</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Purpose of withdrawal..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400 text-slate-700 resize-none"
            />
          </div>

          {/* Date & Time (Readonly style) */}
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
