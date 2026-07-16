import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Building2, CheckCircle2, Loader2, Package2, RefreshCw, Trash2, X } from 'lucide-react'

import { Modal } from '../../../shared/ui/Modal'
import { appAlert } from '../../../shared/ui/AppAlert'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { fetchRoomTypes } from '../../../features/roomTypes/roomTypesSlice'
import { addNotification } from '../../../features/notifications/notificationsSlice'
import { getCorporateAccounts } from '../../../shared/apis/CorporateAccount'
import { getCorporateContractsByAccountId, getCorporateContractPackages } from '../../../shared/apis/CorporateContract'
import { createCorporateReservationV2 } from '../../../shared/apis/CorporateReservation'
import { getRoomsAvailability } from '../../../shared/apis/roomsApi'
import type { CorporateAccount, CorporateAccountContract } from '../../../models/CorporateAccount'
import type { CorporateContract, CorporateContractPackage, CorporatePackageRoomRate } from '../../../models/CorporateContract'
import type {
  CorporateReservationCompanion,
  CorporateReservationGuarantee,
  CorporateReservationGuest,
} from '../../../models/CorporateReservation'

type Step = 1 | 2 | 3 | 4 | 5 | 6
type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type AvailabilityRow = {
  key: string
  roomTypeId: string
  roomTypeName: string
  roomQuantity: number
  adults: number
  children: number
  childAges: number[]
  ratePlanCode: string
  pricePerNight: number
  availableRooms: number
}

const steps: Array<{ id: Step; label: string }> = [
  { id: 1, label: 'Account' },
  { id: 2, label: 'Dates' },
  { id: 3, label: 'Package' },
  { id: 4, label: 'Availability' },
  { id: 5, label: 'Details' },
  { id: 6, label: 'Confirm' },
]

type CorporateContractSummary = CorporateContract | CorporateAccountContract

type CorporateContractOption = CorporateAccountContract & {
  corporateAccountId: string
  companyName: string
  contactPerson?: string
  email?: string
  phone?: string
}

const emptyPackageRoomRates: CorporatePackageRoomRate[] = []

const todayDate = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const addDays = (date: string, days: number) => {
  const value = new Date(`${date}T00:00:00`)
  value.setDate(value.getDate() + days)
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const emptyGuest = (): CorporateReservationGuest => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  idType: '',
  idNumber: '',
  nationality: '',
  address: '',
  streetName: '',
  countryCode: '',
})

const emptyGuarantee = (): CorporateReservationGuarantee => ({
  guaranteeType: '',
  guaranteeCode: '',
  cardType: '',
  cardCode: '',
  cardHolderName: '',
  maskedCardNumber: '',
  tokenizedCardReference: '',
  expirationDate: '',
  seriesCodeMasked: '',
  notes: '',
})

const emptyCompanion = (): CorporateReservationCompanion => ({
  firstName: '',
  lastName: '',
  phoneNumber: '',
  email: '',
  address: '',
  nationalId: '',
})

function dateOnly(value?: string | null) {
  return (value || '').split('T')[0].split(' ')[0]
}

function normalizeStatus(value?: string | null) {
  return (value || '').replace(/[\s_-]/g, '').toLowerCase()
}

function isDateInRange(checkInDate: string, checkOutDate: string, startDate?: string | null, endDate?: string | null) {
  const start = dateOnly(startDate)
  const end = dateOnly(endDate)
  if (start && checkInDate < start) return false
  if (end && checkOutDate > end) return false
  return true
}

function isActiveContract(contract: CorporateContractSummary, checkInDate: string, checkOutDate: string) {
  const status = normalizeStatus((contract as CorporateContract).contractStatus ?? contract.status)
  return Boolean(contract.isActive) && status === 'active' && isDateInRange(checkInDate, checkOutDate, contract.startDate, contract.endDate)
}

function getActiveVersion(pkg: CorporateContractPackage, checkInDate: string, checkOutDate: string) {
  const candidates = [
    pkg.currentVersion,
    ...(pkg.versions ?? []),
  ].filter(Boolean)

  return candidates.find((version) => {
    if (!version) return false
    const status = normalizeStatus(version.status)
    return Boolean(version.isActive) && status === 'active' && isDateInRange(checkInDate, checkOutDate, version.effectiveFrom, version.effectiveTo)
  }) ?? null
}

function isActivePackage(pkg: CorporateContractPackage, checkInDate: string, checkOutDate: string) {
  return Boolean(pkg.isActive) && Boolean(getActiveVersion(pkg, checkInDate, checkOutDate))
}

function roomRateKey(rate: CorporatePackageRoomRate, index: number) {
  return `${rate.roomTypeId}:${rate.ratePlanCode}:${rate.adults}:${rate.children}:${index}`
}

