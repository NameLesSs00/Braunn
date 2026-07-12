import { useEffect, useMemo, useState } from 'react'
import { BedDouble, CheckCircle2, CreditCard, Pencil, Plus, Search, Trash2, X } from 'lucide-react'

import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { fetchRoomTypes } from '../../../features/roomTypes/roomTypesSlice'
import { fetchRatePlans } from '../../../features/ratePlans/ratePlansSlice'
import { fetchFinancialServices } from '../../../features/adminFinancialSettings/financialSettingsSlice'
import { fetchMealPlans } from '../../../features/admin/mealPlansSlice'

type WizardStep = 1 | 2 | 3 | 4
type Mode = 'wizard' | 'reservationForm'

type GroupInfo = {
  groupName: string
  contactPerson: string
  email: string
  phone: string
  status: string
  arrivalDate: string
  departureDate: string
  discountPercentage: string
  notes: string
}

type RoomRequest = {
  id: number
  roomTypeId: string
  roomTypeName: string
  quantity: number
  adults: number
  children: number
  ratePerNight: string
  ratePlanCode: string
}

type GroupReservation = {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  nationalId: string
  country: string
  address: string
  reservationType: string
  currency: string
  specialRequests: string
  roomRequests: RoomRequest[]
  mealPlanId: string
  mealPlanName: string
  serviceIds: string[]
  serviceNames: string[]
  paymentStatus: 'Pending' | 'Partial' | 'Paid'
  status: 'Draft' | 'Confirmed'
}

type ReservationForm = Omit<GroupReservation, 'id' | 'mealPlanName' | 'serviceNames' | 'paymentStatus' | 'status'>

type Props = {
  open: boolean
  onClose: () => void
}

const emptyGroupInfo: GroupInfo = {
  groupName: '',
  contactPerson: '',
  email: '',
  phone: '',
  status: '',
  arrivalDate: '',
  departureDate: '',
  discountPercentage: '0',
  notes: '',
}

const emptyRoomRequest = (id = 1): RoomRequest => ({
  id,
  roomTypeId: '',
  roomTypeName: '',
  quantity: 1,
  adults: 2,
  children: 0,
  ratePerNight: '',
  ratePlanCode: '',
})

const emptyReservationForm = (): ReservationForm => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  nationalId: '',
  country: '',
  address: '',
  reservationType: '',
  currency: 'USD',
  specialRequests: '',
  roomRequests: [emptyRoomRequest()],
  mealPlanId: '',
  serviceIds: [],
})

