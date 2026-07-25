import { useMemo, useState, useEffect, useRef } from 'react'
import {
  AlertTriangle,
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileSearch,
  Filter,
  Folder,
  PackagePlus,
  Pencil,
  Search,
  ShoppingCart,
  Wrench,
  Loader2,
  X,
  Check,
  ChevronsUpDown
} from 'lucide-react'
import { Modal } from '../../shared/ui/Modal'
import { MaintenanceHeader } from '../../widgets/layout/MaintenanceHeader/MaintenanceHeader'
import { useAppDispatch, useAppSelector } from '../../shared/apis/hooks'
import {
  fetchMaintenanceItems,
  fetchLowStockItems,
  addMaintenanceItem,
  editMaintenanceItem,
} from '../../features/maintenance/maintenanceItemsSlice'
import {
  fetchMaintenanceIssues,
  addMaintenanceIssue,
} from '../../features/maintenance/maintenanceIssuesSlice'
import {
  fetchMaintenancePurchases,
  fetchPendingPurchases,
  addMaintenancePurchase,
  changeMaintenancePurchaseStatus,
} from '../../features/maintenance/maintenancePurchasesSlice'
import { fetchMaintenanceCategories } from '../../features/maintenance/maintenanceCategoriesSlice'
import { fetchMaintenanceUnits } from '../../features/maintenance/maintenanceUnitsSlice'
import { fetchPmsRooms } from '../../features/maintenance/pmsRoomsSlice'

import type { PurchaseStatus, PurchaseStatusAction } from '../../models/MaintenancePurchase'
import { getAvailablePurchaseActions } from '../../models/MaintenancePurchase'
import type { MaintenanceItemType, MaintenanceItem } from '../../models/MaintenanceItem'

type InventoryTab = 'Stock Overview' | 'Withdraw Items' | 'Out Stock' | 'Purchase Requests'

const tabOptions: InventoryTab[] = ['Stock Overview', 'Withdraw Items', 'Out Stock', 'Purchase Requests']

export function statusDotClass(status: PurchaseStatus | string): string {
  switch (status) {
    case 'Pending':   return 'bg-amber-500'   // Warm warning yellow/orange
    case 'Viewed':    return 'bg-indigo-500'  // Soft purple/indigo (review phase)
    case 'Approved':  return 'bg-sky-500'     // Clean bright blue
    case 'Ordered':   return 'bg-blue-600'    // Deep blue (in progress)
    case 'Completed': return 'bg-emerald-500' // Success green
    case 'Rejected':  return 'bg-rose-500'    // Red/rose
    case 'Cancelled': return 'bg-slate-500'   // Neutral gray
    default:          return 'bg-slate-400'
  }
}

export function getStatusPill(status: PurchaseStatus | string): string {
  switch (status) {
    case 'Pending':   return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
    case 'Viewed':    return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300'
    case 'Approved':  return 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300'
    case 'Ordered':   return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
    case 'Completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
    case 'Rejected':  return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
    case 'Cancelled': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    default:          return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }
}

function StatCard({ label, value, hint, icon }: { label: string; value: string | number; hint: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#EAF2FF] text-[#0B4EA2]">
          {icon}
        </div>
        <div>
          <div className="text-[20px] font-bold text-slate-800">{value}</div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="text-xs text-slate-400">{hint}</div>
        </div>
      </div>
    </div>
  )
}

function useDebouncedFetch<T extends any[]>(
  action: (...args: T) => any,
  delay: number = 300
) {
  const dispatch = useAppDispatch()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const promiseRef = useRef<{ abort: () => void } | null>(null)

  return (...args: T) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      if (promiseRef.current) {
        promiseRef.current.abort() // Cancel in-flight request
      }
      promiseRef.current = dispatch(action(...args)) as any
    }, delay)
  }
}

