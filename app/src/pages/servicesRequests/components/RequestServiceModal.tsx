import { useState, useEffect, useMemo, useRef } from 'react'
import { X, Search, ChevronDown, CheckCircle, XCircle } from 'lucide-react'
import { Service } from '../shared'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { fetchPmsInHouseReservations, addPmsReservationService } from '../../../features/pms/pmsSlice'

type Props = {
  open: boolean
  onClose: () => void
  service: Service | null
  onSubmit: (data: { roomNumber: string; notes: string; service: Service }) => void
}

function formatDateTime(): string {
  return new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getCurrentDateTimeString(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function RequestServiceModal({ open, onClose, service, onSubmit }: Props) {
  const [roomNumber, setRoomNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [serviceDate, setServiceDate] = useState(getCurrentDateTimeString())
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [statusModal, setStatusModal] = useState<{
    show: boolean
    type: 'success' | 'error'
    title: string
    message: string
    details?: any
  } | null>(null)

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const dispatch = useAppDispatch()
  const inHouseReservations = useAppSelector((state) => state.pms.inHouseReservations)
  const inHouseStatus = useAppSelector((state) => state.pms.inHouseStatus)

  useEffect(() => {
    if (open && inHouseStatus === 'idle') {
      dispatch(fetchPmsInHouseReservations())
    }
  }, [open, inHouseStatus, dispatch])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const roomNumbers = useMemo(() => {
    const list = inHouseReservations
      .map((r) => r.roomNumber)
      .filter((room): room is string => typeof room === 'string' && room.trim() !== '')
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  }, [inHouseReservations])

  const filteredRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return roomNumbers
    return roomNumbers.filter((r) => r.toLowerCase().includes(q))
  }, [roomNumbers, searchQuery])

  const selectedReservation = useMemo(() => {
    return inHouseReservations.find((r) => r.roomNumber === roomNumber)
  }, [inHouseReservations, roomNumber])

  const handleSelectRoom = (room: string) => {
    setRoomNumber(room)
    setErrors((prev) => ({ ...prev, roomNumber: '' }))
    setDropdownOpen(false)
    setSearchQuery('')
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (statusModal) {
          if (statusModal.type === 'success') handleClose()
          else setStatusModal(null)
        } else {
          handleClose()
        }
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [statusModal, open])

  if (!open || !service) return null

  if (statusModal) {
    const isSuccess = statusModal.type === 'success'
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onMouseDown={() => {
        if (isSuccess) handleClose()
        else setStatusModal(null)
      }}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10" onMouseDown={(e) => e.stopPropagation()}>
          <div className="w-[400px] max-w-full overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className={[
              'flex items-center justify-between px-6 py-4 text-white',
              isSuccess ? 'bg-[#107038]' : 'bg-rose-600'
            ].join(' ')}>
              <div>
                <h2 className="text-base font-bold">{statusModal.title}</h2>
                <p className="mt-0.5 text-[12px] opacity-80">
                  {isSuccess ? 'Transaction completed successfully' : 'Transaction rejected by server'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isSuccess) {
                    handleClose()
                  } else {
                    setStatusModal(null)
                  }
                }}
                className="grid h-8 w-8 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 p-6">
              <div className={[
                'flex items-start gap-3 rounded-xl border p-4',
                isSuccess ? 'bg-[#E8F9EE] border-[#D1F0DB]' : 'bg-rose-50 border-rose-100'
              ].join(' ')}>
                <div className={[
                  'grid h-10 w-10 shrink-0 place-items-center rounded-full',
                  isSuccess ? 'bg-[#D1F0DB] text-[#107038]' : 'bg-rose-100 text-rose-700'
                ].join(' ')}>
                  {isSuccess ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <XCircle className="h-6 w-6" />
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">Status Details</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{statusModal.message}</p>
                </div>
              </div>

              {!isSuccess && selectedReservation && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                  <h5 className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Stay Period Context</h5>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="block text-slate-500 font-medium">Check-in Date</span>
                      <span className="font-bold text-slate-800">{new Date(selectedReservation.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 font-medium">Check-out Date</span>
                      <span className="font-bold text-slate-800">{new Date(selectedReservation.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              )}

              {statusModal.details && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Response Payload</label>
                  <div className="rounded-xl bg-slate-900 p-4 text-[11px] font-mono text-emerald-400 max-h-60 overflow-y-auto custom-scrollbar shadow-inner border border-slate-800">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(statusModal.details, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50">
              <button
                type="button"
                onClick={handleClose}
                className={[
                  'h-10 rounded-xl px-6 text-sm font-semibold text-white transition-colors',
                  isSuccess ? 'bg-[#107038] hover:bg-[#0c592c]' : 'bg-rose-600 hover:bg-rose-700'
                ].join(' ')}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  async function handleSubmit() {
    const e: Record<string, string> = {}
    if (!roomNumber.trim()) e.roomNumber = 'Room Number is required'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    if (!selectedReservation) {
      setStatusModal({
        show: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Selected room number is not associated with an active reservation.'
      })
      return
    }

    setSubmitting(true)
    try {
      const formattedDate = new Date(serviceDate).toISOString()
      const res = await dispatch(addPmsReservationService({
        id: selectedReservation.reservationId,
        params: {
          reservationId: selectedReservation.reservationId,
          additionalServiceId: service!.id,
          quantity: quantity,
          serviceDate: formattedDate
        }
      })).unwrap()

      setStatusModal({
        show: true,
        type: 'success',
        title: 'Request Posted Successfully',
        message: 'The financial service request has been processed and saved.',
        details: res
      })

      onSubmit({ roomNumber: roomNumber.trim(), notes: '', service: service! })
    } catch (err: any) {
      console.error(err)
      setStatusModal({
        show: true,
        type: 'error',
        title: 'Request Failed',
        message: err || 'An unexpected error occurred while processing the request.',
        details: err
      })
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    onClose()
    setRoomNumber('')
    setNotes('')
    setQuantity(1)
    setErrors({})
    setStatusModal(null)
    setServiceDate(getCurrentDateTimeString())
  }

  const inputClass = errors.roomNumber
    ? 'h-11 w-full rounded-xl border border-red-400 bg-white px-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-red-200'
    : 'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onMouseDown={handleClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10" onMouseDown={(e) => e.stopPropagation()}>
        <div className="w-[480px] max-w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between bg-[#0B4EA2] px-6 py-4">
            <div>
              <h2 className="text-base font-bold text-white">Request service</h2>
              <p className="mt-0.5 text-[12px] text-blue-200">{service.name}</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="grid h-8 w-8 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-5 px-6 py-5">
            {/* Room Number */}
            <div className="relative animate-none" ref={dropdownRef}>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                Room Number <span className="text-red-500">*</span>
              </label>
              
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={[
                  'flex h-11 w-full items-center justify-between rounded-xl border bg-white px-4 text-sm outline-none transition-all',
                  errors.roomNumber
                    ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                    : 'border-slate-200 focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10',
                  roomNumber ? 'text-slate-700 font-medium' : 'text-slate-400'
                ].join(' ')}
              >
                <span>{roomNumber || 'Select Room Number'}</span>
                <ChevronDown className={['h-4 w-4 text-slate-400 transition-transform duration-200', dropdownOpen ? 'rotate-180' : ''].join(' ')} />
              </button>

              {errors.roomNumber && (
                <p className="mt-1 text-[11px] text-red-500">{errors.roomNumber}</p>
              )}

              {dropdownOpen && (
                <div className="absolute left-0 right-0 z-50 mt-1 rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Search box inside dropdown */}
                  <div className="relative mb-2">
                    <input
                      type="text"
                      placeholder="Search room..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-[#F8FAFC] pl-8 pr-3 text-xs text-slate-700 outline-none focus:border-[#0B4EA2] transition-colors"
                      autoFocus
                    />
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  </div>

                  {/* Scrollable list */}
                  <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-0.5">
                    {filteredRooms.length === 0 ? (
                      <div className="py-3 text-center text-xs text-slate-400">No rooms found</div>
                    ) : (
                      filteredRooms.map((room) => (
                        <button
                          key={room}
                          type="button"
                          onClick={() => handleSelectRoom(room)}
                          className={[
                            'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors',
                            roomNumber === room
                              ? 'bg-[#EAF2FF] text-[#0B4EA2]'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          ].join(' ')}
                        >
                          <span>Room {room}</span>
                          {roomNumber === room && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#0B4EA2]" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Department & Price info card */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#0B4EA2]">Department</span>
                <span className="text-[13px] font-semibold text-[#0B4EA2]">{service.department}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#0B4EA2]">Price</span>
                <span className="text-[16px] font-bold text-[#0B4EA2]">${service.price}</span>
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Date &amp; Time</label>
              <input
                type="datetime-local"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
              />
              <p className="mt-1 text-[11px] text-slate-400">Specify the desired date and time for the service request</p>
            </div>

            {/* Quantity */}
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Quantity</label>
              <div className="flex h-11 w-32 items-center justify-between rounded-xl border border-slate-200 bg-white px-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 text-lg font-medium"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 text-center text-sm font-bold text-[#0B4EA2] outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 text-lg font-medium"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
            <button
              type="button"
              onClick={handleClose}
              className="h-10 rounded-xl border border-slate-200 px-6 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="h-10 rounded-xl bg-[#0B4EA2] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0a3f85] disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
