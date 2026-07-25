export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance' | string

export interface PmsRoom {
  id: string
  roomNumber: string
  roomTypeId: string
  roomTypeName: string
  floor: number
  status: RoomStatus
}
