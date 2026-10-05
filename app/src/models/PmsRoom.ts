export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance' | string

export interface PmsRoom {
  id: string
  roomNumber: string
  roomTypeId: string
  roomTypeName: string
  floor: number
  status: RoomStatus
  housekeepingStatus?: string
  ownershipType?: 'HotelOwned' | 'OwnerOwned'
  managementType?: 'HotelManaged' | 'OwnerManaged'
  ownerId?: string | null
  ownerName?: string | null
}
