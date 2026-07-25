export type MaintenanceIssue = {
  id: number
  itemId: string
  itemName: string
  roomId: string
  roomName: string
  quantity: number
  reason: string
  notes: string
  createdAt: string
  createdBy: string
  modifiedAt?: string
  modifiedBy?: string
}

export type CreateMaintenanceIssueRequest = {
  itemId: string
  roomId: string
  quantity: number
  reason: string
  notes: string
}

export type UpdateMaintenanceIssueRequest = {
  roomId: string
  quantity: number
  reason: string
  notes: string
}
