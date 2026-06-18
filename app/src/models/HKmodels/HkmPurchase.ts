export interface HkmPurchaseItemDto {
  id?: number
  itemId: number
  itemName?: string
  purchaseId?: number
  quantity: number
}

export interface HkmPurchaseReadDto {
  id: number
  supplierName: string
  date?: string
  notes?: string
  status?: string
  createdAt: string
  createdBy: string
  purchaseItems: HkmPurchaseItemDto[]
}

export interface HkmPurchaseCreateDto {
  supplierName: string
  date?: string
  notes?: string
  purchaseItems: HkmPurchaseItemDto[]
}

export interface HkmPurchaseUpdateDto {
  supplierName: string
  date?: string
  notes?: string
  purchaseItems: HkmPurchaseItemDto[]
}

export interface HkmPurchasesListDto {
  items: HkmPurchaseReadDto[]
  totalCount: number
}

export interface HkmPurchasesParams {
  PageNumber?: number
  PageSize?: number
  SupplierName?: string
}
