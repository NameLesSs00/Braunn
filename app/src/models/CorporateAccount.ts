// ---------------------------------------------------------------------------
// Lightweight package summary embedded inside a contract (from list endpoint)
// ---------------------------------------------------------------------------
export type CorporateAccountContractPackage = {
  id: string
  code: string
  name: string
  isActive: boolean
  versionCount: number
}

// ---------------------------------------------------------------------------
// Contract summary embedded inside an account (from list / get-by-id endpoints)
// ---------------------------------------------------------------------------
export type CorporateAccountContract = {
  id: string
  contractNumber: string
  contractType: string        // 'Commitment' | 'Allotment'
  status: string              // 'Active' | 'Draft' | 'Suspended' | 'Expired' | ...
  startDate: string           // datetime string
  endDate: string             // datetime string
  isActive: boolean
  inventoryGenerated: boolean
  allocatedRoomNights: number
  consumedRoomNights: number
  remainingRoomNights: number
  packages: CorporateAccountContractPackage[]
}

// ---------------------------------------------------------------------------
// Main corporate account — matches CorporateAccountDto from the backend
// ---------------------------------------------------------------------------
export type CorporateAccount = {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  address: string
  isActive: boolean
  createdAt: string           // datetime string
  contracts: CorporateAccountContract[]
}

// ---------------------------------------------------------------------------
// Request bodies
// ---------------------------------------------------------------------------
export type CreateCorporateAccountRequest = {
  companyName: string
  contactPerson: string
  email: string
  phone: string
  address: string
  isActive: boolean
}

export type UpdateCorporateAccountRequest = CreateCorporateAccountRequest
