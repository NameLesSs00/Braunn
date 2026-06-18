import { useMemo, useState } from 'react'
import { X } from 'lucide-react'

import { Modal } from '../../shared/ui/Modal'

type ComplaintStatus = 'Open' | 'In Progress' | 'Resolved'
type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Urgent'
type ComplaintCategory = 'Room' | 'Noise' | 'Cleanliness' | 'Service'

type NewComplaintForm = {
  guestName: string
  roomNumber: string
  category: ComplaintCategory | ''
  priority: ComplaintPriority | ''
  status: ComplaintStatus | ''
  subject: string
  description: string
  reportedBy: string
  assignedTo: string
}

type Props = {
  open: boolean
  onClose: () => void
}

function pillTheme(kind: 'category' | 'priority' | 'status', value: string) {
  if (kind === 'category') {
    const themes: Record<ComplaintCategory, string> = {
      Room: 'bg-[#EAF2FF] text-[#0B4EA2]',
      Noise: 'bg-rose-100 text-rose-600',
      Cleanliness: 'bg-amber-100 text-amber-700',
      Service: 'bg-indigo-100 text-indigo-700',
    }
    return themes[value as ComplaintCategory] ?? 'bg-slate-100 text-slate-700'
  }

  if (kind === 'priority') {
    const themes: Record<ComplaintPriority, string> = {
      Low: 'bg-emerald-100 text-emerald-700',
      Medium: 'bg-amber-100 text-amber-700',
      High: 'bg-orange-100 text-orange-700',
      Urgent: 'bg-rose-100 text-rose-600',
    }
    return themes[value as ComplaintPriority] ?? 'bg-slate-100 text-slate-700'
  }

  const themes: Record<ComplaintStatus, string> = {
    Open: 'bg-[#EAF2FF] text-[#0B4EA2]',
    'In Progress': 'bg-amber-100 text-amber-700',
    Resolved: 'bg-emerald-100 text-emerald-700',
  }
  return themes[value as ComplaintStatus] ?? 'bg-slate-100 text-slate-700'
}

