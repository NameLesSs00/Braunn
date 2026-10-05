import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AlertCircle, ChevronDown, Edit2, Loader2, Plus, Search, Trash2, Utensils, X } from 'lucide-react'
import { Modal } from '../../../../../../shared/ui/Modal'
import type { AppDispatch, RootState } from '../../../../../../store/store'
import {
  createRestaurantMeal,
  deleteRestaurantMeal,
  fetchRestaurantMeals,
  updateRestaurantMeal,
} from '../../../../../../features/restaurant/restaurantMealsSlice'
import {
  restaurantMealTypes,
  type RestaurantMeal,
  type RestaurantMealType,
} from '../../../../../../models/RestaurantMeal'

type StatusFilter = 'all' | 'active' | 'inactive'
type MealTypeFilter = 'all' | RestaurantMealType
type MealFormState = {
  name: string
  description: string
  mealType: RestaurantMealType
  isActive: boolean
}

function statusFilterValue(value: StatusFilter) {
  if (value === 'active') return true
  if (value === 'inactive') return false
  return undefined
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
  onClose,
  onConfirm,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel: string
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
            Cancel
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
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

function MealModal({
  open,
  onClose,
  initialData,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initialData?: RestaurantMeal | null
  onSaved: () => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const [form, setForm] = useState<MealFormState>({
    name: '',
    description: '',
    mealType: 'Breakfast',
    isActive: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm({
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      mealType: initialData?.mealType ?? 'Breakfast',
      isActive: initialData?.isActive ?? true,
    })
    setError(null)
  }, [initialData, open])

  const isEdit = Boolean(initialData)
  const canSubmit = form.name.trim().length > 0 && form.description.trim().length > 0 && !loading

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError(null)

    try {
      if (initialData) {
        await dispatch(
          updateRestaurantMeal({
            id: initialData.id,
            data: {
              name: form.name.trim(),
              description: form.description.trim(),
              isActive: form.isActive,
            },
          }),
        ).unwrap()
      } else {
        await dispatch(
          createRestaurantMeal({
            name: form.name.trim(),
            description: form.description.trim(),
            mealType: form.mealType,
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
          <h2 className="text-[18px] font-semibold">{isEdit ? 'Edit Meal' : 'Add Meal'}</h2>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <ErrorBanner message={error ?? undefined} />

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Meal Name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#004bb4]"
              placeholder="e.g. Breakfast Buffet"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="min-h-[92px] w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#004bb4]"
              placeholder="Describe the meal."
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Meal Type</span>
              <div className="relative">
                <select
                  value={form.mealType}
                  disabled={isEdit}
                  onChange={(event) => setForm((current) => ({ ...current, mealType: event.target.value as RestaurantMealType }))}
                  className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 pr-10 text-sm outline-none focus:border-[#004bb4] disabled:opacity-60"
                >
                  {restaurantMealTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Status</span>
              <select
                value={form.isActive ? 'active' : 'inactive'}
                disabled={!isEdit}
                onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.value === 'active' }))}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#004bb4] disabled:opacity-60"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>
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

export function SettingsMealsTab() {
  const dispatch = useDispatch<AppDispatch>()
  const { items, status, error, mutationStatus } = useSelector((state: RootState) => state.restaurantMeals)

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [mealTypeFilter, setMealTypeFilter] = useState<MealTypeFilter>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<RestaurantMeal | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RestaurantMeal | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery), 400)
    return () => window.clearTimeout(timer)
  }, [searchQuery])

  const query = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      isActive: statusFilterValue(statusFilter),
      mealType: mealTypeFilter === 'all' ? undefined : mealTypeFilter,
      pageNumber: 1,
      pageSize: 100,
    }),
    [debouncedSearch, mealTypeFilter, statusFilter],
  )

  useEffect(() => {
    dispatch(fetchRestaurantMeals(query))
  }, [dispatch, query])

  const isLoading = status === 'loading'
  const isMutating = mutationStatus === 'loading'

  const refreshMeals = () => {
    dispatch(fetchRestaurantMeals(query))
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await dispatch(deleteRestaurantMeal(deleteTarget.id)).unwrap()
    setDeleteTarget(null)
    refreshMeals()
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
              className="h-10 w-[280px] rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#004bb4]"
              placeholder="Search meals..."
            />
          </div>

          <select
            value={mealTypeFilter}
            onChange={(event) => setMealTypeFilter(event.target.value as MealTypeFilter)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]"
          >
            <option value="all">All meal types</option>
            {restaurantMealTypes.map((type) => (
              <option key={type} value={type}>
                {type}
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
          Add Meal
        </button>
      </div>

      <ErrorBanner message={error} />

      {isLoading && items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-slate-400">
          <Utensils className="h-12 w-12 opacity-50" />
          <p className="text-sm">No meals found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid h-12 grid-cols-[1.2fr_1.4fr_0.8fr_0.8fr_0.8fr] items-center bg-slate-50 px-4 text-xs font-bold uppercase tracking-wide text-slate-500">
            <div>Meal</div>
            <div>Description</div>
            <div>Type</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          {items.map((meal) => (
            <div key={meal.id} className="grid min-h-16 grid-cols-[1.2fr_1.4fr_0.8fr_0.8fr_0.8fr] items-center border-t border-slate-100 px-4 text-sm text-slate-700">
              <div>
                <div className="font-semibold text-slate-900">{meal.name}</div>
                <div className="mt-1 text-xs text-slate-400">Added {formatDate(meal.createdAt)}</div>
              </div>
              <div className="pr-4 text-slate-500">{meal.description}</div>
              <div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#004bb4]">{meal.mealType}</span>
              </div>
              <div>
                <span className={['rounded-full px-3 py-1 text-xs font-semibold', meal.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'].join(' ')}>
                  {meal.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-lg text-[#004bb4] hover:bg-blue-50"
                  onClick={() => {
                    setEditTarget(meal)
                    setFormOpen(true)
                  }}
                  aria-label="Edit meal"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget(meal)} aria-label="Delete meal">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MealModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={editTarget}
        onSaved={refreshMeals}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Meal"
        message={`Delete "${deleteTarget?.name ?? 'this meal'}"? The backend allows this only when no coupons or sales exist.`}
        confirmLabel="Delete"
        loading={isMutating}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
