/**
 * Mock data for Housekeeping page
 */

import type { Room } from './types'

export const ROOMS: Room[] = [
  { id: 'R01', number: '101', type: 'Single', floor: 1, status: 'Clean',       capacity: 1, rate: 80 },
  { id: 'R02', number: '102', type: 'Single', floor: 1, status: 'Clean',       capacity: 1, rate: 80 },
  { id: 'R03', number: '103', type: 'Single', floor: 1, status: 'Clean',       capacity: 1, rate: 80 },
  { id: 'R04', number: '201', type: 'Double', floor: 2, status: 'Clean',       capacity: 2, rate: 120 },
  { id: 'R05', number: '202', type: 'Double', floor: 2, status: 'Clean',       capacity: 2, rate: 120 },
  { id: 'R06', number: '203', type: 'Double', floor: 2, status: 'Clean',       capacity: 2, rate: 120 },
  { id: 'R07', number: '301', type: 'Suite',  floor: 3, status: 'Dirty',       capacity: 3, rate: 200 },
  { id: 'R08', number: '302', type: 'Suite',  floor: 3, status: 'Dirty',       capacity: 3, rate: 200 },
  { id: 'R09', number: '303', type: 'Suite',  floor: 3, status: 'Dirty',       capacity: 3, rate: 200 },
  { id: 'R10', number: '401', type: 'Deluxe', floor: 4, status: 'In Progress', capacity: 4, rate: 280 },
  { id: 'R11', number: '501', type: 'Single', floor: 5, status: 'Maintenance', capacity: 1, rate: 80 },
  { id: 'R12', number: '502', type: 'Single', floor: 5, status: 'Maintenance', capacity: 1, rate: 80 },
  { id: 'R13', number: '503', type: 'Double', floor: 5, status: 'Maintenance', capacity: 2, rate: 120 },
]


