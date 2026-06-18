export type HousekeepingRoom = {
  roomId: string
  roomNumber: string
  floor: number
  roomTypeName: string
  housekeepingStatus: string
}

export type GetHousekeepingRoomsParams = {
  status?: number | string
  floor?: number
  roomTypeId?: string
}

export type ChangeHousekeepingStatusRequest = {
  roomId: string
  status: number | string
}
