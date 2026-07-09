export type RoomPlanReservationStatus =
  | 'Reserved'
  | 'Confirmed'
  | 'CheckedIn'
  | 'CheckedOut'
  | 'Completed'
  | 'Cancelled'
  | 'Tentative'
  | 'Definite'

export type RoomPlanPaymentStatus = 'Pending' | 'Partial' | 'Paid'

export type RoomPlanRoomStatus =
  | 'Available'
  | 'Confirmed'
  | 'CheckedIn'
  | 'Dirty'
  | 'Cleaning'
  | 'Maintenance'

export type RoomPlanBookingType = 'Direct' | 'OTA' | 'Corporate'

export interface RoomPlanSummary {
  totalRooms: number
  availableRooms: number
  reservedRooms: number
  occupiedRooms: number
  maintenanceRooms: number
}

export interface RoomPlanDay {
  date: string
  status: string | null
  reservationId: string | null
  reservationRoomId: string | null
  guestName: string | null
  checkInDate: string | null
  checkOutDate: string | null
  reservationStatus: RoomPlanReservationStatus | null
  reservationRoomStatus: RoomPlanReservationStatus | null
  paymentStatus: RoomPlanPaymentStatus | null
  balance: number | null
  isStart: boolean
  isEnd: boolean
}

export interface RoomPlanBlock {
  reservationId: string
  reservationRoomId: string
  guestName: string | null
  status: string | null
  checkInDate: string
  checkOutDate: string
  startDate: string
  endDate: string
  displayText: string | null
}

export interface RoomPlanRoom {
  roomId: string
  roomNumber: string | null
  roomTypeId: string
  roomTypeName: string | null
  floor: string | null
  currentRoomStatus: string | null
  housekeepingStatus: string | null
  days: RoomPlanDay[] | null
  blocks: RoomPlanBlock[] | null
}

export interface RoomPlanResponse {
  from: string
  to: string
  days: string[] | null
  summary: RoomPlanSummary
  rooms: RoomPlanRoom[] | null
}

export interface GetRoomPlanParams {
  from?: string
  to?: string
  date?: string
  roomTypeId?: string
  floor?: string
  roomStatus?: RoomPlanRoomStatus
  reservationStatus?: RoomPlanReservationStatus
  bookingType?: RoomPlanBookingType
}
