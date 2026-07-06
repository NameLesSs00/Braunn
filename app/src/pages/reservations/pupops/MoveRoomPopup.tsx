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

  const reservation = useMemo(() => {
    if (!reservationId) return null
    return pmsReservations.find((r) => r.id === reservationId) || null
  }, [reservationId, pmsReservations])

  return (
    <MoveRoomModal
      open={open}
      onClose={onClose}
      reservation={reservation}
    />
  )
}
