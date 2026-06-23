import type { ReservationDraft } from '../../../../../features/reservations/draftSlice'
import type { Pricing } from '../../../CheckInProcessModal/types'
import type { LocalARIState } from '../../../../../features/localAri/localAriSlice'

export function computePricing(value: ReservationDraft, nights: number, localAriState: LocalARIState): Pricing {
  const baseRate = localAriState?.rates[0]?.amountBeforeTax || 0
  const nightsSafe = Math.max(1, nights || 1)

  // In the updated UI, adult and child use the same baseRate per night
  const adultTotal = (value.adultCount || 0) * baseRate * nightsSafe
  const childTotal = (value.childCount || 0) * baseRate * nightsSafe

  // Extras calculation
  const extrasTotal = (value.extras || []).reduce((sum, extra) => {
    return sum + (extra.qty || 0) * (extra.price || 0)
  }, 0)

  // Meal plans calculation
  const mealPlansTotal = (value.mealPlans || []).reduce((sum, mp) => {
    // Basic day diff logic, defaulting to 1 day if not set
    let days = 1
    if (mp.serviceDateStart && mp.serviceDateEnd) {
      const start = new Date(mp.serviceDateStart).getTime()
      const end = new Date(mp.serviceDateEnd).getTime()
      if (!isNaN(start) && !isNaN(end)) {
         days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
      }
    }
    return sum + (mp.price || 0) * days
  }, 0)

  const subtotal = adultTotal + childTotal + extrasTotal + mealPlansTotal

  let discountValue = 0
  // Handle discount if applicable (from the old draft fields if they still exist, else default to 0)
  // Assuming they don't exist, this will just be 0
  
  const totalAmount = Math.max(0, subtotal - discountValue)
  const requiredDeposit = totalAmount * 0.25

  return {
    adultTotal,
    childTotal,
    infantTotal: 0,
    subtotal,
    discountValue,
    totalAmount,
    requiredDeposit,
  }
}
