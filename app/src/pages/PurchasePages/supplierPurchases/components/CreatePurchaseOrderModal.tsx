import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, ShoppingCart, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { createSupplierPurchase } from '../../../../features/Purchasefeatures/supplierPurchases/supplierPurchasesSlice';
import { fetchRestaurantMaterials } from '../../../../features/restaurant/restaurantMaterialsSlice';
import { fetchRestaurantUnits } from '../../../../features/restaurant/restaurantUnitsSlice';
import type { Supplier } from '../../../../models/Purchasemodels/Supplier';
import type {
  CreateSupplierPurchaseDto,
  PurchasingDepartmentType,
} from '../../../../models/Purchasemodels/SupplierPurchase';

interface CreatePurchaseOrderModalProps {
  open: boolean;
  suppliers: Supplier[];
  onClose: () => void;
  onSuccess: () => void;
}

interface FormLineItem {
  key: string;
  departmentType: PurchasingDepartmentType;
  itemId: number | '';
  unitId: number | '';
  quantity: number | '';
  unitPrice: number | '';
  notes: string;
}

export function CreatePurchaseOrderModal({
  open,
  suppliers,
  onClose,
  onSuccess,
}: CreatePurchaseOrderModalProps) {
  const dispatch = useAppDispatch();
  const materials = useAppSelector(
    (state) => state.restaurantMaterials.items
  );
  const units = useAppSelector(
    (state) => state.restaurantUnits.items
  );

  const [supplierId, setSupplierId] = useState<number | ''>('');
  const [purchaseDate, setPurchaseDate] = useState(() => {
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm for datetime-local input
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [lineItems, setLineItems] = useState<FormLineItem[]>([
    {
      key: 'item-1',
      departmentType: 'Restaurant',
      itemId: '',
      unitId: '',
      quantity: 1,
      unitPrice: 0,
      notes: '',
    },
  ]);

  // Ensure restaurant materials & units are loaded
  useEffect(() => {
    if (open) {
      if (materials.length === 0) {
        dispatch(fetchRestaurantMaterials());
      }
      if (units.length === 0) {
        dispatch(fetchRestaurantUnits());
      }
    }
  }, [open, materials.length, units.length, dispatch]);

  // Reset form when modal closes or opens
  useEffect(() => {
    if (open) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setPurchaseDate(now.toISOString().slice(0, 16));
      setSupplierId(suppliers.length > 0 ? suppliers[0].id : '');
      setNotes('');
      setLineItems([
        {
          key: `item-${Date.now()}`,
          departmentType: 'Restaurant',
          itemId: '',
          unitId: '',
          quantity: 1,
          unitPrice: 0,
          notes: '',
        },
      ]);
    }
  }, [open, suppliers]);

  // Grand total calculation
  const grandTotal = useMemo(() => {
    return lineItems.reduce((acc, itm) => {
      const qty = typeof itm.quantity === 'number' ? itm.quantity : 0;
      const price = typeof itm.unitPrice === 'number' ? itm.unitPrice : 0;
      return acc + qty * price;
    }, 0);
  }, [lineItems]);

  if (!open) return null;

  const handleAddItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        key: `item-${Date.now()}-${Math.random()}`,
        departmentType: 'Restaurant',
        itemId: '',
        unitId: '',
        quantity: 1,
        unitPrice: 0,
        notes: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = <K extends keyof FormLineItem>(
    index: number,
    field: K,
    value: FormLineItem[K]
  ) => {
    setLineItems((prev) => {
      const next = [...prev];
      const current = { ...next[index], [field]: value };

      // If user selected a restaurant material, try auto-filling its unitId
      if (field === 'itemId' && typeof value === 'number') {
        const mat = materials.find((m) => m.id === value);
        if (mat && mat.unitId) {
          current.unitId = mat.unitId;
        }
      }

      next[index] = current;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      toast.error('Please select a supplier');
      return;
    }

    if (lineItems.length === 0) {
      toast.error('Please add at least one line item');
      return;
    }

    // Validate line items
    for (let i = 0; i < lineItems.length; i++) {
      const itm = lineItems[i];
      if (!itm.itemId) {
        toast.error(`Please select a material item for line #${i + 1}`);
        return;
      }
      if (!itm.unitId) {
        toast.error(`Please select a unit for line #${i + 1}`);
        return;
      }
      if (typeof itm.quantity !== 'number' || itm.quantity <= 0) {
        toast.error(`Quantity must be greater than 0 on line #${i + 1}`);
        return;
      }
      if (typeof itm.unitPrice !== 'number' || itm.unitPrice < 0) {
        toast.error(`Unit price cannot be negative on line #${i + 1}`);
        return;
      }
    }

    const payload: CreateSupplierPurchaseDto = {
      supplierId: Number(supplierId),
      purchaseDate: new Date(purchaseDate).toISOString(),
      notes: notes.trim(),
      items: lineItems.map((itm) => ({
        departmentType: itm.departmentType,
        itemId: Number(itm.itemId),
        quantity: Number(itm.quantity),
        unitId: Number(itm.unitId),
        unitPrice: Number(itm.unitPrice),
        notes: itm.notes.trim() || undefined,
      })),
    };

    try {
      setIsSubmitting(true);
      await dispatch(createSupplierPurchase(payload)).unwrap();
      toast.success('Purchase order created successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err || 'Failed to create purchase order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EEF4FF] text-[#0B4EA2]">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">New Purchase Order</h3>
              <p className="text-xs text-slate-400">
                Department: <span className="font-semibold text-[#0B4EA2]">Restaurant</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Order Header Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Supplier Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Supplier <span className="text-red-500">*</span>
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value ? Number(e.target.value) : '')}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20"
              >
                <option value="">Select a supplier...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.phone ? `(${s.phone})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Purchase Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20"
              />
            </div>
          </div>

          {/* General Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Order Notes / Delivery Instructions
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Deliver before noon to the restaurant main kitchen..."
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20"
            />
          </div>

          {/* Dynamic Line Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Order Items ({lineItems.length})
                </h4>
                <span className="rounded-md bg-[#EEF4FF] px-2 py-0.5 text-xs font-semibold text-[#0B4EA2]">
                  Restaurant Inventory
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#0B4EA2] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B4EA2] hover:bg-[#EEF4FF] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </button>
            </div>

            {/* Line items list */}
            <div className="space-y-3">
              {lineItems.map((itm, idx) => {
                const lineTotal =
                  (typeof itm.quantity === 'number' ? itm.quantity : 0) *
                  (typeof itm.unitPrice === 'number' ? itm.unitPrice : 0);

                return (
                  <div
                    key={itm.key}
                    className="relative rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition-all hover:border-slate-300"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      {/* Material item dropdown */}
                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Restaurant Material #{idx + 1} *
                        </label>
                        <select
                          value={itm.itemId}
                          onChange={(e) =>
                            handleItemChange(
                              idx,
                              'itemId',
                              e.target.value ? Number(e.target.value) : ''
                            )
                          }
                          required
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-[#0B4EA2] focus:outline-none"
                        >
                          <option value="">Select Restaurant Material...</option>
                          {materials.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Unit dropdown */}
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Unit *
                        </label>
                        <select
                          value={itm.unitId}
                          onChange={(e) =>
                            handleItemChange(
                              idx,
                              'unitId',
                              e.target.value ? Number(e.target.value) : ''
                            )
                          }
                          required
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-[#0B4EA2] focus:outline-none"
                        >
                          <option value="">Select Unit...</option>
                          {units.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} {u.symbol ? `(${u.symbol})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={itm.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              idx,
                              'quantity',
                              e.target.value === '' ? '' : Math.max(0, Number(e.target.value))
                            )
                          }
                          required
                          placeholder="10"
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-[#0B4EA2] focus:outline-none"
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Unit Price ($) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={itm.unitPrice}
                          onChange={(e) =>
                            handleItemChange(
                              idx,
                              'unitPrice',
                              e.target.value === '' ? '' : Math.max(0, Number(e.target.value))
                            )
                          }
                          required
                          placeholder="0.00"
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-[#0B4EA2] focus:outline-none"
                        />
                      </div>

                      {/* Delete action button */}
                      <div className="sm:col-span-1 flex justify-center pb-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={lineItems.length <= 1}
                          title={lineItems.length <= 1 ? 'Minimum 1 item required' : 'Remove item'}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Subrow for item notes & Line Subtotal */}
                    <div className="mt-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs">
                      <div className="w-full sm:w-2/3">
                        <input
                          type="text"
                          value={itm.notes}
                          onChange={(e) => handleItemChange(idx, 'notes', e.target.value)}
                          placeholder="Optional item notes / specifications..."
                          className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 placeholder-slate-400"
                        />
                      </div>
                      <div className="text-right font-semibold text-slate-700 shrink-0">
                        Line Total: <span className="font-bold text-[#0B4EA2]">${lineTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grand Total Summary Box */}
          <div className="rounded-xl border border-[#0B4EA2]/20 bg-[#EEF4FF]/50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#0B4EA2]">
              <Calculator className="h-5 w-5" />
              <span className="font-semibold">Estimated Order Total:</span>
            </div>
            <div className="text-xl font-black text-[#0B4EA2]">
              ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#093d80] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span>Creating Order...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create Purchase Order</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
