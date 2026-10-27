import { useState, useEffect } from 'react'
import { AlertCircle, Calendar, Loader2, Plus, Trash2, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../../../shared/apis/hooks'
import {
  updateLaundryPurchase,
  fetchLaundryPurchaseById,
} from '../../../../../features/Laundryfeatures/laundryPurchases/laundryPurchasesSlice'
import { SearchableLaundryItemPicker } from '../SearchableLaundryItemPicker'
import { showSuccessToast, showErrorToast } from '../../../../../shared/ui/toastFeedback'
import type {
  LaundryPurchaseReadDto,
  LaundryPurchasePriority,
} from '../../../../../models/Laundrymodels/LaundryPurchase'
import type { LaundryInventoryItemReadDto } from '../../../../../models/Laundrymodels/LaundryInventoryItem'

interface FormItemRow {
  id: number
  itemId: number
  selectedItem: LaundryInventoryItemReadDto | null
  quantity: number
  priority: LaundryPurchasePriority
}

interface EditLaundryPurchaseModalProps {
  open: boolean
  onClose: () => void
  purchase: LaundryPurchaseReadDto | null
}

export function EditLaundryPurchaseModal({
  open,
  onClose,
  purchase,
}: EditLaundryPurchaseModalProps) {
  const dispatch = useAppDispatch()
  const { actionStatus, selectedItem, detailStatus } = useAppSelector(
    (state) => state.laundryPurchases
  )

  const [requiredDate, setRequiredDate] = useState<string>('')
  const [rows, setRows] = useState<FormItemRow[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  // Fetch full details if needed
  useEffect(() => {
    if (open && purchase) {
      dispatch(fetchLaundryPurchaseById(purchase.id))
    }
  }, [open, purchase, dispatch])

  // Populate form from detail or summary
  useEffect(() => {
    if (open && purchase) {
      const activeDetail = selectedItem && selectedItem.id === purchase.id ? selectedItem : purchase
      const dateVal = activeDetail?.requiredDate || ''
      setRequiredDate(dateVal ? dateVal.split('T')[0] : '')
      setFormError(null)

      if (activeDetail?.items && activeDetail.items.length > 0) {
        setRows(
          activeDetail.items.map((it) => ({
            id: it.id || 0,
            itemId: it.itemId,
            selectedItem: {
              id: it.itemId,
              name: it.itemName || `Item #${it.itemId}`,
              quantity: 0,
              minimumStock: 0,
              maximumStock: 0,
              status: 'Normal',
              maintenanceStatus: 'Available',
              categoryId: 0,
              categoryName: '',
              unitId: 0,
              unitName: '',
            },
            quantity: it.quantity,
            priority: it.priority,
          }))
        )
      } else {
        setRows([{ id: 0, itemId: 0, selectedItem: null, quantity: 1, priority: 'Medium' }])
      }
    }
  }, [open, purchase, selectedItem])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && actionStatus !== 'loading') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, actionStatus, onClose])

  if (!open || !purchase) return null

  const isLoading = actionStatus === 'loading'
  const isDetailsLoading = detailStatus === 'loading'

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      { id: 0, itemId: 0, selectedItem: null, quantity: 1, priority: 'Medium' },
    ])
  }

  const handleRemoveRow = (index: number) => {
    if (rows.length === 1) return
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRowChange = (
    index: number,
    field: 'item' | 'quantity' | 'priority',
    value: any
  ) => {
    setRows((prev) => {
      const updated = [...prev]
      if (field === 'item') {
        const it = value as LaundryInventoryItemReadDto | null
        updated[index] = {
          ...updated[index],
          itemId: it ? it.id : 0,
          selectedItem: it,
        }
      } else if (field === 'quantity') {
        const q = parseInt(value, 10)
        updated[index] = {
          ...updated[index],
          quantity: isNaN(q) || q < 1 ? 1 : q,
        }
      } else if (field === 'priority') {
        updated[index] = {
          ...updated[index],
          priority: value as LaundryPurchasePriority,
        }
      }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!requiredDate) {
      setFormError('Please select a required delivery date.')
      return
    }

    const invalidRow = rows.find((r) => !r.itemId || r.itemId <= 0 || r.quantity <= 0)
    if (invalidRow) {
      setFormError('Please select a valid item and quantity for each line.')
      return
    }

    try {
      const payload = {
        requiredDate: new Date(requiredDate).toISOString(),
        items: rows.map((r) => ({
          id: r.id || 0,
          itemId: r.itemId,
          quantity: r.quantity,
          priority: r.priority === 'Medium' ? 'Normal' : r.priority,
        })),
      }

      const res = await dispatch(updateLaundryPurchase({ id: purchase.id, payload }))
      if (updateLaundryPurchase.fulfilled.match(res)) {
        showSuccessToast(`Purchase request #LND-${purchase.id} updated successfully!`)
        onClose()
      } else {
        const errorMsg = (res.payload as string) || 'Failed to update purchase request'
        setFormError(errorMsg)
        showErrorToast(errorMsg)
      }
    } catch (err) {
      showErrorToast(err, 'Failed to update purchase request')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#0B4EA2] px-6 py-4 text-white">
          <div>
            <h2 className="text-base font-bold">Edit Laundry Purchase Request</h2>
            <p className="text-xs text-blue-100 font-mono mt-0.5">#LND-{purchase.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white transition disabled:opacity-50 cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {formError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          {isDetailsLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin text-[#0B4EA2]" />
              <span className="font-medium">Loading purchase details...</span>
            </div>
          ) : (
            <>
              {/* Section 1: Required Delivery Date Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                      <Calendar className="h-4 w-4 text-[#0B4EA2]" />
                      Required Delivery Date <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Expected date for supplies to be delivered
                    </p>
                  </div>
                  <div className="sm:w-56">
                    <input
                      type="date"
                      value={requiredDate}
                      onChange={(e) => setRequiredDate(e.target.value)}
                      disabled={isLoading}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/20 disabled:opacity-60 cursor-pointer shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Requested Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span>Requested Items</span>
                      <span className="rounded-full bg-[#EEF4FF] px-2.5 py-0.5 text-xs font-bold text-[#0B4EA2]">
                        {rows.length} {rows.length === 1 ? 'item' : 'items'}
                      </span>
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#0B4EA2]/30 bg-[#EEF4FF] px-3.5 py-1.5 text-xs font-bold text-[#0B4EA2] hover:bg-[#0B4EA2] hover:text-white transition shadow-2xs cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Item
                  </button>
                </div>

                {/* Item Cards */}
                <div className="space-y-3">
                  {rows.map((row, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 transition-all hover:border-slate-300 shadow-2xs"
                    >
                      {/* Card Header: Item # and Delete Action */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#0B4EA2] bg-[#EEF4FF] px-2.5 py-0.5 rounded-md">
                            Item #{index + 1}
                          </span>
                          {row.selectedItem && (
                            <span className="text-xs text-slate-500 font-medium">
                              Available: <span className="font-bold text-slate-700">{row.selectedItem.quantity} {row.selectedItem.unitName || ''}</span>
                            </span>
                          )}
                        </div>

                        {rows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(index)}
                            disabled={isLoading}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Laundry Item Picker - Full Width */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Laundry Consumable / Item <span className="text-rose-500">*</span>
                        </label>
                        <SearchableLaundryItemPicker
                          value={row.itemId}
                          initialItem={row.selectedItem}
                          onChange={(item) => handleRowChange(index, 'item', item)}
                          disabled={isLoading}
                        />
                      </div>

                      {/* Quantity & Priority side by side */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Quantity <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={row.quantity}
                            onChange={(e) =>
                              handleRowChange(index, 'quantity', e.target.value)
                            }
                            disabled={isLoading}
                            placeholder="Qty"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/20 disabled:opacity-60"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Priority
                          </label>
                          <select
                            value={row.priority}
                            onChange={(e) =>
                              handleRowChange(index, 'priority', e.target.value)
                            }
                            disabled={isLoading}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/20 disabled:opacity-60 cursor-pointer"
                          >
                            <option value="Low">Low</option>
                            <option value="Normal">Normal</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isDetailsLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-800 transition shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
