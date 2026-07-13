import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Eye } from 'lucide-react'
import { IoSearchSharp } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import type { GroupChildReservation, GroupReservationListItem } from '../../models/GroupReservation'
import { getGroupReservations } from '../../shared/apis/GroupReservations'
import { routes } from '../../shared/lib/routes'
import { IconImage } from '../../shared/ui/IconImage'

type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

function getGroupId(group: GroupReservationListItem) {
  return group.groupReservationId || group.groupId || group.id || ''
}

function getChildReservations(group: GroupReservationListItem): GroupChildReservation[] {
  return group.childReservations || group.reservations || group.localReservations || []
}

function getCurrency(group: GroupReservationListItem) {
  return getChildReservations(group).find((child) => child.currency)?.currency || 'EUR'
}

function formatDateForDisplay(value?: string | null) {
  if (!value) return '-----'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function formatMoney(value?: number | null, currency = 'EUR') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0))
}

function normalizeStatus(value?: string | null) {
  return (value || '').replace(/[\s_-]/g, '').toLowerCase()
}

function getStatusTagClass(status?: string | null) {
  switch (normalizeStatus(status)) {
    case 'confirmed':
      return 'border-indigo-200 bg-indigo-50 text-indigo-700'
    case 'pending':
      return 'border-orange-200 bg-orange-50 text-orange-700'
    case 'cancelled':
    case 'canceled':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    default:
      return 'border-slate-200 bg-white text-slate-600'
  }
}

function getGuestCount(group: GroupReservationListItem) {
  const guests = new Set<string>()
  getChildReservations(group).forEach((child, index) => {
    guests.add(child.guestId || child.guestName || child.reservationId || String(index))
  })
  return guests.size
}

function getVisiblePageNumbers(page: number, pages: number) {
  const visible = new Set<number>([1, pages, page - 1, page, page + 1])
  if (page <= 3) {
    visible.add(2)
    visible.add(3)
    visible.add(4)
  }
  if (page >= pages - 2) {
    visible.add(pages - 3)
    visible.add(pages - 2)
    visible.add(pages - 1)
  }
  return Array.from(visible)
    .filter((p) => p >= 1 && p <= pages)
    .sort((a, b) => a - b)
}

