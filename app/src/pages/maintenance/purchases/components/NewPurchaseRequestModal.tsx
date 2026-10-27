import { useState, useEffect } from 'react'
import { AlertCircle, Calendar, Loader2, PackagePlus, Plus, Trash2, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../../shared/apis/hooks'
import { addMaintenancePurchase } from '../../../../features/maintenance/maintenancePurchasesSlice'
import { SearchableMaintenanceItemPicker } from './SearchableMaintenanceItemPicker'
import { showSuccessToast, showErrorToast } from '../../../../shared/ui/toastFeedback'
import type { PurchasePriority } from '../../../../models/MaintenancePurchase'
import type { MaintenanceItem } from '../../../../models/MaintenanceItem'

interface FormItemRow {
  itemId: number
  selectedItem: MaintenanceItem | null
  quantity: number
  priority: PurchasePriority
}

interface NewPurchaseRequestModalProps {
  open: boolean
  onClose: () => void
  defaultItemId?: number
  defaultItemName?: string
}

export function NewPurchaseRequestModal({
  open,
  onClose,
  defaultItemId,
  defaultItemName,
}: NewPurchaseRequestModalProps) {
  const dispatch = useAppDispatch()
  const { createStatus } = useAppSelector((state) => state.maintenancePurchases)

  // Default requiredDate to 3 days from today in YYYY-MM-DD format
  const getDefaultDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d.toISOString().split('T')[0]
  }

  const [requiredDate, setRequiredDate] = useState<string>(getDefaultDate())
  const [reason, setReason] = useState<string>('')
  const [rows, setRows] = useState<FormItemRow[]>([
    { itemId: 0, selectedItem: null, quantity: 1, priority: 'Normal' },
  ])
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setRequiredDate(getDefaultDate())
      setReason('')
      setFormError(null)

      if (defaultItemId) {
        setRows([
          {
            itemId: defaultItemId,
            selectedItem: defaultItemName
              ? {
                  id: defaultItemId.toString(),
                  name: defaultItemName,
                  categoryId: '',
                  categoryName: '',
                  unitId: '',
                  unitName: '',
                  manufactureName: '',
                  warranty: '',
                  code: '',
                  price: 0,
                  type: 'Product',
                  quantity: 0,
                  minimum: 0,
                  maximum: 0,
                  location: '',
                  notes: '',
                }
              : null,
            quantity: 1,
            priority: 'Normal',
          },
        ])
      } else {
        setRows([{ itemId: 0, selectedItem: null, quantity: 1, priority: 'Normal' }])
      }
    }
  }, [open, defaultItemId, defaultItemName])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && createStatus !== 'loading') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, createStatus, onClose])

  if (!open) return null

  const isLoading = createStatus === 'loading'

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      { itemId: 0, selectedItem: null, quantity: 1, priority: 'Normal' },
    ])
  }

  const handleRemoveRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRowChange = (
    index: number,
    field: 'item' | 'quantity' | 'priority',
    value: any
  ) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r
        if (field === 'item') {
          const item = value as MaintenanceItem | null
          return {
            ...r,
            selectedItem: item,
            itemId: item ? Number(item.id) : 0,
          }
        }
        if (field === 'quantity') {
          return { ...r, quantity: Math.max(1, parseInt(value, 10) || 1) }
        }
        if (field === 'priority') {
          return { ...r, priority: value as PurchasePriority }
        }
        return r
      })
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!requiredDate) {
      setFormError('Please select a required delivery date.')
      return
    }

    if (!reason.trim()) {
      setFormError('Please provide a reason or justification for this request.')
      return
    }

    if (rows.length === 0) {
      setFormError('Please add at least one spare part item.')
      return
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (!row.itemId) {
        setFormError(`Please select a spare part for line #${i + 1}.`)
        return
      }
      if (row.quantity <= 0) {
        setFormError(`Quantity for line #${i + 1} must be at least 1.`)
        return
      }
    }

    try {
      const payloadDate = new Date(requiredDate).toISOString()
      const res = await dispatch(
        addMaintenancePurchase({
          requiredDate: payloadDate,
          reason: reason.trim(),
          items: rows.map((r) => ({
            itemId: r.itemId,
            quantity: r.quantity,
            priority: r.priority,
          })),
        })
      )

      if (addMaintenancePurchase.fulfilled.match(res)) {
        showSuccessToast('Purchase request created successfully!')
        onClose()
      } else {
        showErrorToast(res.payload, 'Failed to create purchase request')
      }
    } catch (err) {
      showErrorToast(err, 'Failed to create purchase request')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#0B4EA2] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white">
              <PackagePlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">New Maintenance Purchase Request</h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Create a requisition for one or more spare parts with delivery and urgency details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
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

          {/* Section 1: Required Delivery Date Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <Calendar className="h-4 w-4 text-[#0B4EA2]" />
                  Required Delivery Date <span className="text-rose-500">*</span>
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Expected date for spare parts to be received on site
                </p>
              </div>
              <div className="sm:w-64">
                <input
                  type="date"
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/20 disabled:opacity-60 cursor-pointer shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Requested Parts List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>Requested Parts</span>
                  <span className="rounded-full bg-[#EEF4FF] px-2.5 py-0.5 text-xs font-bold text-[#0B4EA2]">
                    {rows.length} {rows.length === 1 ? 'part' : 'parts'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select spare parts, quantities, and urgency levels for each item
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddRow}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#0B4EA2]/30 bg-[#EEF4FF] px-3.5 py-2 text-xs font-bold text-[#0B4EA2] hover:bg-[#0B4EA2] hover:text-white transition shadow-2xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Another Part
              </button>
            </div>

            {/* Desktop Column Header */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Spare Part</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-3">Priority</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {/* Item Rows */}
            <div className="space-y-2.5">
              {rows.map((row, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-all space-y-3 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-3 sm:items-center"
                >
                  {/* Line Number */}
                  <div className="hidden sm:flex sm:col-span-1 items-center font-mono text-xs font-bold text-slate-400">
                    #{index + 1}
                  </div>

                  {/* Spare Part Picker */}
                  <div className="sm:col-span-5">
                    <div className="sm:hidden text-xs font-bold text-slate-500 mb-1">
                      Part #{index + 1}
                    </div>
                    <SearchableMaintenanceItemPicker
                      value={row.itemId}
                      initialItem={row.selectedItem}
                      onChange={(item) => handleRowChange(index, 'item', item)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Quantity */}
                  <div className="sm:col-span-2">
                    <div className="sm:hidden text-xs font-bold text-slate-500 mb-1">
                      Quantity
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={row.quantity}
                      onChange={(e) =>
                        handleRowChange(index, 'quantity', e.target.value)
                      }
                      disabled={isLoading}
                      placeholder="Qty"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#0B4EA2] focus:bg-white focus:ring-2 focus:ring-[#0B4EA2]/20 disabled:opacity-60"
                    />
                  </div>

                  {/* Priority */}
                  <div className="sm:col-span-3">
                    <div className="sm:hidden text-xs font-bold text-slate-500 mb-1">
                      Priority
                    </div>
                    <select
                      value={row.priority}
                      onChange={(e) =>
                        handleRowChange(index, 'priority', e.target.value)
                      }
                      disabled={isLoading}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#0B4EA2] focus:bg-white focus:ring-2 focus:ring-[#0B4EA2]/20 disabled:opacity-60 cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  {/* Action */}
                  <div className="sm:col-span-1 flex items-center justify-end sm:justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(index)}
                      disabled={isLoading || rows.length === 1}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-20 disabled:cursor-not-allowed"
                      title={rows.length === 1 ? 'At least one part is required' : 'Remove line'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3 (Bottom): Reason / Justification */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Reason / Justification <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400">
                {reason.trim().length > 0 ? `${reason.trim().length} characters` : 'Required'}
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Provide justification for requisition (e.g., Critical replacement bearings for AHU-02 in North Wing, current bearings seized)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/20 disabled:opacity-60 resize-none shadow-2xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500 font-medium">
              Requisition will be submitted in <span className="font-semibold text-amber-600">Pending</span> status
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-800 transition shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Request ({rows.length} {rows.length === 1 ? 'part' : 'parts'})
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
