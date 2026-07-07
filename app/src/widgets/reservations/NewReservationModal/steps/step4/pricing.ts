import type { ReservationDraft } from '../../../../../features/reservations/draftSlice'
import type { Pricing } from '../../../CheckInProcessModal/types'
import type { LocalARIState } from '../../../../../features/localAri/localAriSlice'

export function computePricing(value: ReservationDraft, nights: number, localAriState: LocalARIState): Pricing {
  const rates = localAriState?.rates || []
  const firstRate = rates[0]
  const taxPercentage = firstRate?.taxPercentage || 0

  const rateSubtotalBeforeTax = rates.reduce((sum, rate) => {
    return sum + (rate.amountBeforeTax ?? rate.basePriceBeforeTax ?? 0)
  }, 0)
  const rateTotalAfterTax = rates.reduce((sum, rate) => {
    const beforeTax = rate.amountBeforeTax ?? rate.basePriceBeforeTax ?? 0
    const afterTax = rate.amountAfterTax ?? rate.finalRateAfterTax ?? beforeTax * (1 + (rate.taxPercentage || 0) / 100)
    return sum + afterTax
  }, 0)

  const fallbackNights = Math.max(1, nights || 1)
  const fallbackBaseTotal = rates.length === 0 ? (firstRate?.basePriceBeforeTax || 0) * fallbackNights : 0
  const baseTotal = rates.length > 0 ? rateSubtotalBeforeTax : fallbackBaseTotal
  const adultTotal = baseTotal
  const extraAdultTotal = 0
  const childTotal = 0

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
  const rateTaxesAmount = Math.max(0, rateTotalAfterTax - rateSubtotalBeforeTax)
  const addOnsTaxesAmount = (extrasTotal + mealPlansTotal) * (taxPercentage / 100)
  const taxesAmount = rateTaxesAmount + addOnsTaxesAmount

  let discountValue = 0
  const totalAmount = Math.max(0, subtotal + taxesAmount - discountValue)
  const requiredDeposit = totalAmount * 0.25

  return {
    currency: firstRate?.currency || '$',
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
