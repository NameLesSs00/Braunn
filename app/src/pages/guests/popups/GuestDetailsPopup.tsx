import { useEffect, useState } from 'react'
import { CalendarDays, ChevronDown, CreditCard, Globe, Mail, Pencil, Phone, Trash2, User, UserPlus, X } from 'lucide-react'

import { Modal } from '../../../shared/ui/Modal'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { fetchGuestById } from '../../../features/guests/guestsSlice'

// ─── Types ───────────────────────────────────────────────────────────────────

export type Companion = {
  id: string
  name: string
  relation: string
  age: number
  documentId: string
}

export type GuestDetail = {
  id: string
  name: string
  room: string
  floor: number
  roomType: string
  guestType: string
  status: string
  email: string
  phone: string
  passport: string
  nationality: string
  country: string
  postalCode: string
  dateOfBirth: string
  reservations: number
  checkInDate: string
  checkOutDate: string
  companions: Companion[]
  streetAddress?: string
  city?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
}

type Tab = 'details' | 'companions' | 'history'

type Props = {
  open: boolean
  onClose: () => void
  guest: GuestDetail | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-4">
      {children}
    </div>
  )
}

function InfoRow({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  leftLabel: string
  leftValue: string
  rightLabel: string
  rightValue: string
}) {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-1">
      <div>
        <div className="text-[11px] text-slate-400">{leftLabel}</div>
        <div className="mt-0.5 text-[12px] font-semibold text-slate-800">{leftValue || 'Not specified'}</div>
      </div>
      <div>
        <div className="text-[11px] text-slate-400">{rightLabel}</div>
        <div className="mt-0.5 text-[12px] font-semibold text-slate-800">{rightValue || 'Not specified'}</div>
      </div>
    </div>
  )
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
      {icon}
      {title}
    </div>
  )
}

// ─── Tab content ─────────────────────────────────────────────────────────────

function GuestDetailsTab({ guest }: { guest: GuestDetail }) {
  return (
    <div className="space-y-5">
      {/* Contact Information */}
      <div className="space-y-2">
        <SectionTitle
          icon={<Mail className="h-4 w-4 text-slate-500" />}
          title="Contact Information"
        />
        <InfoCard>
          <InfoRow
            leftLabel="Email"
            leftValue={guest.email}
            rightLabel="Phone"
            rightValue={guest.phone}
          />
        </InfoCard>
      </div>

      {/* Identification */}
      <div className="space-y-2">
        <SectionTitle
          icon={<CreditCard className="h-4 w-4 text-slate-500" />}
          title="Identification"
        />
        <InfoCard>
          <div className="space-y-3">
            <InfoRow
              leftLabel="ID Type"
              leftValue=""
              rightLabel="ID Number"
              rightValue={guest.passport}
            />
            <div className="border-t border-slate-100" />
            <InfoRow
              leftLabel="Date of Birth"
              leftValue={guest.dateOfBirth}
              rightLabel="Nationality"
              rightValue={guest.nationality}
            />
            <div className="border-t border-slate-100" />
            <InfoRow
              leftLabel="Country"
              leftValue={guest.country}
              rightLabel="Postal Code"
              rightValue={guest.postalCode}
            />
          </div>
        </InfoCard>
      </div>

      {/* Address Information */}
      <div className="space-y-2">
        <SectionTitle
          icon={<Globe className="h-4 w-4 text-slate-500" />}
          title="Address Information"
        />
        <InfoCard>
          <InfoRow
            leftLabel="Street Address"
            leftValue={guest.streetAddress || ''}
            rightLabel="City"
            rightValue={guest.city || ''}
          />
        </InfoCard>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-2">
        <SectionTitle
          icon={<Phone className="h-4 w-4 text-slate-500" />}
          title="Emergency Contact"
        />
        <InfoCard>
          <InfoRow
            leftLabel="Contact Name"
            leftValue={guest.emergencyContactName || ''}
            rightLabel="Contact Phone"
            rightValue={guest.emergencyContactPhone || ''}
          />
        </InfoCard>
      </div>

    </div>
  )
}

