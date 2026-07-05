import { useEffect, useMemo, useState } from 'react'

import type { ReservationDraft } from '../../../features/reservations/draftSlice'

import { CheckInProcessModal } from '../../../widgets/reservations/CheckInProcessModal/CheckInProcessModal'
import type { Pricing } from '../../../widgets/reservations/CheckInProcessModal/types'

import { getRoomTypeById } from '../../../shared/apis/roomTypesApi'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { fetchLocalReservationById } from '../../../features/localReservations/localReservationsSlice'
import { checkInRoom } from '../../../features/ops/opsSlice'
import { fetchRooms } from '../../../features/rooms/roomsSlice'
import type { LocalReservation } from '../../../models/LocalReservation'
import { SuccessAlertModal } from '../../../shared/ui/SuccessAlertModal'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

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
  const [selectedRoomId, setSelectedRoomId] = useState('')

  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertVariant, setAlertVariant] = useState<'success' | 'error'>('success')

  const [draft, setDraft] = useState<ReservationDraft>(staticDraft)

  useEffect(() => {
    if (!open || !reservationId) return

    setRoomView('-----')
    setDraft(staticDraft)
    setSelectedRoomId('')
    setAlertOpen(false)
    setAlertMessage('')
    setAlertVariant('success')

    void dispatch(fetchLocalReservationById(reservationId))
    void dispatch(fetchRooms())
  }, [dispatch, open, reservationId])


  useEffect(() => {
    if (!pmsSelected) return

    setDraft((prev) => ({ ...prev, ...reservationToDraft(pmsSelected as any) }))
    const firstRoom = (pmsSelected as any).reservationRooms?.[0]
    setSelectedRoomId(firstRoom?.roomId ?? '')
    
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
    const totalAmount = pmsSelected?.finance?.grandTotal ?? 0
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
      currency: pmsSelected?.finance?.currency ?? '$',
    }
  }, [pmsSelected?.finance?.grandTotal, pmsSelected?.finance?.currency])

  const companionsText = useMemo(() => {
    const names = pmsSelected?.companions?.map((c: any) => c.fullName).filter(Boolean) ?? []
    return names.length ? names.join(', ') : '-----'
  }, [pmsSelected?.companions])

  const guestsCount = useMemo(() => (pmsSelected ? (pmsSelected.companions?.length ?? 0) + 1 : 0), [pmsSelected])

  const reservationDetails = useMemo(
    () => ({
      reservationId: reservationId ?? '',
      reservationRoomId: pmsSelected?.reservationRoomIds?.[0] ?? pmsSelected?.reservationRooms?.[0]?.reservationRoomId ?? (pmsSelected?.reservationRooms?.[0] as any)?.id ?? reservationId ?? '',
      guestName: pmsSelected?.guest?.fullName ?? pmsSelected?.guest?.firstName ?? '-----',
      roomTypeId: pmsSelected?.reservationRooms?.[0]?.roomTypeId ?? '',
      roomTypeName: pmsSelected?.roomTypeName ?? '-----',
      roomNumber: pmsSelected?.roomNumber ?? (pmsSelected?.reservationRooms?.[0]?.roomId ? roomsList.find((r) => r.id === pmsSelected.reservationRooms![0].roomId)?.roomNumber : null) ?? null,
      checkInDate: pmsSelected?.checkInDate ?? '',
      checkOutDate: pmsSelected?.checkOutDate ?? '',
      roomView,
      extras: '-----',
      totalAmount: pmsSelected?.finance?.grandTotal ?? 0,
      companions: companionsText,
      guestsCount,
    }),
    [companionsText, guestsCount, pmsSelected, reservationId, roomView, roomsList],
  )

  const onChangeDraft = (patch: Partial<ReservationDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  const onSubmitCheckIn = async (notes: string = '') => {
    if (!reservationId || !reservationDetails.reservationRoomId) return

    try {
      await dispatch(checkInRoom({ reservationRoomId: reservationDetails.reservationRoomId, notes })).unwrap()
      
      setAlertVariant('success')
      setAlertMessage(`Checked in successfully to Room ${reservationDetails.roomNumber ?? ''}`.trim())
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

  return (
    <>
      <CheckInProcessModal
        open={open}
        onClose={onClose}
        value={draft}
        onChange={onChangeDraft}
        pricing={pricing}
        reservationDetails={reservationDetails}
        selectedRoomId={selectedRoomId}
        onChangeSelectedRoomId={setSelectedRoomId}
        onSubmitCheckIn={onSubmitCheckIn}
        submittingCheckIn={submittingCheckIn}
      />

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
