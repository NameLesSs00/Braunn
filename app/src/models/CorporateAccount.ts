export type CorporateAccount = {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  address: string
  contractStartDate: string
  contractEndDate: string
  negotiatedRate: number
  discountPercentage: number
  creditLimit: number
  paymentTerms: string
  billingMethod: string
  cancellationPolicy: string
  isActive: boolean
  createdAt: string
  departureDate?: string
  depositRequired?: number
  discountAmount?: number
  blockedRooms?: number
}

export type CreateCorporateAccountRequest = Omit<CorporateAccount, 'id' | 'createdAt'>

export type UpdateCorporateAccountRequest = CreateCorporateAccountRequest


