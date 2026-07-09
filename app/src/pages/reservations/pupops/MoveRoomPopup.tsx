import { useMemo } from 'react'

import { useAppSelector } from '../../../shared/apis/hooks'
import { MoveRoomModal } from '../../../widgets/reservations/MoveRoomModal/MoveRoomModal'

type Props = {
  open: boolean
  onClose: () => void
  reservationId: string | null
}

export function MoveRoomPopup({ open, onClose, reservationId }: Props) {
  const pmsReservations = useAppSelector((s) => s.pms.reservations)
  const reservationsTableRows = useAppSelector((s) => s.pms.reservationsTableRows)
  const inHouseListRows = useAppSelector((s) => s.pms.inHouseListRows)
  const roomAllocationRows = useAppSelector((s) => s.pms.roomAllocationRows)
  const inHouseReservations = useAppSelector((s) => s.pms.inHouseReservations)

  const reservation = useMemo(() => {
    if (!reservationId) return null
    const reservation = [
      ...reservationsTableRows,
      ...inHouseListRows,
      ...roomAllocationRows,
      ...pmsReservations,
    ].find((r) => r.id === reservationId)
    if (reservation) return reservation

    const inHouseReservation = inHouseReservations.find((r) => r.reservationId === reservationId)
    if (!inHouseReservation) return null

    return {
      id: inHouseReservation.reservationId,
      guestName: inHouseReservation.guestFullName,
      roomNumber: inHouseReservation.roomNumber,
      roomTypeName: inHouseReservation.roomTypeName,
      checkInDate: inHouseReservation.checkInDate,
      checkOutDate: inHouseReservation.checkOutDate,
      status: inHouseReservation.status,
      totalAmount: inHouseReservation.remainingBalance,
      paidAmount: 0,
      channelName: null,
    }
  }, [
    reservationId,
    reservationsTableRows,
    inHouseListRows,
    roomAllocationRows,
    pmsReservations,
    inHouseReservations,
  ])

  return (
    <MoveRoomModal
      open={open}
      onClose={onClose}
      reservation={reservation}
    />
  )
}
