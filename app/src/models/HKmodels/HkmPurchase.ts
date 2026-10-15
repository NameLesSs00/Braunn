export type HkmPurchaseStatus =
  | 'Pending'
  | 'Viewed'
  | 'Approved'
  | 'Rejected'
  | 'Ordered'
  | 'Completed'
  | 'Cancelled'

export type HkmPurchasePriority = 'Low' | 'Normal' | 'High'

export type HkmPurchaseStatusAction = 'view' | 'approve' | 'order' | 'complete' | 'reject'

export interface HkmStatusActionOption {
  action: HkmPurchaseStatusAction
  label: string
  variant: 'primary' | 'success' | 'danger' | 'warning' | 'secondary'
}

export function getNextHkmStatusForAction(action: HkmPurchaseStatusAction): HkmPurchaseStatus {
  switch (action) {
    case 'view':
      return 'Viewed'
    case 'approve':
      return 'Approved'
    case 'order':
      return 'Ordered'
    case 'complete':
      return 'Completed'
    case 'reject':
      return 'Rejected'
  }
}

export function getAvailableHkmPurchaseActions(
  status: HkmPurchaseStatus | string
): HkmStatusActionOption[] {
  switch (status) {
    case 'Pending':
      return [
        { action: 'view', label: 'View', variant: 'primary' },
        { action: 'reject', label: 'Reject', variant: 'danger' },
      ]
    case 'Viewed':
      return [{ action: 'approve', label: 'Approve', variant: 'success' }]
    case 'Approved':
      return [{ action: 'order', label: 'Order', variant: 'primary' }]
    case 'Ordered':
      return [{ action: 'complete', label: 'Complete', variant: 'success' }]
    case 'Completed':
    case 'Rejected':
    case 'Cancelled':
    default:
      return []
  }
}

export interface HkmPurchaseItem {
  id?: number
  itemId: number
  itemName?: string
  quantity: number
  priority?: HkmPurchasePriority
}

export interface HkmPurchaseReadDto {
  id: number
  requiredDate: string
  status: HkmPurchaseStatus | string
  items: HkmPurchaseItem[]
  createdBy?: string
  createdByName?: string
  createdAt: string
  updatedBy?: string
  updatedByName?: string
  updatedAt?: string
  modifiedBy?: string
  modifiedByName?: string
  modifiedAt?: string
  // Compatibility fallbacks
  notes?: string
  supplierName?: string
  purchaseItems?: HkmPurchaseItem[]
}

export interface HkmPurchaseCreateItemDto {
  itemId: number
  quantity: number
  priority: HkmPurchasePriority
}

export interface HkmPurchaseCreateDto {
  requiredDate: string
  items: HkmPurchaseCreateItemDto[]
  // Optional backward compatibility
  supplierName?: string
  notes?: string
  purchaseItems?: HkmPurchaseCreateItemDto[]
  date?: string
}

export interface HkmPurchaseUpdateItemDto {
  id?: number
  itemId: number
  quantity: number
  priority: HkmPurchasePriority
}

export interface HkmPurchaseUpdateDto {
  requiredDate: string
  items: HkmPurchaseUpdateItemDto[]
  supplierName?: string
  notes?: string
  purchaseItems?: HkmPurchaseUpdateItemDto[]
}

export interface HkmPurchasesParams {
  PageNumber?: number
  PageSize?: number
  Status?: HkmPurchaseStatus | string
  FromDate?: string
  ToDate?: string
  SupplierName?: string
}

export interface HkmPurchasesListDto {
  items: HkmPurchaseReadDto[]
  totalCount: number
  pageNumber?: number
  pageSize?: number
  totalPages?: number
  hasPreviousPage?: boolean
  hasNextPage?: boolean
}
