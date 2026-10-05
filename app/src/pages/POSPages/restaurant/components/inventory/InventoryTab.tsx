import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  AlertCircle,
  ArrowDownUp,
  ChevronDown,
  ClipboardList,
  Edit2,
  Eye,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Modal } from '../../../../../shared/ui/Modal'
import type { AppDispatch, RootState } from '../../../../../store/store'
import { fetchAdminRestaurants } from '../../../../../features/restaurant/restaurantRestaurantsSlice'
import { fetchRestaurantWarehouseDetails } from '../../../../../features/restaurant/restaurantWarehousesSlice'
import { fetchRestaurantMaterials } from '../../../../../features/restaurant/restaurantMaterialsSlice'
import { fetchRestaurantUnits } from '../../../../../features/restaurant/restaurantUnitsSlice'
import {
  clearSelectedRestaurantInventoryItem,
  clearSelectedRestaurantInventoryTransaction,
  fetchRestaurantInventory,
  fetchRestaurantInventoryItem,
  fetchRestaurantInventoryTransaction,
  fetchRestaurantInventoryTransactions,
} from '../../../../../features/restaurant/restaurantInventorySlice'
import {
  cancelRestaurantMaterialRequest,
  clearSelectedRestaurantMaterialRequest,
  createRestaurantMaterialRequest,
  fetchRestaurantMaterialRequest,
  fetchRestaurantMaterialRequests,
  updateRestaurantMaterialRequest,
} from '../../../../../features/restaurant/restaurantMaterialRequestsSlice'
import type { RestaurantInventoryItem, RestaurantInventoryTransaction } from '../../../../../models/RestaurantInventory'
import type {
  CreateMaterialRequestItemRequest,
  MaterialRequest,
  UpdateMaterialRequestItemRequest,
} from '../../../../../models/RestaurantMaterialRequest'
import type { RestaurantMaterial } from '../../../../../models/RestaurantMaterial'
import type { RestaurantUnit } from '../../../../../models/RestaurantUnit'

type MainTab = 'stock' | 'transactions' | 'requests'

type StockFilters = {
  search: string
  restaurantId: string
  warehouseId: string
  materialId: string
  pageNumber: number
}

type TransactionFilters = {
  restaurantId: string
  warehouseId: string
  materialId: string
  transactionType: string
  referenceType: string
  referenceId: string
  dateFrom: string
  dateTo: string
  pageNumber: number
}

type RequestFilters = {
  search: string
  restaurantId: string
  status: string
  dateFrom: string
  dateTo: string
  pageNumber: number
}

type RequestFormRow = {
  rowId: string
  id?: number
  materialId: string
  requestedQuantity: string
  unitId: string
}

const requestStatuses = ['Pending', 'Approved', 'Cancelled', 'Rejected', 'Completed']

function newRow(): RequestFormRow {
  return {
    rowId: `${Date.now()}-${Math.random()}`,
    materialId: '',
    requestedQuantity: '',
    unitId: '',
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  const parsed = new Date(value.replace(' ', 'T'))
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString()
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '-'
  const parsed = new Date(value.replace(' ', 'T'))
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString()
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)
}

function toDateTimeInput(value: string | null | undefined) {
  if (!value) return new Date().toISOString().slice(0, 16)
  const parsed = new Date(value.replace(' ', 'T'))
  return Number.isNaN(parsed.getTime()) ? value.slice(0, 16) : parsed.toISOString().slice(0, 16)
}

function toApiDateTime(value: string, endOfDay = false) {
  if (!value) return undefined
  if (value.includes('T')) {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString()
  }
  return `${value}T${endOfDay ? '23:59:59' : '00:00:00'}`
}

function statusTone(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'pending') return 'bg-amber-50 text-amber-700'
  if (normalized === 'cancelled' || normalized === 'rejected') return 'bg-red-50 text-red-700'
  if (normalized === 'approved' || normalized === 'completed') return 'bg-emerald-50 text-emerald-700'
  return 'bg-slate-100 text-slate-600'
}

function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null

  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

