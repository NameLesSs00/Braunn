import { useState, useEffect } from 'react'
import { Calendar, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useAppDispatch } from '../../../../shared/apis/hooks'
import { updateHkmPurchase, fetchHkmPurchases } from '../../../../features/HKfeatures/hkmPurchases/hkmPurchasesSlice'
import { getHkmInventoryItems } from '../../../../shared/HKshared/api/hkmInventoryItemsApi'
import { showSuccessToast, showErrorToast } from '../../../../shared/ui/toastFeedback'
import type { HkmInventoryItemReadDto } from '../../../../models/HKmodels/HkmInventoryItem'
import type { HkmPurchaseReadDto, HkmPurchasePriority } from '../../../../models/HKmodels/HkmPurchase'

interface FormItemRow {
  id?: number
  itemId: number
  selectedItem: HkmInventoryItemReadDto | null
  quantity: number
  priority: HkmPurchasePriority
}

interface EditHKPurchaseModalProps {
  open: boolean
  onClose: () => void
  purchase: HkmPurchaseReadDto | null
}

export function EditHKPurchaseModal({
  open,
  onClose,
  purchase,
}: EditHKPurchaseModalProps) {
  const dispatch = useAppDispatch()

  const [requiredDate, setRequiredDate] = useState<string>('')
  const [rows, setRows] = useState<FormItemRow[]>([])
  const [catalogItems, setCatalogItems] = useState<HkmInventoryItemReadDto[]>([])
  const [loadingCatalog, setLoadingCatalog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Fetch HK Inventory Catalog
  useEffect(() => {
    if (open) {
      setLoadingCatalog(true)
      getHkmInventoryItems({ PageSize: 500 })
        .then((res) => {
          setCatalogItems(Array.isArray(res.items) ? res.items : [])
        })
        .catch((err) => {
          console.error('Failed to load HK inventory items', err)
        })
        .finally(() => {
          setLoadingCatalog(false)
        })
    }
  }, [open])

  // Populate form from purchase
  useEffect(() => {
    if (open && purchase) {
      const dateVal = purchase.requiredDate || purchase.createdAt || ''
      setRequiredDate(dateVal ? dateVal.split('T')[0] : '')
      setFormError(null)

      const rawItems = Array.isArray(purchase.items)
        ? purchase.items
        : Array.isArray((purchase as any).purchaseItems)
        ? (purchase as any).purchaseItems
        : []

      if (rawItems.length > 0) {
        setRows(
          rawItems.map((it: any) => ({
            id: it.id,
            itemId: it.itemId || it.id || 0,
            selectedItem: it.itemId
              ? catalogItems.find((c) => c.id === it.itemId) || null
              : null,
            quantity: it.quantity || 1,
            priority: it.priority || 'Normal',
          }))
        )
      } else {
        setRows([{ itemId: 0, selectedItem: null, quantity: 1, priority: 'Normal' }])
      }
    }
  }, [open, purchase, catalogItems])

  // Escape key handler
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, isSubmitting, onClose])

  if (!open || !purchase) return null

  const handleAddRow = () => {
    setRows((prev) => [...prev, { itemId: 0, selectedItem: null, quantity: 1, priority: 'Normal' }])
  }

  const handleRemoveRow = (index: number) => {
    if (rows.length <= 1) return
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const handleItemSelect = (index: number, itemId: number) => {
    const found = catalogItems.find((it) => it.id === itemId) || null
    setRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, itemId, selectedItem: found } : row
      )
    )
  }

  const handleQuantityChange = (index: number, qty: number) => {
    const val = Math.max(1, qty || 1)
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, quantity: val } : row))
    )
  }

  const handlePriorityChange = (index: number, priority: HkmPurchasePriority) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, priority } : row))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!requiredDate) {
      setFormError('Please select a required date.')
      return
    }

    const validRows = rows.filter((r) => r.itemId > 0 && r.quantity > 0)
    if (validRows.length === 0) {
      setFormError('Please select at least one item from the Housekeeping catalog.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        requiredDate: new Date(requiredDate).toISOString(),
        items: validRows.map((r) => ({
          id: r.id,
          itemId: r.itemId,
          quantity: r.quantity,
          priority: r.priority,
        })),
      }

      const res = await dispatch(updateHkmPurchase({ id: purchase.id, payload }))
      if (updateHkmPurchase.fulfilled.match(res)) {
        showSuccessToast(`Purchase request #HK-${purchase.id} updated successfully!`)
        dispatch(fetchHkmPurchases({ PageNumber: 1, PageSize: 10 }))
        onClose()
      } else {
        const errorMsg =
          typeof res.payload === 'string'
            ? res.payload
            : 'Failed to update purchase request. Please try again.'
        setFormError(errorMsg)
        showErrorToast(errorMsg)
      }
    } catch (err: any) {
      const msg = err?.message || 'An unexpected error occurred.'
      setFormError(msg)
      showErrorToast(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose()
      }}
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0B4EA2]">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Edit Purchase Request #HK-{purchase.id}
              </h2>
              <p className="text-xs text-slate-500">
                Update requested items, quantities, or required delivery date
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {formError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs font-medium text-rose-700">
              {formError}
            </div>
          )}

          {/* Required Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Required Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative max-w-xs">
              <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                required
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/20"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Requested Items <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Select housekeeping inventory items, quantities, and priority levels
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#0B4EA2] hover:bg-blue-50/50 transition cursor-pointer shadow-2xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {rows.map((row, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/40 p-3 hover:border-slate-300 transition"
                >
                  {/* Item Dropdown */}
                  <div className="flex-1 min-w-[200px]">
                    <select
                      value={row.itemId || ''}
                      onChange={(e) => handleItemSelect(idx, Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/20"
                    >
                      <option value="" disabled>
                        {loadingCatalog ? 'Loading items...' : 'Select item from HK catalog...'}
                      </option>
                      {catalogItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} {item.unitName ? `(${item.unitName})` : ''} — Stock: {item.quantity}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="w-24 sm:w-24">
                    <input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={row.quantity}
                      onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-800 outline-none transition focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/20"
                    />
                  </div>

                  {/* Priority Selector */}
                  <div className="w-28 sm:w-28">
                    <select
                      value={row.priority}
                      onChange={(e) => handlePriorityChange(idx, e.target.value as HkmPurchasePriority)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/20"
                    >
                      <option value="Low">Low</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  {/* Delete row */}
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="self-center rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                      title="Remove row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#093d7e] transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
