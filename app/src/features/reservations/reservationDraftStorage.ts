import type { ReservationDraft } from './draftSlice'

export type SavedReservationStep = 1 | 2 | 3 | 4
export type SavedReservationStep4Page = 1 | 2

export type SavedReservationDraft = {
  id: string
  draft: ReservationDraft
  step: SavedReservationStep
  step4Page: SavedReservationStep4Page
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = 'braun.unfinishedReservationDrafts'

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `reservation-draft-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function sanitizeDraftForStorage(draft: ReservationDraft): ReservationDraft {
  return {
    ...draft,
    cardNo: '',
    cardSeriesCode: '',
  }
}

function readRawDrafts(): SavedReservationDraft[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeDrafts(drafts: SavedReservationDraft[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
}

export function getSavedReservationDrafts() {
  return readRawDrafts().sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getSavedReservationDraft(id: string) {
  return readRawDrafts().find((item) => item.id === id) ?? null
}

export function saveReservationDraft({
  id,
  draft,
  step,
  step4Page,
}: {
  id?: string | null
  draft: ReservationDraft
  step: SavedReservationStep
  step4Page: SavedReservationStep4Page
}) {
  const drafts = readRawDrafts()
  const now = Date.now()
  const existing = id ? drafts.find((item) => item.id === id) : undefined
  const next: SavedReservationDraft = {
    id: existing?.id ?? id ?? createId(),
    draft: sanitizeDraftForStorage(draft),
    step,
    step4Page,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }

  writeDrafts([next, ...drafts.filter((item) => item.id !== next.id)])
  return next
}

export function removeSavedReservationDraft(id: string) {
  writeDrafts(readRawDrafts().filter((item) => item.id !== id))
}

export function hasMeaningfulReservationData(draft: ReservationDraft) {
  const textFields: Array<keyof ReservationDraft> = [
    'bookingSource',
    'firstName',
    'surName',
    'language',
    'email',
    'phone',
    'nationality',
    'idNumber',
    'creatorID',
    'addressLine',
    'countryCode',
    'notes',
    'checkInDate',
    'checkOutDate',
    'nights',
    'rateCode',
    'ratePlan',
    'specialRequests',
    'depositAmountReceived',
    'paymentMethod',
    'paidAmount',
    'paymentReference',
    'paymentDate',
    'coupon',
    'guaranteeCode',
    'guaranteeType',
    'cardCode',
    'cardHolderName',
    'cardNo',
    'cardType',
    'cardExpire',
    'cardSeriesCode',
  ]

  if (textFields.some((field) => String(draft[field] ?? '').trim())) return true
  if (draft.adultCount !== 1 || draft.childCount !== 0 || draft.isVip || draft.currency !== 'USD') return true
  if (draft.childAges.length > 0) return true
  if (draft.rooms.some((room) => room.roomTypeId || room.roomType || room.roomNumber || room.roomView || room.roomCount !== 1)) return true
  if (draft.mealPlans.length > 0 || draft.extras.length > 0 || draft.otherPayments.length > 0 || draft.companions.length > 0) return true

  return false
}