function AddCompanionForm({ onAdd, onCancel }: { onAdd: (c: Companion) => void; onCancel: () => void }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [relation, setRelation] = useState('')
  const [age, setAge] = useState('')
  const [documentId, setDocumentId] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName || !lastName || !relation) return
    onAdd({
      id: `C${Date.now()}`,
      name: `${firstName} ${lastName}`.trim(),
      relation,
      age: parseInt(age) || 0,
      documentId,
    })
  }

  return (
    <div className="rounded-xl border border-[#DCE6F5] bg-[#F4F8FD] p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-slate-800">Add New Companion</h3>
        <button type="button" onClick={onCancel} className="text-slate-400 transition-colors hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-slate-700">First Name<span className="text-rose-500">*</span></label>
            <input 
              value={firstName} onChange={e => setFirstName(e.target.value)} 
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none transition-all focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2]" 
              placeholder="Enter first name" 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-slate-700">Last Name<span className="text-rose-500">*</span></label>
            <input 
              value={lastName} onChange={e => setLastName(e.target.value)} 
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none transition-all focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2]" 
              placeholder="Enter last name" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-slate-700">Relationship<span className="text-rose-500">*</span></label>
            <div className="relative">
              <select 
                value={relation} onChange={e => setRelation(e.target.value)} 
                className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-[13px] text-slate-700 outline-none transition-all focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2]"
              >
                <option value="" disabled hidden></option>
                <option value="Spouse">Spouse</option>
                <option value="Child">Child</option>
                <option value="Friend">Friend</option>
                <option value="Sibling">Sibling</option>
                <option value="Parent">Parent</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-slate-700">Age</label>
            <input 
              value={age} onChange={e => setAge(e.target.value)} 
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none transition-all focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2]" 
              placeholder="Enter age" 
              type="number"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-slate-700">ID Number</label>
          <input 
            value={documentId} onChange={e => setDocumentId(e.target.value)} 
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none transition-all focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2]" 
            placeholder="Enter ID number" 
          />
        </div>

        <div className="mt-2 flex items-center justify-end gap-3 pt-3">
          <button type="button" onClick={onCancel} className="rounded-xl border border-[#0B4EA2] bg-white px-6 py-2 text-[13px] font-semibold text-[#0B4EA2] transition-colors hover:bg-slate-50">
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            disabled={!firstName || !lastName || !relation}
            className="rounded-xl bg-[#0B4EA2] px-6 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#0a3f8a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add Companion
          </button>
        </div>
      </div>
    </div>
  )
}

