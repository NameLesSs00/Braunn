import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'

type NewReservationModalContextValue = {
  openNewReservation: () => void
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
