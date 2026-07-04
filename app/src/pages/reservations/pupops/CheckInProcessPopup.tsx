import { useEffect, useMemo, useState } from 'react'

import type { ReservationDraft } from '../../../features/reservations/draftSlice'

import { CheckInProcessModal } from '../../../widgets/reservations/CheckInProcessModal/CheckInProcessModal'
import type { Pricing } from '../../../widgets/reservations/CheckInProcessModal/types'

import { getRoomTypeById } from '../../../shared/apis/roomTypesApi'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { checkInPmsReservation, fetchPmsReservationById } from '../../../features/pms/pmsSlice'
import type { PmsCheckInParams } from '../../../shared/apis/PmsReservation'
import type { PmsReservationDetails } from '../../../models/PmsReservation'
import { SuccessAlertModal } from '../../../shared/ui/SuccessAlertModal'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
  reservationId: string | null
}

function isoDateOnly(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad2 = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function reservationToDraft(res: PmsReservationDetails): ReservationDraft {
  return {
    bookingSource: res.channelName ?? '',
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

export function CheckInProcessPopup({ open, onClose, reservationId }: Props) {
  const dispatch = useAppDispatch()
  const pmsSelected = useAppSelector((s) => s.pms.selected)
  const submittingCheckIn = useAppSelector((s) => s.pms.checkInStatus === 'loading')

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
      checkInDate: '2026-03-07',
      checkOutDate: '2026-03-10',
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

    void dispatch(fetchPmsReservationById(reservationId))
  }, [dispatch, open, reservationId])

  useEffect(() => {
    if (!pmsSelected) return

    setDraft((prev) => ({ ...prev, ...reservationToDraft(pmsSelected as any) }))
    const firstRoom = pmsSelected.reservationRooms?.[0]
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
    const totalAmount = pmsSelected?.totalAmount ?? 0
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
    }
  }, [pmsSelected?.totalAmount])

  const companionsText = useMemo(() => {
    const names = pmsSelected?.companions?.map((c: any) => c.fullName).filter(Boolean) ?? []
    return names.length ? names.join(', ') : '-----'
  }, [pmsSelected?.companions])

  const guestsCount = useMemo(() => (pmsSelected ? (pmsSelected.companions?.length ?? 0) + 1 : 0), [pmsSelected])

  const reservationDetails = useMemo(
    () => ({
      reservationId: reservationId ?? '',
      guestName: pmsSelected?.guestName ?? '-----',
      roomTypeName: pmsSelected?.roomTypeName ?? '-----',
      checkInDate: pmsSelected?.checkInDate ?? '',
      checkOutDate: pmsSelected?.checkOutDate ?? '',
      roomView,
      extras: '-----',
      totalAmount: pmsSelected?.totalAmount ?? 0,
      companions: companionsText,
      guestsCount,
    }),
    [companionsText, guestsCount, pmsSelected?.checkInDate, pmsSelected?.checkOutDate, pmsSelected?.guestName, pmsSelected?.roomTypeName, pmsSelected?.totalAmount, reservationId, roomView],
  )

  const onChangeDraft = (patch: Partial<ReservationDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  const onSubmitCheckIn = async (params: PmsCheckInParams) => {
    if (!reservationId) return

    try {
      const res = await dispatch(checkInPmsReservation(params)).unwrap()
      // The fulfilled case in pmsSlice already updates 'selected'
      
      setAlertVariant('success')
      setAlertMessage(`Checked in successfully to Room ${res.roomNumber ?? ''}`.trim())
      setAlertOpen(true)
    } catch (e) {
      const message = typeof e === 'string' ? e : e instanceof Error ? e.message : 'Failed to check in reservation'
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