function SearchableSelect({
  options,
  value,
  onChange,
  onSearch,
  disabled,
  placeholder
}: {
  options: { id: string | number; name: string }[]
  value: string | number
  onChange: (val: string | number) => void
  onSearch: (q: string) => void
  disabled?: boolean
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    onSearch(e.target.value) // Pass query to parent for debounced fetching
  }

  const selectedOption = options.find(o => o.id === value)

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm disabled:opacity-50"
      >
        <span className="truncate">{selectedOption ? selectedOption.name : (placeholder || 'Select...')}</span>
        <ChevronsUpDown className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          <div className="sticky top-0 bg-white pb-1">
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={handleQueryChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0B4EA2] focus:outline-none"
              autoFocus
            />
          </div>
          {options.length === 0 ? (
            <div className="p-3 text-center text-sm text-slate-500">No results found.</div>
          ) : (
            options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 ${value === opt.id ? 'bg-[#EAF2FF] text-[#0B4EA2] font-medium' : 'text-slate-700'}`}
                onClick={() => {
                  onChange(opt.id)
                  setOpen(false)
                  setQuery('') // Reset query after selection
                  onSearch('') // Reset search
                }}
              >
                {opt.name}
                {value === opt.id && <Check className="h-4 w-4" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function QuickWithdrawModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch()
  const { items } = useAppSelector((state) => state.maintenanceItems)
  const { items: rooms } = useAppSelector((state) => state.rooms)
  const { createStatus } = useAppSelector((state) => state.maintenanceIssues)

  const [itemId, setItemId] = useState<string>('')
  const [qty, setQty] = useState(1)
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [roomId, setRoomId] = useState<string>('')

  useEffect(() => {
    if (open) {
      dispatch(fetchPmsRooms())
      if (items.length > 0 && !itemId) setItemId(items[0].id.toString())
    }
  }, [open, items, itemId, dispatch])

  const selectedItem = items.find(i => i.id.toString() === itemId)

  const handleSubmit = async () => {
    if (!itemId || !roomId) return
    const res = await dispatch(addMaintenanceIssue({
      itemId: itemId, // As string per spec
      quantity: qty,
      reason,
      roomId,
      notes
    }))
    if (addMaintenanceIssue.fulfilled.match(res)) {
      onClose()
    }
  }

  const isLoading = createStatus === 'loading'
  const itemOptions = items.map(i => ({ id: i.id.toString(), name: i.name }))
  const roomOptions = rooms.map(r => ({ id: r.id, name: r.roomNumber }))

  return (
    <Modal open={open} onClose={onClose} closeOnBackdrop={false} disableEscape>
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Quick Withdraw</h3>
          </div>
          <button type="button" disabled={isLoading} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50 cursor-default">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Requested Part</label>
            <SearchableSelect
              options={itemOptions}
              value={itemId}
              onChange={(val) => setItemId(val as string)}
              onSearch={() => { }}
              disabled={isLoading}
              placeholder="Select a part inventory"
            />
            {selectedItem && (
              <p className="mt-2 text-xs text-slate-500">Current Stock: {selectedItem.maximum} pcs</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Quantity</label>
              <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value || 1))} disabled={isLoading} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm disabled:opacity-50" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Room</label>
              <SearchableSelect
                options={roomOptions}
                value={roomId}
                onChange={(val) => setRoomId(val as string)}
                onSearch={() => { }}
                disabled={isLoading}
                placeholder="Select Room"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Reason</label>
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} disabled={isLoading} placeholder="Reason of withdrawal..." className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm disabled:opacity-50" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Notes</label>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} disabled={isLoading} placeholder="Additional notes..." className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm disabled:opacity-50" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isLoading} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleSubmit} disabled={isLoading} className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Withdraw
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function NewPurchaseRequestModal({ open, onClose, defaultItemId }: { open: boolean; onClose: () => void; defaultItemId?: number }) {
  const dispatch = useAppDispatch()
  const { items } = useAppSelector((state) => state.maintenanceItems)
  const { createStatus } = useAppSelector((state) => state.maintenancePurchases)
  const user = useAppSelector((state) => state.auth.user)

  const [itemId, setItemId] = useState<number>(defaultItemId || 0)
  const [priority, setPriority] = useState('Normal')
  const [qty, setQty] = useState(1)
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (open) {
      setItemId(defaultItemId || (items.length > 0 ? Number(items[0].id) : 0))
    }
  }, [open, defaultItemId, items])

  const handleSubmit = async () => {
    if (!itemId) return
    const res = await dispatch(addMaintenancePurchase({
      itemId,
      quantity: qty,
    }))
    if (addMaintenancePurchase.fulfilled.match(res)) {
      onClose()
    }
  }

  const isLoading = createStatus === 'loading'
  const requestedBy = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.fullName || 'System User' : 'System User'

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#004BB5] px-6 py-4 text-white">
          <h2 className="text-lg font-semibold">New Purchase Request</h2>
          <button
            className="text-white hover:opacity-80 transition-opacity disabled:opacity-50 cursor-default"
            disabled={isLoading}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Requested Part */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Requested Part
            </label>
            <select
              value={itemId}
              onChange={(e) => setItemId(Number(e.target.value))}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            >
              <option value={0} disabled>Select a part inventory</option>
              {items.map((entry) => (
                <option key={entry.id} value={entry.id}>{entry.name}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            >
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Request by */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Request by
            </label>
            <input
              type="text"
              readOnly
              value={requestedBy}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Request Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Request Reason
            </label>
            <textarea
              rows={4}
              placeholder="Please explain why these materials are needed..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none placeholder:text-gray-400 disabled:opacity-50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-1/2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-1/2 inline-flex justify-center items-center gap-2 rounded-lg bg-[#004BB5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ItemFormModal({ open, onClose, editingItem }: { open: boolean; onClose: () => void; editingItem?: MaintenanceItem }) {
  const dispatch = useAppDispatch()
  const { createStatus, updateStatus } = useAppSelector(state => state.maintenanceItems)
  const { items: categories } = useAppSelector(state => state.maintenanceCategories)
  const { items: units } = useAppSelector(state => state.maintenanceUnits)

  const debouncedFetchCategories = useDebouncedFetch((query: string) => fetchMaintenanceCategories({ search: query, pageNumber: 1, pageSize: 20 }))
  const debouncedFetchUnits = useDebouncedFetch((query: string) => fetchMaintenanceUnits({ search: query, pageNumber: 1, pageSize: 20 }))

  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [unitId, setUnitId] = useState('')
  const [manufactureName, setManufactureName] = useState('')
  const [warranty, setWarranty] = useState('')
  const [code, setCode] = useState('')
  const [price, setPrice] = useState(0)
  const [type, setType] = useState<MaintenanceItemType>('Product')
  const [minimum, setMinimum] = useState(0)
  const [maximum, setMaximum] = useState(0)
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open) {
      debouncedFetchCategories('')
      debouncedFetchUnits('')

      if (editingItem) {
        setName(editingItem.name)
        setCategoryId(editingItem.categoryId)
        setUnitId(editingItem.unitId)
        setManufactureName(editingItem.manufactureName)
        setWarranty(editingItem.warranty)
        setCode(editingItem.code)
        setPrice(editingItem.price)
        setType(editingItem.type)
        setMinimum(editingItem.minimum)
        setMaximum(editingItem.maximum)
        setLocation(editingItem.location)
        setNotes(editingItem.notes)
      } else {
        setName('')
        setCategoryId('')
        setUnitId('')
        setManufactureName('')
        setWarranty('')
        setCode('')
        setPrice(0)
        setType('Product')
        setMinimum(0)
        setMaximum(0)
        setLocation('')
        setNotes('')
      }
    }
  }, [open, editingItem])

  const handleSubmit = async () => {
    const payload = {
      name, categoryId, unitId, manufactureName, warranty, code,
      price, type, minimum, maximum, location, notes
    }

    if (editingItem) {
      const res = await dispatch(editMaintenanceItem({ id: Number(editingItem.id), payload }))
      if (editMaintenanceItem.fulfilled.match(res)) onClose()
    } else {
      const res = await dispatch(addMaintenanceItem(payload))
      if (addMaintenanceItem.fulfilled.match(res)) onClose()
    }
  }

  const isLoading = createStatus === 'loading' || updateStatus === 'loading'

  return (
    <Modal open={open} onClose={onClose} closeOnBackdrop={false} disableEscape>
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{editingItem ? 'Edit' : 'Add New'} Spare Part</h3>
            <p className="text-sm text-slate-500">Capture an inventory item to keep the spare-parts list up to date.</p>
          </div>
          <button type="button" disabled={isLoading} className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-50 cursor-default">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Part Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} disabled={isLoading} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm disabled:opacity-50" placeholder="e.g. Fan Motor" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Category *</label>
            <SearchableSelect
              options={categories}
              value={categoryId}
              onChange={(val) => setCategoryId(val as string)}
              onSearch={debouncedFetchCategories}
              disabled={isLoading}
              placeholder="Select Category"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Unit *</label>
            <SearchableSelect
              options={units}
              value={unitId}
              onChange={(val) => setUnitId(val as string)}
              onSearch={debouncedFetchUnits}
              disabled={isLoading}
              placeholder="Select Unit"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as MaintenanceItemType)} disabled={isLoading} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm disabled:opacity-50">
              <option value="Product">Product</option>
              <option value="Equipment">Equipment</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Code</label>
            <input value={code} onChange={e => setCode(e.target.value)} disabled={isLoading} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm disabled:opacity-50" placeholder="MNT-xxx" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Manufacture Name</label>
            <input value={manufactureName} onChange={e => setManufactureName(e.target.value)} disabled={isLoading} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm disabled:opacity-50" placeholder="Samsung" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Warranty</label>
            <input value={warranty} onChange={e => setWarranty(e.target.value)} disabled={isLoading} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm disabled:opacity-50" placeholder="1 Year" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Price</label>
            <input type="number" min="0" value={price} onChange={e => setPrice(Number(e.target.value))} disabled={isLoading} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm disabled:opacity-50" placeholder="0" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Minimum Stock</label>
            <input type="number" min="0" value={minimum} onChange={e => setMinimum(Number(e.target.value))} disabled={isLoading} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm disabled:opacity-50" placeholder="0" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Maximum Stock</label>
            <input type="number" min="0" value={maximum} onChange={e => setMaximum(Number(e.target.value))} disabled={isLoading} className={`w-full rounded-xl border ${maximum < minimum ? 'border-rose-500' : 'border-slate-200'} px-4 py-3 text-sm disabled:opacity-50`} placeholder="0" />
            {maximum < minimum && <p className="text-rose-500 text-xs mt-1">Maximum should be ≥ Minimum</p>}
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Location</label>
            <input value={location} onChange={e => setLocation(e.target.value)} disabled={isLoading} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm disabled:opacity-50" placeholder="Warehouse A" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Notes (Optional)</label>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} disabled={isLoading} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm disabled:opacity-50" placeholder="Additional details..." />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isLoading} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-50">Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={isLoading} className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Part
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function MaintenanceInventoryPage() {
  const dispatch = useAppDispatch()

  const [activeTab, setActiveTab] = useState<InventoryTab>('Stock Overview')
  const [quickWithdrawOpen, setQuickWithdrawOpen] = useState(false)
  const [purchaseOpen, setPurchaseOpen] = useState(false)
  const [itemFormOpen, setItemFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MaintenanceItem | undefined>(undefined)
  const [purchaseItemContextId, setPurchaseItemContextId] = useState<number | undefined>(undefined)

  const { items, lowStockItems } = useAppSelector(state => state.maintenanceItems)
  const { items: issues } = useAppSelector(state => state.maintenanceIssues)
  const { pendingItems, items: purchases } = useAppSelector(state => state.maintenancePurchases)

  useEffect(() => {
    dispatch(fetchMaintenanceItems())
    dispatch(fetchLowStockItems())
    dispatch(fetchMaintenanceIssues())
    dispatch(fetchMaintenancePurchases())
    dispatch(fetchPendingPurchases())
  }, [dispatch])

  const openPurchaseModal = (itemId?: number) => {
    setPurchaseItemContextId(itemId)
    setPurchaseOpen(true)
  }

  const openAddItemModal = () => {
    setEditingItem(undefined)
    setItemFormOpen(true)
  }

  const openEditItemModal = (item: MaintenanceItem) => {
    setEditingItem(item)
    setItemFormOpen(true)
  }

  const handleStatusAction = (id: number, action: PurchaseStatusAction, currentStatus: PurchaseStatus) => {
    dispatch(changeMaintenancePurchaseStatus({
      id,
      statusAction: action,
      previousStatus: currentStatus
    }))
  }

  return (
    <>
      <MaintenanceHeader NameMaintenance="Inventory Spare & Parts" />

      <div className="space-y-6 py-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-end">
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => setQuickWithdrawOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#3DA755] px-4 py-2.5 text-sm font-semibold text-white">
                <ArrowDownToLine className="h-4 w-4" />
                Quick Withdraw
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          <StatCard label="Total Items" value={items.length} hint=" " icon={<Folder className="h-5 w-5" />} />
          <StatCard label="Out Stock" value={lowStockItems.length} hint=" " icon={<AlertTriangle className="h-5 w-5" />} />
          <StatCard label="Pending Orders" value={pendingItems.length} hint=" " icon={<ShoppingCart className="h-5 w-5" />} />
        </div>

        <div className="flex border-b border-slate-200 shadow-sm bg-white rounded-xl">
          {tabOptions.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all
                ${tab === activeTab
                  ? "border-[#00479F] text-[#00479F]"
                  : "border-transparent text-slate-600 hover:text-[#00479F]"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Stock Overview' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-1 flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input placeholder="Search inventory..." className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-[#0B4EA2]" />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <button type="button" onClick={openAddItemModal} className="inline-flex items-center gap-2 rounded-xl bg-[#0545A3] px-4 py-2.5 text-sm font-semibold text-white">
                  <PackagePlus className="h-4 w-4" />
                  Add New Spare Part
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Item Code</th>
                      <th className="px-4 py-3 font-semibold">Spare Part Name</th>
                      <th className="px-4 py-3 font-semibold">Category</th>
                      <th className="px-4 py-3 font-semibold">Quantity</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-semibold text-slate-700">{item.code}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{item.name}</td>
                        <td className="px-4 py-3 text-slate-600">{item.categoryName || 'General'}</td>
                        <td className="px-4 py-3 text-slate-600">{item.quantity}</td>
                        <td className="px-4 py-3">
                          <span className={['rounded-full px-2.5 py-1 text-xs font-semibold', item.status === 'Low' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'].join(' ')}>
                            {item.status || 'Available'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => openEditItemModal(item)} className="grid h-8 w-8 place-items-center rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openPurchaseModal(Number(item.id))}
                              className={['rounded-lg px-3 py-1.5 text-xs font-bold bg-[#0B4EA2] text-white hover:opacity-90'].join(' ')}>
                              order
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Withdraw Items' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Item</th>
                      <th className="px-4 py-3 font-semibold">Quantity</th>
                      <th className="px-4 py-3 font-semibold">Action Type</th>
                      <th className="px-4 py-3 font-semibold">Room Name</th>
                      <th className="px-4 py-3 font-semibold">Staff Name</th>
                      <th className="px-4 py-3 font-semibold">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((row) => (
                      <tr key={row.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 text-slate-800">{row.itemName}</td>
                        <td className="px-4 py-3 font-semibold text-rose-600">-{row.quantity}</td>
                        <td className="px-4 py-3"><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">withdraw</span></td>
                        <td className="px-4 py-3 text-slate-600">{row.roomName}</td>
                        <td className="px-4 py-3 text-slate-700">{row.createdBy}</td>
                        <td className="px-4 py-3 text-slate-600">{row.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Out Stock' && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-rose-200 pb-4">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
              <h2 className="text-[16px] font-bold text-rose-600">Low Stock Alerts</h2>
            </div>

            <div className="grid gap-4 xl:grid-cols-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-rose-200 bg-white p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-base font-bold text-slate-800">{item.name}</div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700"><AlertTriangle className="h-3.5 w-3.5" /> Low</span>
                  </div>
                  <div className="space-y-3 text-sm text-slate-700">
                    <div className="flex items-center justify-between"><span>Minimum:</span><span className="font-bold">{item.minimum}</span></div>
                    <div className="flex items-center justify-between"><span>Location:</span><span className="font-bold text-slate-700">{item.location}</span></div>
                  </div>
                  <button type="button" onClick={() => openPurchaseModal(Number(item.id))} className="mt-4 w-full rounded-xl bg-[#EF4444] px-4 py-2.5 text-sm font-semibold text-white">Create Purchase Request</button>
                </div>
              ))}
              {lowStockItems.length === 0 && (
                <div className="text-slate-500 col-span-4">No low stock items.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Purchase Requests' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {purchases.map((row) => {
                const availableActions = getAvailablePurchaseActions(row.status)
                return (
                  <div key={row.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#EEF4FF]">
                        <FileSearch className="h-5 w-5 text-[#0B4EA2]" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{row.itemName} ({row.quantity} units)</div>
                        <div className="text-xs text-slate-500">Request ID: PR-{row.id} • Requested by {row.createdBy || 'System User'}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className={['inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold select-none', getStatusPill(row.status)].join(' ')}>
                        <span className={['h-2 w-2 rounded-full', statusDotClass(row.status)].join(' ')} />
                        {row.status}
                      </span>

                      {availableActions.length > 0 && (
                        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                          {availableActions.map((opt) => (
                            <button
                              key={opt.action}
                              type="button"
                              onClick={() => handleStatusAction(row.id, opt.action, row.status)}
                              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                                opt.variant === 'primary'
                                  ? 'bg-[#0B4EA2] text-white hover:bg-blue-800'
                                  : opt.variant === 'success'
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  : opt.variant === 'danger'
                                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                                  : opt.variant === 'warning'
                                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                                  : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {purchases.length === 0 && (
                <div className="text-slate-500">No purchase requests found.</div>
              )}
            </div>
          </div>
        )}

        <QuickWithdrawModal open={quickWithdrawOpen} onClose={() => setQuickWithdrawOpen(false)} />
        <NewPurchaseRequestModal open={purchaseOpen} onClose={() => setPurchaseOpen(false)} defaultItemId={purchaseItemContextId} />
        <ItemFormModal open={itemFormOpen} onClose={() => setItemFormOpen(false)} editingItem={editingItem} />
      </div>
    </>
  )
}
