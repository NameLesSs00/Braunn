import { useEffect, useRef, useState } from 'react'
import { Loader2, RefreshCw, Search, X, Eye, AlertTriangle, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { fetchOptionalReservationsList } from '../../../features/reservations/optionalReservationsSlice'
import { fetchRoomTypes } from '../../../features/roomTypes/roomTypesSlice'
import type { OptionalReservationFilters, OptionalReservationListItem } from '../../../models/OptionalReservation'
import { OptionalReservationDetailModal } from './OptionalReservationDetailModal'

const STATUS_OPTIONS = ['', 'Draft', 'Expired', 'Cancelled', 'Converted'] as const
const BOOKING_SOURCE_OPTIONS = ['', 'Phone', 'WalkIn'] as const
const PAGE_SIZE = 20

function formatDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' })
}

function StatusBadge({ status }: { status: string | number }) {
  const s = String(status).toLowerCase()
  const cls =
    s === 'draft' ? 'bg-blue-50 text-blue-700 border-blue-200' :
    s === 'expired' ? 'bg-rose-50 text-rose-700 border-rose-200' :
    s === 'cancelled' || s === 'canceled' ? 'bg-slate-100 text-slate-600 border-slate-200' :
    s === 'converted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
    'bg-amber-50 text-amber-700 border-amber-200'
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
      {String(status)}
    </span>
  )
}

function ExpiryChip({ item }: { item: OptionalReservationListItem }) {
  if (item.isExpired) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
      <AlertTriangle className="h-2.5 w-2.5" /> Expired
    </span>
  )
  if (item.expiresToday) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
      <Clock className="h-2.5 w-2.5" /> Today
    </span>
  )
  if (item.isExpiringSoon) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
      <Clock className="h-2.5 w-2.5" /> Soon
    </span>
  )
  return null
}

