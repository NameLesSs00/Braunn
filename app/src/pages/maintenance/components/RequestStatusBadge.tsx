import type { MaintenanceStatus } from '../data'

const statusMap: Record<MaintenanceStatus, string> = {
  Open: 'bg-[#EAF2FF] text-[#0B4EA2]',
  Assigned: 'bg-amber-100 text-amber-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-slate-100 text-slate-600',
}

export function RequestStatusBadge({ status }: { status: MaintenanceStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${statusMap[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  )
}
