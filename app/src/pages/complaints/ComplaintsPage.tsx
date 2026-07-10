import { useEffect, useMemo, useState } from 'react'
import { Eye, Plus, Search, User, BedSingle, Circle } from 'lucide-react'

import { NewComplaintModal } from './NewComplaintModal'
import { ViewComplaintModal } from './ViewComplaintModal'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchComplaints } from '../../features/frontOfficeComplaints/frontOfficeComplaintsSlice'
import type { ComplaintCategory, ComplaintPriority, ComplaintStatus, FrontOfficeComplaintReadDto } from '../../models/FrontOfficeComplaint'

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

  const themes: Record<ComplaintStatus, { pill: string; dot: string }> = {
    Open: { pill: 'bg-[#EAF2FF] text-[#0B4EA2]', dot: 'text-[#0B4EA2]' },
    InProgress: { pill: 'bg-amber-100 text-amber-700', dot: 'text-amber-600' },
    Resolved: { pill: 'bg-emerald-100 text-emerald-700', dot: 'text-emerald-600' },
  }

  // Fallback for UI if it still passes "In Progress"
  if (value === 'In Progress') {
    return themes['InProgress']?.pill ?? 'bg-slate-100 text-slate-700'
  }

  return themes[value as ComplaintStatus]?.pill ?? 'bg-slate-100 text-slate-700'
}

function statusDotTheme(value: ComplaintStatus | 'In Progress') {
  const themes: Record<ComplaintStatus | 'In Progress', string> = {
    Open: 'text-[#0B4EA2]',
    InProgress: 'text-amber-600',
    'In Progress': 'text-amber-600',
    Resolved: 'text-emerald-600',
  }
  return themes[value] ?? 'text-slate-500'
}

export function ComplaintsPage() {
  const dispatch = useAppDispatch()
  const { complaints, status: apiStatus } = useAppSelector((state) => state.frontOfficeComplaints)

  useEffect(() => {
    dispatch(fetchComplaints({}))
  }, [dispatch])

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'all' | ComplaintCategory>('all')
  const [priority, setPriority] = useState<'all' | ComplaintPriority>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | ComplaintStatus>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewingComplaint, setViewingComplaint] = useState<FrontOfficeComplaintReadDto | null>(null)

  const rows = useMemo(() => {
    let result = complaints

    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter((c) => [c.guestName, c.roomNumber, c.subject].some((v) => v && v.toLowerCase().includes(q)))
    }

    if (category !== 'all') result = result.filter((c) => c.category === category)
    if (priority !== 'all') result = result.filter((c) => c.priority === priority)
    if (statusFilter !== 'all') result = result.filter((c) => c.status === statusFilter)

    return result
  }, [complaints, category, priority, query, statusFilter])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-800">Complaints</h1>
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0B4EA2] px-5 text-sm font-semibold text-white"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Complaint
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[260px] flex-1">
              <input
                className="h-11 w-full rounded-full bg-[#F3F5FF] px-6 pr-12 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Search by guest, room and subject"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 opacity-70">
                <Search className="h-4 w-4" />
              </div>
            </div>

            <div className="relative">
              <select
                className="h-11 min-w-[160px] appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-600 outline-none"
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
              >
                <option value="all">All Category</option>
                <option value="Room">Room</option>
                <option value="Noise">Noise</option>
                <option value="Cleanliness">Cleanliness</option>
                <option value="Service">Service</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
            </div>

            <div className="relative">
              <select
                className="h-11 min-w-[160px] appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-600 outline-none"
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
              >
                <option value="all">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
            </div>

            <div className="relative">
              <select
                className="h-11 min-w-[140px] appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-600 outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              >
                <option value="all">All states</option>
                <option value="Open">Open</option>
                <option value="InProgress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="grid grid-cols-[140px_180px_100px_1fr_120px_120px_140px_120px_90px] bg-[#EAF2FF] px-6 py-3 text-[12px] font-semibold text-slate-700">
          <div>Complaint No.</div>
          <div>Guest</div>
          <div>Room</div>
          <div>Subject</div>
          <div>Category</div>
          <div>Priority</div>
          <div>Status</div>
          <div>Date</div>
          <div className="text-right">Actions</div>
        </div>

        <div>
          {apiStatus === 'loading' ? (
             <div className="px-6 py-10 text-center text-sm text-slate-500">Loading complaints...</div>
          ) : (
            <>
              {rows.map((row, idx) => (
                <div
                  key={row.id}
                  className={[
                    'grid grid-cols-[140px_180px_100px_1fr_120px_120px_140px_120px_90px] items-center px-6 py-4 text-[12px] text-slate-700',
                    idx % 2 === 1 ? 'bg-[#F4F9FF]' : 'bg-white',
                  ].join(' ')}
                >
                  <div className="font-semibold text-slate-800">{row.complaintNumber}</div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <div className="font-medium text-slate-800 truncate" title={row.guestName}>{row.guestName || '—'}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <BedSingle className="h-4 w-4 text-slate-400" />
                    <div className="font-medium text-slate-800">{row.roomNumber || '—'}</div>
                  </div>

                  <div className="text-slate-700 truncate" title={row.subject}>{row.subject}</div>

                  <div>
                    <span
                      className={[
                        'inline-flex h-6 items-center rounded-full px-3 text-[11px] font-semibold',
                        pillTheme('category', row.category),
                      ].join(' ')}
                    >
                      {row.category}
                    </span>
                  </div>

                  <div>
                    <span
                      className={[
                        'inline-flex h-6 items-center rounded-full px-3 text-[11px] font-semibold',
                        pillTheme('priority', row.priority),
                      ].join(' ')}
                    >
                      {row.priority}
                    </span>
                  </div>

                  <div>
                    <span
                      className={[
                        'inline-flex h-6 items-center gap-2 rounded-full px-3 text-[11px] font-semibold',
                        pillTheme('status', row.status),
                      ].join(' ')}
                    >
                      <Circle className={['h-3 w-3 fill-current', statusDotTheme(row.status)].join(' ')} />
                      {row.status === 'InProgress' ? 'In Progress' : row.status}
                    </span>
                  </div>

                  <div className="text-slate-600">
                    {row.createdAtUtc ? new Date(row.createdAtUtc).toLocaleDateString() : '—'}
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#0B4EA2] hover:underline"
                      onClick={() => setViewingComplaint(row)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </div>
                </div>
              ))}

              {rows.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-slate-500">No complaints match the current filters</div>
              ) : null}
            </>
          )}
        </div>
      </div>
      {isModalOpen && (
        <NewComplaintModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
      <ViewComplaintModal complaint={viewingComplaint} onClose={() => setViewingComplaint(null)} />
    </div>
  )
}