export function OptionalReservationsTab() {
  const dispatch = useAppDispatch()
  const { list, totalCount, page, totalPages, status } = useAppSelector((s) => s.optionalReservations)
  const roomTypes = useAppSelector((s) => s.roomTypes.items)

  const [filters, setFilters] = useState<OptionalReservationFilters>({ PageSize: PAGE_SIZE, Page: 1 })
  const [formFilters, setFormFilters] = useState<OptionalReservationFilters>({ PageSize: PAGE_SIZE, Page: 1 })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    if (roomTypes.length === 0) dispatch(fetchRoomTypes())
  }, [dispatch, roomTypes.length])
  const abortRef = useRef<AbortController | null>(null)

  const load = (f: OptionalReservationFilters) => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    dispatch(fetchOptionalReservationsList(f))
  }

  useEffect(() => {
    load(filters)
    return () => { abortRef.current?.abort() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const handleSearch = () => {
    const next = { ...formFilters, Page: 1 }
    setFilters(next)
  }

  const handleReset = () => {
    const reset: OptionalReservationFilters = { PageSize: PAGE_SIZE, Page: 1 }
    setFormFilters(reset)
    setFilters(reset)
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, Page: newPage }))
  }

  const handleView = (id: string) => {
    setSelectedId(id)
    setDetailOpen(true)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ── Filter Bar ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 text-sm font-semibold text-slate-600">Filters</div>
        <div className="grid grid-cols-3 gap-3 xl:grid-cols-4">
          {/* Status */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-400">Status</label>
            <select
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={formFilters.Status ?? ''}
              onChange={(e) => setFormFilters((p) => ({ ...p, Status: e.target.value || undefined }))}
            >
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
            </select>
          </div>

          {/* Booking Source */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-400">Booking Source</label>
            <select
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={formFilters.BookingSource ?? ''}
              onChange={(e) => setFormFilters((p) => ({ ...p, BookingSource: e.target.value || undefined }))}
            >
              {BOOKING_SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s || 'All Sources'}</option>)}
            </select>
          </div>

          {/* Check-in From */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-400">Check-in From</label>
            <input
              type="date"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={formFilters.CheckInFrom ?? ''}
              onChange={(e) => setFormFilters((p) => ({ ...p, CheckInFrom: e.target.value || undefined }))}
            />
          </div>

          {/* Check-in To */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-400">Check-in To</label>
            <input
              type="date"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={formFilters.CheckInTo ?? ''}
              onChange={(e) => setFormFilters((p) => ({ ...p, CheckInTo: e.target.value || undefined }))}
            />
          </div>

          {/* Check-out From */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-400">Check-out From</label>
            <input
              type="date"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={formFilters.CheckOutFrom ?? ''}
              onChange={(e) => setFormFilters((p) => ({ ...p, CheckOutFrom: e.target.value || undefined }))}
            />
          </div>

          {/* Check-out To */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-400">Check-out To</label>
            <input
              type="date"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={formFilters.CheckOutTo ?? ''}
              onChange={(e) => setFormFilters((p) => ({ ...p, CheckOutTo: e.target.value || undefined }))}
            />
          </div>

          {/* Expires From */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-400">Expires From</label>
            <input
              type="date"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={formFilters.ExpiresFrom ?? ''}
              onChange={(e) => setFormFilters((p) => ({ ...p, ExpiresFrom: e.target.value || undefined }))}
            />
          </div>

          {/* Expires To */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-400">Expires To</label>
            <input
              type="date"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={formFilters.ExpiresTo ?? ''}
              onChange={(e) => setFormFilters((p) => ({ ...p, ExpiresTo: e.target.value || undefined }))}
            />
          </div>
        </div>

        {/* Only Expired toggle + Action buttons */}
        <div className="mt-4 flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2">
            <div
              role="checkbox"
              aria-checked={formFilters.OnlyExpired ?? false}
              tabIndex={0}
              onClick={() => setFormFilters((p) => ({ ...p, OnlyExpired: p.OnlyExpired ? undefined : true }))}
              onKeyDown={(e) => e.key === 'Enter' && setFormFilters((p) => ({ ...p, OnlyExpired: p.OnlyExpired ? undefined : true }))}
              className={[
                'relative h-5 w-9 rounded-full transition-colors cursor-pointer',
                formFilters.OnlyExpired ? 'bg-[#0B4EA2]' : 'bg-slate-200',
              ].join(' ')}
            >
              <span className={['absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', formFilters.OnlyExpired ? 'translate-x-4' : 'translate-x-0.5'].join(' ')} />
            </div>
            <span className="text-sm font-medium text-slate-600">Only Expired</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 h-9 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-500 hover:bg-slate-50"
            >
              <X className="h-3.5 w-3.5" /> Reset
            </button>
            <button
              type="button"
              onClick={handleSearch}
              className="flex items-center gap-1.5 h-9 rounded-xl bg-[#0B4EA2] px-5 text-sm font-semibold text-white hover:bg-[#093d81]"
            >
              <Search className="h-3.5 w-3.5" /> Search
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="text-sm font-semibold text-slate-700">
            Optional Reservations
            {status === 'succeeded' && (
              <span className="ml-2 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">{totalCount}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => load(filters)}
            disabled={status === 'loading'}
            className="flex items-center gap-1.5 h-8 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={['h-3.5 w-3.5', status === 'loading' ? 'animate-spin' : ''].join(' ')} />
            Refresh
          </button>
        </div>

        {/* Loading state */}
        {status === 'loading' && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#0B4EA2]" />
          </div>
        )}

        {/* Failed state */}
        {status === 'failed' && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle className="mb-3 h-8 w-8 text-rose-400" />
            <p className="text-sm font-semibold text-slate-700">Failed to load optional reservations</p>
            <button type="button" onClick={() => load(filters)} className="mt-4 rounded-xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Retry</button>
          </div>
        )}

        {/* Table */}
        {status === 'succeeded' && (
          <>
            {list.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-sm font-semibold text-slate-400">No optional reservations found</p>
                <p className="mt-1 text-xs text-slate-400">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['Option #', 'Guest', 'Phone', 'Check-in', 'Check-out', 'Room', 'Status', 'Expires At', 'Expiry', ''].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {list.map((item) => (
                      <tr key={item.id} className="group transition-colors hover:bg-blue-50/40">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            {item.needsAttention && (
                              <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" title="Needs attention" />
                            )}
                            <span className="font-mono text-[12px] font-semibold text-[#0B4EA2]">{item.optionNumber}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-sm font-semibold text-slate-800">{item.guestDisplayName || item.guestName}</div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-600">{item.phone || '—'}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-700">{formatDate(item.checkInDate)}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-700">{formatDate(item.checkOutDate)}</td>
                        <td className="px-5 py-3.5 text-xs text-slate-600">
                          {(() => {
                            let summary = item.roomSummary || '—'
                            roomTypes.forEach((rt) => {
                              if (summary.includes(rt.id)) {
                                summary = summary.replaceAll(rt.id, rt.name)
                              }
                            })
                            return summary
                          })()}
                        </td>
                        <td className="px-5 py-3.5"><StatusBadge status={item.status} /></td>
                        <td className="px-5 py-3.5 text-sm text-slate-700">{formatDate(item.expiresAt)}</td>
                        <td className="px-5 py-3.5"><ExpiryChip item={item} /></td>
                        <td className="px-5 py-3.5">
                          <button
                            type="button"
                            onClick={() => handleView(item.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 opacity-0 shadow-sm transition-all hover:border-[#0B4EA2] hover:text-[#0B4EA2] group-hover:opacity-100"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                <div className="text-sm text-slate-500">
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong> · {totalCount} total
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePageChange(p)}
                      className={[
                        'h-8 w-8 rounded-lg text-sm font-semibold transition-colors',
                        p === page ? 'bg-[#0B4EA2] text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50',
                      ].join(' ')}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Detail Modal ── */}
      <OptionalReservationDetailModal
        open={detailOpen}
        reservationId={selectedId}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}
