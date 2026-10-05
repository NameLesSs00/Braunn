export interface Owner {
  id: string
  fullName: string
  email: string
  phone: string
  identificationNumber: string
  address: string | null
  iban: string | null
  isActive: boolean
  activeRoomsCount: number
  activeContractsCount: number
  createdAt: string
  updatedAt: string | null
}

export type CreateOwnerRequest = Omit<Owner, 'id' | 'activeRoomsCount' | 'activeContractsCount' | 'createdAt' | 'updatedAt'>

export type UpdateOwnerRequest = CreateOwnerRequest
