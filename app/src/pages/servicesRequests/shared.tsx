import React from 'react'
import { createPortal } from 'react-dom'
import {
  Utensils,
  Wifi,
  Clock,
  WashingMachine,
  Car,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Priority = 'Urgent' | 'Normal'
export type ReqStatus = 'Pending' | 'In Progress' | 'Done' | 'Cancelled'
export type Department = 'Housekeeping' | 'F&B' | 'IT Services' | 'Front Desk' | 'Guest Assistance' | 'Maintenance'
export type RequestType = 'Extra Towels' | 'Room Cleaning' | 'Maintenance' | 'Food Order' | 'WiFi Support' | 'Other'

export type Request = {
  id: string
  guestName: string
  roomNumber: string
  department: Department
  requestType: RequestType
  priority: Priority
  date: string       // display: MM/DD/YYYY
  dateTime: string   // display: Jan 5, 2026, 1:46 PM
  quantity: number
  status: ReqStatus
  notes: string
}

export type Service = {
  id: string
  name: string
  department: Department
  description: string
  price: number
  paymentType: 'Paid' | 'Free'
  Icon: React.ElementType
}

// ─── Mock data ────────────────────────────────────────────────────────────────

export const REQUEST_TYPES: RequestType[] = [
  'Extra Towels', 'Room Cleaning', 'Maintenance', 'Food Order', 'WiFi Support', 'Other',
]

export const ALL_DEPARTMENTS: Department[] = [
  'Housekeeping', 'F&B', 'IT Services', 'Front Desk', 'Guest Assistance', 'Maintenance',
]

export const ALL_STATUSES: ReqStatus[] = ['Pending', 'In Progress', 'Done', 'Cancelled']

export function now(): { date: string; dateTime: string } {
  const d = new Date()
  const date = d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  const dateTime = d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
  return { date, dateTime }
}

export const INITIAL_REQUESTS: Request[] = [
  { id: 'Q01', guestName: 'N/A', roomNumber: '102', department: 'Housekeeping', requestType: 'Extra Towels', priority: 'Urgent', date: '12/22/2025', dateTime: 'Dec 22, 2025, 10:00 AM', quantity: 1, status: 'Pending', notes: '' },
  { id: 'Q02', guestName: 'N/A', roomNumber: '102', department: 'Housekeeping', requestType: 'Room Cleaning', priority: 'Normal', date: '12/22/2025', dateTime: 'Dec 22, 2025, 10:30 AM', quantity: 1, status: 'Pending', notes: '' },
  { id: 'Q03', guestName: 'N/A', roomNumber: '102', department: 'Housekeeping', requestType: 'Extra Towels', priority: 'Urgent', date: '12/22/2025', dateTime: 'Dec 22, 2025, 11:00 AM', quantity: 1, status: 'Pending', notes: '' },
  { id: 'Q04', guestName: 'N/A', roomNumber: '205', department: 'F&B', requestType: 'Food Order', priority: 'Normal', date: '12/22/2025', dateTime: 'Dec 22, 2025, 12:00 PM', quantity: 1, status: 'Pending', notes: '' },
  { id: 'Q05', guestName: 'N/A', roomNumber: '205', department: 'F&B', requestType: 'Food Order', priority: 'Urgent', date: '12/22/2025', dateTime: 'Dec 22, 2025, 12:30 PM', quantity: 1, status: 'Pending', notes: '' },
  { id: 'Q06', guestName: 'N/A', roomNumber: '301', department: 'IT Services', requestType: 'WiFi Support', priority: 'Normal', date: '12/22/2025', dateTime: 'Dec 22, 2025, 2:00 PM', quantity: 1, status: 'Pending', notes: '' },
  { id: 'Q07', guestName: 'N/A', roomNumber: '301', department: 'Front Desk', requestType: 'Other', priority: 'Urgent', date: '12/22/2025', dateTime: 'Dec 22, 2025, 3:00 PM', quantity: 1, status: 'Pending', notes: '' },
  { id: 'Q08', guestName: 'N/A', roomNumber: '401', department: 'Guest Assistance', requestType: 'Other', priority: 'Normal', date: '12/22/2025', dateTime: 'Dec 22, 2025, 4:00 PM', quantity: 1, status: 'Pending', notes: '' },
]

export const SERVICES: Service[] = [
  { id: 'S01', name: 'Room Service', department: 'F&B', description: 'In-room dining service', price: 25, paymentType: 'Paid', Icon: Utensils },
  { id: 'S02', name: 'WiFi Premium', department: 'IT Services', description: 'High-speed internet access', price: 25, paymentType: 'Paid', Icon: Wifi },
  { id: 'S03', name: 'Late Checkout', department: 'Front Desk', description: 'Extend checkout time', price: 25, paymentType: 'Paid', Icon: Clock },
  { id: 'S04', name: 'Laundry Service', department: 'Housekeeping', description: 'Professional laundry and pressing', price: 25, paymentType: 'Paid', Icon: WashingMachine },
  { id: 'S05', name: 'Airport Transfer', department: 'Guest Assistance', description: 'Professional laundry and pressing', price: 25, paymentType: 'Paid', Icon: Car },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function priorityStyle(p: Priority) {
  return p === 'Urgent' ? 'text-red-500 font-semibold' : 'text-emerald-600 font-semibold'
}

export function statusPillClass(s: ReqStatus) {
  switch (s) {
    case 'Pending': return 'bg-amber-100 text-amber-700 border border-amber-300'
    case 'In Progress': return 'bg-blue-100  text-blue-700  border border-blue-300'
    case 'Done': return 'bg-emerald-100 text-emerald-700 border border-emerald-300'
    case 'Cancelled': return 'bg-slate-100 text-slate-500 border border-slate-300'
  }
}

export function genId() {
  return `REQ-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────

export function ModalPortal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onMouseDown={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10" onMouseDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  )
}
