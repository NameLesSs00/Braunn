import { useEffect, useMemo, useState } from 'react'
import { Minus, Plus, CheckCircle2, AlertCircle } from 'lucide-react'

import { Modal } from '../../../shared/ui/Modal'
import { IconImage } from '../../../shared/ui/IconImage'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'

import type { ReservationDraft } from '../../../features/reservations/draftSlice'
import { fetchRoomTypes } from '../../../features/roomTypes/roomTypesSlice'
import { fetchRoomsAvailability } from '../../../features/rooms/roomsSlice'
import { assignReservationRoom } from '../../../features/ops/opsSlice'
import { SuccessAlertModal } from '../../../shared/ui/SuccessAlertModal'


import { FaCheck } from 'react-icons/fa'
import { LuKey } from 'react-icons/lu'
import { MdOutlineWarningAmber } from 'react-icons/md'

import { InfoRow } from './InfoRow'
import type { Pricing } from './types'
import { formatDateForDisplay, formatMoney, parseNumberOrZero } from './utils'
import type { PmsCheckInParams } from '../../../shared/apis/PmsReservation'

type Props = {
  open: boolean
  onClose: () => void
  value: ReservationDraft
  onChange: (patch: Partial<ReservationDraft>) => void
  pricing: Pricing
  selectedRoomId?: string
  onChangeSelectedRoomId?: (roomId: string) => void
  onSubmitCheckIn?: (notes?: string) => Promise<void>
  submittingCheckIn?: boolean
  reservationDetails?: {
    reservationId: string
    reservationRoomId?: string
    guestName: string
    roomTypeId?: string
    roomTypeName: string
    checkInDate: string
    checkOutDate: string
    roomView: string
    extras: string
    totalAmount: number
    companions: string
    guestsCount: number
    roomNumber?: string | null
  }
}

