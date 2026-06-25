export interface FinancialService {
  id: string
  name: string
  price: number
  isActive: boolean
}

export interface FinancialDiscount {
  id: string
  name: string
  value: number
  isActive: boolean
}

export interface CreateDiscountPayload {
  name: string
  /** Must be between 1 and 100 */
  value: number
}

export interface UpdateDiscountPayload {
  name: string
  /** Must be between 1 and 100 */
  value: number
}
