/**
 * Types for Housekeeping page components
 */

export type RoomStatus = 'Available' | 'Confirmed' | 'CheckedIn' | 'Dirty' | 'Cleaning' | 'Maintenance' | string

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
export type StatusFilter = 'All Rooms' | 'Available' | 'Confirmed' | 'CheckedIn' | 'Dirty' | 'Cleaning' | 'Maintenance'
