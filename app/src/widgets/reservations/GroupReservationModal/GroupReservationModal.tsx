import { useEffect, useMemo, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import { BedDouble, CheckCircle2, CreditCard, Loader2, Pencil, Plus, Search, Trash2, X } from 'lucide-react'

import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { fetchRoomTypes } from '../../../features/roomTypes/roomTypesSlice'
import { fetchRatePlans } from '../../../features/ratePlans/ratePlansSlice'
import { fetchLocalARIRates, type LocalARIState } from '../../../features/localAri/localAriSlice'
import { fetchRoomsAvailability } from '../../../features/rooms/roomsSlice'
import { fetchFinancialServices } from '../../../features/adminFinancialSettings/financialSettingsSlice'
import { fetchMealPlans } from '../../../features/admin/mealPlansSlice'
import { Modal } from '../../../shared/ui/Modal'
import { createGroupReservation } from '../../../shared/apis/GroupReservations'
import { createReservationPayment, type ReservationPaymentMethod, type ReservationPaymentType } from '../../../shared/apis/PmsReservation'
import {
  removeGroupReservationDraftNotification,
  upsertGroupReservationDraftNotification,
} from '../../../features/notifications/notificationsSlice'
import {
  hasMeaningfulGroupReservationData,
  removeSavedGroupReservationDraft,
  saveGroupReservationDraft,
} from '../../../features/reservations/groupReservationDraftStorage'
import type {
  CreateGroupReservationRequest,
  CreateGroupReservationResponse,
  GroupInfoDraft,
  GroupPaymentDraft,
  GroupCompanionDraft,
  GroupReservationDraftItem,
  GroupReservationDraftValue,
  GroupReservationFormDraft,
  GroupRoomRequestDraft,
  GroupSelectedMealPlanDraft,
  GroupSelectedServiceDraft,
  GroupWizardStep,
} from '../../../models/GroupReservation'
import type { RoomAvailability } from '../../../models/Room'

countries.registerLocale(enLocale)

type Mode = 'wizard' | 'reservationForm'
type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'
type RoomsAvailabilityState = {
  availability: RoomAvailability[]
  availabilityStatus: AsyncStatus
}

type Props = {
  open: boolean
  activeDraftId: string | null
  initialDraft: GroupReservationDraftValue | null
  initialStep: GroupWizardStep
  onActiveDraftIdChange: (draftId: string | null) => void
  onClose: () => void
}

function todayDate() {
  return new Date().toISOString().split('T')[0]
}

const emptyGroupInfo: GroupInfoDraft = {
  groupName: '',
  contactPerson: '',
  email: '',
  phone: '',
  status: 'Confirmed',
  arrivalDate: todayDate(),
  departureDate: '',
  discountPercentage: '0',
  notes: '',
}

const emptyPayment = (): GroupPaymentDraft => ({
  amount: '',
  currency: 'EUR',
  paymentMethod: 'Card',
  paymentReference: '',
  paymentDate: todayDate(),
  paymentType: 'Deposit',
  method: 'Card',
})

const emptyRoomRequest = (id = 1): GroupRoomRequestDraft => ({
  id,
  roomTypeId: '',
  roomTypeName: '',
  quantity: 1,
  adults: 2,
  children: 0,
  ratePlanCode: '',
  rateTotal: 0,
})

const emptyCompanion = (id = 1): GroupCompanionDraft => ({
  id,
  firstName: '',
  lastName: '',
  phoneNumber: '',
  email: '',
  address: '',
  nationalId: '',
})

const emptySelectedService = (id = 1, serviceDate = todayDate()): GroupSelectedServiceDraft => ({
  id,
  additionalServiceId: '',
  serviceDate,
  price: 0,
})

const emptySelectedMealPlan = (id = 1, serviceDateStart = todayDate()): GroupSelectedMealPlanDraft => ({
  id,
  mealPlanId: '',
  serviceDateStart,
  numberOfDays: 1,
  price: 0,
})

const emptyReservationForm = (): GroupReservationFormDraft => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  nationalId: '',
  country: '',
  address: '',
  reservationType: 'Normal',
  currency: 'EUR',
  specialRequests: '',
  roomRequests: [emptyRoomRequest()],
  selectedMealPlans: [],
  selectedServices: [],
  companions: [],
})

const emptyGroupDraft = (): GroupReservationDraftValue => ({
  groupInfo: emptyGroupInfo,
  reservations: [],
  payment: emptyPayment(),
})

