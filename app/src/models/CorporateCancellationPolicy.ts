export interface CorporateCancellationPolicy {
  id: number
  name: string
  code: string
  isActive: boolean
  appliesToContractType: 'Allotment' | 'Commitment'
  effectiveFrom: string
  effectiveTo: string | null
  liquidatedDamagesPenaltyPercentage: number
  createdAtUtc: string
  updatedAtUtc: string
  createdByUserId: string
}

export interface CreateCorporateCancellationPolicyDto {
  name: string
  code: string
  isActive: boolean
  appliesToContractType: 'Allotment' | 'Commitment'
  effectiveFrom: string
  effectiveTo: string | null
  liquidatedDamagesPenaltyPercentage: number
}

export interface UpdateCorporateCancellationPolicyDto {
  name: string
  code: string
  isActive: boolean
  appliesToContractType: 'Allotment' | 'Commitment'
  effectiveFrom: string
  effectiveTo: string | null
  liquidatedDamagesPenaltyPercentage: number
}