function formatMoney(amount: number | undefined, currency: string | undefined) {
  return `${currency || ''} ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.trim()
}

function contractCurrency(contract: CorporateContractSummary | null | undefined) {
  return (contract as CorporateContract | null | undefined)?.currency
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  error,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  error?: string
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-slate-700">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={[
          'h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400',
          error ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-[#0B4EA2]',
        ].join(' ')}
      />
      {error ? <span className="mt-1 block text-[11px] font-semibold text-rose-600">{error}</span> : null}
    </label>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-slate-700">{label}</span>
      <textarea
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0B4EA2]"
      />
    </label>
  )
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
      <p className="text-sm font-bold text-slate-700">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{body}</p>
    </div>
  )
}

export function CorporateReservationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch()
  const roomTypesState = useAppSelector((state) => state.roomTypes)

  const [step, setStep] = useState<Step>(1)
  const [checkInDate, setCheckInDate] = useState(todayDate())
  const [checkOutDate, setCheckOutDate] = useState(addDays(todayDate(), 1))
  const [accounts, setAccounts] = useState<CorporateAccount[]>([])
  const [contracts, setContracts] = useState<CorporateContract[]>([])
  const [packages, setPackages] = useState<CorporateContractPackage[]>([])
  const [accountsStatus, setAccountsStatus] = useState<AsyncStatus>('idle')
  const [contractsStatus, setContractsStatus] = useState<AsyncStatus>('idle')
  const [packagesStatus, setPackagesStatus] = useState<AsyncStatus>('idle')
  const [availabilityStatus, setAvailabilityStatus] = useState<AsyncStatus>('idle')
  const [submitStatus, setSubmitStatus] = useState<AsyncStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [selectedContractId, setSelectedContractId] = useState('')
  const [selectedPackageId, setSelectedPackageId] = useState('')
  const [roomQuantities, setRoomQuantities] = useState<Record<string, number>>({})
  const [availabilityRows, setAvailabilityRows] = useState<AvailabilityRow[]>([])
  const [guest, setGuest] = useState<CorporateReservationGuest>(() => emptyGuest())
  const [guarantee, setGuarantee] = useState<CorporateReservationGuarantee>(() => emptyGuarantee())
  const [companions, setCompanions] = useState<CorporateReservationCompanion[]>([])
  const [specialRequests, setSpecialRequests] = useState('')
  const [comments, setComments] = useState('')
  const [externalReference, setExternalReference] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    if (roomTypesState.status === 'idle') {
      dispatch(fetchRoomTypes())
    }
  }, [dispatch, open, roomTypesState.status])

  useEffect(() => {
    if (!open) return

    const controller = new AbortController()
    setAccountsStatus('loading')
    setError(null)

    getCorporateAccounts(controller.signal)
      .then((data) => {
        setAccounts(data.filter((account) => account.isActive))
        setAccountsStatus('succeeded')
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setAccounts([])
        setAccountsStatus('failed')
        setError(err instanceof Error ? err.message : 'Could not load corporate accounts.')
      })

    return () => controller.abort()
  }, [open])

  useEffect(() => {
    setSelectedPackageId('')
    setContracts([])
    setPackages([])
    setContractsStatus('idle')
    setPackagesStatus('idle')
    setAvailabilityRows([])
    if (!open || !selectedAccountId) return

    const controller = new AbortController()
    setContractsStatus('loading')
    setError(null)

    getCorporateContractsByAccountId(selectedAccountId, controller.signal)
      .then((data) => {
        setContracts(data)
        setContractsStatus('succeeded')
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setContracts([])
        setContractsStatus('failed')
        setError(err instanceof Error ? err.message : 'Could not load account contracts.')
      })

    return () => controller.abort()
  }, [open, selectedAccountId])

  useEffect(() => {
    setSelectedPackageId('')
    setPackages([])
    setPackagesStatus('idle')
    setAvailabilityRows([])
    if (!open || !selectedContractId) return

    const controller = new AbortController()
    setPackagesStatus('loading')
    setError(null)

    getCorporateContractPackages(selectedContractId, { IsActive: true, EffectiveOn: checkInDate }, controller.signal)
      .then((data) => {
        setPackages(data)
        setPackagesStatus('succeeded')
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setPackages([])
        setPackagesStatus('failed')
        setError(err instanceof Error ? err.message : 'Could not load contract packages.')
      })

    return () => controller.abort()
  }, [checkInDate, open, selectedContractId])

  const contractOptions = useMemo<CorporateContractOption[]>(
    () => accounts.flatMap((account) => (account.contracts ?? []).map((contract) => ({
      ...contract,
      corporateAccountId: account.id,
      companyName: account.companyName,
      contactPerson: account.contactPerson,
      email: account.email,
      phone: account.phone,
    }))).filter((contract) => Boolean(contract.isActive) && normalizeStatus(contract.status) === 'active'),
    [accounts],
  )

  const selectedAccountContractOptions = useMemo(
    () => contractOptions.filter((contract) => contract.corporateAccountId === selectedAccountId),
    [contractOptions, selectedAccountId],
  )

  const activePackages = useMemo(
    () => packages.filter((pkg) => isActivePackage(pkg, checkInDate, checkOutDate)),
    [checkInDate, checkOutDate, packages],
  )

  const selectedAccount = useMemo(() => accounts.find((account) => account.id === selectedAccountId) ?? null, [accounts, selectedAccountId])
  const selectedContractOption = useMemo(() => contractOptions.find((contract) => contract.id === selectedContractId) ?? null, [contractOptions, selectedContractId])
  const selectedContract = useMemo(() => contracts.find((contract) => contract.id === selectedContractId) ?? selectedContractOption, [contracts, selectedContractId, selectedContractOption])
  const selectedPackage = useMemo(() => packages.find((pkg) => pkg.id === selectedPackageId) ?? null, [packages, selectedPackageId])
  const selectedVersion = useMemo(
    () => selectedPackage ? getActiveVersion(selectedPackage, checkInDate, checkOutDate) : null,
    [checkInDate, checkOutDate, selectedPackage],
  )
  const packageRoomRates = selectedVersion?.roomRates ?? emptyPackageRoomRates
  const packageMealPlanIds = useMemo(() => (selectedVersion?.mealRates ?? []).map((rate) => rate.mealPlanId).filter(Boolean), [selectedVersion])
  const packageServiceIds = useMemo(() => (selectedVersion?.serviceRates ?? []).map((rate) => rate.additionalServiceId).filter(Boolean), [selectedVersion])

  useEffect(() => {
    setRoomQuantities((prev) => {
      const next: Record<string, number> = {}
      packageRoomRates.forEach((rate, index) => {
        const key = roomRateKey(rate, index)
        next[key] = Math.max(0, prev[key] ?? 1)
      })
      return next
    })
  }, [packageRoomRates])

  const roomTypeNameById = useMemo(() => {
    const map = new Map<string, string>()
    roomTypesState.items.forEach((roomType) => map.set(roomType.id, roomType.name))
    return map
  }, [roomTypesState.items])

  const refreshAvailability = async () => {
    if (!selectedVersion || packageRoomRates.length === 0 || !checkInDate || !checkOutDate) return

    setAvailabilityStatus('loading')
    setError(null)

    try {
      const uniqueRoomTypeIds = Array.from(new Set(packageRoomRates.map((rate) => rate.roomTypeId).filter(Boolean)))
      const availabilityByRoomType = new Map<string, { count: number; name?: string }>()

      await Promise.all(uniqueRoomTypeIds.map(async (roomTypeId) => {
        const rooms = await getRoomsAvailability({
          StartDate: checkInDate,
          EndDate: checkOutDate,
          RoomTypeId: roomTypeId,
        })
        availabilityByRoomType.set(roomTypeId, {
          count: rooms.length,
          name: rooms[0]?.roomTypeName,
        })
      }))

      setAvailabilityRows(packageRoomRates.map((rate, index) => {
        const key = roomRateKey(rate, index)
        const availability = availabilityByRoomType.get(rate.roomTypeId)
        return {
          key,
          roomTypeId: rate.roomTypeId,
          roomTypeName: availability?.name || roomTypeNameById.get(rate.roomTypeId) || rate.roomTypeId,
          roomQuantity: Math.max(0, roomQuantities[key] ?? 1),
          adults: rate.adults,
          children: rate.children,
          childAges: rate.childAges ?? [],
          ratePlanCode: rate.ratePlanCode,
          pricePerNight: rate.pricePerNight,
          availableRooms: availability?.count ?? 0,
        }
      }))
      setAvailabilityStatus('succeeded')
    } catch (err) {
      setAvailabilityRows([])
      setAvailabilityStatus('failed')
      setError(err instanceof Error ? err.message : 'Could not check room availability.')
    }
  }

  useEffect(() => {
    setAvailabilityRows([])
    setAvailabilityStatus('idle')
  }, [checkInDate, checkOutDate, selectedPackageId])

  const unavailableRows = availabilityRows.filter((row) => row.availableRooms < row.roomQuantity)
  const selectedRoomQuantityTotal = availabilityRows.reduce((sum, row) => sum + Math.max(0, Number(row.roomQuantity) || 0), 0)
  const canContinueFromAvailability = availabilityStatus === 'succeeded' && availabilityRows.length > 0 && selectedRoomQuantityTotal > 0 && unavailableRows.length === 0

  const resetState = () => {
    setStep(1)
    setCheckInDate(todayDate())
    setCheckOutDate(addDays(todayDate(), 1))
    setSelectedAccountId('')
    setSelectedContractId('')
    setSelectedPackageId('')
    setContracts([])
    setPackages([])
    setContractsStatus('idle')
    setPackagesStatus('idle')
    setAvailabilityStatus('idle')
    setAvailabilityRows([])
    setRoomQuantities({})
    setGuest(emptyGuest())
    setGuarantee(emptyGuarantee())
    setCompanions([])
    setSpecialRequests('')
    setComments('')
    setExternalReference('')
    setValidationErrors({})
    setError(null)
    setSubmitStatus('idle')
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const validateDetails = () => {
    const errors: Record<string, string> = {}
    if (!guest.firstName.trim()) errors.firstName = 'First name is required.'
    if (!guest.lastName.trim()) errors.lastName = 'Last name is required.'
    if (!guest.email.trim()) errors.email = 'Email is required.'
    if (!guest.phone.trim()) errors.phone = 'Phone is required.'
    if (!guest.idType.trim()) errors.idType = 'ID type is required.'
    if (!guest.idNumber.trim()) errors.idNumber = 'ID number is required.'
    if (!guest.nationality.trim()) errors.nationality = 'Nationality is required.'
    if (!guest.address.trim()) errors.address = 'Address is required.'
    if (!guest.streetName.trim()) errors.streetName = 'Street name is required.'
    if (!guest.countryCode.trim()) errors.countryCode = 'Country code is required.'
    if (!guarantee.guaranteeType.trim()) errors.guaranteeType = 'Guarantee type is required.'
    if (!guarantee.guaranteeCode.trim()) errors.guaranteeCode = 'Guarantee code is required.'
    if (!guarantee.cardType.trim()) errors.cardType = 'Card type is required.'
    if (!guarantee.cardCode.trim()) errors.cardCode = 'Card code is required.'
    if (!guarantee.cardHolderName.trim()) errors.cardHolderName = 'Card holder name is required.'
    if (!guarantee.maskedCardNumber.trim()) errors.maskedCardNumber = 'Masked card number is required.'
    if (!guarantee.expirationDate.trim()) errors.expirationDate = 'Expiration date is required.'
    if (!guarantee.seriesCodeMasked.trim()) errors.seriesCodeMasked = 'Series code is required.'
    if (!externalReference.trim()) errors.externalReference = 'External reference is required.'
    if (packageRoomRates.length === 0) errors.roomRequests = 'The selected package has no room rates.'
    if (selectedRoomQuantityTotal <= 0) errors.roomRequests = 'Select at least one room before continuing.'
    return errors
  }

  const buildPayload = () => ({
    corporateAccountId: selectedAccountId,
    corporateContractId: selectedContractId,
    corporatePackageId: selectedPackageId,
    checkInDate,
    checkOutDate,
    guest: {
      firstName: guest.firstName.trim(),
      lastName: guest.lastName.trim(),
      email: guest.email.trim(),
      phone: guest.phone.trim(),
      idType: guest.idType.trim(),
      idNumber: guest.idNumber.trim(),
      nationality: guest.nationality.trim(),
      address: guest.address.trim(),
      streetName: guest.streetName.trim(),
      countryCode: guest.countryCode.trim(),
    },
    companions: companions
      .filter((companion) => companion.firstName.trim() || companion.lastName.trim())
      .map((companion) => ({
        firstName: companion.firstName.trim(),
        lastName: companion.lastName.trim(),
        phoneNumber: companion.phoneNumber.trim(),
        email: companion.email.trim(),
        address: companion.address.trim(),
        nationalId: companion.nationalId.trim(),
      })),
    guarantee: {
      guaranteeType: guarantee.guaranteeType.trim(),
      guaranteeCode: guarantee.guaranteeCode.trim(),
      cardType: guarantee.cardType.trim(),
      cardCode: guarantee.cardCode.trim(),
      cardHolderName: guarantee.cardHolderName.trim(),
      maskedCardNumber: guarantee.maskedCardNumber.trim(),
      tokenizedCardReference: guarantee.tokenizedCardReference.trim(),
      expirationDate: guarantee.expirationDate.trim(),
      seriesCodeMasked: guarantee.seriesCodeMasked.trim(),
      notes: guarantee.notes.trim(),
    },
    roomRequests: packageRoomRates
      .map((rate, index) => ({
        roomTypeId: rate.roomTypeId,
        roomQuantity: Math.max(0, roomQuantities[roomRateKey(rate, index)] ?? 1),
        adults: Math.max(1, Number(rate.adults) || 1),
        children: Math.max(0, Number(rate.children) || 0),
        childAges: rate.childAges ?? [],
        ratePlanCode: rate.ratePlanCode,
        mealPlanIds: packageMealPlanIds,
        serviceIds: packageServiceIds,
      }))
      .filter((request) => request.roomQuantity > 0),
    currency: selectedVersion?.currencyCode || contractCurrency(selectedContract) || 'USD',
    specialRequests: specialRequests.trim(),
    comments: comments.trim(),
    externalReference: externalReference.trim(),
  })

  const submit = async () => {
    if (submitStatus === 'loading') return
    const errors = validateDetails()
    setValidationErrors(errors)
    if (Object.keys(errors).length > 0) return
    if (!canContinueFromAvailability) {
      setStep(4)
      setError('Check package room availability before submitting.')
      return
    }

    setSubmitStatus('loading')
    setError(null)
    try {
      const result = await createCorporateReservationV2(buildPayload())
      const guestName = [guest.firstName, guest.lastName].map((part) => part.trim()).filter(Boolean).join(' ')
      dispatch(addNotification({
        type: 'corporate_reservation_created',
        bookingReference: result.bookingReference,
        guestName: guestName || 'Corporate guest',
        status: result.status,
        currency: result.currency,
        grandTotal: result.grandTotal,
      }))
      const successLines = [
        'The corporate reservation was sent and completed.',
        `Booking Reference: ${result.bookingReference}`,
        `Status: ${result.status}`,
        `Total: ${formatMoney(result.grandTotal, result.currency)}`,
        `Consumed Room Nights: ${result.consumedRoomNights}`,
        `Remaining Corporate Rooms: ${result.minimumRemainingCorporateRooms}`,
        ...(result.warnings?.length ? [`Warnings: ${result.warnings.join(', ')}`] : []),
      ]
      await appAlert.fire({
        icon: 'success',
        title: 'Reservation Sent',
        text: successLines.join('\n'),
        confirmButtonColor: '#0B4EA2',
        confirmButtonText: 'Done',
      })
      window.dispatchEvent(new CustomEvent('braun:reservations-refresh'))
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create corporate reservation.')
      appAlert.fire({
        icon: 'error',
        title: 'Reservation Failed',
        text: err instanceof Error ? err.message : 'Could not create corporate reservation.',
        confirmButtonColor: '#0B4EA2',
      })
    } finally {
      setSubmitStatus('idle')
    }
  }

  const next = () => {
    setError(null)
    if (step === 1) {
      if (!selectedAccountId) {
        setError('Select a corporate account.')
        return
      }
      setStep(2)
      return
    }
    if (step === 2) {
      if (!checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
        setError('Select a valid stay date range.')
        return
      }
      if (!selectedContractId || !selectedContract) {
        setError('Select one contract for this corporate account.')
        return
      }
      if (!isActiveContract(selectedContract, checkInDate, checkOutDate)) {
        setError('The selected contract is not valid for those stay dates.')
        return
      }
      setStep(3)
      return
    }
    if (step === 3) {
      if (!selectedPackageId || !selectedVersion || packageRoomRates.length === 0) {
        setError('Select an active date-valid package with room rates.')
        return
      }
      setStep(4)
      void refreshAvailability()
      return
    }
    if (step === 4) {
      if (!canContinueFromAvailability) {
        setError(selectedRoomQuantityTotal <= 0
          ? 'Select at least one room before continuing.'
          : 'Selected package rooms must have enough available rooms for those dates.')
        return
      }
      setStep(5)
      return
    }
    if (step === 5) {
      const errors = validateDetails()
      setValidationErrors(errors)
      if (Object.keys(errors).length > 0) return
      setStep(6)
      return
    }
    void submit()
  }

  const back = () => {
    setError(null)
    setStep((prev) => Math.max(1, prev - 1) as Step)
  }

  const title = steps.find((item) => item.id === step)?.label ?? 'Corporate'

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="flex h-[calc(100vh-2rem)] w-[94vw] max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between bg-[#0B4EA2] px-7 py-5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-blue-200">Corporate Reservation</div>
            <div className="mt-0.5 text-lg font-bold text-white">{title}</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={resetState}
              className="hidden rounded-full border border-white/30 px-4 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 md:block"
            >
              Reset
            </button>
            <button type="button" onClick={handleClose} className="grid h-10 w-10 place-items-center rounded-full text-white/90 hover:bg-white/10" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="shrink-0 border-b border-slate-100 bg-white px-8 py-5">
          <div className="mx-auto flex max-w-3xl items-center">
            {steps.map((item, index) => (
              <div key={item.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={[
                    'grid h-9 w-9 place-items-center rounded-full text-sm font-bold',
                    item.id < step ? 'bg-emerald-500 text-white' : item.id === step ? 'bg-[#0B4EA2] text-white' : 'bg-slate-100 text-slate-500',
                  ].join(' ')}>
                    {item.id < step ? <CheckCircle2 className="h-4 w-4" /> : item.id}
                  </div>
                  <span className={['hidden text-[10px] font-semibold md:block', item.id === step ? 'text-[#0B4EA2]' : 'text-slate-400'].join(' ')}>
                    {item.label}
                  </span>
                </div>
                {index < steps.length - 1 ? (
                  <div className={['mx-3 mb-4 h-[2px] w-full', item.id < step ? 'bg-emerald-400' : 'bg-slate-200'].join(' ')} />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {error ? (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-6">
              {accountsStatus === 'loading' ? (
                <EmptyState title="Loading accounts" body="Checking active corporate accounts..." />
              ) : accounts.length === 0 ? (
                <EmptyState title="No active corporate accounts" body="Create or activate a corporate account before booking." />
              ) : (
                <>
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Corporate Accounts <span className="text-rose-600">*</span></h3>
                        <p className="text-xs text-slate-500">Select one corporate account to continue.</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">{accounts.length} accounts</span>
                    </div>
                    <div className="max-h-[28vh] overflow-y-auto pr-2">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {accounts.map((account) => {
                          const isSelected = selectedAccountId === account.id
                          return (
                            <button
                              key={account.id}
                              type="button"
                              onClick={() => {
                                setSelectedAccountId(account.id)
                                setSelectedContractId('')
                                setSelectedPackageId('')
                                setContracts([])
                                setPackages([])
                                setAvailabilityRows([])
                              }}
                              className={[
                                'rounded-xl border p-4 text-left transition-colors',
                                isSelected ? 'border-[#0B4EA2] bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-200',
                              ].join(' ')}
                            >
                              <div className="flex items-start gap-3">
                                <div className={[
                                  'grid h-10 w-10 shrink-0 place-items-center rounded-lg',
                                  isSelected ? 'bg-[#0B4EA2] text-white' : 'bg-blue-50 text-[#0B4EA2]',
                                ].join(' ')}>
                                  <Building2 className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-slate-800">{account.companyName}</p>
                                  <p className="mt-1 truncate text-xs font-semibold text-slate-500">{account.contactPerson || 'No contact person'}</p>
                                  <p className="mt-1 truncate text-xs text-slate-400">{account.email || account.phone || 'No contact details'}</p>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
                                <span>{account.contracts?.length ?? 0} contracts</span>
                                <span className={isSelected ? 'text-[#0B4EA2]' : 'text-slate-400'}>{isSelected ? 'Selected' : 'Select'}</span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                </>
              )}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Check-in Date" type="date" required value={checkInDate} onChange={setCheckInDate} />
                <Field label="Check-out Date" type="date" required value={checkOutDate} onChange={setCheckOutDate} />
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-4">
                  <div><span className="block text-xs font-semibold text-slate-500">Account</span><b>{selectedAccount?.companyName || selectedContractOption?.companyName || '---'}</b></div>
                  <div><span className="block text-xs font-semibold text-slate-500">Contract</span><b>{selectedContract?.contractNumber || '---'}</b></div>
                  <div><span className="block text-xs font-semibold text-slate-500">Contract Dates</span><b>{dateOnly(selectedContract?.startDate)} to {dateOnly(selectedContract?.endDate)}</b></div>
                  <div><span className="block text-xs font-semibold text-slate-500">Status</span><b>{selectedContract?.status || '---'}</b></div>
                </div>
              </div>

              {contractsStatus === 'loading' && selectedAccountContractOptions.length === 0 ? (
                <EmptyState title="Loading contracts" body="Checking active contracts for this account..." />
              ) : selectedAccountContractOptions.length === 0 ? (
                <EmptyState title="No active contracts" body="This corporate account has no active contracts." />
              ) : (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Contracts <span className="text-rose-600">*</span></h3>
                    <p className="text-xs text-slate-500">Choose one contract for {selectedAccount?.companyName || 'this account'}.</p>
                  </div>
                  <div className="max-h-[34vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {selectedAccountContractOptions.map((contract) => (
                        <button
                          key={contract.id}
                          type="button"
                          onClick={() => {
                            setSelectedContractId(contract.id)
                            setSelectedPackageId('')
                            setPackages([])
                            setAvailabilityRows([])
                          }}
                          className={[
                            'rounded-xl border p-4 text-left transition-colors',
                            selectedContractId === contract.id ? 'border-[#0B4EA2] bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-200',
                          ].join(' ')}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-bold text-slate-800">{contract.contractNumber}</p>
                              <p className="mt-1 text-xs font-semibold text-slate-500">{contract.contractType}</p>
                            </div>
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                              {contract.status}
                            </span>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                            <span>Type: {contract.contractType}</span>
                            <span>Packages: {contract.packages?.length ?? 0}</span>
                            <span>Start: {dateOnly(contract.startDate)}</span>
                            <span>End: {dateOnly(contract.endDate)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedContract && !isActiveContract(selectedContract, checkInDate, checkOutDate) ? (
                <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                  The selected contract is active, but not valid for the selected stay dates.
                </div>
              ) : !selectedContract || !isActiveContract(selectedContract, checkInDate, checkOutDate) ? (
                null
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              {packagesStatus === 'loading' || packagesStatus === 'idle' ? (
                <EmptyState title="Loading packages" body="Checking active contract packages..." />
              ) : packagesStatus === 'failed' ? (
                <EmptyState title="Could not load packages" body="Try selecting the contract again or refresh the page." />
              ) : activePackages.length === 0 ? (
                <EmptyState title="No active date-valid packages" body="The selected contract has no active package for the selected stay dates." />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {activePackages.map((pkg) => {
                    const version = getActiveVersion(pkg, checkInDate, checkOutDate)
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={[
                          'rounded-xl border p-4 text-left transition-colors',
                          selectedPackageId === pkg.id ? 'border-[#0B4EA2] bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-200',
                        ].join(' ')}
                      >
                        <div className="flex items-start gap-3">
                          <Package2 className="mt-0.5 h-5 w-5 text-[#0B4EA2]" />
                          <div>
                            <p className="text-sm font-bold text-slate-800">{pkg.name} ({pkg.code})</p>
                            <p className="mt-1 text-xs text-slate-500">{pkg.description || 'Package terms and rates from the selected contract.'}</p>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                          <span>Currency: {version?.currencyCode || contractCurrency(selectedContract) || '---'}</span>
                          <span>Room rates: {version?.roomRates?.length ?? 0}</span>
                          <span>Meal plans: {version?.mealRates?.length ?? 0}</span>
                          <span>Services: {version?.serviceRates?.length ?? 0}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-[15px] font-bold text-slate-800">Package Room Availability</h3>
                  <p className="text-xs text-slate-500">Only the selected package room rates are shown.</p>
                </div>
                <button
                  type="button"
                  onClick={() => void refreshAvailability()}
                  disabled={availabilityStatus === 'loading'}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#0B4EA2] px-4 text-sm font-semibold text-[#0B4EA2] hover:bg-blue-50 disabled:opacity-60"
                >
                  {availabilityStatus === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Refresh
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {availabilityStatus === 'loading' ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-sm font-semibold text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking rooms...
                  </div>
                ) : availabilityRows.length === 0 ? (
                  <EmptyState title="No availability loaded" body="Refresh availability to continue." />
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-bold">Room Type</th>
                        <th className="px-4 py-3 font-bold">Rate Plan</th>
                        <th className="px-4 py-3 font-bold text-right">Rooms</th>
                        <th className="px-4 py-3 font-bold text-right">Adults</th>
                        <th className="px-4 py-3 font-bold text-right">Children</th>
                        <th className="px-4 py-3 font-bold text-right">Package Rate</th>
                        <th className="px-4 py-3 font-bold text-right">Free Rooms</th>
                        <th className="px-4 py-3 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {availabilityRows.map((row) => {
                        const enough = row.availableRooms >= row.roomQuantity
                        const notSelected = row.roomQuantity === 0
                        return (
                          <tr key={row.key}>
                            <td className="px-4 py-3 text-sm font-semibold text-slate-700">{row.roomTypeName}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{row.ratePlanCode}</td>
                            <td className="px-4 py-3 text-right">
                              <input
                                type="number"
                                min={0}
                                value={row.roomQuantity}
                                onChange={(event) => {
                                  const nextValue = Math.max(0, Number(event.target.value) || 0)
                                  setRoomQuantities((prev) => ({ ...prev, [row.key]: nextValue }))
                                  setAvailabilityRows((prev) => prev.map((item) => item.key === row.key ? { ...item, roomQuantity: nextValue } : item))
                                }}
                                className="h-9 w-20 rounded-lg border border-slate-200 px-2 text-right text-sm outline-none focus:border-[#0B4EA2]"
                              />
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-slate-600">{row.adults}</td>
                            <td className="px-4 py-3 text-right text-sm text-slate-600">{row.children}</td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{formatMoney(row.pricePerNight, selectedVersion?.currencyCode)}</td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-slate-700">{row.availableRooms}</td>
                            <td className="px-4 py-3">
                              <span className={[
                                'rounded-full border px-2.5 py-1 text-xs font-semibold',
                                notSelected ? 'border-slate-200 bg-slate-50 text-slate-500' : enough ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700',
                              ].join(' ')}>
                                {notSelected ? 'Not selected' : enough ? 'Available' : 'Not enough'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-4">
                  <div><span className="block text-xs font-semibold text-slate-500">Account</span><b>{selectedAccount?.companyName || '---'}</b></div>
                  <div><span className="block text-xs font-semibold text-slate-500">Contract</span><b>{selectedContract?.contractNumber || '---'}</b></div>
                  <div><span className="block text-xs font-semibold text-slate-500">Package</span><b>{selectedPackage?.name || '---'}</b></div>
                  <div><span className="block text-xs font-semibold text-slate-500">Currency</span><b>{selectedVersion?.currencyCode || contractCurrency(selectedContract) || '---'}</b></div>
                </div>
              </div>

              {validationErrors.roomRequests ? (
                <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{validationErrors.roomRequests}</div>
              ) : null}

              <section className="space-y-3">
                <h3 className="text-[15px] font-bold text-slate-800">Guest</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Field label="First Name" required value={guest.firstName} error={validationErrors.firstName} onChange={(value) => setGuest((prev) => ({ ...prev, firstName: value }))} />
                  <Field label="Last Name" required value={guest.lastName} error={validationErrors.lastName} onChange={(value) => setGuest((prev) => ({ ...prev, lastName: value }))} />
                  <Field label="Email" required value={guest.email} error={validationErrors.email} onChange={(value) => setGuest((prev) => ({ ...prev, email: value }))} />
                  <Field label="Phone" required value={guest.phone} error={validationErrors.phone} onChange={(value) => setGuest((prev) => ({ ...prev, phone: value }))} />
                  <Field label="ID Type" required value={guest.idType} error={validationErrors.idType} onChange={(value) => setGuest((prev) => ({ ...prev, idType: value }))} />
                  <Field label="ID Number" required value={guest.idNumber} error={validationErrors.idNumber} onChange={(value) => setGuest((prev) => ({ ...prev, idNumber: value }))} />
                  <Field label="Nationality" required value={guest.nationality} error={validationErrors.nationality} onChange={(value) => setGuest((prev) => ({ ...prev, nationality: value }))} />
                  <Field label="Address" required value={guest.address} error={validationErrors.address} onChange={(value) => setGuest((prev) => ({ ...prev, address: value }))} />
                  <Field label="Street Name" required value={guest.streetName} error={validationErrors.streetName} onChange={(value) => setGuest((prev) => ({ ...prev, streetName: value }))} />
                  <Field label="Country Code" required value={guest.countryCode} error={validationErrors.countryCode} onChange={(value) => setGuest((prev) => ({ ...prev, countryCode: value }))} />
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-bold text-slate-800">Companions</h3>
                  <button
                    type="button"
                    onClick={() => setCompanions((prev) => [...prev, emptyCompanion()])}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Add Companion
                  </button>
                </div>
                {companions.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-500">No companions added.</div>
                ) : companions.map((companion, index) => (
                  <div key={index} className="rounded-xl border border-slate-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700">Companion {index + 1}</span>
                      <button type="button" onClick={() => setCompanions((prev) => prev.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50" aria-label="Remove companion">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <Field label="First Name" value={companion.firstName} onChange={(value) => setCompanions((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, firstName: value } : item))} />
                      <Field label="Last Name" value={companion.lastName} onChange={(value) => setCompanions((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, lastName: value } : item))} />
                      <Field label="Phone" value={companion.phoneNumber} onChange={(value) => setCompanions((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, phoneNumber: value } : item))} />
                      <Field label="Email" value={companion.email} onChange={(value) => setCompanions((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, email: value } : item))} />
                      <Field label="Address" value={companion.address} onChange={(value) => setCompanions((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, address: value } : item))} />
                      <Field label="National ID" value={companion.nationalId} onChange={(value) => setCompanions((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, nationalId: value } : item))} />
                    </div>
                  </div>
                ))}
              </section>

              <section className="space-y-3">
                <h3 className="text-[15px] font-bold text-slate-800">Guarantee</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Field label="Guarantee Type" required value={guarantee.guaranteeType} error={validationErrors.guaranteeType} onChange={(value) => setGuarantee((prev) => ({ ...prev, guaranteeType: value }))} />
                  <Field label="Guarantee Code" required value={guarantee.guaranteeCode} error={validationErrors.guaranteeCode} onChange={(value) => setGuarantee((prev) => ({ ...prev, guaranteeCode: value }))} />
                  <Field label="Card Type" required value={guarantee.cardType} error={validationErrors.cardType} onChange={(value) => setGuarantee((prev) => ({ ...prev, cardType: value }))} />
                  <Field label="Card Code" required value={guarantee.cardCode} error={validationErrors.cardCode} onChange={(value) => setGuarantee((prev) => ({ ...prev, cardCode: value }))} />
                  <Field label="Card Holder Name" required value={guarantee.cardHolderName} error={validationErrors.cardHolderName} onChange={(value) => setGuarantee((prev) => ({ ...prev, cardHolderName: value }))} />
                  <Field label="Masked Card Number" required value={guarantee.maskedCardNumber} error={validationErrors.maskedCardNumber} onChange={(value) => setGuarantee((prev) => ({ ...prev, maskedCardNumber: value }))} />
                  <Field label="Tokenized Card Reference" value={guarantee.tokenizedCardReference} onChange={(value) => setGuarantee((prev) => ({ ...prev, tokenizedCardReference: value }))} />
                  <Field label="Expiration Date" required value={guarantee.expirationDate} error={validationErrors.expirationDate} onChange={(value) => setGuarantee((prev) => ({ ...prev, expirationDate: value }))} />
                  <Field label="Series Code Masked" required value={guarantee.seriesCodeMasked} error={validationErrors.seriesCodeMasked} onChange={(value) => setGuarantee((prev) => ({ ...prev, seriesCodeMasked: value }))} />
                </div>
                <TextAreaField label="Guarantee Notes" value={guarantee.notes} onChange={(value) => setGuarantee((prev) => ({ ...prev, notes: value }))} />
              </section>

              <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <TextAreaField label="Special Requests" value={specialRequests} onChange={setSpecialRequests} />
                <TextAreaField label="Comments" value={comments} onChange={setComments} />
                <Field label="External Reference" required value={externalReference} error={validationErrors.externalReference} onChange={setExternalReference} />
              </section>
            </div>
          ) : null}

          {step === 6 ? (() => {
            const payload = buildPayload()
            return (
              <div className="space-y-6">
                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                  <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-4">
                    <div><span className="block text-xs font-semibold text-slate-500">Account</span><b>{selectedAccount?.companyName || payload.corporateAccountId}</b></div>
                    <div><span className="block text-xs font-semibold text-slate-500">Contract</span><b>{selectedContract?.contractNumber || payload.corporateContractId}</b></div>
                    <div><span className="block text-xs font-semibold text-slate-500">Package</span><b>{selectedPackage?.name || payload.corporatePackageId}</b></div>
                    <div><span className="block text-xs font-semibold text-slate-500">Stay</span><b>{payload.checkInDate} to {payload.checkOutDate}</b></div>
                  </div>
                </div>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h3 className="text-sm font-bold text-slate-800">Guest</h3>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <div><span className="font-semibold text-slate-500">Name:</span> {payload.guest.firstName} {payload.guest.lastName}</div>
                      <div><span className="font-semibold text-slate-500">Email:</span> {payload.guest.email}</div>
                      <div><span className="font-semibold text-slate-500">Phone:</span> {payload.guest.phone}</div>
                      <div><span className="font-semibold text-slate-500">ID:</span> {payload.guest.idType} {payload.guest.idNumber}</div>
                      <div><span className="font-semibold text-slate-500">Nationality:</span> {payload.guest.nationality}</div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h3 className="text-sm font-bold text-slate-800">Guarantee</h3>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <div><span className="font-semibold text-slate-500">Type:</span> {payload.guarantee.guaranteeType}</div>
                      <div><span className="font-semibold text-slate-500">Code:</span> {payload.guarantee.guaranteeCode}</div>
                      <div><span className="font-semibold text-slate-500">Card:</span> {payload.guarantee.cardType} {payload.guarantee.cardCode}</div>
                      <div><span className="font-semibold text-slate-500">Holder:</span> {payload.guarantee.cardHolderName}</div>
                      <div><span className="font-semibold text-slate-500">Masked:</span> {payload.guarantee.maskedCardNumber}</div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h3 className="text-sm font-bold text-slate-800">Reservation</h3>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <div><span className="font-semibold text-slate-500">Currency:</span> {payload.currency}</div>
                      <div><span className="font-semibold text-slate-500">Companions:</span> {payload.companions.length}</div>
                      <div><span className="font-semibold text-slate-500">Special Requests:</span> {payload.specialRequests || '---'}</div>
                      <div><span className="font-semibold text-slate-500">Comments:</span> {payload.comments || '---'}</div>
                      <div><span className="font-semibold text-slate-500">External Reference:</span> {payload.externalReference || '---'}</div>
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-[15px] font-bold text-slate-800">Package Room Requests</h3>
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                        <tr>
                          <th className="px-4 py-3 font-bold">Room Type</th>
                          <th className="px-4 py-3 font-bold text-right">Rooms</th>
                          <th className="px-4 py-3 font-bold text-right">Adults</th>
                          <th className="px-4 py-3 font-bold text-right">Children</th>
                          <th className="px-4 py-3 font-bold">Rate Plan</th>
                          <th className="px-4 py-3 font-bold text-right">Meal Plans</th>
                          <th className="px-4 py-3 font-bold text-right">Services</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payload.roomRequests.map((room, index) => (
                          <tr key={`${room.roomTypeId}-${room.ratePlanCode}-${index}`}>
                            <td className="px-4 py-3 text-sm font-semibold text-slate-700">{roomTypeNameById.get(room.roomTypeId) || room.roomTypeId}</td>
                            <td className="px-4 py-3 text-right text-sm text-slate-600">{room.roomQuantity}</td>
                            <td className="px-4 py-3 text-right text-sm text-slate-600">{room.adults}</td>
                            <td className="px-4 py-3 text-right text-sm text-slate-600">{room.children}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{room.ratePlanCode}</td>
                            <td className="px-4 py-3 text-right text-sm text-slate-600">{room.mealPlanIds?.length ?? 0}</td>
                            <td className="px-4 py-3 text-right text-sm text-slate-600">{room.serviceIds?.length ?? 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

              </div>
            )
          })() : null}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-200 bg-white px-8 py-5">
          <button
            type="button"
            disabled={step === 1 || submitStatus === 'loading'}
            onClick={back}
            className={[
              'h-11 rounded-xl border px-8 text-sm font-semibold transition-colors',
              step === 1 ? 'cursor-not-allowed border-slate-200 text-slate-300' : 'border-[#0B4EA2] text-[#0B4EA2] hover:bg-blue-50',
            ].join(' ')}
          >
            Back
          </button>
          <div className="text-xs font-semibold text-slate-400">Step {step} of {steps.length}</div>
          <button
            type="button"
            disabled={submitStatus === 'loading'}
            onClick={next}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0B4EA2] px-8 text-sm font-semibold text-white hover:bg-[#093d82] disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {submitStatus === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {step === 6 ? 'Confirm Reservation' : 'Next'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
