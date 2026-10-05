export type RoomOwnershipType = 'HotelOwned' | 'OwnerOwned'
export type RoomManagementType = 'HotelManaged' | 'OwnerManaged'

export type Room = {
  id: string
  roomNumber: string
  roomTypeId: string
  roomTypeName: string
  floor: number
  status: string | number
  housekeepingStatus?: string
  ownershipType?: RoomOwnershipType
  managementType?: RoomManagementType
  ownerId?: string | null
  ownerName?: string | null
}

export interface RoomAvailability {
  roomId: string
  roomNumber: string
  roomTypeId: string
  roomTypeName: string
  basePrice: number
}


