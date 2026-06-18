export interface OptionalReservation {
  id: string
  guestName: string
  email: string
  expectedCheckIn: string
  expectedCheckOut: string
  totalAmount: number
  expirationDate: string
}

export interface CreateOptionalReservationRequest {
  guestName: string
  email: string
  expectedCheckIn: string
  expectedCheckOut: string
  totalAmount: number
  expirationDate: string
}
