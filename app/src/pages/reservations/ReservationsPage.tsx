import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Building2, CalendarClock, ChevronLeft, ChevronRight, Download, Eye, Globe, LogIn, MoreHorizontal, User, Users } from 'lucide-react'
import { IoSearchSharp } from "react-icons/io5";

import { IconImage } from '../../shared/ui/IconImage'
import { useAppDispatch, useAppSelector } from '../../shared/apis/hooks'
import { getPmsReservations } from '../../shared/apis/PmsReservation'
import { fetchReservationsTable } from '../../features/pms/pmsSlice'
import type { PmsReservation } from '../../models/PmsReservation'
import { ReservationDetailsPopup } from './pupops/ReservationDetailsPopup'
import { ExtendStayPopup } from './pupops/ExtendStayPopup'
import { CheckInProcessPopup } from './pupops/CheckInProcessPopup'
import { CheckOutProcessPopup, type CheckoutMode } from './checkout/CheckOutProcessPopup'
import { CancelReservationProcessPopup } from './cancel/CancelReservationProcessPopup'
import { OtaReservationModal } from '../../widgets/reservations/OtaReservationModal/OtaReservationModal'
import { MoveRoomPopup } from './pupops/MoveRoomPopup'
import { ExportInHouseListPopup } from '../inHouseList/ExportInHouseListPopup'
import { GroupReservationsPage } from '../groupReservations/GroupReservationsPage'
import { OptionalReservationsTab } from './optionalReservations/OptionalReservationsTab'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const getLocalYYYYMMDD = (d: Date = new Date()) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const today = getLocalYYYYMMDD()
const lastDayOfMonth = getLocalYYYYMMDD(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0))

interface ReservationsFilters {
  query: string
  statusFilter: string
  bookingSourceFilter: string
  roomTypeFilter: string
  paymentStatusFilter: string
  checkInFrom: string
  checkInTo: string
}

let reservationsFiltersCache: ReservationsFilters | null = null

const bookingSourceOptions = [
  'CorporateAccount',
  'GroupContract',
  'Phone',
  'Email',
  'WalkIn',
  'Direct',
  'Group',
] as const

type BookingSourceOption = typeof bookingSourceOptions[number]
type ReservationsTabId = 'normal' | 'group' | 'corporate' | 'ota' | 'optional'

const reservationTabs: Array<{ id: ReservationsTabId; label: string; Icon: typeof User }> = [
  { id: 'normal', label: 'Normal Reservations', Icon: User },
  { id: 'group', label: 'Group Reservations', Icon: Users },
  { id: 'corporate', label: 'Corporate Reservations', Icon: Building2 },
  { id: 'ota', label: 'OTA Reservations', Icon: Globe },
  { id: 'optional', label: 'Optional Reservations', Icon: CalendarClock },
]

function normalizeReservationsTab(value: string | null): ReservationsTabId {
  if (value === 'group' || value === 'corporate' || value === 'ota' || value === 'optional') return value
  return 'normal'
}

