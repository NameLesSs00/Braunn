export type Room = {
  id: string
  roomNumber: string
  roomTypeId: string
  roomTypeName: string
  floor: number
  status: number
}

export interface RoomAvailability {
  roomId: string
  roomNumber: string
  roomTypeId: string
  roomTypeName: string
  basePrice: number
}


