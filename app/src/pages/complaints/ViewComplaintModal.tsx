import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

import { Modal } from '../../shared/ui/Modal'
import { useAppDispatch } from '../../store/hooks'
import { updateComplaintStatus } from '../../features/frontOfficeComplaints/frontOfficeComplaintsSlice'
import type { FrontOfficeComplaintReadDto, ComplaintStatus } from '../../models/FrontOfficeComplaint'

type Props = {
  complaint: FrontOfficeComplaintReadDto | null
  onClose: () => void
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function pillTheme(kind: 'category' | 'priority' | 'status', value: string) {
  if (kind === 'category') {
    const themes: Record<string, string> = {
      Room: 'bg-[#EAF2FF] text-[#0B4EA2]',
      Noise: 'bg-rose-100 text-rose-600',
      Cleanliness: 'bg-amber-100 text-amber-700',
      Service: 'bg-indigo-100 text-indigo-700',
    }
    return themes[value] ?? 'bg-slate-100 text-slate-700'
  }

  if (kind === 'priority') {
    const themes: Record<string, string> = {
      Low: 'bg-emerald-100 text-emerald-700',
      Medium: 'bg-amber-100 text-amber-700',
      High: 'bg-orange-100 text-orange-700',
      Urgent: 'bg-rose-100 text-rose-600',
    }
    return themes[value] ?? 'bg-slate-100 text-slate-700'
  }

  const themes: Record<string, string> = {
    Open: 'bg-[#EAF2FF] text-[#0B4EA2]',
    InProgress: 'bg-amber-100 text-amber-700',
    Resolved: 'bg-emerald-100 text-emerald-700',
  }
  return themes[value] ?? 'bg-slate-100 text-slate-700'
}

export function ViewComplaintModal({ complaint, onClose }: Props) {
  const dispatch = useAppDispatch()

  const [status, setStatus] = useState<ComplaintStatus>('Open')
  const [assignedToName, setAssignedToName] = useState('')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status)
      setAssignedToName(complaint.assignedToName || '')
      setResolutionNotes(complaint.resolutionNotes || '')
    }
  }, [complaint])

  if (!complaint) return null

  const hasChanges = 
    status !== complaint.status || 
    assignedToName !== (complaint.assignedToName || '') || 
    resolutionNotes !== (complaint.resolutionNotes || '')

  const handleSave = async () => {
    if (!complaint) return
    setIsSaving(true)
    try {
      await dispatch(updateComplaintStatus({
        id: complaint.id,
        payload: {
          status,
          assignedToName: assignedToName || undefined,
          resolutionNotes: resolutionNotes || undefined,
        }
      })).unwrap()
      onClose()
    } catch (e) {
      console.error('Failed to update complaint', e)
      alert('Failed to update complaint')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal open={!!complaint} onClose={onClose} lockScroll>
      <div className="flex max-h-[90vh] w-[94vw] max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-[#0B4EA2] px-6 py-4">
          <div className="text-base font-semibold text-white">
            Complaint Details - {complaint.complaintNumber}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-white/90 hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            
            {/* Header Info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-800">Guest Name</div>
                <div className="mt-1 font-medium text-blue-900">{complaint.guestName || '—'}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-800">Room</div>
                <div className="mt-1 font-medium text-blue-900">{complaint.roomNumber || '—'}</div>
              </div>
            </div>

            {/* Tags & Dates */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <div className="text-xs text-slate-500">Category</div>
                <div className="mt-1">
                  <span className={['inline-flex h-6 items-center rounded-full px-3 text-[11px] font-semibold', pillTheme('category', complaint.category)].join(' ')}>
                    {complaint.category}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Priority</div>
                <div className="mt-1">
                  <span className={['inline-flex h-6 items-center rounded-full px-3 text-[11px] font-semibold', pillTheme('priority', complaint.priority)].join(' ')}>
                    {complaint.priority}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Date Reported</div>
                <div className="mt-1 text-sm font-medium text-slate-800">
                  {formatDateTime(complaint.createdAtUtc)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Reported By</div>
                <div className="mt-1 text-sm font-medium text-slate-800">
                  {complaint.reportedByName || '—'}
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Subject and Description */}
            <div>
              <div className="text-xs font-medium text-slate-500 mb-1">Subject</div>
              <div className="text-sm font-semibold text-slate-800">{complaint.subject}</div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-500 mb-1">Description</div>
              <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {complaint.description}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Editable Resolution Section */}
            <h3 className="text-sm font-bold text-slate-800">Management & Resolution</h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <div className="mb-1.5 text-sm font-medium text-slate-700">Status</div>
                <div className="relative">
                  <select
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-700 outline-none focus:border-[#0B4EA2]"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                  >
                    <option value="Open">Open</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
                </div>
              </label>

              <label className="block">
                <div className="mb-1.5 text-sm font-medium text-slate-700">Assigned To</div>
                <input
                  type="text"
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
                  placeholder="E.g. Maintenance Team"
                  value={assignedToName}
                  onChange={(e) => setAssignedToName(e.target.value)}
                />
              </label>
            </div>

            <label className="block">
              <div className="mb-1.5 text-sm font-medium text-slate-700">Resolution Notes</div>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
                placeholder="Details about how this complaint was addressed..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />
            </label>

          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-5 bg-slate-50">
          <button
            type="button"
            className="h-10 px-5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
          {hasChanges && (
            <button
              type="button"
              className={[
                'h-10 px-6 rounded-xl text-sm font-semibold text-white transition-colors',
                isSaving ? 'bg-[#094383] opacity-80' : 'bg-[#0B4EA2] hover:bg-[#094383]',
              ].join(' ')}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
