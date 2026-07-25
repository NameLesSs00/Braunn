import { ArrowLeft, CalendarDays, MapPin, ClipboardList, NotebookPen, UserRound } from 'lucide-react'
import type { MaintenanceRequest } from '../data'
import { PriorityBadge } from './PriorityBadge'
import { RequestStatusBadge } from './RequestStatusBadge'

type Props = {
  request: MaintenanceRequest | null
  onBack: () => void
  onOpenNotes: () => void
}

export function RequestDetails({ request, onBack, onOpenNotes }: Props) {
  if (!request) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-3">
          <PriorityBadge priority={request.priority} />
          <RequestStatusBadge status={request.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-[#0B4EA2]">
              <ClipboardList className="h-5 w-5" />
              <h2 className="text-lg font-bold text-slate-800">Request Overview</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoRow label="Request No" value={request.requestNo} />
              <InfoRow label="Room" value={request.room} />
              <InfoRow label="Category" value={request.category} />
              <InfoRow label="Requester" value={request.requester} />
              <InfoRow label="Employee" value={request.employee} />
              <InfoRow label="Due Date" value={request.dueDate} />
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-800">Description</p>
              <p className="mt-2 leading-6">{request.description}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#0B4EA2]">
                <NotebookPen className="h-5 w-5" />
                <h2 className="text-lg font-bold text-slate-800">Assignment Notes</h2>
              </div>
              <button type="button" onClick={onOpenNotes} className="rounded-xl bg-[#0B4EA2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0A3F8B]">
                View Notes
              </button>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              {request.notes}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-[#0B4EA2]">
              <MapPin className="h-5 w-5" />
              <h2 className="text-lg font-bold text-slate-800">Location</h2>
            </div>
            <p className="mt-3 text-sm text-slate-700">{request.location}</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-[#0B4EA2]">
              <CalendarDays className="h-5 w-5" />
              <h2 className="text-lg font-bold text-slate-800">Submitted</h2>
            </div>
            <p className="mt-3 text-sm text-slate-700">{request.submittedAt}</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-[#0B4EA2]">
              <UserRound className="h-5 w-5" />
              <h2 className="text-lg font-bold text-slate-800">Assigned Team</h2>
            </div>
            <p className="mt-3 text-sm text-slate-700">{request.employee}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-800">{value}</div>
    </div>
  )
}
