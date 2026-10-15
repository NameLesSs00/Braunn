export type PurchaseStatus = 
  | 'Pending' 
  | 'Viewed' 
  | 'Approved' 
  | 'Rejected' 
  | 'Ordered' 
  | 'Completed'
export type PurchasePriority = 'Low' | 'Normal' | 'High'

export type PurchaseStatusAction = 'view' | 'approve' | 'order' | 'complete' | 'reject'

export interface StatusActionOption {
  action: PurchaseStatusAction
  label: string
  variant: 'primary' | 'success' | 'danger' | 'warning' | 'secondary'
}

export function getNextStatusForAction(action: PurchaseStatusAction): PurchaseStatus {
  switch (action) {
    case 'view': return 'Viewed'
    case 'approve': return 'Approved'
    case 'order': return 'Ordered'
    case 'complete': return 'Completed'
    case 'reject': return 'Rejected'
  }
}

export function getAvailablePurchaseActions(status: PurchaseStatus): StatusActionOption[] {
  switch (status) {
    case 'Pending':
      return [
        { action: 'view', label: 'View', variant: 'primary' },
        { action: 'reject', label: 'Reject', variant: 'danger' },
      ]
    case 'Viewed':
      return [
        { action: 'approve', label: 'Approve', variant: 'success' },
      ]
    case 'Approved':
      return [
        { action: 'order', label: 'Order', variant: 'primary' },
      ]
    case 'Ordered':
      return [
        { action: 'complete', label: 'Complete', variant: 'success' },
      ]
    case 'Completed':
    case 'Rejected':
    default:
      return []
  }
}

export interface MaintenancePurchaseItem {
  id?: number
  itemId: number
  itemName?: string
  quantity: number
  priority: PurchasePriority
}

export interface CreateMaintenancePurchaseItemPayload {
  itemId: number
  quantity: number
  priority: PurchasePriority
}

export interface MaintenancePurchaseSummary {
  id: number
  requiredDate: string
  reason: string
  status: PurchaseStatus
  itemCount: number
  createdAt: string
  createdBy?: string
  createdByName?: string
}

export interface MaintenancePurchaseDetail {
  id: number
  requiredDate: string
  reason: string
  status: PurchaseStatus
  items: MaintenancePurchaseItem[]
  createdAt: string
  createdBy?: string
  createdByName?: string
  modifiedAt?: string
  modifiedBy?: string
  modifiedByName?: string
}

// Backward compatibility alias for list views
export type MaintenancePurchase = MaintenancePurchaseSummary

export interface CreateMaintenancePurchaseRequest {
  requiredDate: string
  reason: string
  items: CreateMaintenancePurchaseItemPayload[]
}

export interface UpdateMaintenancePurchaseRequest {
  requiredDate: string
  reason: string
  items: CreateMaintenancePurchaseItemPayload[]
}