import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Eye, LogIn, MoreHorizontal } from 'lucide-react'
import { IoSearchSharp } from 'react-icons/io5'
import { useNavigate, useParams } from 'react-router-dom'

import type { PmsReservation } from '../../models/PmsReservation'
import type { GroupChildReservation, GroupReservationListItem } from '../../models/GroupReservation'
import { getGroupReservationById } from '../../shared/apis/GroupReservations'
import { getPmsReservations } from '../../shared/apis/PmsReservation'
import { routes } from '../../shared/lib/routes'
import { CancelReservationProcessPopup } from '../reservations/cancel/CancelReservationProcessPopup'
import { CheckOutProcessPopup, type CheckoutMode } from '../reservations/checkout/CheckOutProcessPopup'
import { CheckInProcessPopup } from '../reservations/pupops/CheckInProcessPopup'
import { ExtendStayPopup } from '../reservations/pupops/ExtendStayPopup'
import { MoveRoomPopup } from '../reservations/pupops/MoveRoomPopup'
import { ReservationDetailsPopup } from '../reservations/pupops/ReservationDetailsPopup'

type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

function getChildReservations(group: GroupReservationListItem | null): GroupChildReservation[] {
  if (!group) return []
  return group.childReservations || group.reservations || group.localReservations || []
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

function getCurrency(group: GroupReservationListItem | null) {
  return getChildReservations(group).find((child) => child.currency)?.currency || 'EUR'
}

function getReservationId(child: GroupChildReservation) {
  return child.reservationId || child.id || ''
}

function getLocalYYYYMMDD(d: Date = new Date()) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toDateOnly(value?: string | null) {
  return value ? value.slice(0, 10) : ''
}

function buildFallbackReservation(child: GroupChildReservation, group: GroupReservationListItem | null): PmsReservation | null {
  const id = getReservationId(child)
  if (!id) return null

  const totalAmount = Number(child.finalTotal ?? child.originalTotal ?? 0)
  const remainingAmount = Number(child.remainingBalance ?? totalAmount)

  return {
    id,
    guestName: child.guestName || '',
    roomNumber: child.roomTypeNames?.join(', ') || null,
    roomTypeName: child.roomTypeNames?.join(', ') || '-----',
    checkInDate: group?.arrivalDate || '',
    checkOutDate: group?.departureDate || '',
    status: group?.status || 'Confirmed',
    totalAmount,
    paidAmount: Math.max(0, totalAmount - remainingAmount),
    channelName: 'Group',
    bookingReference: child.bookingReference,
    remainingAmount,
    currency: child.currency || 'EUR',
    bookingSource: 'Group',
    sourceType: 'Group',
    reservationType: 'Group',
  }
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#F3F5FF] px-5 py-4">
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-2 text-[15px] font-semibold text-slate-800">{value}</div>
    </div>
  )
}

