export type LaundryPurchaseStatus =
  | 'Pending'
  | 'Viewed'
  | 'Approved'
  | 'Rejected'
  | 'Ordered'
  | 'Completed'
  | 'Cancelled'

export type LaundryPurchasePriority = 'Low' | 'Normal' | 'Medium' | 'High'

export type LaundryPurchaseAction =
  | 'view'
  | 'approve'
  | 'order'
  | 'complete'
  | 'reject'
  | 'cancel'

export interface LaundryStatusActionOption {
  action: LaundryPurchaseAction
  label: string
  variant: 'primary' | 'success' | 'danger' | 'warning' | 'secondary'
}

export function getNextLaundryStatusForAction(action: LaundryPurchaseAction): LaundryPurchaseStatus {
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
    case 'cancel':
      return 'Cancelled'
  }
}

export function getAvailableLaundryPurchaseActions(
  status: LaundryPurchaseStatus | string
): LaundryStatusActionOption[] {
  switch (status) {
    case 'Pending':
      return [
        { action: 'view', label: 'View', variant: 'primary' },
        { action: 'reject', label: 'Reject', variant: 'danger' },
      ]
    case 'Viewed':
      return [
        { action: 'approve', label: 'Approve', variant: 'success' },
        { action: 'reject', label: 'Reject', variant: 'danger' },
      ]
    case 'Approved':
      return [
        { action: 'order', label: 'Order', variant: 'primary' },
        { action: 'cancel', label: 'Cancel', variant: 'danger' },
      ]
    case 'Ordered':
      return [
        { action: 'complete', label: 'Complete', variant: 'success' },
        { action: 'cancel', label: 'Cancel', variant: 'danger' },
      ]
    case 'Completed':
    case 'Rejected':
    case 'Cancelled':
    default:
      return []
  }
}

export interface LaundryPurchaseItemDto {
  id?: number
  itemId: number
  itemName?: string
  quantity: number
  priority: LaundryPurchasePriority
}

export interface LaundryPurchaseCreateItemPayload {
  itemId: number
  quantity: number
  priority: LaundryPurchasePriority
}

export interface LaundryPurchaseUpdateItemPayload {
  id?: number
  itemId: number
  quantity: number
  priority: LaundryPurchasePriority
}

// Backward compatibility alias
export type LaundryPurchaseItemCreatePayload = LaundryPurchaseCreateItemPayload

export interface LaundryPurchaseReadDto {
  id: number
  requiredDate: string
  status: LaundryPurchaseStatus | string
  items: LaundryPurchaseItemDto[]
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
  purchaseItems?: LaundryPurchaseItemDto[]
}

export interface LaundryPurchaseCreateDto {
  requiredDate: string
  items: LaundryPurchaseCreateItemPayload[]
}

export interface LaundryPurchaseUpdateDto {
  requiredDate: string
  items: LaundryPurchaseUpdateItemPayload[]
}

export interface LaundryPurchasesParams {
  PageNumber?: number
  PageSize?: number
  Status?: LaundryPurchaseStatus | string
  FromDate?: string
  ToDate?: string
}

export interface LaundryPurchasesListDto {
  pageNumber: number
  pageSize: number
  totalPages?: number
  totalCount: number
  hasPreviousPage?: boolean
  hasNextPage?: boolean
  items: LaundryPurchaseReadDto[]
}