function ReservationsTabs({ activeTab, onTabChange }: { activeTab: ReservationsTabId; onTabChange: (tab: ReservationsTabId) => void }) {
  return (
    <div className="flex w-full items-center justify-between overflow-x-auto rounded-t-xl border-b border-slate-200 bg-slate-50/50">
      {reservationTabs.map((tab) => {
        const isActive = activeTab === tab.id
        const Icon = tab.Icon

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={[
              'relative flex flex-1 items-center justify-center gap-2 whitespace-nowrap border-b-[3px] px-4 py-3.5 text-[14px] font-semibold transition-colors',
              isActive
                ? 'border-[#0B4EA2] bg-white text-[#0B4EA2] shadow-sm'
                : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700',
            ].join(' ')}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

function formatDateForDisplay(isoDate: string): string {
  if (!isoDate) return '—'
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function normalizeStatus(value?: string | null) {
  return (value || '').replace(/[\s_-]/g, '').toLowerCase()
}

function normalizeBookingSource(value?: string | null) {
  return (value || '').replace(/[\s_-]/g, '').toLowerCase()
}

function isCorporateReservation(reservation: PmsReservation) {
  if (reservation.corporateAccountId) return true
  return [
    reservation.bookingSource,
    reservation.sourceType,
    reservation.channelName,
    reservation.reservationType,
  ].map(normalizeBookingSource).some((value) => value === 'corporate' || value === 'corporateaccount')
}

function isOtaReservation(reservation: PmsReservation) {
  return [
    reservation.bookingSource,
    reservation.sourceType,
    reservation.channelName,
    reservation.reservationType,
  ].map(normalizeBookingSource).some((value) => value === 'ota' || value === 'onlinetravelagency')
}

function isGroupSourceReservation(reservation: PmsReservation) {
  return [
    reservation.bookingSource,
    reservation.sourceType,
    reservation.channelName,
    reservation.reservationType,
  ].map(normalizeBookingSource).some((value) => value === 'group' || value === 'groupcontract')
}

function matchesReservationsTab(reservation: PmsReservation, tab: ReservationsTabId) {
  if (tab === 'corporate') return isCorporateReservation(reservation)
  if (tab === 'ota') return isOtaReservation(reservation)
  if (tab === 'normal') return !isCorporateReservation(reservation) && !isOtaReservation(reservation) && !isGroupSourceReservation(reservation)
  return true
}

function getReservationBookingSource(reservation: PmsReservation): BookingSourceOption | '' {
  const normalizedValues = [
    reservation.bookingSource,
    reservation.sourceType,
    reservation.channelName,
  ].map(normalizeBookingSource)

  return bookingSourceOptions.find((source) => normalizedValues.includes(normalizeBookingSource(source))) || ''
}

function getReservationSourceLabel(reservation: PmsReservation) {
  return getReservationBookingSource(reservation) || reservation.channelName || reservation.bookingSource || '-----'
}

function getStatusTagClass(status?: string | null) {
  switch (normalizeStatus(status)) {
    case 'reserved':
      return 'border-sky-200 bg-sky-50 text-sky-700'
    case 'confirmed':
      return 'border-indigo-200 bg-indigo-50 text-indigo-700'
    case 'checkedin':
    case 'inhouse':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'checkedout':
      return 'border-slate-200 bg-slate-100 text-slate-600'
    case 'cancelled':
    case 'canceled':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    case 'noshow':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'pending':
      return 'border-orange-200 bg-orange-50 text-orange-700'
    default:
      return 'border-slate-200 bg-white text-slate-600'
  }
}

function getBookingSourceTagClass(source?: string | null) {
  switch (normalizeBookingSource(source)) {
    case 'corporateaccount':
      return 'border-violet-200 bg-violet-50 text-violet-700'
    case 'groupcontract':
      return 'border-cyan-200 bg-cyan-50 text-cyan-700'
    case 'phone':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'email':
      return 'border-sky-200 bg-sky-50 text-sky-700'
    case 'walkin':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'direct':
      return 'border-blue-200 bg-blue-50 text-blue-700'
    case 'group':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600'
  }
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

export function ReservationsPage() {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = normalizeReservationsTab(searchParams.get('tab'))
  const pmsReservations = useAppSelector((s) => s.pms.reservationsTableRows)
  const reservationsLoading = useAppSelector((s) => s.pms.reservationsTableStatus === 'loading')
  const initialFilters = useMemo<ReservationsFilters>(() => ({
    query: '',
    statusFilter: '',
    bookingSourceFilter: 'all',
    roomTypeFilter: 'all',
    paymentStatusFilter: 'all',
    checkInFrom: today,
    checkInTo: lastDayOfMonth,
    ...reservationsFiltersCache,
  }), [])

  const [checkInFrom, setCheckInFrom] = useState(initialFilters.checkInFrom)
  const [checkInTo, setCheckInTo] = useState(initialFilters.checkInTo)

  useEffect(() => {
    if (activeTab === 'group' || activeTab === 'optional') return
    const request = dispatch(fetchReservationsTable({ startDate: checkInFrom, endDate: checkInTo }))
    return () => request.abort()
  }, [activeTab, dispatch, checkInFrom, checkInTo])

  useEffect(() => {
    if (activeTab === 'group' || activeTab === 'optional') return

    const onReservationsRefresh = () => {
      void dispatch(fetchReservationsTable({ startDate: checkInFrom, endDate: checkInTo }))
    }

    window.addEventListener('braun:reservations-refresh', onReservationsRefresh)
    return () => window.removeEventListener('braun:reservations-refresh', onReservationsRefresh)
  }, [activeTab, dispatch, checkInFrom, checkInTo])

  const [query, setQuery] = useState(initialFilters.query)
  const [openMenuForId, setOpenMenuForId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

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

  const [statusFilter, setStatusFilter] = useState<string>(initialFilters.statusFilter)
  const [bookingSourceFilter, setBookingSourceFilter] = useState(initialFilters.bookingSourceFilter)
  const [roomTypeFilter, setRoomTypeFilter] = useState(initialFilters.roomTypeFilter)
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(initialFilters.paymentStatusFilter)

  const [otaOpen, setOtaOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [page, setPage] = useState(1)
  const perPage = 15

  const onTabChange = (tab: ReservationsTabId) => {
    const nextParams = new URLSearchParams(searchParams)
    if (tab === 'normal') {
      nextParams.delete('tab')
    } else {
      nextParams.set('tab', tab)
    }
    setSearchParams(nextParams)
    setOpenMenuForId(null)
    setPage(1)
  }

  const activeTabLabel = reservationTabs.find((tab) => tab.id === activeTab)?.label || 'Reservations'
  const searchPlaceholder =
    activeTab === 'corporate'
      ? 'Search corporate reservations by Guest Name ,ID...'
      : activeTab === 'ota'
        ? 'Search OTA reservations by Guest Name ,ID...'
        : 'Search by Guest Name ,ID...'

  useEffect(() => {
    reservationsFiltersCache = {
      query,
      statusFilter,
      bookingSourceFilter,
      roomTypeFilter,
      paymentStatusFilter,
      checkInFrom,
      checkInTo,
    }
  }, [query, statusFilter, bookingSourceFilter, roomTypeFilter, paymentStatusFilter, checkInFrom, checkInTo])

  useEffect(() => {
    if (!openMenuForId) return

    const onMouseDown = (e: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setOpenMenuForId(null)
    }

    window.addEventListener('mousedown', onMouseDown)
    return () => window.removeEventListener('mousedown', onMouseDown)
  }, [openMenuForId])

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    let result = pmsReservations.filter((reservation) => matchesReservationsTab(reservation, activeTab === 'optional' ? 'normal' : activeTab))

    if (q) {
      result = result.filter((r) => [r.guestName, r.bookingReference, r.id, r.roomTypeName, getReservationSourceLabel(r)].some((v) => (v ?? '').toLowerCase().includes(q)))
    }

    if (statusFilter !== '') {
      result = result.filter((r) => r.status === statusFilter)
    }

    if (activeTab === 'normal' && bookingSourceFilter !== 'all') {
      result = result.filter((r) => getReservationBookingSource(r) === bookingSourceFilter)
    }

    if (roomTypeFilter !== 'all') {
      result = result.filter((r) => r.roomTypeName?.toLowerCase().includes(roomTypeFilter.toLowerCase()))
    }

    if (paymentStatusFilter !== 'all') {
      if (paymentStatusFilter === 'Fully paid') {
        result = result.filter((r) => r.paidAmount >= r.totalAmount)
      } else if (paymentStatusFilter === 'deposit paid') {
        result = result.filter((r) => r.paidAmount > 0 && r.paidAmount < r.totalAmount)
      }
    }

    return result
  }, [activeTab, pmsReservations, query, statusFilter, bookingSourceFilter, roomTypeFilter, paymentStatusFilter])

  useEffect(() => {
    setPage(1)
  }, [activeTab, query, statusFilter, bookingSourceFilter, roomTypeFilter, paymentStatusFilter, checkInFrom, checkInTo])

  const pages = Math.max(1, Math.ceil(filteredRows.length / perPage))
  const safePage = Math.min(page, pages)

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * perPage
    return filteredRows.slice(start, start + perPage)
  }, [filteredRows, safePage])

  const checkOutReservation = useMemo(() => {
    if (!checkOutReservationId) return null
    return pmsReservations.find((r) => r.id === checkOutReservationId) || null
  }, [checkOutReservationId, pmsReservations])

  const cancelReservation = useMemo(() => {
    if (!cancelReservationId) return null
    return pmsReservations.find((r) => r.id === cancelReservationId) || null
  }, [cancelReservationId, pmsReservations])

  const closeDetails = () => {
    setDetailsOpen(false)
    setDetailsReservationId(null)
  }

  const closeExtendStay = () => {
    setExtendStayOpen(false)
    setExtendStayReservationId(null)
  }

  const onOpenExtendStay = (reservationId: string) => {
    closeDetails()
    setExtendStayReservationId(reservationId)
    setExtendStayOpen(true)
  }

  const onOpenCheckIn = (reservationId: string) => {
    setCheckInReservationId(reservationId)
    setCheckInOpen(true)
  }

  const refreshReservations = () => {
    void dispatch(fetchReservationsTable({ startDate: checkInFrom, endDate: checkInTo }))
  }

  const exportReservations = async (from: string, to: string) => {
    let exportRows = (await getPmsReservations({ startDate: from, endDate: to }))
      .filter((reservation) => matchesReservationsTab(reservation, activeTab))
    const normalizedQuery = query.trim().toLowerCase()

    if (normalizedQuery) {
      exportRows = exportRows.filter((reservation) =>
        [reservation.guestName, reservation.bookingReference, reservation.id, reservation.roomTypeName, getReservationSourceLabel(reservation)]
          .some((value) => (value ?? '').toLowerCase().includes(normalizedQuery))
      )
    }
    if (statusFilter) {
      exportRows = exportRows.filter((reservation) => reservation.status === statusFilter)
    }
    if (activeTab === 'normal' && bookingSourceFilter !== 'all') {
      exportRows = exportRows.filter((reservation) => getReservationBookingSource(reservation) === bookingSourceFilter)
    }
    if (roomTypeFilter !== 'all') {
      exportRows = exportRows.filter((reservation) =>
        reservation.roomTypeName?.toLowerCase().includes(roomTypeFilter.toLowerCase())
      )
    }
    if (paymentStatusFilter === 'Fully paid') {
      exportRows = exportRows.filter((reservation) => reservation.paidAmount >= reservation.totalAmount)
    } else if (paymentStatusFilter === 'deposit paid') {
      exportRows = exportRows.filter((reservation) =>
        reservation.paidAmount > 0 && reservation.paidAmount < reservation.totalAmount
      )
    }

    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text(`${activeTabLabel} List`, 14, 20)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Date range: ${from} to ${to}`, 14, 29)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36)

    autoTable(doc, {
      startY: 44,
      head: [[
        'Guest',
        'Room',
        'Room Type',
        'Check-in',
        'Check-out',
        'Status',
        'Payment',
        'Source',
      ]],
      body: exportRows.map((reservation) => [
        `${reservation.guestName || '-----'}\n${reservation.bookingReference || reservation.id || '-----'}`,
        reservation.roomNumber || '-----',
        reservation.roomTypeName || '-----',
        formatDateForDisplay(reservation.checkInDate),
        formatDateForDisplay(reservation.checkOutDate),
        reservation.status || '-----',
        reservation.paidAmount >= reservation.totalAmount
          ? 'Fully Paid'
          : reservation.paidAmount > 0
            ? 'Deposit Paid'
            : 'Unpaid',
        getReservationSourceLabel(reservation),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [11, 78, 162], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [244, 249, 255] },
      styles: { fontSize: 8, cellPadding: 2.5 },
    })

    doc.save(`${activeTabLabel.replace(/\s+/g, '_')}_${from}_to_${to}.pdf`)
  }

  return (
    <div className="space-y-6">
      <ReservationsTabs activeTab={activeTab} onTabChange={onTabChange} />

      {activeTab === 'group' ? (
        <GroupReservationsPage />
      ) : activeTab === 'optional' ? (
        <OptionalReservationsTab />
      ) : (
        <>
      <ReservationDetailsPopup
        open={detailsOpen}
        onClose={closeDetails}
        reservationId={detailsReservationId}
        reservationStatus={pmsReservations.find((reservation) => reservation.id === detailsReservationId)?.status}
        onOpenExtendStay={onOpenExtendStay}
        onPaymentSuccess={refreshReservations}
      />

      <ExtendStayPopup
        open={extendStayOpen}
        onClose={closeExtendStay}
        reservationId={extendStayReservationId}
        onSuccess={refreshReservations}
      />

      <MoveRoomPopup
        open={moveRoomOpen}
        onClose={() => {
          setMoveRoomOpen(false)
          setMoveRoomReservationId(null)
        }}
        reservationId={moveRoomReservationId}
        onSuccess={refreshReservations}
      />

      <CheckInProcessPopup
        open={checkInOpen}
        onClose={() => {
          setCheckInOpen(false)
          setCheckInReservationId(null)
        }}
        reservationId={checkInReservationId}
        onSuccess={() => {
          void dispatch(fetchReservationsTable({ startDate: checkInFrom, endDate: checkInTo }))
        }}
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
        onSuccess={refreshReservations}
      />

      <CancelReservationProcessPopup
        open={cancelOpen}
        onClose={() => {
          setCancelOpen(false)
          setCancelReservationId(null)
        }}
        reservation={cancelReservation}
        onSuccess={refreshReservations}
      />

      <OtaReservationModal open={otaOpen} onClose={() => setOtaOpen(false)} />

      <ExportInHouseListPopup
        open={exportOpen}
        initialFrom={checkInFrom}
        initialTo={checkInTo}
        onClose={() => setExportOpen(false)}
        onExport={exportReservations}
        title="Export Reservations List"
        subject="reservations list"
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full max-w-2xl">
            <input
              className="h-11 w-full rounded-full bg-[#F3F5FF] px-6 pr-12 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 opacity-70">
              <IconImage src={IoSearchSharp} alt="Search" className="h-4 w-4" />
            </div>
          </div>

          <div className="text-sm font-semibold text-slate-600">{filteredRows.length} results</div>
        </div>

        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[120px] space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</div>
            <select
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-600 outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All status</option>
              <option value="Reserved">Reserved</option>
              <option value="Confirmed">Confirmed</option>
              <option value="CheckedIn">Checked In</option>
              <option value="CheckedOut">Checked Out</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {activeTab === 'normal' ? (
            <div className="flex-1 min-w-[150px] space-y-1.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Booking Source</div>
              <select
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-600 outline-none"
                value={bookingSourceFilter}
                onChange={(e) => setBookingSourceFilter(e.target.value)}
              >
                <option value="all">All Booking Sources</option>
                {bookingSourceOptions.map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="flex-1 min-w-[120px] space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Room Type</div>
            <select
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-600 outline-none"
              value={roomTypeFilter}
              onChange={(e) => setRoomTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Suite">Suite</option>
            </select>
          </div>

          <div className="flex-1 min-w-[120px] space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Payment</div>
            <select
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-600 outline-none"
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
            >
              <option value="all">All Payment Status</option>
              <option value="deposit paid">deposit paid</option>
              <option value="Fully paid">Fully paid</option>
            </select>
          </div>

          <div className="flex-1 min-w-[130px] space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Check-in From</div>
            <div className="relative">
              <input
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-600 outline-none placeholder:text-slate-400"
                placeholder="YYYY-MM-DD"
                type="date"
                value={checkInFrom}
                onChange={(e) => setCheckInFrom(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 min-w-[130px] space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Check-in To</div>
            <div className="relative">
              <input
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-600 outline-none placeholder:text-slate-400"
                placeholder="YYYY-MM-DD"
                type="date"
                value={checkInTo}
                onChange={(e) => setCheckInTo(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
          {/* <button
            type="button"
            onClick={() => setOtaOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#0B4EA2] px-6 text-sm font-semibold text-[#0B4EA2] transition-all hover:bg-blue-50 active:scale-95"
          >
            <span className="text-base leading-none">+</span>
            OTA Reservation
          </button> */}
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0B4EA2] px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#093d81] active:scale-95"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm  ">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_.9fr_1fr_.8fr_1.2fr] bg-[#EAF2FF] px-6 py-3 text-[12px] font-semibold text-slate-700">
          <div>Guest</div>
          <div>Room</div>
          <div>Check-in</div>
          <div>Check-out</div>
          <div>Status</div>
          <div>Payment</div>
          <div>Source</div>
          <div className="text-center">Action</div>
        </div>

        <div className="min-h-[360px] flex flex-col">
          {reservationsLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0B4EA2]/20 border-t-[#0B4EA2]" />
              <p className="mt-3 text-sm font-medium text-slate-500">Loading reservations...</p>
            </div>
          ) : pageRows.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
              <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
                <IoSearchSharp className="h-6 w-6" />
              </div>
              <h3 className="text-[15px] font-semibold text-slate-700">No reservations found</h3>
              <p className="mt-1 text-sm text-slate-500">Try adjusting your filters or date range.</p>
            </div>
          ) : (
            pageRows.map((row: PmsReservation, idx) => {
              const statusLabel = row.status
            const sourceLabel = getReservationSourceLabel(row)
            const paymentLabel = row.paidAmount >= row.totalAmount ? 'Fully Paid' : row.paidAmount > 0 ? 'deposit paid' : 'Unpaid'

            const isCheckInToday = row.checkInDate?.startsWith(today) ?? false
            const normalizedStatus = normalizeStatus(row.status)
            const isCancelledStatus = normalizedStatus === 'cancelled' || normalizedStatus === 'canceled'
            const canShowCheckIn =
              (isCheckInToday || normalizedStatus === 'reserved') &&
              normalizedStatus !== 'checkedin' &&
              normalizedStatus !== 'checkedout' &&
              !isCancelledStatus
            const isCheckOutDue =
              normalizedStatus === 'checkedin' &&
              Boolean(row.checkOutDate) &&
              row.checkOutDate.slice(0, 10) === today
            const isLateCheckOut =
              normalizedStatus === 'checkedin' &&
              Boolean(row.checkOutDate) &&
              row.checkOutDate.slice(0, 10) < today
            const canCancelReservation = !isCancelledStatus
            const canEarlyCheckOut = normalizedStatus === 'checkedin' && !isCheckOutDue && !isLateCheckOut
            const canMoveRoom = !isCancelledStatus
            const canExtendStay = !isCancelledStatus && normalizedStatus !== 'checkedout'
            const hasMoreActions = canCancelReservation || canEarlyCheckOut || canMoveRoom || canExtendStay
            return (
              <div
                key={row.id}
                className={[
                  'grid grid-cols-[1.5fr_1fr_1fr_1fr_.9fr_1fr_.8fr_1.2fr] items-center px-6 py-3 text-[12px] text-slate-700',
                  idx % 2 === 1 ? 'bg-[#F4F9FF]' : 'bg-white',
                ].join(' ')}
              >
                <div className="min-w-0 leading-tight">
                  <div className="truncate font-medium text-slate-800">{row.guestName}</div>
                  <div className="truncate text-[11px] text-slate-500" title={row.bookingReference || row.id}>
                    {row.bookingReference || row.id || '-----'}
                  </div>
                </div>

                <div>
                  {row.roomNumber ? (
                    <div className="leading-tight">
                      <div className="font-medium text-slate-800">{row.roomTypeName}</div>
                      <div className="text-[11px] text-slate-500">{row.roomNumber}</div>
                    </div>
                  ) : (
                    row.roomTypeName
                  )}
                </div>

                <div>{formatDateForDisplay(row.checkInDate)}</div>
                <div>{formatDateForDisplay(row.checkOutDate)}</div>
                <div>
                  <span
                    className={[
                      'inline-flex max-w-full items-center rounded-full border px-3 py-1 text-[11px] font-semibold leading-none',
                      getStatusTagClass(statusLabel),
                    ].join(' ')}
                    title={statusLabel || undefined}
                  >
                    <span className="truncate">{statusLabel || '-----'}</span>
                  </span>
                </div>
                <div>{paymentLabel}</div>
                <div>
                  <span
                    className={[
                      'inline-flex max-w-full items-center rounded-full border px-3 py-1 text-[11px] font-semibold leading-none',
                      getBookingSourceTagClass(sourceLabel),
                    ].join(' ')}
                    title={sourceLabel}
                  >
                    <span className="truncate">{sourceLabel}</span>
                  </span>
                </div>

                <div className="relative flex items-center justify-center gap-2">
                  {canShowCheckIn ? (
                    // Check in button (green)
                    <button
                      type="button"
                      className="inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-md bg-emerald-700 px-3 text-[12px] font-semibold leading-none text-white"
                      onClick={() => onOpenCheckIn(row.id)}
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
                            setCheckOutReservationId(row.id)
                            setCheckOutMode(isLateCheckOut ? 'late' : 'regular')
                            setCheckOutOpen(true)
                          }}
                        >
                          {isLateCheckOut ? 'Late Check-out' : 'check out'}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md bg-[#0B4EA2] px-3 text-[12px] font-semibold leading-none text-white"
                        onClick={() => {
                          setDetailsReservationId(row.id)
                          setDetailsOpen(true)
                        }}
                        aria-label="View"
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
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => setOpenMenuForId((prev) => (prev === row.id ? null : row.id))}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  ) : null}

                  {hasMoreActions && openMenuForId === row.id ? (
                    <div
                      ref={menuRef}
                      className="absolute right-0 top-11 z-10 w-48  rounded-xl border border-slate-200 bg-white shadow-lg"
                    >
                      {canCancelReservation ? (
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                          onClick={() => {
                            setOpenMenuForId(null)
                            setCancelReservationId(row.id)
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
                            setCheckOutReservationId(row.id)
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
                            setMoveRoomReservationId(row.id)
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
                            onOpenExtendStay(row.id)
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
          }))}
        </div>
        <div className="mt-4 flex justify-between items-center px-6 pb-5">
          <div className="text-[13px] text-slate-500 font-medium">
            Showing {pageRows.length} of {filteredRows.length} reservations
          </div>
          <Pagination page={safePage} pages={pages} onChange={setPage} />
        </div>
      </div>
        </>
      )}
    </div>
  )
}
