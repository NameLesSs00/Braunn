import { useEffect, useRef, useState } from 'react'
import { Loader2, X, Clock, AlertTriangle, Pencil, Trash2, CalendarClock, ChevronDown, ChevronUp } from 'lucide-react'
import { Modal } from '../../../shared/ui/Modal'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import {
  fetchOptionalReservationDetail,
  deleteOptionalReservation,
  extendOptionalReservationExpiry,
  clearDetail,
  clearActionStatus,
} from '../../../features/reservations/optionalReservationsSlice'
import { updateDraft } from '../../../features/reservations/draftSlice'
import { fetchRoomTypes } from '../../../features/roomTypes/roomTypesSlice'
import { useNewReservationModal } from '../../../widgets/layout/DashboardLayout/NewReservationModalContext'
import type { OptionalReservationDetail } from '../../../models/OptionalReservation'

type Props = {
  open: boolean
  reservationId: string | null
  onClose: () => void
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' })
}

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('en-GB', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function StatusBadge({ status }: { status: string | number }) {
  const s = String(status || '').toLowerCase()
  const cls =
    s === 'draft' ? 'bg-blue-50 text-blue-700 border-blue-200' :
    s === 'expired' ? 'bg-rose-50 text-rose-700 border-rose-200' :
    s === 'cancelled' || s === 'canceled' ? 'bg-slate-100 text-slate-600 border-slate-200' :
    s === 'converted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
    'bg-amber-50 text-amber-700 border-amber-200'
  return <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${cls}`}>{String(status)}</span>
}

function ExpiryBadge({ detail }: { detail: OptionalReservationDetail }) {
  if (detail.isExpired) return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-3 py-0.5 text-xs font-semibold text-rose-700"><AlertTriangle className="h-3 w-3" /> Expired</span>
  if (detail.expiresToday) return <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-3 py-0.5 text-xs font-semibold text-orange-700"><Clock className="h-3 w-3" /> Expires Today</span>
  if (detail.isExpiringSoon) return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-0.5 text-xs font-semibold text-amber-700"><Clock className="h-3 w-3" /> Expiring Soon</span>
  return null
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className="w-40 shrink-0 text-xs font-medium text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value || '—'}</span>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5">
      <h4 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">{title}</h4>
      {children}
    </div>
  )
}

type PanelMode = 'view' | 'edit' | 'delete' | 'extend'

export function OptionalReservationDetailModal({ open, reservationId, onClose }: Props) {
  const dispatch = useAppDispatch()
  const { selectedDetail, detailStatus, actionStatus, actionError } = useAppSelector((s) => s.optionalReservations)
  const roomTypes = useAppSelector((s) => s.roomTypes.items)
  const { openNewReservation } = useNewReservationModal()

  const [mode, setMode] = useState<PanelMode>('view')
  const [deleteReason, setDeleteReason] = useState('')
  const [extendDate, setExtendDate] = useState('')
  const [extendReason, setExtendReason] = useState('')
  const [warningsOpen, setWarningsOpen] = useState(true)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (roomTypes.length === 0) dispatch(fetchRoomTypes())
  }, [dispatch, roomTypes.length])

  useEffect(() => {
    if (!open || !reservationId) return
    setMode('view')
    setDeleteReason('')
    setExtendDate('')
    setExtendReason('')
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    dispatch(fetchOptionalReservationDetail(reservationId))
    return () => { abortRef.current?.abort() }
  }, [open, reservationId, dispatch])

  const handleEditClick = async () => {
    if (!reservationId) return
    
    // Fetch latest data via ID before editing to guarantee it's fresh
    const d = await dispatch(fetchOptionalReservationDetail(reservationId)).unwrap()
    
    // Populate draft with existing optional reservation data
    dispatch(updateDraft({
      firstName: d.guest?.firstName || '',
      surName: d.guest?.lastName || '',
      email: d.guest?.email || '',
      phone: d.guest?.phone || '',
      nationality: d.guest?.countryCode || '',
      idNumber: d.guest?.nationalId || '',
      addressLine: d.guest?.address || '',
      checkInDate: d.checkInDate?.split(/T| /)[0] || '',
      checkOutDate: d.checkOutDate?.split(/T| /)[0] || '',
      bookingSource: d.bookingSource || 'WalkIn',
      currency: d.currency || 'USD',
      isVip: d.reservationType?.toUpperCase() === 'VIP',
      paymentMethod: d.paymentMethod || '',
      specialRequests: d.specialRequests || '',
      notes: d.comments || '',
      rooms: (d.roomRequests || []).length > 0 
        ? d.roomRequests.map((r, i) => ({
            id: Date.now() + i,
            roomTypeId: r.roomTypeId,
            roomType: roomTypes.find(t => t.id === r.roomTypeId)?.name || r.roomTypeId,
            roomCount: r.roomQuantity || 1,
          }))
        : [{ id: Date.now(), roomTypeId: '', roomType: '', roomCount: 1 }],
      adultCount: d.roomRequests?.[0]?.adults || 1,
      childCount: d.roomRequests?.[0]?.children || 0,
      childAges: d.roomRequests?.[0]?.childAges || [],
      rateCode: d.roomRequests?.[0]?.ratePlanCode || 'BAR',
      mealPlans: (d.selectedMealPlans || []).map((m, i) => {
        let endDateStr = d.checkOutDate?.split(/T| /)[0] || ''
        if (m.serviceDateStart && typeof m.numberOfDays === 'number') {
          const startDate = new Date(m.serviceDateStart)
          if (!isNaN(startDate.getTime())) {
            startDate.setDate(startDate.getDate() + m.numberOfDays)
            endDateStr = startDate.toISOString().split('T')[0]
          }
        }
        return {
          id: Date.now() + i,
          mealPlanId: m.mealPlanId,
          serviceDateStart: m.serviceDateStart?.split(/T| /)[0] || '',
          serviceDateEnd: endDateStr,
          price: m.price || 0,
        }
      }),
      isOptionalReservation: true,
      expiresAt: d.expiresAt?.replace(' ', 'T').slice(0, 16) || '',
      editingOptionalReservationId: d.id,
      editingOptionalReservationVersion: d.version,
    }))
    handleClose()
    openNewReservation({ skipReset: true })
  }

  const handleConvertClick = async () => {
    if (!reservationId) return
    
    // Fetch latest data via ID before converting to guarantee it's fresh
    const d = await dispatch(fetchOptionalReservationDetail(reservationId)).unwrap()
    
    // Populate draft with existing optional reservation data
    dispatch(updateDraft({
      firstName: d.guest?.firstName || '',
      surName: d.guest?.lastName || '',
      email: d.guest?.email || '',
      phone: d.guest?.phone || '',
      nationality: d.guest?.countryCode || '',
      idNumber: d.guest?.nationalId || '',
      addressLine: d.guest?.address || '',
      checkInDate: d.checkInDate?.split(/T| /)[0] || '',
      checkOutDate: d.checkOutDate?.split(/T| /)[0] || '',
      bookingSource: d.bookingSource || 'WalkIn',
      currency: d.currency || 'USD',
      isVip: d.reservationType?.toUpperCase() === 'VIP',
      paymentMethod: d.paymentMethod || '',
      specialRequests: d.specialRequests || '',
      notes: d.comments || '',
      rooms: (d.roomRequests || []).length > 0 
        ? d.roomRequests.map((r, i) => ({
            id: Date.now() + i,
            roomTypeId: r.roomTypeId,
            roomType: roomTypes.find(t => t.id === r.roomTypeId)?.name || r.roomTypeId,
            roomCount: r.roomQuantity || 1,
            pricePerNight: r.pricePerNight || 0,
          }))
        : [{ id: Date.now(), roomTypeId: '', roomType: '', roomCount: 1, pricePerNight: 0 }],
      adultCount: d.roomRequests?.[0]?.adults || 1,
      childCount: d.roomRequests?.[0]?.children || 0,
      childAges: d.roomRequests?.[0]?.childAges || [],
      rateCode: d.roomRequests?.[0]?.ratePlanCode || 'BAR',
      mealPlans: (d.selectedMealPlans || []).map((m, i) => {
        let endDateStr = d.checkOutDate?.split(/T| /)[0] || ''
        if (m.serviceDateStart && typeof m.numberOfDays === 'number') {
          const startDate = new Date(m.serviceDateStart)
          if (!isNaN(startDate.getTime())) {
            startDate.setDate(startDate.getDate() + m.numberOfDays)
            endDateStr = startDate.toISOString().split('T')[0]
          }
        }
        return {
          id: Date.now() + i,
          mealPlanId: m.mealPlanId,
          serviceDateStart: m.serviceDateStart?.split(/T| /)[0] || '',
          serviceDateEnd: endDateStr,
          price: m.price || 0,
        }
      }),
      isOptionalReservation: false,
      convertingOptionalReservationId: d.id,
      convertingOptionalReservationVersion: d.version,
    }))
    handleClose()
    openNewReservation({ skipReset: true })
  }

  const handleClose = () => {
    dispatch(clearDetail())
    dispatch(clearActionStatus())
    onClose()
  }

  const handleDelete = async () => {
    if (!reservationId || !deleteReason.trim()) return
    await dispatch(deleteOptionalReservation({ id: reservationId, body: { reason: deleteReason } })).unwrap()
    handleClose()
  }

  const handleExtend = async () => {
    if (!reservationId || !extendDate) return
    await dispatch(extendOptionalReservationExpiry({
      id: reservationId,
      data: { newExpiresAt: new Date(extendDate).toISOString(), reason: extendReason, expectedVersion: selectedDetail!.version },
    })).unwrap()
    setMode('view')
    dispatch(clearActionStatus())
  }

  const isActing = actionStatus === 'loading'
  const d = selectedDetail

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="flex h-[calc(100vh-2rem)] w-[90vw] max-w-4xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl">
        {/* ── Header ── */}
        <div className="flex shrink-0 items-center justify-between bg-[#0B4EA2] px-8 py-5">
          <div>
            <div className="text-xs font-medium text-blue-200">Optional Reservation</div>
            <div className="text-lg font-bold text-white">{d?.optionNumber ?? '—'}</div>
          </div>
          <div className="flex items-center gap-3">
            {d && <StatusBadge status={d.status} />}
            {d && <ExpiryBadge detail={d} />}
            <button type="button" onClick={handleClose} className="grid h-9 w-9 place-items-center rounded-full text-white/80 hover:bg-white/15">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {detailStatus === 'loading' && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#0B4EA2]" />
            </div>
          )}

          {detailStatus === 'failed' && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
              Failed to load reservation details. Please try again.
            </div>
          )}

          {detailStatus === 'succeeded' && d && mode === 'view' && (
            <div className="space-y-4">
              {/* Warnings */}
              {d.warnings && d.warnings.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-5 py-3 text-left"
                    onClick={() => setWarningsOpen((p) => !p)}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                      <AlertTriangle className="h-4 w-4" /> {d.warnings.length} Notice{d.warnings.length > 1 ? 's' : ''}
                    </span>
                    {warningsOpen ? <ChevronUp className="h-4 w-4 text-amber-600" /> : <ChevronDown className="h-4 w-4 text-amber-600" />}
                  </button>
                  {warningsOpen && (
                    <ul className="border-t border-amber-200 px-5 py-3 space-y-1">
                      {d.warnings.map((w, i) => (
                        <li key={i} className="text-xs text-amber-700">• {w}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Guest */}
                <SectionCard title="Guest Information">
                  <InfoRow label="Full Name" value={d.guest?.fullName} />
                  <InfoRow label="Email" value={d.guest?.email} />
                  <InfoRow label="Phone" value={d.guest?.phone} />
                  <InfoRow label="National ID" value={d.guest?.nationalId} />
                  <InfoRow label="Address" value={d.guest?.address} />
                  <InfoRow label="Country Code" value={d.guest?.countryCode} />
                </SectionCard>

                {/* Stay */}
                <SectionCard title="Stay Details">
                  <InfoRow label="Check-in" value={formatDate(d.checkInDate)} />
                  <InfoRow label="Check-out" value={formatDate(d.checkOutDate)} />
                  <InfoRow label="Booking Source" value={String(d.bookingSource)} />
                  <InfoRow label="Reservation Type" value={d.reservationType} />
                  <InfoRow label="Currency" value={d.currency} />
                  <InfoRow label="Payment Method" value={d.paymentMethod} />
                  <InfoRow label="Expires At" value={formatDateTime(d.expiresAt)} />
                  <InfoRow label="Days Until Expiry" value={d.daysUntilExpiry} />
                </SectionCard>
              </div>

              {/* Room Requests */}
              {d.roomRequests?.length > 0 && (
                <SectionCard title="Room Requests">
                  <div className="overflow-hidden rounded-xl border border-slate-100">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          {['Room Type', 'Qty', 'Adults', 'Children', 'Rate Plan', 'Price/Night'].map((h) => (
                            <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-slate-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {d.roomRequests.map((r, i) => (
                          <tr key={i} className="border-t border-slate-100">
                            <td className="px-4 py-2 text-sm text-slate-800 font-medium">
                              {roomTypes.find((t) => t.id === r.roomTypeId)?.name || r.roomTypeId}
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-800">{r.roomQuantity}</td>
                            <td className="px-4 py-2 text-sm text-slate-800">{r.adults}</td>
                            <td className="px-4 py-2 text-sm text-slate-800">{r.children}</td>
                            <td className="px-4 py-2 text-sm text-slate-800">{r.ratePlanCode}</td>
                            <td className="px-4 py-2 text-sm font-semibold text-slate-800">{r.pricePerNight}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>
              )}

              {/* Companions */}
              {d.companions?.length > 0 && (
                <SectionCard title="Companions">
                  <div className="overflow-hidden rounded-xl border border-slate-100">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          {['Name', 'Phone', 'Email', 'National ID'].map((h) => (
                            <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-slate-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {d.companions.map((c, i) => (
                          <tr key={i} className="border-t border-slate-100">
                            <td className="px-4 py-2 text-sm text-slate-800">{c.firstName} {c.lastName}</td>
                            <td className="px-4 py-2 text-sm text-slate-800">{c.phoneNumber || '—'}</td>
                            <td className="px-4 py-2 text-sm text-slate-800">{c.email || '—'}</td>
                            <td className="px-4 py-2 text-sm text-slate-800">{c.nationalId || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>
              )}

              {/* Special Requests */}
              {d.specialRequests && d.specialRequests !== '-' && (
                <SectionCard title="Special Requests">
                  <p className="text-sm text-slate-700">{d.specialRequests}</p>
                </SectionCard>
              )}

              {/* Meta */}
              <SectionCard title="Record Info">
                <InfoRow label="Created At" value={formatDateTime(d.createdAtUtc)} />
                <InfoRow label="Created By" value={d.createdByName} />
                <InfoRow label="Updated At" value={formatDateTime(d.updatedAtUtc)} />
                <InfoRow label="Version" value={d.version} />
              </SectionCard>
            </div>
          )}



          {/* ── Delete Mode ── */}
          {detailStatus === 'succeeded' && d && mode === 'delete' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <Trash2 className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-800">Cancel / Delete Reservation</h3>
              <p className="mb-6 max-w-sm text-sm text-slate-500">This action cannot be undone. Please provide a reason for deleting <strong>{d.optionNumber}</strong>.</p>
              <div className="w-full max-w-md">
                <textarea
                  rows={4}
                  placeholder="Enter reason…"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                />
              </div>
              {actionError && <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</div>}
            </div>
          )}

          {/* ── Extend Expiry Mode ── */}
          {detailStatus === 'succeeded' && d && mode === 'extend' && (
            <div className="mx-auto max-w-lg py-8 text-center">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <CalendarClock className="h-7 w-7" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-slate-800">Extend Expiry</h3>
              <p className="mb-6 text-sm text-slate-500">
                Current expiry: <strong>{formatDateTime(d.expiresAt)}</strong>. Set a new expiry date and optionally provide a reason.
              </p>
              <div className="space-y-4 text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">New Expiry Date & Time *</label>
                  <input
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    max={d.checkInDate ? d.checkInDate.slice(0, 16) : undefined}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                    value={extendDate}
                    onChange={(e) => setExtendDate(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Reason (optional)</label>
                  <textarea
                    rows={3}
                    placeholder="kida"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                    value={extendReason}
                    onChange={(e) => setExtendReason(e.target.value)}
                  />
                </div>
              </div>
              {actionError && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{actionError}</div>}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {detailStatus === 'succeeded' && d && (
          <div className="shrink-0 border-t border-slate-200 bg-white px-8 py-5">
            {mode === 'view' && (
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">Version {d.version} · Created {formatDate(d.createdAtUtc)}</div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setMode('extend')} className="flex items-center gap-2 h-10 rounded-xl border border-amber-300 bg-amber-50 px-5 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors">
                    <CalendarClock className="h-4 w-4" /> Extend Expiry
                  </button>
                  <button type="button" onClick={handleEditClick} className="flex items-center gap-2 h-10 rounded-xl border border-[#0B4EA2] bg-blue-50 px-5 text-sm font-semibold text-[#0B4EA2] hover:bg-blue-100 transition-colors">
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button type="button" onClick={handleConvertClick} className="flex items-center gap-2 h-10 rounded-xl border border-emerald-300 bg-emerald-50 px-5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors">
                    <CalendarClock className="h-4 w-4" /> Create Reservation
                  </button>
                  <button type="button" onClick={() => setMode('delete')} className="flex items-center gap-2 h-10 rounded-xl border border-rose-300 bg-rose-50 px-5 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition-colors">
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            )}



            {mode === 'delete' && (
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => { setMode('view'); dispatch(clearActionStatus()) }} disabled={isActing} className="h-10 rounded-xl border border-slate-200 px-6 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                <button type="button" onClick={handleDelete} disabled={isActing || !deleteReason.trim()} className="flex items-center gap-2 h-10 rounded-xl bg-rose-600 px-8 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50">
                  {isActing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {isActing ? 'Deleting…' : 'Confirm Delete'}
                </button>
              </div>
            )}

            {mode === 'extend' && (
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => { setMode('view'); dispatch(clearActionStatus()) }} disabled={isActing} className="h-10 rounded-xl border border-slate-200 px-6 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                <button type="button" onClick={handleExtend} disabled={isActing || !extendDate} className="flex items-center gap-2 h-10 rounded-xl bg-amber-500 px-8 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50">
                  {isActing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
                  {isActing ? 'Saving…' : 'Extend Expiry'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
