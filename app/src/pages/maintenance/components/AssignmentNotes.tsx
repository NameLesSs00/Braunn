import { X } from 'lucide-react'
import { Modal } from '../../../shared/ui/Modal'
import type { MaintenanceRequest } from '../data'

type Props = {
  open: boolean
  request: MaintenanceRequest | null
  onClose: () => void
}

export function AssignmentNotes({ open, request, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[520px] max-w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between bg-[#0B4EA2] px-6 py-4 text-white">
          <div>
            <h2 className="text-base font-bold">Assignment Details</h2>
            <p className="text-[12px] text-blue-100">{request?.requestNo ?? 'Maintenance request'}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Assigned to</div>
            <div className="mt-1 text-sm font-semibold text-slate-800">{request?.employee ?? 'Not assigned'}</div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Notes</div>
            <div className="mt-1 text-sm leading-6 text-slate-700">{request?.notes || 'No notes provided.'}</div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