function formatDateTime(date: Date) {
  return date.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

export function NewComplaintModal({ open, onClose }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState<NewComplaintForm>({
    guestName: '',
    roomNumber: '',
    category: '',
    priority: '',
    status: '',
    subject: '',
    description: '',
    reportedBy: '',
    assignedTo: '',
  })

  const isFormValid = useMemo(() => {
    return (
      form.guestName.trim() &&
      form.roomNumber.trim() &&
      form.category &&
      form.priority &&
      form.status &&
      form.subject.trim() &&
      form.description.trim() &&
      form.reportedBy.trim()
    )
  }, [form])

  const handleClose = () => {
    onClose()
    setStep(1)
    setForm({
      guestName: '',
      roomNumber: '',
      category: '',
      priority: '',
      status: '',
      subject: '',
      description: '',
      reportedBy: '',
      assignedTo: '',
    })
  }

  const handleSubmit = () => {
    if (!isFormValid) return
    setStep(2)
  }

  const categoryOptions: ComplaintCategory[] = ['Room', 'Noise', 'Cleanliness', 'Service']
  const priorityOptions: ComplaintPriority[] = ['Low', 'Medium', 'High', 'Urgent']
  const statusOptions: ComplaintStatus[] = ['Open', 'In Progress', 'Resolved']

  return (
    <Modal open={open} onClose={handleClose} lockScroll>
      <div className="flex max-h-[90vh] w-[94vw] max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-[#0B4EA2] px-6 py-4">
          <div className="text-base font-semibold text-white">
            {step === 1 ? 'New Complaint' : 'Complaint details'}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="grid h-9 w-9 place-items-center rounded-full text-white/90 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <div className="mb-1.5 text-sm font-medium text-slate-700">
                    Guest Name <span className="text-rose-500">*</span>
                  </div>
                  <input
                    type="text"
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
                    placeholder=""
                    value={form.guestName}
                    onChange={(e) => setForm((f) => ({ ...f, guestName: e.target.value }))}
                  />
                </label>

                <label className="block">
                  <div className="mb-1.5 text-sm font-medium text-slate-700">
                    Room Number <span className="text-rose-500">*</span>
                  </div>
                  <input
                    type="text"
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
                    placeholder=""
                    value={form.roomNumber}
                    onChange={(e) => setForm((f) => ({ ...f, roomNumber: e.target.value }))}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="block">
                  <div className="mb-1.5 text-sm font-medium text-slate-700">
                    Category <span className="text-rose-500">*</span>
                  </div>
                  <div className="relative">
                    <select
                      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-700 outline-none focus:border-[#0B4EA2]"
                      value={form.category}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category: e.target.value as ComplaintCategory }))
                      }
                    >
                      <option value="">select</option>
                      {categoryOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      ▾
                    </span>
                  </div>
                </label>

                <label className="block">
                  <div className="mb-1.5 text-sm font-medium text-slate-700">
                    Priority <span className="text-rose-500">*</span>
                  </div>
                  <div className="relative">
                    <select
                      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-700 outline-none focus:border-[#0B4EA2]"
                      value={form.priority}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, priority: e.target.value as ComplaintPriority }))
                      }
                    >
                      <option value="">select</option>
                      {priorityOptions.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      ▾
                    </span>
                  </div>
                </label>

                <label className="block">
                  <div className="mb-1.5 text-sm font-medium text-slate-700">
                    Status <span className="text-rose-500">*</span>
                  </div>
                  <div className="relative">
                    <select
                      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-700 outline-none focus:border-[#0B4EA2]"
                      value={form.status}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, status: e.target.value as ComplaintStatus }))
                      }
                    >
                      <option value="">select</option>
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      ▾
                    </span>
                  </div>
                </label>
              </div>

              <label className="block">
                <div className="mb-1.5 text-sm font-medium text-slate-700">
                  Subject <span className="text-rose-500">*</span>
                </div>
                <input
                  type="text"
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
                  placeholder="Brief summary of the complaint"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                />
              </label>

              <label className="block">
                <div className="mb-1.5 text-sm font-medium text-slate-700">
                  Description <span className="text-rose-500">*</span>
                </div>
                <textarea
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
                  placeholder="Detailed description of the complaint"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <div className="mb-1.5 text-sm font-medium text-slate-700">
                    Reported By <span className="text-rose-500">*</span>
                  </div>
                  <input
                    type="text"
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
                    placeholder=""
                    value={form.reportedBy}
                    onChange={(e) => setForm((f) => ({ ...f, reportedBy: e.target.value }))}
                  />
                </label>

                <label className="block">
                  <div className="mb-1.5 text-sm font-medium text-slate-700">Assigned To</div>
                  <input
                    type="text"
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
                    placeholder=""
                    value={form.assignedTo}
                    onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-slate-500">Guest Name</div>
                  <div className="mt-1 text-sm font-medium text-slate-800">{form.guestName}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Room Number</div>
                  <div className="mt-1 text-sm font-medium text-slate-800">{form.roomNumber}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-slate-500">Category</div>
                  <div className="mt-1">
                    <span
                      className={[
                        'inline-flex h-6 items-center rounded-full px-3 text-[11px] font-semibold',
                        pillTheme('category', form.category),
                      ].join(' ')}
                    >
                      {form.category}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Priority</div>
                  <div className="mt-1">
                    <span
                      className={[
                        'inline-flex h-6 items-center rounded-full px-3 text-[11px] font-semibold',
                        pillTheme('priority', form.priority),
                      ].join(' ')}
                    >
                      {form.priority}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-slate-500">Status</div>
                  <div className="mt-1">
                    <span
                      className={[
                        'inline-flex h-6 items-center rounded-full px-3 text-[11px] font-semibold',
                        pillTheme('status', form.status),
                      ].join(' ')}
                    >
                      {form.status}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Date Reported</div>
                  <div className="mt-1 text-sm font-medium text-slate-800">
                    {formatDateTime(new Date())}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-slate-500">Reported By</div>
                  <div className="mt-1 text-sm font-medium text-slate-800">{form.reportedBy}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Assigned To</div>
                  <div className="mt-1 text-sm font-medium text-slate-800">
                    {form.assignedTo || '—'}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500">Subject</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{form.subject}</div>
              </div>

              <div>
                <div className="text-xs text-slate-500">Description</div>
                <div className="mt-1 text-sm text-slate-700">{form.description}</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 border-t border-slate-200 px-6 py-5">
          {step === 1 ? (
            <>
              <button
                type="button"
                className="h-11 w-full max-w-[200px] rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={handleClose}
              >
                cancel
              </button>
              <button
                type="button"
                className={[
                  'h-11 w-full max-w-[200px] rounded-xl text-sm font-semibold text-white',
                  isFormValid ? 'bg-[#0B4EA2] hover:bg-[#094383]' : 'bg-slate-300 cursor-not-allowed',
                ].join(' ')}
                onClick={handleSubmit}
                disabled={!isFormValid}
              >
                Submit complaint
              </button>
            </>
          ) : (
            <button
              type="button"
              className="h-11 w-full max-w-[200px] rounded-xl bg-[#0B4EA2] text-sm font-semibold text-white hover:bg-[#094383]"
              onClick={handleClose}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
