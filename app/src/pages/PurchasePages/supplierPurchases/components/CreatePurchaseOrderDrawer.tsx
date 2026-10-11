import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, ShoppingCart, Calculator, Building2, Phone, Mail } from 'lucide-react';
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
import type { RestaurantMaterial } from '../../../../models/RestaurantMaterial';
import { SearchableMaterialSelect } from './SearchableMaterialSelect';

interface CreatePurchaseOrderDrawerProps {
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

export function CreatePurchaseOrderDrawer({
  open,
  suppliers,
  onClose,
  onSuccess,
}: CreatePurchaseOrderDrawerProps) {
  const dispatch = useAppDispatch();
  const materials = useAppSelector((state) => state.restaurantMaterials.items);
  const units = useAppSelector((state) => state.restaurantUnits.items);

  const [supplierId, setSupplierId] = useState<number | ''>('');
  const [purchaseDate, setPurchaseDate] = useState(() => {
    const now = new Date();
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

  // Ensure restaurant resources are preloaded
  useEffect(() => {
    if (open) {
      if (materials.length === 0) dispatch(fetchRestaurantMaterials());
      if (units.length === 0) dispatch(fetchRestaurantUnits());
    }
  }, [open, materials.length, units.length, dispatch]);

  // Reset form when drawer opens
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

  const selectedSupplier = useMemo(
    () => suppliers.find((s) => s.id === supplierId),
    [suppliers, supplierId]
  );

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
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSelectMaterial = (index: number, material: RestaurantMaterial) => {
    setLineItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        itemId: material.id,
        unitId: material.unitId || next[index].unitId,
      };
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-over Container */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside className="flex w-screen max-w-2xl flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-white">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#EEF4FF] text-[#0B4EA2]">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-800">New Purchase Order</h2>
                  <span className="rounded-md bg-[#EEF4FF] px-2 py-0.5 text-xs font-semibold text-[#0B4EA2]">
                    Restaurant
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Select supplier and add restaurant materials with unit pricing
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Scrollable Body */}
          <form id="create-purchase-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Supplier Section */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 font-medium"
                >
                  <option value="">Choose vendor...</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.phone ? `(${s.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Supplier Details Preview Card */}
              {selectedSupplier && (
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <Building2 className="h-3.5 w-3.5 text-[#0B4EA2]" />
                    {selectedSupplier.name}
                    {selectedSupplier.taxNumber && (
                      <span className="text-[11px] text-slate-400 font-normal">
                        Tax: {selectedSupplier.taxNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-slate-500 pt-1">
                    {selectedSupplier.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {selectedSupplier.phone}
                      </span>
                    )}
                    {selectedSupplier.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {selectedSupplier.email}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Date & Instructions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Order Notes / Remarks
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Delivery before noon..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20"
                />
              </div>
            </div>

            {/* Items Section Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Order Items ({lineItems.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Search and pick ingredients or supplies from the restaurant catalog
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#0B4EA2] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B4EA2] hover:bg-[#EEF4FF] transition-all shadow-2xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Line Item
                </button>
              </div>

              {/* Line items cards */}
              <div className="space-y-3">
                {lineItems.map((itm, idx) => {
                  const lineTotal =
                    (typeof itm.quantity === 'number' ? itm.quantity : 0) *
                    (typeof itm.unitPrice === 'number' ? itm.unitPrice : 0);

                  return (
                    <div
                      key={itm.key}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3 transition-all hover:border-slate-300"
                    >
                      {/* Top Row: Searchable Material + Unit */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                        {/* Material search picker */}
                        <div className="sm:col-span-7">
                          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                            Item #{idx + 1} (Restaurant Material) *
                          </label>
                          <SearchableMaterialSelect
                            materials={materials}
                            selectedId={itm.itemId}
                            onSelect={(mat) => handleSelectMaterial(idx, mat)}
                            required
                          />
                        </div>

                        {/* Unit selector */}
                        <div className="sm:col-span-4">
                          <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
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
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#0B4EA2] focus:outline-none"
                          >
                            <option value="">Choose Unit...</option>
                            {units.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name} {u.symbol ? `(${u.symbol})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Delete row */}
                        <div className="sm:col-span-1 flex justify-end sm:pt-6">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            disabled={lineItems.length <= 1}
                            title={lineItems.length <= 1 ? 'Minimum 1 item required' : 'Remove row'}
                            className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Row: Quantity, Unit Price, Line Total, and Notes */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-2 border-t border-slate-100">
                        {/* Quantity */}
                        <div className="sm:col-span-3">
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
                            placeholder="1"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-[#0B4EA2] focus:outline-none"
                          />
                        </div>

                        {/* Unit Price */}
                        <div className="sm:col-span-3">
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
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-[#0B4EA2] focus:outline-none"
                          />
                        </div>

                        {/* Item Note */}
                        <div className="sm:col-span-4">
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                            Item Notes
                          </label>
                          <input
                            type="text"
                            value={itm.notes}
                            onChange={(e) => handleItemChange(idx, 'notes', e.target.value)}
                            placeholder="Optional note..."
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:border-[#0B4EA2] focus:outline-none"
                          />
                        </div>

                        {/* Subtotal */}
                        <div className="sm:col-span-2 text-right">
                          <span className="block text-[11px] font-semibold text-slate-400 uppercase">
                            Subtotal
                          </span>
                          <span className="text-sm font-bold text-[#0B4EA2]">
                            ${lineTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Summary Card */}
            <div className="rounded-2xl border border-[#0B4EA2]/20 bg-[#EEF4FF]/50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-sm text-[#0B4EA2]">
                <Calculator className="h-5 w-5" />
                <span className="font-semibold">Estimated Invoice Total:</span>
              </div>
              <div className="text-2xl font-black text-[#0B4EA2]">
                ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </form>

          {/* Drawer Sticky Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-purchase-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-7 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#093d80] active:scale-[0.98] transition-all disabled:opacity-50"
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
        </aside>
      </div>
    </div>
  );
}
