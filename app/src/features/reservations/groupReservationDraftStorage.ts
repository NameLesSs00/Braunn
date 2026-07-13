import type { GroupPaymentDraft, GroupReservationDraftValue, GroupWizardStep } from '../../models/GroupReservation'

export type SavedGroupReservationDraft = {
  id: string
  draft: GroupReservationDraftValue
  step: GroupWizardStep
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = 'braun.unfinishedGroupReservationDrafts'

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `group-reservation-draft-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function readRawDrafts(): SavedGroupReservationDraft[] {
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

function writeDrafts(drafts: SavedGroupReservationDraft[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
}

function sanitizePayment(payment: GroupPaymentDraft): GroupPaymentDraft {
  return {
    ...payment,
    paymentReference: payment.paymentReference,
  }
}

function sanitizeDraftForStorage(draft: GroupReservationDraftValue): GroupReservationDraftValue {
  return {
    ...draft,
    payment: sanitizePayment(draft.payment),
  }
}

export function getSavedGroupReservationDrafts() {
  return readRawDrafts().sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getSavedGroupReservationDraft(id: string) {
  return readRawDrafts().find((item) => item.id === id) ?? null
}

export function saveGroupReservationDraft({
  id,
  draft,
  step,
}: {
  id?: string | null
  draft: GroupReservationDraftValue
  step: GroupWizardStep
}) {
  const drafts = readRawDrafts()
  const now = Date.now()
  const existing = id ? drafts.find((item) => item.id === id) : undefined
  const next: SavedGroupReservationDraft = {
    id: existing?.id ?? id ?? createId(),
    draft: sanitizeDraftForStorage(draft),
    step,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }

  writeDrafts([next, ...drafts.filter((item) => item.id !== next.id)])
  return next
}

export function removeSavedGroupReservationDraft(id: string) {
  writeDrafts(readRawDrafts().filter((item) => item.id !== id))
}

export function hasMeaningfulGroupReservationData(draft: GroupReservationDraftValue) {
  const info = draft.groupInfo
  const payment = draft.payment

  if (
    [
      info.groupName,
      info.contactPerson,
      info.email,
      info.phone,
      info.status && info.status !== 'Confirmed' ? info.status : '',
      info.arrivalDate && info.arrivalDate !== new Date().toISOString().split('T')[0] ? info.arrivalDate : '',
      info.departureDate,
      info.discountPercentage !== '0' ? info.discountPercentage : '',
      info.notes,
      payment.amount,
      payment.paymentReference,
    ].some((value) => String(value ?? '').trim())
  ) {
    return true
  }

  return draft.reservations.length > 0
}
