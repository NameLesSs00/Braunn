import { CalendarDays, MapPin, UserRound } from 'lucide-react'
import { StatusPill } from './StatusPill'

type WorkOrder = {
  id: string
  title: string
  room: string
  technician: string
  dueDate: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'Open' | 'In Progress' | 'Waiting' | 'Completed'
}

type Props = {
  workOrder: WorkOrder
}

export function WorkOrderCard({ workOrder }: Props) {
  const tone =
    workOrder.status === 'Completed'
      ? 'green'
      : workOrder.status === 'In Progress'
        ? 'blue'
        : workOrder.status === 'Waiting'
          ? 'amber'
          : 'red'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">{workOrder.id}</div>
          <h3 className="mt-1 text-lg font-semibold text-slate-800">{workOrder.title}</h3>
        </div>
        <StatusPill tone={tone}>{workOrder.status}</StatusPill>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4 text-[#9F0712]" />
          <span>{workOrder.room}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <UserRound className="h-4 w-4 text-[#9F0712]" />
          <span>{workOrder.technician}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <CalendarDays className="h-4 w-4 text-[#9F0712]" />
          <span>{workOrder.dueDate}</span>
        </div>
      </div>
    </div>
  )
}
