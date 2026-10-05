import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  AlertCircle,
  ArrowRightLeft,
  ChevronDown,
  Edit2,
  Eye,
  Layers,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { Modal } from '../../../../../../shared/ui/Modal'
import type { AppDispatch, RootState } from '../../../../../../store/store'
import { fetchRestaurantUnits } from '../../../../../../features/restaurant/restaurantUnitsSlice'
import {
  createMaterialConversion,
  createRestaurantMaterial,
  clearSelectedRestaurantMaterial,
  deleteMaterialConversion,
  fetchRestaurantMaterial,
  fetchRestaurantMaterials,
  toggleRestaurantMaterialStatus,
  updateMaterialConversion,
  updateRestaurantMaterial,
} from '../../../../../../features/restaurant/restaurantMaterialsSlice'
import type {
  RestaurantMaterial,
  RestaurantMaterialConversion,
} from '../../../../../../models/RestaurantMaterial'
import type { RestaurantUnit } from '../../../../../../models/RestaurantUnit'

type StatusFilter = 'all' | 'active' | 'inactive'
type MaterialFormState = {
  name: string
  unitId: string
}
type ConversionFormState = {
  fromUnitId: string
  toUnitId: string
  conversionFactor: string
}

function statusFilterValue(value: StatusFilter) {
  if (value === 'active') return true
  if (value === 'inactive') return false
  return undefined
}

function unitLabel(unit: Pick<RestaurantUnit, 'name' | 'symbol'>) {
  return `${unit.name} (${unit.symbol})`
}

