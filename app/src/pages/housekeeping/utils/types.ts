/**
 * Types for Housekeeping page components
 */

export type RoomStatus = 'Clean' | 'Dirty' | 'In Progress' | 'Maintenance'

export type Room = {
  id: string
  number: string
  type: string
  floor: number
  status: RoomStatus
  capacity: number | string
  rate: number | string
}



export type TabKey = 'roomStatus' | 'lostItems'
export type StatusFilter = 'All Rooms' | 'Clean' | 'Dirty' | 'In Progress'
