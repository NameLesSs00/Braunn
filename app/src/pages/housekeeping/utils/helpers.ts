/**
 * Helper functions for Housekeeping page
 */

import React from 'react'
import { CheckCircle2, AlertCircle, Clock, Wrench, Home, Key } from 'lucide-react'
import type { RoomStatus, LostStatus } from './types'
import type { HousekeepingRoom } from '../../../models/Housekeeping'

export function roomStatusTheme(status: RoomStatus | string) {
  switch (status) {
    case 'Available':
    case 'Clean':
      return { card: 'border-emerald-200 bg-emerald-50', icon: 'bg-emerald-500 text-white', text: 'text-emerald-600' }
    case 'Dirty':
      return { card: 'border-rose-200   bg-rose-50',     icon: 'bg-rose-500    text-white', text: 'text-rose-600'    }
    case 'Cleaning':
    case 'In Progress':
      return { card: 'border-blue-200   bg-blue-50',     icon: 'bg-blue-500    text-white', text: 'text-blue-600'    }
    case 'Maintenance':
      return { card: 'border-amber-200  bg-amber-50',    icon: 'bg-orange-500  text-white', text: 'text-orange-600'  }
    case 'CheckedIn':
    case 'Confirmed':
      return { card: 'border-indigo-200 bg-indigo-50', icon: 'bg-indigo-500 text-white', text: 'text-indigo-600' }
    default:
      return { card: 'border-slate-200 bg-slate-50', icon: 'bg-slate-500 text-white', text: 'text-slate-600' }
  }
}

export function roomStatusIcon(status: RoomStatus | string): React.ReactNode {
  switch (status) {
    case 'Available':
    case 'Clean':
      return React.createElement(CheckCircle2, { className: 'h-4 w-4' })
    case 'Dirty':
      return React.createElement(AlertCircle, { className: 'h-4 w-4' })
    case 'Cleaning':
    case 'In Progress':
      return React.createElement(Clock, { className: 'h-4 w-4' })
    case 'Maintenance':
      return React.createElement(Wrench, { className: 'h-4 w-4' })
    case 'CheckedIn':
      return React.createElement(Key, { className: 'h-4 w-4' })
    case 'Confirmed':
      return React.createElement(Home, { className: 'h-4 w-4' })
    default:
      return React.createElement(CheckCircle2, { className: 'h-4 w-4' })
  }
}

export function mapHousekeepingStatus(status: any): RoomStatus {
  if (typeof status === 'string') return status as RoomStatus
  const n = Number(status)
  if (n === 1) return 'Available'
  if (n === 2) return 'Dirty'
  if (n === 3) return 'Cleaning'
  return 'Maintenance'
}

export function lostStatusTheme(s: LostStatus) {
  switch (s) {
    case 'Found':
      return { card: 'border-blue-200 bg-blue-50',  badge: 'border border-blue-400 text-blue-600 bg-white'  }
    case 'Lost':
      return { card: 'border-rose-200  bg-rose-50',  badge: 'border border-rose-400  text-rose-600  bg-white' }
    case 'Claimed':
      return { card: 'border-slate-200 bg-slate-50', badge: 'border border-slate-400 text-slate-600 bg-white' }
  }
}
