import { HousekeepingStatus } from './PmsRoom'

export type RoomOwnershipType = 'HotelOwned' | 'OwnerOwned'
export type RoomManagementType = 'HotelManaged' | 'OwnerManaged'

export type Room = {
  id: string
  roomNumber: string
  roomTypeId: string
  roomTypeName: string
  floor: number
  status: string | number
  housekeepingStatus?: HousekeepingStatus
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
  calculatedStatus?: string
  housekeepingStatus?: HousekeepingStatus | string
  isAssignable?: boolean
  isAvailableForStay?: boolean
  isReadyNow?: boolean
  operationalStatus?: string
  readinessReason?: string | null
  inventoryStatus?: string
  warnings?: string[]
}


