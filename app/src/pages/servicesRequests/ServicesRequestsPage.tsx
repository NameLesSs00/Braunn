import { useMemo, useState, useEffect, useRef } from 'react'
import { RequestServiceModal } from './components/RequestServiceModal'
import { createPortal } from 'react-dom'
import { useAppDispatch, useAppSelector } from '../../shared/apis/hooks'
import { fetchFinancialServices } from '../../features/adminFinancialSettings/financialSettingsSlice'
import { fetchRequests, addRequest } from '../../features/requests/requestsSlice'
import { fetchRooms } from '../../features/rooms/roomsSlice'

import {
  Search,
  ChevronDown,
  Plus,
  Eye,
  Utensils,
  Wifi,
  Clock,
  WashingMachine,
  Car,
  X,
  FileText,
  CheckCircle,
} from 'lucide-react' 

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority   = 'Urgent' | 'Normal'
type ReqStatus  = 'Pending' | 'In Progress' | 'Done' | 'Cancelled'
type Department = 'Housekeeping' | 'F&B' | 'IT Services' | 'Front Desk' | 'Guest Assistance' | 'Maintenance'
type RequestType = 'Extra Towels' | 'Room Cleaning' | 'Maintenance' | 'Food Order' | 'WiFi Support' | 'Other'

type Request = {
  id: string
  guestName: string
  roomNumber: string
  department: Department
  requestType: RequestType
  priority: Priority
  date: string       // display: MM/DD/YYYY
  dateTime: string   // display: Jan 5, 2026, 1:46 PM
  quantity: number | string
  status: ReqStatus
  notes: string
}

