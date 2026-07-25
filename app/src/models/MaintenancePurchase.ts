export type PurchaseStatus = 
  | 'Pending' 
  | 'Viewed' 
  | 'Approved' 
  | 'Rejected' 
  | 'Ordered' 
  | 'Completed' 
  | 'Cancelled'

export type PurchaseStatusAction = 'view' | 'approve' | 'order' | 'complete' | 'reject' | 'cancel'

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
    case 'cancel': return 'Cancelled'
  }
}

export function getAvailablePurchaseActions(status: PurchaseStatus): StatusActionOption[] {
  switch (status) {
    case 'Pending':
      return [
        { action: 'view', label: 'View', variant: 'primary' },
        { action: 'reject', label: 'Reject', variant: 'danger' },
        { action: 'cancel', label: 'Cancel', variant: 'secondary' },
      ]
    case 'Viewed':
      return [
        { action: 'approve', label: 'Approve', variant: 'success' },
        { action: 'cancel', label: 'Cancel', variant: 'secondary' },
      ]
    case 'Approved':
      return [
        { action: 'order', label: 'Order', variant: 'primary' },
        { action: 'cancel', label: 'Cancel', variant: 'secondary' },
      ]
    case 'Ordered':
      return [
        { action: 'complete', label: 'Complete', variant: 'success' },
        { action: 'cancel', label: 'Cancel', variant: 'secondary' },
      ]
    case 'Rejected':
      return [
        { action: 'cancel', label: 'Cancel', variant: 'secondary' },
      ]
    case 'Completed':
    case 'Cancelled':
    default:
      return []
  }
}

export type MaintenancePurchase = {
  id: number
  itemId: number
  itemName: string
  quantity: number
  status: PurchaseStatus
  createdAt: string
  createdBy?: string
  modifiedAt?: string
  modifiedBy?: string
}

export type CreateMaintenancePurchaseRequest = {
  itemId: number
  quantity: number
}

export type UpdateMaintenancePurchaseRequest = {
  itemId: number
  quantity: number
}