import { useEffect, useMemo, useState } from 'react'
import { GuestDetailsPopup } from './popups/GuestDetailsPopup'
import type { Companion } from './popups/GuestDetailsPopup'
import {
  Search,
  Mail,
  Phone,
  CreditCard,
  Globe,
  User,
  ChevronDown,
  Download,
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import { useAppDispatch, useAppSelector } from '../../shared/apis/hooks'
import { fetchGuests, fetchGuestById } from '../../features/guests/guestsSlice'
import type { Guest as ApiGuest } from '../../models/Guest'

// ─── Types ──────────────────────────────────────────────────────────────────

type GuestStatus = 'In House' | 'Checked out' | 'Reserved' | 'Cancelled'

type Guest = {
  id: string
  name: string
  room: string
  floor: number
  roomType: string
  guestType: string
  status: GuestStatus | string
  email: string
  phone: string
  passport: string
  nationality: string
  country: string
  postalCode: string
  dateOfBirth: string
  reservations: number
  checkInDate: string   // ISO yyyy-mm-dd
  checkOutDate: string  // ISO yyyy-mm-dd
  companions: Companion[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusBadge(status: GuestStatus | string) {
  switch (status) {
    case 'In House':    return 'bg-emerald-500 text-white'
    case 'Checked out': return 'bg-rose-500 text-white'
    case 'Reserved':    return 'bg-[#0B4EA2] text-white'
    case 'Cancelled':   return 'bg-slate-400 text-white'
    default:            return 'bg-slate-200 text-slate-700'
  }
}

function roomBadge() {
  return 'bg-[#E8EEFF] text-[#4B6CD4]'
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <select
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-600 outline-none focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10 transition-all"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>
    </div>
  )
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <input
          type="date"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-600 outline-none focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10 transition-all placeholder:text-slate-400"
          placeholder="MM/DD/YY"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}

function GuestCard({ guest, onClick, onDownload }: { guest: Guest; onClick: () => void; onDownload: (id: string) => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="flex cursor-pointer flex-col rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-[#0B4EA2]/30 transition-all duration-200"
    >
      {/* Top section */}
      <div className="flex items-start gap-3 p-4 pb-3">
        {/* Avatar */}
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#EAF0FB]">
          <User className="h-5 w-5 text-[#6B8DD6]" />
        </div>

        {/* Name + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-nowrap items-center gap-2 overflow-hidden">
            <span className="truncate text-sm font-semibold text-slate-800 leading-tight">{guest.name}</span>
            <span className={`inline-flex shrink-0 h-[18px] items-center rounded-full px-1.5 text-[9px] font-bold leading-none ${statusBadge(guest.status)}`}>
              {guest.status}
            </span>
          </div>
          <div className="mt-1.5">
            <span className={`inline-flex h-5 items-center rounded-md px-2 text-[11px] font-semibold ${roomBadge()}`}>
              Room {guest.room}
            </span>
          </div>
        </div>

        {/* Download Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDownload(guest.id)
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-[#0B4EA2]"
          aria-label="Download PDF"
        >
          <Download className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-100" />

      {/* Contact info */}
      <div className="flex flex-col gap-2 px-4 py-3">
        <div className="flex items-center gap-2 text-[12px] text-slate-600">
          <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{guest.email}</span>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-slate-600">
          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>{guest.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-slate-600">
          <CreditCard className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>{guest.postalCode}</span>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-slate-600">
          <Globe className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>{guest.nationality}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-100" />

      {/* Reservation count */}
      <div className="px-4 py-3">
        <div className="text-sm font-bold text-slate-800">{guest.reservations}</div>
        <div className="text-[11px] text-slate-500">reservation</div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

function parseDate(d: string): number | null {
  if (!d) return null
  const t = new Date(d).getTime()
  return Number.isFinite(t) ? t : null
}

export function GuestsPage() {
  const dispatch = useAppDispatch()
  const apiGuests = useAppSelector((s) => s.guests.items)

  const [query, setQuery] = useState('')
  const [guestType, setGuestType] = useState('all')
  const [roomType, setRoomType] = useState('all')
  const [checkInFrom, setCheckInFrom] = useState('')
  const [checkInTo, setCheckInTo] = useState('')
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)

  useEffect(() => {
    void dispatch(fetchGuests())
  }, [dispatch])

  const mappedApiGuests = useMemo<Guest[]>(() => {
    const toUiGuest = (g: ApiGuest): Guest => ({
      id: g.id,
      name: g.fullName || '-----',
      email: g.email || '-----',
      phone: g.phone || '-----',
      passport: g.idNumber || '-----',
      nationality: g.nationality || '-----',
      country: g.country || '-----',
      postalCode: g.postalCode || '-----',
      dateOfBirth: g.dateOfBirth || '-----',
      room: '-----',
      floor: 0,
      roomType: '-----',
      guestType: '-----',
      status: '-----',
      reservations: 0,
      checkInDate: '',
      checkOutDate: '',
      companions: [],
    })

    return apiGuests.map(toUiGuest)
  }, [apiGuests])

  const filtered = useMemo(() => {
    let result = [...mappedApiGuests]

    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter((g) =>
        [g.name, g.id, g.room].some((v) => v.toLowerCase().includes(q))
      )
    }

    if (guestType !== 'all') result = result.filter((g) => g.guestType === guestType)
    if (roomType !== 'all') result = result.filter((g) => g.roomType === roomType)

    const fromT = parseDate(checkInFrom)
    const toT = parseDate(checkInTo)
    if (fromT != null || toT != null) {
      result = result.filter((g) => {
        const t = parseDate(g.checkInDate)
        if (t == null) return false
        if (fromT != null && t < fromT) return false
        if (toT != null && t > toT) return false
        return true
      })
    }

    return result
  }, [checkInFrom, checkInTo, guestType, mappedApiGuests, query, roomType])

  const handleExportPdf = () => {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(18)
    doc.text('Guests List', 14, 20)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30)

    // Table Data
    const tableColumn = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Nationality',
      'Passport',
      'Birth Date',
    ]
    const tableRows = filtered.map((g) => [
      g.id,
      g.name,
      g.email,
      g.phone,
      g.nationality,
      g.passport,
      g.dateOfBirth,
    ])

    autoTable(doc, {
      startY: 40,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [11, 78, 162], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [244, 249, 255] },
      styles: { fontSize: 9, cellPadding: 3 },
    })

    doc.save(`GuestsList_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const handleDownloadSingleGuest = async (id: string) => {
    try {
      const result = await dispatch(fetchGuestById(id)).unwrap()
      if (!result) return

      const doc = new jsPDF()

      // Title
      doc.setFontSize(20)
      doc.setTextColor(11, 78, 162)
      doc.text('Guest Profile', 14, 20)
      
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28)

      // Personal Information
      doc.setFontSize(14)
      doc.setTextColor(30)
      doc.text('Personal Information', 14, 45)
      
      const personalData = [
        ['Full Name', result.fullName || '-----'],
        ['ID/Passport', result.idNumber || '-----'],
        ['Nationality', result.nationality || '-----'],
        ['Date of Birth', result.dateOfBirth ? new Date(result.dateOfBirth).toLocaleDateString() : '-----'],
        ['Gender', result.gender || '-----'],
      ]

      autoTable(doc, {
        startY: 50,
        body: personalData,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
      })

      // Contact Details
      doc.setFontSize(14)
      doc.text('Contact Details', 14, (doc as any).lastAutoTable.finalY + 15)
      
      const contactData = [
        ['Email', result.email || '-----'],
        ['Phone', result.phone || '-----'],
        ['Address', result.streetAddress || '-----'],
        ['Country', result.country || '-----'],
        ['City', result.city || '-----'],
        ['Postal Code', result.postalCode || '-----'],
      ]

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        body: contactData,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
      })

      // Emergency Contact
      if (result.emergencyContactName || result.emergencyContactPhone) {
        doc.setFontSize(14)
        doc.text('Emergency Contact', 14, (doc as any).lastAutoTable.finalY + 15)
        
        const emergencyData = [
          ['Name', result.emergencyContactName || '-----'],
          ['Phone', result.emergencyContactPhone || '-----'],
        ]

        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 20,
          body: emergencyData,
          theme: 'plain',
          styles: { fontSize: 10, cellPadding: 2 },
          columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
        })
      }

      doc.save(`Guest_${result.fullName?.replace(/\s+/g, '_')}_${id.slice(0, 5)}.pdf`)
    } catch (error) {
      console.error('Failed to download guest PDF:', error)
    }
  }

  return (
    <div className="space-y-5">
      {/* ── Filter panel ── */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {/* Search bar */}
        <div className="relative mb-6 max-w-xl">
          <input
            className="h-11 w-full rounded-full bg-[#F3F5FF] px-6 pr-12 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#0B4EA2]/15 transition-all"
            placeholder="Search by Guest Name ,ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FilterSelect label="Guest Type" value={guestType} onChange={setGuestType}>
            <option value="all">All status</option>
            <option value="VIP">VIP</option>
            <option value="Regular">Regular</option>
            <option value="Corporate">Corporate</option>
          </FilterSelect>

          <FilterSelect label="Room Type" value={roomType} onChange={setRoomType}>
            <option value="all">All Types</option>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Suite">Suite</option>
            <option value="Deluxe">Deluxe</option>
          </FilterSelect>

          <DateInput label="Check-in from" value={checkInFrom} onChange={setCheckInFrom} />

          <DateInput label="Check-in To" value={checkInTo} onChange={setCheckInTo} />
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-end gap-4">
          <div className="text-sm font-semibold text-slate-600">{filtered.length} results</div>
          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B4EA2] px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#093d81] active:scale-95"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* ── Guest cards grid ── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white py-16 text-center text-sm text-slate-500 shadow-sm">
          No guests match the current filters
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((guest) => (
            <GuestCard 
              key={guest.id} 
              guest={guest} 
              onClick={() => setSelectedGuest(guest)} 
              onDownload={handleDownloadSingleGuest}
            />
          ))}
        </div>
      )}

      {/* ── Guest details popup ── */}
      <GuestDetailsPopup
        open={selectedGuest !== null}
        onClose={() => setSelectedGuest(null)}
        guest={selectedGuest}
      />
    </div>
  )
}