type Service = {
  id: string
  name: string
  department: Department
  description: string
  price: number
  paymentType: 'Paid' | 'Free'
  Icon: React.ElementType
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const REQUEST_TYPES: RequestType[] = [
  'Extra Towels', 'Room Cleaning', 'Maintenance', 'Food Order', 'WiFi Support', 'Other',
]

const ALL_DEPARTMENTS: Department[] = [
  'Housekeeping', 'F&B', 'IT Services', 'Front Desk', 'Guest Assistance', 'Maintenance',
]

const ALL_STATUSES: ReqStatus[] = ['Pending', 'In Progress', 'Done', 'Cancelled']

function now(): { date: string; dateTime: string } {
  const d = new Date()
  const date = d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  const dateTime = d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
  return { date, dateTime }
}

const INITIAL_REQUESTS: Request[] = [
  { id: 'Q01', guestName: 'N/A', roomNumber: '102', department: 'Housekeeping',     requestType: 'Extra Towels',  priority: 'Urgent', date: '12/22/2025', dateTime: 'Dec 22, 2025, 10:00 AM', quantity: 1, status: 'Pending', notes: '' },
  { id: 'Q02', guestName: 'N/A', roomNumber: '102', department: 'Housekeeping',     requestType: 'Room Cleaning', priority: 'Normal', date: '12/22/2025', dateTime: 'Dec 22, 2025, 10:30 AM', quantity: 1, status: 'Pending', notes: '' },
  { id: 'Q03', guestName: 'N/A', roomNumber: '102', department: 'Housekeeping',     requestType: 'Extra Towels',  priority: 'Urgent', date: '12/22/2025', dateTime: 'Dec 22, 2025, 11:00 AM', quantity: 1, status: 'Pending', notes: '' },
  { id: 'Q04', guestName: 'N/A', roomNumber: '205', department: 'F&B',              requestType: 'Food Order',    priority: 'Normal', date: '12/22/2025', dateTime: 'Dec 22, 2025, 12:00 PM', quantity: 1, status: 'Pending', notes: '' },
  { id: 'Q05', guestName: 'N/A', roomNumber: '205', department: 'F&B',              requestType: 'Food Order',    priority: 'Urgent', date: '12/22/2025', dateTime: 'Dec 22, 2025, 12:30 PM', quantity: 1, status: 'Pending', notes: '' },
  { id: 'Q06', guestName: 'N/A', roomNumber: '301', department: 'IT Services',      requestType: 'WiFi Support',  priority: 'Normal', date: '12/22/2025', dateTime: 'Dec 22, 2025, 2:00 PM',  quantity: 1, status: 'Pending', notes: '' },
  { id: 'Q07', guestName: 'N/A', roomNumber: '301', department: 'Front Desk',       requestType: 'Other',         priority: 'Urgent', date: '12/22/2025', dateTime: 'Dec 22, 2025, 3:00 PM',  quantity: 1, status: 'Pending', notes: '' },
  { id: 'Q08', guestName: 'N/A', roomNumber: '401', department: 'Guest Assistance', requestType: 'Other',         priority: 'Normal', date: '12/22/2025', dateTime: 'Dec 22, 2025, 4:00 PM',  quantity: 1, status: 'Pending', notes: '' },
]

function formatDate(dateStr?: string) {
  if (!dateStr) return '-------'
  const d = new Date(dateStr.replace(' ', 'T'))
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function formatDateTime(dateStr?: string) {
  if (!dateStr) return '-------'
  const d = new Date(dateStr.replace(' ', 'T'))
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

function mapStatus(s?: string): ReqStatus {
  if (!s) return 'Pending'
  if (s === 'Pending') return 'Pending'
  if (s === 'Progress') return 'In Progress'
  if (s === 'Success') return 'Done'
  return 'Pending'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────


function priorityStyle(p: Priority) {
  return p === 'Urgent' ? 'text-red-500 font-semibold' : 'text-emerald-600 font-semibold'
}

function statusPillClass(s: ReqStatus) {
  switch (s) {
    case 'Pending':     return 'bg-amber-100 text-amber-700 border border-amber-300'
    case 'In Progress': return 'bg-blue-100  text-blue-700  border border-blue-300'
    case 'Done':        return 'bg-emerald-100 text-emerald-700 border border-emerald-300'
    case 'Cancelled':   return 'bg-slate-100 text-slate-500 border border-slate-300'
  }
}

function genId() {
  return `REQ-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────

function ModalPortal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
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

function getCurrentDateTimeString(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function formatSubmitDate(dStr: string) {
  const d = new Date(dStr)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// ─── New Request Modal ────────────────────────────────────────────────────────

type NewRequestModalProps = {
  open: boolean
  onClose: () => void
}

function NewRequestModal({ open, onClose }: NewRequestModalProps) {
  const dispatch = useAppDispatch()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // State
  const [roomNumber, setRoomNumber] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [serviceDate, setServiceDate] = useState(getCurrentDateTimeString())
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Selectors
  const financialServices = useAppSelector((state) => state.financialSettings.services)
  const financialStatus = useAppSelector((state) => state.financialSettings.status)
  const roomsStatus = useAppSelector(state => state.rooms.status) 
  const rooms = useAppSelector(state => state.rooms.items)
  
  //console.log(rooms)

useEffect(() => {
  if (open) {
    if (financialStatus === 'idle') dispatch(fetchFinancialServices())
    if (roomsStatus === 'idle') dispatch(fetchRooms())
  }
}, [open, financialStatus, roomsStatus, dispatch])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

 const roomNumbers = useMemo(() => {
  const list = rooms
    .map((room) => room.roomNumber)   // 👈 change if needed (e.g. room.number)
    .filter((room): room is string => typeof room === 'string' && room.trim() !== '')
  return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}, [rooms])

  const filteredRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return roomNumbers
    return roomNumbers.filter((r) => r.toLowerCase().includes(q))
  }, [roomNumbers, searchQuery])

  const handleSelectRoom = (room: string) => {
    setRoomNumber(room)
    setErrors((prev) => ({ ...prev, roomNumber: '' }))
    setDropdownOpen(false)
    setSearchQuery('')
  }

  function handleClose() {
    onClose()
    setRoomNumber('')
    setSelectedServiceId('')
    setServiceDate(getCurrentDateTimeString())
    setDropdownOpen(false)
    setSearchQuery('')
    setErrors({})
  }

  async function handleSubmit() {
    const e: Record<string, string> = {}
    if (!roomNumber.trim()) e.roomNumber = 'Room Number is required'
    if (!selectedServiceId) e.selectedServiceId = 'Service selection is required'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setSubmitting(true)
    try {
      const formattedDate = new Date(serviceDate).toISOString()
      await dispatch(addRequest({
        roomNo: roomNumber,
        serviceId: selectedServiceId,
        date: formattedDate
      })).unwrap()

      dispatch(fetchRequests())
      handleClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  const selectClass = errors.selectedServiceId
    ? 'h-11 w-full rounded-xl border border-red-400 bg-white px-4 pr-9 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-red-200 appearance-none'
    : 'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-9 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10 appearance-none'

  return (
    <ModalPortal open={open} onClose={handleClose}>
      <div className="w-[480px] max-w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between bg-[#0B4EA2] px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-white">New Request</h2>
            <p className="mt-0.5 text-[12px] text-blue-200">Create a new service request</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Room Number */}
          <div className="relative" ref={dropdownRef}>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
              Room Number <span className="text-red-500">*</span>
            </label>
            
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={[
                'flex h-11 w-full items-center justify-between rounded-xl border bg-white px-4 text-sm outline-none transition-all',
                errors.roomNumber
                  ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                  : 'border-slate-200 focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10',
                roomNumber ? 'text-slate-700 font-medium' : 'text-slate-400'
              ].join(' ')}
            >
              <span>{roomNumber || 'Select Room Number'}</span>
              <ChevronDown className={['h-4 w-4 text-slate-400 transition-transform duration-200', dropdownOpen ? 'rotate-180' : ''].join(' ')} />
            </button>

            {errors.roomNumber && (
              <p className="mt-1 text-[11px] text-red-500">{errors.roomNumber}</p>
            )}

            {dropdownOpen && (
              <div className="absolute left-0 right-0 z-50 mt-1 rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="relative mb-2">
                  <input
                    type="text"
                    placeholder="Search room..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-[#F8FAFC] pl-8 pr-3 text-xs text-slate-700 outline-none focus:border-[#0B4EA2] transition-colors"
                    autoFocus
                  />
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>

                <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-0.5">
                  {filteredRooms.length === 0 ? (
                    <div className="py-3 text-center text-xs text-slate-400">No rooms found</div>
                  ) : (
                    filteredRooms.map((room) => (
                      <button
                        key={room}
                        type="button"
                        onClick={() => handleSelectRoom(room)}
                        className={[
                          'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors',
                          roomNumber === room
                            ? 'bg-[#EAF2FF] text-[#0B4EA2]'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        ].join(' ')}
                      >
                        <span>Room {room}</span>
                        {roomNumber === room && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#0B4EA2]" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Select Service */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
              Select Service <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                className={selectClass}
                value={selectedServiceId}
                onChange={(e) => {
                  setSelectedServiceId(e.target.value)
                  setErrors((prev) => ({ ...prev, selectedServiceId: '' }))
                }}
              >
                <option value="">Select Service</option>
                {financialServices.map((fs) => (
                  <option key={fs.id} value={fs.id}>{fs.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
            {errors.selectedServiceId && (
              <p className="mt-1 text-[11px] text-red-500">{errors.selectedServiceId}</p>
            )}
          </div>

          {/* Date & Time */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Date &amp; Time</label>
            <input
              type="datetime-local"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
            />
            <p className="mt-1 text-[11px] text-slate-400">Specify the desired date and time for the service request</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50">
          <button
            type="button"
            onClick={handleClose}
            className="h-10 rounded-xl border border-slate-200 px-6 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="h-10 rounded-xl bg-[#0B4EA2] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0a3f85] disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </ModalPortal>
  )
}

// ─── Request Details Modal ────────────────────────────────────────────────────

function RequestDetailsModal({ open, onClose, request }: { open: boolean; onClose: () => void; request: Request | null }) {
  if (!request) return null

  return (
    <ModalPortal open={open} onClose={onClose}>
      <div className="w-[480px] max-w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#0B4EA2] px-6 py-4">
          <h2 className="text-base font-bold text-white">Request details</h2>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ID + Room row */}
        <div className="flex items-start justify-between px-6 pt-4 pb-2">
          <div>
            <p className="text-[11px] font-semibold text-slate-400">Request ID</p>
            <p className="text-[13px] font-bold text-[#0B4EA2]">{request.id}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold text-slate-400">Room</p>
            <p className="text-[13px] font-bold text-slate-700">{request.roomNumber}</p>
          </div>
        </div>

        {/* Request information card */}
        <div className="mx-6 mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-bold text-slate-800">Request information</span>
          </div>

          <div className="grid grid-cols-2 gap-y-4">
            <Field label="Guest Name"   value={request.guestName  || 'N/A'} />
            <Field label="Room Number"  value={request.roomNumber} />
            <Field label="Department"   value={request.department} />
            <Field label="Request Type" value={request.requestType} />
            <div>
              <p className="mb-1 text-[11px] font-semibold text-slate-400">Priority</p>
              <span className={`inline-flex h-5 items-center rounded-md px-2.5 text-[11px] font-semibold border ${
                request.priority === 'Urgent'
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {request.priority.toLowerCase()}
              </span>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold text-slate-400">Status</p>
              <span className={`inline-flex h-5 items-center rounded-full px-2.5 text-[11px] font-semibold ${statusPillClass(request.status)}`}>
                {request.status.toLowerCase()}
              </span>
            </div>
            <div className="col-span-2">
              <Field label="Date & Time" value={request.dateTime} />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mx-6 mb-5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="mb-1 text-sm font-bold text-slate-800">Description</p>
          <p className="text-[13px] text-slate-500">{request.notes || 'No description provided'}</p>
        </div>
      </div>
    </ModalPortal>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-400">{label}</p>
      <p className="text-[13px] font-medium text-slate-700">{value}</p>
    </div>
  )
}

// ─── Shared filter bar ────────────────────────────────────────────────────────

function FilterBar({
  query, onQuery, date, onDate, department, onDepartment, statusVal, onStatus, showAdd, onAdd,
}: {
  query: string; onQuery: (v: string) => void
  date: string;  onDate: (v: string) => void
  department: string; onDepartment: (v: string) => void
  statusVal: string; onStatus: (v: string) => void
  showAdd?: boolean; onAdd?: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[220px] flex-1 max-w-xs">
        <input
          className="h-10 w-full rounded-xl border border-slate-200 bg-[#F3F5FF] px-4 pr-10 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10 transition-all"
          placeholder="Search by room number or department"
          value={query} onChange={(e) => onQuery(e.target.value)}
        />
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Search className="h-4 w-4" />
        </div>
      </div>

      <div className="relative">
        <input type="date"
          className="h-10 w-40 rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-500 outline-none focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10 transition-all"
          value={date} onChange={(e) => onDate(e.target.value)}
        />
      </div>

      <div className="relative">
        <select
          className="h-10 min-w-[160px] appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-sm text-slate-600 outline-none focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10 transition-all"
          value={department} onChange={(e) => onDepartment(e.target.value)}
        >
          <option value="all">All Departments</option>
          {ALL_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>

      <div className="relative">
        <select
          className="h-10 min-w-[130px] appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-sm text-slate-600 outline-none focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10 transition-all"
          value={statusVal} onChange={(e) => onStatus(e.target.value)}
        >
          <option value="all">All status</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>

      {showAdd && (
        <button type="button" onClick={onAdd}
          className="ml-auto inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-5 h-10 text-sm font-semibold text-white hover:bg-[#0a3f85] transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Request
        </button>
      )}
    </div>
  )
}

// ─── Requests Tab ─────────────────────────────────────────────────────────────

function RequestsTab({
  requests, onAdd, onView,
}: {
  requests: Request[]
  onAdd: () => void
  onView: (r: Request) => void
}) {
  const [query, setQuery]           = useState('')
  const [date, setDate]             = useState('')
  const [department, setDepartment] = useState('all')
  const [statusVal, setStatusVal]   = useState('all')

  const rows = useMemo(() => {
    let result = [...requests]
    const q = query.trim().toLowerCase()
    if (q) result = result.filter((r) => [r.roomNumber, r.department].some((v) => v.toLowerCase().includes(q)))
    if (department !== 'all') result = result.filter((r) => r.department === department)
    if (statusVal !== 'all')  result = result.filter((r) => r.status === statusVal)
    if (date) {
      const d = new Date(date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
      result = result.filter((r) => r.date === d)
    }
    return result
  }, [requests, query, date, department, statusVal])

  return (
    <div className="space-y-5">
      <FilterBar
        query={query} onQuery={setQuery} date={date} onDate={setDate}
        department={department} onDepartment={setDepartment}
        statusVal={statusVal} onStatus={setStatusVal}
        showAdd onAdd={onAdd}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <div className="grid grid-cols-[1fr_1.2fr_1fr_1fr_0.6fr_1fr_0.7fr] bg-white px-6 py-3 text-[12px] font-bold text-slate-700">
          <div>Room number</div><div>Request name</div><div>Priority</div>
          <div>Date</div><div>Request Price</div><div>Status</div><div>Action</div>
        </div>

        {rows.length === 0 ? (
          <div className="bg-white py-12 text-center text-sm text-slate-500">No requests match the current filters</div>
        ) : (
          rows.map((row, idx) => (
            <div key={row.id}
              className={['grid grid-cols-[1fr_1.2fr_1fr_1fr_0.6fr_1fr_0.7fr] items-center px-6 py-3.5 text-[13px]',
                idx % 2 === 0 ? 'bg-white' : 'bg-[#F4F9FF]'].join(' ')}
            >
              <div className="font-medium text-slate-700">{row.roomNumber}</div>
              <div className="text-slate-600">{row.department}</div>
              <div className={priorityStyle(row.priority)}>{row.priority}</div>
              <div className="text-slate-600">{row.date}</div>
              <div className="text-slate-600">
                {typeof row.quantity === 'number' ? `$${row.quantity}` : row.quantity}
              </div>
              <div>
                <span className={`inline-flex h-6 items-center rounded-full px-3 text-[11px] font-semibold ${statusPillClass(row.status)}`}>
                  {row.status}
                </span>
              </div>
              <div>
                <button type="button" aria-label="View" onClick={() => onView(row)}
                  className="inline-flex h-8 w-12 items-center justify-center rounded-full bg-[#0B4EA2] text-white hover:bg-[#0a3f85] transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Service Card ─────────────────────────────────────────────────────────────

function ServiceCard({ service, onRequestService }: { service: Service; onRequestService: (s: Service) => void }) {
  const { Icon } = service
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EAF2FF]">
            <Icon className="h-5 w-5 text-[#0B4EA2]" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">{service.name}</div>
            <div className="text-[11px] text-slate-500 leading-tight">{service.department}</div>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full bg-[#EAF2FF] px-2.5 py-0.5 text-[10px] font-bold text-[#0B4EA2]">
          {service.paymentType}
        </span>
      </div>
      <p className="mt-3 text-[12px] text-slate-500 leading-relaxed">{service.description}</p>
      <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Price</div>
        <div className="text-xl font-bold text-slate-800">${service.price}</div>
      </div>
      <button type="button"
        onClick={() => onRequestService(service)}
        className="mt-3 w-full rounded-xl bg-[#0B4EA2] py-2.5 text-[13px] font-semibold text-white hover:bg-[#0a3f85] transition-colors"
      >
        Request Service
      </button>
    </div>
  )
}

// ─── Services Tab ─────────────────────────────────────────────────────────────

function ServicesTab() {
  const [query, setQuery]           = useState('')
  const [date, setDate]             = useState('')
  const [department, setDepartment] = useState('all')
  const [statusVal, setStatusVal]   = useState('all')

  const [requestServiceOpen, setRequestServiceOpen] = useState(false)
  const [selectedService, setSelectedService]       = useState<Service | null>(null)
  const [showSuccess, setShowSuccess]               = useState(false)

  const dispatch = useAppDispatch()
  const financialServices = useAppSelector((state) => state.financialSettings.services)
  const financialStatus = useAppSelector((state) => state.financialSettings.status)

  useEffect(() => {
    if (financialStatus === 'idle') {
      dispatch(fetchFinancialServices())
    }
  }, [dispatch, financialStatus])

  const services = useMemo<Service[]>(() => {
    return financialServices.map((fs) => ({
      id: fs.id,
      name: fs.name,
      department: 'Housekeeping' as Department,
      description: `Hotel service: ${fs.name}`,
      price: fs.price,
      paymentType: fs.price > 0 ? 'Paid' : 'Free',
      Icon: Utensils,
    }))
  }, [financialServices])

  function handleRequestService(s: Service) {
    setSelectedService(s)
    setRequestServiceOpen(true)
  }

  function handleServiceSubmit(data: { roomNumber: string; notes: string; service: Service }) {
    dispatch(fetchRequests())
    setRequestServiceOpen(false)
    setSelectedService(null)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const filtered = useMemo(() => {
    let result = [...services]
    const q = query.trim().toLowerCase()
    if (q) result = result.filter((s) => [s.name, s.department, s.description].some((v) => v.toLowerCase().includes(q)))
    if (department !== 'all') result = result.filter((s) => s.department === department)
    return result
  }, [services, query, department])

  return (
    <div className="space-y-5">
      <FilterBar
        query={query} onQuery={setQuery} date={date} onDate={setDate}
        department={department} onDepartment={setDepartment}
        statusVal={statusVal} onStatus={setStatusVal}
      />

      {showSuccess && (
        <div className="flex items-center justify-center gap-2 rounded-full bg-[#E8F9EE] py-3 text-sm font-medium text-[#107038] border border-[#D1F0DB]">
          <CheckCircle className="h-4 w-4" />
          The request has been recorded successfully
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-500">No services match the current filters</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service) => (
            <ServiceCard key={service.id} service={service} onRequestService={handleRequestService} />
          ))}
        </div>
      )}

      <RequestServiceModal
        open={requestServiceOpen}
        onClose={() => { setRequestServiceOpen(false); setSelectedService(null) }}
        service={selectedService}
        onSubmit={handleServiceSubmit}
      />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type TabKey = 'requests' | 'services'

export function ServicesRequestsPage() {
  const [tab, setTab] = useState<TabKey>('requests')

  const dispatch = useAppDispatch()
  const apiItems = useAppSelector((state) => state.requests.items)

  useEffect(() => {
    dispatch(fetchRequests())
  }, [dispatch])

  // ── Requests state (lifted here so modals can share it)
  const [localRequests, setLocalRequests] = useState<Request[]>([])

  const requests = useMemo<Request[]>(() => {
    const mapped = apiItems.map((item) => ({
      id: item.id || '-------',
      guestName: '-------',
      roomNumber: item.roomNo || '-------',
      department: (item.serviceName || '-------') as Department,
      requestType: (item.serviceName || '-------') as RequestType,
      priority: 'Normal' as Priority,
      date: formatDate(item.date),
      dateTime: formatDateTime(item.date),
      quantity: item.servicePrice !== undefined && item.servicePrice !== null ? item.servicePrice : '-------',
      status: mapStatus(item.status),
      notes: '-------',
    }))
    return [...localRequests, ...mapped]
  }, [apiItems, localRequests])

  // ── New Request modal
  const [newOpen, setNewOpen] = useState(false)

  // ── Details modal
  const [detailsOpen, setDetailsOpen]       = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)

  function handleSubmitRequest(req: Request) {
    setLocalRequests((prev) => [req, ...prev])
    setNewOpen(false)
    // immediately show the details popup for the new request
    setSelectedRequest(req)
    setDetailsOpen(true)
  }

  function handleViewRequest(req: Request) {
    setSelectedRequest(req)
    setDetailsOpen(true)
  }

  return (
    <>
      <NewRequestModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
      />
      <RequestDetailsModal
        open={detailsOpen}
        onClose={() => { setDetailsOpen(false); setSelectedRequest(null) }}
        request={selectedRequest}
      />

      <div className="rounded-2xl bg-white shadow-sm">
        {/* Tab bar */}
        <div className="flex items-center border-b border-slate-100 px-6">
          {([{ key: 'requests', label: 'Requests' }, { key: 'services', label: 'services' }] as const).map(({ key, label }) => (
            <button key={key} type="button" onClick={() => setTab(key)}
              className={['mr-6 inline-flex items-center gap-2 border-b-2 py-4 text-sm font-semibold transition-colors',
                tab === key ? 'border-[#0B4EA2] text-[#0B4EA2]' : 'border-transparent text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {tab === 'requests' && (
            <RequestsTab
              requests={requests}
              onAdd={() => setNewOpen(true)}
              onView={handleViewRequest}
            />
          )}
          {tab === 'services' && <ServicesTab />}
        </div>
      </div>
    </>
  )
}