function CompanionsTab({ guest }: { guest: GuestDetail }) {
  const firstName = guest.name.split(' ')[0] ?? guest.name
  const [companions, setCompanions] = useState<Companion[]>(guest.companions)
  const [isAdding, setIsAdding] = useState(false)

  const handleDelete = (id: string) => {
    setCompanions((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-4">
      {isAdding ? (
        <AddCompanionForm 
          onAdd={(newComp) => {
            setCompanions((prev) => [...prev, newComp])
            setIsAdding(false)
          }}
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <>
          {/* Header row */}
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-slate-500">
              Manage companions traveling with {firstName}
            </p>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#0a3f8a]"
            >
              <UserPlus className="h-4 w-4" />
              Add Companion
            </button>
          </div>

      {/* Companion list */}
      {companions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <User className="mb-3 h-10 w-10 opacity-25" />
          <p className="text-[13px]">No companions added</p>
        </div>
      ) : (
        <div className="space-y-2">
          {companions.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white px-5 py-3.5 shadow-sm"
            >
              {/* Avatar */}
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#EAF0FB]">
                <User className="h-4 w-4 text-[#6B8DD6]" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-slate-800">{c.name}</div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {c.relation}&nbsp;•&nbsp;{c.age} years old
                </div>
                <div className="mt-0.5 text-[11px] text-slate-400">ID: {c.documentId}</div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#0B4EA2] transition-colors"
                  aria-label="Edit companion"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                  aria-label="Delete companion"
                  onClick={() => handleDelete(c.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  )
}

function ReservationHistoryTab({ guest }: { guest: GuestDetail }) {
  const formatDate = (iso: string) => {
    if (!iso) return '-'
    const [yyyy, mm, dd] = iso.split('-')
    if (!yyyy || !mm || !dd) return '-'
    return `${mm}/${dd}/${yyyy}`
  }

  const isCheckedOut = guest.status.toLowerCase() === 'checked out'
  const statusBadge = isCheckedOut ? (
    <span className="inline-flex items-center rounded bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
      CHECKED OUT
    </span>
  ) : (
    <span className="inline-flex items-center rounded bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#059669]">
      {guest.status}
    </span>
  )

  return (
    <div className="space-y-3">
      {/* Detail Card */}
      <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        {/* Top row */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#F0F5FD]">
              <CalendarDays className="h-6 w-6 text-[#0B4EA2]" />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-slate-800">
                Room {guest.room} -
              </div>
              <div className="mt-1">{statusBadge}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[14px] font-bold text-slate-800">$480</div>
            <div className="mt-0.5 text-[11px] text-slate-400">fully-paid</div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <div>
            <div className="text-[11.5px] font-medium text-slate-400">Check-in</div>
            <div className="mt-1 text-[13px] font-semibold text-slate-800">
              {formatDate(guest.checkInDate)}
            </div>
          </div>
          <div>
            <div className="text-[11.5px] font-medium text-slate-400">Check-out</div>
            <div className="mt-1 text-[13px] font-semibold text-slate-800">
              {formatDate(guest.checkOutDate)}
            </div>
          </div>

          <div>
            <div className="text-[11.5px] font-medium text-slate-400">Guests</div>
            <div className="mt-1 text-[13px] font-semibold text-slate-800">2</div>
          </div>
          <div>
            <div className="text-[11.5px] font-medium text-slate-400">Booking Source</div>
            <div className="mt-1 text-[13px] font-semibold text-slate-800">Phone</div>
          </div>

          <div className="col-span-2 border-t border-slate-100 pt-5">
            <div className="text-[11.5px] font-medium text-slate-400">Special Requests</div>
            <div className="mt-1 text-[13px] font-semibold text-slate-800">
              Late check-out requested
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function GuestDetailsPopup({ open, onClose, guest: initialGuest }: Props) {
  const dispatch = useAppDispatch()
  const fetchedGuest = useAppSelector((s) => s.guests.selected)
  // const status = useAppSelector((s) => s.guests.status)

  const [activeTab, setActiveTab] = useState<Tab>('details')

  // fetch details when open
  useEffect(() => {
    if (open && initialGuest?.id) {
      void dispatch(fetchGuestById(initialGuest.id))
    }
  }, [dispatch, initialGuest?.id, open])

  // reset tab on open
  useEffect(() => {
    if (open) setActiveTab('details')
  }, [open])

  if (!initialGuest) return null

  // Merge initial info with fetched details if they match
  const guest: GuestDetail = (fetchedGuest && fetchedGuest.id === initialGuest.id) ? {
    ...initialGuest,
    email: fetchedGuest.email || initialGuest.email,
    phone: fetchedGuest.phone || initialGuest.phone,
    passport: fetchedGuest.idNumber || initialGuest.passport,
    nationality: fetchedGuest.nationality || initialGuest.nationality,
    country: fetchedGuest.country || initialGuest.country,
    postalCode: fetchedGuest.postalCode || initialGuest.postalCode,
    dateOfBirth: fetchedGuest.dateOfBirth || initialGuest.dateOfBirth,
    streetAddress: fetchedGuest.streetAddress,
    city: fetchedGuest.city,
    emergencyContactName: fetchedGuest.emergencyContactName,
    emergencyContactPhone: fetchedGuest.emergencyContactPhone,
  } : initialGuest

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'details',    label: 'Guest Details' },
    { key: 'companions', label: 'Companions' },
    { key: 'history',    label: 'Reservation History', badge: guest.reservations },
  ]

  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="flex w-[94vw] max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* ── Blue header ── */}
        <div className="flex items-center gap-4 bg-[#0B4EA2] px-6 py-4">
          {/* Avatar */}
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/20">
            <User className="h-5 w-5 text-white" />
          </div>

          {/* Name */}
          <div className="flex-1">
            <div className="text-[15px] font-bold text-white">{guest.name}</div>
          </div>

          {/* Close */}
          <button
            type="button"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/15"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Tab bar ── */}
        <div className="border-b border-slate-100 px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={[
                  'relative flex items-center gap-1.5 px-3 py-3.5 text-[12px] font-semibold transition-colors',
                  activeTab === tab.key
                    ? 'text-[#0B4EA2]'
                    : 'text-slate-500 hover:text-slate-700',
                ].join(' ')}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                {tab.badge != null && (
                  <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-slate-200 px-1 text-[10px] font-bold text-slate-600">
                    {tab.badge}
                  </span>
                )}
                {/* Active underline */}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0B4EA2]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
          {/* Guest ID explicitly placed above the active tab so it's always visible */}
          <div className="mb-5 text-[12.5px] font-medium text-[#8F9BB3]">
            Guest ID: {guest.id.toLowerCase()}
          </div>

          {activeTab === 'details'    && <GuestDetailsTab guest={guest} />}
          {activeTab === 'companions' && <CompanionsTab guest={guest} />}
          {activeTab === 'history'    && <ReservationHistoryTab guest={guest} />}
        </div>

      </div>
    </Modal>
  )
}

