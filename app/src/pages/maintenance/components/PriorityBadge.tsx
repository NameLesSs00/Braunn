import type { MaintenancePriority } from '../data'

const priorityMap: Record<MaintenancePriority, string> = {
  High: 'bg-rose-100 text-rose-600',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-emerald-100 text-emerald-700',
}

export function PriorityBadge({ priority }: { priority: MaintenancePriority }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${priorityMap[priority] ?? 'bg-slate-100 text-slate-600'}`}>
      {priority}
    </span>
  )
}
