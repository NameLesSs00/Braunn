import { HousekeepingStatus } from './PmsRoom'

export { HousekeepingStatus }

export type HousekeepingRoom = {
  roomId: string
  roomNumber: string
  floor: number
  roomTypeName: string
  housekeepingStatus: HousekeepingStatus | string | number
}

export type GetHousekeepingRoomsParams = {
  status?: HousekeepingStatus | number | string
  floor?: number
  roomTypeId?: string
}

export type ChangeHousekeepingStatusRequest = {
  roomId: string
  status: HousekeepingStatus | number | string
}
