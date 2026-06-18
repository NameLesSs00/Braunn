import { useMemo } from 'react'

import type { ReservationDraft } from '../../../../features/reservations/draftSlice'

import { computePricing } from './step4/pricing'
import { Step4PaymentForm } from './step4/Step4PaymentForm'
import { Step4ReviewPage } from './step4/Step4ReviewPage'

type Props = {
  value: ReservationDraft
  onChange: (patch: Partial<ReservationDraft>) => void
  page: 1 | 2
  onOpenCheckIn: () => void
  onOpenExtendStay: () => void
}

export const NewReservationStep4: any = ({ value, onChange, page, onOpenCheckIn, onOpenExtendStay }: Props) => {
  const nights = useMemo(() => {
    const n = Number.parseInt(value.nights, 10)
    return Number.isFinite(n) && n > 0 ? n : 0
  }, [value.nights])

  const guestsTotal = value.adultCount + value.childCount + value.infantCount
  const pricing = useMemo(() => computePricing(value, nights), [value, nights])

  return page === 2 ? (
    <Step4ReviewPage
      value={value}
      onChange={onChange}
      guestsTotal={guestsTotal}
      pricing={pricing}
      onOpenCheckIn={onOpenCheckIn}
      onOpenExtendStay={onOpenExtendStay}
    />
  ) : (
    <Step4PaymentForm value={value} onChange={onChange} nights={nights} guestsTotal={guestsTotal} pricing={pricing} />
  )
}
