import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  AlertCircle,
  ArrowDownUp,
  Building2,
  ChevronDown,
  Edit2,
  Eye,
  Loader2,
  PackageSearch,
  RefreshCw,
  Search,
  Store,
  Warehouse,
  X,
} from 'lucide-react'
import { Modal } from '../../../../../shared/ui/Modal'
import type { AppDispatch, RootState } from '../../../../../store/store'
import {
  fetchAdminRestaurants,
  toggleAdminRestaurantStatus,
  updateAdminRestaurant,
  updateAdminRestaurantWarehouse,
} from '../../../../../features/restaurant/restaurantRestaurantsSlice'
import {
  clearSelectedRestaurantWarehouseDetails,
  fetchRestaurantWarehouseDetails,
  fetchRestaurantWarehouseDetailsById,
  fetchRestaurantWarehouseTransactions,
  toggleRestaurantWarehouseStatus,
  updateRestaurantWarehouse,
} from '../../../../../features/restaurant/restaurantWarehousesSlice'
import type {
  RestaurantAdmin,
  RestaurantWarehouse,
  WarehouseDetails,
  WarehouseMaterialStock,
} from '../../../../../models/RestaurantAdmin'

type MainTab = 'restaurants' | 'warehouses' | 'transactions'
type StatusFilter = 'all' | 'active' | 'inactive'

type WarehouseEditTarget = {
  id: number
  restaurantId: number
  name: string
  isActive: boolean
  source: 'restaurant' | 'warehouse'
}

type TransactionFilters = {
  warehouseId: string
  materialId: string
  transactionType: string
  referenceType: string
  referenceId: string
  dateFrom: string
  dateTo: string
  pageNumber: number
}