function formatDate(value: string) {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatMoney(value: number | undefined | null, currency = '$') {
  const amount = Number(value) || 0
  return `${currency} ${amount.toFixed(2)}`
}

function nightsBetween(arrivalDate: string, departureDate: string) {
  if (!arrivalDate || !departureDate) return 0
  const start = new Date(`${arrivalDate}T00:00:00`)
  const end = new Date(`${departureDate}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
  return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / 86400000))
}

function dateOnly(value?: string | null) {
  return (value || '').split('T')[0].split(' ')[0]
}

function isBillableStayDate(date: string | null | undefined, arrivalDate: string, departureDate: string) {
  const rateDate = dateOnly(date)
  if (!rateDate) return false
  if (arrivalDate && rateDate < arrivalDate) return false
  if (departureDate && rateDate >= departureDate) return false
  return true
}

function sumBillableRates(
  rates: LocalARIState['rates'],
  arrivalDate: string,
  departureDate: string,
) {
  return rates
    .filter((rate) => isBillableStayDate(rate.date, arrivalDate, departureDate))
    .reduce((sum, rate) => sum + (rate.amountBeforeTax ?? rate.basePriceBeforeTax ?? 0), 0)
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Operation failed'
}

function isPossiblyStillProcessingError(message: string) {
  return /timeout|timed out|failed to fetch|network|request failed \(408\)|request failed \(502\)|request failed \(503\)|request failed \(504\)/i.test(message)
}

function toStayServiceDateTime(date: string) {
  return date ? `${date}T12:00:00.000Z` : new Date().toISOString()
}

function dateWithinStay(date: string, arrivalDate: string, departureDate: string) {
  if (!date) return arrivalDate || todayDate()
  if (arrivalDate && date < arrivalDate) return arrivalDate
  if (departureDate && date > departureDate) return arrivalDate || departureDate
  return date
}

function maxDaysWithinStay(startDate: string, departureDate: string) {
  if (!startDate || !departureDate) return 1
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${departureDate}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) || 1)
}

function extractCreatedReservationIds(result: CreateGroupReservationResponse) {
  const ids = new Set<string>()

  result.reservationIds?.forEach((id) => {
    if (id) ids.add(id)
  })

  ;[result.reservations, result.childReservations, result.localReservations].forEach((items) => {
    items?.forEach((item) => {
      const id = item.reservationId || item.id
      if (id) ids.add(id)
    })
  })

  return [...ids]
}

function getCreatedGroupChildren(result: CreateGroupReservationResponse | null | undefined) {
  return result?.childReservations?.length
    ? result.childReservations
    : result?.reservations?.length
      ? result.reservations
      : result?.localReservations ?? []
}

function getCreatedGroupCurrency(result: CreateGroupReservationResponse | null | undefined, fallback = 'USD') {
  return getCreatedGroupChildren(result).find((child) => child.currency)?.currency || fallback
}

function getCreatedGroupRemainingTotal(result: CreateGroupReservationResponse | null | undefined) {
  const remaining = getCreatedGroupChildren(result).reduce((sum, child) => sum + Math.max(0, Number(child.remainingBalance) || 0), 0)
  return remaining || Math.max(0, Number(result?.totalAfterDiscount) || 0)
}

function buildPaymentAllocations(result: CreateGroupReservationResponse | null, fallbackReservationIds: string[], paymentAmount: number) {
  const children = getCreatedGroupChildren(result)
    .map((child) => ({
      reservationId: child.reservationId || child.id || '',
      remainingBalance: Math.max(0, Number(child.remainingBalance) || Number(child.finalTotal) || 0),
      currency: child.currency || null,
    }))
    .filter((child) => child.reservationId)

  if (!children.length) {
    const equalAmount = paymentAmount / Math.max(1, fallbackReservationIds.length)
    return fallbackReservationIds.map((reservationId) => ({ reservationId, amount: equalAmount, currency: null as string | null }))
  }

  const totalRemaining = children.reduce((sum, child) => sum + child.remainingBalance, 0)
  if (totalRemaining <= 0) {
    const equalAmount = paymentAmount / children.length
    return children.map((child) => ({ reservationId: child.reservationId, amount: equalAmount, currency: child.currency }))
  }

  let allocated = 0
  return children.map((child, index) => {
    const isLast = index === children.length - 1
    const amount = isLast ? Math.max(0, paymentAmount - allocated) : Math.min(child.remainingBalance, paymentAmount * (child.remainingBalance / totalRemaining))
    allocated += amount
    return { reservationId: child.reservationId, amount, currency: child.currency }
  }).filter((allocation) => allocation.amount > 0)
}

function normalizeGroupDraft(draft: GroupReservationDraftValue): GroupReservationDraftValue {
  return {
    groupInfo: {
      ...emptyGroupInfo,
      ...draft.groupInfo,
      status: draft.groupInfo.status || 'Confirmed',
      arrivalDate: draft.groupInfo.arrivalDate || todayDate(),
    },
    reservations: draft.reservations.map((reservation) => ({
      ...reservation,
      reservationType: reservation.reservationType || 'Normal',
      companions: reservation.companions ?? [],
      selectedMealPlans: reservation.selectedMealPlans ?? ((reservation as any).mealPlanId ? [{
        id: 1,
        mealPlanId: (reservation as any).mealPlanId,
        serviceDateStart: draft.groupInfo.arrivalDate || todayDate(),
        numberOfDays: Math.max(1, nightsBetween(draft.groupInfo.arrivalDate, draft.groupInfo.departureDate) || 1),
        price: 0,
      }] : []),
      selectedServices: reservation.selectedServices ?? (((reservation as any).serviceIds || []) as string[]).map((additionalServiceId, index) => ({
        id: index + 1,
        additionalServiceId,
        serviceDate: draft.groupInfo.arrivalDate || todayDate(),
        price: 0,
      })),
      roomRequests: reservation.roomRequests.map((room) => ({
        ...room,
        ratePlanCode: room.ratePlanCode || '',
        rateTotal: room.rateTotal || 0,
      })),
    })),
    payment: {
      ...emptyPayment(),
      ...draft.payment,
      paymentDate: draft.payment?.paymentDate || todayDate(),
    },
  }
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
  min,
  max,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  type?: 'text' | 'email' | 'tel' | 'number' | 'date'
  min?: string
  max?: string
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[12px] font-bold text-slate-700">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </div>
      <input
        type={type}
        min={min}
        max={max}
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

function Stepper({ step }: { step: GroupWizardStep }) {
  const labels = ['Group Info', 'Reservations', 'Confirmation', 'Payment']

  return (
    <div className="mx-auto flex w-full max-w-[560px] items-center justify-between py-4">
      {labels.map((label, index) => {
        const number = (index + 1) as GroupWizardStep
        const active = number === step
        const done = number < step

        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={[
                  'grid h-10 w-10 place-items-center rounded-full text-sm font-semibold',
                  done ? 'bg-emerald-500 text-white' : active ? 'bg-[#0B4EA2] text-white' : 'bg-slate-200 text-slate-700',
                ].join(' ')}
              >
                {done ? '✓' : number}
              </div>
              <div className="whitespace-nowrap text-xs font-semibold text-slate-800">{label}</div>
            </div>
            {index < labels.length - 1 ? <div className="mx-4 mb-6 h-[2px] flex-1 bg-slate-200" /> : null}
          </div>
        )
      })}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm font-extrabold text-slate-800">
        {title}
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

export function GroupReservationModal({
  open,
  activeDraftId,
  initialDraft,
  initialStep,
  onActiveDraftIdChange,
  onClose,
}: Props) {
  const dispatch = useAppDispatch()
  const roomTypesState = useAppSelector((state) => state.roomTypes)
  const ratePlansState = useAppSelector((state) => state.ratePlans)
  const localAriState = useAppSelector((state) => state.localAri)
  const roomsState = useAppSelector((state) => state.rooms)
  const financialSettings = useAppSelector((state) => state.financialSettings)
  const mealPlansState = useAppSelector((state) => state.mealPlans)

  const [mode, setMode] = useState<Mode>('wizard')
  const [step, setStep] = useState<GroupWizardStep>(1)
  const [groupInfo, setGroupInfo] = useState<GroupInfoDraft>(emptyGroupInfo)
  const [reservations, setReservations] = useState<GroupReservationDraftItem[]>([])
  const [payment, setPayment] = useState<GroupPaymentDraft>(() => emptyPayment())
  const [reservationForm, setReservationForm] = useState<GroupReservationFormDraft>(() => emptyReservationForm())
  const [editingReservationId, setEditingReservationId] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [paymentSubmitting, setPaymentSubmitting] = useState(false)
  const [paymentPosted, setPaymentPosted] = useState(false)
  const [resultUnknown, setResultUnknown] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [createdReservationIds, setCreatedReservationIds] = useState<string[]>([])
  const [createdGroupResult, setCreatedGroupResult] = useState<CreateGroupReservationResponse | null>(null)
  const [paymentWarning, setPaymentWarning] = useState<string | null>(null)
  const submittingRef = useRef(false)
  const paymentSubmittingRef = useRef(false)

  const selectedFormRoom = reservationForm.roomRequests[0]

  useEffect(() => {
    if (!open) return
    if (roomTypesState.status === 'idle') dispatch(fetchRoomTypes())
    if (ratePlansState.status === 'idle') dispatch(fetchRatePlans())
    if (financialSettings.status === 'idle') dispatch(fetchFinancialServices())
    if (mealPlansState.status === 'idle') dispatch(fetchMealPlans())
  }, [dispatch, financialSettings.status, mealPlansState.status, open, ratePlansState.status, roomTypesState.status])

  useEffect(() => {
    if (!open) return

    const nextDraft = normalizeGroupDraft(initialDraft ?? emptyGroupDraft())
    setMode('wizard')
    setStep(initialStep)
    setGroupInfo(nextDraft.groupInfo)
    setReservations(nextDraft.reservations)
    setPayment(nextDraft.payment)
    setReservationForm(emptyReservationForm())
    setEditingReservationId(null)
    setQuery('')
    setSubmitting(false)
    setPaymentSubmitting(false)
    setPaymentPosted(false)
    setResultUnknown(false)
    setSuccessOpen(false)
    setCreatedReservationIds([])
    setCreatedGroupResult(null)
    setPaymentWarning(null)
    submittingRef.current = false
    paymentSubmittingRef.current = false
  }, [initialDraft, initialStep, open])

  const currentDraft = useMemo<GroupReservationDraftValue>(
    () => ({
      groupInfo,
      reservations,
      payment,
    }),
    [groupInfo, payment, reservations],
  )

  useEffect(() => {
    if (!open) return
    if (!hasMeaningfulGroupReservationData(currentDraft)) return

    const savedDraft = saveGroupReservationDraft({
      id: activeDraftId,
      draft: currentDraft,
      step,
    })

    if (savedDraft.id !== activeDraftId) {
      onActiveDraftIdChange(savedDraft.id)
    }
  }, [activeDraftId, currentDraft, onActiveDraftIdChange, open, step])

  useEffect(() => {
    if (!open || mode !== 'reservationForm') return
    if (!groupInfo.arrivalDate || !groupInfo.departureDate || !selectedFormRoom?.roomTypeId || !selectedFormRoom.ratePlanCode) return

    dispatch(fetchLocalARIRates({
      roomTypeId: selectedFormRoom.roomTypeId,
      ratePlanCode: selectedFormRoom.ratePlanCode,
      startDate: groupInfo.arrivalDate,
      endDate: groupInfo.departureDate,
      roomCount: selectedFormRoom.quantity || 1,
      adults: selectedFormRoom.adults || 1,
      children: selectedFormRoom.children || 0,
      extraBeds: 0,
      groupName: groupInfo.groupName || undefined,
    }))
    dispatch(fetchRoomsAvailability({
      StartDate: groupInfo.arrivalDate,
      EndDate: groupInfo.departureDate,
      RoomTypeId: selectedFormRoom.roomTypeId,
    }))
  }, [
    dispatch,
    groupInfo.arrivalDate,
    groupInfo.departureDate,
    groupInfo.groupName,
    mode,
    open,
    selectedFormRoom?.adults,
    selectedFormRoom?.children,
    selectedFormRoom?.quantity,
    selectedFormRoom?.ratePlanCode,
    selectedFormRoom?.roomTypeId,
  ])

  const roomTypeOptions = useMemo(
    () => roomTypesState.items.map((roomType) => ({ value: roomType.id, label: roomType.name })),
    [roomTypesState.items],
  )

  const ratePlanOptions = useMemo(
    () => ratePlansState.items.filter((ratePlan) => ratePlan.isActive).map((ratePlan) => ({ value: ratePlan.code, label: ratePlan.code })),
    [ratePlansState.items],
  )

  const mealPlanOptions = useMemo(
    () => mealPlansState.items.filter((mealPlan) => mealPlan.isActive).map((mealPlan) => ({ value: mealPlan.id, label: `${mealPlan.name} - $${mealPlan.pricePerDay.toFixed(2)}` })),
    [mealPlansState.items],
  )

  const serviceOptions = useMemo(
    () => financialSettings.services.filter((service) => service.isActive).map((service) => ({ value: service.id, label: `${service.name} - $${service.price.toFixed(2)}` })),
    [financialSettings.services],
  )

  const countryOptions = useMemo(() => {
    return Object.entries(countries.getNames('en', { select: 'official' }))
      .map(([code, name]) => ({ value: code, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [])

  const getMealPlanPrice = (mealPlanId: string) => mealPlansState.items.find((mealPlan) => mealPlan.id === mealPlanId)?.pricePerDay ?? 0
  const getServicePrice = (serviceId: string) => financialSettings.services.find((service) => service.id === serviceId)?.price ?? 0

  const nights = nightsBetween(groupInfo.arrivalDate, groupInfo.departureDate)

  const totals = useMemo(() => {
    return reservations.reduce(
      (acc, reservation) => {
        const reservationRooms = reservation.roomRequests.reduce((sum, room) => sum + room.quantity, 0)
        const reservationGuests = reservation.roomRequests.reduce((sum, room) => sum + (room.adults + room.children) * room.quantity, 0)
        const rateAmount = reservation.roomRequests.reduce((sum, room) => sum + (room.rateTotal || 0), 0)
        const mealAmount = reservation.selectedMealPlans.reduce((sum, mealPlan) => sum + (mealPlan.price || getMealPlanPrice(mealPlan.mealPlanId)) * Math.max(1, mealPlan.numberOfDays || 1), 0)
        const servicesAmount = reservation.selectedServices.reduce((sum, service) => sum + (service.price || getServicePrice(service.additionalServiceId)), 0)
        const reservationAmount = rateAmount + mealAmount + servicesAmount

        return {
          rooms: acc.rooms + reservationRooms,
          guests: acc.guests + reservationGuests,
          amount: acc.amount + reservationAmount,
        }
      },
      { rooms: 0, guests: 0, amount: 0 },
    )
  }, [financialSettings.services, mealPlansState.items, nights, reservations])

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

  const updateGroupInfo = (patch: Partial<GroupInfoDraft>) => {
    setGroupInfo((current) => ({ ...current, ...patch }))
  }

  const updateRoomRequest = (id: number, patch: Partial<GroupRoomRequestDraft>) => {
    setReservationForm((current) => ({
      ...current,
      roomRequests: current.roomRequests.map((room) => (room.id === id ? { ...room, ...patch } : room)),
    }))
  }

  const removeRoomRequest = (id: number) => {
    setReservationForm((current) => ({
      ...current,
      roomRequests: current.roomRequests.length > 1 ? current.roomRequests.filter((room) => room.id !== id) : current.roomRequests,
    }))
  }

  const updateCompanion = (id: number, patch: Partial<GroupCompanionDraft>) => {
    setReservationForm((current) => ({
      ...current,
      companions: current.companions.map((companion) => (companion.id === id ? { ...companion, ...patch } : companion)),
    }))
  }

  const addCompanion = () => {
    setReservationForm((current) => {
      const nextId = current.companions.length ? Math.max(...current.companions.map((companion) => companion.id)) + 1 : 1
      return { ...current, companions: [...current.companions, emptyCompanion(nextId)] }
    })
  }

  const removeCompanion = (id: number) => {
    setReservationForm((current) => ({
      ...current,
      companions: current.companions.filter((companion) => companion.id !== id),
    }))
  }

  const updateSelectedService = (id: number, patch: Partial<GroupSelectedServiceDraft>) => {
    setReservationForm((current) => ({
      ...current,
      selectedServices: current.selectedServices.map((service) => {
        if (service.id !== id) return service
        const additionalServiceId = patch.additionalServiceId ?? service.additionalServiceId
        const nextPrice = patch.price ?? (patch.additionalServiceId !== undefined ? getServicePrice(additionalServiceId) : service.price)
        return { ...service, ...patch, additionalServiceId, price: nextPrice }
      }),
    }))
  }

  const addSelectedService = () => {
    setReservationForm((current) => {
      const nextId = current.selectedServices.length ? Math.max(...current.selectedServices.map((service) => service.id)) + 1 : 1
      return { ...current, selectedServices: [...current.selectedServices, emptySelectedService(nextId, groupInfo.arrivalDate || todayDate())] }
    })
  }

  const removeSelectedService = (id: number) => {
    setReservationForm((current) => ({
      ...current,
      selectedServices: current.selectedServices.filter((service) => service.id !== id),
    }))
  }

  const updateSelectedMealPlan = (id: number, patch: Partial<GroupSelectedMealPlanDraft>) => {
    setReservationForm((current) => ({
      ...current,
      selectedMealPlans: current.selectedMealPlans.map((mealPlan) => {
        if (mealPlan.id !== id) return mealPlan
        const mealPlanId = patch.mealPlanId ?? mealPlan.mealPlanId
        const nextPrice = patch.price ?? (patch.mealPlanId !== undefined ? getMealPlanPrice(mealPlanId) : mealPlan.price)
        return { ...mealPlan, ...patch, mealPlanId, price: nextPrice }
      }),
    }))
  }

  const addSelectedMealPlan = () => {
    setReservationForm((current) => {
      const nextId = current.selectedMealPlans.length ? Math.max(...current.selectedMealPlans.map((mealPlan) => mealPlan.id)) + 1 : 1
      return {
        ...current,
        selectedMealPlans: [
          ...current.selectedMealPlans,
          emptySelectedMealPlan(nextId, groupInfo.arrivalDate || todayDate()),
        ],
      }
    })
  }

  const removeSelectedMealPlan = (id: number) => {
    setReservationForm((current) => ({
      ...current,
      selectedMealPlans: current.selectedMealPlans.filter((mealPlan) => mealPlan.id !== id),
    }))
  }

  const openReservationForm = (reservation?: GroupReservationDraftItem) => {
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
        selectedMealPlans: reservation.selectedMealPlans,
        selectedServices: reservation.selectedServices,
        companions: reservation.companions ?? [],
      })
    } else {
      setEditingReservationId(null)
      setReservationForm(emptyReservationForm())
    }
    setMode('reservationForm')
  }

  const saveReservationForm = () => {
    const selectedMealPlanNames = reservationForm.selectedMealPlans
      .map((selected) => mealPlansState.items.find((mealPlan) => mealPlan.id === selected.mealPlanId)?.name)
      .filter(Boolean) as string[]
    const selectedServiceNames = reservationForm.selectedServices
      .map((selected) => financialSettings.services.find((service) => service.id === selected.additionalServiceId)?.name)
      .filter(Boolean) as string[]
    const fetchedRateTotal = sumBillableRates(localAriState.rates, groupInfo.arrivalDate, groupInfo.departureDate)
    const roomRequestsWithRates = reservationForm.roomRequests.map((room) => ({
      ...room,
      rateTotal: room.roomTypeId === selectedFormRoom?.roomTypeId && room.ratePlanCode === selectedFormRoom?.ratePlanCode ? fetchedRateTotal : room.rateTotal,
    }))

    const saved: GroupReservationDraftItem = {
      ...reservationForm,
      roomRequests: roomRequestsWithRates,
      id: editingReservationId ?? Date.now(),
      mealPlanName: selectedMealPlanNames.join(', '),
      serviceNames: selectedServiceNames,
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

  const resetGroupDraft = () => {
    if (activeDraftId) {
      removeSavedGroupReservationDraft(activeDraftId)
      dispatch(removeGroupReservationDraftNotification(activeDraftId))
      onActiveDraftIdChange(null)
    }

    setMode('wizard')
    setStep(1)
    setGroupInfo(emptyGroupInfo)
    setReservations([])
    setPayment(emptyPayment())
    setReservationForm(emptyReservationForm())
    setEditingReservationId(null)
    setQuery('')
    setSubmitting(false)
    setPaymentSubmitting(false)
    setPaymentPosted(false)
    setResultUnknown(false)
    setCreatedReservationIds([])
    setCreatedGroupResult(null)
    setPaymentWarning(null)
    submittingRef.current = false
    paymentSubmittingRef.current = false
  }

  const finishGroupDraft = () => {
    resetGroupDraft()
  }

  const completeSuccessfulGroupFlow = () => {
    setSuccessOpen(false)
    finishGroupDraft()
    onClose()
  }

  const handleClose = (options?: { skipSave?: boolean }) => {
    setMode('wizard')
    if (options?.skipSave) {
      onClose()
      return
    }

    if (hasMeaningfulGroupReservationData(currentDraft)) {
      const savedDraft = saveGroupReservationDraft({
        id: activeDraftId,
        draft: currentDraft,
        step,
      })

      onActiveDraftIdChange(savedDraft.id)
      dispatch(upsertGroupReservationDraftNotification(savedDraft))
    } else {
      resetGroupDraft()
    }

    onClose()
  }

  const buildGroupPayload = (): CreateGroupReservationRequest => {
    const mealStartDate = groupInfo.arrivalDate || todayDate()
    const numberOfDays = Math.max(1, nights || 1)

    return {
      groupName: groupInfo.groupName.trim(),
      contactName: groupInfo.contactPerson.trim(),
      contactEmail: groupInfo.email.trim(),
      contactPhone: groupInfo.phone.trim(),
      arrivalDate: groupInfo.arrivalDate,
      departureDate: groupInfo.departureDate,
      status: 'Confirmed',
      groupDiscountPercentage: Math.max(0, Number(groupInfo.discountPercentage) || 0),
      notes: groupInfo.notes,
      reservations: reservations.map((reservation) => ({
        guest: {
          firstName: reservation.firstName || 'Unknown',
          lastName: reservation.lastName || 'Guest',
          email: reservation.email || '',
          phone: reservation.phone || '',
          nationalId: reservation.nationalId || '',
          address: reservation.address || '',
          streetName: reservation.address || '',
          countryCode: reservation.country || '',
        },
        reservationType: reservation.reservationType || 'Normal',
        currency: reservation.currency || payment.currency || 'USD',
        roomRequests: reservation.roomRequests
          .filter((room) => room.roomTypeId)
          .map((room) => ({
            roomTypeId: room.roomTypeId,
            roomQuantity: Math.max(1, Number(room.quantity) || 1),
            adults: Math.max(1, Number(room.adults) || 1),
            children: room.roomTypeName.trim().toLowerCase().includes('single') ? 0 : Math.max(0, Number(room.children) || 0),
            childAges: [],
            ratePlanCode: room.ratePlanCode || 'STD',
          })),
        selectedServices: reservation.selectedServices
          .filter((service) => service.additionalServiceId)
          .map((service) => {
            const serviceDate = dateWithinStay(service.serviceDate, groupInfo.arrivalDate, groupInfo.departureDate)
            return {
              additionalServiceId: service.additionalServiceId,
              serviceDate: toStayServiceDateTime(serviceDate),
              price: service.price || getServicePrice(service.additionalServiceId),
            }
          }),
        selectedMealPlans: reservation.selectedMealPlans
          .filter((mealPlan) => mealPlan.mealPlanId)
          .map((mealPlan) => {
            const serviceDateStart = dateWithinStay(mealPlan.serviceDateStart, groupInfo.arrivalDate, groupInfo.departureDate)
            const maxDays = maxDaysWithinStay(serviceDateStart, groupInfo.departureDate)
            return {
              mealPlanId: mealPlan.mealPlanId,
              price: mealPlan.price || getMealPlanPrice(mealPlan.mealPlanId),
              serviceDateStart: serviceDateStart || mealStartDate,
              numberOfDays: Math.min(Math.max(1, Number(mealPlan.numberOfDays) || numberOfDays), maxDays),
            }
          }),
        companions: reservation.companions
          .filter((companion) => companion.firstName.trim() || companion.lastName.trim())
          .map((companion) => ({
            firstName: companion.firstName,
            lastName: companion.lastName,
            phoneNumber: companion.phoneNumber,
            email: companion.email,
            address: companion.address,
            nationalId: companion.nationalId,
          })),
        specialRequests: reservation.specialRequests || '',
        comments: '',
      })),
    }
  }

  const validateGroupPayload = () => {
    if (!groupInfo.groupName.trim()) return 'Group Name is required.'
    if (!groupInfo.contactPerson.trim()) return 'Contact Person is required.'
    if (!groupInfo.arrivalDate) return 'Arrival Date is required.'
    if (!groupInfo.departureDate) return 'Departure Date is required.'
    if (groupInfo.arrivalDate < todayDate()) return 'Arrival Date cannot be before today.'
    if (groupInfo.departureDate < groupInfo.arrivalDate) return 'Departure Date cannot be before Arrival Date.'
    if (reservations.length === 0) return 'Add at least one reservation before confirming the group.'
    if (reservations.some((reservation) => reservation.roomRequests.every((room) => !room.roomTypeId))) {
      return 'Each reservation needs at least one room type.'
    }
    return null
  }

  const submitGroupReservation = async () => {
    if (submittingRef.current || resultUnknown) return
    if (createdGroupResult) {
      setStep(4)
      return
    }

    const validationMessage = validateGroupPayload()
    if (validationMessage) {
      await Swal.fire({
        icon: 'warning',
        title: 'Missing information',
        text: validationMessage,
        confirmButtonColor: '#0B4EA2',
      })
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    setPaymentWarning(null)

    try {
      const result = await createGroupReservation(buildGroupPayload())
      const reservationIds = extractCreatedReservationIds(result)
      const responseRemainingTotal = getCreatedGroupRemainingTotal(result)
      const responseCurrency = getCreatedGroupCurrency(result, payment.currency || 'USD')

      setCreatedGroupResult(result)
      setCreatedReservationIds(reservationIds)
      setPayment((current) => ({
        ...current,
        amount: current.amount || (responseRemainingTotal > 0 ? responseRemainingTotal.toFixed(2) : current.amount),
        currency: responseCurrency,
      }))

      const paymentAmount = Number(payment.amount) || 0
      if (paymentAmount > 0 && reservationIds.length === 0) {
        setPaymentWarning('Group was created, but the response did not include child reservation IDs for payment posting.')
      } else if (result.warnings?.length) {
        setPaymentWarning(result.warnings.join(' '))
      }

      setStep(4)
      setResultUnknown(false)
    } catch (error) {
      const message = getErrorMessage(error)
      if (isPossiblyStillProcessingError(message)) {
        setResultUnknown(true)
        await Swal.fire({
          icon: 'warning',
          title: 'Group reservation may still be processing',
          text: 'The server did not confirm the result in time. Please check Reservations before trying again, so the same group is not created twice.',
          confirmButtonColor: '#0B4EA2',
        })
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Group reservation failed',
          text: message,
          confirmButtonColor: '#0B4EA2',
        })
      }
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const submitGroupPayment = async () => {
    if (paymentSubmittingRef.current) return
    if (paymentPosted) return

    const paymentAmount = Number(payment.amount) || 0

    if (createdReservationIds.length === 0) {
      setPaymentWarning('Payment is available only after the group response includes child reservation IDs.')
      return
    }

    if (paymentAmount <= 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Payment amount required',
        text: 'Enter a payment amount before posting payment.',
        confirmButtonColor: '#0B4EA2',
      })
      return
    }

    const remainingTotal = getCreatedGroupRemainingTotal(createdGroupResult)
    if (remainingTotal > 0 && paymentAmount > remainingTotal + 0.01) {
      await Swal.fire({
        icon: 'warning',
        title: 'Payment exceeds balance',
        text: `The payment amount is higher than the returned remaining balance of ${formatMoney(remainingTotal, payment.currency || '$')}.`,
        confirmButtonColor: '#0B4EA2',
      })
      return
    }

    const paymentAllocations = buildPaymentAllocations(createdGroupResult, createdReservationIds, paymentAmount)
    if (paymentAllocations.length === 0) {
      setPaymentWarning('Payment is available only after the group response includes child reservation IDs.')
      return
    }

    paymentSubmittingRef.current = true
    setPaymentSubmitting(true)
    setPaymentWarning(null)

    try {
      await Promise.all(
        paymentAllocations.map((allocation) =>
          createReservationPayment(allocation.reservationId, {
            amount: allocation.amount,
            currency: allocation.currency || payment.currency || 'USD',
            paymentMethod: payment.paymentMethod,
            paymentReference: payment.paymentReference || null,
            paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString() : new Date().toISOString(),
            paymentType: payment.paymentType,
            method: payment.method,
          }),
        ),
      )

      await Swal.fire({
        icon: 'success',
        title: 'Payment posted',
        text: 'The group payment was posted to the created reservations.',
        confirmButtonColor: '#0B4EA2',
      })
      setPaymentPosted(true)
    } catch (error) {
      const message = getErrorMessage(error)
      setPaymentWarning(`Group was created, but payment posting failed: ${message}`)
      await Swal.fire({
        icon: 'error',
        title: 'Payment failed',
        text: message,
        confirmButtonColor: '#0B4EA2',
      })
    } finally {
      setPaymentSubmitting(false)
      paymentSubmittingRef.current = false
    }
  }

  if (!open) return null

  const footerBackLabel = step === 1 ? 'cancel' : 'Back'
  const canGoNext = step !== 2 || reservations.length > 0
  const primaryLabel = resultUnknown ? 'Check Reservations List' : step === 3 ? 'Confirm Group Reservation' : step === 4 ? 'Done' : 'Next'

  return (
    <>
      <Modal open={open} onClose={() => handleClose()}>
        <div className="flex h-[calc(100vh-2rem)] w-[94vw] max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="flex items-center justify-between bg-[#0B4EA2] px-8 py-5 text-white">
            <h2 className="text-lg font-semibold">{mode === 'reservationForm' ? 'Add Reservation' : 'Group Reservation'}</h2>
            <div className="flex items-center gap-4">
            <span className="inline-flex h-7 min-w-[96px] items-center justify-center rounded-full bg-emerald-100 px-5 text-sm font-bold text-emerald-700">
              Group
            </span>
            <button
              type="button"
              onClick={resetGroupDraft}
              disabled={submitting}
              className="h-9 rounded-full border border-white/40 px-5 text-sm font-semibold text-white/90 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => handleClose()}
              disabled={submitting}
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {mode === 'reservationForm' ? (
              <ReservationFormView
                form={reservationForm}
                groupInfo={groupInfo}
                countryOptions={countryOptions}
                roomTypeOptions={roomTypeOptions}
                ratePlanOptions={ratePlanOptions}
                mealPlanOptions={mealPlanOptions}
                serviceOptions={serviceOptions}
                getMealPlanPrice={getMealPlanPrice}
                getServicePrice={getServicePrice}
                localAriState={localAriState}
                roomsState={roomsState}
                onChange={(patch) => setReservationForm((current) => ({ ...current, ...patch }))}
                onRoomChange={updateRoomRequest}
                onRemoveRoomRequest={removeRoomRequest}
                onCompanionChange={updateCompanion}
                onAddCompanion={addCompanion}
                onRemoveCompanion={removeCompanion}
                onServiceChange={updateSelectedService}
                onAddService={addSelectedService}
                onRemoveService={removeSelectedService}
                onMealPlanChange={updateSelectedMealPlan}
                onAddMealPlan={addSelectedMealPlan}
                onRemoveMealPlan={removeSelectedMealPlan}
                onRecalculateAvailability={() => {
                  if (!groupInfo.arrivalDate || !groupInfo.departureDate || !selectedFormRoom?.roomTypeId || !selectedFormRoom.ratePlanCode) return
                  dispatch(fetchLocalARIRates({
                    roomTypeId: selectedFormRoom.roomTypeId,
                    ratePlanCode: selectedFormRoom.ratePlanCode,
                    startDate: groupInfo.arrivalDate,
                    endDate: groupInfo.departureDate,
                    roomCount: selectedFormRoom.quantity || 1,
                    adults: selectedFormRoom.adults || 1,
                    children: selectedFormRoom.children || 0,
                    extraBeds: 0,
                    groupName: groupInfo.groupName || undefined,
                  }))
                  dispatch(fetchRoomsAvailability({
                    StartDate: groupInfo.arrivalDate,
                    EndDate: groupInfo.departureDate,
                    RoomTypeId: selectedFormRoom.roomTypeId,
                  }))
                }}
                onCancel={() => {
                  setReservationForm(emptyReservationForm())
                  setEditingReservationId(null)
                  setMode('wizard')
                }}
                onSave={saveReservationForm}
              />
            ) : (
              <>
            <div className="px-8">
              <Stepper step={step} />
            </div>

            <main className="w-full px-8 pb-8">
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
                  getMealPlanPrice={getMealPlanPrice}
                  getServicePrice={getServicePrice}
                />
              ) : step === 3 ? (
                <ConfirmationStep
                  groupInfo={groupInfo}
                  totals={totals}
                  reservations={reservations}
                  createdGroupResult={createdGroupResult}
                  createdReservationIds={createdReservationIds}
                  paymentWarning={paymentWarning}
                />
              ) : (
                <PaymentStep
                  groupInfo={groupInfo}
                  totals={totals}
                  reservations={reservations}
                  createdGroupResult={createdGroupResult}
                  createdReservationIds={createdReservationIds}
                  paymentWarning={paymentWarning}
                  payment={payment}
                  paymentSubmitting={paymentSubmitting}
                  paymentPosted={paymentPosted}
                  onPaymentChange={(patch) => setPayment((current) => ({ ...current, ...patch }))}
                  onSubmitPayment={submitGroupPayment}
                />
              )}
            </main>

            <div className="sticky bottom-0 flex items-center justify-between border-t border-slate-200 bg-white px-8 py-6">
              <button
                type="button"
                disabled={submitting}
                className="h-12 min-w-[160px] rounded-lg border border-[#0B4EA2] px-8 text-sm font-semibold text-[#0B4EA2] transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => {
                  if (submitting) return
                  if (step === 1) {
                    handleClose()
                    return
                  }
                  setStep((current) => (current > 1 ? ((current - 1) as GroupWizardStep) : current))
                }}
              >
                {footerBackLabel}
              </button>
              <button
                type="button"
                disabled={!canGoNext || submitting || resultUnknown}
                className={[
                  'inline-flex h-12 min-w-[220px] items-center justify-center gap-2 rounded-lg px-10 text-sm font-semibold text-white transition-colors',
                  canGoNext && !submitting && !resultUnknown ? 'bg-[#0B4EA2] hover:bg-[#093d81]' : 'cursor-not-allowed bg-blue-300',
                ].join(' ')}
                onClick={() => {
                  if (submitting || resultUnknown) return
                  if (step === 3) {
                    void submitGroupReservation()
                    return
                  }
                  if (step === 4) {
                    completeSuccessfulGroupFlow()
                    return
                  }
                  setStep((current) => (current < 4 ? ((current + 1) as GroupWizardStep) : current))
                }}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {submitting ? 'Creating group...' : primaryLabel}
              </button>
            </div>
          </>
            )}
          </div>
        </div>
      </Modal>

      <Modal open={successOpen} onClose={completeSuccessfulGroupFlow}>
        <div className="flex w-[520px] max-w-[calc(100vw-2rem)] flex-col items-center rounded-2xl bg-white p-10 text-center shadow-2xl">
          <div className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-11 w-11" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">Group Reservation Created</h3>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
            {groupInfo.groupName || 'The group'} was created with {reservations.length} child reservations.
          </p>
          {paymentWarning ? (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm font-semibold text-amber-800">
              {paymentWarning}
            </div>
          ) : null}
          <button
            type="button"
            className="mt-8 h-12 w-full rounded-lg bg-[#0B4EA2] text-sm font-bold text-white hover:bg-[#093d81]"
            onClick={completeSuccessfulGroupFlow}
          >
            Done
          </button>
        </div>
      </Modal>
    </>
  )
}

function GroupInfoStep({ groupInfo, onChange }: { groupInfo: GroupInfoDraft; onChange: (patch: Partial<GroupInfoDraft>) => void }) {
  const today = todayDate()
  const departureMin = groupInfo.arrivalDate || today

  return (
    <div className="w-full">
      <div className="mb-5 border-b border-slate-100 bg-slate-50 px-5 py-4">
        <h3 className="text-xl font-bold text-slate-900">Group Information</h3>
        <p className="mt-1 text-sm text-slate-500">Basic details about the group booking</p>
      </div>

      <div className="space-y-4 px-1">
        <Field label="Group Name" required placeholder="e.g. TechCorp Annual Conference 2026" value={groupInfo.groupName} onChange={(value) => onChange({ groupName: value })} />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Field label="Contact Person" required placeholder="Full name" value={groupInfo.contactPerson} onChange={(value) => onChange({ contactPerson: value })} />
          <Field label="Email" type="email" placeholder="contact@company.com" value={groupInfo.email} onChange={(value) => onChange({ email: value })} />
          <Field label="Phone" type="tel" placeholder="+1 000-000-0000" value={groupInfo.phone} onChange={(value) => onChange({ phone: value })} />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Field
            label="Arrival Date"
            required
            type="date"
            min={today}
            value={groupInfo.arrivalDate}
            onChange={(value) => onChange({
              arrivalDate: value,
              departureDate: groupInfo.departureDate && groupInfo.departureDate < value ? '' : groupInfo.departureDate,
            })}
          />
          <Field
            label="Departure Date"
            required
            type="date"
            min={departureMin}
            value={groupInfo.departureDate}
            onChange={(value) => onChange({ departureDate: value })}
          />
          <Field label="Group Discount (%)" type="number" value={groupInfo.discountPercentage} onChange={(value) => onChange({ discountPercentage: value })} />
        </div>
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
  getMealPlanPrice,
  getServicePrice,
}: {
  groupInfo: GroupInfoDraft
  nights: number
  totals: { rooms: number; guests: number; amount: number }
  reservations: GroupReservationDraftItem[]
  allReservationCount: number
  query: string
  onQueryChange: (value: string) => void
  onAddReservation: () => void
  onEditReservation: (reservation: GroupReservationDraftItem) => void
  onRemoveReservation: (id: number) => void
  getMealPlanPrice: (mealPlanId: string) => number
  getServicePrice: (serviceId: string) => number
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
    <div className="space-y-5">
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
                  const rateAmount = reservation.roomRequests.reduce((sum, room) => sum + (room.rateTotal || 0), 0)
                  const amount =
                    rateAmount +
                    reservation.selectedMealPlans.reduce((sum, mealPlan) => sum + (mealPlan.price || getMealPlanPrice(mealPlan.mealPlanId)) * Math.max(1, mealPlan.numberOfDays || 1), 0) +
                    reservation.selectedServices.reduce((sum, service) => sum + (service.price || getServicePrice(service.additionalServiceId)), 0)
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
  groupInfo,
  countryOptions,
  roomTypeOptions,
  ratePlanOptions,
  mealPlanOptions,
  serviceOptions,
  getMealPlanPrice,
  getServicePrice,
  localAriState,
  roomsState,
  onChange,
  onRoomChange,
  onRemoveRoomRequest,
  onCompanionChange,
  onAddCompanion,
  onRemoveCompanion,
  onServiceChange,
  onAddService,
  onRemoveService,
  onMealPlanChange,
  onAddMealPlan,
  onRemoveMealPlan,
  onRecalculateAvailability,
  onCancel,
  onSave,
}: {
  form: GroupReservationFormDraft
  groupInfo: GroupInfoDraft
  countryOptions: { value: string; label: string }[]
  roomTypeOptions: { value: string; label: string }[]
  ratePlanOptions: { value: string; label: string }[]
  mealPlanOptions: { value: string; label: string }[]
  serviceOptions: { value: string; label: string }[]
  getMealPlanPrice: (mealPlanId: string) => number
  getServicePrice: (serviceId: string) => number
  localAriState: LocalARIState
  roomsState: RoomsAvailabilityState
  onChange: (patch: Partial<GroupReservationFormDraft>) => void
  onRoomChange: (id: number, patch: Partial<GroupRoomRequestDraft>) => void
  onRemoveRoomRequest: (id: number) => void
  onCompanionChange: (id: number, patch: Partial<GroupCompanionDraft>) => void
  onAddCompanion: () => void
  onRemoveCompanion: (id: number) => void
  onServiceChange: (id: number, patch: Partial<GroupSelectedServiceDraft>) => void
  onAddService: () => void
  onRemoveService: (id: number) => void
  onMealPlanChange: (id: number, patch: Partial<GroupSelectedMealPlanDraft>) => void
  onAddMealPlan: () => void
  onRemoveMealPlan: (id: number) => void
  onRecalculateAvailability: () => void
  onCancel: () => void
  onSave: () => void
}) {
  const canCheckAvailability = Boolean(groupInfo.arrivalDate && groupInfo.departureDate && form.roomRequests[0]?.roomTypeId && form.roomRequests[0]?.ratePlanCode)
  const stayStart = groupInfo.arrivalDate || todayDate()
  const stayEnd = groupInfo.departureDate || groupInfo.arrivalDate || todayDate()

  return (
    <div className="w-full px-8 py-7">
      <div className="space-y-4">
        <Section title="Guest Information">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="First Name" value={form.firstName} onChange={(value) => onChange({ firstName: value })} />
            <Field label="Last Name" value={form.lastName} onChange={(value) => onChange({ lastName: value })} />
            <Field label="Email" type="email" value={form.email} onChange={(value) => onChange({ email: value })} />
            <Field label="Phone" type="tel" value={form.phone} onChange={(value) => onChange({ phone: value })} />
            <Field label="National ID" value={form.nationalId} onChange={(value) => onChange({ nationalId: value })} />
            <SelectField label="Country" value={form.country} options={countryOptions} onChange={(value) => onChange({ country: value })} />
            <div className="md:col-span-2">
              <Field label="Address" value={form.address} onChange={(value) => onChange({ address: value })} />
            </div>
          </div>
        </Section>

        <Section title="Reservation Details">
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-12">
            <label className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 md:col-span-3">
              <input
                type="checkbox"
                checked={form.reservationType === 'VIP'}
                onChange={(event) => onChange({ reservationType: event.target.checked ? 'VIP' : 'Normal' })}
              />
              VIP
            </label>
            <div className="md:col-span-4">
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
            </div>
            <div className="md:col-span-12">
              <TextArea label="Special Requests" placeholder="High floor, city view, non-smoking..." value={form.specialRequests} onChange={(value) => onChange({ specialRequests: value })} />
            </div>
          </div>
        </Section>

        <Section title="Room Requests">
          <div className="space-y-5">
            {form.roomRequests.map((room) => (
              <div key={room.id} className="rounded-lg border border-slate-200 bg-slate-50/40 p-3">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Room Type</div>
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
                        const isSingle = (selected?.label || '').trim().toLowerCase().includes('single')
                        onRoomChange(room.id, { roomTypeId: value, roomTypeName: selected?.label || '', children: isSingle ? 0 : room.children })
                      }}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Field label="Rooms" type="number" value={String(room.quantity)} onChange={(value) => onRoomChange(room.id, { quantity: Math.max(1, Number(value) || 1) })} />
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Adults" type="number" value={String(room.adults)} onChange={(value) => onRoomChange(room.id, { adults: Math.max(1, Number(value) || 1) })} />
                  </div>
                  {!(room.roomTypeName || '').trim().toLowerCase().includes('single') ? (
                    <div className="md:col-span-2">
                      <Field label="Children" type="number" value={String(room.children)} onChange={(value) => onRoomChange(room.id, { children: Math.max(0, Number(value) || 0) })} />
                    </div>
                  ) : null}
                  <div className="md:col-span-6">
                    <SelectField label="Rate Plan" value={room.ratePlanCode} options={ratePlanOptions} onChange={(value) => onRoomChange(room.id, { ratePlanCode: value })} />
                  </div>
                  <div className="md:col-span-6 md:self-end">
                    <button
                      type="button"
                      disabled={!canCheckAvailability}
                      className={[
                        'h-11 w-full rounded-lg px-4 text-sm font-bold transition-colors',
                        canCheckAvailability ? 'bg-[#0B4EA2] text-white hover:bg-[#093d81]' : 'cursor-not-allowed bg-slate-200 text-slate-500',
                      ].join(' ')}
                      onClick={onRecalculateAvailability}
                    >
                      Check Availability
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <AvailabilityTables
              localAriState={localAriState}
              roomsState={roomsState}
              arrivalDate={groupInfo.arrivalDate}
              departureDate={groupInfo.departureDate}
            />
          </div>
        </Section>

        <Section title="Meal Plans">
          <div className="space-y-3">
            {form.selectedMealPlans.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 px-4 py-5 text-center text-sm font-medium text-slate-400">
                No meal plans added.
              </div>
            ) : (
              form.selectedMealPlans.map((mealPlan) => (
                <div key={mealPlan.id} className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-slate-50/40 p-3 md:grid-cols-12">
                  <div className="md:col-span-4">
                    <SelectField
                      label="Meal Plan"
                      value={mealPlan.mealPlanId}
                      options={mealPlanOptions}
                      onChange={(value) => onMealPlanChange(mealPlan.id, { mealPlanId: value })}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Field
                      label="Start Date"
                      type="date"
                      min={stayStart}
                      max={stayEnd}
                      value={mealPlan.serviceDateStart}
                      onChange={(value) => onMealPlanChange(mealPlan.id, { serviceDateStart: value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Field
                      label="Days"
                      type="number"
                      value={String(mealPlan.numberOfDays)}
                      onChange={(value) => onMealPlanChange(mealPlan.id, { numberOfDays: Math.max(1, Number(value) || 1) })}
                    />
                  </div>
                  <div className="flex items-end justify-between gap-3 md:col-span-3">
                    <div className="pb-3 text-sm font-semibold text-slate-600">
                      Price: ${(mealPlan.price || getMealPlanPrice(mealPlan.mealPlanId)).toFixed(2)}
                    </div>
                    <button type="button" className="mb-1 text-rose-400 hover:text-rose-600" onClick={() => onRemoveMealPlan(mealPlan.id)} aria-label="Remove meal plan">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
            <button
              type="button"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 text-sm font-bold text-[#0B4EA2] hover:bg-blue-50"
              onClick={onAddMealPlan}
            >
              <Plus className="h-4 w-4" />
              Add Meal Plan
            </button>
          </div>
        </Section>

        <Section title="Additional Services">
          <div className="space-y-3">
            {form.selectedServices.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 px-4 py-5 text-center text-sm font-medium text-slate-400">
                No services added.
              </div>
            ) : (
              form.selectedServices.map((service) => (
                <div key={service.id} className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-slate-50/40 p-3 md:grid-cols-12">
                  <div className="md:col-span-5">
                    <SelectField
                      label="Service"
                      value={service.additionalServiceId}
                      options={serviceOptions}
                      onChange={(value) => onServiceChange(service.id, { additionalServiceId: value })}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <Field
                      label="Service Date"
                      type="date"
                      min={stayStart}
                      max={stayEnd}
                      value={service.serviceDate}
                      onChange={(value) => onServiceChange(service.id, { serviceDate: value })}
                    />
                  </div>
                  <div className="flex items-end justify-between gap-3 md:col-span-3">
                    <div className="pb-3 text-sm font-semibold text-slate-600">
                      Price: ${(service.price || getServicePrice(service.additionalServiceId)).toFixed(2)}
                    </div>
                    <button type="button" className="mb-1 text-rose-400 hover:text-rose-600" onClick={() => onRemoveService(service.id)} aria-label="Remove service">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
            <button
              type="button"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 text-sm font-bold text-[#0B4EA2] hover:bg-blue-50"
              onClick={onAddService}
            >
              <Plus className="h-4 w-4" />
              Add Service
            </button>
          </div>
        </Section>

        <Section title="Companions">
          <div className="space-y-3">
            {form.companions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 px-4 py-5 text-center text-sm font-medium text-slate-400">
                No companions added.
              </div>
            ) : (
              form.companions.map((companion, index) => (
                <div key={companion.id} className="rounded-lg border border-slate-200 bg-slate-50/40 p-3">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Companion {index + 1}</div>
                    <button type="button" className="text-rose-400 hover:text-rose-600" onClick={() => onRemoveCompanion(companion.id)} aria-label="Remove companion">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="First Name" value={companion.firstName} onChange={(value) => onCompanionChange(companion.id, { firstName: value })} />
                    <Field label="Last Name" value={companion.lastName} onChange={(value) => onCompanionChange(companion.id, { lastName: value })} />
                    <Field label="Phone" type="tel" value={companion.phoneNumber} onChange={(value) => onCompanionChange(companion.id, { phoneNumber: value })} />
                    <Field label="Email" type="email" value={companion.email} onChange={(value) => onCompanionChange(companion.id, { email: value })} />
                    <Field label="National ID" value={companion.nationalId} onChange={(value) => onCompanionChange(companion.id, { nationalId: value })} />
                    <Field label="Address" value={companion.address} onChange={(value) => onCompanionChange(companion.id, { address: value })} />
                  </div>
                </div>
              ))
            )}
            <button
              type="button"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 text-sm font-bold text-[#0B4EA2] hover:bg-blue-50"
              onClick={onAddCompanion}
            >
              <Plus className="h-4 w-4" />
              Add Companion
            </button>
          </div>
        </Section>
      </div>

      <div className="sticky bottom-0 mt-5 flex items-center justify-between border-t border-slate-200 bg-white py-4">
        <button type="button" className="h-12 min-w-[160px] rounded-lg border border-[#0B4EA2] px-8 text-sm font-semibold text-[#0B4EA2] hover:bg-blue-50" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="h-12 min-w-[180px] rounded-lg bg-[#0B4EA2] px-8 text-sm font-bold text-white hover:bg-[#093d81]" onClick={onSave}>
          Save
        </button>
      </div>
    </div>
  )
}

function AvailabilityTables({
  localAriState,
  roomsState,
  arrivalDate,
  departureDate,
}: {
  localAriState: LocalARIState
  roomsState: RoomsAvailabilityState
  arrivalDate: string
  departureDate: string
}) {
  const billableRates = localAriState.rates.filter((rate) => isBillableStayDate(rate.date, arrivalDate, departureDate))
  const rateTotal = sumBillableRates(localAriState.rates, arrivalDate, departureDate)
  const allZeroRates = billableRates.length > 0 && billableRates.every((rate) => rate.basePriceBeforeTax === 0 && rate.finalRateAfterTax === 0)
  const availabilityByType = roomsState.availability.reduce<Record<string, number>>((acc, room) => {
    acc[room.roomTypeName] = (acc[room.roomTypeName] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-5">
      {(localAriState.status === 'loading' || localAriState.rates.length > 0 || localAriState.status === 'succeeded') ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-slate-800">Nightly Rates</h4>
              {localAriState.status === 'loading' ? (
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600">Loading...</span>
              ) : null}
            </div>
            <div className="text-sm font-extrabold text-[#0B4EA2]">Total: {formatMoney(rateTotal)}</div>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            {allZeroRates || (localAriState.status === 'succeeded' && billableRates.length === 0) ? (
              <div className="px-5 py-8 text-center text-sm font-semibold text-amber-700">
                No billable rate data available for this room type and rate plan.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      {['Date', 'Day', 'Base Before Tax', 'Base After Tax', 'Final Rate', 'Guests'].map((heading) => (
                        <th key={heading} className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {billableRates.map((rate, index) => {
                      const dateObj = new Date(rate.date)
                      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                      return (
                        <tr key={`${rate.date}-${index}`} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3 text-sm font-semibold text-slate-700">{dateObj.toLocaleDateString('en-GB')}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{dayNames[dateObj.getDay()]}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-700">{formatMoney(rate.basePriceBeforeTax, rate.currency)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-700">{formatMoney(rate.basePriceAfterTax, rate.currency)}</td>
                          <td className="px-4 py-3 text-sm font-extrabold text-emerald-700">{formatMoney(rate.finalRateAfterTax, rate.currency)}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{rate.numberOfGuests}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {roomsState.availabilityStatus !== 'idle' ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-extrabold text-slate-800">Room Availability</h4>
            {roomsState.availabilityStatus === 'loading' ? (
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600">Loading...</span>
            ) : null}
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            {roomsState.availabilityStatus !== 'loading' && roomsState.availability.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm font-semibold text-amber-700">
                No rooms available for the selected dates and room type.
              </div>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Room Type</th>
                    <th className="px-4 py-3 text-right text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Available Rooms</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(availabilityByType).map(([roomType, count]) => (
                    <tr key={roomType} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 text-sm font-semibold text-slate-700">{roomType}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex h-7 min-w-8 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 px-2.5 text-xs font-extrabold text-emerald-700">
                          {count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function PaymentStep({
  groupInfo,
  totals,
  reservations,
  createdGroupResult,
  createdReservationIds,
  paymentWarning,
  payment,
  paymentSubmitting,
  paymentPosted,
  onPaymentChange,
  onSubmitPayment,
}: {
  groupInfo: GroupInfoDraft
  totals: { rooms: number; guests: number; amount: number }
  reservations: GroupReservationDraftItem[]
  createdGroupResult: CreateGroupReservationResponse | null
  createdReservationIds: string[]
  paymentWarning: string | null
  payment: GroupPaymentDraft
  paymentSubmitting: boolean
  paymentPosted: boolean
  onPaymentChange: (patch: Partial<GroupPaymentDraft>) => void
  onSubmitPayment: () => void
}) {
  const responseCurrency = getCreatedGroupCurrency(createdGroupResult, payment.currency || 'USD')
  const createdChildren = getCreatedGroupChildren(createdGroupResult)
  const discount = Math.max(0, Number(createdGroupResult?.groupDiscountPercentage ?? groupInfo.discountPercentage) || 0)
  const subtotal = Number(createdGroupResult?.totalBeforeDiscount ?? totals.amount) || 0
  const discountAmount = Number(createdGroupResult?.totalDiscountAmount ?? (subtotal * (discount / 100))) || 0
  const grandTotal = Math.max(0, Number(createdGroupResult?.totalAfterDiscount ?? (subtotal - discountAmount)) || 0)
  const remainingTotal = getCreatedGroupRemainingTotal(createdGroupResult) || grandTotal
  const canPay = createdReservationIds.length > 0

  return (
    <div className="grid w-full grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-[#0B4EA2]">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Group Payment</h3>
            <p className="text-sm text-slate-500">
              {canPay ? 'Post payment to the created reservations.' : 'Payment is available after reservation IDs are returned.'}
            </p>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          {createdGroupResult?.groupReference ? <SummaryRow label="Group Reference" value={createdGroupResult.groupReference} /> : null}
          {createdGroupResult?.status ? <SummaryRow label="Status" value={createdGroupResult.status} /> : null}
          <SummaryRow label="Group" value={groupInfo.groupName || '-'} />
          <SummaryRow label="Reservations" value={String(createdGroupResult?.childReservationCount ?? reservations.length)} />
          <SummaryRow label="Rooms Reserved" value={String(totals.rooms)} />
          <SummaryRow label="Guests" value={String(totals.guests)} />
          <SummaryRow label="Subtotal" value={formatMoney(subtotal, responseCurrency)} />
          <SummaryRow label={`Discount (${discount}%)`} value={`-${formatMoney(discountAmount, responseCurrency)}`} />
          <SummaryRow label="Remaining Balance" value={formatMoney(remainingTotal, responseCurrency)} />
          <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-50 px-5 py-4 text-lg font-extrabold text-[#0B4EA2]">
            <span>Grand Total</span>
            <span>{formatMoney(grandTotal, responseCurrency)}</span>
          </div>
          {paymentWarning ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              {paymentWarning}
            </div>
          ) : null}
          {createdChildren.length ? (
            <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
              <div className="bg-slate-50 px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                Child Reservations
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                  <thead className="bg-white text-xs font-bold uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Guest</th>
                      <th className="px-4 py-3">Room</th>
                      <th className="px-4 py-3 text-right">Original</th>
                      <th className="px-4 py-3 text-right">Discount</th>
                      <th className="px-4 py-3 text-right">Final</th>
                      <th className="px-4 py-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {createdChildren.map((child, index) => {
                      const childCurrency = child.currency || responseCurrency
                      return (
                        <tr key={child.reservationId || child.id || index}>
                          <td className="px-4 py-3 font-semibold text-slate-700">{child.guestName || '-'}</td>
                          <td className="px-4 py-3 text-slate-600">{child.roomTypeNames?.join(', ') || '-'}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-700">{formatMoney(child.originalTotal, childCurrency)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-rose-600">-{formatMoney(child.groupDiscountAmount, childCurrency)}</td>
                          <td className="px-4 py-3 text-right font-extrabold text-slate-900">{formatMoney(child.finalTotal, childCurrency)}</td>
                          <td className="px-4 py-3 text-right font-extrabold text-emerald-700">{formatMoney(child.remainingBalance, childCurrency)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="space-y-4">
          <Field
            label="Amount"
            type="number"
            value={payment.amount}
            placeholder={remainingTotal ? remainingTotal.toFixed(2) : String(grandTotal)}
            onChange={(value) => onPaymentChange({ amount: value })}
          />
          <SelectField
            label="Currency"
            value={payment.currency}
            onChange={(value) => onPaymentChange({ currency: value })}
            options={[
              { value: 'USD', label: 'USD' },
              { value: 'EUR', label: 'EUR' },
              { value: 'EGP', label: 'EGP' },
            ]}
          />
          <SelectField
            label="Payment Method"
            value={payment.paymentMethod}
            onChange={(value) => onPaymentChange({ paymentMethod: value as ReservationPaymentMethod, method: value as ReservationPaymentMethod })}
            options={[
              { value: 'Card', label: 'Card' },
              { value: 'Cash', label: 'Cash' },
              { value: 'Online', label: 'Online' },
            ]}
          />
          <SelectField
            label="Payment Type"
            value={payment.paymentType}
            onChange={(value) => onPaymentChange({ paymentType: value as ReservationPaymentType })}
            options={[
              { value: 'Deposit', label: 'Deposit' },
              { value: 'Payment', label: 'Payment' },
            ]}
          />
          <Field
            label="Payment Reference"
            value={payment.paymentReference}
            placeholder="Leave blank if not available"
            onChange={(value) => onPaymentChange({ paymentReference: value })}
          />
          <Field
            label="Payment Date"
            type="date"
            value={payment.paymentDate}
            onChange={(value) => onPaymentChange({ paymentDate: value })}
          />
          <button
            type="button"
            disabled={!canPay || paymentSubmitting || paymentPosted}
            className={[
              'inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg text-sm font-bold text-white transition-colors',
              canPay && !paymentSubmitting && !paymentPosted ? 'bg-[#0B4EA2] hover:bg-[#093d81]' : 'cursor-not-allowed bg-blue-300',
            ].join(' ')}
            onClick={onSubmitPayment}
          >
            {paymentSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {paymentSubmitting ? 'Posting payment...' : paymentPosted ? 'Payment Posted' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ConfirmationStep({
  groupInfo,
  totals,
  reservations,
  createdGroupResult,
  createdReservationIds,
  paymentWarning,
}: {
  groupInfo: GroupInfoDraft
  totals: { rooms: number; guests: number; amount: number }
  reservations: GroupReservationDraftItem[]
  createdGroupResult: CreateGroupReservationResponse | null
  createdReservationIds: string[]
  paymentWarning: string | null
}) {
  const responseCurrency = getCreatedGroupCurrency(createdGroupResult, 'USD')
  const discount = Math.max(0, Number(createdGroupResult?.groupDiscountPercentage ?? groupInfo.discountPercentage) || 0)
  const subtotal = Number(createdGroupResult?.totalBeforeDiscount ?? totals.amount) || 0
  const discountAmount = Number(createdGroupResult?.totalDiscountAmount ?? (subtotal * (discount / 100))) || 0
  const grandTotal = Math.max(0, Number(createdGroupResult?.totalAfterDiscount ?? (subtotal - discountAmount)) || 0)
  const remainingTotal = getCreatedGroupRemainingTotal(createdGroupResult) || grandTotal

  return (
    <div className="flex w-full flex-col items-center rounded-lg border border-slate-200 bg-white px-8 py-12 text-center">
      <div className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-11 w-11" />
      </div>
      <h3 className="text-2xl font-extrabold text-slate-900">
        {createdReservationIds.length ? 'Group Reservation Submitted' : 'Confirm Group Reservation'}
      </h3>
      <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
        {createdReservationIds.length
          ? `${groupInfo.groupName || 'This group'} was created. Continue to payment when ready.`
          : `${groupInfo.groupName || 'This group'} has ${reservations.length} reservations, ${totals.rooms} rooms, and ${totals.guests} guests ready to submit.`}
      </p>
      {paymentWarning ? (
        <div className="mt-6 w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm font-semibold text-amber-800">
          {paymentWarning}
        </div>
      ) : null}
      <div className="mt-8 grid w-full grid-cols-1 gap-3 text-left md:grid-cols-3">
        <Metric label="Reservations" value={String(reservations.length)} />
        <Metric label="Rooms" value={String(totals.rooms)} />
        <Metric label="Total" value={formatMoney(grandTotal, responseCurrency)} />
      </div>
      {createdGroupResult ? (
        <div className="mt-6 w-full text-left">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {createdGroupResult.groupReference ? <Metric label="Group Reference" value={createdGroupResult.groupReference} /> : null}
            <Metric label="Before Discount" value={formatMoney(subtotal, responseCurrency)} />
            <Metric label="Discount Amount" value={`-${formatMoney(discountAmount, responseCurrency)}`} />
            <Metric label="Remaining Balance" value={formatMoney(remainingTotal, responseCurrency)} />
          </div>
        </div>
      ) : null}
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
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-2 text-xl font-extrabold text-slate-900">{value}</div>
    </div>
  )
}
