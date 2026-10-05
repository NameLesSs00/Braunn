import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Scale, Loader2, AlertCircle, Search, Plus } from 'lucide-react'
import type { AppDispatch, RootState } from '../../../../../../store/store'
import { fetchRestaurantUnits } from '../../../../../../features/restaurant/restaurantUnitsSlice'
import type { RestaurantUnit } from '../../../../../../models/RestaurantUnit'
import { AddEditUnitModal } from './modals/AddEditUnitModal'
import { ToggleUnitStatusModal } from './modals/ToggleUnitStatusModal'

export function SettingsUnitsTab() {
  const dispatch = useDispatch<AppDispatch>()
  const { items, status, error } = useSelector((state: RootState) => state.restaurantUnits)

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Modals state
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<RestaurantUnit | null>(null)
  const [toggleTarget, setToggleTarget] = useState<RestaurantUnit | null>(null)

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Fetch data
  useEffect(() => {
    dispatch(fetchRestaurantUnits({ search: debouncedSearch }))
  }, [dispatch, debouncedSearch])

  const isLoading = status === 'loading'

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search units..."
              className="h-10 w-[280px] rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-[14px] text-slate-700 outline-none transition-colors focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-[#0B4EA2] px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#093c80]"
        >
          <Plus className="h-4 w-4" />
          Add Unit
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && items.length === 0 && (
        <div className="flex flex-1 items-center justify-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && !error && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-slate-400">
          <Scale className="h-12 w-12 opacity-50" />
          <p className="text-[14px]">No units found.</p>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {items.map((unit) => (
          <div
            key={unit.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0B4EA2]">
                <Scale className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold text-slate-800">{unit.name}</h3>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[12px] font-medium text-slate-600">
                    {unit.symbol}
                  </span>
                  {!unit.isActive && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[12px] text-slate-400">
                  Added on {new Date(unit.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 pr-4">
              <button
                onClick={() => setToggleTarget(unit)}
                className={`text-[13px] font-semibold transition-colors ${
                  unit.isActive
                    ? 'text-slate-500 hover:text-orange-600'
                    : 'text-emerald-600 hover:text-emerald-700'
                }`}
              >
                {unit.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => setEditTarget(unit)}
                className="text-[13px] font-semibold text-[#0B4EA2] transition-colors hover:text-[#093c80]"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <AddEditUnitModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        mode="add"
      />

      {editTarget && (
        <AddEditUnitModal
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          mode="edit"
          initialData={editTarget}
        />
      )}

      {toggleTarget && (
        <ToggleUnitStatusModal
          open={!!toggleTarget}
          onClose={() => setToggleTarget(null)}
          unitId={toggleTarget.id}
          unitName={toggleTarget.name}
          currentStatus={toggleTarget.isActive}
        />
      )}
    </div>
  )
}
