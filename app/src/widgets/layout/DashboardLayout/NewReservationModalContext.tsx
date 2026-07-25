import type { SavedReservationStep, SavedReservationStep4Page } from '../../../features/reservations/reservationDraftStorage'
import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'

export type OpenNewReservationOptions = {
  draftId?: string | null
  step?: SavedReservationStep
  step4Page?: SavedReservationStep4Page
  skipReset?: boolean
}

type NewReservationModalContextValue = {
  openNewReservation: (options?: OpenNewReservationOptions) => void
}

const NewReservationModalContext = createContext<NewReservationModalContextValue | null>(null)

export function NewReservationModalProvider({ value, children }: { value: NewReservationModalContextValue; children: ReactNode }) {
  return <NewReservationModalContext.Provider value={value}>{children}</NewReservationModalContext.Provider>
}

export function useNewReservationModal() {
  const ctx = useContext(NewReservationModalContext)
  if (!ctx) {
    throw new Error('useNewReservationModal must be used within NewReservationModalProvider')
  }
  return ctx
}
