import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  Edit2,
  Eye,
  Loader2,
  Plus,
  Search,
  Ticket,
  Trash2,
  X,
} from 'lucide-react'
import { Modal } from '../../../../../shared/ui/Modal'
import type { AppDispatch, RootState } from '../../../../../store/store'
import { fetchRestaurantMeals } from '../../../../../features/restaurant/restaurantMealsSlice'
import {
  clearRestaurantCouponsByMeal,
  createRestaurantCoupon,
  deleteRestaurantCoupon,
  fetchRestaurantCoupons,
  fetchRestaurantCouponsByMeal,
  updateRestaurantCoupon,
} from '../../../../../features/restaurant/restaurantCouponsSlice'
import {
  restaurantDaysOfWeek,
  type RestaurantCoupon,
  type RestaurantDayOfWeek,
} from '../../../../../models/RestaurantCoupon'
import type { RestaurantMeal } from '../../../../../models/RestaurantMeal'

type StatusFilter = 'all' | 'active' | 'inactive'
type CouponFormState = {
  mealId: string
  dayOfWeek: RestaurantDayOfWeek
  price: string
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

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
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

function CouponModal({
  open,
  onClose,
  meals,
  initialData,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  meals: RestaurantMeal[]
  initialData?: RestaurantCoupon | null
  onSaved: () => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const [form, setForm] = useState<CouponFormState>({
    mealId: '',
    dayOfWeek: 'Sunday',
    price: '',
    isActive: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm({
      mealId: initialData?.mealId ? String(initialData.mealId) : '',
      dayOfWeek: initialData?.dayOfWeek ?? 'Sunday',
      price: initialData?.price !== undefined ? String(initialData.price) : '',
      isActive: initialData?.isActive ?? true,
    })
    setError(null)
  }, [initialData, open])

  const isEdit = Boolean(initialData)
  const price = Number(form.price)
  const canSubmit = Number(form.mealId) > 0 && Number.isFinite(price) && price > 0 && !loading

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError(null)

    try {
      if (initialData) {
        await dispatch(
          updateRestaurantCoupon({
            id: initialData.id,
            data: { price, isActive: form.isActive },
          }),
        ).unwrap()
      } else {
        await dispatch(
          createRestaurantCoupon({
            mealId: Number(form.mealId),
            dayOfWeek: form.dayOfWeek,
            price,
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
          <h2 className="text-[18px] font-semibold">{isEdit ? 'Edit Coupon' : 'Add Coupon'}</h2>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <ErrorBanner message={error ?? undefined} />

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Meal</span>
            <div className="relative">
              <select
                value={form.mealId}
                disabled={isEdit}
                onChange={(event) => setForm((current) => ({ ...current, mealId: event.target.value }))}
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 pr-10 text-sm outline-none focus:border-[#004bb4] disabled:opacity-60"
              >
                <option value="">Select meal</option>
                {meals.map((meal) => (
                  <option key={meal.id} value={meal.id}>
                    {meal.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Day of Week</span>
              <select
                value={form.dayOfWeek}
                disabled={isEdit}
                onChange={(event) => setForm((current) => ({ ...current, dayOfWeek: event.target.value as RestaurantDayOfWeek }))}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#004bb4] disabled:opacity-60"
              >
                {restaurantDaysOfWeek.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Price</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#004bb4]"
                placeholder="0.00"
              />
            </label>
          </div>

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
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Coupon'}
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
            Cancel
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function CouponsByMealDrawer({
  mealName,
  coupons,
  loading,
  error,
  onClose,
}: {
  mealName: string
  coupons: RestaurantCoupon[]
  loading: boolean
  error?: string
  onClose: () => void
}) {
  const couponsByDay = new Map(coupons.map((coupon) => [coupon.dayOfWeek, coupon]))

  return (
    <aside className="fixed bottom-0 right-0 top-0 z-[120] w-[460px] max-w-[95vw] overflow-y-auto bg-white shadow-2xl">
      <div className="flex h-[72px] items-center justify-between border-b border-slate-100 px-6">
        <h2 className="text-lg font-semibold text-slate-900">Meal Coupons</h2>
        <button type="button" className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100" onClick={onClose} aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-6 py-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm text-slate-500">Meal</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{mealName}</div>
        </div>

        {loading && (
          <div className="flex h-40 items-center justify-center text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        <ErrorBanner message={error} />

        {!loading && (
          <div className="mt-5 space-y-3">
            {restaurantDaysOfWeek.map((day) => {
              const coupon = couponsByDay.get(day)

              return (
                <div key={day} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-sm">
                  <div>
                    <div className="font-semibold text-slate-900">{day}</div>
                    <div className="mt-1 text-slate-500">{coupon ? (coupon.isActive ? 'Active' : 'Inactive') : 'No coupon'}</div>
                  </div>
                  <div className={coupon ? 'font-semibold text-slate-900' : 'text-slate-400'}>
                    {coupon ? formatMoney(coupon.price) : '-'}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}

export function CouponsListTab() {
  const dispatch = useDispatch<AppDispatch>()
  const { items, status, error, byMeal, byMealStatus, byMealError, mutationStatus } = useSelector(
    (state: RootState) => state.restaurantCoupons,
  )
  const { items: meals, status: mealsStatus } = useSelector((state: RootState) => state.restaurantMeals)

  const [mealFilter, setMealFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<RestaurantCoupon | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RestaurantCoupon | null>(null)
  const [drawerMeal, setDrawerMeal] = useState<RestaurantMeal | null>(null)

  const query = useMemo(
    () => ({
      pageNumber: 1,
      pageSize: 50,
      mealId: mealFilter === 'all' ? undefined : Number(mealFilter),
      isActive: statusFilterValue(statusFilter),
    }),
    [mealFilter, statusFilter],
  )

  useEffect(() => {
    dispatch(fetchRestaurantCoupons(query))
  }, [dispatch, query])

  useEffect(() => {
    if (mealsStatus === 'idle') dispatch(fetchRestaurantMeals({ pageNumber: 1, pageSize: 100, isActive: true }))
  }, [dispatch, mealsStatus])

  const visibleItems = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    if (!normalized) return items
    return items.filter((coupon) =>
      [coupon.mealName, coupon.dayOfWeekName, String(coupon.price)].some((value) => value.toLowerCase().includes(normalized)),
    )
  }, [items, searchQuery])

  const isLoading = status === 'loading'
  const isMutating = mutationStatus === 'loading'

  const refreshCoupons = () => {
    dispatch(fetchRestaurantCoupons(query))
    if (drawerMeal) dispatch(fetchRestaurantCouponsByMeal(drawerMeal.id))
  }

  const openMealDrawer = (mealId: number) => {
    const meal = meals.find((item) => item.id === mealId)
    setDrawerMeal(meal ?? null)
    dispatch(fetchRestaurantCouponsByMeal(mealId))
  }

  const closeMealDrawer = () => {
    setDrawerMeal(null)
    dispatch(clearRestaurantCouponsByMeal())
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await dispatch(deleteRestaurantCoupon(deleteTarget.id)).unwrap()
    setDeleteTarget(null)
    refreshCoupons()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[22px] font-semibold text-slate-900">Coupons</h2>
          <p className="mt-1 text-sm text-slate-500">Manage meal coupon pricing by day of week.</p>
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
          Add Coupon
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-10 w-[280px] rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#004bb4]"
            placeholder="Search coupons..."
          />
        </div>

        <select
          value={mealFilter}
          onChange={(event) => setMealFilter(event.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#004bb4]"
        >
          <option value="all">All meals</option>
          {meals.map((meal) => (
            <option key={meal.id} value={meal.id}>
              {meal.name}
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

      {isLoading && visibleItems.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-slate-400">
          <Ticket className="h-12 w-12 opacity-50" />
          <p className="text-sm">No coupons found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid h-12 grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.9fr_1fr] items-center bg-slate-50 px-4 text-xs font-bold uppercase tracking-wide text-slate-500">
            <div>Meal</div>
            <div>Day</div>
            <div>Price</div>
            <div>Status</div>
            <div>Created</div>
            <div className="text-right">Actions</div>
          </div>

          {visibleItems.map((coupon) => (
            <div key={coupon.id} className="grid min-h-16 grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.9fr_1fr] items-center border-t border-slate-100 px-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">{coupon.mealName}</div>
              <div>{coupon.dayOfWeekName}</div>
              <div className="font-semibold text-slate-900">{formatMoney(coupon.price)}</div>
              <div>
                <span className={['rounded-full px-3 py-1 text-xs font-semibold', coupon.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'].join(' ')}>
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>{formatDate(coupon.createdAt)}</div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => openMealDrawer(coupon.mealId)} aria-label="View meal coupons">
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-lg text-[#004bb4] hover:bg-blue-50"
                  onClick={() => {
                    setEditTarget(coupon)
                    setFormOpen(true)
                  }}
                  aria-label="Edit coupon"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget(coupon)} aria-label="Delete coupon">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CouponModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        meals={meals}
        initialData={editTarget}
        onSaved={refreshCoupons}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Coupon"
        message={`Delete ${deleteTarget?.mealName ?? 'this coupon'} for ${deleteTarget?.dayOfWeekName ?? 'this day'}? The backend allows this only when no sales exist.`}
        loading={isMutating}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {drawerMeal && (
        <CouponsByMealDrawer
          mealName={drawerMeal.name}
          coupons={byMeal}
          loading={byMealStatus === 'loading'}
          error={byMealError}
          onClose={closeMealDrawer}
        />
      )}
    </div>
  )
}

export function CouponSalesTab() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="text-[22px] font-semibold text-slate-900">Coupon Sales</h2>
        <p className="mt-1 text-sm text-slate-500">Sales reporting will be connected when the backend endpoint is available.</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-[#004bb4]">
          <CalendarDays className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">Sales endpoint is not available yet</h3>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          The coupon setup API is ready, but coupon sales data was not included in the provided Swagger notes.
        </p>
      </div>
    </div>
  )
}