export function CheckInProcessModal({
  open,
  onClose,
  value,
  onChange,
  pricing,
  reservationDetails,
  selectedRoomId,
  onChangeSelectedRoomId,
  onSubmitCheckIn,
  submittingCheckIn = false,
}: Props) {
  const dispatch = useAppDispatch()
  const roomTypes = useAppSelector((s) => s.roomTypes.items)
  const roomsAvailability = useAppSelector((s) => s.rooms.availability)
  const roomsAvailabilityStatus = useAppSelector((s) => s.rooms.availabilityStatus)



  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [idVerified, setIdVerified] = useState(false)
  const [guestInfoConfirmed, setGuestInfoConfirmed] = useState(false)
  const [assignRoomOpen, setAssignRoomOpen] = useState(false)
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState('')
  const [confirmingAssign, setConfirmingAssign] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [assignAlertOpen, setAssignAlertOpen] = useState(false)
  const [assignAlertVariant, setAssignAlertVariant] = useState<'success' | 'error'>('success')
  const [assignAlertMessage, setAssignAlertMessage] = useState('')
  const [roomAssignedSuccessfully, setRoomAssignedSuccessfully] = useState(false)
  const [assignedRoomNumber, setAssignedRoomNumber] = useState<string | null>(null)


  useEffect(() => {
    if (!open) return
    setStep(1)
    setIdVerified(false)
    setGuestInfoConfirmed(false)
    setAssignRoomOpen(false)
    setConfirmingAssign(false)
    setRoomAssignedSuccessfully(false)
    setAssignedRoomNumber(null)

    // Set default dates: today and end of current month
    const now = new Date()
    const formatDate = (date: Date) => {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }

    const today = formatDate(now)
    const lastDayOfMonth = formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))

    onChange({
      checkInDate: today,
      checkOutDate: lastDayOfMonth,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])



  useEffect(() => {
    if (!open) return
    void dispatch(fetchRoomTypes())
  }, [dispatch, open])

  // Auto-trigger availability when assignRoomOpen changes or reservationDetails changes
  useEffect(() => {
    if (!open) return
    
    // Pre-set roomTypeId from reservationDetails if available
    if (reservationDetails?.reservationId && !selectedRoomTypeId) {
      if (reservationDetails.roomTypeId) {
        setSelectedRoomTypeId(reservationDetails.roomTypeId)
      } else if (reservationDetails.roomTypeName && roomTypes.length > 0) {
        const matched = roomTypes.find((rt) => rt.name === reservationDetails.roomTypeName)
        if (matched) setSelectedRoomTypeId(matched.id)
      }
    }
  }, [open, reservationDetails, selectedRoomTypeId, roomTypes])

  useEffect(() => {
    const startDate = reservationDetails?.checkInDate ? formatDateForDisplay(reservationDetails.checkInDate) : value.checkInDate
    const endDate = reservationDetails?.checkOutDate ? formatDateForDisplay(reservationDetails.checkOutDate) : value.checkOutDate

    if (!open || !selectedRoomTypeId || !startDate || !endDate) return

    void dispatch(
      fetchRoomsAvailability({
        StartDate: startDate,
        EndDate: endDate,
        RoomTypeId: selectedRoomTypeId,
      }),
    ).then(() => {
      // Clear current selection when dependencies change
      onChangeSelectedRoomId?.('')
      onChange({
        rooms: value.rooms.map((r, idx) => (idx === 0 ? { ...r, roomNumber: '' } : r)),
      })
    })
  }, [dispatch, open, selectedRoomTypeId, value.checkInDate, value.checkOutDate])

  const fullName = useMemo(() => {
    if (reservationDetails?.guestName) return reservationDetails.guestName
    return [value.firstName, value.surName].filter(Boolean).join(' ')
  }, [reservationDetails?.guestName, value.firstName, value.surName])

  const roomNumber = reservationDetails?.roomNumber || value.rooms[0]?.roomNumber || 'Not assigned'
  const roomType = reservationDetails?.roomTypeName || value.rooms[0]?.roomType || 'double'
  const extrasText = value.extras.length ? value.extras.map((e) => `${e.qty} ${e.item}`).join(', ') : 'No extras'

  const reservationExtrasText = reservationDetails?.extras || '-----'
  const companionsText = reservationDetails?.companions || '-----'
  const guestsCount = reservationDetails?.guestsCount ?? (value.adultCount || 0)
  const checkInDateText = reservationDetails?.checkInDate ? formatDateForDisplay(reservationDetails.checkInDate) : formatDateForDisplay(value.checkInDate)
  const checkOutDateText = reservationDetails?.checkOutDate ? formatDateForDisplay(reservationDetails.checkOutDate) : formatDateForDisplay(value.checkOutDate)
  const currency = pricing.currency || '$'
  const totalAmountText = reservationDetails ? formatMoney(reservationDetails.totalAmount, currency) : formatMoney(pricing.totalAmount, currency)



  const filteredRooms = useMemo(() => {
    if (roomsAvailabilityStatus === 'succeeded') {
      return roomsAvailability.map((r) => ({
        id: r.roomId,
        roomNumber: r.roomNumber,
        roomTypeId: r.roomTypeId,
        roomTypeName: r.roomTypeName,
        basePrice: r.basePrice,
      }))
    }
    return []
  }, [roomsAvailability, roomsAvailabilityStatus])

  useEffect(() => {
    if (!assignRoomOpen) return
    const count = filteredRooms.length
    onChange({
      rooms: value.rooms.map((r, idx) => (idx === 0 ? { ...r, roomCount: count } : r)),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignRoomOpen, filteredRooms.length])

  const remainingBalance = useMemo(() => {
    const paid = parseNumberOrZero(value.paidAmount)
    return Math.max(0, pricing.totalAmount - pricing.requiredDeposit - paid)
  }, [pricing.requiredDeposit, pricing.totalAmount, value.paidAmount])

  const addOtherPaymentRow = () => {
    const nextRow = { id: Date.now(), paymentMethod: '', paidAmount: '' }
    onChange({ otherPayments: [...value.otherPayments, nextRow] })
  }

  const updateOtherPaymentRow = (id: number, patch: Partial<{ paymentMethod: string; paidAmount: string }>) => {
    onChange({
      otherPayments: value.otherPayments.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    })
  }

  const removeOtherPaymentRow = (id: number) => {
    onChange({ otherPayments: value.otherPayments.filter((row) => row.id !== id) })
  }

  const otherPaymentsTotal = useMemo(() => {
    return value.otherPayments.reduce((sum, row) => sum + parseNumberOrZero(row.paidAmount), 0)
  }, [value.otherPayments])

  const paymentProcessed = useMemo(() => {
    return Math.max(0, parseNumberOrZero(value.paidAmount) + otherPaymentsTotal)
  }, [otherPaymentsTotal, value.paidAmount])

  const outstandingBalance = useMemo(() => {
    return Math.max(0, pricing.totalAmount - pricing.requiredDeposit - paymentProcessed)
  }, [paymentProcessed, pricing.requiredDeposit, pricing.totalAmount])

  const accessCode = useMemo(() => {
    const base = [value.phone, value.idNumber, value.email].filter(Boolean).join('-')
    const digits = base.replace(/\D/g, '')
    const padded = (digits + '0000000000000000').slice(0, 16)
    return `${padded.slice(0, 4)}-${padded.slice(4, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}`
  }, [value.email, value.idNumber, value.phone])

  const handleDownloadCredentials = () => {
    const payload = {
      guestName: fullName,
      roomNumber,
      roomType,
      checkInDate: value.checkInDate,
      checkOutDate: value.checkOutDate,
      accessCode,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `key-card-credentials-${roomNumber}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrintKeyCard = () => {
    window.print()
  }

  return (
    <>
      <Modal open={open} onClose={onClose}>
      <div className="flex h-[92vh] w-[92vw] max-w-5xl flex-col overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between bg-[#0B4EA2] px-8 py-5">
          <div>
            <div className="text-lg font-semibold text-white">{step === 4 ? 'Key Card Ready' : 'Check-In Process'}</div>
            <div className="mt-1 text-sm text-white/80">
              {step === 4 ? 'Check-in completed successfully' : `Room ${roomNumber} - ${fullName || 'Guest'}`}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full text-white/90 hover:bg-white/10"
            aria-label="Close"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>

        <div className="px-8 py-7">
          {/* Relative wrapper defines the maximum width bounds */}
          <div className="relative mx-auto flex w-full max-w-xl items-center justify-between">

            {/* 1. The connecting line track placed underneath the circles */}
            <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-slate-200 z-0" />

            {/* 2. Map through your steps */}
            {[1, 2, 3].map((s) => (
              <div key={s} className="relative z-10 flex items-center justify-center">
                {s < step ? (
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500 text-sm font-semibold text-white shadow-sm">
                    ✓
                  </div>
                ) : (
                  <div
                    className={[
                      'grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold border transition-colors',
                      s === step
                        ? 'border-[#0B4EA2] bg-[#0B4EA2] text-white shadow-sm'
                        : 'border-slate-300 bg-white text-slate-500',
                    ].join(' ')}
                  >
                    {s}
                  </div>
                )}
              </div>
            ))}

          </div>
        </div>

        <div className="flex-1 px-8 pb-8">
          {step === 1 ? (
            <div className="mx-auto w-full max-w-4xl">
              <div className="rounded-2xl border border-slate-200 bg-[#F2F8FF] p-6">
                <div className="mb-4 text-sm font-semibold text-slate-800">Reservation Details</div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <div className="text-[12px] text-slate-500">Guest Name</div>
                      <div className="text-sm font-semibold text-slate-800">{fullName || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-slate-500">Check-in Date</div>
                      <div className="text-sm font-semibold text-slate-800">{checkInDateText || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-slate-500">Number of Guests</div>
                      <div className="text-sm font-semibold text-slate-800">{guestsCount || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-slate-500">Rate plan</div>
                      <div className="text-sm font-semibold text-slate-800">{value.ratePlan || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-slate-500">Companions</div>
                      <div className="text-sm font-semibold text-slate-800">{companionsText}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-[12px] text-slate-500">Room Type</div>
                      <div className="text-sm font-semibold text-slate-800">{roomType}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-slate-500">Check-out Date</div>
                      <div className="text-sm font-semibold text-slate-800">{checkOutDateText || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-slate-500">Extras</div>
                      <div className="text-sm font-semibold text-slate-800">{reservationDetails ? reservationExtrasText : extrasText}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-slate-500">Total Amount</div>
                      <div className="text-sm font-semibold text-slate-800">{totalAmountText}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-slate-500">Booking source</div>
                      <div className="text-sm font-semibold text-slate-800">{value.bookingSource || '—'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room allocation area — deterministic, no toggle dependency */}
              {reservationDetails?.roomNumber ? (
                // Already assigned from backend
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Room Assigned</div>
                    <div className="text-sm font-bold text-emerald-800">Room {reservationDetails.roomNumber}</div>
                  </div>
                </div>
              ) : roomAssignedSuccessfully && assignedRoomNumber ? (
                // Just assigned in this session
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Room Assigned</div>
                    <div className="text-sm font-bold text-emerald-800">Room {assignedRoomNumber}</div>
                  </div>
                </div>
              ) : (
                // No room yet — show Assign Room button and form
                <>
                  {!assignRoomOpen && (
                    <div className="mt-6 flex items-end justify-end">
                      <div className="w-full max-w-[320px] text-right">
                        <div className="mb-2 text-xs font-semibold text-slate-700">
                          Room <span className="text-red-500">*</span>
                        </div>
                        <button
                          type="button"
                          className="h-11 w-full rounded-xl border border-[#0B4EA2] bg-white text-sm font-semibold text-[#0B4EA2]"
                          onClick={() => setAssignRoomOpen(true)}
                        >
                          Assign Room
                        </button>
                      </div>
                    </div>
                  )}

                  {assignRoomOpen && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Room Type — read-only */}
                        <div className="space-y-2">
                          <div className="text-[12px] font-semibold text-slate-700">Room Type</div>
                          <input
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none"
                            value={reservationDetails?.roomTypeName ?? value.rooms[0]?.roomType ?? ''}
                            disabled
                            readOnly
                          />
                        </div>

                        {/* Rate Plan — read-only */}
                        <div className="space-y-2">
                          <div className="text-[12px] font-semibold text-slate-700">Rate Plan</div>
                          <input
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none"
                            value={value.ratePlan ?? ''}
                            disabled
                          />
                        </div>
                      </div>

                      {/* Room Number */}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-[12px] font-semibold text-slate-700">Room Number</div>
                          {roomsAvailabilityStatus === 'loading' ? (
                            <div className="text-[10px] text-slate-400">Checking availability...</div>
                          ) : roomsAvailabilityStatus === 'succeeded' ? (
                            <div className="text-[10px] font-medium text-emerald-600">
                              {roomsAvailability.length} rooms available
                            </div>
                          ) : null}
                        </div>

                        <select
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none disabled:bg-slate-50"
                          value={selectedRoomId ?? ''}
                          disabled={roomsAvailabilityStatus === 'loading'}
                          onChange={(e) => {
                            const nextRoomId = e.target.value
                            const room = filteredRooms.find((r) => r.id === nextRoomId)
                            const nextRoomNumber = room?.roomNumber ?? ''
                            onChangeSelectedRoomId?.(nextRoomId)
                            onChange({
                              rooms: value.rooms.map((r, idx) => (idx === 0 ? { ...r, roomNumber: nextRoomNumber } : r)),
                            })
                            setConfirmingAssign(false)
                          }}
                        >
                          <option value="" disabled>
                            {roomsAvailabilityStatus === 'loading' ? 'Loading available rooms...' : 'Select room number'}
                          </option>
                          {filteredRooms.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.roomNumber}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Confirm button */}
                      {selectedRoomId && !confirmingAssign && (
                        <div className="mt-4">
                          <button
                            type="button"
                            className="w-full rounded-xl bg-[#0B4EA2] py-2.5 text-sm font-semibold text-white hover:bg-[#093d81] transition-colors"
                            onClick={() => setConfirmingAssign(true)}
                          >
                            Confirm
                          </button>
                        </div>
                      )}

                      {/* Inline confirmation dialog */}
                      {confirmingAssign && (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <div className="mb-3 text-sm font-semibold text-slate-800">
                            Are you sure you want to allocate this room?
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              className="flex-1 rounded-xl bg-[#0B4EA2] py-2.5 text-sm font-semibold text-white hover:bg-[#093d81] disabled:opacity-60 transition-colors"
                              disabled={isAssigning}
                              onClick={async () => {
                                const reservationRoomId = reservationDetails?.reservationRoomId
                                const roomIdToAssign = selectedRoomId ?? ''
                                if (!reservationRoomId || !roomIdToAssign) {
                                  alert(`Missing data! reservationRoomId: ${reservationRoomId}, roomId: ${roomIdToAssign}`)
                                  return
                                }
                                setIsAssigning(true)
                                try {
                                  await dispatch(assignReservationRoom({
                                    reservationRoomId,
                                    roomId: roomIdToAssign,
                                    notes: '',
                                  })).unwrap()
                                  const room = filteredRooms.find((r) => r.id === roomIdToAssign)
                                  setAssignedRoomNumber(room?.roomNumber ?? '')
                                  setRoomAssignedSuccessfully(true)
                                  setAssignRoomOpen(false)
                                  setAssignAlertVariant('success')
                                  setAssignAlertMessage('Room has been allocated successfully!')
                                } catch (e) {
                                  setAssignAlertVariant('error')
                                  setAssignAlertMessage(typeof e === 'string' ? e : 'Failed to allocate room.')
                                } finally {
                                  setIsAssigning(false)
                                  setConfirmingAssign(false)
                                  setAssignAlertOpen(true)
                                }
                              }}
                            >
                              {isAssigning ? 'Allocating...' : 'Yes, Confirm'}
                            </button>
                            <button
                              type="button"
                              className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                              onClick={() => setConfirmingAssign(false)}
                              disabled={isAssigning}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}


              <div className="mt-8 space-y-5">
                <div className="rounded-2xl bg-[#FFECC2] px-5 py-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <IconImage
                      src={MdOutlineWarningAmber}
                      alt=""
                      className="h-4 w-4"
                      style={{ filter: 'brightness(0) saturate(100%)' }}
                    />
                    Important: Verify guest identity before check-in
                  </div>
                  <div className="mt-1 text-[12px] text-slate-700">
                    Please check government-issued ID matches the reservation details
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="mb-4 text-sm font-semibold text-slate-800">Guest Information</div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoRow label="Full Name:" value={fullName} />
                    <InfoRow label="Email:" value={value.email} />
                    <InfoRow label="Phone:" value={value.phone} />
                    <InfoRow label="ID Number:" value={value.idNumber} />
                    <InfoRow label="Nationality:" value={value.nationality} />
                  </div>
                </div>

                <button
                  type="button"
                  className="flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left"
                  onClick={() => setIdVerified((p) => !p)}
                >
                  <div
                    className={[
                      'mt-1 grid h-5 w-5 place-items-center rounded-md border',
                      idVerified ? 'border-[#0B4EA2] bg-[#0B4EA2] text-white' : 'border-slate-300 bg-white text-transparent',
                    ].join(' ')}
                  >
                   {idVerified ? <FaCheck className="h-2.5 w-2.5" /> : null}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">ID Verification Complete</div>
                    <div className="mt-1 text-[12px] text-slate-500">
                      I have verified the guest's government-issued ID matches the reservation
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  className="flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left"
                  onClick={() => setGuestInfoConfirmed((p) => !p)}
                >
                  <div
                    className={[
                      'mt-1 grid h-5 w-5 place-items-center rounded-md border',
                      guestInfoConfirmed
                        ? 'border-[#0B4EA2] bg-[#0B4EA2] text-white'
                        : 'border-slate-300 bg-white text-transparent',
                    ].join(' ')}
                  >
                    {guestInfoConfirmed ? <FaCheck className="h-2.5 w-2.5" /> : null}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Guest Information Confirmed</div>
                    <div className="mt-1 text-[12px] text-slate-500">
                      Guest has confirmed contact details and reservation information
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : step === 2 ? (
            <div className="mx-auto w-full max-w-4xl">
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-[#F2F8FF] p-6">
                  <div className="mb-4 text-sm font-semibold text-slate-800">Reservation Details</div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <div className="text-[12px] text-slate-500">Guest Name</div>
                        <div className="text-sm font-semibold text-slate-800">{fullName || '—'}</div>
                      </div>
                      <div>
                        <div className="text-[12px] text-slate-500">Check-in Date</div>
                        <div className="text-sm font-semibold text-slate-800">{checkInDateText || '—'}</div>
                      </div>
                      <div>
                        <div className="text-[12px] text-slate-500">Number of Guests</div>
                        <div className="text-sm font-semibold text-slate-800">{guestsCount || '—'}</div>
                      </div>
                      <div>
                        <div className="text-[12px] text-slate-500">Rate plan</div>
                        <div className="text-sm font-semibold text-slate-800">{value.ratePlan || '—'}</div>
                      </div>
                      <div>
                        <div className="text-[12px] text-slate-500">Companions</div>
                        <div className="text-sm font-semibold text-slate-800">{companionsText}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-[12px] text-slate-500">Room Type</div>
                        <div className="text-sm font-semibold text-slate-800">{roomType}</div>
                      </div>
                      <div>
                        <div className="text-[12px] text-slate-500">Check-out Date</div>
                        <div className="text-sm font-semibold text-slate-800">{checkOutDateText || '—'}</div>
                      </div>
                      <div>
                        <div className="text-[12px] text-slate-500">Extras</div>
                        <div className="text-sm font-semibold text-slate-800">{reservationDetails ? reservationExtrasText : extrasText}</div>
                      </div>
                      <div>
                        <div className="text-[12px] text-slate-500">Total Amount</div>
                        <div className="text-sm font-semibold text-slate-800">{totalAmountText}</div>
                      </div>
                      <div>
                        <div className="text-[12px] text-slate-500">Booking source</div>
                        <div className="text-sm font-semibold text-slate-800">{value.bookingSource || '—'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="text-sm font-semibold text-slate-800">Payment Summary</div>
                  <div className="mt-4 grid grid-cols-1 gap-3 text-[12px] text-slate-600 md:grid-cols-2">
                    {pricing.baseTotal > 0 && (
                      <div className="flex items-center justify-between">
                        <span>Base Rate</span>
                        <span className="font-semibold text-slate-800">{formatMoney(pricing.baseTotal, currency)}</span>
                      </div>
                    )}
                    {pricing.extraAdultTotal > 0 && (
                      <div className="flex items-center justify-between">
                        <span>Extra Adults</span>
                        <span className="font-semibold text-slate-800">{formatMoney(pricing.extraAdultTotal, currency)}</span>
                      </div>
                    )}
                    {pricing.childTotal > 0 && (
                      <div className="flex items-center justify-between">
                        <span>Children</span>
                        <span className="font-semibold text-slate-800">{formatMoney(pricing.childTotal, currency)}</span>
                      </div>
                    )}
                    {pricing.mealPlansTotal > 0 && (
                      <div className="flex items-center justify-between">
                        <span>Meal Plans</span>
                        <span className="font-semibold text-slate-800">{formatMoney(pricing.mealPlansTotal, currency)}</span>
                      </div>
                    )}
                    {pricing.extrasTotal > 0 && (
                      <div className="flex items-center justify-between">
                        <span>Additional Services</span>
                        <span className="font-semibold text-slate-800">{formatMoney(pricing.extrasTotal, currency)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Taxes & Fees</span>
                      <span className="font-semibold text-slate-800">{formatMoney(pricing.taxesAmount, currency)}</span>
                    </div>
                    <div className="flex items-center justify-between md:col-span-2 mt-2 pt-3 border-t border-slate-100">
                      <span className="font-semibold text-slate-700">Total Amount</span>
                      <span className="font-bold text-slate-900">{formatMoney(pricing.totalAmount, currency)}</span>
                    </div>
                    <div className="flex items-center justify-between md:col-span-2">
                      <span>Deposit Paid</span>
                      <span className="font-semibold text-emerald-600">{formatMoney(pricing.requiredDeposit, currency)}</span>
                    </div>
                    <div className="flex items-center justify-between md:col-span-2">
                      <span>Remaining Balance</span>
                      <span className="font-semibold text-orange-600">
                        {formatMoney(Math.max(0, pricing.totalAmount - pricing.requiredDeposit), currency)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="text-sm font-semibold text-slate-800">Additional Payment (Optional)</div>
                  <div className="mt-1 text-[12px] text-slate-500">
                    Guest can pay the remaining balance now or at check-out
                  </div>

                  <div className="mt-5 space-y-4">
                    <div className="space-y-2">
                      <div className="text-[12px] font-semibold text-slate-700">$</div>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                        <input
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
                          value={value.paidAmount}
                          onChange={(e) => onChange({ paidAmount: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="text-[12px] font-semibold text-slate-700">
                          Payment Method <span className="text-red-500">*</span>
                        </div>
                        <div className="relative">
                          <select
                            className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-500 outline-none focus:border-[#0B4EA2]"
                            value={value.paymentMethod}
                            onChange={(e) => onChange({ paymentMethod: e.target.value })}
                          >
                            <option value="">Select Payment</option>
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="bank-transfer">Bank transfer</option>
                          </select>
                          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-[12px] font-semibold text-slate-700">Paid amount</div>
                        <input
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
                          placeholder="Enter amount"
                          value={value.paidAmount}
                          onChange={(e) => onChange({ paidAmount: e.target.value })}
                        />
                        <div className="text-[11px] text-slate-500">Remaining {formatMoney(remainingBalance, currency)}</div>
                      </div>
                    </div>

                    {value.otherPayments.length > 0 ? (
                      <div className="space-y-4">
                        {value.otherPayments.map((row) => (
                          <div key={row.id} className="grid grid-cols-1 items-end gap-6 md:grid-cols-[1fr_1fr_44px]">
                            <div className="space-y-2">
                              <div className="text-[12px] font-semibold text-slate-700">Payment Method</div>
                              <div className="relative">
                                <select
                                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-500 outline-none focus:border-[#0B4EA2]"
                                  value={row.paymentMethod}
                                  onChange={(e) => updateOtherPaymentRow(row.id, { paymentMethod: e.target.value })}
                                >
                                  <option value="">Select Payment</option>
                                  <option value="cash">Cash</option>
                                  <option value="card">Card</option>
                                  <option value="bank-transfer">Bank transfer</option>
                                </select>
                                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="text-[12px] font-semibold text-slate-700">Paid amount</div>
                              <input
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
                                placeholder="Enter amount"
                                value={row.paidAmount}
                                onChange={(e) => updateOtherPaymentRow(row.id, { paidAmount: e.target.value })}
                              />
                            </div>

                            <button
                              type="button"
                              className="grid h-11 w-11 place-items-center rounded-xl text-slate-500 hover:bg-slate-50"
                              aria-label="Remove"
                              onClick={() => removeOtherPaymentRow(row.id)}
                            >
                              <Minus className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 border-b border-[#0B4EA2] pb-0.5 text-sm font-medium text-[#0B4EA2]"
                        onClick={addOtherPaymentRow}
                      >
                        <Plus className="h-5 w-5" />
                        Add Other Payment Method
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : step === 3 ? (
            <div className="mx-auto w-full max-w-4xl space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-[#F2F8FF] p-6">
                <div className="mb-4 text-sm font-semibold text-slate-800">Reservation Details</div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <div className="text-[12px] text-slate-500">Guest Name</div>
                      <div className="text-sm font-semibold text-slate-800">{fullName || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-slate-500">Check-in Date</div>
                      <div className="text-sm font-semibold text-slate-800">{checkInDateText || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-slate-500">Number of Guests</div>
                      <div className="text-sm font-semibold text-slate-800">{guestsCount || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-slate-500">Rate plan</div>
                      <div className="text-sm font-semibold text-slate-800">{value.ratePlan || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-slate-500">Companions</div>
                      <div className="text-sm font-semibold text-slate-800">{companionsText}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-[12px] text-slate-500">Room Type</div>
                      <div className="text-sm font-semibold text-slate-800">{roomType}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-slate-500">Check-out Date</div>
                      <div className="text-sm font-semibold text-slate-800">{checkOutDateText || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-slate-500">Extras</div>
                      <div className="text-sm font-semibold text-slate-800">{reservationDetails ? reservationExtrasText : extrasText}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-slate-500">Total Amount</div>
                      <div className="text-sm font-semibold text-slate-800">{totalAmountText}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-slate-500">Booking source</div>
                      <div className="text-sm font-semibold text-slate-800">{value.bookingSource || '—'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-emerald-50 px-6 py-10 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-200">
                  <LuKey className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="mt-5 text-base font-semibold text-slate-800">Ready to Complete Check-In</div>
                <div className="mt-2 text-[13px] text-slate-600">
                  Guest will be checked in to Room
                  <div className="font-semibold text-slate-800">{roomNumber}</div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-6">
                <div className="space-y-3 text-[13px]">
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="grid h-5 w-5 place-items-center rounded-full border border-slate-300 text-slate-400">✓</div>
                    Guest identity verified
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="grid h-5 w-5 place-items-center rounded-full border border-slate-300 text-slate-400">✓</div>
                    Payment processed: {formatMoney(paymentProcessed, currency)}
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="grid h-5 w-5 place-items-center rounded-full border border-slate-300 text-slate-400">✓</div>
                    Room assignment: {roomNumber}
                  </div>
                  <div className="flex items-center gap-3 text-[#0B4EA2]">
                    <div className="grid h-5 w-5 place-items-center rounded-full border border-slate-300 text-slate-500">!</div>
                    Outstanding balance: {formatMoney(outstandingBalance, currency)}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="text-sm font-semibold text-slate-800">Check-In Instructions</div>
                <div className="mt-3 space-y-2 text-[12px] text-slate-400">
                  <div>Provide room key to guest</div>
                  <div>Explain hotel facilities and breakfast timings</div>
                  <div>Inform about check-out time: 12:00 PM</div>
                  <div>Provide WiFi password if applicable</div>
                </div>
              </div>
            </div>
          ) : step === 4 ? (
            <div className="mx-auto w-full max-w-4xl space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-500">
                    <span className="text-lg leading-none">≡</span>
                  </div>
                  <div className="text-[13px] text-slate-600">
                    The key card has been generated. Please print or download the access credentials and provide them to the guest.
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-[#0B4EA2] p-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="text-white">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-[#FFB000]">
                        <span className="text-lg font-semibold text-white">▭</span>
                      </div>
                      <div>
                        <div className="text-base font-semibold">Grand Hotel</div>
                        <div className="text-[12px] text-white/70">Digital Access Card</div>
                      </div>
                    </div>

                    <div className="my-6 h-px w-full bg-white/20" />

                    <div className="grid grid-cols-2 gap-x-10 gap-y-5 text-[12px]">
                      <div>
                        <div className="text-white/70">Guest Name</div>
                        <div className="mt-1 text-sm font-semibold text-white">{fullName || '—'}</div>
                      </div>
                      <div>
                        <div className="text-white/70">Room Type</div>
                        <div className="mt-1 text-sm font-semibold text-white">{roomType}</div>
                      </div>
                      <div>
                        <div className="text-white/70">Room Number</div>
                        <div className="mt-1 text-sm font-semibold text-white">{roomNumber}</div>
                      </div>
                      <div>
                        <div className="text-white/70">Check-out</div>
                        <div className="mt-1 text-sm font-semibold text-white">{formatDateForDisplay(value.checkOutDate) || '—'}</div>
                      </div>
                      <div>
                        <div className="text-white/70">Check-in</div>
                        <div className="mt-1 text-sm font-semibold text-white">{formatDateForDisplay(value.checkInDate) || '—'}</div>
                      </div>
                    </div>

                    <div className="my-7 h-px w-full bg-white/20" />

                    <div className="text-center text-[11px] text-white/70">Please keep this card safe during your stay</div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-full rounded-2xl bg-white/10 p-5">
                      <div className="rounded-2xl bg-white p-6">
                        <svg viewBox="0 0 120 120" className="mx-auto h-28 w-28">
                          {Array.from({ length: 11 }).map((_, y) =>
                            Array.from({ length: 11 }).map((__, x) => {
                              const on = (x * 17 + y * 31 + accessCode.length * 13) % 7 < 3
                              return on ? (
                                <circle key={`${x}-${y}`} cx={10 + x * 10} cy={10 + y * 10} r={2.2} fill="#0B4EA2" />
                              ) : null
                            }),
                          )}
                        </svg>
                      </div>
                      <div className="mt-3 text-center text-[11px] text-white/70">Scan for room access</div>
                    </div>

                    <div className="mt-5 w-full rounded-xl bg-black/25 px-5 py-3 text-center">
                      <div className="text-[11px] text-white/70">Access Code</div>
                      <div className="mt-1 text-sm font-semibold text-white">{accessCode}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-white px-8 py-6">
          {step === 4 ? (
            <div className="flex w-full items-center justify-between gap-4">
              <button
                type="button"
                className="h-12 rounded-xl border border-[#0B4EA2] bg-white px-12 text-sm font-semibold text-[#0B4EA2]"
                onClick={handleDownloadCredentials}
              >
                Download Credentials
              </button>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="h-12 rounded-xl border border-slate-200 bg-white px-12 text-sm font-semibold text-slate-600"
                  onClick={onClose}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="h-12 rounded-xl bg-[#0B4EA2] px-16 text-sm font-semibold text-white"
                  onClick={handlePrintKeyCard}
                >
                  Print Key Card
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="h-12 rounded-xl border border-[#0B4EA2] bg-white px-16 text-sm font-semibold text-[#0B4EA2]"
                onClick={() => {
                  if (step === 1) {
                    onClose()
                    return
                  }
                  setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3 | 4) : prev))
                }}
              >
                Back
              </button>

              <button
                type="button"
                className={[
                  'h-12 rounded-xl px-16 text-sm font-semibold',
                  'bg-[#0B4EA2] text-white',
                ].join(' ')}
                disabled={step === 3 && submittingCheckIn}
                onClick={async () => {
                  if (step === 1) {
                    setStep(2)
                  } else if (step === 2) {
                    setStep(3)
                  } else if (step === 3) {
                    if (onSubmitCheckIn) {
                      try {
                        await onSubmitCheckIn('')
                      } catch (err) {
                        console.error('Check-in submission failed:', err)
                        return
                      }
                    }
                    setStep(4)
                  }
                }}
              >
                {step === 1
                  ? 'Continue to Payment'
                  : step === 2
                    ? 'Continue to complete'
                    : submittingCheckIn
                      ? 'Completing...'
                      : 'Complete Check-In'}
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>

      {/* Assignment Status Alert */}
      <SuccessAlertModal
        open={assignAlertOpen}
        onClose={() => setAssignAlertOpen(false)}
        icon={
          assignAlertVariant === 'success' ? (
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          ) : (
            <AlertCircle className="h-12 w-12 text-rose-600" />
          )
        }
        message={assignAlertMessage}
      />
    </>
  )
}