function EmptyState({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-[#004bb4]">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">{text}</p>
    </div>
  )
}

function Pager({
  pageNumber,
  totalPages,
  onChange,
}: {
  pageNumber: number
  totalPages: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="mt-5 flex items-center justify-end gap-3">
      <button
        type="button"
        disabled={pageNumber <= 1}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
        onClick={() => onChange(Math.max(1, pageNumber - 1))}
      >
        Previous
      </button>
      <span className="text-sm text-slate-500">
        Page {pageNumber} of {totalPages}
      </span>
      <button
        type="button"
        disabled={pageNumber >= totalPages}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
        onClick={() => onChange(pageNumber + 1)}
      >
        Next
      </button>
    </div>
  )
}

function DetailDrawer({
  title,
  loading,
  error,
  onClose,
  children,
}: {
  title: string
  loading: boolean
  error?: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <aside className="fixed bottom-0 right-0 top-0 z-[120] w-[520px] max-w-[95vw] overflow-y-auto bg-white shadow-2xl">
      <div className="flex h-[72px] items-center justify-between border-b border-slate-100 px-6">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <button type="button" className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100" onClick={onClose} aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="px-6 py-6">
        {loading ? (
          <div className="flex h-56 items-center justify-center text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            <ErrorBanner message={error} />
            {children}
          </>
        )}
      </div>
    </aside>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 text-sm last:border-b-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  )
}

function InventoryItemDetails({ item }: { item: RestaurantInventoryItem | null }) {
  if (!item) return null

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm text-slate-500">Material</div>
        <div className="mt-1 text-lg font-semibold text-slate-900">{item.materialName}</div>
        <div className="mt-1 text-sm text-slate-500">{item.restaurantName} / {item.warehouseName}</div>
      </div>
      <div className="rounded-xl border border-slate-200 px-4">
        <InfoRow label="Quantity" value={`${formatQuantity(item.quantity)} ${item.unitSymbol}`} />
        <InfoRow label="Unit" value={item.unitName} />
        <InfoRow label="Restaurant" value={item.restaurantName} />
        <InfoRow label="Warehouse" value={item.warehouseName} />
        <InfoRow label="Created" value={formatDateTime(item.createdAt)} />
        <InfoRow label="Updated" value={formatDateTime(item.updatedAt)} />
      </div>
    </div>
  )
}

function TransactionDetails({ transaction }: { transaction: RestaurantInventoryTransaction | null }) {
  if (!transaction) return null

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm text-slate-500">Transaction</div>
        <div className="mt-1 text-lg font-semibold text-slate-900">{transaction.transactionType}</div>
        <div className="mt-1 text-sm text-slate-500">{transaction.materialName}</div>
      </div>
      <div className="rounded-xl border border-slate-200 px-4">
        <InfoRow label="Quantity" value={`${formatQuantity(transaction.quantity)} ${transaction.unitSymbol}`} />
        <InfoRow label="Reference" value={transaction.referenceType} />
        <InfoRow label="Restaurant" value={transaction.restaurantName} />
        <InfoRow label="Warehouse" value={transaction.warehouseName} />
        <InfoRow label="Date" value={formatDateTime(transaction.transactionDate)} />
      </div>
    </div>
  )
}

function MaterialRequestDetails({
  request,
  onEdit,
  onCancel,
}: {
  request: MaterialRequest | null
  onEdit: (request: MaterialRequest) => void
  onCancel: (request: MaterialRequest) => void
}) {
  if (!request) return null
  const isPending = request.status.toLowerCase() === 'pending'

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-slate-500">Request</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{request.requestNumber}</div>
            <div className="mt-1 text-sm text-slate-500">{request.restaurantName}</div>
          </div>
          <span className={['rounded-full px-3 py-1 text-xs font-semibold', statusTone(request.status)].join(' ')}>
            {request.status}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 px-4">
        <InfoRow label="Request Date" value={formatDateTime(request.requestDate)} />
        <InfoRow label="Created" value={formatDateTime(request.createdAt)} />
        <InfoRow label="Created By" value={request.createdBy} />
        <InfoRow label="Items" value={request.items.length} />
      </div>

      <div>
        <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Materials</div>
        <div className="space-y-3">
          {request.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-sm">
              <div>
                <div className="font-semibold text-slate-900">{item.materialName}</div>
                <div className="mt-1 text-slate-500">{item.unitName}</div>
              </div>
              <div className="font-semibold text-slate-900">
                {formatQuantity(item.requestedQuantity)} {item.unitSymbol}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isPending && (
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#004bb4] text-sm font-semibold text-white hover:bg-[#003d91]"
            onClick={() => onEdit(request)}
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </button>
          <button
            type="button"
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50"
            onClick={() => onCancel(request)}
          >
            <X className="h-4 w-4" />
            Cancel Request
          </button>
        </div>
      )}
    </div>
  )
}

