export type ReservationCompanion = {
  id: string
  fullName: string
  nationalId: string
}

export type Reservation = {
  id: string
  guestId: string
  guestName: string
  roomId: string
  roomNumber: string
  roomTypeId: string
  roomTypeName: string
  checkInDate: string
  checkOutDate: string
  status: number
  baseRateAtBooking: number
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  createdAt: string
  companions: ReservationCompanion[]
}

export type CreateReservationRequest = Record<string, unknown>
