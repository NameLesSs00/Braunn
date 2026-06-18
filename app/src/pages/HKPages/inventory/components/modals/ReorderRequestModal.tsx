import { useState, useEffect } from 'react';
import { FiCalendar, FiTrash2, FiPlus } from 'react-icons/fi';
import { useAppDispatch } from '../../../../../shared/apis/hooks';
import { Modal } from './Modal';
import { HkmInventoryItemReadDto } from '../../../../../models/HKmodels/HkmInventoryItem';
import { getHkmInventoryItems } from '../../../../../shared/HKshared/api/hkmInventoryItemsApi';
import { createHkmPurchase } from '../../../../../features/HKfeatures/hkmPurchases/hkmPurchasesSlice';

interface ReorderRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: HkmInventoryItemReadDto;
}

interface PurchaseItemState {
  id: number; // unique id for list rendering
  selectedItem?: HkmInventoryItemReadDto;
  quantity: number;
}

let nextId = 0;

export function ReorderRequestModal({ isOpen, onClose, initialItem }: ReorderRequestModalProps) {
  const dispatch = useAppDispatch();
  const [requestDate, setRequestDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [supplierName, setSupplierName] = useState('');
  const [notes, setNotes] = useState('');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItemState[]>([]);
  const [allItems, setAllItems] = useState<HkmInventoryItemReadDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form
      setRequestDate(new Date().toISOString().split('T')[0]);
      setSupplierName('');
      setNotes('');
      if (initialItem) {
        const needed = initialItem.minimumStock && initialItem.minimumStock > initialItem.quantity 
          ? initialItem.minimumStock - initialItem.quantity 
          : 0;
        setPurchaseItems([{ id: nextId++, selectedItem: initialItem, quantity: needed > 0 ? needed : 1 }]);
      } else {
        setPurchaseItems([]);
      }

      // Fetch all items for dropdown
      getHkmInventoryItems({ PageSize: 1000 }).then(res => {
        setAllItems(res.items);
      }).catch(console.error);
    }
  }, [isOpen, initialItem]);

  const handleAddItem = () => {
    setPurchaseItems(prev => [...prev, { id: nextId++, quantity: 1 }]);
  };

  const handleRemoveItem = (id: number) => {
    setPurchaseItems(prev => prev.filter(i => i.id !== id));
  };

  const handleItemChange = (id: number, itemId: number) => {
    const item = allItems.find(i => i.id === itemId);
    setPurchaseItems(prev => prev.map(i => i.id === id ? { ...i, selectedItem: item } : i));
  };

  const handleQuantityChange = (id: number, qty: number) => {
    setPurchaseItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName) {
      alert("Supplier is required");
      return;
    }
    const validItems = purchaseItems.filter(i => i.selectedItem && i.quantity > 0);
    if (validItems.length === 0) {
      alert("At least one item is required");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        supplierName,
        date: new Date(requestDate).toISOString(),
        notes,
        purchaseItems: validItems.map(i => ({
          itemId: i.selectedItem!.id,
          quantity: i.quantity
        }))
      };
      
      await dispatch(createHkmPurchase(payload)).unwrap();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to submit request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reorder Request"
      maxWidth="max-w-4xl"
    >
      <div className="p-8">
        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Request Information Section */}
          <div className="space-y-4">
            <h3 className="text-[15px] font-bold text-slate-800">Request Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-slate-700">
                  Request Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={requestDate}
                    onChange={(e) => setRequestDate(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] text-[14px] text-slate-700"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-slate-700">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Enter Supplier Name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] text-[14px] text-slate-700 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <h3 className="text-[15px] font-bold text-slate-800">Notes</h3>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or special instructions..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] text-[14px] placeholder:text-slate-400 text-slate-700 resize-none"
            />
          </div>

          {/* Items Table Section */}
          <div className="space-y-4">
            <h3 className="text-[15px] font-bold text-slate-800">Items</h3>
            
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-slate-200">
                    <th className="px-4 py-4 text-[12px] font-bold text-slate-500 w-[35%]">ITEM <span className="text-red-500">*</span></th>
                    <th className="px-4 py-4 text-[12px] font-bold text-slate-500 text-center">CURRENT<br/>STOCK</th>
                    <th className="px-4 py-4 text-[12px] font-bold text-slate-500 text-center">MINIMUM<br/>LEVEL</th>
                    <th className="px-4 py-4 text-[12px] font-bold text-slate-500 text-center">REORDER QUANTITY <span className="text-red-500">*</span></th>
                    <th className="px-4 py-4 text-[12px] font-bold text-slate-500">UNIT</th>
                    <th className="px-4 py-4 text-[12px] font-bold text-slate-500 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchaseItems.map((pItem) => (
                    <tr key={pItem.id}>
                      <td className="px-4 py-3">
                        <select 
                          value={pItem.selectedItem?.id || ''} 
                          onChange={(e) => handleItemChange(pItem.id, Number(e.target.value))}
                          className="w-full px-4 py-2 rounded-md border border-slate-200 focus:outline-none text-[14px] text-slate-700 bg-white"
                        >
                          <option value="" disabled>Select Item</option>
                          {allItems.map(i => (
                            <option key={i.id} value={i.id}>{i.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center text-[14px] text-slate-700">
                        {pItem.selectedItem?.quantity ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-[14px] text-slate-700">
                        {pItem.selectedItem?.minimumStock ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input 
                          type="number" 
                          min="1"
                          value={pItem.quantity} 
                          onChange={(e) => handleQuantityChange(pItem.id, Number(e.target.value))}
                          className="w-24 px-4 py-2 rounded-md border border-slate-200 focus:outline-none text-[14px] text-slate-700 text-center" 
                        />
                      </td>
                      <td className="px-4 py-3 text-[14px] text-slate-700">
                        {pItem.selectedItem?.unitName ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          type="button" 
                          onClick={() => handleRemoveItem(pItem.id)}
                          className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                        >
                          {/* @ts-ignore */}
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {purchaseItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-500 text-[14px]">
                        No items added. Click "Add Item" to select items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <button 
              type="button" 
              onClick={handleAddItem}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-[#0a4bbd] text-[#0a4bbd] text-[14px] font-semibold hover:bg-blue-50 transition-colors"
            >
              {/* @ts-ignore */}
              <FiPlus className="w-4 h-4" /> Add Item
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 pt-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-8 py-3 rounded-xl border border-slate-300 text-[15px] font-bold text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 rounded-xl bg-[#0a4bbd] text-[15px] font-bold text-white hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[160px]"
            >
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