function ConfirmModal({
  open,
  title,
  message,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean
  title: string
  message: string
  loading: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="w-[420px] max-w-[95vw] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="px-6 py-6 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-[18px] font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm text-slate-500">{message}</p>
        </div>
        <div className="flex gap-3 bg-slate-50 px-6 py-4">
          <button type="button" className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={onClose}>
            Keep
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel Request'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function MaterialRequestModal({
  open,
  initialData,
  restaurants,
  materials,
  units,
  loading,
  onClose,
  onSave,
}: {
  open: boolean
  initialData: MaterialRequest | null
  restaurants: { id: number; name: string }[]
  materials: RestaurantMaterial[]
  units: RestaurantUnit[]
  loading: boolean
  onClose: () => void
  onSave: (data: { restaurantId: number; requestDate: string; items: (CreateMaterialRequestItemRequest | UpdateMaterialRequestItemRequest)[] }) => Promise<void>
}) {
  const [restaurantId, setRestaurantId] = useState('')
  const [requestDate, setRequestDate] = useState('')
  const [rows, setRows] = useState<RequestFormRow[]>([newRow()])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setRestaurantId(initialData ? String(initialData.restaurantId) : '')
    setRequestDate(toDateTimeInput(initialData?.requestDate))
    setRows(
      initialData?.items?.length
        ? initialData.items.map((item) => ({
            rowId: `${item.id}-${item.materialId}`,
            id: item.id,
            materialId: String(item.materialId),
            requestedQuantity: String(item.requestedQuantity),
            unitId: String(item.unitId),
          }))
        : [newRow()],
    )
    setError(null)
  }, [initialData, open])

  const isEdit = Boolean(initialData)
  const mappedItems = rows
    .filter((row) => Number(row.materialId) > 0 || Number(row.requestedQuantity) > 0 || Number(row.unitId) > 0)
    .map((row) => ({
      ...(row.id ? { id: row.id } : {}),
      materialId: Number(row.materialId),
      requestedQuantity: Number(row.requestedQuantity),
      unitId: Number(row.unitId),
    }))

  const canSubmit =
    Number(restaurantId) > 0 &&
    requestDate.length > 0 &&
    mappedItems.length > 0 &&
    mappedItems.every((item) => item.materialId > 0 && item.unitId > 0 && Number.isFinite(item.requestedQuantity) && item.requestedQuantity > 0) &&
    !loading

  const patchRow = (rowId: string, patch: Partial<RequestFormRow>) => {
    setRows((current) => current.map((row) => (row.rowId === rowId ? { ...row, ...patch } : row)))
  }

  const handleMaterialChange = (rowId: string, materialId: string) => {
    const material = materials.find((item) => item.id === Number(materialId))
    patchRow(rowId, {
      materialId,
      unitId: material ? String(material.unitId) : '',
    })
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    try {
      setError(null)
      await onSave({
        restaurantId: Number(restaurantId),
        requestDate: toApiDateTime(requestDate) ?? requestDate,
        items: mappedItems,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="max-h-[92vh] w-[760px] max-w-[96vw] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#004bb4] px-6 py-4 text-white">
          <h2 className="text-[18px] font-semibold">{isEdit ? 'Edit Material Request' : 'Create Material Request'}</h2>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-132px)] overflow-y-auto px-6 py-5">
          <ErrorBanner message={error ?? undefined} />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Restaurant</span>
              <div className="relative">
                <select
                  value={restaurantId}
                  disabled={isEdit}
                  onChange={(event) => setRestaurantId(event.target.value)}
                  className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 pr-10 text-sm outline-none focus:border-[#004bb4] disabled:opacity-60"
                >
                  <option value="">Select restaurant</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Request Date</span>
              <input
                type="datetime-local"
                value={requestDate}
                disabled={isEdit}
                onChange={(event) => setRequestDate(event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#004bb4] disabled:opacity-60"
              />
            </label>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Request Items</h3>
              <button
                type="button"
                className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-[#004bb4] hover:bg-blue-50"
                onClick={() => setRows((current) => [...current, newRow()])}
              >
                <Plus className="h-4 w-4" />
                Add Row
              </button>
            </div>

            <div className="space-y-3">
              {rows.map((row, index) => (
                <div key={row.rowId} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1.4fr_0.8fr_0.8fr_40px]">
                  <select
                    value={row.materialId}
                    onChange={(event) => handleMaterialChange(row.rowId, event.target.value)}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#004bb4]"
                  >
                    <option value="">Select material</option>
                    {materials.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.requestedQuantity}
                    onChange={(event) => patchRow(row.rowId, { requestedQuantity: event.target.value })}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#004bb4]"
                    placeholder="Qty"
                  />

                  <select
                    value={row.unitId}
                    onChange={(event) => patchRow(row.rowId, { unitId: event.target.value })}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#004bb4]"
                  >
                    <option value="">Unit</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={rows.length === 1}
                    className="grid h-10 w-10 place-items-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-40"
                    onClick={() => setRows((current) => current.filter((item) => item.rowId !== row.rowId))}
                    aria-label={`Remove row ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button type="button" className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            className="flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-[#004bb4] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#003d91] disabled:opacity-50"
            onClick={handleSubmit}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? 'Save Request' : 'Create Request'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function InventoryManagementTab() {
  const dispatch = useDispatch<AppDispatch>()
  const inventory = useSelector((state: RootState) => state.restaurantInventory)
  const requests = useSelector((state: RootState) => state.restaurantMaterialRequests)
  const restaurants = useSelector((state: RootState) => state.restaurantRestaurants.items)
  const warehouses = useSelector((state: RootState) => state.restaurantWarehouses.items)
  const materials = useSelector((state: RootState) => state.restaurantMaterials.items)
  const units = useSelector((state: RootState) => state.restaurantUnits.items)

  const [activeTab, setActiveTab] = useState<MainTab>('stock')
  const [stockFilters, setStockFilters] = useState<StockFilters>({
    search: '',
    restaurantId: '',
    warehouseId: '',
    materialId: '',
    pageNumber: 1,
  })
  const [transactionFilters, setTransactionFilters] = useState<TransactionFilters>({
    restaurantId: '',
    warehouseId: '',
    materialId: '',
    transactionType: '',
    referenceType: '',
    referenceId: '',
    dateFrom: '',
    dateTo: '',
    pageNumber: 1,
  })
  const [requestFilters, setRequestFilters] = useState<RequestFilters>({
    search: '',
    restaurantId: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    pageNumber: 1,
  })
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false)
  const [transactionDrawerOpen, setTransactionDrawerOpen] = useState(false)
  const [requestDrawerOpen, setRequestDrawerOpen] = useState(false)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [editRequest, setEditRequest] = useState<MaterialRequest | null>(null)
  const [cancelTarget, setCancelTarget] = useState<MaterialRequest | null>(null)

  const activeMaterials = useMemo(() => materials.filter((item) => item.isActive), [materials])
  const activeUnits = useMemo(() => units.filter((item) => item.isActive), [units])
  const activeRestaurants = useMemo(() => restaurants.filter((item) => item.isActive), [restaurants])

  const filteredWarehouses = useMemo(() => {
    if (!stockFilters.restaurantId && !transactionFilters.restaurantId) return warehouses
    const restaurantId = Number(stockFilters.restaurantId || transactionFilters.restaurantId)
    return warehouses.filter((warehouse) => warehouse.restaurantId === restaurantId)
  }, [stockFilters.restaurantId, transactionFilters.restaurantId, warehouses])

  const stockQuery = useMemo(
    () => ({
      pageNumber: stockFilters.pageNumber,
      pageSize: 20,
      search: stockFilters.search.trim() || undefined,
      restaurantId: stockFilters.restaurantId ? Number(stockFilters.restaurantId) : undefined,
      warehouseId: stockFilters.warehouseId ? Number(stockFilters.warehouseId) : undefined,
      materialId: stockFilters.materialId ? Number(stockFilters.materialId) : undefined,
    }),
    [stockFilters],
  )

  const transactionsQuery = useMemo(
    () => ({
      pageNumber: transactionFilters.pageNumber,
      pageSize: 20,
      restaurantId: transactionFilters.restaurantId ? Number(transactionFilters.restaurantId) : undefined,
      warehouseId: transactionFilters.warehouseId ? Number(transactionFilters.warehouseId) : undefined,
      materialId: transactionFilters.materialId ? Number(transactionFilters.materialId) : undefined,
      transactionType: transactionFilters.transactionType || undefined,
      referenceType: transactionFilters.referenceType || undefined,
      referenceId: transactionFilters.referenceId ? Number(transactionFilters.referenceId) : undefined,
      dateFrom: toApiDateTime(transactionFilters.dateFrom),
      dateTo: toApiDateTime(transactionFilters.dateTo, true),
    }),
    [transactionFilters],
  )

  const requestsQuery = useMemo(
    () => ({
      pageNumber: requestFilters.pageNumber,
      pageSize: 20,
      search: requestFilters.search.trim() || undefined,
      restaurantId: requestFilters.restaurantId ? Number(requestFilters.restaurantId) : undefined,
      status: requestFilters.status || undefined,
      dateFrom: toApiDateTime(requestFilters.dateFrom),
      dateTo: toApiDateTime(requestFilters.dateTo, true),
    }),
    [requestFilters],
  )

  useEffect(() => {
    dispatch(fetchAdminRestaurants({ pageNumber: 1, pageSize: 100, isActive: true }))
    dispatch(fetchRestaurantWarehouseDetails())
    dispatch(fetchRestaurantMaterials({ pageNumber: 1, pageSize: 1000, isActive: true }))
    dispatch(fetchRestaurantUnits({ pageNumber: 1, pageSize: 1000, isActive: true }))
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchRestaurantInventory(stockQuery))
  }, [dispatch, stockQuery])

  useEffect(() => {
    if (activeTab === 'transactions') dispatch(fetchRestaurantInventoryTransactions(transactionsQuery))
  }, [activeTab, dispatch, transactionsQuery])

  useEffect(() => {
    if (activeTab === 'requests') dispatch(fetchRestaurantMaterialRequests(requestsQuery))
  }, [activeTab, dispatch, requestsQuery])

  const summary = useMemo(() => {
    const lowStock = inventory.items.filter((item) => item.quantity <= 10).length
    return {
      stockItems: inventory.totalCount,
      lowStock,
      requests: requests.totalCount,
      stockQuantity: inventory.items.reduce((total, item) => total + item.quantity, 0),
    }
  }, [inventory.items, inventory.totalCount, requests.totalCount])

  const transactionTypes = useMemo(() => {
    const values = new Set(inventory.transactions.map((item) => item.transactionType).filter(Boolean))
    ;['TransferIn', 'Consumption'].forEach((value) => values.add(value))
    return Array.from(values)
  }, [inventory.transactions])

  const referenceTypes = useMemo(() => {
    const values = new Set(inventory.transactions.map((item) => item.referenceType).filter(Boolean))
    ;['Transfer', 'ProductionPlan'].forEach((value) => values.add(value))
    return Array.from(values)
  }, [inventory.transactions])

  const refresh = () => {
    dispatch(fetchRestaurantInventory(stockQuery))
    if (activeTab === 'transactions') dispatch(fetchRestaurantInventoryTransactions(transactionsQuery))
    if (activeTab === 'requests') dispatch(fetchRestaurantMaterialRequests(requestsQuery))
  }

  const openItemDrawer = (id: number) => {
    setItemDrawerOpen(true)
    dispatch(fetchRestaurantInventoryItem(id))
  }

  const closeItemDrawer = () => {
    setItemDrawerOpen(false)
    dispatch(clearSelectedRestaurantInventoryItem())
  }

  const openTransactionDrawer = (id: number) => {
    setTransactionDrawerOpen(true)
    dispatch(fetchRestaurantInventoryTransaction(id))
  }

  const closeTransactionDrawer = () => {
    setTransactionDrawerOpen(false)
    dispatch(clearSelectedRestaurantInventoryTransaction())
  }

  const openRequestDrawer = (id: number) => {
    setRequestDrawerOpen(true)
    dispatch(fetchRestaurantMaterialRequest(id))
  }

  const closeRequestDrawer = () => {
    setRequestDrawerOpen(false)
    dispatch(clearSelectedRestaurantMaterialRequest())
  }

  const saveMaterialRequest = async (data: {
    restaurantId: number
    requestDate: string
    items: (CreateMaterialRequestItemRequest | UpdateMaterialRequestItemRequest)[]
  }) => {
    if (editRequest) {
      await dispatch(updateRestaurantMaterialRequest({ id: editRequest.id, data: { items: data.items as UpdateMaterialRequestItemRequest[] } })).unwrap()
      dispatch(fetchRestaurantMaterialRequest(editRequest.id))
    } else {
      await dispatch(
        createRestaurantMaterialRequest({
          restaurantId: data.restaurantId,
          requestDate: data.requestDate,
          items: data.items as CreateMaterialRequestItemRequest[],
        }),
      ).unwrap()
    }
    dispatch(fetchRestaurantMaterialRequests(requestsQuery))
  }

  const confirmCancelRequest = async () => {
    if (!cancelTarget) return
    await dispatch(cancelRestaurantMaterialRequest(cancelTarget.id)).unwrap()
    dispatch(fetchRestaurantMaterialRequests(requestsQuery))
    if (requestDrawerOpen) dispatch(fetchRestaurantMaterialRequest(cancelTarget.id))
    setCancelTarget(null)
  }

  const renderRestaurantOptions = () =>
    activeRestaurants.map((restaurant) => (
      <option key={restaurant.id} value={restaurant.id}>
        {restaurant.name}
      </option>
    ))

  const renderWarehouseOptions = (items = warehouses) =>
    items.map((warehouse) => (
      <option key={warehouse.warehouseId} value={warehouse.warehouseId}>
        {warehouse.warehouseName}
      </option>
    ))

  const renderMaterialOptions = () =>
    activeMaterials.map((material) => (
      <option key={material.id} value={material.id}>
        {material.name}
      </option>
    ))

  return (
    <div className="flex h-full flex-col bg-[#F6F8FC] px-8 pt-8 pb-10">
      <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-8 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-[24px] font-semibold text-slate-900">Restaurant Inventory</h2>
              <p className="mt-1 text-sm text-slate-500">Track stock, movement history, and restaurant material requests.</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={refresh}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                type="button"
                className="flex h-10 items-center gap-2 rounded-lg bg-[#004bb4] px-4 text-sm font-semibold text-white hover:bg-[#003d91]"
                onClick={() => {
                  setEditRequest(null)
                  setRequestModalOpen(true)
                }}
              >
                <Plus className="h-4 w-4" />
                New Request
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {[
              { label: 'Stock Items', value: summary.stockItems, icon: Package },
              { label: 'Low Stock Lines', value: summary.lowStock, icon: AlertCircle },
              { label: 'Material Requests', value: summary.requests, icon: ClipboardList },
              { label: 'Visible Stock Qty', value: formatQuantity(summary.stockQuantity), icon: ArrowDownUp },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">{item.label}</span>
                    <Icon className="h-4 w-4 text-[#004bb4]" />
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex border-b border-slate-200 bg-slate-50/70">
          {[
            { key: 'stock' as const, label: 'Stock', icon: Package },
            { key: 'transactions' as const, label: 'Transactions', icon: ArrowDownUp },
            { key: 'requests' as const, label: 'Material Requests', icon: ClipboardList },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'flex flex-1 items-center justify-center gap-2 border-b-[3px] px-4 py-3.5 text-sm font-semibold transition-colors',
                  isActive ? 'border-[#004bb4] bg-white text-[#004bb4]' : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="h-[calc(100%-282px)] overflow-y-auto px-8 py-6">
          {activeTab === 'stock' && (
            <div className="flex min-h-full flex-col">
              <div className="mb-6 grid gap-3 xl:grid-cols-[1.3fr_1fr_1fr_1fr]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={stockFilters.search}
                    onChange={(event) => setStockFilters((current) => ({ ...current, search: event.target.value, pageNumber: 1 }))}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#004bb4]"
                    placeholder="Search stock..."
                  />
                </div>
                <select
                  value={stockFilters.restaurantId}
                  onChange={(event) => setStockFilters((current) => ({ ...current, restaurantId: event.target.value, warehouseId: '', pageNumber: 1 }))}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]"
                >
                  <option value="">All restaurants</option>
                  {renderRestaurantOptions()}
                </select>
                <select
                  value={stockFilters.warehouseId}
                  onChange={(event) => setStockFilters((current) => ({ ...current, warehouseId: event.target.value, pageNumber: 1 }))}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]"
                >
                  <option value="">All warehouses</option>
                  {renderWarehouseOptions(filteredWarehouses)}
                </select>
                <select
                  value={stockFilters.materialId}
                  onChange={(event) => setStockFilters((current) => ({ ...current, materialId: event.target.value, pageNumber: 1 }))}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]"
                >
                  <option value="">All materials</option>
                  {renderMaterialOptions()}
                </select>
              </div>

              <ErrorBanner message={inventory.error} />

              {inventory.status === 'loading' && inventory.items.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : inventory.items.length === 0 ? (
                <EmptyState icon={Package} title="No stock found" text="No inventory lines matched the current filters." />
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="grid h-12 grid-cols-[1.1fr_1fr_1fr_0.8fr_0.8fr_0.9fr] items-center bg-slate-50 px-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <div>Material</div>
                    <div>Restaurant</div>
                    <div>Warehouse</div>
                    <div>Quantity</div>
                    <div>Updated</div>
                    <div className="text-right">Actions</div>
                  </div>
                  {inventory.items.map((item) => (
                    <div key={item.id} className="grid min-h-16 grid-cols-[1.1fr_1fr_1fr_0.8fr_0.8fr_0.9fr] items-center border-t border-slate-100 px-4 text-sm text-slate-700">
                      <div>
                        <div className="font-semibold text-slate-900">{item.materialName}</div>
                        <div className="mt-1 text-xs text-slate-500">{item.unitName}</div>
                      </div>
                      <div>{item.restaurantName}</div>
                      <div>{item.warehouseName}</div>
                      <div className="font-semibold text-slate-900">{formatQuantity(item.quantity)} {item.unitSymbol}</div>
                      <div>{formatDate(item.updatedAt ?? item.createdAt)}</div>
                      <div className="flex justify-end">
                        <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => openItemDrawer(item.id)} aria-label="View stock item">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Pager pageNumber={inventory.pageNumber} totalPages={inventory.totalPages} onChange={(page) => setStockFilters((current) => ({ ...current, pageNumber: page }))} />
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="flex min-h-full flex-col">
              <div className="mb-6 grid gap-3 xl:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr]">
                <select value={transactionFilters.restaurantId} onChange={(event) => setTransactionFilters((current) => ({ ...current, restaurantId: event.target.value, warehouseId: '', pageNumber: 1 }))} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]">
                  <option value="">All restaurants</option>
                  {renderRestaurantOptions()}
                </select>
                <select value={transactionFilters.warehouseId} onChange={(event) => setTransactionFilters((current) => ({ ...current, warehouseId: event.target.value, pageNumber: 1 }))} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]">
                  <option value="">All warehouses</option>
                  {renderWarehouseOptions(filteredWarehouses)}
                </select>
                <select value={transactionFilters.materialId} onChange={(event) => setTransactionFilters((current) => ({ ...current, materialId: event.target.value, pageNumber: 1 }))} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]">
                  <option value="">All materials</option>
                  {renderMaterialOptions()}
                </select>
                <select value={transactionFilters.transactionType} onChange={(event) => setTransactionFilters((current) => ({ ...current, transactionType: event.target.value, pageNumber: 1 }))} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]">
                  <option value="">All transaction types</option>
                  {transactionTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                <input type="date" value={transactionFilters.dateFrom} onChange={(event) => setTransactionFilters((current) => ({ ...current, dateFrom: event.target.value, pageNumber: 1 }))} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]" />
                <input type="date" value={transactionFilters.dateTo} onChange={(event) => setTransactionFilters((current) => ({ ...current, dateTo: event.target.value, pageNumber: 1 }))} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]" />
              </div>

              <div className="mb-6 flex flex-wrap items-center gap-3">
                <select value={transactionFilters.referenceType} onChange={(event) => setTransactionFilters((current) => ({ ...current, referenceType: event.target.value, pageNumber: 1 }))} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]">
                  <option value="">All references</option>
                  {referenceTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                <button
                  type="button"
                  className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => setTransactionFilters((current) => ({ ...current, materialId: '', transactionType: '', referenceType: '', referenceId: '', dateFrom: '', dateTo: '', pageNumber: 1 }))}
                >
                  Clear Filters
                </button>
              </div>

              <ErrorBanner message={inventory.transactionsError} />

              {inventory.transactionsStatus === 'loading' && inventory.transactions.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : inventory.transactions.length === 0 ? (
                <EmptyState icon={ArrowDownUp} title="No transactions found" text="No inventory movement matched the selected filters." />
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="grid h-12 grid-cols-[1fr_1fr_0.7fr_0.8fr_0.9fr_0.9fr] items-center bg-slate-50 px-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <div>Material</div>
                    <div>Warehouse</div>
                    <div>Quantity</div>
                    <div>Type</div>
                    <div>Date</div>
                    <div className="text-right">Actions</div>
                  </div>
                  {inventory.transactions.map((transaction) => (
                    <div key={transaction.id} className="grid min-h-16 grid-cols-[1fr_1fr_0.7fr_0.8fr_0.9fr_0.9fr] items-center border-t border-slate-100 px-4 text-sm text-slate-700">
                      <div>
                        <div className="font-semibold text-slate-900">{transaction.materialName}</div>
                        <div className="mt-1 text-xs text-slate-500">{transaction.referenceType}</div>
                      </div>
                      <div>
                        <div>{transaction.warehouseName}</div>
                        <div className="mt-1 text-xs text-slate-500">{transaction.restaurantName}</div>
                      </div>
                      <div className="font-semibold text-slate-900">{formatQuantity(transaction.quantity)} {transaction.unitSymbol}</div>
                      <div>{transaction.transactionType}</div>
                      <div>{formatDateTime(transaction.transactionDate)}</div>
                      <div className="flex justify-end">
                        <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => openTransactionDrawer(transaction.id)} aria-label="View transaction">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Pager pageNumber={inventory.transactionsPageNumber} totalPages={inventory.transactionsTotalPages} onChange={(page) => setTransactionFilters((current) => ({ ...current, pageNumber: page }))} />
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="flex min-h-full flex-col">
              <div className="mb-6 grid gap-3 xl:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={requestFilters.search} onChange={(event) => setRequestFilters((current) => ({ ...current, search: event.target.value, pageNumber: 1 }))} className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#004bb4]" placeholder="Search requests..." />
                </div>
                <select value={requestFilters.restaurantId} onChange={(event) => setRequestFilters((current) => ({ ...current, restaurantId: event.target.value, pageNumber: 1 }))} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]">
                  <option value="">All restaurants</option>
                  {renderRestaurantOptions()}
                </select>
                <select value={requestFilters.status} onChange={(event) => setRequestFilters((current) => ({ ...current, status: event.target.value, pageNumber: 1 }))} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]">
                  <option value="">All statuses</option>
                  {requestStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <input type="date" value={requestFilters.dateFrom} onChange={(event) => setRequestFilters((current) => ({ ...current, dateFrom: event.target.value, pageNumber: 1 }))} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]" />
                <input type="date" value={requestFilters.dateTo} onChange={(event) => setRequestFilters((current) => ({ ...current, dateTo: event.target.value, pageNumber: 1 }))} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]" />
              </div>

              <ErrorBanner message={requests.error} />

              {requests.status === 'loading' && requests.items.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : requests.items.length === 0 ? (
                <EmptyState icon={ClipboardList} title="No material requests found" text="Create a request when a restaurant needs materials from inventory." />
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="grid h-12 grid-cols-[1fr_1fr_0.8fr_0.6fr_0.8fr_1fr] items-center bg-slate-50 px-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <div>Request</div>
                    <div>Restaurant</div>
                    <div>Status</div>
                    <div>Items</div>
                    <div>Date</div>
                    <div className="text-right">Actions</div>
                  </div>
                  {requests.items.map((request) => {
                    const isPending = request.status.toLowerCase() === 'pending'
                    return (
                      <div key={request.id} className="grid min-h-16 grid-cols-[1fr_1fr_0.8fr_0.6fr_0.8fr_1fr] items-center border-t border-slate-100 px-4 text-sm text-slate-700">
                        <div className="font-semibold text-slate-900">{request.requestNumber}</div>
                        <div>{request.restaurantName}</div>
                        <div>
                          <span className={['rounded-full px-3 py-1 text-xs font-semibold', statusTone(request.status)].join(' ')}>
                            {request.status}
                          </span>
                        </div>
                        <div>{request.items.length}</div>
                        <div>{formatDateTime(request.requestDate)}</div>
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => openRequestDrawer(request.id)} aria-label="View material request">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={!isPending}
                            className="grid h-8 w-8 place-items-center rounded-lg text-[#004bb4] hover:bg-blue-50 disabled:opacity-40"
                            onClick={() => {
                              setEditRequest(request)
                              setRequestModalOpen(true)
                            }}
                            aria-label="Edit material request"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={!isPending}
                            className="grid h-8 w-8 place-items-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-40"
                            onClick={() => setCancelTarget(request)}
                            aria-label="Cancel material request"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <Pager pageNumber={requests.pageNumber} totalPages={requests.totalPages} onChange={(page) => setRequestFilters((current) => ({ ...current, pageNumber: page }))} />
            </div>
          )}
        </div>
      </div>

      {itemDrawerOpen && (
        <DetailDrawer title="Stock Details" loading={inventory.selectedStatus === 'loading'} error={inventory.selectedError} onClose={closeItemDrawer}>
          <InventoryItemDetails item={inventory.selected} />
        </DetailDrawer>
      )}

      {transactionDrawerOpen && (
        <DetailDrawer title="Transaction Details" loading={inventory.selectedTransactionStatus === 'loading'} error={inventory.selectedTransactionError} onClose={closeTransactionDrawer}>
          <TransactionDetails transaction={inventory.selectedTransaction} />
        </DetailDrawer>
      )}

      {requestDrawerOpen && (
        <DetailDrawer title="Material Request" loading={requests.selectedStatus === 'loading'} error={requests.selectedError} onClose={closeRequestDrawer}>
          <MaterialRequestDetails
            request={requests.selected}
            onEdit={(request) => {
              setEditRequest(request)
              setRequestModalOpen(true)
            }}
            onCancel={setCancelTarget}
          />
        </DetailDrawer>
      )}

      <MaterialRequestModal
        open={requestModalOpen}
        initialData={editRequest}
        restaurants={activeRestaurants}
        materials={activeMaterials}
        units={activeUnits}
        loading={requests.mutationStatus === 'loading'}
        onClose={() => {
          setRequestModalOpen(false)
          setEditRequest(null)
        }}
        onSave={saveMaterialRequest}
      />

      <ConfirmModal
        open={Boolean(cancelTarget)}
        title="Cancel Material Request"
        message={`Cancel ${cancelTarget?.requestNumber ?? 'this request'}? This action will update the request status in the backend.`}
        loading={requests.mutationStatus === 'loading'}
        onClose={() => setCancelTarget(null)}
        onConfirm={confirmCancelRequest}
      />
    </div>
  )
}