function statusFilterValue(value: StatusFilter) {
  if (value === 'active') return true
  if (value === 'inactive') return false
  return undefined
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

function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null

  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={[
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600',
      ].join(' ')}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function EmptyState({ icon: Icon, title, text }: { icon: typeof Warehouse; title: string; text: string }) {
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

function EditRestaurantModal({
  restaurant,
  open,
  loading,
  onClose,
  onSave,
}: {
  restaurant: RestaurantAdmin | null
  open: boolean
  loading: boolean
  onClose: () => void
  onSave: (name: string) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setName(restaurant?.name ?? '')
    setError(null)
  }, [open, restaurant])

  const canSubmit = name.trim().length > 0 && !loading

  const handleSubmit = async () => {
    if (!canSubmit) return
    try {
      setError(null)
      await onSave(name.trim())
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="w-[480px] max-w-[95vw] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#004bb4] px-6 py-4 text-white">
          <h2 className="text-[18px] font-semibold">Edit Restaurant</h2>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <ErrorBanner message={error ?? undefined} />
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Restaurant Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#004bb4]"
              placeholder="Restaurant name"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button type="button" className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            className="flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-[#004bb4] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#003d91] disabled:opacity-50"
            onClick={handleSubmit}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function EditWarehouseModal({
  warehouse,
  open,
  loading,
  onClose,
  onSave,
}: {
  warehouse: WarehouseEditTarget | null
  open: boolean
  loading: boolean
  onClose: () => void
  onSave: (data: { name: string; isActive: boolean }) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setName(warehouse?.name ?? '')
    setIsActive(warehouse?.isActive ?? true)
    setError(null)
  }, [open, warehouse])

  const canSubmit = name.trim().length > 0 && !loading

  const handleSubmit = async () => {
    if (!canSubmit) return
    try {
      setError(null)
      await onSave({ name: name.trim(), isActive })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="w-[520px] max-w-[95vw] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#004bb4] px-6 py-4 text-white">
          <h2 className="text-[18px] font-semibold">Edit Warehouse</h2>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <ErrorBanner message={error ?? undefined} />
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Warehouse Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#004bb4]"
              placeholder="Warehouse name"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Status</span>
            <select
              value={isActive ? 'active' : 'inactive'}
              onChange={(event) => setIsActive(event.target.value === 'active')}
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#004bb4]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button type="button" className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            className="flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-[#004bb4] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#003d91] disabled:opacity-50"
            onClick={handleSubmit}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function WarehouseDetailsDrawer({
  details,
  loading,
  error,
  onClose,
}: {
  details: WarehouseDetails | null
  loading: boolean
  error?: string
  onClose: () => void
}) {
  return (
    <aside className="fixed bottom-0 right-0 top-0 z-[120] w-[520px] max-w-[95vw] overflow-y-auto bg-white shadow-2xl">
      <div className="flex h-[72px] items-center justify-between border-b border-slate-100 px-6">
        <h2 className="text-lg font-semibold text-slate-900">Warehouse Details</h2>
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
            {details && (
              <>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm text-slate-500">Warehouse</div>
                      <div className="mt-1 text-lg font-semibold text-slate-900">{details.warehouseName}</div>
                      <div className="mt-1 text-sm text-slate-500">{details.restaurantName}</div>
                    </div>
                    <StatusBadge active={details.isActive} />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Stock Materials</h3>
                    <span className="text-sm font-semibold text-slate-900">{details.materials.length}</span>
                  </div>

                  {details.materials.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                      No material stock in this warehouse.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {details.materials.map((material) => (
                        <div key={material.materialId} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                          <div>
                            <div className="font-semibold text-slate-900">{material.materialName}</div>
                            <div className="mt-1 text-sm text-slate-500">{material.unitName}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-slate-900">{formatQuantity(material.quantity)}</div>
                            <div className="mt-1 text-xs text-slate-500">Qty</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </aside>
  )
}

function stockTotal(materials: WarehouseMaterialStock[]) {
  return materials.reduce((total, material) => total + material.quantity, 0)
}

export function WarehouseManagementTab() {
  const dispatch = useDispatch<AppDispatch>()
  const restaurantsState = useSelector((state: RootState) => state.restaurantRestaurants)
  const warehousesState = useSelector((state: RootState) => state.restaurantWarehouses)

  const [activeTab, setActiveTab] = useState<MainTab>('restaurants')
  const [restaurantSearch, setRestaurantSearch] = useState('')
  const [restaurantStatus, setRestaurantStatus] = useState<StatusFilter>('all')
  const [restaurantPage, setRestaurantPage] = useState(1)
  const [warehouseSearch, setWarehouseSearch] = useState('')
  const [warehouseStatus, setWarehouseStatus] = useState<StatusFilter>('all')
  const [editRestaurant, setEditRestaurant] = useState<RestaurantAdmin | null>(null)
  const [editWarehouse, setEditWarehouse] = useState<WarehouseEditTarget | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [transactionFilters, setTransactionFilters] = useState<TransactionFilters>({
    warehouseId: '',
    materialId: '',
    transactionType: '',
    referenceType: '',
    referenceId: '',
    dateFrom: '',
    dateTo: '',
    pageNumber: 1,
  })

  const restaurantQuery = useMemo(
    () => ({
      pageNumber: restaurantPage,
      pageSize: 20,
      search: restaurantSearch.trim() || undefined,
      isActive: statusFilterValue(restaurantStatus),
    }),
    [restaurantPage, restaurantSearch, restaurantStatus],
  )

  useEffect(() => {
    dispatch(fetchAdminRestaurants(restaurantQuery))
  }, [dispatch, restaurantQuery])

  useEffect(() => {
    dispatch(fetchRestaurantWarehouseDetails())
  }, [dispatch])

  useEffect(() => {
    if (transactionFilters.warehouseId || warehousesState.items.length === 0) return
    setTransactionFilters((current) => ({ ...current, warehouseId: String(warehousesState.items[0].warehouseId) }))
  }, [transactionFilters.warehouseId, warehousesState.items])

  useEffect(() => {
    if (activeTab !== 'transactions' || !transactionFilters.warehouseId) return

    const warehouseId = Number(transactionFilters.warehouseId)
    const selectedWarehouse = warehousesState.items.find((item) => item.warehouseId === warehouseId)

    dispatch(
      fetchRestaurantWarehouseTransactions({
        id: warehouseId,
        params: {
          pageNumber: transactionFilters.pageNumber,
          pageSize: 20,
          restaurantId: selectedWarehouse?.restaurantId,
          warehouseId,
          materialId: transactionFilters.materialId ? Number(transactionFilters.materialId) : undefined,
          transactionType: transactionFilters.transactionType || undefined,
          referenceType: transactionFilters.referenceType || undefined,
          referenceId: transactionFilters.referenceId ? Number(transactionFilters.referenceId) : undefined,
          dateFrom: transactionFilters.dateFrom || undefined,
          dateTo: transactionFilters.dateTo || undefined,
        },
      }),
    )
  }, [activeTab, dispatch, transactionFilters, warehousesState.items])

  const visibleWarehouses = useMemo(() => {
    const normalized = warehouseSearch.trim().toLowerCase()
    const activeValue = statusFilterValue(warehouseStatus)
    return warehousesState.items.filter((warehouse) => {
      const matchesSearch =
        !normalized ||
        [warehouse.warehouseName, warehouse.restaurantName].some((value) => value.toLowerCase().includes(normalized))
      const matchesStatus = activeValue === undefined || warehouse.isActive === activeValue
      return matchesSearch && matchesStatus
    })
  }, [warehouseSearch, warehouseStatus, warehousesState.items])

  const selectedTransactionWarehouse = useMemo(
    () => warehousesState.items.find((item) => item.warehouseId === Number(transactionFilters.warehouseId)),
    [transactionFilters.warehouseId, warehousesState.items],
  )

  const summary = useMemo(() => {
    const activeRestaurants = restaurantsState.items.filter((item) => item.isActive).length
    const activeWarehouses = warehousesState.items.filter((item) => item.isActive).length
    const materialsCount = warehousesState.items.reduce((total, item) => total + item.materials.length, 0)
    return {
      activeRestaurants,
      activeWarehouses,
      materialsCount,
      stockQuantity: warehousesState.items.reduce((total, item) => total + stockTotal(item.materials), 0),
    }
  }, [restaurantsState.items, warehousesState.items])

  const refreshAll = () => {
    dispatch(fetchAdminRestaurants(restaurantQuery))
    dispatch(fetchRestaurantWarehouseDetails())
    if (activeTab === 'transactions' && transactionFilters.warehouseId) {
      dispatch(
        fetchRestaurantWarehouseTransactions({
          id: Number(transactionFilters.warehouseId),
          params: { pageNumber: transactionFilters.pageNumber, pageSize: 20 },
        }),
      )
    }
  }

  const openDetails = (id: number) => {
    setDrawerOpen(true)
    dispatch(fetchRestaurantWarehouseDetailsById(id))
  }

  const closeDetails = () => {
    setDrawerOpen(false)
    dispatch(clearSelectedRestaurantWarehouseDetails())
  }

  const handleRestaurantStatus = async (restaurant: RestaurantAdmin) => {
    await dispatch(toggleAdminRestaurantStatus({ id: restaurant.id, activate: !restaurant.isActive })).unwrap()
    dispatch(fetchAdminRestaurants(restaurantQuery))
  }

  const handleWarehouseStatus = async (warehouse: WarehouseDetails) => {
    await dispatch(toggleRestaurantWarehouseStatus({ id: warehouse.warehouseId, activate: !warehouse.isActive })).unwrap()
    dispatch(fetchRestaurantWarehouseDetails())
    dispatch(fetchAdminRestaurants(restaurantQuery))
  }

  const transactionTypes = useMemo(() => {
    const values = new Set(warehousesState.transactions.map((item) => item.transactionType).filter(Boolean))
    ;['TransferIn', 'Consumption'].forEach((value) => values.add(value))
    return Array.from(values)
  }, [warehousesState.transactions])

  const referenceTypes = useMemo(() => {
    const values = new Set(warehousesState.transactions.map((item) => item.referenceType).filter(Boolean))
    ;['Transfer', 'ProductionPlan'].forEach((value) => values.add(value))
    return Array.from(values)
  }, [warehousesState.transactions])

  const isMutating = restaurantsState.mutationStatus === 'loading' || warehousesState.mutationStatus === 'loading'

  return (
    <div className="flex h-full flex-col bg-[#F6F8FC] px-8 pt-8 pb-10">
      <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-8 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-[24px] font-semibold text-slate-900">Restaurant Warehouses</h2>
              <p className="mt-1 text-sm text-slate-500">Manage restaurant locations, linked warehouses, stock, and movement history.</p>
            </div>
            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={refreshAll}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {[
              { label: 'Active Restaurants', value: summary.activeRestaurants, icon: Store },
              { label: 'Active Warehouses', value: summary.activeWarehouses, icon: Warehouse },
              { label: 'Material Lines', value: summary.materialsCount, icon: PackageSearch },
              { label: 'Total Stock Qty', value: formatQuantity(summary.stockQuantity), icon: ArrowDownUp },
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
            { key: 'restaurants' as const, label: 'Restaurants', icon: Store },
            { key: 'warehouses' as const, label: 'Warehouses', icon: Warehouse },
            { key: 'transactions' as const, label: 'Transactions', icon: ArrowDownUp },
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
                  isActive
                    ? 'border-[#004bb4] bg-white text-[#004bb4]'
                    : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="h-[calc(100%-282px)] overflow-y-auto px-8 py-6">
          {activeTab === 'restaurants' && (
            <div className="flex min-h-full flex-col">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={restaurantSearch}
                    onChange={(event) => {
                      setRestaurantSearch(event.target.value)
                      setRestaurantPage(1)
                    }}
                    className="h-10 w-[280px] rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#004bb4]"
                    placeholder="Search restaurants..."
                  />
                </div>
                <select
                  value={restaurantStatus}
                  onChange={(event) => {
                    setRestaurantStatus(event.target.value as StatusFilter)
                    setRestaurantPage(1)
                  }}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <ErrorBanner message={restaurantsState.error} />

              {restaurantsState.status === 'loading' && restaurantsState.items.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : restaurantsState.items.length === 0 ? (
                <EmptyState icon={Store} title="No restaurants found" text="The restaurant API returned no locations for the current filters." />
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="grid h-12 grid-cols-[1.2fr_1fr_0.8fr_0.8fr_1fr_1fr] items-center bg-slate-50 px-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <div>Restaurant</div>
                    <div>Warehouse</div>
                    <div>Restaurant Status</div>
                    <div>Warehouse Status</div>
                    <div>Created</div>
                    <div className="text-right">Actions</div>
                  </div>

                  {restaurantsState.items.map((restaurant) => (
                    <div key={restaurant.id} className="grid min-h-16 grid-cols-[1.2fr_1fr_0.8fr_0.8fr_1fr_1fr] items-center border-t border-slate-100 px-4 text-sm text-slate-700">
                      <div>
                        <div className="font-semibold text-slate-900">{restaurant.name}</div>
                        <div className="mt-1 text-xs text-slate-500">{restaurant.warehouse?.name ?? 'No linked warehouse'}</div>
                      </div>
                      <div className="font-medium text-slate-700">{restaurant.warehouse?.name ?? '-'}</div>
                      <div><StatusBadge active={restaurant.isActive} /></div>
                      <div>{restaurant.warehouse ? <StatusBadge active={restaurant.warehouse.isActive} /> : '-'}</div>
                      <div>{formatDate(restaurant.createdAt)}</div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="grid h-8 w-8 place-items-center rounded-lg text-[#004bb4] hover:bg-blue-50"
                          onClick={() => setEditRestaurant(restaurant)}
                          aria-label="Edit restaurant"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {restaurant.warehouse && (
                          <button
                            type="button"
                            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                            onClick={() =>
                              setEditWarehouse({
                                id: restaurant.warehouse!.id,
                                restaurantId: restaurant.id,
                                name: restaurant.warehouse!.name,
                                isActive: restaurant.warehouse!.isActive,
                                source: 'restaurant',
                              })
                            }
                            aria-label="Edit linked warehouse"
                          >
                            <Warehouse className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          disabled={isMutating}
                          onClick={() => handleRestaurantStatus(restaurant)}
                        >
                          {restaurant.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {restaurantsState.totalPages > 1 && (
                <div className="mt-5 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={!restaurantsState.pageNumber || restaurantsState.pageNumber <= 1}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                    onClick={() => setRestaurantPage((page) => Math.max(1, page - 1))}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-500">
                    Page {restaurantsState.pageNumber} of {restaurantsState.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={restaurantsState.pageNumber >= restaurantsState.totalPages}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                    onClick={() => setRestaurantPage((page) => page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'warehouses' && (
            <div className="flex min-h-full flex-col">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={warehouseSearch}
                    onChange={(event) => setWarehouseSearch(event.target.value)}
                    className="h-10 w-[280px] rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#004bb4]"
                    placeholder="Search warehouses..."
                  />
                </div>
                <select
                  value={warehouseStatus}
                  onChange={(event) => setWarehouseStatus(event.target.value as StatusFilter)}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <ErrorBanner message={warehousesState.error} />

              {warehousesState.status === 'loading' && warehousesState.items.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : visibleWarehouses.length === 0 ? (
                <EmptyState icon={Warehouse} title="No warehouses found" text="No warehouse inventory matched the current filters." />
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {visibleWarehouses.map((warehouse) => (
                    <div key={warehouse.warehouseId} className="rounded-xl border border-slate-200 bg-white p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Warehouse className="h-5 w-5 text-[#004bb4]" />
                            <h3 className="text-lg font-semibold text-slate-900">{warehouse.warehouseName}</h3>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                            <Building2 className="h-4 w-4" />
                            {warehouse.restaurantName}
                          </div>
                        </div>
                        <StatusBadge active={warehouse.isActive} />
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-slate-50 p-3">
                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Materials</div>
                          <div className="mt-1 text-xl font-semibold text-slate-900">{warehouse.materials.length}</div>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-3">
                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stock Qty</div>
                          <div className="mt-1 text-xl font-semibold text-slate-900">{formatQuantity(stockTotal(warehouse.materials))}</div>
                        </div>
                      </div>

                      <div className="mt-5 max-h-44 overflow-y-auto rounded-lg border border-slate-100">
                        {warehouse.materials.length === 0 ? (
                          <div className="px-4 py-8 text-center text-sm text-slate-500">No materials in stock.</div>
                        ) : (
                          warehouse.materials.slice(0, 6).map((material) => (
                            <div key={material.materialId} className="flex items-center justify-between border-t border-slate-100 px-4 py-3 first:border-t-0">
                              <div>
                                <div className="text-sm font-semibold text-slate-900">{material.materialName}</div>
                                <div className="text-xs text-slate-500">{material.unitName}</div>
                              </div>
                              <div className="text-sm font-semibold text-slate-900">{formatQuantity(material.quantity)}</div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="mt-5 flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          onClick={() => openDetails(warehouse.warehouseId)}
                        >
                          <Eye className="h-4 w-4" />
                          Details
                        </button>
                        <button
                          type="button"
                          className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-[#004bb4] hover:bg-blue-50"
                          onClick={() =>
                            setEditWarehouse({
                              id: warehouse.warehouseId,
                              restaurantId: warehouse.restaurantId,
                              name: warehouse.warehouseName,
                              isActive: warehouse.isActive,
                              source: 'warehouse',
                            })
                          }
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={isMutating}
                          className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          onClick={() => handleWarehouseStatus(warehouse)}
                        >
                          {warehouse.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="flex min-h-full flex-col">
              <div className="mb-6 grid gap-3 xl:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr]">
                <label className="relative block">
                  <select
                    value={transactionFilters.warehouseId}
                    onChange={(event) =>
                      setTransactionFilters((current) => ({ ...current, warehouseId: event.target.value, materialId: '', pageNumber: 1 }))
                    }
                    className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none focus:border-[#004bb4]"
                  >
                    <option value="">Select warehouse</option>
                    {warehousesState.items.map((warehouse) => (
                      <option key={warehouse.warehouseId} value={warehouse.warehouseId}>
                        {warehouse.warehouseName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </label>

                <select
                  value={transactionFilters.materialId}
                  onChange={(event) => setTransactionFilters((current) => ({ ...current, materialId: event.target.value, pageNumber: 1 }))}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]"
                >
                  <option value="">All materials</option>
                  {selectedTransactionWarehouse?.materials.map((material) => (
                    <option key={material.materialId} value={material.materialId}>
                      {material.materialName}
                    </option>
                  ))}
                </select>

                <select
                  value={transactionFilters.transactionType}
                  onChange={(event) => setTransactionFilters((current) => ({ ...current, transactionType: event.target.value, pageNumber: 1 }))}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]"
                >
                  <option value="">All transaction types</option>
                  {transactionTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <select
                  value={transactionFilters.referenceType}
                  onChange={(event) => setTransactionFilters((current) => ({ ...current, referenceType: event.target.value, pageNumber: 1 }))}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]"
                >
                  <option value="">All references</option>
                  {referenceTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={transactionFilters.dateFrom}
                  onChange={(event) => setTransactionFilters((current) => ({ ...current, dateFrom: event.target.value, pageNumber: 1 }))}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]"
                />

                <input
                  type="date"
                  value={transactionFilters.dateTo}
                  onChange={(event) => setTransactionFilters((current) => ({ ...current, dateTo: event.target.value, pageNumber: 1 }))}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]"
                />
              </div>

              <div className="mb-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() =>
                    setTransactionFilters((current) => ({
                      ...current,
                      materialId: '',
                      transactionType: '',
                      referenceType: '',
                      referenceId: '',
                      dateFrom: '',
                      dateTo: '',
                      pageNumber: 1,
                    }))
                  }
                >
                  Clear Filters
                </button>
              </div>

              <ErrorBanner message={warehousesState.transactionsError} />

              {!transactionFilters.warehouseId ? (
                <EmptyState icon={ArrowDownUp} title="Select a warehouse" text="Choose a warehouse to view its stock movement history." />
              ) : warehousesState.transactionsStatus === 'loading' && warehousesState.transactions.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : warehousesState.transactions.length === 0 ? (
                <EmptyState icon={ArrowDownUp} title="No transactions found" text="No warehouse movement matched the selected filters." />
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="grid h-12 grid-cols-[1fr_1fr_0.7fr_0.8fr_0.8fr_1fr] items-center bg-slate-50 px-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <div>Material</div>
                    <div>Warehouse</div>
                    <div>Quantity</div>
                    <div>Type</div>
                    <div>Reference</div>
                    <div>Date</div>
                  </div>

                  {warehousesState.transactions.map((transaction) => (
                    <div key={transaction.id} className="grid min-h-16 grid-cols-[1fr_1fr_0.7fr_0.8fr_0.8fr_1fr] items-center border-t border-slate-100 px-4 text-sm text-slate-700">
                      <div>
                        <div className="font-semibold text-slate-900">{transaction.materialName}</div>
                        <div className="text-xs text-slate-500">{transaction.unitName}</div>
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{transaction.warehouseName}</div>
                        <div className="text-xs text-slate-500">{transaction.restaurantName}</div>
                      </div>
                      <div className="font-semibold text-slate-900">
                        {formatQuantity(transaction.quantity)} {transaction.unitSymbol}
                      </div>
                      <div>{transaction.transactionType}</div>
                      <div>{transaction.referenceType}</div>
                      <div>{formatDateTime(transaction.transactionDate)}</div>
                    </div>
                  ))}
                </div>
              )}

              {warehousesState.transactionsTotalPages > 1 && (
                <div className="mt-5 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={transactionFilters.pageNumber <= 1}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                    onClick={() => setTransactionFilters((current) => ({ ...current, pageNumber: Math.max(1, current.pageNumber - 1) }))}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-500">
                    Page {warehousesState.transactionsPageNumber} of {warehousesState.transactionsTotalPages}
                  </span>
                  <button
                    type="button"
                    disabled={warehousesState.transactionsPageNumber >= warehousesState.transactionsTotalPages}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                    onClick={() => setTransactionFilters((current) => ({ ...current, pageNumber: current.pageNumber + 1 }))}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <EditRestaurantModal
        open={Boolean(editRestaurant)}
        restaurant={editRestaurant}
        loading={restaurantsState.mutationStatus === 'loading'}
        onClose={() => setEditRestaurant(null)}
        onSave={async (name) => {
          if (!editRestaurant) return
          await dispatch(updateAdminRestaurant({ id: editRestaurant.id, data: { name } })).unwrap()
          dispatch(fetchAdminRestaurants(restaurantQuery))
        }}
      />

      <EditWarehouseModal
        open={Boolean(editWarehouse)}
        warehouse={editWarehouse}
        loading={isMutating}
        onClose={() => setEditWarehouse(null)}
        onSave={async (data) => {
          if (!editWarehouse) return
          if (editWarehouse.source === 'restaurant') {
            await dispatch(updateAdminRestaurantWarehouse({ id: editWarehouse.restaurantId, data })).unwrap()
          } else {
            await dispatch(updateRestaurantWarehouse({ id: editWarehouse.id, data })).unwrap()
          }
          dispatch(fetchAdminRestaurants(restaurantQuery))
          dispatch(fetchRestaurantWarehouseDetails())
        }}
      />

      {drawerOpen && (
        <WarehouseDetailsDrawer
          details={warehousesState.selectedDetails}
          loading={warehousesState.selectedDetailsStatus === 'loading'}
          error={warehousesState.selectedDetailsError}
          onClose={closeDetails}
        />
      )}
    </div>
  )
}
