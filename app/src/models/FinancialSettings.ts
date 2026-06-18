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
  type: 'FixedAmount' | 'Percentage'
  isActive: boolean
}
