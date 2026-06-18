export type RoomType = {
  id: string
  name: string
  maxGuests: number
  viewType: number
  basePrice: number
}

export type CreateRoomTypeRequest = Omit<RoomType, 'id'>

export type UpdateRoomTypeRequest = RoomType
