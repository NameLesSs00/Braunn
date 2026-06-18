import type { ReservationDraft } from '../../../../../features/reservations/draftSlice'

import { parseNumberOrZero } from '../../../CheckInProcessModal/utils'
import type { Pricing } from '../../../CheckInProcessModal/types'

export function computePricing(value: ReservationDraft, nights: number): Pricing {
  const firstRoom = value.rooms[0]
  const roomType = firstRoom?.roomType || 'single'

  const rates: Record<string, { adult: number; child: number; infant: number }> = {
    single: { adult: 100, child: 50, infant: 25 },
    double: { adult: 150, child: 75, infant: 35 },
    suit: { adult: 250, child: 120, infant: 60 },
    doublex: { adult: 350, child: 170, infant: 80 },
  }

  const currentRates = rates[roomType] || rates.single

  const adultRate = currentRates.adult
  const childRate = currentRates.child
  const infantRate = currentRates.infant

  const nightsSafe = Math.max(1, nights || 1)

  const adultTotal = value.adultCount * adultRate * nightsSafe
  const childTotal = value.childCount * childRate * nightsSafe
  const infantTotal = value.infantCount * infantRate * nightsSafe

  const subtotal = adultTotal + childTotal + infantTotal

  let discountValue = 0
  if (value.discountType === 'percentage') {
    const pct = Math.max(0, Math.min(100, parseNumberOrZero(value.discountPercentage)))
    discountValue = (subtotal * pct) / 100
  } else if (value.discountType === 'fixed') {
    discountValue = Math.max(0, parseNumberOrZero(value.discountFixed))
  }

  const totalAmount = Math.max(0, subtotal - discountValue)
  const requiredDeposit = totalAmount * 0.25

  return {
    adultTotal,
    childTotal,
    infantTotal,
    subtotal,
    discountValue,
    totalAmount,
    requiredDeposit,
  }
}
