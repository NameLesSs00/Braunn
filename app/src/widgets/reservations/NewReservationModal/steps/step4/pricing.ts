import type { ReservationDraft } from '../../../../../features/reservations/draftSlice'
import type { Pricing } from '../../../CheckInProcessModal/types'
import type { LocalARIState } from '../../../../../features/localAri/localAriSlice'

export function computePricing(value: ReservationDraft, nights: number, localAriState: LocalARIState): Pricing {
  const rate = localAriState?.rates[0]
  const baseRate = rate?.basePriceBeforeTax || 0
  const nightsSafe = Math.max(1, nights || 1)

  // Adults calculation
  const adultCount = value.adultCount || 0
  const baseGuests = rate?.numberOfGuests || 1
  let baseTotal = baseRate * nightsSafe // Base rate covers up to baseGuests
  let extraAdultTotal = 0
  
  if (adultCount > baseGuests) {
    const extraAdults = adultCount - baseGuests
    const extraAdultPrice = rate?.extraAdultPriceBeforeTax || 0
    extraAdultTotal = extraAdultPrice * extraAdults * nightsSafe
  }
  
  const adultTotal = baseTotal + extraAdultTotal

  // Children calculation
  let childTotal = 0
  if (value.childCount && value.childCount > 0) {
    const childAges = value.childAges || []
    const policies = rate?.childPolicies || []
    const fallbackChildrenPrice = rate?.childrenPriceBeforeTax || 0

    for (let i = 0; i < value.childCount; i++) {
      const age = childAges[i] || 0
      const policy = policies.find(p => age >= p.ageFrom && age <= p.ageTo)
      if (policy) {
        childTotal += (policy as any).amountBeforeTax * nightsSafe
      } else {
        childTotal += fallbackChildrenPrice * nightsSafe
      }
    }
  }

  // Extras calculation
  const extrasTotal = (value.extras || []).reduce((sum, extra) => {
    return sum + (extra.qty || 0) * (extra.price || 0)
  }, 0)

  // Meal plans calculation
  const mealPlansTotal = (value.mealPlans || []).reduce((sum, mp) => {
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
  const taxPercentage = rate?.taxPercentage || 0
  const taxesAmount = subtotal * (taxPercentage / 100)

  let discountValue = 0
  const totalAmount = Math.max(0, subtotal + taxesAmount - discountValue)
  const requiredDeposit = totalAmount * 0.25

  return {
    baseTotal,
    extraAdultTotal,
    adultTotal,
    childTotal,
    infantTotal: 0,
    extrasTotal,
    mealPlansTotal,
    subtotal,
    taxesAmount,
    discountValue,
    totalAmount,
    requiredDeposit,
  }
}
