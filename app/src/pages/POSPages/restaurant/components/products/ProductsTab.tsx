import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  AlertCircle,
  Beaker,
  ChevronDown,
  Edit2,
  Eye,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { Modal } from '../../../../../shared/ui/Modal'
import type { AppDispatch, RootState } from '../../../../../store/store'
import { fetchRestaurantUnits } from '../../../../../features/restaurant/restaurantUnitsSlice'
import { fetchRestaurantMaterials } from '../../../../../features/restaurant/restaurantMaterialsSlice'
import {
  clearSelectedRestaurantProduct,
  createRestaurantProduct,
  fetchRestaurantProduct,
  fetchRestaurantProducts,
  toggleRestaurantProductStatus,
  updateRestaurantProduct,
} from '../../../../../features/restaurant/restaurantProductsSlice'
import type { RestaurantMaterial } from '../../../../../models/RestaurantMaterial'
import type {
  CreateRestaurantProductMaterialRequest,
  RestaurantProduct,
} from '../../../../../models/RestaurantProduct'
import type { RestaurantUnit } from '../../../../../models/RestaurantUnit'

type StatusFilter = 'all' | 'active' | 'inactive'
type ProductMaterialRow = {
  rowId: string
  materialId: string
  quantity: string
  unitId: string
}
type ProductFormState = {
  name: string
  unitId: string
  materials: ProductMaterialRow[]
}

function statusFilterValue(value: StatusFilter) {
  if (value === 'active') return true
  if (value === 'inactive') return false
  return undefined
}

function rowId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function emptyMaterialRow(): ProductMaterialRow {
  return { rowId: rowId(), materialId: '', quantity: '', unitId: '' }
}

function unitLabel(unit: Pick<RestaurantUnit, 'name' | 'symbol'>) {
  return `${unit.name} (${unit.symbol})`
}

function productUnitLabel(product: Pick<RestaurantProduct, 'unitName' | 'unitSymbol'>) {
  return `${product.unitName} (${product.unitSymbol})`
}