function materialUnitLabel(material: Pick<RestaurantMaterial, 'unitName' | 'unitSymbol'>) {
  return `${material.unitName} (${material.unitSymbol})`
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

function MaterialModal({
  open,
  onClose,
  units,
  initialData,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  units: RestaurantUnit[]
  initialData?: RestaurantMaterial | null
  onSaved: () => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const [form, setForm] = useState<MaterialFormState>({ name: '', unitId: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm({
      name: initialData?.name ?? '',
      unitId: initialData?.unitId ? String(initialData.unitId) : '',
    })
    setError(null)
  }, [initialData, open])

  const isEdit = Boolean(initialData)
  const canSubmit = form.name.trim().length > 0 && Number(form.unitId) > 0 && !loading

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    const payload = { name: form.name.trim(), unitId: Number(form.unitId) }

    try {
      if (initialData) {
        await dispatch(updateRestaurantMaterial({ id: initialData.id, data: payload })).unwrap()
      } else {
        await dispatch(createRestaurantMaterial(payload)).unwrap()
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
      <div className="w-[480px] max-w-[95vw] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#004bb4] px-6 py-4 text-white">
          <h2 className="text-[18px] font-semibold">{isEdit ? 'Edit Material' : 'Add Material'}</h2>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <ErrorBanner message={error ?? undefined} />

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Material Name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#004bb4] focus:ring-2 focus:ring-[#004bb4]/10"
              placeholder="e.g. Beef Tenderloin"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Base Unit</span>
            <div className="relative">
              <select
                value={form.unitId}
                onChange={(event) => setForm((current) => ({ ...current, unitId: event.target.value }))}
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 pr-10 text-sm outline-none focus:border-[#004bb4] focus:ring-2 focus:ring-[#004bb4]/10"
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

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button type="button" className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            className="flex min-w-[110px] items-center justify-center gap-2 rounded-lg bg-[#004bb4] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#003d91] disabled:opacity-50"
            onClick={handleSubmit}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function ConversionModal({
  open,
  onClose,
  material,
  units,
  initialData,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  material: RestaurantMaterial
  units: RestaurantUnit[]
  initialData?: RestaurantMaterialConversion | null
  onSaved: () => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const [form, setForm] = useState<ConversionFormState>({
    fromUnitId: '',
    toUnitId: '',
    conversionFactor: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm({
      fromUnitId: initialData?.fromUnitId ? String(initialData.fromUnitId) : String(material.unitId),
      toUnitId: initialData?.toUnitId ? String(initialData.toUnitId) : '',
      conversionFactor: initialData?.conversionFactor !== undefined ? String(initialData.conversionFactor) : '',
    })
    setError(null)
  }, [initialData, material.unitId, open])

  const factor = Number(form.conversionFactor)
  const isEdit = Boolean(initialData)
  const canSubmit =
    Number(form.fromUnitId) > 0 &&
    Number(form.toUnitId) > 0 &&
    form.fromUnitId !== form.toUnitId &&
    Number.isFinite(factor) &&
    factor > 0 &&
    !loading

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError(null)

    try {
      if (initialData) {
        await dispatch(updateMaterialConversion({ id: initialData.id, data: { conversionFactor: factor } })).unwrap()
      } else {
        await dispatch(
          createMaterialConversion({
            materialId: material.id,
            data: {
              materialId: material.id,
              fromUnitId: Number(form.fromUnitId),
              toUnitId: Number(form.toUnitId),
              conversionFactor: factor,
            },
          }),
        ).unwrap()
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
      <div className="w-[520px] max-w-[95vw] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#004bb4] px-6 py-4 text-white">
          <h2 className="text-[18px] font-semibold">{isEdit ? 'Edit Conversion' : 'Add Conversion'}</h2>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <ErrorBanner message={error ?? undefined} />

          <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Material: <span className="font-semibold text-slate-900">{material.name}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">From Unit</span>
              <select
                value={form.fromUnitId}
                disabled={isEdit}
                onChange={(event) => setForm((current) => ({ ...current, fromUnitId: event.target.value }))}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#004bb4] disabled:opacity-60"
              >
                <option value="">Select unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unitLabel(unit)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">To Unit</span>
              <select
                value={form.toUnitId}
                disabled={isEdit}
                onChange={(event) => setForm((current) => ({ ...current, toUnitId: event.target.value }))}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#004bb4] disabled:opacity-60"
              >
                <option value="">Select unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unitLabel(unit)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Conversion Factor</span>
            <input
              type="number"
              min="0"
              step="0.0001"
              value={form.conversionFactor}
              onChange={(event) => setForm((current) => ({ ...current, conversionFactor: event.target.value }))}
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#004bb4]"
              placeholder="e.g. 1000"
            />
          </label>

          {form.fromUnitId && form.toUnitId && form.fromUnitId === form.toUnitId && (
            <p className="text-[13px] text-red-600">From and to units must be different.</p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button type="button" className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            className="flex min-w-[110px] items-center justify-center gap-2 rounded-lg bg-[#004bb4] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#003d91] disabled:opacity-50"
            onClick={handleSubmit}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  loading,
  tone = 'blue',
  onClose,
  onConfirm,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  loading: boolean
  tone?: 'blue' | 'red' | 'orange'
  onClose: () => void
  onConfirm: () => void
}) {
  const toneClass = tone === 'red' ? 'bg-red-600 hover:bg-red-700' : tone === 'orange' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-[#004bb4] hover:bg-[#003d91]'

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

function MaterialDetailsDrawer({
  material,
  loading,
  error,
  units,
  onClose,
  onAddConversion,
  onEditConversion,
  onDeleteConversion,
}: {
  material: RestaurantMaterial | null
  loading: boolean
  error?: string
  units: RestaurantUnit[]
  onClose: () => void
  onAddConversion: () => void
  onEditConversion: (conversion: RestaurantMaterialConversion) => void
  onDeleteConversion: (conversion: RestaurantMaterialConversion) => void
}) {
  if (!material && !loading && !error) return null

  return (
    <aside className="fixed bottom-0 right-0 top-0 z-[120] w-[460px] max-w-[95vw] overflow-y-auto bg-white shadow-2xl">
      <div className="flex h-[72px] items-center justify-between border-b border-slate-100 px-6">
        <h2 className="text-lg font-semibold text-slate-900">Material Details</h2>
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

        {material && !loading && (
          <>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{material.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">Base unit: {materialUnitLabel(material)}</p>
                </div>
                <span className={['rounded-full px-3 py-1 text-xs font-semibold', material.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'].join(' ')}>
                  {material.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-slate-400">Created</div>
                  <div className="font-medium text-slate-700">{formatDate(material.createdAt)}</div>
                </div>
                <div>
                  <div className="text-slate-400">Created By</div>
                  <div className="font-medium text-slate-700">{material.createdBy || '-'}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Conversions</h3>
              <button
                type="button"
                className="flex h-9 items-center gap-2 rounded-lg bg-[#004bb4] px-3 text-sm font-semibold text-white hover:bg-[#003d91]"
                onClick={onAddConversion}
                disabled={units.length < 2}
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            {material.conversions.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                No conversions added yet.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {material.conversions.map((conversion) => (
                  <div key={conversion.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <span>{conversion.fromUnitSymbol}</span>
                          <ArrowRightLeft className="h-4 w-4 text-slate-400" />
                          <span>{conversion.toUnitSymbol}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          1 {conversion.fromUnitName} = {conversion.conversionFactor} {conversion.toUnitName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-[#004bb4] hover:bg-blue-50" onClick={() => onEditConversion(conversion)} aria-label="Edit conversion">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-red-600 hover:bg-red-50" onClick={() => onDeleteConversion(conversion)} aria-label="Delete conversion">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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

export function SettingsMaterialsTab() {
  const dispatch = useDispatch<AppDispatch>()
  const { items, status, error, selected, selectedStatus, selectedError, mutationStatus } = useSelector(
    (state: RootState) => state.restaurantMaterials,
  )
  const { items: units, status: unitsStatus } = useSelector((state: RootState) => state.restaurantUnits)

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [unitFilter, setUnitFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<RestaurantMaterial | null>(null)
  const [toggleTarget, setToggleTarget] = useState<RestaurantMaterial | null>(null)
  const [detailsTargetId, setDetailsTargetId] = useState<number | null>(null)
  const [conversionOpen, setConversionOpen] = useState(false)
  const [conversionTarget, setConversionTarget] = useState<RestaurantMaterialConversion | null>(null)
  const [deleteConversionTarget, setDeleteConversionTarget] = useState<RestaurantMaterialConversion | null>(null)

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
    dispatch(fetchRestaurantMaterials(query))
  }, [dispatch, query])

  useEffect(() => {
    if (unitsStatus === 'idle') dispatch(fetchRestaurantUnits({ pageNumber: 1, pageSize: 1000 }))
  }, [dispatch, unitsStatus])

  useEffect(() => {
    if (detailsTargetId !== null) dispatch(fetchRestaurantMaterial(detailsTargetId))
  }, [detailsTargetId, dispatch])

  const activeUnits = units.filter((unit) => unit.isActive)
  const isLoading = status === 'loading'
  const isMutating = mutationStatus === 'loading'

  const refreshMaterials = () => {
    dispatch(fetchRestaurantMaterials(query))
    if (detailsTargetId !== null) dispatch(fetchRestaurantMaterial(detailsTargetId))
  }

  const handleToggleStatus = async () => {
    if (!toggleTarget) return
    await dispatch(toggleRestaurantMaterialStatus({ id: toggleTarget.id, activate: !toggleTarget.isActive })).unwrap()
    setToggleTarget(null)
  }

  const handleDeleteConversion = async () => {
    if (!deleteConversionTarget || detailsTargetId === null) return
    await dispatch(deleteMaterialConversion(deleteConversionTarget.id)).unwrap()
    setDeleteConversionTarget(null)
    dispatch(fetchRestaurantMaterial(detailsTargetId))
  }

  const closeDetails = () => {
    setDetailsTargetId(null)
    setConversionOpen(false)
    setConversionTarget(null)
    setDeleteConversionTarget(null)
    dispatch(clearSelectedRestaurantMaterial())
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 w-[280px] rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#004bb4] focus:ring-2 focus:ring-[#004bb4]/10"
              placeholder="Search materials..."
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

        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-lg bg-[#004bb4] px-4 text-sm font-semibold text-white hover:bg-[#003d91]"
          onClick={() => {
            setEditTarget(null)
            setFormOpen(true)
          }}
        >
          <Plus className="h-4 w-4" />
          Add Material
        </button>
      </div>

      <ErrorBanner message={error} />

      {isLoading && items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-slate-400">
          <Layers className="h-12 w-12 opacity-50" />
          <p className="text-sm">No materials found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid h-12 grid-cols-[1.4fr_1fr_0.8fr_0.9fr_1fr] items-center bg-slate-50 px-4 text-xs font-bold uppercase tracking-wide text-slate-500">
            <div>Material</div>
            <div>Base Unit</div>
            <div>Conversions</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          {items.map((material) => (
            <div key={material.id} className="grid min-h-16 grid-cols-[1.4fr_1fr_0.8fr_0.9fr_1fr] items-center border-t border-slate-100 px-4 text-sm text-slate-700">
              <div>
                <div className="font-semibold text-slate-900">{material.name}</div>
                <div className="mt-1 text-xs text-slate-400">Added {formatDate(material.createdAt)}</div>
              </div>
              <div>{materialUnitLabel(material)}</div>
              <div>{material.conversions?.length ?? 0}</div>
              <div>
                <span className={['rounded-full px-3 py-1 text-xs font-semibold', material.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'].join(' ')}>
                  {material.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => setDetailsTargetId(material.id)} aria-label="View details">
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-lg text-[#004bb4] hover:bg-blue-50"
                  onClick={() => {
                    setEditTarget(material)
                    setFormOpen(true)
                  }}
                  aria-label="Edit material"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={['rounded-lg px-3 py-1.5 text-xs font-semibold', material.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-emerald-600 hover:bg-emerald-50'].join(' ')}
                  onClick={() => setToggleTarget(material)}
                >
                  {material.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MaterialModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        units={activeUnits}
        initialData={editTarget}
        onSaved={refreshMaterials}
      />

      {conversionOpen && selected && (
        <ConversionModal
          open
          onClose={() => {
            setConversionOpen(false)
            setConversionTarget(null)
          }}
          material={selected}
          units={activeUnits}
          initialData={conversionTarget}
          onSaved={refreshMaterials}
        />
      )}

      <ConfirmModal
        open={Boolean(toggleTarget)}
        title={toggleTarget?.isActive ? 'Deactivate Material' : 'Activate Material'}
        message={`Are you sure you want to ${toggleTarget?.isActive ? 'deactivate' : 'activate'} "${toggleTarget?.name ?? 'this material'}"?`}
        confirmLabel={toggleTarget?.isActive ? 'Deactivate' : 'Activate'}
        loading={isMutating}
        tone={toggleTarget?.isActive ? 'orange' : 'blue'}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggleStatus}
      />

      <ConfirmModal
        open={Boolean(deleteConversionTarget)}
        title="Delete Conversion"
        message="This conversion will be removed from the material."
        confirmLabel="Delete"
        loading={isMutating}
        tone="red"
        onClose={() => setDeleteConversionTarget(null)}
        onConfirm={handleDeleteConversion}
      />

      <MaterialDetailsDrawer
        material={selected}
        loading={selectedStatus === 'loading'}
        error={selectedError}
        units={activeUnits}
        onClose={closeDetails}
        onAddConversion={() => {
          setConversionTarget(null)
          setConversionOpen(true)
        }}
        onEditConversion={(conversion) => {
          setConversionTarget(conversion)
          setConversionOpen(true)
        }}
        onDeleteConversion={setDeleteConversionTarget}
      />
    </div>
  )
}