export function GroupReservationDetailsPage() {
  const navigate = useNavigate()
  const { groupReservationId } = useParams()
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [group, setGroup] = useState<GroupReservationListItem | null>(null)
  const [pmsRowsById, setPmsRowsById] = useState<Record<string, PmsReservation>>({})
  const [status, setStatus] = useState<LoadStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [openMenuForId, setOpenMenuForId] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsReservationId, setDetailsReservationId] = useState<string | null>(null)
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [checkInReservationId, setCheckInReservationId] = useState<string | null>(null)
  const [checkOutOpen, setCheckOutOpen] = useState(false)
  const [checkOutReservationId, setCheckOutReservationId] = useState<string | null>(null)
  const [checkOutMode, setCheckOutMode] = useState<CheckoutMode>('regular')
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReservationId, setCancelReservationId] = useState<string | null>(null)
  const [extendStayOpen, setExtendStayOpen] = useState(false)
  const [extendStayReservationId, setExtendStayReservationId] = useState<string | null>(null)
  const [moveRoomOpen, setMoveRoomOpen] = useState(false)
  const [moveRoomReservationId, setMoveRoomReservationId] = useState<string | null>(null)

  const loadDetails = () => {
    if (!groupReservationId) {
      setError('Missing group reservation id.')
      setStatus('error')
      return undefined
    }

    const controller = new AbortController()
    setStatus('loading')
    setError(null)

    getGroupReservationById(groupReservationId, controller.signal)
      .then(async (data) => {
        setGroup(data)
        const childIds = new Set(getChildReservations(data).map(getReservationId).filter(Boolean))
        const arrivalDate = toDateOnly(data.arrivalDate)
        const departureDate = toDateOnly(data.departureDate)

        if (arrivalDate && departureDate && childIds.size > 0) {
          const rows = await getPmsReservations({ startDate: arrivalDate, endDate: departureDate }, controller.signal)
          const nextRowsById: Record<string, PmsReservation> = {}
          rows.forEach((row) => {
            if (childIds.has(row.id)) {
              nextRowsById[row.id] = row
            }
          })
          setPmsRowsById(nextRowsById)
        } else {
          setPmsRowsById({})
        }

        setStatus('success')
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Could not load group reservation details.')
        setStatus('error')
      })

    return () => controller.abort()
  }

  useEffect(() => loadDetails(), [groupReservationId])

  useEffect(() => {
    if (!openMenuForId) return

    const onMouseDown = (event: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) setOpenMenuForId(null)
    }

    window.addEventListener('mousedown', onMouseDown)
    return () => window.removeEventListener('mousedown', onMouseDown)
  }, [openMenuForId])

  const children = getChildReservations(group)
  const currency = getCurrency(group)
  const today = getLocalYYYYMMDD()

  const checkOutReservation = useMemo(() => {
    if (!checkOutReservationId) return null
    const child = children.find((item) => getReservationId(item) === checkOutReservationId) || null
    return pmsRowsById[checkOutReservationId] || (child ? buildFallbackReservation(child, group) : null)
  }, [checkOutReservationId, children, group, pmsRowsById])

  const cancelReservation = useMemo(() => {
    if (!cancelReservationId) return null
    const child = children.find((item) => getReservationId(item) === cancelReservationId) || null
    return pmsRowsById[cancelReservationId] || (child ? buildFallbackReservation(child, group) : null)
  }, [cancelReservationId, children, group, pmsRowsById])

  const refreshGroupDetails = () => {
    loadDetails()
  }

  return (
    <div className="space-y-6">
      <ReservationDetailsPopup
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false)
          setDetailsReservationId(null)
        }}
        reservationId={detailsReservationId}
        onOpenExtendStay={(reservationId) => {
          setDetailsOpen(false)
          setDetailsReservationId(null)
          setExtendStayReservationId(reservationId)
          setExtendStayOpen(true)
        }}
        onPaymentSuccess={refreshGroupDetails}
      />

      <CheckInProcessPopup
        open={checkInOpen}
        onClose={() => {
          setCheckInOpen(false)
          setCheckInReservationId(null)
        }}
        reservationId={checkInReservationId}
        onSuccess={refreshGroupDetails}
      />

      <CheckOutProcessPopup
        open={checkOutOpen}
        onClose={() => {
          setCheckOutOpen(false)
          setCheckOutReservationId(null)
          setCheckOutMode('regular')
        }}
        reservation={checkOutReservation}
        mode={checkOutMode}
        onSuccess={refreshGroupDetails}
      />

      <CancelReservationProcessPopup
        open={cancelOpen}
        onClose={() => {
          setCancelOpen(false)
          setCancelReservationId(null)
        }}
        reservation={cancelReservation}
        onSuccess={refreshGroupDetails}
      />

      <ExtendStayPopup
        open={extendStayOpen}
        onClose={() => {
          setExtendStayOpen(false)
          setExtendStayReservationId(null)
        }}
        reservationId={extendStayReservationId}
        onSuccess={refreshGroupDetails}
      />

      <MoveRoomPopup
        open={moveRoomOpen}
        onClose={() => {
          setMoveRoomOpen(false)
          setMoveRoomReservationId(null)
        }}
        reservationId={moveRoomReservationId}
        onSuccess={refreshGroupDetails}
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => navigate(routes.groupReservations)}
              className="mb-4 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <h2 className="truncate text-xl font-semibold text-slate-900">{group?.groupName || 'Group Reservations Details'}</h2>
              <span
                className={[
                  'inline-flex max-w-full items-center rounded-full border px-3 py-1 text-[11px] font-semibold leading-none',
                  getStatusTagClass(group?.status),
                ].join(' ')}
              >
                {group?.status || '-----'}
              </span>
            </div>
            <div className="mt-1 text-sm font-medium text-slate-500">{group?.groupReference || '-----'}</div>
          </div>

          <div className="text-sm font-semibold text-slate-600">{children.length} reservations</div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          <Metric label="Arrival Date" value={formatDateForDisplay(group?.arrivalDate)} />
          <Metric label="Departure Date" value={formatDateForDisplay(group?.departureDate)} />
          <Metric label="Discount" value={`${Number(group?.groupDiscountPercentage ?? 0)}%`} />
          <Metric label="Discount Amount" value={formatMoney(group?.totalDiscountAmount, currency)} />
          <Metric label="Total" value={formatMoney(group?.totalAfterDiscount, currency)} />
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700 shadow-sm">{error}</div>
      ) : null}

      <div className="rounded-2xl bg-white shadow-sm">
        <div className="grid grid-cols-[1.35fr_1.2fr_1fr_1fr_1fr_1fr_.8fr] bg-[#EAF2FF] px-6 py-3 text-[12px] font-semibold text-slate-700">
          <div>Guest</div>
          <div>Room Type</div>
          <div>Original Total</div>
          <div>Discount</div>
          <div>Final Total</div>
          <div>Balance</div>
          <div className="text-center">Action</div>
        </div>

        <div className="min-h-[360px] flex flex-col">
          {status === 'loading' && !group ? (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0B4EA2]/20 border-t-[#0B4EA2]" />
              <p className="mt-3 text-sm font-medium text-slate-500">Loading group details...</p>
            </div>
          ) : children.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
              <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
                <IoSearchSharp className="h-6 w-6" />
              </div>
              <h3 className="text-[15px] font-semibold text-slate-700">No child reservations found</h3>
            </div>
          ) : (
            children.map((child, index) => {
              const reservationId = getReservationId(child)
              const reservation = pmsRowsById[reservationId] || buildFallbackReservation(child, group)
              const normalizedReservationStatus = normalizeStatus(reservation?.status)
              const isCancelledStatus = normalizedReservationStatus === 'cancelled' || normalizedReservationStatus === 'canceled'
              const isCheckInToday = reservation?.checkInDate?.startsWith(today) ?? false
              const canShowCheckIn =
                Boolean(reservationId) &&
                (isCheckInToday || normalizedReservationStatus === 'reserved') &&
                normalizedReservationStatus !== 'checkedin' &&
                normalizedReservationStatus !== 'checkedout' &&
                !isCancelledStatus
              const isCheckOutDue =
                normalizedReservationStatus === 'checkedin' &&
                Boolean(reservation?.checkOutDate) &&
                reservation?.checkOutDate.slice(0, 10) === today
              const isLateCheckOut =
                normalizedReservationStatus === 'checkedin' &&
                Boolean(reservation?.checkOutDate) &&
                reservation?.checkOutDate.slice(0, 10) < today
              const canCancelReservation = Boolean(reservationId) && !isCancelledStatus
              const canEarlyCheckOut = Boolean(reservationId) && normalizedReservationStatus === 'checkedin' && !isCheckOutDue && !isLateCheckOut
              const canMoveRoom = Boolean(reservationId) && !isCancelledStatus
              const canExtendStay = Boolean(reservationId) && !isCancelledStatus && normalizedReservationStatus !== 'checkedout'
              const hasMoreActions = canCancelReservation || canEarlyCheckOut || canMoveRoom || canExtendStay

              return (
                <div
                  key={reservationId || index}
                  className={[
                    'grid grid-cols-[1.35fr_1.2fr_1fr_1fr_1fr_1fr_.8fr] items-center px-6 py-3 text-[12px] text-slate-700',
                    index % 2 === 1 ? 'bg-[#F4F9FF]' : 'bg-white',
                  ].join(' ')}
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-slate-800">{child.guestName || '-----'}</div>
                    <div className="truncate text-[11px] text-slate-500" title={child.bookingReference || reservationId}>
                      {child.bookingReference || reservationId || '-----'}
                    </div>
                  </div>
                  <div className="truncate">{child.roomTypeNames?.join(', ') || '-----'}</div>
                  <div>{formatMoney(child.originalTotal, child.currency || currency)}</div>
                  <div>{formatMoney(child.groupDiscountAmount, child.currency || currency)}</div>
                  <div className="font-semibold text-slate-800">{formatMoney(child.finalTotal, child.currency || currency)}</div>
                  <div>{formatMoney(child.remainingBalance, child.currency || currency)}</div>
                  <div className="relative flex items-center justify-center gap-2">
                    {canShowCheckIn ? (
                      <button
                        type="button"
                        className="inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-md bg-emerald-700 px-3 text-[12px] font-semibold leading-none text-white"
                        onClick={() => {
                          setCheckInReservationId(reservationId)
                          setCheckInOpen(true)
                        }}
                      >
                        <LogIn className="h-4 w-4" />
                        check in
                      </button>
                    ) : (
                      <>
                        {isCheckOutDue || isLateCheckOut ? (
                          <button
                            type="button"
                            className="inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-md bg-rose-600 px-3 text-[12px] font-semibold leading-none text-white"
                            onClick={() => {
                              setCheckOutReservationId(reservationId)
                              setCheckOutMode(isLateCheckOut ? 'late' : 'regular')
                              setCheckOutOpen(true)
                            }}
                          >
                            {isLateCheckOut ? 'Late Check-out' : 'check out'}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={!reservationId}
                          onClick={() => {
                            setDetailsReservationId(reservationId)
                            setDetailsOpen(true)
                          }}
                          className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md bg-[#0B4EA2] px-3 text-[12px] font-semibold leading-none text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                          aria-label="View reservation details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    {hasMoreActions ? (
                      <button
                        type="button"
                        className="grid h-9 w-9 place-items-center rounded-md text-slate-600 hover:bg-slate-100"
                        aria-label="More"
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={() => setOpenMenuForId((prev) => (prev === reservationId ? null : reservationId))}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    ) : null}

                    {hasMoreActions && openMenuForId === reservationId ? (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-11 z-10 w-48 rounded-xl border border-slate-200 bg-white shadow-lg"
                      >
                        {canCancelReservation ? (
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                            onClick={() => {
                              setOpenMenuForId(null)
                              setCancelReservationId(reservationId)
                              setCancelOpen(true)
                            }}
                          >
                            cancel Reservation
                          </button>
                        ) : null}
                        {canEarlyCheckOut ? (
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                            onClick={() => {
                              setOpenMenuForId(null)
                              setCheckOutReservationId(reservationId)
                              setCheckOutMode('early')
                              setCheckOutOpen(true)
                            }}
                          >
                            Early Check out
                          </button>
                        ) : null}
                        {canMoveRoom ? (
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                            onClick={() => {
                              setOpenMenuForId(null)
                              setMoveRoomReservationId(reservationId)
                              setMoveRoomOpen(true)
                            }}
                          >
                            Move Room
                          </button>
                        ) : null}
                        {canExtendStay ? (
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                            onClick={() => {
                              setOpenMenuForId(null)
                              setExtendStayReservationId(reservationId)
                              setExtendStayOpen(true)
                            }}
                          >
                            Extend Stay
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
