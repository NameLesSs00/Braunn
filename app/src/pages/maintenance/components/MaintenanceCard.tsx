import { Eye, UserPlus } from 'lucide-react'
import type { MaintenanceRequestListItem } from '../../../models/MaintenanceRequest'
import { PriorityBadge } from './PriorityBadge'
import { RequestStatusBadge } from './RequestStatusBadge'

type Props = {
  request: MaintenanceRequestListItem
  onAssign: (request: MaintenanceRequestListItem) => void
  onView: () => void
}

export function MaintenanceCard({ request, onAssign, onView }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[13px] font-semibold text-slate-800">{request.requestNo ?? `#${request.id}`}</div>
          <div className="mt-1 text-sm font-semibold text-slate-800">{request.location}</div>
        </div>
        <PriorityBadge priority={request.priorityLevel} />
      </div>

      <div className="mt-3 space-y-2 text-[12px] text-slate-600">
        <div className="flex items-center justify-between"><span>Room</span><span className="font-semibold text-slate-800">{request.roomNo ?? '—'}</span></div>
        <div className="flex items-center justify-between"><span>Source</span><span className="font-semibold text-slate-800">{request.source}</span></div>
        <div className="flex items-center justify-between"><span>Item</span><span className="font-semibold text-slate-800">{request.itemName ?? '—'}</span></div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <RequestStatusBadge status={request.status} />
        <div className="flex gap-2">
          <button type="button" onClick={() => onAssign(request)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-[#0B4EA2] hover:text-[#0B4EA2]">
            <UserPlus className="h-4 w-4" />
          </button>
          <button type="button" onClick={onView} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-[#0B4EA2] hover:text-[#0B4EA2]">
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