function formatDate(value: string) {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function nightsBetween(arrivalDate: string, departureDate: string) {
  if (!arrivalDate || !departureDate) return 0
  const start = new Date(`${arrivalDate}T00:00:00`)
  const end = new Date(`${departureDate}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
  return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / 86400000))
}

function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.trim().toUpperCase() || 'G'
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  type?: 'text' | 'email' | 'tel' | 'number' | 'date'
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[12px] font-bold text-slate-700">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0B4EA2]"
      />
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[12px] font-bold text-slate-700">{label}</div>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[84px] w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0B4EA2]"
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  required?: boolean
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[12px] font-bold text-slate-700">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-700 outline-none transition-colors focus:border-[#0B4EA2]"
        >
          <option value="">select</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">v</span>
      </div>
    </label>
  )
}

function Stepper({ step }: { step: WizardStep }) {
  const labels = ['Group Info', 'Reservations', 'Payment', 'Confirmation']

  return (
    <div className="mx-auto flex w-full max-w-[620px] items-center justify-between py-16">
      {labels.map((label, index) => {
        const number = (index + 1) as WizardStep
        const active = number === step

        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-3">
              <div
                className={[
                  'grid h-14 w-14 place-items-center rounded-full text-xl font-medium',
                  active ? 'bg-[#0B4EA2] text-white' : 'bg-slate-200 text-slate-700',
                ].join(' ')}
              >
                {number}
              </div>
              <div className="whitespace-nowrap text-sm font-medium text-slate-900">{label}</div>
            </div>
            {index < labels.length - 1 ? <div className="mx-7 mb-8 h-1 flex-1 bg-slate-200" /> : null}
          </div>
        )
      })}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 text-sm font-extrabold text-slate-800">
        {title}
      </div>
      <div className="p-6">{children}</div>
    </section>
  )
}

export function GroupReservationModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch()
  const roomTypesState = useAppSelector((state) => state.roomTypes)
  const ratePlansState = useAppSelector((state) => state.ratePlans)
  const financialSettings = useAppSelector((state) => state.financialSettings)
  const mealPlansState = useAppSelector((state) => state.mealPlans)

  const [mode, setMode] = useState<Mode>('wizard')
  const [step, setStep] = useState<WizardStep>(1)
  const [groupInfo, setGroupInfo] = useState<GroupInfo>(emptyGroupInfo)
  const [reservations, setReservations] = useState<GroupReservation[]>([])
  const [reservationForm, setReservationForm] = useState<ReservationForm>(() => emptyReservationForm())
  const [editingReservationId, setEditingReservationId] = useState<number | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) return
    if (roomTypesState.status === 'idle') dispatch(fetchRoomTypes())
    if (ratePlansState.status === 'idle') dispatch(fetchRatePlans())
    if (financialSettings.status === 'idle') dispatch(fetchFinancialServices())
    if (mealPlansState.status === 'idle') dispatch(fetchMealPlans())
  }, [dispatch, financialSettings.status, mealPlansState.status, open, ratePlansState.status, roomTypesState.status])

  useEffect(() => {
    if (!open) {
      setMode('wizard')
      setStep(1)
      setGroupInfo(emptyGroupInfo)
      setReservations([])
      setReservationForm(emptyReservationForm())
      setEditingReservationId(null)
      setQuery('')
    }
  }, [open])

  const roomTypeOptions = useMemo(
    () => roomTypesState.items.map((roomType) => ({ value: roomType.id, label: roomType.name })),
    [roomTypesState.items],
  )

  const ratePlanOptions = useMemo(
    () => ratePlansState.items.filter((ratePlan) => ratePlan.isActive).map((ratePlan) => ({ value: ratePlan.code, label: ratePlan.code })),
    [ratePlansState.items],
  )

  const mealPlanOptions = useMemo(
    () => mealPlansState.items.map((mealPlan) => ({ value: mealPlan.id, label: mealPlan.name })),
    [mealPlansState.items],
  )

  const serviceOptions = useMemo(
    () => financialSettings.services.map((service) => ({ value: service.id, label: service.name })),
    [financialSettings.services],
  )

  const nights = nightsBetween(groupInfo.arrivalDate, groupInfo.departureDate)

  const totals = useMemo(() => {
    return reservations.reduce(
      (acc, reservation) => {
        const reservationRooms = reservation.roomRequests.reduce((sum, room) => sum + room.quantity, 0)
        const reservationGuests = reservation.roomRequests.reduce((sum, room) => sum + (room.adults + room.children) * room.quantity, 0)
        const reservationAmount = reservation.roomRequests.reduce((sum, room) => {
          const rate = Number(room.ratePerNight) || 0
          return sum + rate * room.quantity * Math.max(1, nights)
        }, 0)

        return {
          rooms: acc.rooms + reservationRooms,
          guests: acc.guests + reservationGuests,
          amount: acc.amount + reservationAmount,
        }
      },
      { rooms: 0, guests: 0, amount: 0 },
    )
  }, [nights, reservations])

  const filteredReservations = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return reservations
    return reservations.filter((reservation) =>
      [
        reservation.firstName,
        reservation.lastName,
        reservation.email,
        reservation.phone,
        reservation.roomRequests.map((room) => room.roomTypeName).join(' '),
      ].some((value) => value.toLowerCase().includes(normalized)),
    )
  }, [query, reservations])

  const updateGroupInfo = (patch: Partial<GroupInfo>) => {
    setGroupInfo((current) => ({ ...current, ...patch }))
  }

  const updateRoomRequest = (id: number, patch: Partial<RoomRequest>) => {
    setReservationForm((current) => ({
      ...current,
      roomRequests: current.roomRequests.map((room) => (room.id === id ? { ...room, ...patch } : room)),
    }))
  }

  const addRoomRequest = () => {
    setReservationForm((current) => {
      const nextId = current.roomRequests.length ? Math.max(...current.roomRequests.map((room) => room.id)) + 1 : 1
      return { ...current, roomRequests: [...current.roomRequests, emptyRoomRequest(nextId)] }
    })
  }

  const removeRoomRequest = (id: number) => {
    setReservationForm((current) => ({
      ...current,
      roomRequests: current.roomRequests.length > 1 ? current.roomRequests.filter((room) => room.id !== id) : current.roomRequests,
    }))
  }

  const openReservationForm = (reservation?: GroupReservation) => {
    if (reservation) {
      setEditingReservationId(reservation.id)
      setReservationForm({
        firstName: reservation.firstName,
        lastName: reservation.lastName,
        email: reservation.email,
        phone: reservation.phone,
        nationalId: reservation.nationalId,
        country: reservation.country,
        address: reservation.address,
        reservationType: reservation.reservationType,
        currency: reservation.currency,
        specialRequests: reservation.specialRequests,
        roomRequests: reservation.roomRequests,
        mealPlanId: reservation.mealPlanId,
        serviceIds: reservation.serviceIds,
      })
    } else {
      setEditingReservationId(null)
      setReservationForm(emptyReservationForm())
    }
    setMode('reservationForm')
  }

  const saveReservationForm = () => {
    const selectedMealPlan = mealPlansState.items.find((mealPlan) => mealPlan.id === reservationForm.mealPlanId)
    const selectedServices = financialSettings.services.filter((service) => reservationForm.serviceIds.includes(service.id))

    const saved: GroupReservation = {
      ...reservationForm,
      id: editingReservationId ?? Date.now(),
      mealPlanName: selectedMealPlan?.name || '',
      serviceNames: selectedServices.map((service) => service.name),
      paymentStatus: editingReservationId ? reservations.find((reservation) => reservation.id === editingReservationId)?.paymentStatus ?? 'Pending' : 'Pending',
      status: 'Confirmed',
    }

    setReservations((current) =>
      editingReservationId
        ? current.map((reservation) => (reservation.id === editingReservationId ? saved : reservation))
        : [...current, saved],
    )
    setReservationForm(emptyReservationForm())
    setEditingReservationId(null)
    setMode('wizard')
    setStep(2)
  }

  const removeReservation = (id: number) => {
    setReservations((current) => current.filter((reservation) => reservation.id !== id))
  }

  const handleClose = () => {
    setMode('wizard')
    onClose()
  }

  if (!open) return null

  const footerBackLabel = step === 1 ? 'cancel' : 'Back'
  const canGoNext = step !== 2 || reservations.length > 0

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto bg-slate-900/45 p-4">
      <div className="mx-auto min-h-[calc(100vh-2rem)] w-full max-w-7xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="sticky top-0 z-20 flex h-[100px] items-center justify-between bg-[#0B4EA2] px-10 text-white">
          <h2 className="text-2xl font-bold">{mode === 'reservationForm' ? 'Add Reservation' : 'Group Reservation'}</h2>
          <div className="flex items-center gap-24">
            <span className="inline-flex h-7 min-w-[96px] items-center justify-center rounded-full bg-emerald-100 px-5 text-sm font-bold text-emerald-700">
              Group
            </span>
            <button type="button" onClick={handleClose} className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10" aria-label="Close">
              <X className="h-8 w-8" />
            </button>
          </div>
        </div>

        {mode === 'reservationForm' ? (
          <ReservationFormView
            form={reservationForm}
            roomTypeOptions={roomTypeOptions}
            ratePlanOptions={ratePlanOptions}
            mealPlanOptions={mealPlanOptions}
            serviceOptions={serviceOptions}
            onChange={(patch) => setReservationForm((current) => ({ ...current, ...patch }))}
            onRoomChange={updateRoomRequest}
            onAddRoomRequest={addRoomRequest}
            onRemoveRoomRequest={removeRoomRequest}
            onCancel={() => {
              setReservationForm(emptyReservationForm())
              setEditingReservationId(null)
              setMode('wizard')
            }}
            onSave={saveReservationForm}
          />
        ) : (
          <>
            <div className="px-10">
              <Stepper step={step} />
            </div>

            <main className="mx-auto w-full max-w-[1188px] px-10 pb-6">
              {step === 1 ? (
                <GroupInfoStep groupInfo={groupInfo} onChange={updateGroupInfo} />
              ) : step === 2 ? (
                <ReservationsStep
                  groupInfo={groupInfo}
                  nights={nights}
                  totals={totals}
                  reservations={filteredReservations}
                  allReservationCount={reservations.length}
                  query={query}
                  onQueryChange={setQuery}
                  onAddReservation={() => openReservationForm()}
                  onEditReservation={openReservationForm}
                  onRemoveReservation={removeReservation}
                />
              ) : step === 3 ? (
                <PaymentStep groupInfo={groupInfo} totals={totals} reservations={reservations} />
              ) : (
                <ConfirmationStep groupInfo={groupInfo} totals={totals} reservations={reservations} />
              )}
            </main>

            <div className="sticky bottom-0 flex items-center justify-between bg-white px-20 py-8">
              <button
                type="button"
                className="h-14 min-w-[200px] rounded-xl border-2 border-slate-400 px-8 text-lg font-bold text-slate-500 transition-colors hover:bg-slate-50"
                onClick={() => {
                  if (step === 1) {
                    handleClose()
                    return
                  }
                  setStep((current) => (current > 1 ? ((current - 1) as WizardStep) : current))
                }}
              >
                {footerBackLabel}
              </button>
              <button
                type="button"
                disabled={!canGoNext}
                className={[
                  'h-14 min-w-[236px] rounded-xl px-10 text-lg font-bold text-white transition-colors',
                  canGoNext ? 'bg-[#0B4EA2] hover:bg-[#093d81]' : 'cursor-not-allowed bg-blue-300',
                ].join(' ')}
                onClick={() => {
                  if (step === 4) {
                    handleClose()
                    return
                  }
                  setStep((current) => (current < 4 ? ((current + 1) as WizardStep) : current))
                }}
              >
                {step === 4 ? 'Finish' : 'Next'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function GroupInfoStep({ groupInfo, onChange }: { groupInfo: GroupInfo; onChange: (patch: Partial<GroupInfo>) => void }) {
  return (
    <div className="mx-auto max-w-[780px]">
      <div className="mb-9 border-b border-slate-100 bg-slate-50 px-5 py-4">
        <h3 className="text-xl font-bold text-slate-900">Group Information</h3>
        <p className="mt-1 text-sm text-slate-500">Basic details about the group booking</p>
      </div>

      <div className="space-y-4">
        <Field label="Group Name" required placeholder="e.g. TechCorp Annual Conference 2026" value={groupInfo.groupName} onChange={(value) => onChange({ groupName: value })} />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Contact Person" required placeholder="Full name" value={groupInfo.contactPerson} onChange={(value) => onChange({ contactPerson: value })} />
          <Field label="Email" type="email" placeholder="contact@company.com" value={groupInfo.email} onChange={(value) => onChange({ email: value })} />
          <Field label="Phone" type="tel" placeholder="+1 000-000-0000" value={groupInfo.phone} onChange={(value) => onChange({ phone: value })} />
          <Field label="Status" value={groupInfo.status} onChange={(value) => onChange({ status: value })} />
          <Field label="Arrival Date" required type="date" value={groupInfo.arrivalDate} onChange={(value) => onChange({ arrivalDate: value })} />
          <Field label="Departure Date" required type="date" value={groupInfo.departureDate} onChange={(value) => onChange({ departureDate: value })} />
        </div>
        <Field label="Group Discount (%)" type="number" value={groupInfo.discountPercentage} onChange={(value) => onChange({ discountPercentage: value })} />
        <TextArea label="Notes" placeholder="Special requirements, notes for the front desk team..." value={groupInfo.notes} onChange={(value) => onChange({ notes: value })} />
      </div>
    </div>
  )
}

function ReservationsStep({
  groupInfo,
  nights,
  totals,
  reservations,
  allReservationCount,
  query,
  onQueryChange,
  onAddReservation,
  onEditReservation,
  onRemoveReservation,
}: {
  groupInfo: GroupInfo
  nights: number
  totals: { rooms: number; guests: number; amount: number }
  reservations: GroupReservation[]
  allReservationCount: number
  query: string
  onQueryChange: (value: string) => void
  onAddReservation: () => void
  onEditReservation: (reservation: GroupReservation) => void
  onRemoveReservation: (id: number) => void
}) {
  const stats = [
    { value: formatDate(groupInfo.arrivalDate) || '-', label: 'Arrival' },
    { value: formatDate(groupInfo.departureDate) || '-', label: 'Departure' },
    { value: String(nights), label: 'Nights' },
    { value: String(totals.rooms), label: 'Rooms Reserved' },
    { value: String(totals.guests), label: 'Guests' },
    { value: `$${totals.amount.toLocaleString()}`, label: 'Total Revenue' },
  ]

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-5 border-t border-slate-200 pt-5 lg:flex-row lg:items-center">
        <div className="grid flex-1 grid-cols-2 gap-5 md:grid-cols-6">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-base font-extrabold text-slate-900">{stat.value}</div>
              <div className="mt-1 text-xs font-medium text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0B4EA2] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#093d81]"
          onClick={onAddReservation}
        >
          <Plus className="h-4 w-4" />
          Add Reservation
        </button>
      </div>

      <div className="relative">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="h-14 w-full rounded-full bg-[#F3F1FB] px-6 pr-14 text-base text-slate-700 outline-none placeholder:text-slate-500"
          placeholder="Search reservations"
        />
        <Search className="pointer-events-none absolute right-6 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400" />
      </div>

      {reservations.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 text-slate-500">
          <BedDouble className="h-8 w-8 text-slate-300" />
          <div className="font-medium">{allReservationCount === 0 ? 'No reservations yet' : 'No reservations match your search'}</div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {['Guest', 'Type', 'Rooms', 'Meal Plan', 'Services', 'Amount', 'Payment', 'Status', 'Action'].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map((reservation) => {
                  const roomSummary = reservation.roomRequests.map((room) => `${room.quantity}x ${room.roomTypeName || 'Room'}`).join(', ')
                  const amount = reservation.roomRequests.reduce((sum, room) => sum + (Number(room.ratePerNight) || 0) * room.quantity * Math.max(1, nights), 0)
                  return (
                    <tr key={reservation.id}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-xs font-extrabold text-[#0B4EA2]">
                            {initials(reservation.firstName, reservation.lastName)}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900">{[reservation.firstName, reservation.lastName].filter(Boolean).join(' ') || 'Guest'}</div>
                            <div className="text-xs text-slate-400">{reservation.email || reservation.phone || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">{reservation.reservationType || '-'}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{roomSummary}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{reservation.mealPlanName || '-'}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {reservation.serviceNames.length ? (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{reservation.serviceNames.length} services</span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-4 text-sm font-extrabold text-slate-900">${amount.toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{reservation.paymentStatus}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{reservation.status}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <button type="button" className="text-slate-600 hover:text-[#0B4EA2]" onClick={() => onEditReservation(reservation)} aria-label="Edit reservation">
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button type="button" className="text-rose-500 hover:text-rose-700" onClick={() => onRemoveReservation(reservation.id)} aria-label="Remove reservation">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm font-medium text-slate-500">
            <span>{reservations.length} reservations</span>
            <span className="font-bold text-slate-700">Total: ${totals.amount.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function ReservationFormView({
  form,
  roomTypeOptions,
  ratePlanOptions,
  mealPlanOptions,
  serviceOptions,
  onChange,
  onRoomChange,
  onAddRoomRequest,
  onRemoveRoomRequest,
  onCancel,
  onSave,
}: {
  form: ReservationForm
  roomTypeOptions: { value: string; label: string }[]
  ratePlanOptions: { value: string; label: string }[]
  mealPlanOptions: { value: string; label: string }[]
  serviceOptions: { value: string; label: string }[]
  onChange: (patch: Partial<ReservationForm>) => void
  onRoomChange: (id: number, patch: Partial<RoomRequest>) => void
  onAddRoomRequest: () => void
  onRemoveRoomRequest: (id: number) => void
  onCancel: () => void
  onSave: () => void
}) {
  return (
    <div className="mx-auto max-w-[770px] px-6 py-14">
      <div className="space-y-5">
        <Section title="Guest Information">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="First Name" value={form.firstName} onChange={(value) => onChange({ firstName: value })} />
            <Field label="Last Name" value={form.lastName} onChange={(value) => onChange({ lastName: value })} />
            <Field label="Email" type="email" value={form.email} onChange={(value) => onChange({ email: value })} />
            <Field label="Phone" type="tel" value={form.phone} onChange={(value) => onChange({ phone: value })} />
            <Field label="National ID" value={form.nationalId} onChange={(value) => onChange({ nationalId: value })} />
            <Field label="Country" value={form.country} onChange={(value) => onChange({ country: value })} />
            <div className="md:col-span-2">
              <Field label="Address" value={form.address} onChange={(value) => onChange({ address: value })} />
            </div>
          </div>
        </Section>

        <Section title="Reservation Details">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SelectField
              label="Reservation Type"
              value={form.reservationType}
              onChange={(value) => onChange({ reservationType: value })}
              options={[
                { value: 'Corporate', label: 'Corporate' },
                { value: 'Family', label: 'Family' },
                { value: 'Tour', label: 'Tour' },
                { value: 'Event', label: 'Event' },
              ]}
            />
            <SelectField
              label="Currency"
              value={form.currency}
              onChange={(value) => onChange({ currency: value })}
              options={[
                { value: 'USD', label: 'USD' },
                { value: 'EUR', label: 'EUR' },
                { value: 'EGP', label: 'EGP' },
              ]}
            />
            <div className="md:col-span-2">
              <TextArea label="Special Requests" placeholder="High floor, city view, non-smoking..." value={form.specialRequests} onChange={(value) => onChange({ specialRequests: value })} />
            </div>
          </div>
        </Section>

        <Section title="Room Requests">
          <div className="space-y-3">
            {form.roomRequests.map((room, index) => (
              <div key={room.id} className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Room Type {index + 1}</div>
                  {form.roomRequests.length > 1 ? (
                    <button type="button" className="text-rose-400 hover:text-rose-600" onClick={() => onRemoveRoomRequest(room.id)} aria-label="Remove room request">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                  <div className="md:col-span-3">
                    <SelectField
                      label="Room Type"
                      value={room.roomTypeId}
                      options={roomTypeOptions}
                      onChange={(value) => {
                        const selected = roomTypeOptions.find((option) => option.value === value)
                        onRoomChange(room.id, { roomTypeId: value, roomTypeName: selected?.label || '' })
                      }}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Field label="Qty" type="number" value={String(room.quantity)} onChange={(value) => onRoomChange(room.id, { quantity: Math.max(1, Number(value) || 1) })} />
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Adults" type="number" value={String(room.adults)} onChange={(value) => onRoomChange(room.id, { adults: Math.max(1, Number(value) || 1) })} />
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Children" type="number" value={String(room.children)} onChange={(value) => onRoomChange(room.id, { children: Math.max(0, Number(value) || 0) })} />
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Rate/Night ($)" type="number" value={room.ratePerNight} onChange={(value) => onRoomChange(room.id, { ratePerNight: value })} />
                  </div>
                  <div className="md:col-span-6">
                    <SelectField label="Rate Plan" value={room.ratePlanCode} options={ratePlanOptions} onChange={(value) => onRoomChange(room.id, { ratePlanCode: value })} />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 text-sm font-bold text-[#0B4EA2] hover:bg-blue-50"
              onClick={onAddRoomRequest}
            >
              <Plus className="h-4 w-4" />
              Add Another Room Type
            </button>
          </div>
        </Section>

        <Section title="Meal Plans">
          <div className="flex justify-end">
            <SelectField label="Meal Plan" value={form.mealPlanId} options={mealPlanOptions} onChange={(value) => onChange({ mealPlanId: value })} />
          </div>
        </Section>

        <Section title="Additional Services">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {serviceOptions.length === 0 ? (
              <div className="text-sm text-slate-400">No services available.</div>
            ) : (
              serviceOptions.map((service) => (
                <label key={service.value} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.serviceIds.includes(service.value)}
                    onChange={(event) => {
                      onChange({
                        serviceIds: event.target.checked
                          ? [...form.serviceIds, service.value]
                          : form.serviceIds.filter((id) => id !== service.value),
                      })
                    }}
                  />
                  {service.label}
                </label>
              ))
            )}
          </div>
        </Section>
      </div>

      <div className="sticky bottom-0 mt-6 flex items-center justify-between bg-white py-6">
        <button type="button" className="h-14 min-w-[192px] rounded-xl border-2 border-slate-400 px-8 text-lg font-bold text-slate-500 hover:bg-slate-50" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="h-14 min-w-[228px] rounded-xl bg-[#0B4EA2] px-8 text-lg font-bold text-white hover:bg-[#093d81]" onClick={onSave}>
          Save
        </button>
      </div>
    </div>
  )
}

function PaymentStep({
  groupInfo,
  totals,
  reservations,
}: {
  groupInfo: GroupInfo
  totals: { rooms: number; guests: number; amount: number }
  reservations: GroupReservation[]
}) {
  const discount = Math.max(0, Number(groupInfo.discountPercentage) || 0)
  const discountAmount = totals.amount * (discount / 100)
  const grandTotal = Math.max(0, totals.amount - discountAmount)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-[#0B4EA2]">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Group Payment</h3>
            <p className="text-sm text-slate-500">Review the group totals before confirmation.</p>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <SummaryRow label="Group" value={groupInfo.groupName || '-'} />
          <SummaryRow label="Reservations" value={String(reservations.length)} />
          <SummaryRow label="Rooms Reserved" value={String(totals.rooms)} />
          <SummaryRow label="Guests" value={String(totals.guests)} />
          <SummaryRow label="Subtotal" value={`$${totals.amount.toLocaleString()}`} />
          <SummaryRow label={`Discount (${discount}%)`} value={`-$${discountAmount.toLocaleString()}`} />
          <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-5 py-4 text-lg font-extrabold text-[#0B4EA2]">
            <span>Grand Total</span>
            <span>${grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfirmationStep({
  groupInfo,
  totals,
  reservations,
}: {
  groupInfo: GroupInfo
  totals: { rooms: number; guests: number; amount: number }
  reservations: GroupReservation[]
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center rounded-xl border border-slate-200 bg-white px-8 py-12 text-center">
      <div className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-11 w-11" />
      </div>
      <h3 className="text-2xl font-extrabold text-slate-900">Group Reservation Ready</h3>
      <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
        {groupInfo.groupName || 'This group'} has {reservations.length} reservations, {totals.rooms} rooms, and {totals.guests} guests prepared for the front desk team.
      </p>
      <div className="mt-8 grid w-full grid-cols-1 gap-3 text-left md:grid-cols-3">
        <Metric label="Reservations" value={String(reservations.length)} />
        <Metric label="Rooms" value={String(totals.rooms)} />
        <Metric label="Total" value={`$${totals.amount.toLocaleString()}`} />
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="font-extrabold text-slate-900">{value}</span>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-2 text-xl font-extrabold text-slate-900">{value}</div>
    </div>
  )
}
