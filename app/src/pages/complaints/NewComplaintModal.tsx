import { useMemo, useState } from 'react'
import { X, Search } from 'lucide-react'
import Swal from 'sweetalert2'

import { Modal } from '../../shared/ui/Modal'
import { useAppDispatch } from '../../store/hooks'
import { createComplaint, fetchComplaints } from '../../features/frontOfficeComplaints/frontOfficeComplaintsSlice'
import { searchGuests } from '../../shared/apis/guestsApi'
import type { ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../../models/FrontOfficeComplaint'
import type { Guest } from '../../models/Guest'

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
    InProgress: 'bg-amber-100 text-amber-700',
    Resolved: 'bg-emerald-100 text-emerald-700',
  }
  return themes[value as ComplaintStatus] ?? 'bg-slate-100 text-slate-700'
}

function formatDateTime(date: Date) {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function NewComplaintModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  
  // Step 1: Guest Search
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [guests, setGuests] = useState<Guest[]>([])
  const [guest, setGuest] = useState<Guest | null>(null)
  const [searchError, setSearchError] = useState('')

  // Step 2: Form
  const [form, setForm] = useState({
    category: '' as ComplaintCategory | '',
    priority: '' as ComplaintPriority | '',
    status: 'Open' as ComplaintStatus | '',
    subject: '',
    description: '',
    reportedBy: '',
    assignedToUserId: '',
    assignedToName: '',
  })

  const isFormValid = useMemo(() => {
    return (
      form.category &&
      form.priority &&
      form.status &&
      form.subject.trim() &&
      form.description.trim()
    )
  }, [form])

  const handleClose = () => {
    onClose()
    setStep(1)
    setSearchQuery('')
    setGuests([])
    setGuest(null)
    setSearchError('')
    setForm({
      category: '',
      priority: '',
      status: 'Open',
      subject: '',
      description: '',
      reportedBy: '',
      assignedToUserId: '',
      assignedToName: '',
    })
  }

  const handleSearchGuest = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    setSearchError('')
    setGuests([])
    try {
      const foundGuests = await searchGuests(searchQuery, 10)
      if (foundGuests && foundGuests.length > 0) {
        if (foundGuests.length === 1) {
          setGuest(foundGuests[0])
          setStep(2)
        } else {
          setGuests(foundGuests)
        }
      } else {
        setSearchError('No guests found. Please try a different name or ID.')
      }
    } catch (e: any) {
      setSearchError(e.message || 'Error searching for guest.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleProceedToReview = () => {
    if (!isFormValid) return
    setStep(3)
  }

  const handleSubmit = async () => {
    if (!guest || !isFormValid) return
    
    try {
      await dispatch(createComplaint({
        guestId: guest.id,
        complaintCategory: form.category as ComplaintCategory,
        complaintPriority: form.priority as ComplaintPriority,
        status: form.status as ComplaintStatus,
        subject: form.subject,
        description: form.description,
        reportedByName: form.reportedBy || undefined,
        assignedToUserId: form.assignedToUserId || undefined,
        assignedToName: form.assignedToName || undefined,
      })).unwrap()
      
      dispatch(fetchComplaints({}))
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        icon: 'success',
        title: 'Complaint created successfully',
      })
      handleClose()
    } catch (e: any) {
      console.error('Failed to create complaint', e)
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        icon: 'error',
        title: 'Failed to create complaint',
        text: typeof e === 'string' ? e : (e?.message || 'Unknown error occurred')
      })
    }
  }

  const categoryOptions: ComplaintCategory[] = ['Room', 'Noise', 'Cleanliness', 'Service']
  const priorityOptions: ComplaintPriority[] = ['Low', 'Medium', 'High', 'Urgent']
  const statusOptions: ComplaintStatus[] = ['Open', 'InProgress', 'Resolved']

  return (
    <Modal open={open} onClose={handleClose} lockScroll>
      <div className="flex max-h-[90vh] w-[94vw] max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-[#0B4EA2] px-6 py-4">
          <div className="text-base font-semibold text-white">
            {step === 1 && 'Find Guest'}
            {step === 2 && 'New Complaint Details'}
            {step === 3 && 'Review Complaint'}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="grid h-9 w-9 place-items-center rounded-full text-white/90 hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-5">
              <label className="block">
                <div className="mb-1.5 text-sm font-medium text-slate-700">
                  Guest Name or National ID <span className="text-rose-500">*</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 pr-12 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
                    placeholder="Enter Name or National ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearchGuest() }}
                  />
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="h-4 w-4" />
                  </div>
                </div>
              </label>
              
              {searchError && (
                <div className="text-sm text-rose-500 font-medium bg-rose-50 p-3 rounded-lg border border-rose-100">
                  {searchError}
                </div>
              )}

              {guests.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium text-slate-700">Select a Guest</div>
                  <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                    {guests.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        className="w-full flex flex-col items-start p-3 bg-white hover:bg-slate-50 transition-colors"
                        onClick={() => {
                          setGuest(g)
                          setStep(2)
                        }}
                      >
                        <span className="text-sm font-medium text-slate-800">{g.fullName}</span>
                        <span className="text-xs text-slate-500">National ID: {g.idNumber || '—'} | Phone: {g.phone || '—'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-800">Guest Selected</div>
                <div className="mt-1 font-medium text-blue-900">{guest?.fullName}</div>
                <div className="text-sm text-blue-700">National ID: {guest?.idNumber}</div>
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
                      <option value="">Select...</option>
                      {categoryOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
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
                      <option value="">Select...</option>
                      {priorityOptions.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
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
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s === 'InProgress' ? 'In Progress' : s}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
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
                    Reported By <span className="text-slate-400 text-xs font-normal">(optional)</span>
                  </div>
                  <input
                    type="text"
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
                    placeholder="E.g. Front Desk Staff"
                    value={form.reportedBy}
                    onChange={(e) => setForm((f) => ({ ...f, reportedBy: e.target.value }))}
                  />
                </label>

                <label className="block">
                  <div className="mb-1.5 text-sm font-medium text-slate-700">
                    Assigned To <span className="text-slate-400 text-xs font-normal">(optional)</span>
                  </div>
                  <input
                    type="text"
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
                    placeholder="E.g. Maintenance Team"
                    value={form.assignedToName}
                    onChange={(e) => setForm((f) => ({ ...f, assignedToName: e.target.value }))}
                  />
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-slate-500">Guest Name</div>
                  <div className="mt-1 text-sm font-medium text-slate-800">{guest?.fullName}</div>
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
                      {form.status === 'InProgress' ? 'In Progress' : form.status}
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
                  <div className="mt-1 text-sm font-medium text-slate-800">{form.reportedBy || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Assigned To</div>
                  <div className="mt-1 text-sm font-medium text-slate-800">
                    {form.assignedToName || '—'}
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

        <div className="flex items-center justify-center gap-4 border-t border-slate-200 px-6 py-5 bg-slate-50">
          {step === 1 && (
            <>
              <button
                type="button"
                className="h-11 w-full max-w-[200px] rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className={[
                  'h-11 w-full max-w-[200px] rounded-xl text-sm font-semibold text-white transition-colors',
                  searchQuery.trim() && !isSearching ? 'bg-[#0B4EA2] hover:bg-[#094383]' : 'bg-slate-300 cursor-not-allowed',
                ].join(' ')}
                onClick={handleSearchGuest}
                disabled={!searchQuery.trim() || isSearching}
              >
                {isSearching ? 'Searching...' : 'Search Guest'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                className="h-11 w-full max-w-[200px] rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="button"
                className={[
                  'h-11 w-full max-w-[200px] rounded-xl text-sm font-semibold text-white transition-colors',
                  isFormValid ? 'bg-[#0B4EA2] hover:bg-[#094383]' : 'bg-slate-300 cursor-not-allowed',
                ].join(' ')}
                onClick={handleProceedToReview}
                disabled={!isFormValid}
              >
                Review Complaint
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button
                type="button"
                className="h-11 w-full max-w-[200px] rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                onClick={() => setStep(2)}
              >
                Edit
              </button>
              <button
                type="button"
                className="h-11 w-full max-w-[200px] rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                onClick={handleSubmit}
              >
                Submit Complaint
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