function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  if (pages <= 1) return null

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        onClick={() => onChange(Math.max(1, page - 1))}
        aria-label="Previous"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {getVisiblePageNumbers(page, pages).map((p) => (
        <button
          key={p}
          type="button"
          className={[
            'grid h-9 w-9 place-items-center rounded-full text-sm font-semibold',
            p === page ? 'bg-[#0B4EA2] text-white' : 'bg-white text-slate-500 hover:bg-slate-50',
          ].join(' ')}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        onClick={() => onChange(Math.min(pages, page + 1))}
        aria-label="Next"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

export function GroupReservationsPage() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState<GroupReservationListItem[]>([])
  const [status, setStatus] = useState<LoadStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 15

  const loadGroups = () => {
    const controller = new AbortController()
    setStatus('loading')
    setError(null)

    getGroupReservations(controller.signal)
      .then((data) => {
        setGroups(Array.isArray(data) ? data : [])
        setStatus('success')
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Could not load group reservations.')
        setStatus('error')
      })

    return () => controller.abort()
  }

  useEffect(() => loadGroups(), [])

  const filteredGroups = useMemo(() => {
    const value = query.trim().toLowerCase()
    let result = [...groups]

    if (value) {
      result = result.filter((group) => {
        const children = getChildReservations(group)
        return [
          group.groupName,
          group.groupReference,
          group.status,
          ...children.map((child) => child.guestName),
        ]
          .filter(Boolean)
          .some((item) => String(item).toLowerCase().includes(value))
      })
    }

    if (statusFilter) {
      result = result.filter((group) => group.status === statusFilter)
    }

    return result
  }, [groups, query, statusFilter])

  useEffect(() => {
    setPage(1)
  }, [query, statusFilter])

  const pages = Math.max(1, Math.ceil(filteredGroups.length / perPage))
  const safePage = Math.min(page, pages)

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * perPage
    return filteredGroups.slice(start, start + perPage)
  }, [filteredGroups, safePage])

  const exportGroups = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Group Reservations List', 14, 20)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 29)

    autoTable(doc, {
      startY: 38,
      head: [[
        'Group Name',
        'Reference',
        'Status',
        'Arrival Date',
        'Departure Date',
        'Total',
        'Reservations',
        'Guests',
      ]],
      body: filteredGroups.map((group) => [
        group.groupName || '-----',
        group.groupReference || '-----',
        group.status || '-----',
        formatDateForDisplay(group.arrivalDate),
        formatDateForDisplay(group.departureDate),
        formatMoney(group.totalAfterDiscount, getCurrency(group)),
        String(group.childReservationCount ?? getChildReservations(group).length),
        String(getGuestCount(group)),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [11, 78, 162], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [244, 249, 255] },
      styles: { fontSize: 8, cellPadding: 2.5 },
    })

    doc.save('Group_Reservations.pdf')
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full max-w-2xl">
            <input
              className="h-11 w-full rounded-full bg-[#F3F5FF] px-6 pr-12 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="Search by Group Name ,ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 opacity-70">
              <IconImage src={IoSearchSharp} alt="Search" className="h-4 w-4" />
            </div>
          </div>

          <div className="text-sm font-semibold text-slate-600">{filteredGroups.length} results</div>
        </div>

        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[160px] space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</div>
            <select
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-600 outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All status</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={exportGroups}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0B4EA2] px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#093d81] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700 shadow-sm">{error}</div>
      ) : null}

      <div className="rounded-2xl bg-white shadow-sm">
        <div className="grid grid-cols-[1.55fr_.9fr_1fr_1fr_1fr_.8fr_.7fr_.8fr] bg-[#EAF2FF] px-6 py-3 text-[12px] font-semibold text-slate-700">
          <div>Group Name</div>
          <div>Status</div>
          <div>Arrival Date</div>
          <div>Departure Date</div>
          <div>Total</div>
          <div>Reservations</div>
          <div>Guests</div>
          <div className="text-center">Action</div>
        </div>

        <div className="min-h-[360px] flex flex-col">
          {status === 'loading' && groups.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0B4EA2]/20 border-t-[#0B4EA2]" />
              <p className="mt-3 text-sm font-medium text-slate-500">Loading group reservations...</p>
            </div>
          ) : pageRows.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
              <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
                <IoSearchSharp className="h-6 w-6" />
              </div>
              <h3 className="text-[15px] font-semibold text-slate-700">No group reservations found</h3>
            </div>
          ) : (
            pageRows.map((group, idx) => {
              const groupId = getGroupId(group)
              return (
                <div
                  key={groupId || group.groupReference || `${group.groupName ?? 'group'}-${idx}`}
                  className={[
                    'grid grid-cols-[1.55fr_.9fr_1fr_1fr_1fr_.8fr_.7fr_.8fr] items-center px-6 py-3 text-[12px] text-slate-700',
                    idx % 2 === 1 ? 'bg-[#F4F9FF]' : 'bg-white',
                  ].join(' ')}
                >
                  <div className="min-w-0 leading-tight">
                    <div className="truncate font-medium text-slate-800">{group.groupName || '-----'}</div>
                    <div className="truncate text-[11px] text-slate-500">{group.groupReference || '-----'}</div>
                  </div>

                  <div>
                    <span
                      className={[
                        'inline-flex max-w-full items-center rounded-full border px-3 py-1 text-[11px] font-semibold leading-none',
                        getStatusTagClass(group.status),
                      ].join(' ')}
                      title={group.status || undefined}
                    >
                      <span className="truncate">{group.status || '-----'}</span>
                    </span>
                  </div>

                  <div>{formatDateForDisplay(group.arrivalDate)}</div>
                  <div>{formatDateForDisplay(group.departureDate)}</div>
                  <div className="font-semibold text-slate-800">{formatMoney(group.totalAfterDiscount, getCurrency(group))}</div>
                  <div>{group.childReservationCount ?? getChildReservations(group).length}</div>
                  <div>{getGuestCount(group)}</div>

                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      disabled={!groupId}
                      onClick={() => navigate(routes.groupReservationDetails.replace(':groupReservationId', groupId))}
                      className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md bg-[#0B4EA2] px-3 text-[12px] font-semibold leading-none text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                      aria-label="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="mt-4 flex justify-between items-center px-6 pb-5">
          <div className="text-[13px] text-slate-500 font-medium">
            Showing {pageRows.length} of {filteredGroups.length} group reservations
          </div>
          <Pagination page={safePage} pages={pages} onChange={setPage} />
        </div>
      </div>
    </div>
  )
}
