import { useEffect, useMemo, useState } from 'react'

import type { ReservationDraft } from '../../../features/reservations/draftSlice'

import { CheckInProcessModal } from '../../../widgets/reservations/CheckInProcessModal/CheckInProcessModal'
import type { Pricing } from '../../../widgets/reservations/CheckInProcessModal/types'

import { getRoomTypeById } from '../../../shared/apis/roomTypesApi'
import { getPmsReservationFolio } from '../../../shared/apis/PmsReservation'
import { getRoomsAvailability } from '../../../shared/apis/roomsApi'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { fetchLocalReservationById } from '../../../features/localReservations/localReservationsSlice'
import { checkInRoom } from '../../../features/ops/opsSlice'
import { fetchRooms } from '../../../features/rooms/roomsSlice'
import type { LocalReservation } from '../../../models/LocalReservation'
import type { PmsReservationFolio } from '../../../models/PmsReservation'
import type { RoomAvailability } from '../../../models/Room'
import { Modal } from '../../../shared/ui/Modal'
import { SuccessAlertModal } from '../../../shared/ui/SuccessAlertModal'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
  reservationId: string | null
  onSuccess?: () => void
}

function isoDateOnly(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad2 = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function reservationToDraft(res: LocalReservation): ReservationDraft {
  return {
    bookingSource: res.channelSource ?? '',
    isGroupReservation: false,
    firstName: res.guest?.firstName ?? '',
    surName: res.guest?.lastName ?? '',
    dateOfBirth: res.guest?.dateOfBirth ?? '',
    language: '',
    email: res.guest?.email ?? '',
    phone: res.guest?.phone ?? '',
    nationality: res.guest?.nationality ?? '',
    idNumber: res.guest?.idNumber ?? '',
    notes: '',
    checkInDate: isoDateOnly(res.checkInDate),
    checkOutDate: isoDateOnly(res.checkOutDate),
    nights: '',
    adultCount: 1,
    childCount: 0,
    infantCount: 0,
    rooms: [
      {
        id: 0,
        roomTypeId: '',
        roomType: res.roomTypeName ?? '',
        roomView: '',
        roomCount: 1,
        roomNumber: res.roomNumber ?? '',
      },
    ],
    discountType: 'none',
    discountPercentage: '',
    discountFixed: '',
    discountComment: '',
    rateCode: '',
    ratePlan: '',
    extras: [],
    specialRequests: '',
    depositAmountReceived: '',
    paymentMethod: '',
    paidAmount: String(res.finance?.paidAmount ?? 0),
    coupon: '',
    otherPayments: [],
  } as unknown as ReservationDraft
}

function viewTypeLabel(viewType?: number) {
  if (viewType === 0) return 'SeaView'
  if (viewType === 1) return 'CityView'
  return '-----'
}

function normalizeStatus(value?: string | null) {
  return (value || '').replace(/[\s_-]/g, '').toLowerCase()
}

function hasAssignedReservationRoom(room: any, roomsList: Array<{ id: string; roomNumber: string }>) {
  return Boolean(
    room?.roomId ||
    (room?.roomNumber && room.roomNumber !== 'N/A') ||
    (room?.roomId && roomsList.some((item) => item.id === room.roomId)),
  )
}

function dateOnly(value?: string | null) {
  return value ? value.replace('T', ' ').split(' ')[0] : ''
}

export function CheckInProcessPopup({ open, onClose, reservationId, onSuccess }: Props) {
  const dispatch = useAppDispatch()
  const pmsSelected = useAppSelector((s) => s.localReservations.selected)
  const roomsList = useAppSelector((s) => s.rooms.items)
  const submittingCheckIn = useAppSelector((s) => s.ops.status === 'loading')

  const staticDraft = useMemo<ReservationDraft>(
    () => ({
      bookingSource: '',
      isGroupReservation: false,
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '',
      language: '',
      email: '',
      phone: '',
      nationality: '',
      idNumber: '',
      notes: '',
      checkInDate: isoDateOnly(new Date().toISOString()),
      checkOutDate: isoDateOnly(new Date(Date.now() + 86400000).toISOString()),
      nights: '',
      adultCount: 1,
      childCount: 0,
      infantCount: 0,
      rooms: [{ id: 0, roomTypeId: '', roomType: 'double', roomView: 'Garden view', roomCount: 1, roomNumber: '104' }],
      discountType: 'none',
      discountPercentage: '',
      discountFixed: '',
      discountComment: '',
      rateCode: '',
      ratePlan: '',
      extras: [],
      specialRequests: '',
      depositAmountReceived: '',
      paymentMethod: '',
      paidAmount: '0',
      coupon: '',
      otherPayments: [],
    } as unknown as ReservationDraft),
    [],
  )


  const [roomView, setRoomView] = useState('-----')

  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertVariant, setAlertVariant] = useState<'success' | 'error'>('success')
  const [folio, setFolio] = useState<PmsReservationFolio | null>(null)
  const [folioLoading, setFolioLoading] = useState(false)
  const [roomAvailabilityByReservationRoom, setRoomAvailabilityByReservationRoom] = useState<Record<string, RoomAvailability[]>>({})

  const [draft, setDraft] = useState<ReservationDraft>(staticDraft)

  useEffect(() => {
    if (!open || !reservationId) return

    let cancelled = false
    setRoomView('-----')
    setDraft(staticDraft)
    setAlertOpen(false)
    setAlertMessage('')
    setAlertVariant('success')
    setFolio(null)
    setRoomAvailabilityByReservationRoom({})
    setFolioLoading(true)

    void dispatch(fetchRooms())

    async function loadFolioFirst() {
      try {
        const folioResponse = await getPmsReservationFolio(reservationId)
        if (cancelled) return
        setFolio(folioResponse)

        const availabilityEntries = await Promise.all((folioResponse.reservationRooms ?? []).map(async (room) => {
          if (!room.reservationRoomId || !room.roomTypeId) return [room.reservationRoomId, []] as const
          const rooms = await getRoomsAvailability({
            StartDate: dateOnly(room.checkInDate || folioResponse.checkInDate),
            EndDate: dateOnly(room.checkOutDate || folioResponse.checkOutDate),
            RoomTypeId: room.roomTypeId,
          })
          return [room.reservationRoomId, rooms] as const
        }))
        if (!cancelled) {
          setRoomAvailabilityByReservationRoom(Object.fromEntries(availabilityEntries))
        }
        await dispatch(fetchLocalReservationById(reservationId)).unwrap()
      } catch (e) {
        if (!cancelled) {
          setAlertVariant('error')
          setAlertMessage(e instanceof Error ? e.message : 'Could not load reservation folio.')
          setAlertOpen(true)
        }
      } finally {
        if (!cancelled) {
          setFolioLoading(false)
        }
      }
    }

    void loadFolioFirst()

    return () => {
      cancelled = true
    }
  }, [dispatch, open, reservationId, staticDraft])


  useEffect(() => {
    if (!pmsSelected) return

    setDraft((prev) => ({ ...prev, ...reservationToDraft(pmsSelected as any) }))
    const firstRoom = (pmsSelected as any).reservationRooms?.[0]
    
    if (firstRoom?.roomTypeId) {
      void getRoomTypeById(firstRoom.roomTypeId)
        .then((rt) => {
          setRoomView(viewTypeLabel(rt.viewType))
          setDraft((prev) => ({
            ...prev,
            rooms: prev.rooms.map((r, idx) => (idx === 0 ? { ...r, roomView: viewTypeLabel(rt.viewType) } : r)),
          }))
        })
        .catch(() => setRoomView('-----'))
    }
  }, [pmsSelected])

  const pricing = useMemo<Pricing>(() => {
    const totalAmount = folio?.grandTotal ?? pmsSelected?.finance?.grandTotal ?? 0
    return {
      baseTotal: totalAmount,
      extraAdultTotal: 0,
      adultTotal: totalAmount,
      childTotal: 0,
      infantTotal: 0,
      extrasTotal: 0,
      mealPlansTotal: 0,
      subtotal: totalAmount,
      taxesAmount: 0,
      discountValue: 0,
      totalAmount,
      requiredDeposit: 0,
      currency: folio?.currency ?? pmsSelected?.finance?.currency ?? '$',
    }
  }, [folio?.currency, folio?.grandTotal, pmsSelected?.finance?.grandTotal, pmsSelected?.finance?.currency])

  const companionsText = useMemo(() => {
    const names = pmsSelected?.companions?.map((c: any) => c.fullName).filter(Boolean) ?? []
    return names.length ? names.join(', ') : '-----'
  }, [pmsSelected?.companions])

  const guestsCount = useMemo(() => (pmsSelected ? (pmsSelected.companions?.length ?? 0) + 1 : 0), [pmsSelected])

  const reservationRooms = useMemo(
    () => ((folio?.reservationRooms?.length ? folio.reservationRooms : (pmsSelected as any)?.reservationRooms) ?? []) as any[],
    [folio?.reservationRooms, pmsSelected],
  )

  const missingAssignedRooms = useMemo(
    () => reservationRooms.filter((room) => !hasAssignedReservationRoom(room, roomsList)),
    [reservationRooms, roomsList],
  )

  const checkInTargets = useMemo(() => {
    if (reservationRooms.length > 0) {
      return reservationRooms
        .filter((room) => hasAssignedReservationRoom(room, roomsList))
        .filter((room) => normalizeStatus(room.status) !== 'checkedin' && normalizeStatus(room.status) !== 'inhouse')
        .map((room) => room.reservationRoomId)
        .filter(Boolean)
    }
    const firstRoomId = pmsSelected?.reservationRoomIds?.[0] ?? (pmsSelected as any)?.reservationRooms?.[0]?.reservationRoomId ?? (pmsSelected as any)?.reservationRooms?.[0]?.id
    return firstRoomId ? [firstRoomId] : []
  }, [pmsSelected, reservationRooms, roomsList])

  const roomAssignmentRows = useMemo(
    () => reservationRooms.map((room) => ({
      reservationRoomId: room.reservationRoomId,
      roomTypeId: room.roomTypeId ?? '',
      roomTypeName: room.roomTypeName ?? folio?.roomTypeName ?? pmsSelected?.roomTypeName ?? 'Room',
      roomId: room.roomId ?? null,
      roomNumber: room.roomNumber ?? null,
      checkInDate: room.checkInDate ?? folio?.checkInDate ?? pmsSelected?.checkInDate ?? '',
      checkOutDate: room.checkOutDate ?? folio?.checkOutDate ?? pmsSelected?.checkOutDate ?? '',
      adults: room.adults,
      children: room.children,
      status: room.status,
    })),
    [folio?.checkInDate, folio?.checkOutDate, folio?.roomTypeName, pmsSelected?.checkInDate, pmsSelected?.checkOutDate, pmsSelected?.roomTypeName, reservationRooms],
  )

  const checkInBlockedReason = useMemo(() => {
    if (reservationRooms.length === 0) return undefined
    if (missingAssignedRooms.length > 0) {
      return `Assign all required rooms before check-in. Missing ${missingAssignedRooms.length} of ${reservationRooms.length}.`
    }
    if (checkInTargets.length === 0) return 'All reservation rooms are already checked in.'
    return undefined
  }, [checkInTargets.length, missingAssignedRooms.length, reservationRooms.length])

  const reservationDetails = useMemo(
    () => ({
      reservationId: reservationId ?? '',
      reservationRoomId: folio?.reservationRooms?.[0]?.reservationRoomId ?? pmsSelected?.reservationRoomIds?.[0] ?? pmsSelected?.reservationRooms?.[0]?.reservationRoomId ?? (pmsSelected?.reservationRooms?.[0] as any)?.id ?? reservationId ?? '',
      guestName: folio?.guestName ?? pmsSelected?.guest?.fullName ?? pmsSelected?.guest?.firstName ?? '-----',
      roomTypeId: folio?.reservationRooms?.[0]?.roomTypeId ?? pmsSelected?.reservationRooms?.[0]?.roomTypeId ?? '',
      roomTypeName: folio?.roomTypeName ?? pmsSelected?.roomTypeName ?? '-----',
      roomNumber: folio?.roomNumber ?? pmsSelected?.roomNumber ?? (pmsSelected?.reservationRooms?.[0]?.roomId ? roomsList.find((r) => r.id === pmsSelected.reservationRooms![0].roomId)?.roomNumber : null) ?? null,
      checkInDate: folio?.checkInDate ?? pmsSelected?.checkInDate ?? '',
      checkOutDate: folio?.checkOutDate ?? pmsSelected?.checkOutDate ?? '',
      roomView,
      extras: '-----',
      totalAmount: folio?.grandTotal ?? pmsSelected?.finance?.grandTotal ?? 0,
      companions: companionsText,
      guestsCount,
    }),
    [companionsText, folio, guestsCount, pmsSelected, reservationId, roomView, roomsList],
  )

  const onChangeDraft = (patch: Partial<ReservationDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  const onSubmitCheckIn = async (notes: string = '') => {
    if (!reservationId || checkInTargets.length === 0) return
    if (checkInBlockedReason) {
      setAlertVariant('error')
      setAlertMessage(checkInBlockedReason)
      setAlertOpen(true)
      throw new Error(checkInBlockedReason)
    }

    try {
      for (const reservationRoomId of checkInTargets) {
        await dispatch(checkInRoom({ reservationRoomId, notes })).unwrap()
      }
      
      setAlertVariant('success')
      setAlertMessage(checkInTargets.length > 1 ? `Checked in ${checkInTargets.length} rooms successfully.` : `Checked in successfully to Room ${reservationDetails.roomNumber ?? ''}`.trim())
      setAlertOpen(true)
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (e) {
      const message = typeof e === 'string' ? e : e instanceof Error ? e.message : 'Failed to check in room'
      setAlertVariant('error')
      setAlertMessage(message)
      setAlertOpen(true)
      throw e
    }
  }

  const loadingCheckInData = open && Boolean(reservationId) && (folioLoading || (!folio && !alertOpen))

  return (
    <>
      {loadingCheckInData ? (
        <Modal open={open} onClose={onClose}>
          <div className="flex h-[420px] w-[min(720px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between bg-[#0B4EA2] px-8 py-5">
              <div>
                <div className="text-lg font-semibold text-white">Check-In Process</div>
                <div className="mt-1 text-sm text-white/80">Loading reservation room data</div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-full text-white/90 hover:bg-white/10"
                aria-label="Close"
              >
                <span className="text-2xl leading-none">x</span>
              </button>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-[#0B4EA2]" />
              <div className="mt-5 text-base font-bold text-slate-800">Loading check-in data...</div>
              <div className="mt-2 max-w-md text-sm font-medium text-slate-500">
                Fetching the folio, required rooms, and available room assignments.
              </div>
            </div>
          </div>
        </Modal>
      ) : (
        <CheckInProcessModal
          open={open}
          onClose={onClose}
          value={draft}
          onChange={onChangeDraft}
          pricing={pricing}
          reservationDetails={reservationDetails}
          onRoomAssigned={async () => {
            if (!reservationId) return
            setFolioLoading(true)
            try {
              const folioResponse = await getPmsReservationFolio(reservationId)
              setFolio(folioResponse)
              const availabilityEntries = await Promise.all((folioResponse.reservationRooms ?? []).map(async (room) => {
                if (!room.reservationRoomId || !room.roomTypeId) return [room.reservationRoomId, []] as const
                const rooms = await getRoomsAvailability({
                  StartDate: dateOnly(room.checkInDate || folioResponse.checkInDate),
                  EndDate: dateOnly(room.checkOutDate || folioResponse.checkOutDate),
                  RoomTypeId: room.roomTypeId,
                })
                return [room.reservationRoomId, rooms] as const
              }))
              setRoomAvailabilityByReservationRoom(Object.fromEntries(availabilityEntries))
              await dispatch(fetchLocalReservationById(reservationId)).unwrap()
            } catch (e) {
              setAlertVariant('error')
              setAlertMessage(e instanceof Error ? e.message : 'Could not refresh reservation room data.')
              setAlertOpen(true)
            } finally {
              setFolioLoading(false)
            }
          }}
          onSubmitCheckIn={onSubmitCheckIn}
          submittingCheckIn={submittingCheckIn}
          checkInBlockedReason={checkInBlockedReason}
          roomAssignmentRows={roomAssignmentRows}
          roomAvailabilityByReservationRoom={roomAvailabilityByReservationRoom}
          loadingRoomAssignments={folioLoading}
        />
      )}

      <SuccessAlertModal
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        icon={
          alertVariant === 'success' ? (
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          ) : (
            <AlertCircle className="h-12 w-12 text-rose-600" />
          )
        }
        message={alertMessage}
      />
    </>
  )
}
