import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchMaintenanceCategories } from '../../../features/maintenance/maintenanceCategoriesSlice'

type Props = {
  category: string
  onCategoryChange: (value: string) => void
  priority: string
  onPriorityChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
}

const selectClass = 'h-11 min-w-[160px] appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-600 outline-none'

export function FilterBar({ category, onCategoryChange, priority, onPriorityChange, status, onStatusChange }: Props) {
  const dispatch = useAppDispatch()
  const categories = useAppSelector((s) => s.maintenanceCategories.items)

  useEffect(() => {
    dispatch(fetchMaintenanceCategories())
  }, [dispatch])

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <select className={selectClass} value={category} onChange={(event) => onCategoryChange(event.target.value)}>
          <option value="all">All Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
      </div>

      <div className="relative">
        <select className={selectClass} value={priority} onChange={(event) => onPriorityChange(event.target.value)}>
          <option value="all">All Priority</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
      </div>

      <div className="relative">
        <select className={selectClass} value={status} onChange={(event) => onStatusChange(event.target.value)}>
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Assigned">Assigned</option>
          <option value="InProgress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
      </div>
    </div>
  )
}