function formatDate(value: string | null) {
  if (!value) return '-'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString()
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

function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  loading,
  tone,
  onClose,
  onConfirm,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  loading: boolean
  tone: 'blue' | 'orange'
  onClose: () => void
  onConfirm: () => void
}) {
  const toneClass = tone === 'orange' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-[#004bb4] hover:bg-[#003d91]'

  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="w-[420px] max-w-[95vw] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="px-6 py-6 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-[18px] font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm text-slate-500">{message}</p>
        </div>
        <div className="flex gap-3 bg-slate-50 px-6 py-4">
          <button type="button" className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={['flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50', toneClass].join(' ')}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function ProductModal({
  open,
  onClose,
  units,
  materials,
  initialData,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  units: RestaurantUnit[]
  materials: RestaurantMaterial[]
  initialData?: RestaurantProduct | null
  onSaved: () => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const [form, setForm] = useState<ProductFormState>({
    name: '',
    unitId: '',
    materials: [emptyMaterialRow()],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm({
      name: initialData?.name ?? '',
      unitId: initialData?.unitId ? String(initialData.unitId) : '',
      materials:
        initialData?.materials && initialData.materials.length > 0
          ? initialData.materials.map((material) => ({
              rowId: rowId(),
              materialId: String(material.materialId),
              quantity: String(material.quantity),
              unitId: String(material.unitId),
            }))
          : [emptyMaterialRow()],
    })
    setError(null)
  }, [initialData, open])

  const isEdit = Boolean(initialData)
  const mappedMaterials: CreateRestaurantProductMaterialRequest[] = form.materials
    .filter((row) => Number(row.materialId) > 0 || Number(row.quantity) > 0 || Number(row.unitId) > 0)
    .map((row) => ({
      materialId: Number(row.materialId),
      quantity: Number(row.quantity),
      unitId: Number(row.unitId),
    }))
  const hasValidRows =
    mappedMaterials.length > 0 &&
    mappedMaterials.every((row) => row.materialId > 0 && row.unitId > 0 && Number.isFinite(row.quantity) && row.quantity > 0)
  const canSubmit = form.name.trim().length > 0 && Number(form.unitId) > 0 && hasValidRows && !loading

  const setMaterialRow = (targetRowId: string, patch: Partial<ProductMaterialRow>) => {
    setForm((current) => ({
      ...current,
      materials: current.materials.map((row) => (row.rowId === targetRowId ? { ...row, ...patch } : row)),
    }))
  }

  const handleMaterialChange = (targetRowId: string, materialId: string) => {
    const selectedMaterial = materials.find((material) => material.id === Number(materialId))
    setMaterialRow(targetRowId, {
      materialId,
      unitId: selectedMaterial ? String(selectedMaterial.unitId) : '',
    })
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError(null)

    const payload = {
      name: form.name.trim(),
      unitId: Number(form.unitId),
      materials: mappedMaterials,
    }

    try {
      if (initialData) {
        await dispatch(updateRestaurantProduct({ id: initialData.id, data: payload })).unwrap()
      } else {
        await dispatch(createRestaurantProduct(payload)).unwrap()
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="max-h-[92vh] w-[760px] max-w-[96vw] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#004bb4] px-6 py-4 text-white">
          <h2 className="text-[18px] font-semibold">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-136px)] overflow-y-auto px-6 py-5">
          <ErrorBanner message={error ?? undefined} />

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Product Name</span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#004bb4]"
                placeholder="e.g. Chicken"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Output Unit</span>
              <div className="relative">
                <select
                  value={form.unitId}
                  onChange={(event) => setForm((current) => ({ ...current, unitId: event.target.value }))}
                  className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 pr-10 text-sm outline-none focus:border-[#004bb4]"
                >
                  <option value="">Select unit</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unitLabel(unit)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </label>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Materials Recipe</h3>
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-lg border border-blue-200 px-3 text-sm font-semibold text-[#004bb4] hover:bg-blue-50"
              onClick={() => setForm((current) => ({ ...current, materials: [...current.materials, emptyMaterialRow()] }))}
            >
              <Plus className="h-4 w-4" />
              Add Row
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {form.materials.map((row, index) => (
              <div key={row.rowId} className="grid grid-cols-[minmax(0,1.3fr)_120px_minmax(0,1fr)_36px] gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-semibold text-slate-600">Material</span>
                  <select
                    value={row.materialId}
                    onChange={(event) => handleMaterialChange(row.rowId, event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#004bb4]"
                  >
                    <option value="">Select material</option>
                    {materials.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-semibold text-slate-600">Quantity</span>
                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={row.quantity}
                    onChange={(event) => setMaterialRow(row.rowId, { quantity: event.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#004bb4]"
                    placeholder="0"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-semibold text-slate-600">Unit</span>
                  <select
                    value={row.unitId}
                    onChange={(event) => setMaterialRow(row.rowId, { unitId: event.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#004bb4]"
                  >
                    <option value="">Select unit</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unitLabel(unit)}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  className="mt-[22px] grid h-10 w-9 place-items-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-40"
                  disabled={form.materials.length === 1}
                  onClick={() => setForm((current) => ({ ...current, materials: current.materials.filter((item) => item.rowId !== row.rowId) }))}
                  aria-label={`Remove material row ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {!hasValidRows && (
            <p className="mt-3 text-[13px] text-slate-500">Add at least one material with material, unit, and quantity greater than 0.</p>
          )}
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
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Product'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function ProductDetailsDrawer({
  product,
  loading,
  error,
  onClose,
}: {
  product: RestaurantProduct | null
  loading: boolean
  error?: string
  onClose: () => void
}) {
  if (!product && !loading && !error) return null

  return (
    <aside className="fixed bottom-0 right-0 top-0 z-[120] w-[480px] max-w-[95vw] overflow-y-auto bg-white shadow-2xl">
      <div className="flex h-[72px] items-center justify-between border-b border-slate-100 px-6">
        <h2 className="text-lg font-semibold text-slate-900">Product Details</h2>
        <button type="button" className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100" onClick={onClose} aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-6 py-6">
        {loading && (
          <div className="flex h-40 items-center justify-center text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        <ErrorBanner message={error} />

        {product && !loading && (
          <>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">Output unit: {productUnitLabel(product)}</p>
                </div>
                <span className={['rounded-full px-3 py-1 text-xs font-semibold', product.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'].join(' ')}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-slate-400">Created</div>
                  <div className="font-medium text-slate-700">{formatDate(product.createdAt)}</div>
                </div>
                <div>
                  <div className="text-slate-400">Materials</div>
                  <div className="font-medium text-slate-700">{product.materials?.length ?? product.materialsCount}</div>
                </div>
              </div>
            </div>

            <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-slate-700">Recipe Materials</h3>
            {!product.materials || product.materials.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                No recipe materials returned for this product.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {product.materials.map((material) => (
                  <div key={`${material.materialId}-${material.unitId}`} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-sm">
                    <div>
                      <div className="font-semibold text-slate-900">{material.materialName}</div>
                      <div className="mt-1 text-slate-500">{material.unitName}</div>
                    </div>
                    <div className="font-semibold text-slate-900">
                      {material.quantity} {material.unitSymbol}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  )
}

export function ProductsTab() {
  const dispatch = useDispatch<AppDispatch>()
  const { items, status, error, selected, selectedStatus, selectedError, mutationStatus } = useSelector(
    (state: RootState) => state.restaurantProducts,
  )
  const { items: units, status: unitsStatus } = useSelector((state: RootState) => state.restaurantUnits)
  const { items: materials, status: materialsStatus } = useSelector((state: RootState) => state.restaurantMaterials)

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [unitFilter, setUnitFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<RestaurantProduct | null>(null)
  const [toggleTarget, setToggleTarget] = useState<RestaurantProduct | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery), 400)
    return () => window.clearTimeout(timer)
  }, [searchQuery])

  const query = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      unitId: unitFilter === 'all' ? undefined : Number(unitFilter),
      isActive: statusFilterValue(statusFilter),
      pageNumber: 1,
      pageSize: 100,
    }),
    [debouncedSearch, statusFilter, unitFilter],
  )

  useEffect(() => {
    dispatch(fetchRestaurantProducts(query))
  }, [dispatch, query])

  useEffect(() => {
    if (unitsStatus === 'idle') dispatch(fetchRestaurantUnits({ pageNumber: 1, pageSize: 1000 }))
  }, [dispatch, unitsStatus])

  useEffect(() => {
    if (materialsStatus === 'idle') dispatch(fetchRestaurantMaterials({ isActive: true, pageNumber: 1, pageSize: 1000 }))
  }, [dispatch, materialsStatus])

  const activeUnits = units.filter((unit) => unit.isActive)
  const activeMaterials = materials.filter((material) => material.isActive)
  const isLoading = status === 'loading'
  const isMutating = mutationStatus === 'loading'

  const refreshProducts = () => {
    dispatch(fetchRestaurantProducts(query))
  }

  const handleAddProduct = () => {
    setEditTarget(null)
    setFormOpen(true)
  }

  const handleEditProduct = async (productId: number) => {
    setFormLoading(true)
    try {
      const product = await dispatch(fetchRestaurantProduct(productId)).unwrap()
      setEditTarget(product)
      setFormOpen(true)
    } finally {
      setFormLoading(false)
    }
  }

  const handleViewProduct = async (productId: number) => {
    setDetailsOpen(true)
    await dispatch(fetchRestaurantProduct(productId))
  }

  const handleToggleStatus = async () => {
    if (!toggleTarget) return
    await dispatch(toggleRestaurantProductStatus({ id: toggleTarget.id, activate: !toggleTarget.isActive })).unwrap()
    setToggleTarget(null)
  }

  const closeDetails = () => {
    setDetailsOpen(false)
    dispatch(clearSelectedRestaurantProduct())
  }

  return (
    <div className="flex h-full flex-col bg-[#F6F8FC] px-8 pt-8 pb-10">
      <div className="flex-1 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-semibold text-slate-900">Products</h2>
            <p className="mt-1 text-sm text-slate-500">Build restaurant products from tracked materials.</p>
          </div>

          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-lg bg-[#004bb4] px-4 text-sm font-semibold text-white hover:bg-[#003d91]"
            onClick={handleAddProduct}
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 w-[280px] rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#004bb4]"
              placeholder="Search products..."
            />
          </div>

          <select
            value={unitFilter}
            onChange={(event) => setUnitFilter(event.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]"
          >
            <option value="all">All units</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unitLabel(unit)}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <ErrorBanner message={error} />

        {(isLoading && items.length === 0) || formLoading ? (
          <div className="flex h-80 items-center justify-center text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-80 flex-col items-center justify-center gap-3 text-slate-400">
            <Package className="h-12 w-12 opacity-50" />
            <p className="text-sm">No products found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="grid h-12 grid-cols-[1.4fr_1fr_0.8fr_0.9fr_1fr] items-center bg-slate-50 px-4 text-xs font-bold uppercase tracking-wide text-slate-500">
              <div>Product</div>
              <div>Output Unit</div>
              <div>Materials</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>

            {items.map((product) => (
              <div key={product.id} className="grid min-h-16 grid-cols-[1.4fr_1fr_0.8fr_0.9fr_1fr] items-center border-t border-slate-100 px-4 text-sm text-slate-700">
                <div>
                  <div className="font-semibold text-slate-900">{product.name}</div>
                  <div className="mt-1 text-xs text-slate-400">Added {formatDate(product.createdAt)}</div>
                </div>
                <div>{productUnitLabel(product)}</div>
                <div className="flex items-center gap-2">
                  <Beaker className="h-4 w-4 text-slate-400" />
                  {product.materialsCount}
                </div>
                <div>
                  <span className={['rounded-full px-3 py-1 text-xs font-semibold', product.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'].join(' ')}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => handleViewProduct(product.id)} aria-label="View details">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-[#004bb4] hover:bg-blue-50" onClick={() => handleEditProduct(product.id)} aria-label="Edit product">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className={['rounded-lg px-3 py-1.5 text-xs font-semibold', product.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-emerald-600 hover:bg-emerald-50'].join(' ')}
                    onClick={() => setToggleTarget(product)}
                  >
                    {product.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProductModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        units={activeUnits}
        materials={activeMaterials}
        initialData={editTarget}
        onSaved={refreshProducts}
      />

      <ConfirmModal
        open={Boolean(toggleTarget)}
        title={toggleTarget?.isActive ? 'Deactivate Product' : 'Activate Product'}
        message={`Are you sure you want to ${toggleTarget?.isActive ? 'deactivate' : 'activate'} "${toggleTarget?.name ?? 'this product'}"?`}
        confirmLabel={toggleTarget?.isActive ? 'Deactivate' : 'Activate'}
        loading={isMutating}
        tone={toggleTarget?.isActive ? 'orange' : 'blue'}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggleStatus}
      />

      {detailsOpen && (
        <ProductDetailsDrawer
          product={selected}
          loading={selectedStatus === 'loading'}
          error={selectedError}
          onClose={closeDetails}
        />
      )}
    </div>
  )
}
